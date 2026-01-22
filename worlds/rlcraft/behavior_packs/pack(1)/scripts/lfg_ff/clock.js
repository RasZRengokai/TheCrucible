/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class ClockComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.clockId = "lfg_ff:clock"
this.clockEntityId = "lfg_ff:clock_pendule"
this.MaxPaintedBlocksOnce = 100
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 3 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant));
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, newVariant)
}
return;
}
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const clockEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.clockEntityId })[0]
if (clockEntity) {
clockEntity.remove()
}
if (brokenBlockPermutation.getState("lfg_ff:module") == "small")
block.dimension.playSound("break.iron", block.location)
system.runTimeout(() => {
this.updateAllclock(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const placedFace = e.face;
if (placedFace !== "Down" && placedFace !== "Up") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall")
return
}
if (block.below().typeId !== this.clockId)
system.run(() => {
block.dimension.playSound("place.iron", block.location)
})
system.runTimeout(() => {
this.updateAllclock(block)
}, 1)
}
getPlacementVariant(block) {
const adjacentBlocks = [block.below(), block.above()]
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
expendPaint(block, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const upBlock = block.above()
const downBlock = block.below()
const allclocks = [];
if (upBlock.typeId == this.clockId) allclocks.push(upBlock)
if (downBlock.typeId == this.clockId) allclocks.push(downBlock)
const clockEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.clockEntityId })[0]
if (clockEntity) {
clockEntity.setProperty("lfg_ff:variant", newVariant)
}
for (const expendedclock of allclocks) {
const expendedVariant = this.getVariant(expendedclock);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedclock.setPermutation(expendedclock.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedclock, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllclock(block) {
const upBlock = block.above()
const downBlock = block.below()
const allclocks = [];
if (upBlock.typeId == this.clockId) allclocks.push(upBlock)
if (downBlock.typeId == this.clockId) allclocks.push(downBlock)
if (block.typeId == this.clockId) allclocks.push(block)
for (const expendedclock of allclocks) {
const expDir = this.getDirection(expendedclock);
const expUpBlock = expendedclock.above().typeId == this.clockId ? expendedclock.above() : null
const expDownBlock = expendedclock.below().typeId == this.clockId ? expendedclock.below() : null
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedclock, expDir);
expendedclock.setPermutation(expendedclock.permutation
.withState('lfg_ff:module', expNewModuleAndDir));
const clockEntity = block.dimension.getEntities({ location: Vector.add(expendedclock.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.25, type: this.clockEntityId })[0]
if (clockEntity) {
clockEntity.remove()
}
if (this.getModule(expendedclock) == "bot") {
const loc = expendedclock.location
const clockRotationY = this.getclockEntityRotations(expDir)
const spawnedclockEntity = block.dimension.spawnEntity(this.clockEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedclockEntity.setRotation({ x: 0, y: clockRotationY })
spawnedclockEntity.setProperty("lfg_ff:rotation_y", clockRotationY);
spawnedclockEntity.setProperty("lfg_ff:variant", this.getVariant(expendedclock));
}
}
}
getclockEntityRotations(dir) {
let rotationY = 0;
switch (dir) {
case 'north':
rotationY = 0;
break;
case 'south':
rotationY = 180;
break;
case 'east':
rotationY = 90;
break;
case 'west':
rotationY = -90;
break;
}
return rotationY;
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getUpdatedModuleAndDirection(upBlock, downBlock, block, direction) {
const clocks = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
clocks.push(b)
})
if (!clocks.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
if (!clocks.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (this.getModule(block) == "wall") return "wall"
if (!upBlock && !downBlock) {
return "small"
}
if (upBlock && this.getModule(upBlock) !== "wall") {
return "bot"
}
if (downBlock && this.getModule(downBlock) !== "wall") {
return "top"
}
return "small"
}
}