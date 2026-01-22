/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class ExteriorFloorComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.floorId = "lfg_ff:grass_path"
this.grassId = "lfg_ff:exterior_floor"
this.MaxPaintedBlocksOnce = 2500
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction') ?? "north";
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 9 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation.withState("lfg_ff:variant", newVariant))
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, direction, newVariant)
}
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const variant = brokenBlockPermutation.getState('lfg_ff:variant');
if (brokenBlockPermutation.matches(this.grassId)) return;
system.runTimeout(() => {
this.updateAllfloor(block, direction)
}, 1)
}
weightedRandomIndex(weights) {
const entries = Object.entries(weights);
const total = entries.reduce((sum, [, w]) => sum + w, 0);
const r = Math.random() * total;
let acc = 0;
for (const [key, weight] of entries) {
acc += weight;
if (r < acc) {
return parseInt(key, 10);
}
}
return 1;
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction') ?? "north";
const placementVar = this.getPlacementVariant(block, direction)
if (permutationToPlace.matches(this.grassId)) {
const weights = {
1: 50,
2: 25,
3: 15,
4: 10
};
const randomIndex = this.weightedRandomIndex(weights);
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:random", randomIndex)
} else {
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block);
e.permutationToPlace = e.permutationToPlace
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction)
system.runTimeout(() => {
this.updateAllfloor(block, direction)
}, 1)
}
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar)
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "front", "back", "up", "down"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, false))
.filter(Boolean)
.filter(b => (b.typeId == this.floorId || b.typeId == this.grassId));
const variantCount = {};
for (const adjacentBlock of adjacentBlocks) {
const variant = this.getVariant(adjacentBlock);
if (variant !== undefined) {
variantCount[variant] = (variantCount[variant] || 0) + 1;
}
}
let placementVar = 1;
let maxCount = 0;
for (const [variant, count] of Object.entries(variantCount)) {
if (count > maxCount) {
maxCount = count;
placementVar = parseInt(variant, 10);
}
}
return placementVar;
}
getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
getVerticalPosition(block) {
return block.permutation.getState("minecraft:vertical_half")
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getNeighborBlock(block, direction, side, filterfloor) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterfloor)
return neighborBlock.typeId == this.floorId ? neighborBlock : null;
else
return neighborBlock
}
getBlockInDirection(block, direction) {
switch (direction) {
case 'north':
return block.north();
case 'south':
return block.south();
case 'east':
return block.east();
case 'west':
return block.west();
}
}
getLeftDirection(direction) {
switch (direction) {
case 'north':
return 'west';
case 'south':
return 'east';
case 'east':
return 'north';
case 'west':
return 'south';
}
}
getRightDirection(direction) {
switch (direction) {
case 'north':
return 'east';
case 'south':
return 'west';
case 'east':
return 'south';
case 'west':
return 'north';
}
}
getDirectionFromBlocks(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
const dx = loc2.x - loc1.x;
const dy = loc2.y - loc1.y;
const dz = loc2.z - loc1.z;
if (Math.abs(dx) > Math.abs(dz)) {
return dx > 0 ? 'east' : 'west';
} else if (Math.abs(dz) > Math.abs(dx)) {
return dz > 0 ? 'south' : 'north';
}
return null;
}
getOppositeDirection(direction) {
switch (direction) {
case 'north':
return 'south';
case 'south':
return 'north';
case 'east':
return 'west';
case 'west':
return 'east';
case 'up':
return 'down';
case 'down':
return 'up';
default:
return null;
}
}
getInvertedDirection(direction) {
switch (direction) {
case 'north':
return 'east';
case 'south':
return 'west';
case 'east':
return 'south';
case 'west':
return 'north';
}
}
areSameLocation(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z;
}
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", false);
const rightBlock = this.getNeighborBlock(block, direction, "right", false);
const frontBlock = this.getNeighborBlock(block, direction, "front", false);
const backBlock = this.getNeighborBlock(block, direction, "back", false);
const upBlok = block.above()
const downBlok = block.below()
const diagUpLeftBlock = this.getNeighborBlock(block.above(), direction, "left", false);
const diagDownLeftBlock = this.getNeighborBlock(block.below(), direction, "left", false);
const diagUpRightBlock = this.getNeighborBlock(block.above(), direction, "right", false);
const diagDownRightBlock = this.getNeighborBlock(block.below(), direction, "right", false);
const diagUpFrontBlock = this.getNeighborBlock(block.above(), direction, "front", false);
const diagDownFrontBlock = this.getNeighborBlock(block.below(), direction, "front", false);
const diagUpBackBlock = this.getNeighborBlock(block.above(), direction, "back", false);
const diagDownBackBlock = this.getNeighborBlock(block.below(), direction, "back", false);
const allfloors = [];
if (frontBlock && (frontBlock.typeId == this.floorId || frontBlock.typeId == this.grassId)) allfloors.push(frontBlock)
if (backBlock && (backBlock.typeId == this.floorId || backBlock.typeId == this.grassId)) allfloors.push(backBlock)
if (rightBlock && (rightBlock.typeId == this.floorId || rightBlock.typeId == this.grassId)) allfloors.push(rightBlock)
if (leftBlock && (leftBlock.typeId == this.floorId || leftBlock.typeId == this.grassId)) allfloors.push(leftBlock)
if (downBlok && (downBlok.typeId == this.floorId || downBlok.typeId == this.grassId)) allfloors.push(downBlok)
if (upBlok && (upBlok.typeId == this.floorId || upBlok.typeId == this.grassId)) allfloors.push(upBlok)
if (diagDownLeftBlock && (diagDownLeftBlock.typeId == this.floorId || diagDownLeftBlock.typeId == this.grassId)) allfloors.push(diagDownLeftBlock)
if (diagDownRightBlock && (diagDownRightBlock.typeId == this.floorId || diagDownRightBlock.typeId == this.grassId)) allfloors.push(diagDownRightBlock)
if (diagUpLeftBlock && (diagUpLeftBlock.typeId == this.floorId || diagUpLeftBlock.typeId == this.grassId)) allfloors.push(diagUpLeftBlock)
if (diagUpRightBlock && (diagUpRightBlock.typeId == this.floorId || diagUpRightBlock.typeId == this.grassId)) allfloors.push(diagUpRightBlock)
if (diagDownBackBlock && (diagDownBackBlock.typeId == this.floorId || diagDownBackBlock.typeId == this.grassId)) allfloors.push(diagDownBackBlock)
if (diagDownFrontBlock && (diagDownFrontBlock.typeId == this.floorId || diagDownFrontBlock.typeId == this.grassId)) allfloors.push(diagDownFrontBlock)
if (diagUpBackBlock && (diagUpBackBlock.typeId == this.floorId || diagUpBackBlock.typeId == this.grassId)) allfloors.push(diagUpBackBlock)
if (diagUpFrontBlock && (diagUpFrontBlock.typeId == this.floorId || diagUpFrontBlock.typeId == this.grassId)) allfloors.push(diagUpFrontBlock)
for (const expendedfloor of allfloors) {
const expendedVariant = this.getVariant(expendedfloor);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedfloor) ?? "north";
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedfloor.setPermutation(expendedfloor.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedfloor, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllfloor(block, direction, updatedfloorBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedfloorBlocks.has(blockLocationKey)) {
return;
}
updatedfloorBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const diagUpLeftBlock = this.getNeighborBlock(block.above(), direction, "left", true);
const diagDownLeftBlock = this.getNeighborBlock(block.below(), direction, "left", true);
const diagUpRightBlock = this.getNeighborBlock(block.above(), direction, "right", true);
const diagDownRightBlock = this.getNeighborBlock(block.below(), direction, "right", true);
const diagUpFrontBlock = this.getNeighborBlock(block.above(), direction, "front", true);
const diagDownFrontBlock = this.getNeighborBlock(block.below(), direction, "front", true);
const diagUpBackBlock = this.getNeighborBlock(block.above(), direction, "back", true);
const diagDownBackBlock = this.getNeighborBlock(block.below(), direction, "back", true);
const allfloors = [];
if (frontBlock) allfloors.push(frontBlock)
if (backBlock) allfloors.push(backBlock)
if (rightBlock) allfloors.push(rightBlock)
if (leftBlock) allfloors.push(leftBlock)
if (diagDownLeftBlock) allfloors.push(diagDownLeftBlock)
if (diagDownRightBlock) allfloors.push(diagDownRightBlock)
if (diagUpLeftBlock) allfloors.push(diagUpLeftBlock)
if (diagUpRightBlock) allfloors.push(diagUpRightBlock)
if (diagDownBackBlock) allfloors.push(diagDownBackBlock)
if (diagDownFrontBlock) allfloors.push(diagDownFrontBlock)
if (diagUpBackBlock) allfloors.push(diagUpBackBlock)
if (diagUpFrontBlock) allfloors.push(diagUpFrontBlock)
for (const expendedfloor of allfloors) {
const expDir = this.getDirection(expendedfloor);
const expendedleftBlock = this.getNeighborBlock(expendedfloor, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedfloor, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedfloor, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedfloor, expDir, "back", true);
const expendeddiagUpLeftBlock = this.getNeighborBlock(block.above(), expDir, "left", true);
const expendeddiagDownLeftBlock = this.getNeighborBlock(block.below(), expDir, "left", true);
const expendeddiagUpRightBlock = this.getNeighborBlock(block.above(), expDir, "right", true);
const expendeddiagDownRightBlock = this.getNeighborBlock(block.below(), expDir, "right", true);
const expendeddiagUpFrontBlock = this.getNeighborBlock(block.above(), expDir, "front", true);
const expendeddiagDownFrontBlock = this.getNeighborBlock(block.below(), expDir, "front", true);
const expendeddiagUpBackBlock = this.getNeighborBlock(block.above(), expDir, "back", true);
const expendeddiagDownBackBlock = this.getNeighborBlock(block.below(), expDir, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(
expendedleftBlock,
expendedrightBlock,
expendedfrontBlock,
expendedbackBlock,
expDir,
expendedfloor);
if (this.getModule(expendedfloor) !== expNewModuleAndDir.module) {
expendedfloor.setPermutation(expendedfloor.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
}
system.runTimeout(() => {
try {
if (updatedfloorBlocks.size <= 8)
this.updateAllfloor(expendedfloor, expNewModuleAndDir.direction, updatedfloorBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block) {
if (!frontBlock) frontBlock = this.getDiagonalNeighborBlock(block, direction, "front");
if (!backBlock) backBlock = this.getDiagonalNeighborBlock(block, direction, "back");
if (!rightBlock) rightBlock = this.getDiagonalNeighborBlock(block, direction, "right");
if (!leftBlock) leftBlock = this.getDiagonalNeighborBlock(block, direction, "left");
const floors = [leftBlock, rightBlock, frontBlock, backBlock].filter(b => b);
if (floors.length === 0) return { module: "normal", direction: direction };
if (floors.length === 4) {
return { module: "center", direction: direction };
} else if (rightBlock && leftBlock && (frontBlock || backBlock)) {
const dir = frontBlock ? this.getDirectionFromBlocks(block, frontBlock) : this.getDirectionFromBlocks(block, backBlock);
return { module: "edge_1", direction: this.getOppositeDirection(dir) };
} else if (frontBlock && backBlock && (rightBlock || leftBlock)) {
const dir = rightBlock ? this.getDirectionFromBlocks(block, rightBlock) : this.getDirectionFromBlocks(block, leftBlock);
return { module: "edge_1", direction: this.getOppositeDirection(dir) };
} else if (rightBlock && leftBlock) {
let dir = this.getDirectionFromBlocks(rightBlock, leftBlock);
return { module: "edge_2", direction: this.getInvertedDirection(dir) };
} else if (frontBlock && backBlock) {
let dir = this.getDirectionFromBlocks(backBlock, frontBlock);
return { module: "edge_2", direction: this.getInvertedDirection(dir) };
} else if ((frontBlock || backBlock) && (rightBlock || leftBlock)) {
if (frontBlock) {
let dir = this.getDirectionFromBlocks(block, frontBlock)
if (rightBlock)
return { module: "corner_1", direction: this.getOppositeDirection(dir) }
else
return { module: "corner_1", direction: this.getInvertedDirection(dir) }
} else {
let dir = this.getDirectionFromBlocks(block, backBlock)
if (rightBlock)
return { module: "corner_1", direction: this.getInvertedDirection(dir) }
else
return { module: "corner_1", direction: this.getOppositeDirection(dir) }
}
} else {
let dir = this.getDirectionFromBlocks(floors[0], block);
return { module: "corner_2", direction: dir };
}
}
getWeirdDirection(direction) {
switch (direction) {
case 'north':
return 'east';
case 'south':
return 'west';
case 'east':
return 'south';
case 'west':
return 'north';
}
}
getDiagonalNeighborBlock(block, direction, side) {
let diagonalUpper = null;
let diagonalLower = null;
const aboveBlock = block.above();
const belowBlock = block.below();
if (side === "left") {
diagonalUpper = this.getBlockInDirection(aboveBlock, this.getLeftDirection(direction));
diagonalLower = this.getBlockInDirection(belowBlock, this.getLeftDirection(direction));
} else if (side === "right") {
diagonalUpper = this.getBlockInDirection(aboveBlock, this.getRightDirection(direction));
diagonalLower = this.getBlockInDirection(belowBlock, this.getRightDirection(direction));
} else if (side === "front") {
diagonalUpper = this.getBlockInDirection(aboveBlock, direction);
diagonalLower = this.getBlockInDirection(belowBlock, direction);
} else if (side === "back") {
diagonalUpper = this.getBlockInDirection(aboveBlock, this.getOppositeDirection(direction));
diagonalLower = this.getBlockInDirection(belowBlock, this.getOppositeDirection(direction));
}
if (diagonalUpper?.typeId === this.floorId) return diagonalUpper;
if (diagonalLower?.typeId === this.floorId) return diagonalLower;
return null;
}
}