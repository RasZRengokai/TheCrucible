/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { world, system, BlockPermutation, ItemStack, StructureManager } from "@minecraft/server";
import { Vector } from './vector.js';
export class BetterLeavesComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onTick = this.onTick.bind(this);
this.leaveId = "lfg_ff:better_leaves"
this.bushId = "lfg_ff:bush"
this.MaxPaintedBlocksOnce = 2000
}
isEnabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).bushy_leaves
}
onTick(e) {
if (Math.random() < 0.75) return;
if (!this.isEnabled()) return;
const block = e.block;
if (!block.below() || !block.below().isAir) return;
const timeOfDay = world.getTimeOfDay()
const isNight = timeOfDay < 23200 && timeOfDay > 12800
if (isNight) return;
system.runTimeout(() => {
try {
if (block && block.typeId == this.leaveId)
block.dimension.spawnParticle(`lfg_ff:leaf_v${this.getVariant(block)}`, Vector.add(block.location, new Vector(0.5, 0.5, 0.5)))
} catch { }
}, Math.floor(Math.random() * 5) * 20)
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const player = e.player;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = "north"
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
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
return;
}
}
}
isAnimated() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).animated_better_leaves
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = "north"
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:animated", this.isAnimated())
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:random_direction", Math.floor(Math.random() * 4) + 1).withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
}
getPlacementVariant(block, direction) {
let adjacentPositions = ["left", "right", "up", "down", "front", "back"];
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
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allleaves = [];
if (frontBlock) allleaves.push(frontBlock)
if (backBlock) allleaves.push(backBlock)
if (rightBlock) allleaves.push(rightBlock)
if (leftBlock) allleaves.push(leftBlock)
if (upBlock) allleaves.push(upBlock)
if (downBlock) allleaves.push(downBlock)
for (const expendedleave of allleaves) {
const expendedVariant = this.getVariant(expendedleave);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = "north";
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedleave.setPermutation(expendedleave.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedleave, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
getNeighborBlock(block, direction, side, filterleave) {
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
if (filterleave)
return (neighborBlock.typeId == this.leaveId || neighborBlock.typeId == this.bushId) ? neighborBlock : null;
else
return neighborBlock
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
getDirectionFromPlacedFace(face) {
switch (face) {
case 'West':
return 'west';
case 'East':
return 'east';
case 'North':
return 'north';
case 'South':
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
getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
}