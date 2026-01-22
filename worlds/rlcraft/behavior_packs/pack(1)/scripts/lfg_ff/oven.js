/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class OvenComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.ovenId = "lfg_ff:oven_block"
this.ovenEntityId = "lfg_ff:oven"
this.MaxPaintedBlocksOnce = 50
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 2 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant));
const ovenEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.ovenEntityId })[0]
if (ovenEntity) {
ovenEntity.setProperty("lfg_ff:variant", newVariant)
system.runTimeout(() => {
ovenEntity.runCommand("scriptevent lfg_ff:oven_box_selection")
}, 1)
}
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
const allovens = [];
if (upBlock && this.getDirection(upBlock) == direction) allovens.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) allovens.push(downBlock)
const ovenEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.ovenEntityId })[0]
if (ovenEntity) {
ovenEntity.setProperty("lfg_ff:variant", newVariant)
system.runTimeout(() => {
ovenEntity.runCommand("scriptevent lfg_ff:oven_box_selection")
}, 1)
}
for (const expendedoven of allovens) {
const expendedVariant = this.getVariant(expendedoven);
const expDir = this.getDirection(expendedoven);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedoven.setPermutation(expendedoven.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedoven, newVariant, expDir, updatedPaintedBlocks);
}
} catch (e) {
}
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
if (["small", "medium_bot", "large_bot"].includes(brokenBlockPermutation.getState("lfg_ff:module"))) {
const ovenEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.ovenEntityId })[0]
if (ovenEntity) {
const inv = ovenEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) {
ovenEntity.dimension.spawnItem(item, Vector.add(ovenEntity.location, new Vector(0, 0.5, 0)))
inv.setItem(i, new ItemStack("minecraft:air", 1))
}
}
let foodEntity = ovenEntity?.getComponent('rideable')?.getRiders()[0]
if (foodEntity) {
foodEntity.remove()
}
ovenEntity.remove()
}
}
system.runTimeout(() => {
this.updateAlloven(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const newVariant = this.getPlacementVariant(block, direction)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:module", "small").withState("lfg_ff:variant", newVariant)
const downBlock = this.getNeighborBlock(block, direction, "down", true);
if (downBlock && (this.getModule(downBlock) == "large_top" || this.getModule(downBlock) == "tube_top") && this.getDirection(downBlock) == direction) {
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:module", "tube_top")
return;
}
system.run(() => {
const loc = block.location
const ovenRotationY = this.getovenEntityRotations(direction)
const spawnedovenEntity = block.dimension.spawnEntity(this.ovenEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedovenEntity.setRotation({ x: 0, y: ovenRotationY })
spawnedovenEntity.setProperty("lfg_ff:rotation_y", ovenRotationY);
spawnedovenEntity.setProperty("lfg_ff:variant", newVariant);
})
system.runTimeout(() => {
this.updateAlloven(block, direction)
}, 1)
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["up", "down"];
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
getNeighborBlock(block, direction, side, filteroven) {
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
if (filteroven)
return neighborBlock.typeId == this.ovenId ? neighborBlock : null;
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
updateAlloven(block, direction, updatedovenBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedovenBlocks.has(blockLocationKey)) {
return;
}
updatedovenBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allovens = [];
if (upBlock) allovens.push(upBlock)
if (downBlock) allovens.push(downBlock)
for (const expendedoven of allovens) {
const expDir = this.getDirection(expendedoven);
const expendedupBlock = this.getNeighborBlock(expendedoven, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendedoven, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedupBlock, expendeddownBlock, expDir, expendedoven);
expendedoven.setPermutation(expendedoven.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
let variant = this.getVariant(expendedoven)
let storedInv = []
const ovenEntity = block.dimension.getEntities({ location: Vector.add(expendedoven.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.25, type: this.ovenEntityId })[0]
if (ovenEntity) {
const inv = ovenEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) {
storedInv.push(item)
}
}
let foodEntity = ovenEntity?.getComponent('rideable')?.getRiders()[0]
if (foodEntity) {
foodEntity.remove()
}
ovenEntity.remove()
}
if (["small", "medium_bot", "large_bot"].includes(this.getModule(expendedoven))) {
const loc = expendedoven.location
const ovenRotationY = this.getovenEntityRotations(expDir)
const spawnedovenEntity = block.dimension.spawnEntity(this.ovenEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedovenEntity.setRotation({ x: 0, y: ovenRotationY })
spawnedovenEntity.setProperty("lfg_ff:rotation_y", ovenRotationY);
spawnedovenEntity.setProperty("lfg_ff:shape", this.getModule(expendedoven).split("_")[0]);
spawnedovenEntity.setProperty("lfg_ff:variant", variant);
const spInv = spawnedovenEntity.getComponent('inventory').container;
for (const item of storedInv) {
spInv.setItem(storedInv.indexOf(item), item)
}
}
system.runTimeout(() => {
try {
if (updatedovenBlocks.size <= 6)
this.updateAlloven(expendedoven, expNewModuleAndDir.direction, updatedovenBlocks);
} catch (e) {
}
}, 1);
}
}
getovenEntityRotations(dir) {
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
getUpdatedModuleAndDirection(upBlock, downBlock, direction, block) {
const ovens = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
ovens.push(b)
})
if (!ovens.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
if (!ovens.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (downBlock && (this.getModule(downBlock) == "large_top" || this.getModule(downBlock) == "tube_top")) {
return { module: "tube_top", direction: direction }
}
if (!upBlock && !downBlock) return { module: "small", direction: direction }
if (upBlock && downBlock) {
return { module: "large_mid", direction: direction }
} else if (upBlock) {
if (this.getModule(upBlock) == "small" || this.getModule(upBlock) == "medium_top")
return { module: "medium_bot", direction: direction }
else if (this.getModule(upBlock) == "medium_bot" || this.getModule(upBlock) == "large_mid")
return { module: "large_bot", direction: direction }
else
return { module: "small", direction: direction }
} else if (downBlock) {
if (this.getModule(downBlock) == "small" || this.getModule(downBlock) == "medium_bot")
return { module: "medium_top", direction: direction }
else if (this.getModule(downBlock) == "medium_top" || this.getModule(downBlock) == "large_mid")
return { module: "large_top", direction: direction }
else
return { module: "small", direction: direction }
}
return { module: "small", direction: direction }
}
}