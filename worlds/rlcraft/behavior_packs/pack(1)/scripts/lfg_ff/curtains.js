/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class CurtainsComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.curtainsId = "lfg_ff:curtains"
this.MaxPaintedBlocksOnce = 200
}
onPlayerInteract(e) {
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
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
let newVariant = variant == 10 ? 1 : variant + 1
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
const isOpen = block.permutation.getState("lfg_ff:open")
if (isOpen) {
if (variant == 2) {
block.dimension.playSound("item.spyglass.use", block.location, { pitch: 1.4 })
block.dimension.playSound("close.bamboo_wood_fence_gate", block.location, { pitch: 2.5 })
}
else if (variant == 3)
block.dimension.playSound("lfg_ff:garage_door_close", block.location)
else if (variant == 5)
block.dimension.playSound("lfg_ff:curtain_shower_close", block.location)
else
block.dimension.playSound("lfg_ff:curtain_wool_close", block.location)
} else {
if (variant == 2) {
block.dimension.playSound("item.spyglass.use", block.location, { pitch: 1.7 })
block.dimension.playSound("open.bamboo_wood_fence_gate", block.location, { pitch: 2.8 })
}
else if (variant == 3)
block.dimension.playSound("lfg_ff:garage_door_open", block.location)
else if (variant == 5)
block.dimension.playSound("lfg_ff:curtain_shower_open", block.location)
else
block.dimension.playSound("lfg_ff:curtain_wool_open", block.location)
}
this.expendOpenState(block, direction, !isOpen)
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllcurtains(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllcurtains(block, direction)
}, 1)
e.permutationToPlace = e.permutationToPlace
.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
.withState("lfg_ff:module", "bot_center")
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
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getNeighborBlock(block, direction, side, filtercurtains) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filtercurtains)
return neighborBlock.typeId == this.curtainsId ? neighborBlock : null;
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
const allcurtainss = [];
if (leftBlock && (this.getDirection(leftBlock) == direction || this.getDirection(leftBlock) == this.getOppositeDirection(direction))) allcurtainss.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction || this.getDirection(rightBlock) == this.getOppositeDirection(direction))) allcurtainss.push(rightBlock)
if (upBlock && (this.getDirection(upBlock) == direction || this.getDirection(upBlock) == this.getOppositeDirection(direction))) allcurtainss.push(upBlock)
if (downBlock && (this.getDirection(downBlock) == direction || this.getDirection(downBlock) == this.getOppositeDirection(direction))) allcurtainss.push(downBlock)
for (const expendedcurtains of allcurtainss) {
const expendedVariant = this.getVariant(expendedcurtains);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedcurtains);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedcurtains.setPermutation(expendedcurtains.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedcurtains, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
expendOpenState(block, direction, isOpen, updatedOpenedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedOpenedBlocks.has(blockLocationKey)) {
return;
}
updatedOpenedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
let downBlock = this.getNeighborBlock(block, direction, "down", true);
let upBlock = this.getNeighborBlock(block, direction, "up", true);
const allcurtainss = [];
if (leftBlock && (this.getDirection(leftBlock) == direction)) allcurtainss.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction)) allcurtainss.push(rightBlock)
if (upBlock && (this.getDirection(upBlock) == direction)) allcurtainss.push(upBlock)
if (downBlock && (this.getDirection(downBlock) == direction)) allcurtainss.push(downBlock)
for (const expendedcurtains of allcurtainss) {
const expIsOpen = expendedcurtains.permutation.getState("lfg_ff:open")
if (expIsOpen == isOpen) continue;
system.runTimeout(() => {
if (expIsOpen !== isOpen) {
try {
const expDir = this.getDirection(expendedcurtains);
if (updatedOpenedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedcurtains.setPermutation(expendedcurtains.permutation.withState("lfg_ff:open", isOpen));
this.expendOpenState(expendedcurtains, expDir, isOpen, updatedOpenedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllcurtains(block, direction, updatedcurtainsBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedcurtainsBlocks.has(blockLocationKey)) {
return;
}
updatedcurtainsBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const allcurtainss = [];
if (downBlock) allcurtainss.push(downBlock)
if (upBlock) allcurtainss.push(upBlock)
if (rightBlock) allcurtainss.push(rightBlock)
if (leftBlock) allcurtainss.push(leftBlock)
for (const expendedcurtains of allcurtainss) {
const expDir = this.getDirection(expendedcurtains);
const expendedleftBlock = this.getNeighborBlock(expendedcurtains, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedcurtains, expDir, "right", true);
const expendeddownBlock = this.getNeighborBlock(expendedcurtains, expDir, "down", true);
const expendedupBlock = this.getNeighborBlock(expendedcurtains, expDir, "up", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedupBlock, expendeddownBlock, expDir, expendedcurtains);
expendedcurtains.setPermutation(expendedcurtains.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedcurtainsBlocks.size <= 4)
this.updateAllcurtains(expendedcurtains, expNewModuleAndDir.direction, updatedcurtainsBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, direction, block) {
const curtainss = []
const allBlocks = [leftBlock, rightBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
curtainss.push(b)
})
if (!curtainss.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!curtainss.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!curtainss.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
if (!curtainss.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (!upBlock && !rightBlock && !leftBlock) return { module: "top_center", direction: direction }
if (upBlock && rightBlock && leftBlock) {
return { module: "bot_center", direction: direction }
} else if (rightBlock && leftBlock) {
return { module: "top_center", direction: direction }
} else if (upBlock && (rightBlock || leftBlock)) {
if (rightBlock) {
return { module: "bot_left", direction: direction }
} else {
return { module: "bot_right", direction: direction }
}
} else if (rightBlock || leftBlock) {
if (rightBlock) {
return { module: "top_left", direction: direction }
} else {
return { module: "top_right", direction: direction }
}
} else if (upBlock) {
return { module: "bot_center", direction: direction }
}
return { module: "top_center", direction: direction }
}
}