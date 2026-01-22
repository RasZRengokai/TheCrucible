/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class DoorComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.doorId = "lfg_ff:door"
this.MaxPaintedBlocksOnce = 200
this.MaxOpenedBlocksOnce = 30
this.lastState = {}
this.isInitialized = {}
this.REDSTONE_POWER_BLOCKS = [
{ id: "minecraft:powered_comparator", state: "minecraft:cardinal_direction" },
{ id: "minecraft:powered_repeater", state: "minecraft:cardinal_direction" },
{ id: "minecraft:redstone_torch", state: "torch_facing_direction" },
{ id: "minecraft:observer", state: "minecraft:facing_direction" },
];
}
openDoor(block, isPowered) {
const direction = block.permutation.getState('minecraft:cardinal_direction');
const key = `${block.location.x},${block.location.y},${block.location.z}`
const isOpen = block.permutation.getState("lfg_ff:open")
const expBlocks = this.getExpendBlocks(block, direction)
if (this.getYRangeDifference(expBlocks.map(b => b.location)) >= 10) {
return;
}
if (!this.isInitialized[key]) {
this.lastState[key] = !isPowered
this.isInitialized[key] = true
}
if (this.lastState[key] == isPowered) return;
this.lastState[key] = isPowered
if (!isPowered && !isOpen) return;
if (isPowered && isOpen) return;
const variant = block.permutation.getState("lfg_ff:variant");
let woodType = "wooden"
let doorType = this.getModule(block).includes("small") ? "trapdoor" : "door"
switch (variant) {
case 1: woodType = "wooden"; break;
case 2: woodType = "wooden"; break;
case 3: woodType = doorType == "door" ? "cherry_wood" : "bamboo_wood"; break;
case 4: woodType = "iron"; break;
case 5: woodType = doorType == "door" ? "cherry_wood" : "bamboo_wood"; break;
case 6: woodType = "bamboo_wood"; break;
case 7: woodType = "wooden"; break;
case 8: woodType = doorType == "door" ? "cherry_wood" : "bamboo_wood"; break;
case 9: woodType = "iron"; break;
case 10: woodType = "bamboo_wood"; break;
}
let sfx = `${woodType}_${doorType}`
block.dimension.playSound(!isOpen ? `open.${sfx}` : `close.${sfx}`, block.location)
for (const door of expBlocks) {
try {
door.setPermutation(door.permutation.withState("lfg_ff:open", !isOpen));
} catch (e) {
}
}
}
onPlayerInteract(e) {
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (["lfg_ff:variant_picker", "lfg_ff:debug_stick"].includes(handItem.typeId)) {
return
}
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const colorPickerMode = player.getDynamicProperty(`lfg_ff:${handItem.typeId.includes("small") ? "tvs" : "vs"}_color_brush_mode`) == 1
let newVariant = variant == 10 ? 1 : variant + 1
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
}
const isOpen = block.permutation.getState("lfg_ff:open")
const expBlocks = this.getExpendBlocks(block, direction)
if (this.getYRangeDifference(expBlocks.map(b => b.location)) >= 10) {
player.sendMessage("§cThe maximum door height is 10 blocks.")
player.playSound("note.bass")
return;
}
let woodType = "wooden"
let doorType = this.getModule(block).includes("small") ? "trapdoor" : "door"
switch (variant) {
case 1: woodType = "wooden"; break;
case 2: woodType = "wooden"; break;
case 3: woodType = doorType == "door" ? "cherry_wood" : "bamboo_wood"; break;
case 4: woodType = "iron"; break;
case 5: woodType = doorType == "door" ? "cherry_wood" : "bamboo_wood"; break;
case 6: woodType = "bamboo_wood"; break;
case 7: woodType = "wooden"; break;
case 8: woodType = doorType == "door" ? "cherry_wood" : "bamboo_wood"; break;
case 9: woodType = "iron"; break;
case 10: woodType = "bamboo_wood"; break;
}
let sfx = `${woodType}_${doorType}`
player.dimension.playSound(!isOpen ? `open.${sfx}` : `close.${sfx}`, block.location)
for (const door of expBlocks) {
try {
door.setPermutation(door.permutation.withState("lfg_ff:open", !isOpen));
} catch (e) {
}
}
}
getYRangeDifference(vectors) {
if (!Array.isArray(vectors) || vectors.length === 0) {
throw new Error("La liste des vecteurs est vide ou invalide.");
}
const yValues = vectors.map(vec => vec.y);
const minY = Math.min(...yValues);
const maxY = Math.max(...yValues);
return maxY - minY;
}
getExpendBlocks(block, direction, updateBlocks = new Set()) {
const affectedBlocks = [];
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updateBlocks.has(blockLocationKey)) {
return affectedBlocks;
}
updateBlocks.add(blockLocationKey);
affectedBlocks.push(block);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (leftBlock && this.getDirection(leftBlock) == direction && this.getModule(block).includes('right')) alldoors.push(leftBlock);
if (rightBlock && this.getDirection(rightBlock) == direction && this.getModule(block).includes('left')) alldoors.push(rightBlock);
if (upBlock && this.getDirection(upBlock) == direction) alldoors.push(upBlock);
if (downBlock && this.getDirection(downBlock) == direction) alldoors.push(downBlock);
for (const expendeddoor of alldoors) {
const expDir = this.getDirection(expendeddoor);
if (updateBlocks.size < this.MaxPaintedBlocksOnce) {
affectedBlocks.push(...this.getExpendBlocks(expendeddoor, expDir, updateBlocks));
}
}
return affectedBlocks;
}
onPlayerBreak(e) {
const block = e.block;
const player = e.player;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
system.runTimeout(() => {
if (brokenBlockPermutation.getState("lfg_ff:variant") == 4 || brokenBlockPermutation.getState("lfg_ff:variant") == 9)
block.dimension.playSound("break.iron", block.location)
this.updateAlldoor(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
if (this.getPlacementVariant(block, direction) == 4 || this.getPlacementVariant(block, direction) == 9)
block.dimension.playSound("break.iron", block.location)
this.updateAlldoor(block, direction)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down"];
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
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterdoor) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above();
else if (side == "down")
neighborBlock = block.below();
try {
if (filterdoor)
return neighborBlock.typeId == this.doorId ? neighborBlock : null;
else
return neighborBlock
} catch { return null }
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
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (leftBlock && this.getDirection(leftBlock) == direction && this.getModule(block).includes('right')) alldoors.push(leftBlock);
if (rightBlock && this.getDirection(rightBlock) == direction && this.getModule(block).includes('left')) alldoors.push(rightBlock);
if (upBlock && this.getDirection(upBlock) == direction) alldoors.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) alldoors.push(downBlock)
for (const expendeddoor of alldoors) {
const expendedVariant = this.getVariant(expendeddoor);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendeddoor);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendeddoor, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAlldoor(block, direction, updateddoorBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updateddoorBlocks.has(blockLocationKey)) {
return;
}
updateddoorBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (leftBlock && this.getDirection(leftBlock) == direction) alldoors.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) alldoors.push(rightBlock)
if (upBlock && this.getDirection(upBlock) == direction) alldoors.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) alldoors.push(downBlock)
if (block && block.typeId == this.doorId) alldoors.push(block)
for (const expendeddoor of alldoors) {
const expDir = this.getDirection(expendeddoor);
const expendedupBlock = this.getNeighborBlock(expendeddoor, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendeddoor, expDir, "down", true);
let expendedleftBlock = this.getNeighborBlock(expendeddoor, expDir, "left", true);
let expendedrightBlock = this.getNeighborBlock(expendeddoor, expDir, "right", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedupBlock, expendeddownBlock, expendedleftBlock, expendedrightBlock, expDir, expendeddoor);
expendeddoor.setPermutation(expendeddoor.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction).withState("lfg_ff:open", false));
system.runTimeout(() => {
try {
if (updateddoorBlocks.size <= 15)
this.updateAlldoor(expendeddoor, expNewModuleAndDir.direction, updateddoorBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, leftBlock, rightBlock, direction, block) {
const doors = []
const allBlocks = [upBlock, downBlock, leftBlock, rightBlock]
allBlocks.forEach((b) => {
if (!b) return;
doors.push(b)
})
if (!doors.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
if (!doors.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (!doors.includes(leftBlock) || this.getDirection(leftBlock) !== direction) leftBlock = null
if (!doors.includes(rightBlock) || this.getDirection(rightBlock) !== direction) rightBlock = null
if (!upBlock && !downBlock) {
if (leftBlock && !this.getModule(leftBlock).includes("right")) {
return { module: "small_right", direction: direction }
} else {
return { module: "small_left", direction: direction }
}
}
if (!upBlock && downBlock) {
if (leftBlock && !this.getModule(leftBlock).includes("right")) {
return { module: "top_right", direction: direction }
} else if (rightBlock && !this.getModule(rightBlock).includes("left")) {
return { module: "top_left", direction: direction }
} else {
return { module: "top_solo", direction: direction }
}
}
if (upBlock && downBlock) {
if (leftBlock && !this.getModule(leftBlock).includes("right")) {
return { module: "mid_right", direction: direction }
} else {
return { module: "mid_left", direction: direction }
}
}
if (upBlock && !downBlock) {
if (leftBlock && !this.getModule(leftBlock).includes("right")) {
return { module: "bot_right", direction: direction }
} else {
return { module: "bot_left", direction: direction }
}
}
return { module: this.getModule(block), direction: direction }
}
}