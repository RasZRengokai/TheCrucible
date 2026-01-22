/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class SinkComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.sinkId = "lfg_ff:sink"
this.MaxPaintedBlocksOnce = 100
}
onPlayerInteract(e) {
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (["lfg_ff:variant_picker", "lfg_ff:debug_stick"].includes(handItem.typeId)) {
return
}
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const colorPickerMode = player.getDynamicProperty(`lfg_ff:${handItem.typeId.includes("small") ? "tvs" : "vs"}_color_brush_mode`) == 1
let newVariant = variant == 2 ? 1 : variant + 1
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
if (pickedVar) newVariant = pickedVar
}
block.setPermutation(block.permutation.withState("lfg_ff:variant", newVariant))
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (handItem.typeId == "lfg_ff:color_brush") {
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
let bahtWaterLevelLoc = null;
const waterRotation = this.getRotationFromDirection(direction);
const moduleState = block.permutation.getState("lfg_ff:module");
if (moduleState.includes("left")) {
const rightNeighbor = this.getNeighborBlock(block, direction, "right", false);
const rightNeighborCenter = this.getBlockCenter(rightNeighbor);
const currentBlockCenter = this.getBlockCenter(block);
bahtWaterLevelLoc = {
x: (currentBlockCenter.x + rightNeighborCenter.x) / 2,
y: (currentBlockCenter.y + rightNeighborCenter.y) / 2,
z: (currentBlockCenter.z + rightNeighborCenter.z) / 2
};
} else if (moduleState.includes("right")) {
const leftNeighbor = this.getNeighborBlock(block, direction, "left", false);
const leftNeighborCenter = this.getBlockCenter(leftNeighbor);
const currentBlockCenter = this.getBlockCenter(block);
bahtWaterLevelLoc = {
x: (currentBlockCenter.x + leftNeighborCenter.x) / 2,
y: (currentBlockCenter.y + leftNeighborCenter.y) / 2,
z: (currentBlockCenter.z + leftNeighborCenter.z) / 2
};
} else {
bahtWaterLevelLoc = this.getBlockCenter(block);
}
const showerEntity = block.dimension.getEntities({ location: bahtWaterLevelLoc, maxDistance: 0.25, type: "lfg_ff:sink_water" })[0]
if (showerEntity) {
showerEntity.remove()
} else {
const showerEntity = player.dimension.spawnEntity("lfg_ff:sink_water", bahtWaterLevelLoc)
showerEntity.setProperty("lfg_ff:rotation_y", waterRotation)
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
system.runTimeout(() => {
this.updateAllsink(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllsink(block, direction)
}, 1)
const placementVar = this.getPlacementVariant(block, direction)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar)
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
getNeighborBlock(block, direction, side, filtersink) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
if (filtersink)
return neighborBlock.typeId == this.sinkId ? neighborBlock : null;
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
const allsinks = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allsinks.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allsinks.push(rightBlock)
for (const expendedsink of allsinks) {
const expendedVariant = this.getVariant(expendedsink);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedsink);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedsink.setPermutation(expendedsink.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedsink, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllsink(block, direction, updatedsinkBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedsinkBlocks.has(blockLocationKey)) {
return;
}
updatedsinkBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const allsinks = [];
if (rightBlock) allsinks.push(rightBlock)
if (leftBlock) allsinks.push(leftBlock)
const showerEntity = block.dimension.getEntities({ location: this.getBlockCenter(block), maxDistance: 0.75, type: "lfg_ff:sink_water" })[0]
if (showerEntity) {
showerEntity.remove()
}
for (const expendedsink of allsinks) {
const expDir = this.getDirection(expendedsink);
const expendedleftBlock = this.getNeighborBlock(expendedsink, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedsink, expDir, "right", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expDir, expendedsink);
expendedsink.setPermutation(expendedsink.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedsinkBlocks.size <= 2)
this.updateAllsink(expendedsink, expNewModuleAndDir.direction, updatedsinkBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, direction, block) {
const sinks = []
const allBlocks = [leftBlock, rightBlock]
allBlocks.forEach((b) => {
if (!b) return;
sinks.push(b)
})
if (!sinks.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!sinks.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!rightBlock && !leftBlock) return { module: "normal", direction: direction }
if (rightBlock) {
if (!this.getModule(rightBlock).includes("left_end") && (!leftBlock || this.getModule(block) == "normal")) {
return { module: "left_end", direction: direction }
}
}
if (leftBlock) {
if (!this.getModule(leftBlock).includes("right_end") && (!rightBlock || this.getModule(block) == "normal")) {
return { module: "right_end", direction: direction }
}
}
return { module: this.getModule(block), direction: direction }
}
}