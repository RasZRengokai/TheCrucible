/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class StreetLampComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.onTick = this.onTick.bind(this);
this.street_lampId = "lfg_ff:street_lamp"
this.MaxPaintedBlocksOnce = 100
}
isEnabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).street_lamp
}
vvOptimized() {
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
if (worldVVSetings == undefined) return false;
return worldVVSetings;
}
onTick(e) {
const block = e.block;
const hasLight = block.permutation.getState("lfg_ff:light")
if (this.getModule(block) !== "wall" && this.getModule(block) !== "top") {
if (hasLight) block.setPermutation(block.permutation.withState("lfg_ff:light", false).withState("lfg_ff:vv_opti", this.vvOptimized()))
return;
}
const timeOfDay = world.getTimeOfDay()
if (timeOfDay < 23200 && timeOfDay > 12800) {
if (!hasLight) {
block.setPermutation(block.permutation.withState("lfg_ff:light", true).withState("lfg_ff:vv_opti", this.vvOptimized()))
}
const nearFadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 1.5 })[0]
if (!nearFadeEntity && this.isEnabled() && !this.vvOptimized()) {
const fade = block.dimension.spawnEntity("lfg_ff:lamp_fade", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
fade.setProperty("lfg_ff:shape", 15)
} else if (!this.isEnabled() || this.vvOptimized()) {
const fadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
}
} else {
if (hasLight) {
block.setPermutation(block.permutation.withState("lfg_ff:light", false).withState("lfg_ff:vv_opti", this.vvOptimized()))
}
const fadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
}
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
let newVariant = variant == 4 ? 1 : variant + 1
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
const fadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
system.runTimeout(() => {
this.updateAllstreet_lamp(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placedFace = e.face;
if (placedFace !== "Down" && placedFace !== "Up") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall")
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction, true))
return;
}
system.runTimeout(() => {
this.updateAllstreet_lamp(block, direction)
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
getNeighborBlock(block, direction, side, filterstreet_lamp) {
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
if (filterstreet_lamp)
return neighborBlock.typeId == this.street_lampId ? neighborBlock : null;
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
const allstreet_lamps = [];
if (upBlock) allstreet_lamps.push(upBlock)
if (downBlock) allstreet_lamps.push(downBlock)
if (rightBlock && this.getModule(rightBlock) == "wall" && this.getOppositeDirection(this.getDirection(rightBlock)) == this.getDirectionFromBlocks(block, rightBlock)) allstreet_lamps.push(rightBlock)
if (leftBlock && this.getModule(leftBlock) == "wall" && this.getOppositeDirection(this.getDirection(leftBlock)) == this.getDirectionFromBlocks(block, leftBlock)) allstreet_lamps.push(leftBlock)
if (frontBlock && this.getModule(frontBlock) == "wall" && this.getOppositeDirection(this.getDirection(frontBlock)) == this.getDirectionFromBlocks(block, frontBlock)) allstreet_lamps.push(frontBlock)
if (backBlock && this.getModule(backBlock) == "wall" && this.getOppositeDirection(this.getDirection(backBlock)) == this.getDirectionFromBlocks(block, backBlock)) allstreet_lamps.push(backBlock)
if (realFrontBlock && this.getModule(block) == "wall") allstreet_lamps.push(realFrontBlock)
for (const expendedstreet_lamp of allstreet_lamps) {
const expendedVariant = this.getVariant(expendedstreet_lamp);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedstreet_lamp.setPermutation(expendedstreet_lamp.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedstreet_lamp, direction, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllstreet_lamp(block, direction) {
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const leftBlock = this.getNeighborBlock(block, direction, "west", true);
const rightBlock = this.getNeighborBlock(block, direction, "east", true);
const frontBlock = this.getNeighborBlock(block, direction, "south", true);
const backBlock = this.getNeighborBlock(block, direction, "north", true);
const allstreet_lamps = [];
if (upBlock) allstreet_lamps.push(upBlock)
if (downBlock) allstreet_lamps.push(downBlock)
if (rightBlock) allstreet_lamps.push(rightBlock)
if (leftBlock) allstreet_lamps.push(leftBlock)
if (frontBlock) allstreet_lamps.push(frontBlock)
if (backBlock) allstreet_lamps.push(backBlock)
if (block.typeId == this.street_lampId) allstreet_lamps.push(block)
for (const expendedstreet_lamp of allstreet_lamps) {
const expUpBlock = this.getNeighborBlock(expendedstreet_lamp, direction, "up", true);
const expDownBlock = this.getNeighborBlock(expendedstreet_lamp, direction, "down", true);
const expFrontBlock = this.getNeighborBlock(expendedstreet_lamp, direction, "front", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expFrontBlock, direction);
expendedstreet_lamp.setPermutation(expendedstreet_lamp.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
const fadeEntity = expendedstreet_lamp.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(expendedstreet_lamp.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, frontBlock, direction) {
const street_lamps = []
const allBlocks = [upBlock, downBlock, frontBlock]
allBlocks.forEach((b) => {
if (!b) return;
street_lamps.push(b)
})
if (!street_lamps.includes(upBlock)) upBlock = null
if (!street_lamps.includes(downBlock)) downBlock = null
if (!street_lamps.includes(frontBlock)) frontBlock = null
if (frontBlock && !upBlock && !downBlock) return { module: "wall", direction: direction }
if (upBlock && downBlock) {
return { module: "center", direction: direction }
} else if (upBlock) {
return { module: "bottom", direction: direction }
} else {
return { module: "top", direction: direction }
}
}
}