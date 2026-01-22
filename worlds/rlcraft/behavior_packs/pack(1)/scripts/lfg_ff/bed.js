/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class BedComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.bedId = "lfg_ff:bed"
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
if (handItem) {
if (["lfg_ff:variant_picker", "lfg_ff:debug_stick"].includes(handItem.typeId)) {
return
}
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const pillow = player.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
const viewDir = player.getViewDirection();
const pLoc = player.getHeadLocation();
const loc = pillow.location;
const pillowSize = { h: 0.65, l: 0.85 }
const minBounds = {
x: loc.x - pillowSize.l / 2,
y: loc.y,
z: loc.z - pillowSize.l / 2,
};
const maxBounds = {
x: loc.x + pillowSize.l / 2,
y: loc.y + pillowSize.h,
z: loc.z + pillowSize.l / 2,
};
const tMin = (minBounds.x - pLoc.x) / viewDir.x;
const tMax = (maxBounds.x - pLoc.x) / viewDir.x;
let t1 = Math.min(tMin, tMax);
let t2 = Math.max(tMin, tMax);
const tyMin = (minBounds.y - pLoc.y) / viewDir.y;
const tyMax = (maxBounds.y - pLoc.y) / viewDir.y;
t1 = Math.max(t1, Math.min(tyMin, tyMax));
t2 = Math.min(t2, Math.max(tyMin, tyMax));
const tzMin = (minBounds.z - pLoc.z) / viewDir.z;
const tzMax = (maxBounds.z - pLoc.z) / viewDir.z;
t1 = Math.max(t1, Math.min(tzMin, tzMax));
t2 = Math.min(t2, Math.max(tzMin, tzMax));
if (t1 <= t2 && t1 > 0) {
return;
}
}
const colorPickerMode = player.getDynamicProperty(`lfg_ff:${handItem.typeId.includes("small") ? "tvs" : "vs"}_color_brush_mode`) == 1
let newVariant = variant == 8 ? 1 : variant + 1
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
if (handItem.typeId == "lfg_ff:cushion") {
if (this.getModule(block).includes("head")) {
if (player.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:pillow_entity" }).length == 0) {
player.runCommand(`clear @s ${handItem.typeId} 0 1`)
const module = this.getModule(block).includes("king") ? "king" : this.getModule(block).includes("simple") ? "simple" : "double"
const entity = player.dimension.spawnEntity("lfg_ff:pillow_entity", this.adjustPillowLocation(direction, center, module))
entity.setProperty("lfg_ff:shape", 2)
entity.setProperty("lfg_ff:on_bed", true)
entity.setProperty("lfg_ff:rotation_y", this.getRotationFromDirection(direction));
entity.setRotation({ x: 0, y: this.getRotationFromDirection(direction) })
return;
}
}
}
}
if (block.dimension.id !== "minecraft:overworld") {
block.dimension.createExplosion(block.location, 3, { allowUnderwater: false, causesFire: true, breaksBlocks: true })
return;
}
const timeOfDay = world.getTimeOfDay()
if (timeOfDay < 23459 && timeOfDay > 12542) {
let seatEntity = null
let sleepBlock = null
if (block.permutation.getState("lfg_ff:module").includes("feet")) {
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
sleepBlock = frontBlock
player.teleport(Vector.add(this.getBlockCenter(frontBlock, this.getModule(frontBlock)), new Vector(0, 0.2, 0)))
} else {
sleepBlock = block
player.teleport(Vector.add(center, new Vector(0, 0.2, 0)))
}
player.runCommand(`inputpermission set @s movement disabled`)
player.playAnimation(`animation.lfg_ff.bed.player.sleeping.${this.getRotationFromDirection(this.getOppositeDirection(direction))}`)
player.runCommand(`camera @s fade time 3 0.2 0.5 `);
let spawnLoc = player.location
const candidates = [
block.north(),
block.south(),
block.east(),
block.west(),
]
for (const c of candidates) {
if (c.isAir && !c.below().isAir && c.above().isAir) {
spawnLoc = this.getBlockCenter(c, block.permutation.getState("lfg_ff:module"))
break;
}
}
player.setSpawnPoint({
dimension: player.dimension,
x: spawnLoc.x,
y: spawnLoc.y,
z: spawnLoc.z,
})
const camBlock = this.getBlockInDirection(sleepBlock, this.getDirection(sleepBlock))
const camFacingBlock = this.getBlockInDirection(sleepBlock, this.getOppositeDirection(this.getDirection(sleepBlock)))
player.runCommand(`camera @s set minecraft:free pos ${camBlock.location.x} ${camBlock.location.y + 2.5} ${camBlock.location.z} facing ${camFacingBlock.location.x} ${camFacingBlock.location.y + 2} ${camFacingBlock.location.z}`)
system.runTimeout(() => {
player.runCommand(`camera @s set minecraft:free ease 3 linear pos ${camBlock.location.x} ${camBlock.location.y + 2.5} ${camBlock.location.z} facing ${camFacingBlock.location.x} ${camFacingBlock.location.y - 1} ${camFacingBlock.location.z}`)
}, 5)
system.runTimeout(() => {
try {
} catch { }
player.runCommand(`inputpermission set @s movement enabled`)
world.setTimeOfDay(0)
player.runCommand(`camera @s clear`)
player.teleport(spawnLoc)
}, 62)
} else {
const playerRotation = player.getRotation().y;
const bedRotation = this.getRotationFromDirection(direction);
let rotationDifference = (playerRotation - bedRotation);
const seatEntity = player.dimension.spawnEntity("lfg_ff:bed_seat", center)
if (rotationDifference >= 0)
seatEntity.setRotation({ x: 0, y: this.getRotationFromDirection(this.getLeftDirection(direction)) })
else
seatEntity.setRotation({ x: 0, y: this.getRotationFromDirection(this.getRightDirection(direction)) })
seatEntity.getComponent("minecraft:rideable").addRider(player)
}
}
onPlayerBreak(e) {
const block = e.block
const player = e.player
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block, brokenBlockPermutation.getState("lfg_ff:module"))
if (brokenBlockPermutation.getState("lfg_ff:module").includes("feet")) {
const loc = this.getNeighborBlock(block, direction, "front", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
const seatEntity = block.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "front", false), brokenBlockPermutation.getState("lfg_ff:module")), maxDistance: 0.75, type: "lfg_ff:bed_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const pillow = player.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "front", false), brokenBlockPermutation.getState("lfg_ff:module")), maxDistance: 0.75, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
block.dimension.spawnItem(new ItemStack(`lfg_ff:cushion`, 1), center);
block.dimension.playSound("random.pop", center)
pillow.remove()
}
} else {
const loc = this.getNeighborBlock(block, direction, "back", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
const seatEntity = block.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "back", false), brokenBlockPermutation.getState("lfg_ff:module")), maxDistance: 0.75, type: "lfg_ff:bed_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const pillow = player.dimension.getEntities({ location: this.getBlockCenter(this.getNeighborBlock(block, direction, "back", false), brokenBlockPermutation.getState("lfg_ff:module")), maxDistance: 0.75, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
block.dimension.spawnItem(new ItemStack(`lfg_ff:cushion`, 1), center);
block.dimension.playSound("random.pop", center)
pillow.remove()
}
}
const seatEntity = block.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:bed_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const pillow = player.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
block.dimension.spawnItem(new ItemStack(`lfg_ff:cushion`, 1), center);
block.dimension.playSound("random.pop", center)
pillow.remove()
}
system.runTimeout(() => {
this.updateAllbed(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const player = e.player;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
let canPlace = false
if (this.getNeighborBlock(block, direction, "front", false).isAir && block.isAir) canPlace = true
if (!canPlace) {
e.cancel = true
return;
}
const bedPerm = this.getBedPermutation(block, direction, permutationToPlace)
e.permutationToPlace = bedPerm.first.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.run(() => {
this.getNeighborBlock(block, direction, "front", false).setPermutation(bedPerm.second.withState("lfg_ff:variant", this.getPlacementVariant(block, direction)))
if (!bedPerm.first.getState("lfg_ff:module").includes("top")) {
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(this.getNeighborBlock(block, direction, "front", false).location, new Vector(0.5, 0, 0.5)))
}
if (player.getGameMode() == "Survival")
player.runCommand(`clear @s ${permutationToPlace.type.id} 0 1`)
})
system.runTimeout(() => {
this.updateAllbed(block, direction)
}, 1)
const placementPerm = e.permutationToPlace
e.cancel = true
system.run(() => {
block.setPermutation(placementPerm)
block.dimension.playSound("dig.wood", block.location)
})
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down", "front", "back"];
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
getBedPermutation(block, direction, permutationToPlace) {
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allbeds = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allbeds.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allbeds.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allbeds.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allbeds.push(backBlock)
if (upBlock && this.getDirection(upBlock) == direction) allbeds.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) allbeds.push(downBlock)
if (!downBlock && !upBlock && !leftBlock && !rightBlock)
return { first: permutationToPlace.withState("lfg_ff:module", "simple_feet"), second: permutationToPlace.withState("lfg_ff:module", "simple_head") }
if (leftBlock && this.getModule(leftBlock) == "simple_feet") {
return { first: permutationToPlace.withState("lfg_ff:module", "king_feet_right"), second: permutationToPlace.withState("lfg_ff:module", "king_head_right") }
}
if (rightBlock && this.getModule(rightBlock) == "simple_feet") {
return { first: permutationToPlace.withState("lfg_ff:module", "king_feet_left"), second: permutationToPlace.withState("lfg_ff:module", "king_head_left") }
}
if (downBlock && this.getModule(downBlock) == "simple_feet") {
return { first: permutationToPlace.withState("lfg_ff:module", "top_feet"), second: permutationToPlace.withState("lfg_ff:module", "top_head") }
}
if (upBlock && this.getModule(upBlock) == "simple_feet") {
return { first: permutationToPlace.withState("lfg_ff:module", "bot_feet"), second: permutationToPlace.withState("lfg_ff:module", "bot_head") }
}
return { first: permutationToPlace.withState("lfg_ff:module", "simple_feet"), second: permutationToPlace.withState("lfg_ff:module", "simple_head") }
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
if (module.includes("top"))
return { x: b.location.x + 0.5, y: b.location.y + 1.05, z: b.location.z + 0.5 }
else
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterbed) {
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
if (filterbed)
return neighborBlock.typeId == this.bedId ? neighborBlock : null;
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
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allbeds = [];
if (leftBlock && this.getDirection(leftBlock) == direction && this.getModule(block).includes("right")) allbeds.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction && this.getModule(block).includes("left")) allbeds.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction && this.getModule(block).includes("feet")) allbeds.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction && this.getModule(block).includes("head")) allbeds.push(backBlock)
if (upBlock && this.getDirection(upBlock) == direction && this.getModule(upBlock).includes("top")) allbeds.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction && this.getModule(block).includes("top")) allbeds.push(downBlock)
for (const expendedbed of allbeds) {
const expendedVariant = this.getVariant(expendedbed);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedbed);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedbed.setPermutation(expendedbed.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedbed, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllbed(block, direction, updatedbedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedbedBlocks.has(blockLocationKey)) {
return;
}
updatedbedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allbeds = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allbeds.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allbeds.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allbeds.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allbeds.push(backBlock)
if (upBlock && this.getDirection(upBlock) == direction) allbeds.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) allbeds.push(downBlock)
for (const expendedbed of allbeds) {
const expDir = this.getDirection(expendedbed);
const expendedRightBlock = this.getNeighborBlock(expendedbed, expDir, "right", true);
const expendedLeftBlock = this.getNeighborBlock(expendedbed, expDir, "left", true);
const expendedDownBlock = this.getNeighborBlock(expendedbed, expDir, "down", true);
const expendedUpBlock = this.getNeighborBlock(expendedbed, expDir, "up", true);
const expNewModule = this.getUpdatedModuleAndDirection(expendedRightBlock, expendedLeftBlock, expendedDownBlock, expendedUpBlock, expDir, expendedbed);
expendedbed.setPermutation(expendedbed.permutation
.withState('lfg_ff:module', expNewModule));
try {
if (updatedbedBlocks.size <= 6)
this.updateAllbed(expendedbed, expDir, updatedbedBlocks);
} catch (e) {
}
}
}
getUpdatedModuleAndDirection(rightBlock, leftBlock, downBlock, upBlock, direction, block) {
const beds = []
const allBlocks = [rightBlock, leftBlock, downBlock, upBlock]
allBlocks.forEach((b) => {
if (!b) return;
beds.push(b)
})
if (!beds.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!beds.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!beds.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (!beds.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
const module = this.getModule(block)
if (leftBlock) {
if (this.getModule(leftBlock) == "king_feet_left") {
return "king_feet_right"
}
if (this.getModule(leftBlock) == "king_head_left") {
return "king_head_right"
}
}
if (rightBlock) {
if (this.getModule(rightBlock) == "king_feet_right") {
return "king_feet_left"
}
if (this.getModule(rightBlock) == "king_head_right") {
return "king_head_left"
}
}
if (downBlock) {
if ((this.getModule(downBlock) == "simple_feet" || this.getModule(downBlock) == "bot_feet") && module.includes("feet")) {
return "top_feet"
}
if ((this.getModule(downBlock) == "simple_head" || this.getModule(downBlock) == "bot_head") && module.includes("head")) {
return "top_head"
}
}
if (upBlock) {
if ((this.getModule(upBlock) == "simple_feet" || this.getModule(upBlock) == "top_feet") && module.includes("feet")) {
return "bot_feet"
}
if ((this.getModule(upBlock) == "simple_head" || this.getModule(upBlock) == "top_head") && module.includes("head")) {
return "bot_head"
}
}
if (module.includes('feet')) {
return "simple_feet"
}
if (module.includes('head')) {
return "simple_head"
}
}
adjustPillowLocation(direction, location, module) {
const newLocation = { ...location };
let offsetValue = module == "double" ? 0.25 : module == "king" ? 0.25 : 0.4;
switch (direction.toLowerCase()) {
case 'north':
newLocation.z -= offsetValue;
break;
case 'south':
newLocation.z += offsetValue;
break;
case 'east':
newLocation.x += offsetValue;
break;
case 'west':
newLocation.x -= offsetValue;
break;
default:
break;
}
return newLocation;
}
}