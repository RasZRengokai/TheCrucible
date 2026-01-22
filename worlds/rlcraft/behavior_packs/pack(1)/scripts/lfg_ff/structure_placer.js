/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class StructurePlacerComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.blockId = "lfg_ff:structure_placer_block"
this.entityId = "lfg_ff:structure_placer"
this.houseStructures = [
{ id: "modern_house_1", name: "Modern House 1", height: 16 },
{ id: "modern_house_2", name: "Modern House 2", height: 16 },
{ id: "contemporary_house_1", name: "Contemporary House 1", height: 16 },
{ id: "contemporary_house_2", name: "Contemporary House 2", height: 20 },
{ id: "japanese_house_1", name: "Japanese House 1", height: 35 },
{ id: "japanese_house_2", name: "Japanese House 2", height: 22 },
{ id: "medieval_house_1", name: "Medieval House 1", height: 21 },
{ id: "medieval_house_2", name: "Medieval House 2", height: 31 },
{ id: "farmhouse_1", name: "Farmhouse 1", height: 16 },
{ id: "farmhouse_2", name: "Farmhouse 2", height: 20 },
{ id: "provencal_house_1", name: "Provencal House 1", height: 29 },
{ id: "provencal_house_2", name: "Provencal House 2", height: 18 },
{ id: "french_manor", name: "French Manor", height: 35 },
{ id: "french_manor_garden", name: "French Manor Garden", height: 10 },
{ id: "sunhouse_1", name: "Sunhouse 1", height: 31 },
{ id: "sunhouse_2", name: "Sunhouse 2", height: 21 },
{ id: "haunted_manor", name: "§vHaunted Manor", height: 31 },
{ id: "vampire_castle", name: "§vVampire Castle", height: 75 },
{ id: "parisian_building_1", name: "Parisian Building 1", height: 43 },
{ id: "parisian_building_2", name: "Parisian Building 2", height: 46 },
{ id: "lofi_girl_apartment_lyon", name: "§2Lofi Girl Apartment (Lyon)", height: 45 },
{ id: "lofi_girl_vacation_house_japan", name: "§2Lofi Girl Vacation House (Japan)", height: 25 },
{ id: "winter_cabin", name: "§4Winter Cabin", height: 19 },
{ id: "christmas_street", name: "§4Christmas Street", height: 26 },
];
}
onPlayerInteract(e) {
const block = e.block;
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const blueprintActive = block.permutation.getState('lfg_ff:blueprint_active');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
const idList = this.houseStructures.map(h => h.id)
const nameList = this.houseStructures.map(h => h.name)
if (!blueprintActive) {
const placerUI = new ActionFormData()
.title("Structure Placer")
.body("\nSelect the house blueprint you want to place:\n\n")
idList.forEach((id, index) => {
placerUI.button(nameList[index], `textures/lfg_ff/lfg_ff/ui/${id}`)
})
player.playSound("random.click", player.location)
placerUI.show(player).then(r => {
if (r.canceled) return;
const houseIndex = r.selection
this.placeBluePrint(houseIndex, block, player)
block.setPermutation(block.permutation.withState("lfg_ff:blueprint_active", true))
})
return;
} else {
const entity = this.getEntity(block)
if (!entity) return;
const houseIndex = entity.getProperty("lfg_ff:id_index")
const placerUI = new ActionFormData()
.title("Structure Placer")
.body(`§9${nameList[houseIndex]}:§r\n\nFirst, add all craft resources to the drawer.\n\n`)
.button("Remove Blueprint", "textures/lfg_ff/lfg_ff/ui/no")
.button("Rotate Blueprint", "textures/lfg_ff/lfg_ff/ui/rotate")
.button("Craft Structure", "textures/lfg_ff/lfg_ff/ui/yes")
player.playSound("random.click", player.location)
placerUI.show(player).then(r => {
if (r.canceled) return;
if (r.selection == 0) this.removeBlueprint(block)
if (r.selection == 1) this.rotateStructure(block)
if (r.selection == 2) this.craftStructure(block, player)
})
return;
}
}
getStructurePlacementLoc(block, houseIndex) {
const direction = this.getDirection(block)
const structureCenter = this.getBlockInDirection(block.below(), direction, 17)
const height = this.houseStructures.map(h => h.height)[houseIndex]
const selec = { corner1: Vector.add(structureCenter, new Vector(-16, 1, -16)), corner2: Vector.add(structureCenter, new Vector(15, height, 15)) }
return { selec, center: structureCenter };
}
placeBluePrint(houseIndex, block, player) {
const entity = this.getEntity(block)
if (!entity) return;
const idList = this.houseStructures.map(h => h.id)
const nameList = this.houseStructures.map(h => h.name)
entity.setProperty("lfg_ff:id_index", houseIndex)
entity.setProperty("lfg_ff:blueprint_active", true)
entity.setProperty("lfg_ff:can_craft", false)
const { selec, center } = this.getStructurePlacementLoc(block, houseIndex)
const height = this.houseStructures.map(h => h.height)[houseIndex]
const pRot = this.getBlueprintEntityRotations(this.getDirection(block))
const bluePrintEntity = block.dimension.spawnEntity("lfg_ff:structure_blueprint", center)
bluePrintEntity.setProperty("lfg_ff:placement_rotation", pRot)
entity.setProperty("lfg_ff:placement_rotation", pRot)
bluePrintEntity.setProperty("lfg_ff:height", height)
bluePrintEntity.setProperty("lfg_ff:id_index", houseIndex)
this.lockBlueprint(bluePrintEntity, center)
}
isAtCorrectHeight(pLocY, height, dim) {
if (dim.id == "minecraft:overworld") {
if (pLocY <= -60) return false;
if ((pLocY + height) >= 319) return false;
} else if (dim.id == "minecraft:nether") {
if (pLocY <= 4) return false;
if ((pLocY + height) >= 122) return false;
} if (dim.id == "minecraft:the_end") {
return false;
}
return true;
}
craftStructure(block, player) {
const entity = this.getEntity(block)
if (!entity) return;
if (!entity.getProperty("lfg_ff:blueprint_active")) return;
if (!entity.getProperty("lfg_ff:can_craft") && player.getGameMode() !== "Creative") {
player.sendMessage("§cMissing resources. Please add all craft resources to the drawer.")
player.playSound("note.bass", player.location)
return;
}
const idList = this.houseStructures.map(h => h.id)
const nameList = this.houseStructures.map(h => h.name)
const houseIndex = entity.getProperty("lfg_ff:id_index")
const houseId = idList[houseIndex]
const { selec, center } = this.getStructurePlacementLoc(block, houseIndex)
const pLoc = selec.corner1
const height = this.houseStructures.map(h => h.height)[houseIndex]
let currentRot = entity.getProperty("lfg_ff:placement_rotation")
if (this.isVersion1_1(houseId)) {
const rotMap = {
0: 180,
90: 270,
180: 0,
270: 90
};
currentRot = rotMap[currentRot];
}
if (this.isVersion1_2(houseId)) {
const rotMap = {
0: 90,
90: 180,
180: 270,
270: 0
};
currentRot = rotMap[currentRot];
}
const animTime = height / 2
const pLocY = houseId == "modern_house_2" ? (pLoc.y - 3) : houseId == "haunted_manor" ? (pLoc.y - 8) : this.isVersion1_1(houseId) ? (pLoc.y - 2) : (pLoc.y - 2)
if (!this.isAtCorrectHeight(pLocY, height, player.dimension)) {
if (player.dimension.id == "minecraft:the_end") {
player.sendMessage("§cInvalid dimension. Structures cannot be placed in the End.");
} else {
player.sendMessage("§cInvalid placement height. Please make sure the structure fits entirely within the limits of the world.");
}
player.playSound("note.bass", player.location)
return;
}
entity.dimension.runCommand(`structure load lfg_ff:${houseId} ${pLoc.x} ${pLocY} ${pLoc.z} ${currentRot}_degrees none layer_by_layer ${animTime} true true true`)
this.clearRequiredResources(entity)
for (let i = 0; i < height; i++) {
system.runTimeout(() => {
block.dimension.playSound("break.calcite", block.location, { volume: 20 })
block.dimension.playSound("break.wood", block.location, { volume: 20 })
block.dimension.playSound("dig.stone", block.location, { volume: 20 })
if (i == height - 1) {
system.runTimeout(() => {
if (houseId == "haunted_manor")
selec.corner1.y = selec.corner1.y - 8
this.rotateEntitiesOnLoad(entity, selec, currentRot)
}, 10)
}
}, 10 * i)
}
system.runTimeout(() => {
block.dimension.playSound("lfg_ff:structure_placer_construct", block.location, { volume: 20 })
this.removeBlueprintOnLoad(block)
}, 20 * animTime)
block.setPermutation(block.permutation.withState("lfg_ff:blueprint_active", false))
entity.setProperty("lfg_ff:blueprint_active", false)
}
rotateEntitiesOnLoad(entity, selec, currentRot) {
const interval = system.runInterval(() => {
if (!entity.isValid) return
try {
const test = entity.location
} catch {
return;
}
const res = this.rotateEntitiesInBox(entity.dimension, selec.corner1, selec.corner2, currentRot);
system.clearRun(interval)
}, 20)
}
removeBlueprintOnLoad(block) {
const interval = system.runInterval(() => {
if (!block.isValid) return
try {
const test = block.location
} catch {
return;
}
this.removeBlueprint(block)
system.clearRun(interval)
}, 20)
}
lockBlueprint(entity, loc) {
const interval = system.runInterval(() => {
if (!entity.isValid) {
system.clearRun(interval)
return;
}
try {
const test = entity.location
} catch {
return;
}
entity.teleport(loc)
}, 1)
}
isVersion1_1(houseId) {
const updateHouses = [
"provencal_house_1",
"provencal_house_2",
"french_manor",
"french_manor_garden",
"sunhouse_1",
"sunhouse_2",
"haunted_manor",
"vampire_castle",
"parisian_building_1",
"parisian_building_2",
"lofi_girl_apartment_lyon",
"lofi_girl_vacation_house_japan",
]
return updateHouses.includes(houseId)
}
isVersion1_2(houseId) {
const updateHouses = [
"winter_cabin",
"christmas_street",
]
return updateHouses.includes(houseId)
}
normalizeDeg(angle) {
let a = ((angle + 180) % 360 + 360) % 360 - 180;
if (a === -180) a = 180;
return a;
}
getStoredYaw(entity) {
const v = entity.getProperty("lfg_ff:rotation_y");
if (typeof v === "number") return v;
if (typeof v === "string") {
const n = Number(v);
if (!Number.isNaN(n)) return n;
}
return undefined;
}
setStoredYaw(entity, yaw) {
const norm = this.normalizeDeg(yaw);
const STORAGE_TYPES = new Set([
"lfg_ff:kitchen_storage",
"lfg_ff:bin",
"lfg_ff:structure_placer",
"lfg_ff:letterbox",
"lfg_ff:fridge",
"lfg_ff:oven",
"lfg_ff:wardrobe"
]);
entity.setProperty("lfg_ff:rotation_y", norm);
system.runTimeout(() => {
if (STORAGE_TYPES.has(entity.typeId)) {
entity.setRotation({ x: entity.getRotation().x, y: norm })
entity.runCommand(`scriptevent ${entity.typeId}_box_selection`)
}
}, 20)
}
getEntitiesInAABB(dimension, cornerA, cornerB) {
const minX = Math.min(cornerA.x, cornerB.x);
const maxX = Math.max(cornerA.x, cornerB.x);
const minY = Math.min(cornerA.y, cornerB.y);
const maxY = Math.max(cornerA.y, cornerB.y);
const minZ = Math.min(cornerA.z, cornerB.z);
const maxZ = Math.max(cornerA.z, cornerB.z);
const center = {
x: (minX + maxX) / 2,
y: (minY + maxY) / 2,
z: (minZ + maxZ) / 2,
};
const dx = (maxX - minX) / 2, dy = (maxY - minY) / 2, dz = (maxZ - minZ) / 2;
const radius = Math.sqrt(dx * dx + dy * dy + dz * dz);
const candidates = dimension.getEntities({ location: center, maxDistance: radius });
return candidates.filter(e => {
const p = e.location;
return p.x >= minX && p.x <= maxX &&
p.y >= minY && p.y <= maxY &&
p.z >= minZ && p.z <= maxZ;
});
}
rotateEntitiesInBox(dimension, cornerA, cornerB, currentRot) {
const offsetMap = {
0: 0,
90: +90,
180: +180,
270: -90
};
const offset = offsetMap[currentRot];
if (offset === undefined) {
}
const ents = this.getEntitiesInAABB(dimension, cornerA, cornerB);
let updated = 0;
for (const ent of ents) {
const prev = this.getStoredYaw(ent);
if (prev === undefined) continue;
const next = this.normalizeDeg(prev + offset);
this.setStoredYaw(ent, next);
updated++;
}
return { scanned: ents.length, updated };
}
rotateStructure(block) {
const entity = this.getEntity(block)
if (!entity) return;
if (!entity.getProperty("lfg_ff:blueprint_active")) return;
const currentRot = entity.getProperty("lfg_ff:placement_rotation")
let newRot = currentRot == 270 ? 0 : currentRot + 90
entity.setProperty("lfg_ff:placement_rotation", newRot)
const houseIndex = entity.getProperty("lfg_ff:id_index")
const { selec, center } = this.getStructurePlacementLoc(block, houseIndex)
const bluePrintEntity = block.dimension.getEntities({ location: center, maxDistance: 1, type: "lfg_ff:structure_blueprint" })[0]
if (!bluePrintEntity) return;
block.dimension.playSound("vr.stutterturn", block.location)
bluePrintEntity.setProperty("lfg_ff:placement_rotation", newRot)
}
removeBlueprint(block) {
const entity = this.getEntity(block)
if (!entity) return;
const houseIndex = entity.getProperty("lfg_ff:id_index")
const { selec, center } = this.getStructurePlacementLoc(block, houseIndex)
const bluePrintEntity = block.dimension.getEntities({ location: center, maxDistance: 1, type: "lfg_ff:structure_blueprint" })[0]
if (!bluePrintEntity) return;
bluePrintEntity.remove()
block.setPermutation(block.permutation.withState("lfg_ff:blueprint_active", false))
entity.setProperty("lfg_ff:blueprint_active", false)
}
clearRequiredResources(sourceEntity) {
const houseIndex = sourceEntity.getProperty("lfg_ff:id_index");
const costTab = HouseCost[houseIndex];
const inv = sourceEntity.getComponent('inventory').container;
if (!inv) return;
const requiredResources = new Map();
for (const { item, amount } of costTab) {
requiredResources.set(item, amount);
}
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (!item) continue;
const requiredAmount = requiredResources.get(item.typeId);
if (!requiredAmount) continue;
const removeAmount = Math.min(item.amount, requiredAmount);
if (item.amount > removeAmount) {
item.amount -= removeAmount;
inv.setItem(i, item);
} else {
inv.setItem(i, null);
}
requiredResources.set(item.typeId, requiredAmount - removeAmount);
if (requiredResources.get(item.typeId) <= 0) {
requiredResources.delete(item.typeId);
}
if (requiredResources.size === 0) break;
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const placerEntity = this.getEntity(block)
if (placerEntity) {
const structureCenter = this.getBlockInDirection(block.below(), direction, 17)
const bluePrintEntity = block.dimension.getEntities({ location: structureCenter, maxDistance: 1, type: "lfg_ff:structure_blueprint" })[0]
if (bluePrintEntity) bluePrintEntity.remove()
const inv = placerEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
placerEntity.dimension.spawnItem(item, Vector.add(placerEntity.location, new Vector(0, 0.5, 0)))
}
placerEntity.remove()
}
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placementPerm = permutationToPlace.withState("lfg_ff:is_placed", true)
system.run(() => {
block.setPermutation(placementPerm)
const loc = block.location
const placerRotationY = this.getPlacerEntityRotations(direction)
const spawnedplacerEntity = block.dimension.spawnEntity(this.entityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedplacerEntity.setRotation({ x: 0, y: placerRotationY })
spawnedplacerEntity.setProperty("lfg_ff:rotation_y", placerRotationY);
})
}
getBlueprintEntityRotations(dir) {
let rotationY = 0;
switch (dir) {
case 'north':
rotationY = 90;
break;
case 'south':
rotationY = 270;
break;
case 'east':
rotationY = 180;
break;
case 'west':
rotationY = 0;
break;
}
return rotationY;
}
getPlacerEntityRotations(dir) {
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
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
getBlock(entity) {
const block = entity.dimension.getBlock(Vector.add(entity.location, new Vector(0, 0.2, 0)))
if (block && block.typeId == this.blockId) return block;
return null;
}
getEntity(block) {
const entity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.entityId })[0]
if (entity) return entity;
return null;
}
getBlockInDirection(block, direction, distance) {
switch (direction) {
case 'north':
return block.north(distance);
case 'south':
return block.south(distance);
case 'east':
return block.east(distance);
case 'west':
return block.west(distance);
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
}
const HouseCost = [
[
{ item: "minecraft:light_gray_concrete", amount: 832 },
{ item: "lfg_ff:window_frame", amount: 256 },
{ item: "lfg_ff:fence", amount: 32 },
{ item: "lfg_ff:beam", amount: 32 },
{ item: "lfg_ff:floor", amount: 448 },
{ item: "lfg_ff:bush", amount: 32 },
],
[
{ item: "minecraft:white_concrete", amount: 832 },
{ item: "lfg_ff:window_frame", amount: 256 },
{ item: "lfg_ff:fence", amount: 32 },
{ item: "lfg_ff:beam", amount: 16 },
{ item: "lfg_ff:floor", amount: 448 },
{ item: "lfg_ff:bush", amount: 32 },
],
[
{ item: "lfg_ff:wall", amount: 512 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:fence", amount: 16 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:bush", amount: 32 },
],
[
{ item: "lfg_ff:wall", amount: 832 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:beam", amount: 16 },
{ item: "lfg_ff:floor", amount: 448 },
{ item: "lfg_ff:bush", amount: 64 },
],
[
{ item: "lfg_ff:wall", amount: 512 },
{ item: "lfg_ff:window_frame", amount: 32 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:beam", amount: 32 },
{ item: "lfg_ff:floor", amount: 64 },
{ item: "lfg_ff:bush", amount: 16 },
],
[
{ item: "lfg_ff:wall", amount: 256 },
{ item: "lfg_ff:window_frame", amount: 16 },
{ item: "lfg_ff:roof", amount: 64 },
{ item: "lfg_ff:beam", amount: 64 },
{ item: "lfg_ff:floor", amount: 64 },
{ item: "lfg_ff:bush", amount: 128 },
],
[
{ item: "lfg_ff:wall", amount: 256 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:beam", amount: 64 },
{ item: "lfg_ff:floor", amount: 32 },
{ item: "lfg_ff:bush", amount: 32 },
],
[
{ item: "lfg_ff:wall", amount: 512 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:beam", amount: 64 },
{ item: "lfg_ff:floor", amount: 32 },
{ item: "lfg_ff:bush", amount: 32 },
],
[
{ item: "lfg_ff:wall", amount: 512 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:fence", amount: 64 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:bush", amount: 64 },
],
[
{ item: "lfg_ff:wall", amount: 256 },
{ item: "lfg_ff:window_frame", amount: 32 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:beam", amount: 32 },
{ item: "lfg_ff:floor", amount: 128 },
{ item: "lfg_ff:bush", amount: 64 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 512 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:door", amount: 32 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:beam", amount: 64 },
{ item: "lfg_ff:floor", amount: 128 },
{ item: "lfg_ff:bush", amount: 64 },
{ item: "lfg_ff:exterior_floor", amount: 128 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 256 },
{ item: "lfg_ff:window_frame", amount: 32 },
{ item: "lfg_ff:door", amount: 16 },
{ item: "lfg_ff:roof", amount: 128 },
{ item: "lfg_ff:beam", amount: 16 },
{ item: "lfg_ff:floor", amount: 64 },
{ item: "lfg_ff:bush", amount: 64 },
{ item: "lfg_ff:exterior_floor", amount: 256 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 320 },
{ item: "lfg_ff:wall", amount: 320 },
{ item: "lfg_ff:pillar", amount: 64 },
{ item: "lfg_ff:window_frame", amount: 128 },
{ item: "lfg_ff:door", amount: 64 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:fence", amount: 64 },
{ item: "lfg_ff:exterior_floor", amount: 32 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 48 },
{ item: "lfg_ff:pillar", amount: 32 },
{ item: "lfg_ff:window_frame", amount: 16 },
{ item: "lfg_ff:fence", amount: 16 },
{ item: "lfg_ff:roof", amount: 32 },
{ item: "lfg_ff:beam", amount: 32 },
{ item: "lfg_ff:exterior_floor", amount: 384 },
{ item: "lfg_ff:bush", amount: 64 },
{ item: "lfg_ff:better_leaves", amount: 64 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 256 },
{ item: "lfg_ff:pillar", amount: 64 },
{ item: "lfg_ff:flower_pot", amount: 32 },
{ item: "lfg_ff:door", amount: 128 },
{ item: "lfg_ff:roof", amount: 384 },
{ item: "lfg_ff:beam", amount: 32 },
{ item: "lfg_ff:bush", amount: 64 },
{ item: "lfg_ff:exterior_floor", amount: 32 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 256 },
{ item: "lfg_ff:pillar", amount: 128 },
{ item: "lfg_ff:street_lamp", amount: 16 },
{ item: "lfg_ff:door", amount: 128 },
{ item: "lfg_ff:roof", amount: 320 },
{ item: "lfg_ff:floor", amount: 32 },
{ item: "lfg_ff:fence", amount: 32 },
{ item: "lfg_ff:exterior_floor", amount: 64 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 256 },
{ item: "lfg_ff:wall", amount: 128 },
{ item: "lfg_ff:pillar", amount: 64 },
{ item: "lfg_ff:window_frame", amount: 128 },
{ item: "lfg_ff:door", amount: 128 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:fence", amount: 128 },
{ item: "lfg_ff:exterior_floor", amount: 128 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 896 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:floor", amount: 192 },
{ item: "lfg_ff:pillar", amount: 128 },
{ item: "lfg_ff:arch_block", amount: 128 },
{ item: "lfg_ff:beam", amount: 128 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 896 },
{ item: "lfg_ff:roof", amount: 192 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:fence", amount: 64 },
{ item: "lfg_ff:window_frame", amount: 192 },
{ item: "lfg_ff:wall", amount: 128 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 768 },
{ item: "lfg_ff:pillar", amount: 128 },
{ item: "lfg_ff:roof", amount: 192 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:fence", amount: 64 },
{ item: "lfg_ff:window_frame", amount: 192 },
{ item: "lfg_ff:wall", amount: 128 },
],
[
{ item: "lfg_ff:split_wall", amount: 896 },
{ item: "lfg_ff:roof", amount: 192 },
{ item: "lfg_ff:floor", amount: 256 },
{ item: "lfg_ff:door", amount: 64 },
{ item: "lfg_ff:window_frame", amount: 192 },
{ item: "lfg_ff:wall", amount: 128 },
],
[
{ item: "lfg_ff:door", amount: 192 },
{ item: "lfg_ff:table", amount: 64 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:beam", amount: 32 },
{ item: "lfg_ff:floor", amount: 128 },
{ item: "lfg_ff:exterior_floor", amount: 192 },
{ item: "lfg_ff:bush", amount: 64 },
{ item: "lfg_ff:better_leaves", amount: 64 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 512 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:split_wall", amount: 128 },
{ item: "lfg_ff:roof", amount: 256 },
{ item: "lfg_ff:fence", amount: 64 },
{ item: "lfg_ff:garland", amount: 64 },
{ item: "lfg_ff:floor", amount: 128 },
{ item: "lfg_ff:bush", amount: 32 },
{ item: "lfg_ff:exterior_floor", amount: 128 },
],
[
{ item: "lfg_ff:exterior_wall", amount: 320 },
{ item: "lfg_ff:window_frame", amount: 64 },
{ item: "lfg_ff:split_wall", amount: 384 },
{ item: "lfg_ff:roof", amount: 320 },
{ item: "lfg_ff:pillar", amount: 64 },
{ item: "lfg_ff:garland", amount: 128 },
{ item: "lfg_ff:floor", amount: 128 },
{ item: "lfg_ff:bush", amount: 32 },
{ item: "lfg_ff:exterior_floor", amount: 256 },
],
]
system.afterEvents.scriptEventReceive.subscribe((data) => {
const { id, sourceEntity } = data;
if (id === "lfg_ff:structure_placer_inventory_check") {
if (!sourceEntity) return;
sourceEntity.nameTag = "§r"
if (!sourceEntity.getProperty("lfg_ff:blueprint_active")) {
const rider = sourceEntity?.getComponent("minecraft:rideable")?.getRiders()[0]
if (rider) {
rider.remove()
}
return;
};
const houseIndex = sourceEntity.getProperty("lfg_ff:id_index");
const costTab = HouseCost[houseIndex];
const containerItems = new Map();
const inv = sourceEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) {
containerItems.set(item.typeId, (containerItems.get(item.typeId) || 0) + item.amount);
}
}
let allResourcesAvailable = true;
let nametagDisplay = `§l§9Required Resources:\n`;
for (const { item, amount } of costTab) {
const hasAmount = containerItems.get(item) || 0;
const color = hasAmount >= amount ? "§a" : "§c";
if (hasAmount < amount) allResourcesAvailable = false;
const key = new ItemStack(item, 1).localizationKey
const resourceNameMapping = {
"tile.concrete.silver.name": "Light Gray Contrete",
"tile.concrete.white.name": "White Contrete",
"tile.lfg_ff:awning.name": "Awning",
"tile.lfg_ff:basket_hoop.name": "Basketball Hoop",
"tile.lfg_ff:bath_tub.name": "Bathtub",
"tile.lfg_ff:beam.name": "Structural Beam",
"tile.lfg_ff:bench.name": "Bench",
"tile.lfg_ff:bin_block.name": "Trash Bin",
"tile.lfg_ff:bush.name": "Bush",
"tile.lfg_ff:carpet.name": "Carpet",
"tile.lfg_ff:chair.name": "Chair",
"tile.lfg_ff:clock.name": "Clock",
"tile.lfg_ff:curtains.name": "Curtains",
"tile.lfg_ff:bed.name": "Bed",
"tile.lfg_ff:door.name": "Door",
"tile.lfg_ff:exterior_wall.name": "Exterior Wall",
"tile.lfg_ff:fence_gate.name": "Fence Gate",
"tile.lfg_ff:fence.name": "Fence",
"tile.lfg_ff:floor.name": "Flooring",
"tile.lfg_ff:flower_pot.name": "Flower Pot",
"tile.lfg_ff:fridge_block.name": "Refrigerator",
"tile.lfg_ff:garage_door.name": "Garage Door",
"tile.lfg_ff:garland.name": "Hanging Garland",
"tile.lfg_ff:kitchen_storage_block.name": "Kitchen Cabinet",
"tile.lfg_ff:lamp.name": "Lamp",
"tile.lfg_ff:letterbox_block.name": "Mailbox",
"tile.lfg_ff:ornament_book.name": "Stacked Books",
"tile.lfg_ff:ornament_cadre.name": "Picture Frame",
"tile.lfg_ff:ornament_plant.name": "Potted Plant",
"tile.lfg_ff:ornament_table.name": "Dining Set",
"tile.lfg_ff:ornament_pumpkins.name": "Mini Pumpkins",
"tile.lfg_ff:ornament_desk.name": "Desk Supplies",
"tile.lfg_ff:ornament_toys.name": "Toys",
"tile.lfg_ff:xmas_tree.name": "Christmas Tree",
"tile.lfg_ff:ornament_gifts.name": "Stacked Gifts",
"tile.lfg_ff:piano.name": "Grand Piano",
"tile.lfg_ff:pillar.name": "Column",
"tile.lfg_ff:roof.name": "Roof Tile",
"tile.lfg_ff:roof_cap.name": "Roof Cap",
"tile.lfg_ff:sink.name": "Sink",
"tile.lfg_ff:sofa.name": "Couch",
"tile.lfg_ff:staircase_railing.name": "Stair Railing",
"tile.lfg_ff:street_lamp.name": "Street Lamp Post",
"tile.lfg_ff:table.name": "Table",
"tile.lfg_ff:toilet.name": "Toilet",
"tile.lfg_ff:tree.name": "Tree",
"tile.lfg_ff:wall_shelf.name": "Wall Shelf",
"tile.lfg_ff:wall.name": "Interior Wall",
"tile.lfg_ff:wardrobe_block.name": "Wardrobe",
"tile.lfg_ff:window_frame.name": "Framed Window",
"tile.lfg_ff:oven_block.name": "Oven",
"tile.lfg_ff:grass_path.name": "Grass Path",
"tile.lfg_ff:exterior_floor.name": "Grass Floor",
"tile.lfg_ff:light_switch.name": "Wall Switch",
"tile.lfg_ff:better_leaves.name": "Bushy Leaves",
"tile.lfg_ff:coffee_table.name": "Coffee Table",
"tile.lfg_ff:clear_glass.name": "Clear Glass",
"tile.lfg_ff:clear_glass_pane.name": "Clear Glass Pane",
"tile.lfg_ff:letter_tile.name": "Letter Tile",
"tile.lfg_ff:arch_block.name": "Arch",
"tile.lfg_ff:wall_board.name": "Wall Board",
"tile.lfg_ff:statue.name": "Statue",
"tile.lfg_ff:split_wall.name": "Split Wall",
"tile.lfg_ff:plush.name": "Plush"
};
nametagDisplay += `${color}- ${amount}x ${resourceNameMapping[key]} (${hasAmount}/${amount})\n`;
}
const hasRider = sourceEntity?.getComponent("minecraft:rideable")?.getRiders()?.length > 0
if (hasRider) {
const rider = sourceEntity?.getComponent("minecraft:rideable")?.getRiders()[0]
rider.nameTag = nametagDisplay;
} else {
const rider = sourceEntity.dimension.spawnEntity("lfg_ff:structure_placer_title", Vector.add(sourceEntity.location, new Vector(0, 1.25, 0)))
sourceEntity?.getComponent("minecraft:rideable")?.addRider(rider)
}
sourceEntity.setProperty("lfg_ff:can_craft", allResourcesAvailable);
}
});