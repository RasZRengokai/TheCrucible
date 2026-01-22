/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class CoffeeTableComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.tableId = "lfg_ff:coffee_table"
this.MaxPaintedBlocksOnce = 500
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
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 8 ? 1 : variant + 1
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
if (variant == 4)
block.dimension.playSound("break.iron", block.location)
if (variant == 7)
block.dimension.playSound("random.glass", block.location)
system.runTimeout(() => {
this.updateAllTable(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placementVar = this.getPlacementVariant(block, direction)
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const newModuleAndDir = this.getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block);
e.permutationToPlace = permutationToPlace
.withState("lfg_ff:variant", placementVar)
.withState('lfg_ff:module', newModuleAndDir.module)
.withState('minecraft:cardinal_direction', newModuleAndDir.direction)
system.run(() => {
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
if (placementVar == 4)
block.dimension.playSound("place.iron", block.location)
})
system.runTimeout(() => {
this.updateAllTable(block, direction)
}, 1)
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "front", "back"];
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
getNeighborBlock(block, direction, side, filtertable) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filtertable)
return neighborBlock.typeId == this.tableId ? neighborBlock : null;
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
if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) {
return dx > 0 ? 'east' : 'west';
} else if (Math.abs(dz) > Math.abs(dx) && Math.abs(dz) > Math.abs(dy)) {
return dz > 0 ? 'south' : 'north';
} else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
return dy > 0 ? 'up' : 'down';
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
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allTables = [];
if (frontBlock) allTables.push(frontBlock)
if (backBlock) allTables.push(backBlock)
if (rightBlock) allTables.push(rightBlock)
if (leftBlock) allTables.push(leftBlock)
for (const expendedtable of allTables) {
const expendedVariant = this.getVariant(expendedtable);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedtable);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedtable.setPermutation(expendedtable.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedtable, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllTable(block, direction, updatedTableBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedTableBlocks.has(blockLocationKey)) {
return;
}
updatedTableBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allTables = [];
if (frontBlock) allTables.push(frontBlock)
if (backBlock) allTables.push(backBlock)
if (rightBlock) allTables.push(rightBlock)
if (leftBlock) allTables.push(leftBlock)
for (const expendedtable of allTables) {
const expDir = this.getDirection(expendedtable);
const expendedleftBlock = this.getNeighborBlock(expendedtable, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedtable, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedtable, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedtable, expDir, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedfrontBlock, expendedbackBlock, expDir, expendedtable);
expendedtable.setPermutation(expendedtable.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedTableBlocks.size <= 4)
this.updateAllTable(expendedtable, expNewModuleAndDir.direction, updatedTableBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block) {
const tables = []
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
tables.push(b)
})
if (!tables.includes(leftBlock)) leftBlock = null
if (!tables.includes(rightBlock)) rightBlock = null
if (!tables.includes(frontBlock)) frontBlock = null
if (!tables.includes(backBlock)) backBlock = null
if (!frontBlock && !backBlock && !rightBlock && !leftBlock) return { module: "normal", direction: direction }
if (frontBlock && backBlock && rightBlock && leftBlock) {
return { module: "center", direction: direction }
} else if (rightBlock && leftBlock && (frontBlock || backBlock)) {
if (frontBlock) {
let dir = this.getDirectionFromBlocks(block, frontBlock)
return { module: "edge_1", direction: this.getOppositeDirection(dir) }
} else {
let dir = this.getDirectionFromBlocks(block, backBlock)
return { module: "edge_1", direction: this.getOppositeDirection(dir) }
}
} else if (frontBlock && backBlock && (rightBlock || leftBlock)) {
if (rightBlock) {
let dir = this.getDirectionFromBlocks(block, rightBlock)
return { module: "edge_1", direction: this.getOppositeDirection(dir) }
} else {
let dir = this.getDirectionFromBlocks(block, leftBlock)
return { module: "edge_1", direction: this.getOppositeDirection(dir) }
}
} else if (rightBlock && leftBlock) {
let dir = this.getDirectionFromBlocks(rightBlock, leftBlock)
return { module: "edge_2", direction: this.getInvertedDirection(dir) }
} else if (frontBlock && backBlock) {
let dir = this.getDirectionFromBlocks(backBlock, frontBlock)
return { module: "edge_2", direction: this.getInvertedDirection(dir) }
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
let dir = this.getDirectionFromBlocks(tables[0], block)
return { module: "corner_2", direction: dir }
}
}
}