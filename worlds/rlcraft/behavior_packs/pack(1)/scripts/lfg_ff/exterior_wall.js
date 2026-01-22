/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class ExteriorWallComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.wallId = "lfg_ff:exterior_wall"
this.MaxPaintedBlocksOnce = 2500
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem)
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 14 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", true));
system.runTimeout(() => {
try {
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", false));
} catch (e) {
}
}, 1)
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, direction, newVariant)
}
return;
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllwall(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const newModuleAndDir = this.getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, frontBlock, backBlock, direction, block);
e.permutationToPlace = permutationToPlace
.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
.withState('lfg_ff:module', newModuleAndDir.module)
.withState('minecraft:cardinal_direction', newModuleAndDir.direction)
system.runTimeout(() => {
this.updateAllwall(block, direction)
}, 1)
}
getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getNeighborBlock(block, direction, side, filterwall) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterwall)
return neighborBlock.typeId == this.wallId ? neighborBlock : null;
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
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down", "front", "back"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, true))
.filter(Boolean);
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
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
let downBlock = this.getNeighborBlock(block, direction, "down", true);
let upBlock = this.getNeighborBlock(block, direction, "up", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allwalls = [];
if (leftBlock) allwalls.push(leftBlock)
if (rightBlock) allwalls.push(rightBlock)
if (upBlock) allwalls.push(upBlock)
if (downBlock) allwalls.push(downBlock)
if (frontBlock) allwalls.push(frontBlock)
if (backBlock) allwalls.push(backBlock)
for (const expendedwall of allwalls) {
const expendedVariant = this.getVariant(expendedwall);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedwall);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedwall.setPermutation(expendedwall.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", true));
system.runTimeout(() => {
try {
expendedwall.setPermutation(expendedwall.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", false));
} catch (e) {
}
}, 2)
this.expendPaint(expendedwall, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllwall(block, direction, updatedwallBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedwallBlocks.has(blockLocationKey)) {
return;
}
updatedwallBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allwalls = [];
if (downBlock) allwalls.push(downBlock)
if (upBlock) allwalls.push(upBlock)
if (rightBlock) allwalls.push(rightBlock)
if (leftBlock) allwalls.push(leftBlock)
if (frontBlock) allwalls.push(frontBlock)
if (backBlock) allwalls.push(backBlock)
for (const expendedwall of allwalls) {
const expDir = this.getDirection(expendedwall);
const expendedleftBlock = this.getNeighborBlock(expendedwall, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedwall, expDir, "right", true);
const expendeddownBlock = this.getNeighborBlock(expendedwall, expDir, "down", true);
const expendedupBlock = this.getNeighborBlock(expendedwall, expDir, "up", true);
const expendedfrontBlock = this.getNeighborBlock(expendedwall, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedwall, expDir, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedupBlock, expendeddownBlock, expendedfrontBlock, expendedbackBlock, expDir, expendedwall);
expendedwall.setPermutation(expendedwall.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedwallBlocks.size <= 10)
this.updateAllwall(expendedwall, expNewModuleAndDir.direction, updatedwallBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, frontBlock, backBlock, direction, block) {
const walls = []
const allBlocks = [leftBlock, rightBlock, upBlock, downBlock, frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
walls.push(b)
})
if (!walls.includes(leftBlock)) leftBlock = null
if (!walls.includes(rightBlock)) rightBlock = null
if (!walls.includes(upBlock)) upBlock = null
if (!walls.includes(downBlock)) downBlock = null
if (!walls.includes(backBlock)) backBlock = null
if (!walls.includes(frontBlock)) frontBlock = null
if (upBlock && downBlock) {
if ((leftBlock && rightBlock) || (frontBlock && backBlock)) {
return { module: "center", direction: direction }
} else {
if (leftBlock && frontBlock) {
return { module: "corner", direction: direction }
}
if (leftBlock && backBlock) {
return { module: "corner", direction: this.getOppositeDirection(direction) }
}
if (rightBlock && frontBlock) {
return { module: "corner", direction: this.getRightDirection(direction) }
}
if (rightBlock && backBlock) {
return { module: "corner", direction: this.getLeftDirection(direction) }
}
if (frontBlock) {
return { module: "side", direction: direction }
}
if (backBlock) {
return { module: "side", direction: this.getOppositeDirection(direction) }
}
if (rightBlock) {
return { module: "side", direction: this.getRightDirection(direction) }
}
if (leftBlock) {
return { module: "side", direction: this.getLeftDirection(direction) }
}
return { module: "center", direction: direction }
}
} else if (upBlock) {
const below = block.below()
if (below.typeId.includes("glass") || below.typeId.includes("window") || below.isAir) {
return { module: "center", direction: direction }
}
return { module: "bot", direction: direction }
} else if (downBlock) {
const above = block.above()
if (above.typeId.includes("glass") || above.typeId.includes("window")) {
return { module: "center", direction: direction }
}
return { module: "top", direction: direction }
}
return { module: "bot", direction: direction }
}
}