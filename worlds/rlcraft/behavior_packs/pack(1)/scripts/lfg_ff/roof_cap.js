/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class RoofCapComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.roofCapId = "lfg_ff:roof_cap"
this.roofId = "lfg_ff:roof"
this.MaxPaintedBlocksOnce = 500
this.SOUND_BY_VARIANT = new Map([
[1, "dig.deepslate_bricks"],
[2, "dig.grass"],
[3, "dig.deepslate_bricks"],
[4, "dig.grass"],
[5, "dig.grass"],
[6, "dig.wood"],
[7, "break.iron"],
[8, "dig.deepslate"],
[9, "dig.deepslate_bricks"],
[10, "dig.wood"],
[11, "break.iron"],
[12, "break.iron"],
[13, "dig.deepslate"],
]);
this.WV_SOUND_BY_VARIANT = new Map([
[1, "break.iron"],
[2, "break.iron"],
[3, "break.iron"],
[4, "break.iron"],
[5, "break.iron"],
[6, "break.iron"],
[7, "break.iron"],
[8, "break.iron"],
[9, "break.iron"],
[10, "break.iron"],
[11, "dig.wood"],
[12, "dig.wood"],
[13, "dig.deepslate"],
]);
}
playVariantSound(dim, loc, variant, isWV) {
let s = null
if (isWV)
s = this.WV_SOUND_BY_VARIANT.get(variant);
else
s = this.SOUND_BY_VARIANT.get(variant);
if (s) dim.playSound(s, loc);
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 13 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation.withState("lfg_ff:variant", newVariant))
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
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const placementVar = brokenBlockPermutation.getState("lfg_ff:variant");
this.playVariantSound(block.dimension, block.location, placementVar, ["wv_mid", "wv_top"].includes(brokenBlockPermutation.getState("lfg_ff:module")))
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placementVar = this.getPlacementVariant(block, direction)
system.run(() => {
this.updateAllroofCap(block, direction)
this.playVariantSound(block.dimension, block.location, placementVar, ["wv_mid", "wv_top"].includes(e.permutationToPlace.getState("lfg_ff:module")))
})
const leftBlock = this.getNeighborBlock(block, direction, "left", false);
const rightBlock = this.getNeighborBlock(block, direction, "right", false);
const frontBlock = this.getNeighborBlock(block, direction, "front", false);
const backBlock = this.getNeighborBlock(block, direction, "back", false);
const newModuleAndDir = this.getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block);
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar).withState('lfg_ff:module', newModuleAndDir.module).withState('minecraft:cardinal_direction', newModuleAndDir.direction)
}
getPlacementVariant(block, direction, isWV) {
const adjacentPositions = ["left", "right", "up", "down", "front", "back", "down_left", "down_right", "down_front", "down_back"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, "roof"))
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
getNeighborBlock(block, direction, side, filterroofCap) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
else if (side == "down_right")
neighborBlock = neighborBlock = this.getBlockInDirection(block.below(), this.getRightDirection(direction));
else if (side == "down_left")
neighborBlock = neighborBlock = this.getBlockInDirection(block.below(), this.getLeftDirection(direction));
else if (side == "down_front")
neighborBlock = neighborBlock = this.getBlockInDirection(block.below(), direction);
else if (side == "down_back")
neighborBlock = neighborBlock = this.getBlockInDirection(block.below(), this.getOppositeDirection(direction));
if (filterroofCap !== false) {
if (filterroofCap == "roof" && neighborBlock.typeId == this.roofId) {
return neighborBlock
}
return (
neighborBlock.typeId == this.roofCapId
) ? neighborBlock : null;
}
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
areSameLocation(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z;
}
isWeatherVane(block) {
return ["wv_mid", "wv_top"].includes(block.permutation.getState("lfg_ff:module"))
}
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", "roof");
const rightBlock = this.getNeighborBlock(block, direction, "right", "roof");
const frontBlock = this.getNeighborBlock(block, direction, "front", "roof");
const backBlock = this.getNeighborBlock(block, direction, "back", "roof");
const downFrontBlock = this.getNeighborBlock(block, direction, "down_front", "roof");
const downBackBlock = this.getNeighborBlock(block, direction, "down_back", "roof");
const downRightBlock = this.getNeighborBlock(block, direction, "down_right", "roof");
const downLeftBlock = this.getNeighborBlock(block, direction, "down_left", "roof");
const upBlock = this.getNeighborBlock(block, direction, "up", "roof");
const downBlock = this.getNeighborBlock(block, direction, "down", "roof");
const allroofCaps = [];
if (frontBlock) allroofCaps.push(frontBlock)
if (backBlock) allroofCaps.push(backBlock)
if (rightBlock) allroofCaps.push(rightBlock)
if (leftBlock) allroofCaps.push(leftBlock)
if (downBackBlock) allroofCaps.push(downBackBlock)
if (downFrontBlock) allroofCaps.push(downFrontBlock)
if (downLeftBlock) allroofCaps.push(downLeftBlock)
if (downRightBlock) allroofCaps.push(downRightBlock)
if (upBlock) allroofCaps.push(upBlock)
if (downBlock) allroofCaps.push(downBlock)
for (const expendedroofCap of allroofCaps) {
const expendedVariant = this.getVariant(expendedroofCap);
if (expendedVariant == newVariant) continue;
if (this.isWeatherVane(block) !== this.isWeatherVane(expendedroofCap)) continue
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedroofCap);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedroofCap.setPermutation(expendedroofCap.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedroofCap, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllroofCap(block, direction, updatedroofCapBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedroofCapBlocks.has(blockLocationKey)) {
return;
}
updatedroofCapBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
let downBlock = block.below()
let upBlock = block.above()
const allroofCaps = [];
if (frontBlock) allroofCaps.push(frontBlock)
if (backBlock) allroofCaps.push(backBlock)
if (rightBlock) allroofCaps.push(rightBlock)
if (leftBlock) allroofCaps.push(leftBlock)
if (downBlock && downBlock.typeId == this.roofCapId) allroofCaps.push(downBlock)
if (upBlock && upBlock.typeId == this.roofCapId) allroofCaps.push(upBlock)
if (block && block.typeId == this.roofCapId) allroofCaps.push(block)
for (const expendedroofCap of allroofCaps) {
const expDir = this.getDirection(expendedroofCap);
const expendedleftBlock = this.getNeighborBlock(expendedroofCap, expDir, "left", false);
const expendedrightBlock = this.getNeighborBlock(expendedroofCap, expDir, "right", false);
const expendedfrontBlock = this.getNeighborBlock(expendedroofCap, expDir, "front", false);
const expendedbackBlock = this.getNeighborBlock(expendedroofCap, expDir, "back", false);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedfrontBlock, expendedbackBlock, expDir, expendedroofCap);
expendedroofCap.setPermutation(expendedroofCap.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedroofCapBlocks.size <= 4)
this.updateAllroofCap(expendedroofCap, expNewModuleAndDir.direction, updatedroofCapBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block) {
const roofCaps = []
let downBlock = block.below()
let upBlock = block.above()
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock, downBlock, upBlock]
allBlocks.forEach((b) => {
if (!b) return;
if (b.typeId !== this.roofCapId) return;
roofCaps.push(b)
})
if (!roofCaps.includes(leftBlock)) leftBlock = null
if (!roofCaps.includes(rightBlock)) rightBlock = null
if (!roofCaps.includes(frontBlock)) frontBlock = null
if (!roofCaps.includes(backBlock)) backBlock = null
if (!roofCaps.includes(downBlock)) downBlock = null
if (!roofCaps.includes(upBlock)) upBlock = null
if (upBlock && downBlock) {
return { module: "wv_mid", direction: direction }
}
if (downBlock) {
return { module: "wv_top", direction: direction }
}
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
let dir = this.getDirectionFromBlocks(roofCaps[0], block)
return { module: "c1", direction: this.getOppositeDirection(dir) }
}
}
}