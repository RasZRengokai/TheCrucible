/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class LetterBoxComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.letterboxId = "lfg_ff:letterbox_block"
this.letterboxEntityId = "lfg_ff:letterbox"
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
let newVariant = variant == 3 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant));
const letterboxEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.letterboxEntityId })[0]
if (letterboxEntity) {
letterboxEntity.setProperty("lfg_ff:variant", newVariant)
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
const allletterboxs = [];
if (upBlock) allletterboxs.push(upBlock)
if (downBlock) allletterboxs.push(downBlock)
const letterboxEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.letterboxEntityId })[0]
if (letterboxEntity) {
letterboxEntity.setProperty("lfg_ff:variant", newVariant)
}
for (const expendedletterbox of allletterboxs) {
const expendedVariant = this.getVariant(expendedletterbox);
const expDir = this.getDirection(expendedletterbox);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedletterbox.setPermutation(expendedletterbox.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedletterbox, newVariant, expDir, updatedPaintedBlocks);
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
if (brokenBlockPermutation.getState("lfg_ff:module") == "box") {
const letterboxEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.letterboxEntityId })[0]
if (letterboxEntity) {
const inv = letterboxEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
letterboxEntity.dimension.spawnItem(item, Vector.add(letterboxEntity.location, new Vector(0, 0.5, 0)))
}
if (letterboxEntity.getProperty('lfg_ff:variant') == 2)
block.dimension.playSound("break.iron", block.location)
letterboxEntity.remove()
}
}
system.runTimeout(() => {
this.updateAllletterbox(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "box")
system.run(() => {
const loc = block.location
const letterboxRotationY = this.getletterboxEntityRotations(direction)
const spawnedletterboxEntity = block.dimension.spawnEntity(this.letterboxEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedletterboxEntity.setRotation({ x: 0, y: letterboxRotationY })
spawnedletterboxEntity.setProperty("lfg_ff:rotation_y", letterboxRotationY);
spawnedletterboxEntity.setProperty("lfg_ff:variant", this.getPlacementVariant(block, direction));
if (this.getPlacementVariant(block, direction) == 2)
block.dimension.playSound("break.iron", block.location)
})
system.runTimeout(() => {
this.updateAllletterbox(block, direction)
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
getNeighborBlock(block, direction, side, filterletterbox) {
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
if (filterletterbox)
return neighborBlock.typeId == this.letterboxId ? neighborBlock : null;
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
updateAllletterbox(block, direction, updatedletterboxBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedletterboxBlocks.has(blockLocationKey)) {
return;
}
updatedletterboxBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allletterboxs = [];
if (upBlock) allletterboxs.push(upBlock)
if (downBlock) allletterboxs.push(downBlock)
if (block && block.typeId == this.letterboxId) allletterboxs.push(block)
let globalStoredInv = []
for (const expendedletterbox of allletterboxs) {
const expDir = this.getDirection(expendedletterbox);
const expendedupBlock = this.getNeighborBlock(expendedletterbox, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendedletterbox, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedupBlock, expendeddownBlock, expDir, expendedletterbox);
expendedletterbox.setPermutation(expendedletterbox.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
let storedInv = []
const letterboxEntity = block.dimension.getEntities({ location: Vector.add(expendedletterbox.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.25, type: this.letterboxEntityId })[0]
if (letterboxEntity) {
const inv = letterboxEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) {
storedInv.push(item)
}
}
letterboxEntity.remove()
}
if (this.getModule(expendedletterbox) == "box") {
const loc = expendedletterbox.location
const letterboxRotationY = this.getletterboxEntityRotations(expDir)
const spawnedletterboxEntity = block.dimension.spawnEntity(this.letterboxEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedletterboxEntity.setRotation({ x: 0, y: letterboxRotationY })
spawnedletterboxEntity.setProperty("lfg_ff:rotation_y", letterboxRotationY);
spawnedletterboxEntity.setProperty("lfg_ff:variant", this.getVariant(expendedletterbox));
const spInv = spawnedletterboxEntity.getComponent('inventory').container;
if (storedInv.length > 0) {
for (const item of storedInv) {
spInv.setItem(storedInv.indexOf(item), item)
}
} else {
for (const item of globalStoredInv) {
spInv.setItem(globalStoredInv.indexOf(item), item)
}
}
} else {
globalStoredInv = storedInv
}
system.runTimeout(() => {
try {
if (updatedletterboxBlocks.size <= 6)
this.updateAllletterbox(expendedletterbox, expNewModuleAndDir.direction, updatedletterboxBlocks);
} catch (e) {
}
}, 1);
}
}
getletterboxEntityRotations(dir) {
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
const letterboxs = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
letterboxs.push(b)
})
if (!letterboxs.includes(upBlock)) upBlock = null
if (!letterboxs.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) return { module: "box", direction: direction }
if (upBlock && downBlock) {
return { module: "pillar", direction: direction }
} else if (upBlock) {
return { module: "bot", direction: direction }
} else if (downBlock) {
return { module: "box", direction: direction }
}
return { module: "box", direction: direction }
}
}