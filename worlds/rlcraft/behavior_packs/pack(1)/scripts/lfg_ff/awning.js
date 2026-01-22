/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
export class AwningComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.awningId = "lfg_ff:awning"
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
player.sendMessage("§cClose the awning to set a connection key.")
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
while (widthLeft.typeId == this.awningId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
world.setDynamicProperty(this.locKey(widthLeft), newMasterKey)
} else {
break;
}
}
while (widthRight.typeId == this.awningId) {
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
let newVariant = variant == 5 ? 1 : variant + 1
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
player.sendMessage(`§cThe awning is too large. (${expBlocks.length}/${this.MaxRetractedBlocksOnce - 1})`)
player.playSound("note.bass")
return;
}
if (!this.isFilledSquare(expBlocks.map(b => b.location))) {
player.sendMessage("§cThe awning must be rectangular in shape.")
player.playSound("note.bass")
return;
}
if (this.getModule(block) == "retracted") {
let widthLeft = block
let widthRight = block
while (widthLeft.typeId == this.awningId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.awningId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
this.expendDeploySmall(block, direction)
player.dimension.playSound("lfg_ff:awning_out", center)
return;
}
this.expendDeploy(block, direction)
player.dimension.playSound("lfg_ff:awning_out", center)
} else if (this.getModule(block) !== "empty") {
let b = block
let origin = block
let widthLeft = block
let widthRight = block
while (this.getModule(b) !== "end" && this.getModule(b) !== "normal" && b.typeId == this.awningId) {
b = this.getNeighborBlock(b, direction, "back", true)
}
while (this.getModule(origin) !== "start" && this.getModule(origin) !== "normal" && origin.typeId == this.awningId) {
origin = this.getNeighborBlock(origin, direction, "front", true)
}
while (widthLeft.typeId == this.awningId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.awningId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
if (this.calculateDistance(origin.location, b.location) > 25) {
player.sendMessage("§cThe awning is too long")
player.playSound("note.bass")
return;
}
this.expendRetractSmall(b, direction)
player.dimension.playSound("lfg_ff:awning_in", center)
return;
}
if (this.calculateDistance(widthLeft.location, widthRight.location) > 25) {
player.sendMessage("§cThe awning is too wide")
player.playSound("note.bass")
return;
}
if (this.calculateDistance(origin.location, b.location) > 25) {
player.sendMessage("§cThe awning is too long")
player.playSound("note.bass")
return;
}
this.expendRetract(b, direction)
player.dimension.playSound("lfg_ff:awning_in", center)
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
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
if (!block) return;
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
while (widthLeft.typeId == this.awningId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.awningId) {
if (this.getNeighborBlock(widthRight, direction, "right", true)) {
widthRight = this.getNeighborBlock(widthRight, direction, "right", true)
} else {
break;
}
}
if (this.calculateDistance(widthLeft.location, widthRight.location) < 2) {
this.expendDeploySmall(block, direction)
player.dimension.playSound("lfg_ff:awning_out", center)
return;
}
this.expendDeploy(block, direction)
player.dimension.playSound("lfg_ff:awning_out", center)
} else if (this.getModule(block) !== "empty") {
let b = block
let origin = block
let widthLeft = block
let widthRight = block
while (this.getModule(b) !== "end" && this.getModule(b) !== "normal" && b?.typeId == this.awningId) {
b = this.getNeighborBlock(b, direction, "back", true)
}
while (this.getModule(origin) !== "start" && this.getModule(origin) !== "normal" && origin?.typeId == this.awningId) {
origin = this.getNeighborBlock(origin, direction, "front", true)
}
if (!origin || !b) return;
while (widthLeft.typeId == this.awningId) {
if (this.getNeighborBlock(widthLeft, direction, "left", true)) {
widthLeft = this.getNeighborBlock(widthLeft, direction, "left", true)
} else {
break;
}
}
while (widthRight.typeId == this.awningId) {
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
player.dimension.playSound("lfg_ff:awning_in", center)
return;
}
if (this.calculateDistance(widthLeft.location, widthRight.location) > 25) {
return;
}
if (this.calculateDistance(origin.location, b.location) > 25) {
return;
}
this.expendRetract(b, direction)
player.dimension.playSound("lfg_ff:awning_in", center)
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allawnings = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allawnings.push(leftBlock);
if (rightBlock && this.getDirection(rightBlock) == direction) allawnings.push(rightBlock);
if (frontBlock && this.getDirection(frontBlock) == direction) allawnings.push(frontBlock);
if (backBlock && this.getDirection(backBlock) == direction) allawnings.push(backBlock);
for (const expendedawning of allawnings) {
const expDir = this.getDirection(expendedawning);
if (updateBlocks.size < this.MaxRetractedBlocksOnce) {
affectedBlocks.push(...this.getExpendBlocks(expendedawning, expDir, updateBlocks));
}
}
return affectedBlocks;
}
isFilledSquare(locations) {
const uniqueCoords = new Set(locations.map(loc => `${loc.x},${loc.z}`));
const xValues = locations.map(loc => loc.x);
const zValues = locations.map(loc => loc.z);
const minX = Math.min(...xValues);
const maxX = Math.max(...xValues);
const minZ = Math.min(...zValues);
const maxZ = Math.max(...zValues);
const width = maxX - minX;
const height = maxZ - minZ;
if (width < 0 || height < 0) {
return false;
}
for (let x = minX; x <= maxX; x++) {
for (let z = minZ; z <= maxZ; z++) {
if (!uniqueCoords.has(`${x},${z}`)) {
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
block.dimension.playSound("block.scaffolding.break", block.location, { volume: 0.5 })
if (brokenBlockPermutation.getState("lfg_ff:module") == "retracted") {
return;
}
system.runTimeout(() => {
this.updateAllawning(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.run(() => {
block.dimension.playSound("block.scaffolding.place", block.location, { volume: 0.5 })
})
e.permutationToPlace = permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.runTimeout(() => {
this.updateAllawning(block, direction)
}, 1)
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
getModule(block) {
if (!block) return null;
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
getNeighborBlock(block, direction, side, filterawning) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterawning)
return neighborBlock.typeId == this.awningId ? neighborBlock : null;
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
const allawnings = [];
if (leftBlock && this.getDirection(leftBlock) == direction) allawnings.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allawnings.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allawnings.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allawnings.push(backBlock)
for (const expendedawning of allawnings) {
const expendedVariant = this.getVariant(expendedawning);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedawning);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedawning, expDir, newVariant, updatedPaintedBlocks);
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allawnings = [];
if (block) allawnings.push(block)
if (leftBlock && this.getDirection(leftBlock) == direction) allawnings.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allawnings.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allawnings.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allawnings.push(backBlock)
for (const expendedawning of allawnings) {
system.runTimeout(() => {
try {
const expDir = this.getDirection(expendedawning);
if (this.getModule(expendedawning) == "retracted") {
if (backBlock && this.getDirection(backBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "start"))
else
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendedawning) == "empty") {
system.runTimeout(() => {
this.updateAllawning(expendedawning, expDir)
}, 1);
if (backBlock && this.getDirection(backBlock) == direction && frontBlock && this.getDirection(frontBlock) == direction) {
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "center"))
}
else if ((!backBlock || this.getDirection(backBlock) !== direction) && frontBlock && this.getDirection(frontBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "end"))
}
this.expendDeploySmall(expendedawning, expDir, updatedSmallDeployedBlocks);
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allawnings = [];
if (block) allawnings.push(block)
if (leftBlock && this.getDirection(leftBlock) == direction) allawnings.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction) allawnings.push(rightBlock)
if (frontBlock && this.getDirection(frontBlock) == direction) allawnings.push(frontBlock)
if (backBlock && this.getDirection(backBlock) == direction) allawnings.push(backBlock)
for (const expendedawning of allawnings) {
system.runTimeout(() => {
try {
const expDir = this.getDirection(expendedawning);
if (this.getModule(expendedawning) == "normal" || this.getModule(expendedawning) == "start")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendedawning) !== "retracted" && this.getModule(expendedawning) !== "empty")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "empty"));
this.expendRetractSmall(expendedawning, expDir, updatedSmallRetractedBlocks);
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allawnings = [];
if (leftBlock && this.getDirection(leftBlock) == direction && this.getModule(leftBlock) !== "empty") allawnings.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction && this.getModule(rightBlock) !== "empty") allawnings.push(rightBlock)
let nextLine = false
if (allawnings.length == 0) {
nextLine = true
if (frontBlock && this.getDirection(frontBlock) == direction && this.getModule(frontBlock) !== "empty") allawnings.push(frontBlock)
}
for (const expendedawning of allawnings) {
const expDir = this.getDirection(expendedawning);
if (updatedRetractedBlocks.size < this.MaxPaintedBlocksOnce) {
if (nextLine) {
system.runTimeout(() => {
try {
if (this.getModule(expendedawning) == "normal" || this.getModule(expendedawning) == "start")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendedawning) !== "retracted" && this.getModule(expendedawning) !== "empty")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "empty"));
this.expendRetract(expendedawning, expDir, updatedRetractedBlocks);
} catch (e) {
}
}, 1);
} else {
if (retractedLineCount < 15)
try {
if (this.getModule(expendedawning) == "normal" || this.getModule(expendedawning) == "start")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendedawning) !== "retracted" && this.getModule(expendedawning) !== "empty")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "empty"));
retractedLineCount++
this.expendRetract(expendedawning, expDir, updatedRetractedBlocks, retractedLineCount);
} catch (e) {
}
else
system.runTimeout(() => {
try {
if (this.getModule(expendedawning) == "normal" || this.getModule(expendedawning) == "start")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "retracted"));
else if (this.getModule(expendedawning) !== "retracted" && this.getModule(expendedawning) !== "empty")
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "empty"));
this.expendRetract(expendedawning, expDir, updatedRetractedBlocks);
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
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allawnings = [];
if (leftBlock && this.getDirection(leftBlock) == direction && (this.getModule(leftBlock) == "empty" || this.getModule(leftBlock) == "retracted")) allawnings.push(leftBlock)
if (rightBlock && this.getDirection(rightBlock) == direction && (this.getModule(rightBlock) == "empty" || this.getModule(rightBlock) == "retracted")) allawnings.push(rightBlock)
let nextLine = false
if (allawnings.length == 0) {
nextLine = true
if (backBlock && this.getDirection(backBlock) == direction && this.getModule(backBlock) == "empty") allawnings.push(backBlock)
}
for (const expendedawning of allawnings) {
const expDir = this.getDirection(expendedawning);
if (updatedDeployedBlocks.size < this.MaxPaintedBlocksOnce) {
if (nextLine) {
system.runTimeout(() => {
try {
if (this.getModule(expendedawning) == "retracted") {
if (backBlock && this.getDirection(backBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "start"))
else
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendedawning) == "empty") {
system.runTimeout(() => {
this.updateAllawning(expendedawning, expDir)
}, 1);
if (backBlock && this.getDirection(backBlock) == direction && frontBlock && this.getDirection(frontBlock) == direction) {
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "center"))
}
else if ((!backBlock || this.getDirection(backBlock) !== direction) && frontBlock && this.getDirection(frontBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "end"))
}
this.expendDeploy(expendedawning, expDir, updatedDeployedBlocks);
} catch (e) {
}
}, 1);
} else {
if (deployedLineCount < 15)
try {
if (this.getModule(expendedawning) == "retracted") {
if (backBlock && this.getDirection(backBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "start"))
else
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendedawning) == "empty") {
system.runTimeout(() => {
this.updateAllawning(expendedawning, expDir)
}, 1);
if (backBlock && this.getDirection(backBlock) == direction && frontBlock && this.getDirection(frontBlock) == direction) {
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "center"))
}
else if ((!backBlock || this.getDirection(backBlock) !== direction) && frontBlock && this.getDirection(frontBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "end"))
}
deployedLineCount++
this.expendDeploy(expendedawning, expDir, updatedDeployedBlocks, deployedLineCount);
} catch (e) {
}
else
system.runTimeout(() => {
try {
if (this.getModule(expendedawning) == "retracted") {
if (backBlock && this.getDirection(backBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "start"))
else
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "normal"))
}
else if (this.getModule(expendedawning) == "empty") {
system.runTimeout(() => {
this.updateAllawning(expendedawning, expDir)
}, 1);
if (backBlock && this.getDirection(backBlock) == direction && frontBlock && this.getDirection(frontBlock) == direction) {
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "center"))
}
else if ((!backBlock || this.getDirection(backBlock) !== direction) && frontBlock && this.getDirection(frontBlock) == direction)
expendedawning.setPermutation(expendedawning.permutation.withState("lfg_ff:module", "end"))
}
this.expendDeploy(expendedawning, expDir, updatedDeployedBlocks);
} catch (e) {
}
}, 1);
}
}
}
}
updateAllawning(block, direction, updatedawningBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedawningBlocks.has(blockLocationKey)) {
return;
}
updatedawningBlocks.add(blockLocationKey);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allawnings = [];
if (frontBlock) allawnings.push(frontBlock)
if (backBlock) allawnings.push(backBlock)
for (const expendedawning of allawnings) {
const expDir = this.getDirection(expendedawning);
const expendedFrontBlock = this.getNeighborBlock(expendedawning, expDir, "front", true);
const expendedBackBlock = this.getNeighborBlock(expendedawning, expDir, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedFrontBlock, expendedBackBlock, expDir, expendedawning);
expendedawning.setPermutation(expendedawning.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedawningBlocks.size <= 2)
this.updateAllawning(expendedawning, expNewModuleAndDir.direction, updatedawningBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(frontBlock, backBlock, direction, block) {
const awnings = []
const allBlocks = [frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
awnings.push(b)
})
if (!awnings.includes(frontBlock) || this.getDirection(frontBlock) !== direction) frontBlock = null
if (!awnings.includes(backBlock) || this.getDirection(backBlock) !== direction) backBlock = null
if (!frontBlock && !backBlock) return { module: "normal", direction: direction }
if (!frontBlock && backBlock) return { module: "start", direction: direction }
if (frontBlock && backBlock) return { module: "center", direction: direction }
if (frontBlock && !backBlock) return { module: "end", direction: direction }
}
}
world.beforeEvents.playerBreakBlock.subscribe((e) => {
const { block, player, dimension, itemStack } = e
if (block.typeId == "lfg_ff:awning" && (block.permutation.getState("lfg_ff:module") == "retracted" || block.permutation.getState("lfg_ff:module") == "empty")) {
e.cancel = true
system.runTimeout(() => {
player.sendMessage("§cOpen the awning before breaking it.")
player.playSound("note.bass")
}, 1)
}
})