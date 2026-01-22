/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class BathTubComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.bath_tubId = "lfg_ff:bath_tub"
this.MaxPaintedBlocksOnce = 300
}
onPlayerInteract(e) {
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block, this.getModule(block))
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
const isBig = block.permutation.getState("lfg_ff:module").includes("double")
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
let bahtWaterLevelLoc = null
const waterRotation = this.getRotationFromDirection(direction)
if (block.permutation.getState("lfg_ff:module").includes("bot")) {
if (block.permutation.getState("lfg_ff:module").includes("left")) {
let rightBlock = block
bahtWaterLevelLoc = this.getBlockCenter(this.getNeighborBlock(rightBlock, direction, "front", false))
} else if (block.permutation.getState("lfg_ff:module").includes("right")) {
let leftBLock = this.getNeighborBlock(block, direction, "left", false)
bahtWaterLevelLoc = this.getBlockCenter(this.getNeighborBlock(leftBLock, direction, "front", false))
} else {
bahtWaterLevelLoc = this.getBlockCenter(this.getNeighborBlock(block, direction, "front", false))
}
}
if (block.permutation.getState("lfg_ff:module").includes("top")) {
if (block.permutation.getState("lfg_ff:module").includes("left")) {
let rightBlock = block
bahtWaterLevelLoc = this.getBlockCenter(rightBlock)
} else if (block.permutation.getState("lfg_ff:module").includes("right")) {
let leftBLock = this.getNeighborBlock(block, direction, "left", false)
bahtWaterLevelLoc = this.getBlockCenter(leftBLock)
} else {
bahtWaterLevelLoc = this.getBlockCenter(block)
}
}
if (handItem.typeId == "minecraft:water_bucket" && bahtWaterLevelLoc !== null) {
const isshowerEntity = block.dimension.getEntities({ location: bahtWaterLevelLoc, maxDistance: 0.75, type: "lfg_ff:bath_water_level" })[0]
if (!isshowerEntity) {
const showerEntity = player.dimension.spawnEntity("lfg_ff:bath_water_level", bahtWaterLevelLoc)
showerEntity.setProperty("lfg_ff:rotation_y", waterRotation)
showerEntity.setProperty("lfg_ff:big", isBig)
showerEntity.setProperty("lfg_ff:filled", true)
return
}
}
if (handItem.typeId == "minecraft:bucket" && bahtWaterLevelLoc !== null) {
const showerEntity = block.dimension.getEntities({ location: bahtWaterLevelLoc, maxDistance: 0.75, type: "lfg_ff:bath_water_level" })[0]
if (showerEntity) {
showerEntity.setProperty("lfg_ff:filled", false)
system.runTimeout(() => {
try {
showerEntity.remove()
} catch { }
}, 1.6 * 20)
return
}
}
}
if (this.getModule(block) == "shower") {
const showerEntity = block.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:shower_entity" })[0]
if (showerEntity) {
showerEntity.remove()
} else {
const showerEntity = player.dimension.spawnEntity("lfg_ff:shower_entity", center)
}
} else {
const seatEntity = player.dimension.spawnEntity(isBig ? "lfg_ff:jacuzi_seat" : "lfg_ff:bath_tub_seat", center)
seatEntity.setRotation({ x: 0, y: 0 })
seatEntity.getComponent("minecraft:rideable").addRider(player)
}
}
onPlayerBreak(e) {
const block = e.block
const player = e.player
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block, brokenBlockPermutation.getState("lfg_ff:module"))
if (brokenBlockPermutation.getState("lfg_ff:module").includes("shower")) {
const showerEntity = block.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:shower_entity" })[0]
if (showerEntity) {
showerEntity.remove()
}
return;
}
if (brokenBlockPermutation.getState("lfg_ff:module").includes("bot")) {
const loc = this.getNeighborBlock(block, direction, "front", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
const seatEntity = block.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "front", false), brokenBlockPermutation.getState("lfg_ff:module")), maxDistance: 0.75, type: "lfg_ff:bath_tub_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const bathWaterLevelEntity = block.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "front", false)), maxDistance: 0.75, type: "lfg_ff:bath_water_level" })[0]
if (bathWaterLevelEntity) {
bathWaterLevelEntity.remove()
}
}
if (brokenBlockPermutation.getState("lfg_ff:module").includes("top")) {
const loc = this.getNeighborBlock(block, direction, "back", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
const seatEntity = block.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "back", false), brokenBlockPermutation.getState("lfg_ff:module")), maxDistance: 0.75, type: "lfg_ff:bath_tub_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const bathWaterLevelEntity = block.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "back", false)), maxDistance: 0.75, type: "lfg_ff:bath_water_level" })[0]
if (bathWaterLevelEntity) {
bathWaterLevelEntity.remove()
}
}
const seatEntity = block.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:bath_tub_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const bathWaterLevelEntity = block.dimension.getEntities({ location: center, maxDistance: 1.75, type: "lfg_ff:bath_water_level" })[0]
if (bathWaterLevelEntity) {
bathWaterLevelEntity.remove()
}
system.runTimeout(() => {
this.updateAllbath_tub(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const player = e.player;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placedFace = e.face;
if (placedFace == "Down" || placedFace == "Up") {
let canPlace = false
if (this.getNeighborBlock(block, direction, "front", false).isAir && block.isAir) canPlace = true
if (!canPlace) {
e.cancel = true
return;
}
const bath_tubPerm = this.getbath_tubPermutation(block, direction, permutationToPlace)
e.permutationToPlace = bath_tubPerm.first.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.run(() => {
this.getNeighborBlock(block, direction, "front", false).setPermutation(bath_tubPerm.second.withState("lfg_ff:variant", this.getPlacementVariant(block, direction)))
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(this.getNeighborBlock(block, direction, "front", false).location, new Vector(0.5, 0, 0.5)))
if (player.getGameMode() == "Survival")
player.runCommand(`clear @s ${permutationToPlace.type.id} 0 1`)
})
system.runTimeout(() => {
const center = this.getBlockCenter(block)
const bathWaterLevelEntity = block.dimension.getEntities({ location: center, maxDistance: 1.75, type: "lfg_ff:bath_water_level" })[0]
if (bathWaterLevelEntity) {
bathWaterLevelEntity.remove()
}
this.updateAllbath_tub(block, direction)
}, 1)
} else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "shower")
system.run(() => {
if (player.getGameMode() == "Survival")
player.runCommand(`clear @s ${permutationToPlace.type.id} 0 1`)
})
}
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
const placementPerm = e.permutationToPlace
e.cancel = true
system.run(() => {
block.setPermutation(placementPerm)
block.dimension.playSound("place.copper_bulb", block.location)
})
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
getbath_tubPermutation(block, direction, permutationToPlace) {
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allbath_tubs = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allbath_tubs.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allbath_tubs.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allbath_tubs.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allbath_tubs.push(backBlock)
if (!leftBlock && !rightBlock)
return { first: permutationToPlace.withState("lfg_ff:module", "bot"), second: permutationToPlace.withState("lfg_ff:module", "top") }
if (leftBlock && this.getModule(leftBlock) == "bot") {
return { first: permutationToPlace.withState("lfg_ff:module", "double_bot_right"), second: permutationToPlace.withState("lfg_ff:module", "double_top_right") }
}
if (rightBlock && this.getModule(rightBlock) == "bot") {
return { first: permutationToPlace.withState("lfg_ff:module", "double_bot_left"), second: permutationToPlace.withState("lfg_ff:module", "double_top_left") }
}
return { first: permutationToPlace.withState("lfg_ff:module", "bot"), second: permutationToPlace.withState("lfg_ff:module", "top") }
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
getBlockCenter(b, module) {
return { x: b.location.x + 0.5, y: b.location.y + 0.3, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterbath_tub) {
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
if (filterbath_tub)
return neighborBlock.typeId == this.bath_tubId ? neighborBlock : null;
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
getInvertedDirection(direction) {
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
const allbath_tubs = [];
if (leftBlock && this.getDirection(leftBlock) == direction && this.getModule(block).includes("right")) allbath_tubs.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction && this.getModule(block).includes("left")) allbath_tubs.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction && this.getModule(block).includes("bot")) allbath_tubs.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction && this.getModule(block).includes("top")) allbath_tubs.push(backBlock)
for (const expendedbath_tub of allbath_tubs) {
const expendedVariant = this.getVariant(expendedbath_tub);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedbath_tub);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedbath_tub.setPermutation(expendedbath_tub.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedbath_tub, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllbath_tub(block, direction, updatedbath_tubBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedbath_tubBlocks.has(blockLocationKey)) {
return;
}
updatedbath_tubBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allbath_tubs = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allbath_tubs.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allbath_tubs.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allbath_tubs.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allbath_tubs.push(backBlock)
for (const expendedbath_tub of allbath_tubs) {
const expDir = this.getDirection(expendedbath_tub);
const expendedRightBlock = this.getNeighborBlock(expendedbath_tub, expDir, "right", true);
const expendedLeftBlock = this.getNeighborBlock(expendedbath_tub, expDir, "left", true);
const expendedFrontBlock = this.getNeighborBlock(expendedbath_tub, expDir, "front", true);
const expendedBackBlock = this.getNeighborBlock(expendedbath_tub, expDir, "back", true);
const expNewModule = this.getUpdatedModuleAndDirection(expendedRightBlock, expendedLeftBlock, expendedFrontBlock, expendedBackBlock, expDir, expendedbath_tub);
expendedbath_tub.setPermutation(expendedbath_tub.permutation
.withState('lfg_ff:module', expNewModule.module)
.withState('minecraft:cardinal_direction', expNewModule.direction));
try {
if (updatedbath_tubBlocks.size <= 6) {
this.updateAllbath_tub(expendedbath_tub, expDir, updatedbath_tubBlocks);
}
} catch (e) {
}
}
}
getUpdatedModuleAndDirection(rightBlock, leftBlock, frontBlock, backBlock, direction, block) {
const bath_tubs = []
const allBlocks = [rightBlock, leftBlock, frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
bath_tubs.push(b)
})
if (!bath_tubs.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!bath_tubs.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!bath_tubs.includes(frontBlock) || this.getDirection(frontBlock) !== direction) frontBlock = null
if (!bath_tubs.includes(backBlock) || this.getDirection(backBlock) !== direction) backBlock = null
const module = this.getModule(block)
if (leftBlock) {
if (this.getModule(leftBlock) == "double_bot_left") {
return { module: "double_bot_right", direction: direction }
}
if (this.getModule(leftBlock) == "double_top_left") {
return { module: "double_top_right", direction: direction }
}
}
if (rightBlock) {
if (this.getModule(rightBlock) == "double_bot_right") {
return { module: "double_bot_left", direction: direction }
}
if (this.getModule(rightBlock) == "double_top_right") {
return { module: "double_top_left", direction: direction }
}
}
if (module.includes('bot')) {
return { module: "bot", direction: direction }
}
if (module.includes('top')) {
return { module: "top", direction: direction }
}
}
}