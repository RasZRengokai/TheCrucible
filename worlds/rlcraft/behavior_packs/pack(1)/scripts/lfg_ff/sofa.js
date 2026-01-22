/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class SofaComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.sofaId = "lfg_ff:sofa"
this.MaxPaintedBlocksOnce = 300
}
onPlayerInteract(e) {
const block = e.block;
const loc = block.location
const center = this.getBlockCenter(block)
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const direction = block.permutation.getState('minecraft:cardinal_direction');
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
if (player.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:pillow_entity" }).length == 0) {
player.runCommand(`clear @s ${handItem.typeId} 0 1`)
let bonusRotation = 0;
if (module == "straight_right_end") {
bonusRotation = 30
} else if (module == "straight_left_end") {
bonusRotation = -30
} else if (module == "corner_in") {
bonusRotation = -45
} else if (module == "corner_out") {
bonusRotation = 45
}
const entity = player.dimension.spawnEntity("lfg_ff:pillow_entity", this.adjustPillowLocation(direction, center, bonusRotation))
entity.setProperty("lfg_ff:shape", 2)
entity.setProperty("lfg_ff:rotation_y", this.getRotationFromDirection(direction) + bonusRotation);
entity.setRotation({ x: 0, y: this.getRotationFromDirection(direction) + bonusRotation })
return;
}
}
}
const seatEntity = player.dimension.spawnEntity("lfg_ff:sofa_seat", center)
let bonusRotation = 0;
if (module == "corner_in") {
bonusRotation = -45
} else if (module == "corner_out") {
bonusRotation = 45
}
seatEntity.setRotation({ x: 0, y: this.getRotationFromDirection(direction) + bonusRotation })
seatEntity.getComponent("minecraft:rideable").addRider(player)
}
onPlayerBreak(e) {
const block = e.block;
const center = this.getBlockCenter(block)
const player = e.player
const brokenBlockPermutation = e.brokenBlockPermutation
block.dimension.playSound("dig.cloth", block.location, { volume: 0.5 })
const pillow = player.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
block.dimension.spawnItem(new ItemStack(`lfg_ff:cushion`, 1), center);
block.dimension.playSound("random.pop", center)
pillow.remove()
}
const seatEntity = player.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:sofa_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
const module = brokenBlockPermutation.getState("lfg_ff:module");
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
let finalModule = "normal"
let possibleBlocks = this.getOffsettedBlockFromModule(module, direction, block)
if (module == "corner_out") possibleBlocks = this.getOffsettedBlockFromModule(module, this.getInvertedDirection((direction)), block)
const leftSofa = possibleBlocks.left
if (leftSofa.typeId == this.sofaId) {
const leftSofaModule = leftSofa.permutation.getState("lfg_ff:module");
const leftSofaDirection = leftSofa.permutation.getState('minecraft:cardinal_direction');
const leftSofaConnectedSofas = this.getConnectedSofas(leftSofa, leftSofaModule, leftSofaDirection)
system.runTimeout(() => {
this.updateBlockModuleOnDestroy(leftSofa, leftSofaModule, leftSofaDirection, leftSofaConnectedSofas.length == 0 ? null : leftSofaConnectedSofas[0], direction, block, module)
}, 1)
}
const rightSofa = possibleBlocks.right
if (rightSofa.typeId == this.sofaId) {
const rightSofaModule = rightSofa.permutation.getState("lfg_ff:module");
const rightSofaDirection = rightSofa.permutation.getState('minecraft:cardinal_direction');
const rightSofaConnectedSofas = this.getConnectedSofas(rightSofa, rightSofaModule, rightSofaDirection)
system.runTimeout(() => {
this.updateBlockModuleOnDestroy(rightSofa, rightSofaModule, rightSofaDirection, rightSofaConnectedSofas.length == 0 ? null : rightSofaConnectedSofas[0], direction, block, module)
}, 1)
}
if (module == "corner_out") {
possibleBlocks = this.getOffsettedBlockFromModule(module, this.getInvertedDirection(this.getOppositeDirection(direction)), block)
const leftSofa = possibleBlocks.left
if (leftSofa.typeId == this.sofaId) {
const leftSofaModule = leftSofa.permutation.getState("lfg_ff:module");
const leftSofaDirection = leftSofa.permutation.getState('minecraft:cardinal_direction');
const leftSofaConnectedSofas = this.getConnectedSofas(leftSofa, leftSofaModule, leftSofaDirection)
system.runTimeout(() => {
this.updateBlockModuleOnDestroy(leftSofa, leftSofaModule, leftSofaDirection, leftSofaConnectedSofas.length == 0 ? null : leftSofaConnectedSofas[0], direction, block, module)
}, 1)
}
const rightSofa = possibleBlocks.right
if (rightSofa.typeId == this.sofaId) {
const rightSofaModule = rightSofa.permutation.getState("lfg_ff:module");
const rightSofaDirection = rightSofa.permutation.getState('minecraft:cardinal_direction');
const rightSofaConnectedSofas = this.getConnectedSofas(rightSofa, rightSofaModule, rightSofaDirection)
system.runTimeout(() => {
this.updateBlockModuleOnDestroy(rightSofa, rightSofaModule, rightSofaDirection, rightSofaConnectedSofas.length == 0 ? null : rightSofaConnectedSofas[0], direction, block, module)
}, 1)
}
}
}
updateBlockModuleOnDestroy(block, module, direction, connectedSofa, breakBlockDir, breakBlock, breakBlockModule) {
let newModule = "normal";
let newDirection = direction;
const getSofaDirection = (sofa) => sofa.permutation.getState('minecraft:cardinal_direction');
const getSofaModule = (sofa) => sofa.permutation.getState('lfg_ff:module');
if (connectedSofa) {
if (getSofaModule(block) == "corner_in") {
if (this.isAxeAligned(block, breakBlock) == "z") {
newModule = "straight_right_end";
if (breakBlockDir == direction)
newDirection = this.getOppositeDirection(this.getInvertedDirection(this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa)))
else
newDirection = (this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa))
}
else {
newModule = "straight_left_end";
if (breakBlockDir == direction)
newDirection = this.getOppositeDirection(this.getInvertedDirection(this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa)))
else
newDirection = (this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa))
}
}
if (getSofaModule(block) == "corner_out") {
if (this.isAxeAligned(block, breakBlock) == "z") {
newModule = "straight_right_end";
newDirection = this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa)
}
else {
newModule = "straight_left_end";
newDirection = this.getInvertedDirection(this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa))
}
}
if (this.isLeftEnd(connectedSofa, module, direction, block)) {
newModule = "straight_left_end";
} else {
newModule = "straight_right_end";
}
} else {
if (getSofaModule(block) == "corner_out") {
if (this.isAxeAligned(block, breakBlock) == "z") {
newModule = "straight_right_end";
newDirection = this.getInvertedDirection(this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa))
}
else {
newModule = "straight_left_end";
newDirection = this.getCornerDirectionForOut(direction, breakBlockDir, connectedSofa)
}
}
}
const updatedPermutation = block.permutation
.withState("lfg_ff:module", newModule)
.withState("minecraft:cardinal_direction", newDirection);
block.setPermutation(updatedPermutation);
system.runTimeout(() => {
const pillow = block.dimension.getEntities({ location: this.getBlockCenter(block), maxDistance: 0.7, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
let bonusRotation = 0;
if (newModule == "straight_right_end") {
bonusRotation = 30
} else if (newModule == "straight_left_end") {
bonusRotation = -30
} else if (newModule == "corner_in") {
bonusRotation = -45
} else if (newModule == "corner_out") {
bonusRotation = 45
}
pillow.teleport(this.adjustPillowLocation(newDirection, this.getBlockCenter(block), bonusRotation))
pillow.setRotation({ x: 0, y: this.getRotationFromDirection(newDirection) + bonusRotation })
pillow.setProperty("lfg_ff:rotation_y", this.getRotationFromDirection(newDirection) + bonusRotation);
}
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const player = e.player
const location = block.location
const placedFace = e.face;
const permutationToPlace = e.permutationToPlace;
const variant = permutationToPlace.getState("lfg_ff:variant");
const module = permutationToPlace.getState("lfg_ff:module");
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
let finalModule = "normal"
const possibleBlocks = this.getOffsettedBlockFromModule(module, direction, block)
const leftSofa = possibleBlocks.left
if (leftSofa.typeId == this.sofaId) {
const leftSofaModule = leftSofa.permutation.getState("lfg_ff:module");
const leftSofaDirection = leftSofa.permutation.getState('minecraft:cardinal_direction');
const leftSofaConnectedSofas = this.getConnectedSofas(leftSofa, leftSofaModule, leftSofaDirection)
if (leftSofaConnectedSofas.length < 2) {
const leftBlockBehindCurrent = this.getBlockInDir(leftSofa, direction, 1)
if (
(leftBlockBehindCurrent.typeId !== this.sofaId || (leftBlockBehindCurrent.typeId == this.sofaId && (leftSofaDirection == this.getDirectionFromBlocks(leftSofa, block) || leftSofaDirection == direction)))
&& !this.areOppositeDirections(leftSofaDirection, direction)
) {
if (
(leftSofaConnectedSofas.length == 0 && leftSofaDirection == direction) ||
(leftSofaConnectedSofas.length == 1 && (leftSofaDirection !== this.getDirectionFromBlocks(leftSofa, block) ||
(leftSofaDirection == this.getDirectionFromBlocks(leftSofa, block) && this.getBlockInDir(leftSofa, this.getOppositeDirection(direction), 1).typeId !== this.sofaId)))
) {
finalModule = "straight_right_end"
system.runTimeout(() => {
this.updateBlockModule(leftSofa, leftSofaModule, leftSofaDirection, e.block, leftSofaConnectedSofas.length == 0 ? null : leftSofaConnectedSofas[0])
}, 1)
}
}
}
}
const rightSofa = possibleBlocks.right
if (rightSofa.typeId == this.sofaId) {
const rightSofaModule = rightSofa.permutation.getState("lfg_ff:module");
const rightSofaDirection = rightSofa.permutation.getState('minecraft:cardinal_direction');
const rightSofaConnectedSofas = this.getConnectedSofas(rightSofa, rightSofaModule, rightSofaDirection)
if (rightSofaConnectedSofas.length < 2) {
const rightBlockBehindCurrent = this.getBlockInDir(rightSofa, direction, 1)
if (
(rightBlockBehindCurrent.typeId !== this.sofaId || (rightBlockBehindCurrent.typeId == this.sofaId && (rightSofaDirection == this.getDirectionFromBlocks(rightSofa, block) || rightSofaDirection == direction)))
&& !this.areOppositeDirections(rightSofaDirection, direction)
) {
if (
(rightSofaConnectedSofas.length == 0 && rightSofaDirection == direction) ||
(rightSofaConnectedSofas.length == 1 && (rightSofaDirection !== this.getDirectionFromBlocks(rightSofa, block) ||
(rightSofaDirection == this.getDirectionFromBlocks(rightSofa, block) && this.getBlockInDir(rightSofa, this.getOppositeDirection(direction), 1).typeId !== this.sofaId)))
) {
finalModule == "normal" ? finalModule = "straight_left_end" : finalModule = "straight";
system.runTimeout(() => {
this.updateBlockModule(rightSofa, rightSofaModule, rightSofaDirection, e.block, rightSofaConnectedSofas.length == 0 ? null : rightSofaConnectedSofas[0])
}, 1)
}
}
}
}
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", finalModule)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.run(() => {
block.dimension.playSound("dig.cloth", block.location, { volume: 0.5 })
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
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
getNeighborBlock(block, direction, side, filtertable) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filtertable)
return neighborBlock.typeId == this.sofaId ? neighborBlock : null;
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
getConnectedSofas(block, module, direction) {
const possibleBlocks = this.getOffsettedBlockFromModule(module, direction, block)
const connectedSofaList = []
if (possibleBlocks)
if (possibleBlocks.left.typeId == this.sofaId) connectedSofaList.push(possibleBlocks.left)
if (possibleBlocks)
if (possibleBlocks.right.typeId == this.sofaId) connectedSofaList.push(possibleBlocks.right)
return connectedSofaList;
}
updateBlockModule(block, module, direction, connectedSofa1, connectedSofa2) {
let newModule = "normal";
let newDirection = direction;
const getSofaDirection = (sofa) => sofa.permutation.getState('minecraft:cardinal_direction');
const getSofaModule = (sofa) => sofa.permutation.getState('lfg_ff:module');
if (connectedSofa1 && connectedSofa2) {
const sofa1Direction = getSofaDirection(connectedSofa1);
const sofa2Direction = getSofaDirection(connectedSofa2);
if (this.isAxeAligned(connectedSofa1, connectedSofa2)) {
if ((getSofaModule(connectedSofa2) == "normal") && this.isLeftEnd(connectedSofa2, module, direction, block)) {
newModule = "straight_right_end";
} else if (getSofaModule(connectedSofa2) == "normal") {
newModule = "straight_left_end";
} else {
newModule = "straight";
}
} else {
if (this.isCornerOut(sofa1Direction, sofa2Direction, connectedSofa1, connectedSofa2)) {
newModule = "corner_out";
newDirection = this.getCornerDirectionForOut(direction, sofa1Direction, sofa2Direction);
} else {
newModule = "corner_in";
newDirection = this.getCornerDirectionForIn(direction, sofa1Direction, sofa2Direction);
}
}
}
else if (connectedSofa1) {
if (this.isLeftEnd(connectedSofa1, module, direction, block)) {
newModule = "straight_left_end";
} else {
newModule = "straight_right_end";
}
}
const updatedPermutation = block.permutation
.withState("lfg_ff:module", newModule)
.withState("minecraft:cardinal_direction", newDirection);
block.setPermutation(updatedPermutation);
system.runTimeout(() => {
const pillow = block.dimension.getEntities({ location: this.getBlockCenter(block), maxDistance: 0.7, type: "lfg_ff:pillow_entity" })[0]
if (pillow) {
let bonusRotation = 0;
if (newModule == "straight_right_end") {
bonusRotation = 30
} else if (newModule == "straight_left_end") {
bonusRotation = -30
} else if (newModule == "corner_in") {
bonusRotation = -45
} else if (newModule == "corner_out") {
bonusRotation = 45
}
pillow.teleport(this.adjustPillowLocation(newDirection, this.getBlockCenter(block), bonusRotation))
pillow.setRotation({ x: 0, y: this.getRotationFromDirection(newDirection) + bonusRotation })
pillow.setProperty("lfg_ff:rotation_y", this.getRotationFromDirection(newDirection) + bonusRotation);
}
}, 1)
}
isLeftEnd(sofa1, module, direction, block) {
const possibleBlocks = this.getOffsettedBlockFromModule(module, direction, block)
return this.isSameLocation(possibleBlocks.right, sofa1)
}
isCornerOut(sofa1Direction, sofa2Direction, sofa1, sofa2) {
const backBlock1 = this.getBlockInDir(sofa1, sofa1Direction, 1)
const backBlock2 = this.getBlockInDir(sofa2, sofa2Direction, 1)
const backBlock2bis = this.getBlockInDir(sofa2, this.getInvertedDirection(sofa2Direction), 1)
return (this.isSameLocation(backBlock1, backBlock2) || (this.isSameLocation(backBlock1, backBlock2bis) && sofa2.permutation.getState("lfg_ff:module") == "corner_out"))
}
isSameLocation(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z;
}
isAxeAligned(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
if (loc1.x === loc2.x && loc1.y === loc2.y) {
return 'z';
} else if (loc1.y === loc2.y && loc1.z === loc2.z) {
return 'x';
}
return false;
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
getCornerDirectionForIn(direction, sofa1Direction, sofa2Direction) {
if ((sofa1Direction === 'west' && sofa2Direction === 'north') || (sofa1Direction === 'north' && sofa2Direction === 'west')) {
return 'north';
}
if ((sofa1Direction === 'north' && sofa2Direction === 'east') || (sofa1Direction === 'east' && sofa2Direction === 'north')) {
return 'east';
}
if ((sofa1Direction === 'east' && sofa2Direction === 'south') || (sofa1Direction === 'south' && sofa2Direction === 'east')) {
return 'south';
}
if ((sofa1Direction === 'south' && sofa2Direction === 'west') || (sofa1Direction === 'west' && sofa2Direction === 'south')) {
return 'west';
}
return direction;
}
getCornerDirectionForOut(direction, sofa1Direction, sofa2Direction) {
if ((sofa1Direction === 'west' && sofa2Direction === 'north') || (sofa1Direction === 'north' && sofa2Direction === 'west')) {
return 'west';
}
if ((sofa1Direction === 'north' && sofa2Direction === 'east') || (sofa1Direction === 'east' && sofa2Direction === 'north')) {
return 'north';
}
if ((sofa1Direction === 'east' && sofa2Direction === 'south') || (sofa1Direction === 'south' && sofa2Direction === 'east')) {
return 'east';
}
if ((sofa1Direction === 'south' && sofa2Direction === 'west') || (sofa1Direction === 'west' && sofa2Direction === 'south')) {
return 'south';
}
return direction;
}
areOppositeDirections(dir1, dir2) {
return (dir1 === 'north' && dir2 === 'south') ||
(dir1 === 'south' && dir2 === 'north') ||
(dir1 === 'east' && dir2 === 'west') ||
(dir1 === 'west' && dir2 === 'east');
}
getRoationFromDirection(direction) {
switch (direction) {
case 'north':
return 0;
case 'south':
return 180;
case 'east':
return 90;
case 'west':
return -90;
default:
return 0;
}
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
getBlockInDir(block, direction, dist) {
switch (direction) {
case 'north':
return block.north(dist);
case 'south':
return block.south(dist);
case 'east':
return block.east(dist);
case 'west':
return block.west(dist);
}
}
getFrontBlockOffsettedLocation(direction, loc) {
switch (direction) {
case 'north':
return { x: loc.x, y: loc.y, z: loc.z + 1 };
case 'south':
return { x: loc.x, y: loc.y, z: loc.z - 1 };
case 'east':
return { x: loc.x - 1, y: loc.y, z: loc.z };
case 'west':
return { x: loc.x + 1, y: loc.y, z: loc.z };
}
}
getOffsettedBlockFromModule(module, direction, block) {
switch (direction) {
case 'north':
switch (module) {
case 'normal':
case 'straight_right_end':
case 'straight_left_end':
case 'straight':
return { left: block.west(), right: block.east() }
case 'corner_out':
return { left: block.north(), right: block.east() }
case 'corner_in':
return { left: block.south(), right: block.east() }
}
break;
case 'south':
switch (module) {
case 'normal':
case 'straight_right_end':
case 'straight_left_end':
case 'straight':
return { left: block.east(), right: block.west() }
case 'corner_out':
return { left: block.south(), right: block.west() }
case 'corner_in':
return { left: block.north(), right: block.west() }
}
break;
case 'east':
switch (module) {
case 'normal':
case 'straight_right_end':
case 'straight_left_end':
case 'straight':
return { left: block.north(), right: block.south() }
case 'corner_out':
return { left: block.west(), right: block.north() }
case 'corner_in':
return { left: block.west(), right: block.south() }
}
break;
case 'west':
switch (module) {
case 'normal':
case 'straight_right_end':
case 'straight_left_end':
case 'straight':
return { left: block.south(), right: block.north() }
case 'corner_out':
return { left: block.east(), right: block.south() }
case 'corner_in':
return { left: block.east(), right: block.north() }
}
break;
}
}
calculateDistance(point1, point2) {
const dx = point2.x - point1.x;
const dy = point2.y - point1.y;
const dz = point2.z - point1.z;
return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const leftBlock = this.getOffsettedBlockFromModule(this.getModule(block), (this.getModule(block) == "corner_out" && (direction == "east" || direction == "west")) ? this.getOppositeDirection(direction) : direction, block).left
const rightBlock = this.getOffsettedBlockFromModule(this.getModule(block), (this.getModule(block) == "corner_out" && (direction == "east" || direction == "west")) ? this.getOppositeDirection(direction) : direction, block).right
const allSofas = [];
if (rightBlock && rightBlock.typeId == this.sofaId) allSofas.push(rightBlock)
if (leftBlock && leftBlock.typeId == this.sofaId) allSofas.push(leftBlock)
for (const expendedSofa of allSofas) {
const expendedVariant = this.getVariant(expendedSofa);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedSofa);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedSofa.setPermutation(expendedSofa.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedSofa, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
getVerticalPosition(block) {
return block.permutation.getState("minecraft:vertical_half")
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
adjustPillowLocation(direction, location, bonusRotation) {
const newLocation = { ...location };
let offsetValue = 0;
let cornerOffset = 0;
if (bonusRotation == 0) offsetValue = 0.15
if (bonusRotation == 30 || bonusRotation == -30) offsetValue = 0
if (bonusRotation == -45) {
offsetValue = -0.15
cornerOffset = 0.15 * ((direction == "north" || direction == "south") ? -1 : 1)
}
if (bonusRotation == 45) {
offsetValue = 0.15
cornerOffset = 0.15 * ((direction == "north" || direction == "south") ? -1 : 1)
}
switch (direction.toLowerCase()) {
case 'north':
newLocation.z -= offsetValue;
newLocation.x -= cornerOffset;
break;
case 'south':
newLocation.z += offsetValue;
newLocation.x += cornerOffset;
break;
case 'east':
newLocation.x += offsetValue;
newLocation.z += cornerOffset;
break;
case 'west':
newLocation.x -= offsetValue;
newLocation.z -= cornerOffset;
break;
default:
break;
}
return newLocation;
}
}