/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class StaircaseRailComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.railId = "lfg_ff:staircase_railing"
this.MaxPaintedBlocksOnce = 250
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
let newVariant = variant == 6 ? 1 : variant + 1
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
if (brokenBlockPermutation.getState("lfg_ff:variant") == 5 || brokenBlockPermutation.getState("lfg_ff:variant") == 2)
block.dimension.playSound("break.iron", block.location)
system.runTimeout(() => {
this.updateAllrail(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const leftBlock = this.getNeighborBlock(block, direction, "left", false);
const rightBlock = this.getNeighborBlock(block, direction, "right", false);
if (leftBlock.typeId.includes("stairs"))
e.permutationToPlace = e.permutationToPlace.withState('lfg_ff:module', "left")
system.runTimeout(() => {
this.updateAllrail(block, direction)
}, 1)
const placementVar = this.getPlacementVariant(block, direction)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar)
system.run(() => {
if (placementVar == 5 || placementVar == 2)
block.dimension.playSound("break.iron", block.location)
})
}
getPlacementVariant(block, direction) {
let adjacentPositions = ["left", "right"];
let adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, false))
.filter(Boolean);
adjacentBlocks = adjacentBlocks.concat(adjacentBlocks.map(b => b.above()), adjacentBlocks.map(b => b.below()))
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
getNeighborBlock(block, direction, side, filterrail) {
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
if (filterrail)
return neighborBlock.typeId == this.railId ? neighborBlock : null;
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
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const diagUpLeftBlock = this.getNeighborBlock(block.above(), direction, "left", true);
const diagDownLeftBlock = this.getNeighborBlock(block.below(), direction, "left", true);
const diagUpRightBlock = this.getNeighborBlock(block.above(), direction, "right", true);
const diagDownRightBlock = this.getNeighborBlock(block.below(), direction, "right", true);
const allrails = [];
if (rightBlock && (this.getModule(rightBlock).includes("pillar") || this.getDirection(rightBlock) == direction)) allrails.push(rightBlock)
if (leftBlock && (this.getModule(leftBlock).includes("pillar") || this.getDirection(leftBlock) == direction)) allrails.push(leftBlock)
if (frontBlock) allrails.push(frontBlock)
if (backBlock) allrails.push(backBlock)
if (diagDownLeftBlock && this.getDirection(diagDownLeftBlock) == direction) allrails.push(diagDownLeftBlock)
if (diagDownRightBlock && this.getDirection(diagDownRightBlock) == direction) allrails.push(diagDownRightBlock)
if (diagUpLeftBlock && this.getDirection(diagUpLeftBlock) == direction) allrails.push(diagUpLeftBlock)
if (diagUpRightBlock && this.getDirection(diagUpRightBlock) == direction) allrails.push(diagUpRightBlock)
for (const expendedrail of allrails) {
const expendedVariant = this.getVariant(expendedrail);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedrail);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedrail.setPermutation(expendedrail.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedrail, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllrail(block, direction, updatedrailBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedrailBlocks.has(blockLocationKey)) {
return;
}
updatedrailBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const diagUpLeftBlock = this.getNeighborBlock(block.above(), direction, "left", true);
const diagDownLeftBlock = this.getNeighborBlock(block.below(), direction, "left", true);
const diagUpRightBlock = this.getNeighborBlock(block.above(), direction, "right", true);
const diagDownRightBlock = this.getNeighborBlock(block.below(), direction, "right", true);
const allrails = [];
if (downBlock) allrails.push(downBlock)
if (upBlock) allrails.push(upBlock)
if (rightBlock) allrails.push(rightBlock)
if (leftBlock) allrails.push(leftBlock)
if (diagDownLeftBlock) allrails.push(diagDownLeftBlock)
if (diagDownRightBlock) allrails.push(diagDownRightBlock)
if (diagUpLeftBlock) allrails.push(diagUpLeftBlock)
if (diagUpRightBlock) allrails.push(diagUpRightBlock)
for (const expendedrail of allrails) {
const expDir = this.getDirection(expendedrail);
const expendedleftBlock = this.getNeighborBlock(expendedrail, expDir, "left", false);
const expendedrightBlock = this.getNeighborBlock(expendedrail, expDir, "right", false);
const expendeddownBlock = this.getNeighborBlock(expendedrail, expDir, "down", false);
const expendedupBlock = this.getNeighborBlock(expendedrail, expDir, "up", false);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedupBlock, expendeddownBlock, expDir, expendedrail);
expendedrail.setPermutation(expendedrail.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedrailBlocks.size <= 4)
this.updateAllrail(expendedrail, expNewModuleAndDir.direction, updatedrailBlocks);
} catch (e) {
}
}, 1);
}
}
isStair(block) {
return block.typeId.includes("stairs") && block.permutation.getState("upside_down_bit") == false
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, direction, block) {
const rails = []
const allBlocks = [leftBlock, rightBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
rails.push(b)
})
let diagUpLeftBlock = leftBlock ? leftBlock.above() : null
let diagDownLeftBlock = leftBlock ? leftBlock.below() : null
let diagUpRightBlock = rightBlock ? rightBlock.above() : null
let diagDownRightBlock = rightBlock ? rightBlock.below() : null
if (!rails.includes(leftBlock) || !this.isStair(leftBlock)) leftBlock = null
if (!rails.includes(rightBlock) || !this.isStair(rightBlock)) rightBlock = null
if (!rails.includes(upBlock) || !this.isStair(upBlock)) upBlock = null
if (!rails.includes(downBlock) || !this.isStair(downBlock)) downBlock = null
const digRails = [];
if (diagDownLeftBlock && diagDownLeftBlock.typeId == this.railId && this.getDirection(diagDownLeftBlock) == direction) { digRails.push(diagDownLeftBlock) } else diagDownLeftBlock = null
if (diagDownRightBlock && diagDownRightBlock.typeId == this.railId && this.getDirection(diagDownRightBlock) == direction) { digRails.push(diagDownRightBlock) } else diagDownRightBlock = null
if (diagUpLeftBlock && diagUpLeftBlock.typeId == this.railId && this.getDirection(diagUpLeftBlock) == direction) { digRails.push(diagUpLeftBlock) } else diagUpLeftBlock = null
if (diagUpRightBlock && diagUpRightBlock.typeId == this.railId && this.getDirection(diagUpRightBlock) == direction) { digRails.push(diagUpRightBlock) } else diagUpRightBlock = null
if (digRails.length == 0) return { module: "pillar_left", direction: direction }
if (downBlock) {
if (diagDownLeftBlock) {
return { module: "right", direction: direction }
}
if (diagDownRightBlock) {
return { module: "left", direction: direction }
}
}
if (rightBlock) {
return { module: "pillar_right", direction: direction }
}
if (leftBlock) {
return { module: "pillar_left", direction: direction }
}
return { module: "pillar_left", direction: direction }
}
}