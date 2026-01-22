/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class FenceGateComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.fenceGateId = "lfg_ff:fence_gate"
this.fenceId = "lfg_ff:fence"
this.MaxPaintedBlocksOnce = 500
this.lastState = {}
this.isInitialized = {}
this.REDSTONE_POWER_BLOCKS = [
{ id: "minecraft:powered_comparator", state: "minecraft:cardinal_direction" },
{ id: "minecraft:powered_repeater", state: "minecraft:cardinal_direction" },
{ id: "minecraft:redstone_torch", state: "torch_facing_direction" },
{ id: "minecraft:observer", state: "minecraft:facing_direction" },
];
}
openFenceGate(block, isPowered) {
const key = `${block.location.x},${block.location.y},${block.location.z}`
if (!this.isInitialized[key]) {
this.lastState[key] = !isPowered
this.isInitialized[key] = true
}
if (this.lastState[key] == isPowered) return;
this.lastState[key] = isPowered
const isOpen = block.permutation.getState("lfg_ff:module") != "close"
if (!isPowered && !isOpen) return;
if (isPowered && isOpen) return;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
let sfx = ""
switch (variant) {
case 1: sfx = "fence_gate"; break;
case 2: sfx = "nether_wood_fence_gate"; break;
case 3: sfx = "bamboo_wood_fence_gate"; break;
case 4: sfx = "fence_gate"; break;
case 5: sfx = "iron_trapdoor"; break;
case 6: sfx = "iron_trapdoor"; break;
case 7: sfx = "fence_gate"; break;
case 8: sfx = "bamboo_wood_fence_gate"; break;
case 9: sfx = "iron_trapdoor"; break;
case 10: sfx = "iron_trapdoor"; break;
}
const above = block.above()
const direction = block.permutation.getState('minecraft:cardinal_direction');
if (module == "close") {
block.dimension.playSound(`open.${sfx}`, block.location)
block.setPermutation(block.permutation.withState("lfg_ff:module", "open"))
if (above.typeId == "lfg_ff:fence_box") {
if (block.isWaterlogged)
block.dimension.runCommand(`setblock ${above.location.x} ${above.location.y} ${above.location.z} minecraft:water replace`);
else
block.dimension.runCommand(`setblock ${above.location.x} ${above.location.y} ${above.location.z} minecraft:air replace`);
}
} else {
block.dimension.playSound(`close.${sfx}`, block.location)
block.setPermutation(block.permutation.withState("lfg_ff:module", "close"))
if (this.isNonSolidBlock(above)) {
try {
above.setPermutation(BlockPermutation.resolve("lfg_ff:fence_box")
.withState('lfg_ff:module', "c2s")
.withState('minecraft:cardinal_direction', this.getInvertedDirection(direction)));
} catch { }
}
}
}
onPlayerInteract(e) {
const block = e.block;
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
return
}
}
const playerRotation = player.getRotation().y;
const gateRotation = this.getRotationFromDirection(direction);
let rotationDifference = Math.abs(playerRotation - gateRotation);
if (rotationDifference > 180) {
rotationDifference = 360 - rotationDifference;
}
let sfx = ""
switch (variant) {
case 1: sfx = "fence_gate"; break;
case 2: sfx = "nether_wood_fence_gate"; break;
case 3: sfx = "bamboo_wood_fence_gate"; break;
case 4: sfx = "fence_gate"; break;
case 5: sfx = "iron_trapdoor"; break;
case 6: sfx = "iron_trapdoor"; break;
case 7: sfx = "fence_gate"; break;
case 8: sfx = "bamboo_wood_fence_gate"; break;
case 9: sfx = "iron_trapdoor"; break;
case 10: sfx = "iron_trapdoor"; break;
}
const above = block.above()
if (module == "close") {
player.dimension.playSound(`open.${sfx}`, block.location)
if (rotationDifference <= 90)
block.setPermutation(block.permutation.withState("lfg_ff:module", "open_reverse"))
else
block.setPermutation(block.permutation.withState("lfg_ff:module", "open"))
if (above.typeId == "lfg_ff:fence_box") {
if (block.isWaterlogged)
block.dimension.runCommand(`setblock ${above.location.x} ${above.location.y} ${above.location.z} minecraft:water replace`);
else
block.dimension.runCommand(`setblock ${above.location.x} ${above.location.y} ${above.location.z} minecraft:air replace`);
}
} else {
player.dimension.playSound(`close.${sfx}`, block.location)
block.setPermutation(block.permutation.withState("lfg_ff:module", "close"))
if (this.isNonSolidBlock(above)) {
try {
above.setPermutation(BlockPermutation.resolve("lfg_ff:fence_box")
.withState('lfg_ff:module', "c2s")
.withState('minecraft:cardinal_direction', this.getInvertedDirection(direction)));
} catch { }
}
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
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
const above = block.above()
if (above.typeId == "lfg_ff:fence_box") {
if (block.isWaterlogged)
block.dimension.runCommand(`setblock ${above.location.x} ${above.location.y} ${above.location.z} minecraft:water replace`);
else
block.dimension.runCommand(`setblock ${above.location.x} ${above.location.y} ${above.location.z} minecraft:air replace`);
}
this.updateAllfence(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllfence(block, direction)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
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
getNeighborBlock(block, direction, side, filterfence) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterfence)
return (
neighborBlock.typeId == this.fenceId
|| (neighborBlock.typeId == this.fenceGateId &&
(this.getDirection(neighborBlock) !== this.getDirectionFromBlocks(block, neighborBlock) && this.getOppositeDirection(this.getDirection(neighborBlock)) !== this.getDirectionFromBlocks(block, neighborBlock))
)
) ? neighborBlock : null;
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
case 'up':
return 'down';
case 'down':
return 'up';
default:
return null;
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
const allfences = [];
if (frontBlock && block.typeId == this.fenceId) allfences.push(frontBlock)
if (backBlock && block.typeId == this.fenceId) allfences.push(backBlock)
if (rightBlock) allfences.push(rightBlock)
if (leftBlock) allfences.push(leftBlock)
if (upBlock && upBlock.typeId == this.fenceId && block.typeId == this.fenceId) allfences.push(upBlock)
if (downBlock && downBlock.typeId == this.fenceId && block.typeId == this.fenceId) allfences.push(downBlock)
for (const expendedfence of allfences) {
const expendedVariant = this.getVariant(expendedfence);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedfence);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedfence.setPermutation(expendedfence.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedfence, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
isNonSolidBlock(block) {
return block.isAir || ((block.typeId.includes("lava") || block.typeId.includes("water")) && block.typeId.startsWith("minecraft:")) || block.typeId == "lfg_ff:fence_box";
}
updateAllfence(block, direction, updatedfenceBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedfenceBlocks.has(blockLocationKey)) {
return;
}
updatedfenceBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const allfences = [];
if (rightBlock) allfences.push(rightBlock)
if (leftBlock) allfences.push(leftBlock)
if (block && block.typeId == this.fenceGateId) allfences.push(block)
for (const expendedfence of allfences) {
const expDir = this.getDirection(expendedfence);
const expendedleftBlock = this.getNeighborBlock(expendedfence, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedfence, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedfence, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedfence, expDir, "back", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedfrontBlock, expendedbackBlock, expDir, expendedfence);
expendedfence.setPermutation(expendedfence.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
const above = expendedfence.above()
if (this.isNonSolidBlock(above)) {
try {
above.setPermutation(BlockPermutation.resolve("lfg_ff:fence_box")
.withState('lfg_ff:module', expNewModuleAndDir.module.replace("close", "c2s"))
.withState('minecraft:cardinal_direction', expendedfence.typeId.includes("gate") ? this.getInvertedDirection(expNewModuleAndDir.direction) : expNewModuleAndDir.direction));
} catch { }
}
system.runTimeout(() => {
try {
if (updatedfenceBlocks.size <= 2)
this.updateAllfence(expendedfence, expNewModuleAndDir.direction, updatedfenceBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block) {
const fences = []
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
fences.push(b)
})
if (block.typeId == this.fenceGateId) {
return { module: this.getModule(block), direction: direction }
}
if (!fences.includes(leftBlock)) leftBlock = null
if (!fences.includes(rightBlock)) rightBlock = null
if (!fences.includes(frontBlock)) frontBlock = null
if (!fences.includes(backBlock)) backBlock = null
if (!frontBlock && !backBlock && !rightBlock && !leftBlock) return { module: "c0", direction: direction }
if (frontBlock && backBlock && rightBlock && leftBlock) {
return { module: "c4", direction: direction }
} else if (rightBlock && leftBlock && (frontBlock || backBlock)) {
if (frontBlock) {
let dir = this.getDirectionFromBlocks(block, frontBlock)
return { module: "c3", direction: dir }
} else {
let dir = this.getDirectionFromBlocks(block, backBlock)
return { module: "c3", direction: dir }
}
} else if (frontBlock && backBlock && (rightBlock || leftBlock)) {
if (rightBlock) {
let dir = this.getDirectionFromBlocks(block, rightBlock)
return { module: "c3", direction: dir }
} else {
let dir = this.getDirectionFromBlocks(block, leftBlock)
return { module: "c3", direction: dir }
}
} else if (rightBlock && leftBlock) {
let dir = this.getDirectionFromBlocks(rightBlock, leftBlock)
return { module: "c2s", direction: dir }
} else if (frontBlock && backBlock) {
let dir = this.getDirectionFromBlocks(backBlock, frontBlock)
return { module: "c2s", direction: dir }
} else if ((frontBlock || backBlock) && (rightBlock || leftBlock)) {
if (frontBlock) {
let dir = this.getDirectionFromBlocks(block, frontBlock)
if (rightBlock) {
return { module: "c2", direction: this.getInvertedDirection(dir) }
}
else {
return { module: "c2", direction: dir }
}
} else {
let dir = this.getDirectionFromBlocks(block, backBlock)
if (rightBlock) {
return { module: "c2", direction: dir }
}
else {
return { module: "c2", direction: this.getInvertedDirection(dir) }
}
}
} else {
let dir = this.getDirectionFromBlocks(fences[0], block)
return { module: "c1", direction: this.getOppositeDirection(dir) }
}
}
}