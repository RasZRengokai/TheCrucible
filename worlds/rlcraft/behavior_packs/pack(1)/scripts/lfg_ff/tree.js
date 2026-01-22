/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class TreeComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.onTick = this.onTick.bind(this);
this.treeId = "lfg_ff:tree"
this.MaxPaintedBlocksOnce = 150
}
isEnabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).tree
}
vvOptimized() {
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
if (worldVVSetings == undefined) return false;
return worldVVSetings;
}
onTick(e) {
if (Math.random() < 0.85) return;
if (!this.isEnabled()) return;
const block = e.block;
const timeOfDay = world.getTimeOfDay()
const isNight = timeOfDay < 23200 && timeOfDay > 12800
if (this.getVariant(block) > 3 || this.getVariant(block) == 1) return;
if (this.getModule(block) !== "wall" && this.getModule(block) !== "top") return;
system.runTimeout(() => {
try {
if (block && block.typeId == this.treeId)
block.dimension.spawnParticle(isNight ? (this.vvOptimized() ? "lfg_ff:plant_lucioles_vv" : "lfg_ff:plant_lucioles") : (Math.random() > 0.4 ? "lfg_ff:butterfly_large" : "lfg_ff:plant_bee_large"), Vector.add(block.location, new Vector(0.5, 0.2, 0.5)))
} catch { }
}, Math.floor(Math.random() * 5) * 20)
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 9 ? 1 : variant + 1
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
block.dimension.playSound("dig.cave_vines", block.location)
system.runTimeout(() => {
this.updateAlltree(block, direction)
}, 1)
}
isAnimated() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).animated_tree
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placedFace = e.face;
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:animated", this.isAnimated())
system.run(() => {
block.dimension.playSound("dig.cave_vines", block.location)
})
if (placedFace !== "Down" && placedFace !== "Up") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall")
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction, true))
return;
}
system.runTimeout(() => {
this.updateAlltree(block, direction)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction, false))
}
getPlacementVariant(block, direction, isWall) {
let adjacentPositions = ["up", "down"];
if (isWall)
adjacentPositions = ["up", "down", "front"];
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
getNeighborBlock(block, direction, side, filtertree) {
let neighborBlock = null
if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
else if (side == "south")
neighborBlock = block.south()
else if (side == "north")
neighborBlock = block.north()
else if (side == "east")
neighborBlock = block.east()
else if (side == "west")
neighborBlock = block.west()
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
if (filtertree)
return neighborBlock.typeId == this.treeId ? neighborBlock : null;
else
return neighborBlock
}
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const leftBlock = this.getNeighborBlock(block, direction, "west", true);
const rightBlock = this.getNeighborBlock(block, direction, "east", true);
const frontBlock = this.getNeighborBlock(block, direction, "south", true);
const backBlock = this.getNeighborBlock(block, direction, "north", true);
const realFrontBlock = this.getNeighborBlock(block, direction, "front", true);
const alltrees = [];
if (upBlock) alltrees.push(upBlock)
if (downBlock) alltrees.push(downBlock)
if (rightBlock && this.getModule(rightBlock) == "wall" && this.getOppositeDirection(this.getDirection(rightBlock)) == this.getDirectionFromBlocks(block, rightBlock)) alltrees.push(rightBlock)
if (leftBlock && this.getModule(leftBlock) == "wall" && this.getOppositeDirection(this.getDirection(leftBlock)) == this.getDirectionFromBlocks(block, leftBlock)) alltrees.push(leftBlock)
if (frontBlock && this.getModule(frontBlock) == "wall" && this.getOppositeDirection(this.getDirection(frontBlock)) == this.getDirectionFromBlocks(block, frontBlock)) alltrees.push(frontBlock)
if (backBlock && this.getModule(backBlock) == "wall" && this.getOppositeDirection(this.getDirection(backBlock)) == this.getDirectionFromBlocks(block, backBlock)) alltrees.push(backBlock)
if (realFrontBlock && this.getModule(block) == "wall") alltrees.push(realFrontBlock)
for (const expendedtree of alltrees) {
const expendedVariant = this.getVariant(expendedtree);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedtree.setPermutation(expendedtree.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedtree, direction, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAlltree(block, direction) {
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const leftBlock = this.getNeighborBlock(block, direction, "west", true);
const rightBlock = this.getNeighborBlock(block, direction, "east", true);
const frontBlock = this.getNeighborBlock(block, direction, "south", true);
const backBlock = this.getNeighborBlock(block, direction, "north", true);
const alltrees = [];
if (upBlock) alltrees.push(upBlock)
if (downBlock) alltrees.push(downBlock)
if (rightBlock) alltrees.push(rightBlock)
if (leftBlock) alltrees.push(leftBlock)
if (frontBlock) alltrees.push(frontBlock)
if (backBlock) alltrees.push(backBlock)
if (block.typeId == this.treeId) alltrees.push(block)
for (const expendedtree of alltrees) {
const expUpBlock = this.getNeighborBlock(expendedtree, direction, "up", true);
const expDownBlock = this.getNeighborBlock(expendedtree, direction, "down", true);
const expFrontBlock = this.getNeighborBlock(expendedtree, direction, "front", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expFrontBlock, direction, expendedtree);
expendedtree.setPermutation(expendedtree.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, frontBlock, direction, block) {
const trees = []
const allBlocks = [upBlock, downBlock, frontBlock]
allBlocks.forEach((b) => {
if (!b) return;
trees.push(b)
})
if (!trees.includes(upBlock)) upBlock = null
if (!trees.includes(downBlock)) downBlock = null
if (!trees.includes(frontBlock)) frontBlock = null
if (this.getModule(block) == "wall") return { module: "wall", direction: direction }
if (frontBlock && !upBlock && !downBlock) return { module: "wall", direction: direction }
if (upBlock && downBlock) {
return { module: "mid", direction: direction }
} else if (upBlock) {
return { module: "bot", direction: direction }
} else {
return { module: "top", direction: direction }
}
}
}