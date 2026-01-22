/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class PianoComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.pianoId = "lfg_ff:piano"
this.MaxPaintedBlocksOnce = 100
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
let newVariant = variant == 3 ? 1 : variant + 1
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
this.expendOpenState(block, direction, !isOpen)
if (this.getModule(block).includes("main")) {
block.dimension.playSound(isOpen ? "close.bamboo_wood_fence_gate" : "open.bamboo_wood_fence_gate", block.location, { pitch: isOpen ? 2 : 1.7 })
} else {
block.dimension.playSound(isOpen ? "close.bamboo_wood_fence_gate" : "open.bamboo_wood_fence_gate", block.location, { pitch: isOpen ? 0.8 : 1 })
}
}
onPlayerBreak(e) {
const block = e.block;
const player = e.player;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
if (brokenBlockPermutation.getState("lfg_ff:module").includes("left")) {
const loc = this.getNeighborBlock(block, direction, "right", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
}
if (brokenBlockPermutation.getState("lfg_ff:module").includes("right")) {
const loc = this.getNeighborBlock(block, direction, "left", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
}
system.runTimeout(() => {
this.updateAllpiano(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const player = e.player;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
let canPlace = false
if (this.getNeighborBlock(block, direction, "right", false).isAir && block.isAir) canPlace = true
if (!canPlace) {
e.cancel = true
return;
}
const pianoPerm = this.getpianoPermutation(block, direction, permutationToPlace)
e.permutationToPlace = pianoPerm.first.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.run(() => {
this.getNeighborBlock(block, direction, "right", false).setPermutation(pianoPerm.second.withState("lfg_ff:variant", this.getPlacementVariant(block, direction)))
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(this.getNeighborBlock(block, direction, "right", false).location, new Vector(0.5, 0, 0.5)))
if (player.getGameMode() == "Survival")
player.runCommand(`clear @s ${permutationToPlace.type.id} 0 1`)
})
system.runTimeout(() => {
this.updateAllpiano(block, direction)
}, 1)
const placementPerm = e.permutationToPlace
e.cancel = true
system.run(() => {
block.setPermutation(placementPerm)
block.dimension.playSound("dig.wood", block.location)
})
}
getpianoPermutation(block, direction, permutationToPlace) {
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allpianos = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allpianos.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allpianos.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allpianos.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allpianos.push(backBlock)
if (!frontBlock && !backBlock)
return { first: permutationToPlace.withState("lfg_ff:module", "main_left"), second: permutationToPlace.withState("lfg_ff:module", "main_right") }
if (backBlock && this.getModule(backBlock) == "main_left") {
return { first: permutationToPlace.withState("lfg_ff:module", "end_left"), second: permutationToPlace.withState("lfg_ff:module", "end_right") }
}
if (frontBlock && this.getModule(frontBlock) == "main_left") {
return { first: permutationToPlace.withState("lfg_ff:module", "main_left"), second: permutationToPlace.withState("lfg_ff:module", "main_right") }
}
return { first: permutationToPlace.withState("lfg_ff:module", "main_left"), second: permutationToPlace.withState("lfg_ff:module", "main_right") }
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
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getNeighborBlock(block, direction, side, filterpiano) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterpiano)
return neighborBlock.typeId == this.pianoId ? neighborBlock : null;
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allpianos = [];
if (leftBlock && (this.getDirection(leftBlock) == direction)) allpianos.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction)) allpianos.push(rightBlock)
if (frontBlock && (this.getDirection(frontBlock) == direction)) allpianos.push(frontBlock)
if (backBlock && (this.getDirection(backBlock) == direction)) allpianos.push(backBlock)
for (const expendedpiano of allpianos) {
const expendedVariant = this.getVariant(expendedpiano);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedpiano);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedpiano.setPermutation(expendedpiano.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedpiano, expDir, newVariant, updatedPaintedBlocks);
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allpianos = [];
if (leftBlock && (this.getDirection(leftBlock) == direction) && ((this.getModule(block).includes("main") && this.getModule(leftBlock).includes("main")) || (!this.getModule(block).includes("main") && !this.getModule(leftBlock).includes("main")))) allpianos.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction) && ((this.getModule(block).includes("main") && this.getModule(rightBlock).includes("main")) || (!this.getModule(block).includes("main") && !this.getModule(rightBlock).includes("main")))) allpianos.push(rightBlock)
if (frontBlock && (this.getDirection(frontBlock) == direction) && ((this.getModule(block).includes("main") && this.getModule(frontBlock).includes("main")) || (!this.getModule(block).includes("main") && !this.getModule(frontBlock).includes("main")))) allpianos.push(frontBlock)
if (backBlock && (this.getDirection(backBlock) == direction) && ((this.getModule(block).includes("main") && this.getModule(backBlock).includes("main")) || (!this.getModule(block).includes("main") && !this.getModule(backBlock).includes("main")))) allpianos.push(backBlock)
for (const expendedpiano of allpianos) {
const expIsOpen = expendedpiano.permutation.getState("lfg_ff:open")
if (expIsOpen == isOpen) continue;
system.runTimeout(() => {
if (expIsOpen !== isOpen) {
try {
const expDir = this.getDirection(expendedpiano);
if (updatedOpenedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedpiano.setPermutation(expendedpiano.permutation.withState("lfg_ff:open", isOpen));
this.expendOpenState(expendedpiano, expDir, isOpen, updatedOpenedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllpiano(block, direction, updatedpianoBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedpianoBlocks.has(blockLocationKey)) {
return;
}
updatedpianoBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allpianos = [];
if (frontBlock) allpianos.push(frontBlock)
if (backBlock) allpianos.push(backBlock)
if (rightBlock) allpianos.push(rightBlock)
if (leftBlock) allpianos.push(leftBlock)
for (const expendedpiano of allpianos) {
const expDir = this.getDirection(expendedpiano);
const expendedleftBlock = this.getNeighborBlock(expendedpiano, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedpiano, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedpiano, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedpiano, expDir, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedfrontBlock, expendedbackBlock, expDir, expendedpiano);
expendedpiano.setPermutation(expendedpiano.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('lfg_ff:open', false)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedpianoBlocks.size <= 10)
this.updateAllpiano(expendedpiano, expNewModuleAndDir.direction, updatedpianoBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block) {
const pianos = []
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
pianos.push(b)
})
if (!pianos.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!pianos.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!pianos.includes(frontBlock) || this.getDirection(frontBlock) !== direction) frontBlock = null
if (!pianos.includes(backBlock) || this.getDirection(backBlock) !== direction) backBlock = null
if (!frontBlock && !backBlock) {
if (this.getModule(block).includes("left")) {
return { module: "main_left", direction: direction }
}
if (this.getModule(block).includes("right")) {
return { module: "main_right", direction: direction }
}
}
if (backBlock && this.getModule(backBlock).includes("left") && frontBlock && this.getModule(frontBlock).includes("left") && this.getModule(block).includes("left")) {
return { module: "mid_left", direction: direction }
}
if (backBlock && this.getModule(backBlock).includes("right") && frontBlock && this.getModule(frontBlock).includes("right") && this.getModule(block).includes("right")) {
return { module: "mid_right", direction: direction }
}
if (backBlock && this.getModule(backBlock).includes("left") && this.getModule(block).includes("left")) {
return { module: "end_left", direction: direction }
}
if (backBlock && this.getModule(backBlock).includes("right") && this.getModule(block).includes("right")) {
return { module: "end_right", direction: direction }
}
if (frontBlock && this.getModule(frontBlock).includes("left") && this.getModule(block).includes("left")) {
return { module: "main_left", direction: direction }
}
if (frontBlock && this.getModule(frontBlock).includes("right") && this.getModule(block).includes("right")) {
return { module: "main_right", direction: direction }
}
return { module: this.getModule(block), direction: direction }
}
}