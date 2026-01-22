/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
export class GarageDoorComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.doorId = "lfg_ff:garage_door"
this.MaxPaintedBlocksOnce = 300
this.MaxRetractedBlocksOnce = 100
}
locKey(block) {
return `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
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
if (handItem.typeId == "lfg_ff:furniture_wrench") {
if (this.getModule(block) !== "retracted" && this.getModule(block) !== "normal") {
player.sendMessage("§cClose the door to set a connection key.")
player.playSound("note.bass")
return;
}
const masterKey = world.getDynamicProperty(this.locKey(block)) ?? undefined
const wirelessConnectionGUI = new ModalFormData()
.title("Switch Wireless Connection")
.textField("Enter the connection key:", "e.g `Bedroom1`", { defaultValue: masterKey, tooltip: undefined })
player.dimension.playSound("random.click", player.location, { volume: 1 })
wirelessConnectionGUI.show(player).then((selec) => {
if (selec.canceled) return;
const newMasterKey = String(selec.formValues[0])
world.setDynamicProperty(this.locKey(block), newMasterKey)
let widthLeft = block
let widthRight = block
while (widthLeft.typeId == this.doorId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
world.setDynamicProperty(this.locKey(widthLeft), newMasterKey)
} else {
break;
}
}
while (widthRight.typeId == this.doorId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
world.setDynamicProperty(this.locKey(widthRight), newMasterKey)
} else {
break;
}
}
});
return
}
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const colorPickerMode = player.getDynamicProperty(`lfg_ff:${handItem.typeId.includes("small") ? "tvs" : "vs"}_color_brush_mode`) == 1
let newVariant = variant == 6 ? 1 : variant + 1
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
const expBlocks = this.getExpendBlocks(block, direction)
if (expBlocks.length >= (this.MaxRetractedBlocksOnce)) {
player.sendMessage(`§cThe door is too large. (${expBlocks.length}/${this.MaxRetractedBlocksOnce - 1})`)
player.playSound("note.bass")
return;
}
if (!this.isFilledSquare(expBlocks.map(b => b.location))) {
player.sendMessage("§cThe door must be rectangular in shape.")
player.playSound("note.bass")
return;
}
if (this.getModule(block) == "retracted") {
let widthLeft = block
let widthRight = block
while (widthLeft.typeId == this.doorId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.doorId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
this.expendDeploySmall(block, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_open" : "lfg_ff:garage_door_open", center)
return;
}
this.expendDeploy(block, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_open" : "lfg_ff:garage_door_open", center)
} else if (this.getModule(block) !== "empty") {
let b = block
let origin = block
let widthLeft = block
let widthRight = block
let lastB = null
while (this.getModule(b) !== "end" && this.getModule(b) !== "normal" && b.typeId == this.doorId) {
b = this.getNeighborBlock(b, direction, "down", true)
if (!b) {
this.expendRetractSmall(lastB, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_close" : "lfg_ff:garage_door_close", center)
return
} else {
lastB = b
}
}
while (this.getModule(origin) !== "start" && this.getModule(origin) !== "normal" && origin.typeId == this.doorId) {
origin = this.getNeighborBlock(origin, direction, "up", true)
}
while (widthLeft.typeId == this.doorId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.doorId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
if (this.calculateDistance(origin.location, b.location) > 25) {
player.sendMessage("§cThe door is too long")
player.playSound("note.bass")
return;
}
this.expendRetractSmall(b, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_close" : "lfg_ff:garage_door_close", center)
return;
}
if (this.calculateDistance(widthLeft.location, widthRight.location) > 25) {
player.sendMessage("§cThe door is too wide")
player.playSound("note.bass")
return;
}
if (this.calculateDistance(origin.location, b.location) > 25) {
player.sendMessage("§cThe door is too long")
player.playSound("note.bass")
return;
}
this.expendRetract(b, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_close" : "lfg_ff:garage_door_close", center)
}
}
getAlignedEdgeBlocks(block) {
let widthLeft = block
let widthRight = block
const direction = block.permutation.getState('minecraft:cardinal_direction');
while (widthLeft.typeId == this.doorId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.doorId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
return { right: widthRight, left: widthLeft }
}
wirelessInteract(block, player) {
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const expBlocks = this.getExpendBlocks(block, direction)
if (expBlocks.length >= (this.MaxRetractedBlocksOnce)) {
return;
}
if (!this.isFilledSquare(expBlocks.map(b => b.location))) {
return;
}
if (this.getModule(block) == "retracted") {
let widthLeft = block
let widthRight = block
while (widthLeft.typeId == this.doorId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.doorId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
this.expendDeploySmall(block, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_open" : "lfg_ff:garage_door_open", center)
return;
}
this.expendDeploy(block, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_open" : "lfg_ff:garage_door_open", center)
} else if (this.getModule(block) !== "empty") {
let b = block
let origin = block
let widthLeft = block
let widthRight = block
let lastB = null
while (this.getModule(b) !== "end" && this.getModule(b) !== "normal" && b.typeId == this.doorId) {
b = this.getNeighborBlock(b, direction, "down", true)
if (!b) {
this.expendRetractSmall(lastB, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_close" : "lfg_ff:garage_door_close", center)
return
} else {
lastB = b
}
}
while (this.getModule(origin) !== "start" && this.getModule(origin) !== "normal" && origin.typeId == this.doorId) {
origin = this.getNeighborBlock(origin, direction, "up", true)
}
while (widthLeft.typeId == this.doorId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.doorId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
if (this.calculateDistance(origin.location, b.location) > 25) {
return;
}
this.expendRetractSmall(b, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_close" : "lfg_ff:garage_door_close", center)
return;
}
if (this.calculateDistance(widthLeft.location, widthRight.location) > 25) {
return;
}
if (this.calculateDistance(origin.location, b.location) > 25) {
return;
}
this.expendRetract(b, direction)
player.dimension.playSound([2, 3].includes(variant) ? "lfg_ff:wood_garage_door_close" : "lfg_ff:garage_door_close", center)
}
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
if (leftBlock && this.getDirection(leftBlock) == direction) alldoors.push(leftBlock);
if (rightBlock && this.getDirection(rightBlock) == direction) alldoors.push(rightBlock);
if (upBlock && this.getDirection(upBlock) == direction) alldoors.push(upBlock);
if (downBlock && this.getDirection(downBlock) == direction) alldoors.push(downBlock);
for (const expendeddoor of alldoors) {
const expDir = this.getDirection(expendeddoor);
if (updateBlocks.size < this.MaxRetractedBlocksOnce) {
affectedBlocks.push(...this.getExpendBlocks(expendeddoor, expDir, updateBlocks));
}
}
return affectedBlocks;
}
isFilledSquare(locations) {
if (locations.length < 2) return false;
const xSet = new Set(locations.map(loc => loc.x));
const zSet = new Set(locations.map(loc => loc.z));
const ySet = new Set(locations.map(loc => loc.y));
let primaryAxis, secondaryAxis;
if (xSet.size > 1 && zSet.size === 1) {
primaryAxis = "x";
secondaryAxis = "y";
} else if (zSet.size > 1 && xSet.size === 1) {
primaryAxis = "z";
secondaryAxis = "y";
} else {
return false;
}
const primaryValues = locations.map(loc => loc[primaryAxis]);
const secondaryValues = locations.map(loc => loc[secondaryAxis]);
const minPrimary = Math.min(...primaryValues);
const maxPrimary = Math.max(...primaryValues);
const minSecondary = Math.min(...secondaryValues);
const maxSecondary = Math.max(...secondaryValues);
const uniqueCoords = new Set(locations.map(loc => `${loc[primaryAxis]},${loc[secondaryAxis]}`));
for (let primary = minPrimary; primary <= maxPrimary; primary++) {
for (let secondary = minSecondary; secondary <= maxSecondary; secondary++) {
if (!uniqueCoords.has(`${primary},${secondary}`)) {
return false;
}
}
}
return true;
}
calculateDistance(point1, point2) {
const dx = point2.x - point1.x;
const dy = point2.y - point1.y;
const dz = point2.z - point1.z;
return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
onPlayerBreak(e) {
const block = e.block;
const player = e.player;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const blockLocationKey = `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
world.setDynamicProperty(blockLocationKey, null);
if (brokenBlockPermutation.getState("lfg_ff:module") == "retracted") {
return;
}
if (brokenBlockPermutation.getState("lfg_ff:variant") == 4)
block.dimension.playSound("dig.chain", block.location, { pitch: 1.5 })
if (brokenBlockPermutation.getState("lfg_ff:variant") == 2 || brokenBlockPermutation.getState("lfg_ff:variant") == 3)
block.dimension.playSound("dig.wood", block.location, { pitch: 0.65 })
system.runTimeout(() => {
this.updateAlldoor(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAlldoor(block, direction)
}, 1)
const placementVar = this.getPlacementVariant(block, direction)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar)
system.run(() => {
if (placementVar == 4)
block.dimension.playSound("dig.chain", block.location, { pitch: 1.5 })
if (placementVar == 2 || placementVar == 3)
block.dimension.playSound("dig.wood", block.location, { pitch: 0.65 })
})
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
if (filterdoor)
return neighborBlock.typeId == this.doorId ? neighborBlock : null;
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
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (leftBlock && this.getDirection(leftBlock) == direction) alldoors.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) alldoors.push(rightBlock)
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
expendDeploySmall(block, direction, updatedSmallDeployedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedSmallDeployedBlocks.has(blockLocationKey)) {
return;
}
updatedSmallDeployedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (block) alldoors.push(block)
if (leftBlock && this.getDirection(leftBlock) == direction) alldoors.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) alldoors.push(rightBlock)
if (upBlock && this.getDirection(upBlock) == direction) alldoors.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) alldoors.push(downBlock)
for (const expendeddoor of alldoors) {
system.runTimeout(() => {
try {
const expDir = this.getDirection(expendeddoor);
if (this.getModule(expendeddoor) == "retracted") {
if (downBlock && this.getDirection(downBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "start"))
else
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendeddoor) == "empty") {
system.runTimeout(() => {
this.updateAlldoor(expendeddoor, expDir)
}, 1);
if (downBlock && this.getDirection(downBlock) == direction && upBlock && this.getDirection(upBlock) == direction) {
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "center"))
}
else if ((!downBlock || this.getDirection(downBlock) !== direction) && upBlock && this.getDirection(upBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "end"))
}
this.expendDeploySmall(expendeddoor, expDir, updatedSmallDeployedBlocks);
} catch (e) {
}
}, 1);
}
}
expendRetractSmall(block, direction, updatedSmallRetractedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedSmallRetractedBlocks.has(blockLocationKey)) {
return;
}
updatedSmallRetractedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (block) alldoors.push(block)
if (leftBlock && this.getDirection(leftBlock) == direction) alldoors.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) alldoors.push(rightBlock)
if (upBlock && this.getDirection(upBlock) == direction) alldoors.push(upBlock)
if (downBlock && this.getDirection(downBlock) == direction) alldoors.push(downBlock)
for (const expendeddoor of alldoors) {
system.runTimeout(() => {
try {
const expDir = this.getDirection(expendeddoor);
if (this.getModule(expendeddoor) == "normal" || this.getModule(expendeddoor) == "start")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendeddoor) !== "retracted" && this.getModule(expendeddoor) !== "empty")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "empty"));
this.expendRetractSmall(expendeddoor, expDir, updatedSmallRetractedBlocks);
} catch (e) {
}
}, 1);
}
}
expendRetract(block, direction, updatedRetractedBlocks = new Set(), retractedLineCount = 0) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedRetractedBlocks.has(blockLocationKey)) {
return;
}
updatedRetractedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (leftBlock && this.getDirection(leftBlock) == direction && this.getModule(leftBlock) !== "empty") alldoors.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction && this.getModule(rightBlock) !== "empty") alldoors.push(rightBlock)
let nextLine = false
if (alldoors.length == 0) {
nextLine = true
if (upBlock && this.getDirection(upBlock) == direction && this.getModule(upBlock) !== "empty") alldoors.push(upBlock)
}
for (const expendeddoor of alldoors) {
const expDir = this.getDirection(expendeddoor);
if (updatedRetractedBlocks.size < this.MaxPaintedBlocksOnce) {
if (nextLine) {
system.runTimeout(() => {
try {
if (this.getModule(expendeddoor) == "normal" || this.getModule(expendeddoor) == "start")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendeddoor) !== "retracted" && this.getModule(expendeddoor) !== "empty")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "empty"));
this.expendRetract(expendeddoor, expDir, updatedRetractedBlocks);
} catch (e) {
}
}, 1);
} else {
if (retractedLineCount < 15)
try {
if (this.getModule(expendeddoor) == "normal" || this.getModule(expendeddoor) == "start")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendeddoor) !== "retracted" && this.getModule(expendeddoor) !== "empty")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "empty"));
retractedLineCount++
this.expendRetract(expendeddoor, expDir, updatedRetractedBlocks, retractedLineCount);
} catch (e) {
}
else
system.runTimeout(() => {
try {
if (this.getModule(expendeddoor) == "normal" || this.getModule(expendeddoor) == "start")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendeddoor) !== "retracted" && this.getModule(expendeddoor) !== "empty")
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "empty"));
this.expendRetract(expendeddoor, expDir, updatedRetractedBlocks);
} catch (e) {
}
}, 1);
}
}
}
}
expendDeploy(block, direction, updatedDeployedBlocks = new Set(), deployedLineCount = 0) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedDeployedBlocks.has(blockLocationKey)) {
return;
}
updatedDeployedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (leftBlock && this.getDirection(leftBlock) == direction && (this.getModule(leftBlock) == "empty" || this.getModule(leftBlock) == "retracted")) alldoors.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction && (this.getModule(rightBlock) == "empty" || this.getModule(rightBlock) == "retracted")) alldoors.push(rightBlock)
let nextLine = false
if (alldoors.length == 0) {
nextLine = true
if (downBlock && this.getDirection(downBlock) == direction && this.getModule(downBlock) == "empty") alldoors.push(downBlock)
}
for (const expendeddoor of alldoors) {
const expDir = this.getDirection(expendeddoor);
if (updatedDeployedBlocks.size < this.MaxPaintedBlocksOnce) {
if (nextLine) {
system.runTimeout(() => {
try {
if (this.getModule(expendeddoor) == "retracted") {
if (downBlock && this.getDirection(downBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "start"))
else
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendeddoor) == "empty") {
system.runTimeout(() => {
this.updateAlldoor(expendeddoor, expDir)
}, 1);
if (downBlock && this.getDirection(downBlock) == direction && upBlock && this.getDirection(upBlock) == direction) {
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "center"))
}
else if ((!downBlock || this.getDirection(downBlock) !== direction) && upBlock && this.getDirection(upBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "end"))
}
this.expendDeploy(expendeddoor, expDir, updatedDeployedBlocks);
} catch (e) {
}
}, 1);
} else {
if (deployedLineCount < 15)
try {
if (this.getModule(expendeddoor) == "retracted") {
if (downBlock && this.getDirection(downBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "start"))
else
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendeddoor) == "empty") {
system.runTimeout(() => {
this.updateAlldoor(expendeddoor, expDir)
}, 1);
if (downBlock && this.getDirection(downBlock) == direction && upBlock && this.getDirection(upBlock) == direction) {
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "center"))
}
else if ((!downBlock || this.getDirection(downBlock) !== direction) && upBlock && this.getDirection(upBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "end"))
}
deployedLineCount++
this.expendDeploy(expendeddoor, expDir, updatedDeployedBlocks, deployedLineCount);
} catch (e) {
}
else
system.runTimeout(() => {
try {
if (this.getModule(expendeddoor) == "retracted") {
if (downBlock && this.getDirection(downBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "start"))
else
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendeddoor) == "empty") {
system.runTimeout(() => {
this.updateAlldoor(expendeddoor, expDir)
}, 1);
if (downBlock && this.getDirection(downBlock) == direction && upBlock && this.getDirection(upBlock) == direction) {
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "center"))
}
else if ((!downBlock || this.getDirection(downBlock) !== direction) && upBlock && this.getDirection(upBlock) == direction)
expendeddoor.setPermutation(expendeddoor.permutation.withState("lfg_ff:module", "end"))
}
this.expendDeploy(expendeddoor, expDir, updatedDeployedBlocks);
} catch (e) {
}
}, 1);
}
}
}
}
updateAlldoor(block, direction, updateddoorBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updateddoorBlocks.has(blockLocationKey)) {
return;
}
updateddoorBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const alldoors = [];
if (upBlock) alldoors.push(upBlock)
if (downBlock) alldoors.push(downBlock)
for (const expendeddoor of alldoors) {
const expDir = this.getDirection(expendeddoor);
const expendedupBlock = this.getNeighborBlock(expendeddoor, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendeddoor, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedupBlock, expendeddownBlock, expDir, expendeddoor);
expendeddoor.setPermutation(expendeddoor.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updateddoorBlocks.size <= 2)
this.updateAlldoor(expendeddoor, expNewModuleAndDir.direction, updateddoorBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, direction, block) {
const doors = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
doors.push(b)
})
if (!doors.includes(upBlock) || this.getDirection(upBlock) !== direction) upBlock = null
if (!doors.includes(downBlock) || this.getDirection(downBlock) !== direction) downBlock = null
if (!upBlock && !downBlock) return { module: "normal", direction: direction }
if (!upBlock && downBlock) return { module: "start", direction: direction }
if (upBlock && downBlock) return { module: "center", direction: direction }
if (upBlock && !downBlock) return { module: "end", direction: direction }
}
}
world.beforeEvents.playerBreakBlock.subscribe((e) => {
const { block, player, dimension, itemStack } = e
if (block.typeId == "lfg_ff:garage_door" && (block.permutation.getState("lfg_ff:module") == "retracted" || block.permutation.getState("lfg_ff:module") == "empty")) {
e.cancel = true
system.runTimeout(() => {
player.sendMessage("§cOpen the door before breaking it.")
player.playSound("note.bass")
}, 1)
}
})