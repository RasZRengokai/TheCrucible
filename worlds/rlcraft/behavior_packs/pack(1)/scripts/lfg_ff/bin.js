/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class BinComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.binId = "lfg_ff:bin_block"
this.binEntityId = "lfg_ff:bin"
this.MaxPaintedBlocksOnce = 150
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const binEntity = block.dimension.getEntities({
type: "lfg_ff:bin",
location: this.getBlockCenter(block),
maxDistance: 3,
closest: 1
})[0]
if (!binEntity) return;
const variant = binEntity.getProperty("lfg_ff:variant")
let newVariant = variant == 4 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
binEntity.setProperty("lfg_ff:variant", newVariant)
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, direction, newVariant)
}
}
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
const upBlock = block.above()
const downBlock = block.below()
const allbins = [];
if (frontBlock) allbins.push(frontBlock)
if (backBlock) allbins.push(backBlock)
if (rightBlock) allbins.push(rightBlock)
if (leftBlock) allbins.push(leftBlock)
if (upBlock && upBlock.typeId == this.binId) allbins.push(upBlock)
if (downBlock && downBlock.typeId == this.binId) allbins.push(downBlock)
for (const expendedbin of allbins) {
const expendedVariant = this.getVariant(expendedbin);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedbin);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
const binEntity = expendedbin.dimension.getEntities({
type: "lfg_ff:bin",
location: this.getBlockCenter(expendedbin),
maxDistance: 3,
closest: 1
})[0]
if (!binEntity) return;
binEntity.setProperty("lfg_ff:variant", newVariant)
this.expendPaint(expendedbin, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const binEntity = block.dimension.getEntities({ location: Vector.add(center, new Vector(0, -0.5, 0)), maxDistance: 0.15, type: "lfg_ff:bin" })[0]
if (binEntity) {
const inv = binEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
binEntity.dimension.spawnItem(item, Vector.add(binEntity.location, new Vector(0, 0.5, 0)))
}
binEntity.remove()
}
system.runTimeout(() => {
this.updateAllbin(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placementPerm = permutationToPlace.withState("lfg_ff:is_placed", true)
system.run(() => {
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
})
system.runTimeout(() => {
block.setPermutation(placementPerm)
this.updateAllbin(block, direction)
}, 1)
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
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.4, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterbin) {
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
if (filterbin)
return neighborBlock.typeId == this.binId ? neighborBlock : null;
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
updateAllbin(block, direction, updatedbinBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedbinBlocks.has(blockLocationKey)) {
return;
}
updatedbinBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allbins = [];
if (rightBlock) allbins.push(rightBlock)
if (leftBlock) allbins.push(leftBlock)
if (frontBlock) allbins.push(frontBlock)
if (backBlock) allbins.push(backBlock)
if (upBlock) allbins.push(upBlock)
if (downBlock) allbins.push(downBlock)
if (block && block.typeId == this.binId) allbins.push(block)
for (const expendedbin of allbins) {
const expDir = this.getDirection(expendedbin);
const expendedleftBlock = this.getNeighborBlock(expendedbin, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedbin, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedbin, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedbin, expDir, "back", true);
const expendedupBlock = this.getNeighborBlock(expendedbin, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendedbin, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedbackBlock, expendedfrontBlock, expendedupBlock, expendeddownBlock, expDir, expendedbin);
const binEntity = block.dimension.getEntities({ location: Vector.add(expendedbin.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: "lfg_ff:bin" })[0]
if (binEntity) {
const inv = binEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
binEntity.dimension.spawnItem(item, Vector.add(binEntity.location, new Vector(0, 0.5, 0)))
}
binEntity.remove()
}
expendedbin.setPermutation(expendedbin.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
let shape = null
if (expNewModuleAndDir.module == "stack") shape = "stack"
if (expNewModuleAndDir.module == "small") shape = "small"
if (expNewModuleAndDir.module == "double_left") shape = "double"
if (shape) {
const binRotationY = this.getBinEntityRotations(expDir)
const spawnedBinEntity = expendedbin.dimension.spawnEntity("lfg_ff:bin", Vector.add(expendedbin.location, new Vector(0.5, 0, 0.5)));
spawnedBinEntity.setRotation({ x: 0, y: binRotationY })
spawnedBinEntity.setProperty("lfg_ff:rotation_y", binRotationY);
spawnedBinEntity.setProperty("lfg_ff:shape", shape);
}
system.runTimeout(() => {
try {
if (updatedbinBlocks.size <= 10)
this.updateAllbin(expendedbin, expNewModuleAndDir.direction, updatedbinBlocks);
} catch (e) {
}
}, 1);
}
}
getBinEntityRotations(dir) {
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
getUpdatedModuleAndDirection(leftBlock, rightBlock, backBlock, frontBlock, upBlock, downBlock, direction, block) {
const bins = []
const allBlocks = [leftBlock, rightBlock, backBlock, frontBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
bins.push(b)
})
if (!bins.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!bins.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!bins.includes(backBlock) || this.getDirection(backBlock) !== direction) backBlock = null
if (!bins.includes(frontBlock) || this.getDirection(frontBlock) !== direction) frontBlock = null
if (!bins.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
if (!bins.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (!rightBlock && !leftBlock && !upBlock && !downBlock && !frontBlock && !backBlock) return { module: "small", direction: direction }
if (downBlock || upBlock) {
return { module: "stack", direction: direction }
}
if (frontBlock || backBlock) {
return { module: "stack", direction: direction }
}
if (leftBlock && this.getModule(leftBlock) == "stack") {
return { module: "stack", direction: direction }
}
if (rightBlock && this.getModule(rightBlock) == "stack") {
return { module: "stack", direction: direction }
}
if (leftBlock && rightBlock) {
if (this.getModule(leftBlock) == "double_left" && this.getModule(rightBlock) == "double_right") {
return { module: "double_right", direction: direction }
}
}
if (rightBlock) {
if (!this.getModule(rightBlock).includes("double_left") && (!leftBlock || this.getModule(leftBlock) !== "double_left")) {
return { module: "double_left", direction: direction }
}
}
if (leftBlock) {
if (!this.getModule(leftBlock).includes("double_right") && (!rightBlock || this.getModule(rightBlock) !== "double_right")) {
return { module: "double_right", direction: direction }
}
}
return { module: "small", direction: direction }
}
}