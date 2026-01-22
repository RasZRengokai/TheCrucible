/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class WallShelfComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.wall_shelfId = "lfg_ff:wall_shelf"
this.MaxPaintedBlocksOnce = 300
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 7 ? 1 : variant + 1
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
return;
}
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
if (brokenBlockPermutation.getState("lfg_ff:variant") == 5)
block.dimension.playSound("break.iron", block.location)
if (brokenBlockPermutation.getState("lfg_ff:variant") == 2)
block.dimension.playSound("dig.chain", block.location)
system.runTimeout(() => {
this.updateAllwall_shelf(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllwall_shelf(block, direction)
}, 1)
const placementVar = this.getPlacementVariant(block, direction)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar)
system.run(()=>{
if (placementVar == 5)
block.dimension.playSound("break.iron", block.location)
if (placementVar == 2)
block.dimension.playSound("dig.chain", block.location)
})
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right"];
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
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getRotationFromDirection(direction) {
switch (direction) {
case 'north': return 0;
case 'south': return 180;
case 'east': return 90;
case 'west': return -90;
default: return 0;
}
}
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterwall_shelf) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
if (filterwall_shelf)
return neighborBlock.typeId == this.wall_shelfId ? neighborBlock : null;
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
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const allwall_shelfs = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allwall_shelfs.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allwall_shelfs.push(rightBlock)
for (const expendedwall_shelf of allwall_shelfs) {
const expendedVariant = this.getVariant(expendedwall_shelf);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedwall_shelf);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedwall_shelf.setPermutation(expendedwall_shelf.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedwall_shelf, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllwall_shelf(block, direction, updatedwall_shelfBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedwall_shelfBlocks.has(blockLocationKey)) {
return;
}
updatedwall_shelfBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const allwall_shelfs = [];
if (rightBlock) allwall_shelfs.push(rightBlock)
if (leftBlock) allwall_shelfs.push(leftBlock)
for (const expendedwall_shelf of allwall_shelfs) {
const expDir = this.getDirection(expendedwall_shelf);
const expendedleftBlock = this.getNeighborBlock(expendedwall_shelf, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedwall_shelf, expDir, "right", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expDir, expendedwall_shelf);
expendedwall_shelf.setPermutation(expendedwall_shelf.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedwall_shelfBlocks.size <= 2)
this.updateAllwall_shelf(expendedwall_shelf, expNewModuleAndDir.direction, updatedwall_shelfBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, direction, block) {
const wall_shelfs = []
const allBlocks = [leftBlock, rightBlock]
allBlocks.forEach((b) => {
if (!b) return;
wall_shelfs.push(b)
})
if (!wall_shelfs.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!wall_shelfs.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!rightBlock && !leftBlock) return { module: "normal", direction: direction }
if (rightBlock && leftBlock) {
return { module: "center", direction: direction }
} else if (rightBlock) {
return { module: "left_end", direction: direction }
} else if (leftBlock) {
return { module: "right_end", direction: direction }
}
}
}