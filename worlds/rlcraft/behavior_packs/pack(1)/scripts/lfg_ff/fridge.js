/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";
import { Vector } from './vector.js';
const FRIDGE_BLOCK_ID = "lfg_ff:fridge_block";
const GHOST_ENTITY_ID = "lfg_ff:fridge_ghost";
system.runInterval(() => {
for (const player of world.getAllPlayers()) {
const selectedSlot = player.selectedSlotIndex;
const handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem || handItem.typeId !== FRIDGE_BLOCK_ID) {
removePreviousGhosts(player);
continue;
}
const ray = getRaycastedBlockInfo(player);
if (!ray || ray.block.typeId !== FRIDGE_BLOCK_ID) {
removePreviousGhosts(player);
continue;
}
const { newShape, anchorBlock } = determineFridgeShape(ray.block, ray.face.toLocaleLowerCase());
if (!newShape || newShape == "small") {
removePreviousGhosts(player);
continue;
}
const ghostSpawnLoc = Vector.add(anchorBlock, new Vector(0.5, 0, 0.5))
const alreadyGhost = player.dimension.getEntities({ type: GHOST_ENTITY_ID, location: ghostSpawnLoc, maxDistance: 0.1 }).filter(e => e.getProperty("lfg_ff:shape") == newShape)[0]
if (!alreadyGhost) {
spawnGhostEntity(player, ghostSpawnLoc, newShape, ray.block);
}
}
}, 5);
world.afterEvents.playerPlaceBlock.subscribe((e) => {
const { dimension, player, block } = e
if (isFridge(block, "small")) {
block.setPermutation(block.permutation.withState("lfg_ff:is_placed", true))
const variant = getDominantVariant(Vector.add(block.location, new Vector(0.5, 0, 0.5)), dimension, "lfg_ff:fridge")
const fridgeRotationY = getGhostRotations(getDirection(block))
const fridgeEntity = player.dimension.spawnEntity("lfg_ff:fridge", Vector.add(block.location, new Vector(0.5, 0, 0.5)));
fridgeEntity.setRotation({ x: 0, y: fridgeRotationY })
fridgeEntity.setProperty("lfg_ff:rotation_y", fridgeRotationY);
fridgeEntity.setProperty("lfg_ff:shape", "small");
fridgeEntity.setProperty("lfg_ff:variant", variant);
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
}
})
function getDominantVariant(loc, dimension, entityId) {
const entities = dimension.getEntities({
type: entityId,
location: loc,
maxDistance: 6
});
if (entities.length === 0) return 1;
const variantCount = {};
const entityDistances = {};
for (const entity of entities) {
const variant = entity.getProperty("lfg_ff:variant");
if (variant === undefined) continue;
variantCount[variant] = (variantCount[variant] || 0) + 1;
const distance = Vector.subtract(entity.location, loc).length();
if (!entityDistances[variant] || distance < entityDistances[variant]) {
entityDistances[variant] = distance;
}
}
let dominantVariant = null;
let maxCount = 0;
let closestDistance = Infinity;
for (const [variant, count] of Object.entries(variantCount)) {
const distance = entityDistances[variant];
if (count > maxCount || (count === maxCount && distance < closestDistance)) {
maxCount = count;
dominantVariant = parseInt(variant, 10);
closestDistance = distance;
}
}
return dominantVariant || 1;
}
world.beforeEvents.playerInteractWithBlock.subscribe((e)=>{
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!isFirstEvent) return;
if (!itemStack || itemStack.typeId !== FRIDGE_BLOCK_ID || block.typeId !== FRIDGE_BLOCK_ID) return;
const { newShape, anchorBlock } = determineFridgeShape(block, blockFace.toLocaleLowerCase());
if (!newShape) return;
if (newShape == "small") {
return;
}
const direction = getDirection(block)
e.cancel = true;
system.runTimeout(() => {
placeFridgeBlocks(player, anchorBlock, newShape, direction, blockFace.toLocaleLowerCase(), block);
}, 1)
});
function determineFridgeShape(block, face) {
const dimension = block.dimension;
const location = block.location;
const basePermutation = block.permutation;
const direction = basePermutation.getState("minecraft:cardinal_direction");
let newShape = "small";
let anchorBlock = Vector.add(location, getDirectionVector(face));
if (face === "up" || face === "down") {
if (getModule(block) == "small") {
newShape = "vrt";
anchorBlock = { x: location.x, y: face == 'up' ? location.y : location.y - 1, z: location.z };
} else if (getModule(block) == "vrt") {
newShape = "large";
anchorBlock = { x: location.x, y: location.y - 1, z: location.z };
} else {
newShape = "small";
}
} else {
if (!isAxeAligned(face, direction)) {
if (getModule(block) == "small") {
newShape = "hrz";
anchorBlock = getMinVec3(Vector.add(location, getDirectionVector(face)), location)
} else {
newShape = "small";
}
} else {
newShape = "small";
}
}
return { newShape, anchorBlock };
}
function getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
function isFridge(block, module) {
if (!block) return false
return block.typeId == FRIDGE_BLOCK_ID && getModule(block) == module
}
function haveSameDir(...blocks) {
if (blocks.length < 2) return false;
const firstDirection = blocks[0].permutation.getState("minecraft:cardinal_direction");
return blocks.every(block => block.permutation.getState("minecraft:cardinal_direction") === firstDirection);
}
function getMinVec3(vec1, vec2) {
return {
x: Math.min(vec1.x, vec2.x),
y: Math.min(vec1.y, vec2.y),
z: Math.min(vec1.z, vec2.z),
};
}
function getDirectionVector(direction) {
switch (direction) {
case "north": return { x: 0, y: 0, z: -1 };
case "south": return { x: 0, y: 0, z: 1 };
case "east": return { x: 1, y: 0, z: 0 };
case "west": return { x: -1, y: 0, z: 0 };
case "up": return { x: 0, y: 1, z: 0 };
case "down": return { x: 0, y: -1, z: 0 };
}
}
function getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
function isAxeAligned(face, facingDir) {
return (face === facingDir || face === getOppositeDirection(facingDir));
}
function getNeighborBlock(block, direction, side, filterwindow) {
let neighborBlock = null
if (side == "left")
neighborBlock = getBlockInDirection(block, getLeftDirection(direction));
else if (side == "right")
neighborBlock = getBlockInDirection(block, getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterwindow)
return neighborBlock.typeId == FRIDGE_BLOCK_ID ? neighborBlock : null;
else
return neighborBlock
}
function getOppositeDirection(direction) {
switch (direction) {
case 'north': return 'south';
case 'south': return 'north';
case 'east': return 'west';
case 'west': return 'east';
case 'up': return 'down';
case 'down': return 'up';
default: return null;
}
}
function getLeftDirection(direction) {
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
function getRightDirection(direction) {
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
function getBlockInDirection(block, direction) {
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
function spawnGhostEntity(player, location, shape, block) {
removePreviousGhosts(player);
const rotationY = getGhostRotations(getDirection(block))
const ghostEntity = player.dimension.spawnEntity(GHOST_ENTITY_ID, { x: location.x, y: location.y, z: location.z });
ghostEntity.setProperty("lfg_ff:shape", shape);
ghostEntity.setProperty("lfg_ff:rotation_y", rotationY);
ghostEntity.addTag(`lfg_ff:fridge_ghost_placed_by:${player.id}`);
let nearByFridges = player.dimension.getEntities({ type: "lfg_ff:fridge", location: location, maxDistance: 1.5 });
nearByFridges = nearByFridges.concat(player.dimension.getEntities({ type: "lfg_ff:fridge", location: Vector.add(location, new Vector(0, 2, 0)), maxDistance: 1.5 }));
nearByFridges.forEach((e) => e.setProperty("lfg_ff:visible", false));
}
function getGhostRotations(dir) {
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
function removePreviousGhosts(player) {
const ghosts = player.dimension.getEntities({ tags: [`lfg_ff:fridge_ghost_placed_by:${player.id}`] });
ghosts.forEach(
(ghost) => {
const nearByFridges = player.dimension.getEntities({ type: "lfg_ff:fridge", location: ghost.location, maxDistance: 6 });
nearByFridges.forEach((e) => e.setProperty("lfg_ff:visible", true));
ghost.remove()
}
);
}
function placeFridgeBlocks(player, anchorBlock, shape, originBlockDirection, face, block) {
const dimension = player.dimension;
const blocksToPlace = [];
let fridgeSpawnLoc = Vector.add(anchorBlock, new Vector(0.5, 0, 0.5))
switch (shape) {
case "vrt":
blocksToPlace.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y + 1, z: anchorBlock.z });
break;
case "large":
blocksToPlace.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y + 1, z: anchorBlock.z }, { x: anchorBlock.x, y: anchorBlock.y + 2, z: anchorBlock.z });
break;
case "hrz":
if (originBlockDirection === "north" || originBlockDirection === "south") {
blocksToPlace.push(anchorBlock, { x: anchorBlock.x + 1, y: anchorBlock.y, z: anchorBlock.z });
fridgeSpawnLoc = Vector.add(fridgeSpawnLoc, new Vector(0.5, 0, 0))
} else {
blocksToPlace.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y, z: anchorBlock.z + 1 });
fridgeSpawnLoc = Vector.add(fridgeSpawnLoc, new Vector(0, 0, 0.5))
}
break;
}
if (!blocksToPlace.every(b => (dimension.getBlock(b).typeId === "minecraft:air" || dimension.getBlock(b).typeId === FRIDGE_BLOCK_ID))) {
player.sendMessage("§cCan only extend fridges on air blocks.")
player.playSound("note.bass")
return;
}
const isCreative = player.getGameMode() == "Creative"
if (!isCreative)
player.runCommand(`clear @s lfg_ff:fridge_block 0 1`)
player.playSound("dig.stone")
block.dimension.spawnParticle("lfg_ff:dust_particles", fridgeSpawnLoc)
let variant = 1
const invItems = []
blocksToPlace.forEach((pos) => {
const block = dimension.getBlock(pos);
const oldFridgeEntity = dimension.getEntities({ type: "lfg_ff:fridge", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.55, }).filter(e => e.getProperty("lfg_ff:shape") !== shape)[0]
if (oldFridgeEntity) {
variant = oldFridgeEntity.getProperty("lfg_ff:variant")
const inv = oldFridgeEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
invItems.push(item)
}
oldFridgeEntity.remove()
}
block.setPermutation(BlockPermutation.resolve(FRIDGE_BLOCK_ID).withState("lfg_ff:module", shape).withState("minecraft:cardinal_direction", originBlockDirection).withState("lfg_ff:is_placed", true));
});
const fridgeRotationY = getGhostRotations((originBlockDirection))
const fridgeEntity = player.dimension.spawnEntity("lfg_ff:fridge", fridgeSpawnLoc);
fridgeEntity.setRotation({ x: 0, y: fridgeRotationY })
fridgeEntity.setProperty("lfg_ff:variant", variant);
fridgeEntity.setProperty("lfg_ff:shape", shape);
fridgeEntity.setProperty("lfg_ff:rotation_y", fridgeRotationY);
const newInv = fridgeEntity.getComponent('inventory').container;
for (let i = 0; i < newInv.size; i++) {
const item = invItems.shift();
newInv.setItem(i, item)
}
if (invItems.length > 0) {
for (const itemToDrop of invItems) {
dimension.spawnItem(itemToDrop, Vector.add(fridgeEntity.location, new Vector(0, 0.5, 0)))
}
}
}
function getRaycastedBlockInfo(player) {
return player.getBlockFromViewDirection({
includeTypes: [FRIDGE_BLOCK_ID],
maxDistance: 8.5,
includeLiquidBlocks: false,
includePassableBlocks: true
});
}
world.beforeEvents.playerBreakBlock.subscribe((e) => {
const { block, dimension, player } = e
if (block.typeId == "lfg_ff:fridge_block") {
system.runTimeout(() => {
let nearByFridges = player.dimension.getEntities({ type: "lfg_ff:fridge", location: Vector.add(block.location, new Vector(0.5, 0.5, 0.5)), maxDistance: 5 });
nearByFridges.forEach((e) => {
const isCreative = player.getGameMode() == "Creative"
e.runCommand(`scriptevent lfg_ff:fridge_check_for_remove ${isCreative ? "CreativeYes" : "CreativeNo"}`)
});
}, 1)
}
})
function getDirectionFromRotationY(rotationY) {
rotationY = ((rotationY % 360) + 360) % 360;
if (rotationY >= 315 || rotationY < 45) return "north";
if (rotationY >= 45 && rotationY < 135) return "east";
if (rotationY >= 135 && rotationY < 225) return "south";
if (rotationY >= 225 && rotationY < 315) return "west";
return "north";
}
function getFixedBoxRotation(rotation) {
let rot = rotation
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
return rot
}
system.afterEvents.scriptEventReceive.subscribe((data) => {
const { id, sourceEntity, message } = data;
if (id == "lfg_ff:fridge_box_selection") {
const shape = sourceEntity.getProperty("lfg_ff:shape")
let rot = sourceEntity.getRotation().y
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
sourceEntity.triggerEvent(`lfg_ff:${shape}_box_${rot}`)
const loc = sourceEntity.location
sourceEntity.dimension.runCommand(`structure save lfg_ff:temp_fridge_hitbox_placing ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y} ${loc.z} true memory false`)
sourceEntity.dimension.runCommand(`structure load lfg_ff:temp_fridge_hitbox_placing ${loc.x} ${loc.y} ${loc.z} 0_degrees none true false`)
sourceEntity.remove()
}
if (id == "lfg_ff:fridge_check_for_remove") {
if (!sourceEntity) return
const shape = sourceEntity.getProperty("lfg_ff:shape")
let anchorBlock = Vector.add(sourceEntity.location, new Vector(-0.5, 0, -0.5))
const originBlockDirection = getDirectionFromRotationY(sourceEntity.getRotation().y)
const blockToRemove = []
let lootDrop = 0
switch (shape) {
case "small":
blockToRemove.push(anchorBlock);
lootDrop = 1
break;
case "vrt":
blockToRemove.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y + 1, z: anchorBlock.z });
lootDrop = 2
break;
case "large":
blockToRemove.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y + 1, z: anchorBlock.z }, { x: anchorBlock.x, y: anchorBlock.y + 2, z: anchorBlock.z });
lootDrop = 3
break;
case "hrz":
if (originBlockDirection === "north" || originBlockDirection === "south") {
anchorBlock = Vector.add(anchorBlock, new Vector(-0.5, 0, 0))
blockToRemove.push(anchorBlock, { x: anchorBlock.x + 1, y: anchorBlock.y, z: anchorBlock.z });
} else {
anchorBlock = Vector.add(anchorBlock, new Vector(0, 0, -0.5))
blockToRemove.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y, z: anchorBlock.z + 1 });
}
lootDrop = 2
break;
}
if (!blockToRemove.every(b => (sourceEntity.dimension.getBlock(b).typeId == "lfg_ff:fridge_block"))) {
blockToRemove.forEach((pos) => {
const block = sourceEntity.dimension.getBlock(pos);
block.setPermutation(BlockPermutation.resolve("minecraft:air"))
})
const inv = sourceEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
sourceEntity.dimension.spawnItem(item, Vector.add(sourceEntity.location, new Vector(0, 0.5, 0)))
}
if (message == "CreativeNo")
sourceEntity.dimension.spawnItem(new ItemStack("lfg_ff:fridge_block", lootDrop), Vector.add(sourceEntity.location, new Vector(0, 0.5, 0)))
sourceEntity.remove()
}
}
})
function getfridgeEntityFromBlock(block) {
const dimension = block.dimension;
const blockLocation = block.location;
const entities = dimension.getEntities({ type: "lfg_ff:fridge", location: blockLocation, maxDistance: 6 });
for (const entity of entities) {
const shape = entity.getProperty("lfg_ff:shape");
let anchorBlock = Vector.add(entity.location, new Vector(-0.5, 0, -0.5));
const originBlockDirection = getDirectionFromRotationY(entity.getRotation().y);
let blockPositions = [];
switch (shape) {
case "small":
blockPositions.push(anchorBlock);
break;
case "vrt":
blockPositions.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y + 1, z: anchorBlock.z });
break;
case "large":
blockPositions.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y + 1, z: anchorBlock.z }, { x: anchorBlock.x, y: anchorBlock.y + 2, z: anchorBlock.z });
break;
case "hrz":
if (originBlockDirection === "north" || originBlockDirection === "south") {
anchorBlock = Vector.add(anchorBlock, new Vector(-0.5, 0, 0))
blockPositions.push(anchorBlock, { x: anchorBlock.x + 1, y: anchorBlock.y, z: anchorBlock.z });
} else {
anchorBlock = Vector.add(anchorBlock, new Vector(0, 0, -0.5))
blockPositions.push(anchorBlock, { x: anchorBlock.x, y: anchorBlock.y, z: anchorBlock.z + 1 });
}
break;
}
if (blockPositions.some(pos => new Vector(pos).equals(blockLocation))) {
return entity;
}
}
return null;
}
export class FridgeBlockComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
}
beforeOnPlayerPlace(e) {
const block = e.block;
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const fridgeEntity = getfridgeEntityFromBlock(block)
if (!fridgeEntity) return;
const variant = fridgeEntity.getProperty("lfg_ff:variant")
let newVariant = variant == 3 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
fridgeEntity.setProperty("lfg_ff:variant", newVariant)
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
return;
}
}
}
}