/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class BushComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.onTick = this.onTick.bind(this);
this.bushId = "lfg_ff:bush"
this.MaxPaintedBlocksOnce = 200
}
isEnabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).bush
}
vvOptimized() {
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
if (worldVVSetings == undefined) return false;
return worldVVSetings;
}
onTick(e) {
if (Math.random() < 0.8) return;
if (!this.isEnabled()) return;
const block = e.block;
const timeOfDay = world.getTimeOfDay()
const isNight = timeOfDay < 23200 && timeOfDay > 12800
if (this.getVariant(block) > 3 || this.getVariant(block) == 1) return;
system.runTimeout(() => {
try {
if (block && block.typeId == this.bushId)
if (this.getModule(block) == "ground_big") {
block.dimension.spawnParticle(isNight ? (this.vvOptimized() ? "lfg_ff:plant_lucioles_vv" : "lfg_ff:plant_lucioles") : (Math.random() > 0.4 ? "lfg_ff:butterfly_large" : "lfg_ff:plant_bee_large"), Vector.add(block.location, new Vector(0.5, 0.5, 0.5)))
} else {
block.dimension.spawnParticle(isNight ? (this.vvOptimized() ? "lfg_ff:plant_lucioles_vv" : "lfg_ff:plant_lucioles") : (Math.random() > 0.4 ? "lfg_ff:butterfly_small" : "lfg_ff:plant_bee_small"), Vector.add(block.location, new Vector(0.5, 0.5, 0.5)))
}
} catch { }
}, Math.floor(Math.random() * 5) * 20)
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
this.expendPaint(block, newVariant)
}
return;
}
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
system.runTimeout(() => {
this.updateAllbush(block)
}, 1)
}
isAnimated() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).animated_bush
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const placedFace = e.face;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
if (placedFace == "Down") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "roof_end")
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction, false))
}
else if (placedFace == "Up") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "ground_small")
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction, false))
}
else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall")
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction, true))
}
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:animated", this.isAnimated())
system.runTimeout(() => {
this.updateAllbush(block)
}, 1)
}
getPlacementVariant(block, direction, isWall) {
let adjacentPositions = ["up", "down"];
if (isWall)
adjacentPositions = ["left", "right", "up", "down"];
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
getNeighborBlock(block, direction, side, filterbushs) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterbushs)
return neighborBlock.typeId == this.bushId ? neighborBlock : null;
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
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
expendPaint(block, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const direction = this.getDirection(block)
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = block.above()
const downBlock = block.below()
const diagUpLeftBlock = this.getNeighborBlock(block.above(), direction, "left", true);
const diagDownLeftBlock = this.getNeighborBlock(block.below(), direction, "left", true);
const diagUpRightBlock = this.getNeighborBlock(block.above(), direction, "right", true);
const diagDownRightBlock = this.getNeighborBlock(block.below(), direction, "right", true);
const allbushs = [];
if (upBlock.typeId == this.bushId) allbushs.push(upBlock)
if (downBlock.typeId == this.bushId) allbushs.push(downBlock)
if (leftBlock && this.getModule(block) == "wall" && this.getModule(leftBlock) == "wall") allbushs.push(leftBlock)
if (rightBlock && this.getModule(block) == "wall" && this.getModule(rightBlock) == "wall") allbushs.push(rightBlock)
if (diagDownLeftBlock && this.getModule(block) == "wall" && this.getModule(diagDownLeftBlock) == "wall") allbushs.push(diagDownLeftBlock)
if (diagDownRightBlock && this.getModule(block) == "wall" && this.getModule(diagDownRightBlock) == "wall") allbushs.push(diagDownRightBlock)
if (diagUpLeftBlock && this.getModule(block) == "wall" && this.getModule(diagUpLeftBlock) == "wall") allbushs.push(diagUpLeftBlock)
if (diagUpRightBlock && this.getModule(block) == "wall" && this.getModule(diagUpRightBlock) == "wall") allbushs.push(diagUpRightBlock)
for (const expendedbush of allbushs) {
const expendedVariant = this.getVariant(expendedbush);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedbush.setPermutation(expendedbush.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedbush, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllbush(block) {
const upBlock = block.above()
const downBlock = block.below()
const allbushs = [];
if (upBlock.typeId == this.bushId) allbushs.push(upBlock)
if (downBlock.typeId == this.bushId) allbushs.push(downBlock)
if (block.typeId == this.bushId) allbushs.push(block)
for (const expendedbush of allbushs) {
const expUpBlock = expendedbush.above().typeId == this.bushId ? expendedbush.above() : null
const expDownBlock = expendedbush.below().typeId == this.bushId ? expendedbush.below() : null
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedbush);
expendedbush.setPermutation(expendedbush.permutation
.withState('lfg_ff:module', expNewModuleAndDir));
}
}
isNonSolidBlock(block) {
return block.isAir || ((block.typeId.includes("lava") || block.typeId.includes("water")) && block.typeId.startsWith("minecraft:"));
}
getUpdatedModuleAndDirection(upBlock, downBlock, block) {
const bushs = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
bushs.push(b)
})
if (!bushs.includes(upBlock)) upBlock = null
if (!bushs.includes(downBlock)) downBlock = null
if (this.getModule(block) == "wall") return "wall"
if (!upBlock && !downBlock) {
if (!this.isNonSolidBlock(block.above())) return "roof_end"
else return "ground_small"
}
if (upBlock && downBlock) {
if (this.getModule(upBlock).includes("roof") && this.getModule(downBlock).includes("roof")) {
return "roof_mid"
}
else if (this.getModule(upBlock).includes("ground") && this.getModule(downBlock).includes("ground")) {
return "ground_big"
}
else if (this.getModule(block).includes("ground")) {
return "ground_big"
}
else if (this.getModule(block).includes("roof")) {
return "roof_mid"
}
}
if (upBlock) {
if (this.getModule(upBlock).includes("roof")) {
return "roof_end"
}
else if (this.getModule(upBlock).includes("ground")) {
return "ground_big"
}
else if (this.getModule(block).includes("ground")) {
return "ground_big"
}
else if (this.getModule(block).includes("roof")) {
return "roof_end"
}
}
if (downBlock) {
if (this.getModule(downBlock).includes("roof")) {
return "roof_mid"
}
else if (this.getModule(downBlock).includes("ground")) {
return "ground_small"
}
else if (this.getModule(block).includes("ground")) {
return "ground_small"
}
else if (this.getModule(block).includes("roof")) {
return "roof_mid"
}
}
return this.getModule(block)
}
}