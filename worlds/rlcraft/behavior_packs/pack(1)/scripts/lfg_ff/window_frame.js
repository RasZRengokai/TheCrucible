/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class WindowFrameComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.windowId = "lfg_ff:window_frame"
this.MaxPaintedBlocksOnce = 300
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
let newVariant = variant == 11 ? 1 : variant + 1
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
system.runTimeout(() => {
this.updateAllwindow(block, direction)
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
const newModuleAndDir = this.getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, direction, this.getVerticalPosition(block), block);
e.permutationToPlace = permutationToPlace
.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
.withState('lfg_ff:module', newModuleAndDir.module)
.withState('minecraft:vertical_half', newModuleAndDir.verticalHalf)
.withState('minecraft:cardinal_direction', newModuleAndDir.direction)
system.runTimeout(() => {
this.updateAllwindow(block, direction)
}, 1)
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down"];
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
getNeighborBlock(block, direction, side, filterwindow) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterwindow)
return neighborBlock.typeId == this.windowId ? neighborBlock : null;
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
let downBlock = this.getNeighborBlock(block, direction, "down", true);
let upBlock = this.getNeighborBlock(block, direction, "up", true);
const allwindows = [];
if (leftBlock && (this.getDirection(leftBlock) == direction || this.getDirection(leftBlock) == this.getOppositeDirection(direction))) allwindows.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction || this.getDirection(rightBlock) == this.getOppositeDirection(direction))) allwindows.push(rightBlock)
if (upBlock && (this.getDirection(upBlock) == direction || this.getDirection(upBlock) == this.getOppositeDirection(direction))) allwindows.push(upBlock)
if (downBlock && (this.getDirection(downBlock) == direction || this.getDirection(downBlock) == this.getOppositeDirection(direction))) allwindows.push(downBlock)
for (const expendedwindow of allwindows) {
const expendedVariant = this.getVariant(expendedwindow);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedwindow);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedwindow.setPermutation(expendedwindow.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedwindow, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllwindow(block, direction, updatedwindowBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedwindowBlocks.has(blockLocationKey)) {
return;
}
updatedwindowBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const allwindows = [];
if (downBlock) allwindows.push(downBlock)
if (upBlock) allwindows.push(upBlock)
if (rightBlock) allwindows.push(rightBlock)
if (leftBlock) allwindows.push(leftBlock)
for (const expendedwindow of allwindows) {
const expDir = this.getDirection(expendedwindow);
const expVerticalHalf = this.getDirection(expendedwindow);
const expendedleftBlock = this.getNeighborBlock(expendedwindow, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedwindow, expDir, "right", true);
const expendeddownBlock = this.getNeighborBlock(expendedwindow, expDir, "down", true);
const expendedupBlock = this.getNeighborBlock(expendedwindow, expDir, "up", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedupBlock, expendeddownBlock, expDir, expVerticalHalf, expendedwindow);
expendedwindow.setPermutation(expendedwindow.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction)
.withState('minecraft:vertical_half', expNewModuleAndDir.verticalHalf));
system.runTimeout(() => {
try {
if (updatedwindowBlocks.size <= 4)
this.updateAllwindow(expendedwindow, expNewModuleAndDir.direction, updatedwindowBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, direction, verticalHalf, block) {
const windows = []
const allBlocks = [leftBlock, rightBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
windows.push(b)
})
if (!windows.includes(leftBlock) || (this.getDirection(leftBlock) !== direction && this.getDirection(leftBlock) !== this.getOppositeDirection(direction))) leftBlock = null
if (!windows.includes(rightBlock) || (this.getDirection(rightBlock) !== direction && this.getDirection(rightBlock) !== this.getOppositeDirection(direction))) rightBlock = null
if (!windows.includes(upBlock) || (this.getDirection(upBlock) !== direction && this.getDirection(upBlock) !== this.getOppositeDirection(direction))) upBlock = null
if (!windows.includes(downBlock) || (this.getDirection(downBlock) !== direction && this.getDirection(downBlock) !== this.getOppositeDirection(direction))) downBlock = null
if (!upBlock && !downBlock && !rightBlock && !leftBlock) return { module: "normal", direction: direction, verticalHalf: "bottom" }
if (upBlock && downBlock && rightBlock && leftBlock) {
return { module: "center", direction: direction, verticalHalf: "bottom" }
} else if (rightBlock && leftBlock && (upBlock || downBlock)) {
if (upBlock) {
return { module: "edge_up", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "edge_up", direction: direction, verticalHalf: "top" }
}
} else if (upBlock && downBlock && (rightBlock || leftBlock)) {
if (rightBlock) {
return { module: "edge_side", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "edge_side", direction: this.getOppositeDirection(direction), verticalHalf: "bottom" }
}
} else if (rightBlock && leftBlock) {
return { module: "edge_2_up", direction: direction, verticalHalf: "bottom" }
} else if (upBlock && downBlock) {
return { module: "edge_2_side", direction: direction, verticalHalf: "bottom" }
} else if ((upBlock || downBlock) && (rightBlock || leftBlock)) {
if (upBlock) {
if (rightBlock)
return { module: "corner", direction: direction, verticalHalf: "bottom" }
else
return { module: "corner", direction: this.getOppositeDirection(direction), verticalHalf: "bottom" }
} else {
if (rightBlock)
return { module: "corner", direction: this.getOppositeDirection(direction), verticalHalf: "top" }
else
return { module: "corner", direction: direction, verticalHalf: "top" }
}
} else {
if (rightBlock || leftBlock) {
if (rightBlock) {
return { module: "corner_2_side", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "corner_2_side", direction: this.getOppositeDirection(direction), verticalHalf: "bottom" }
}
} else {
if (upBlock) {
return { module: "corner_2_up", direction: direction, verticalHalf: "top" }
} else {
return { module: "corner_2_up", direction: direction, verticalHalf: "bottom" }
}
}
}
}
}