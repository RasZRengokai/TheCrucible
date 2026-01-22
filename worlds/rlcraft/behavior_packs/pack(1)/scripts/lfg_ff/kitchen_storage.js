/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class KitchenStorageComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.kitchenId = "lfg_ff:kitchen_storage_block"
this.kitchenEntityId = "lfg_ff:kitchen_storage"
this.MaxPaintedBlocksOnce = 150
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const kitchenEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.kitchenEntityId })[0]
if (!kitchenEntity) return;
const variant = kitchenEntity.getProperty("lfg_ff:variant");
let newVariant = variant == 4 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
kitchenEntity.setProperty("lfg_ff:variant", newVariant)
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, newVariant, direction)
}
return;
}
}
}
expendPaint(block, newVariant, direction, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const allkitchens = [];
if (upBlock) allkitchens.push(upBlock)
if (downBlock) allkitchens.push(downBlock)
if (rightBlock) allkitchens.push(rightBlock)
if (leftBlock) allkitchens.push(leftBlock)
const kitchenEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.kitchenEntityId })[0]
if (kitchenEntity) {
kitchenEntity.setProperty("lfg_ff:variant", newVariant)
}
for (const expendedkitchen of allkitchens) {
const expDir = this.getDirection(expendedkitchen);
system.runTimeout(() => {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
this.expendPaint(expendedkitchen, newVariant, expDir, updatedPaintedBlocks);
}
} catch (e) {
}
}, 1);
}
}
onPlayerBreak(e) {
const block = e.block;
const player = e.player;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const kitchenEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.kitchenEntityId })[0]
if (kitchenEntity) {
const inv = kitchenEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
kitchenEntity.dimension.spawnItem(item, Vector.add(kitchenEntity.location, new Vector(0, 0.5, 0)))
}
if (kitchenEntity.getProperty("lfg_ff:variant") == 4)
block.dimension.playSound("break.iron", block.location)
kitchenEntity.remove()
}
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placedFace = e.face;
let shape = "floor"
let placementPerm = null
if (placedFace == "Up") {
placementPerm = permutationToPlace.withState("lfg_ff:module", "floor")
system.run(() => {
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
})
} else {
shape = "wall"
placementPerm = permutationToPlace.withState("lfg_ff:module", "wall")
}
system.run(() => {
if (placementPerm)
block.setPermutation(placementPerm)
const loc = block.location
const variant = this.getDominantVariant(Vector.add(loc, new Vector(0.5, 0, 0.5)), block.dimension, this.kitchenEntityId)
const kitchenRotationY = this.getkitchenEntityRotations(direction)
const spawnedkitchenEntity = block.dimension.spawnEntity(this.kitchenEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedkitchenEntity.setRotation({ x: 0, y: kitchenRotationY })
spawnedkitchenEntity.setProperty("lfg_ff:shape", shape);
spawnedkitchenEntity.setProperty("lfg_ff:rotation_y", kitchenRotationY);
spawnedkitchenEntity.setProperty("lfg_ff:variant", variant);
if (variant == 4)
block.dimension.playSound("break.iron", block.location)
})
}
getDominantVariant(loc, dimension, entityId) {
const entities = dimension.getEntities({
type: entityId,
location: loc,
maxDistance: 2
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
getModule(block) {
if (!block) return null
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
if (!block) return null
return block.permutation.getState("lfg_ff:variant")
}
getDirection(block) {
if (!block) return null
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
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterkitchen) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterkitchen)
return neighborBlock.typeId == this.kitchenId ? neighborBlock : null;
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
getkitchenEntityRotations(dir) {
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
}