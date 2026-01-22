/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class XmasTreeComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.treeId = "lfg_ff:xmas_tree"
this.MaxPaintedBlocksOnce = 150
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 3 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation.withState("lfg_ff:variant", newVariant))
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, newVariant)
}
return;
}
}
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
system.runTimeout(() => {
this.updateAlltree(block)
}, 1)
block.dimension.playSound("break.big_dripleaf", block.location, { volume: 1 })
block.dimension.playSound("block.sweet_berry_bush.break", block.location, { volume: 0.5 })
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
system.runTimeout(() => {
this.updateAlltree(block)
}, 1)
system.run(() => {
block.dimension.playSound("place.big_dripleaf", block.location, { volume: 1 })
block.dimension.playSound("block.sweet_berry_bush.place", block.location, { volume: 0.5 })
})
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block))
}
getPlacementVariant(block) {
const allBlocks = [block.above(), block.below()]
const validBlocks = []
allBlocks.forEach((b) => {
if (!b || b.typeId !== this.treeId) return;
validBlocks.push(b)
})
const variantCount = {};
for (const adjacentBlock of validBlocks) {
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
getNeighborBlock(block, side, filtertree) {
let neighborBlock = null
if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filtertree)
return neighborBlock.typeId == this.treeId ? neighborBlock : null;
else
return neighborBlock
}
expendPaint(block, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, "up", true);
const downBlock = this.getNeighborBlock(block, "down", true);
const alltrees = [];
if (upBlock) alltrees.push(upBlock)
if (downBlock) alltrees.push(downBlock)
for (const expendedtree of alltrees) {
const expendedVariant = this.getVariant(expendedtree);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedtree.setPermutation(expendedtree.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedtree, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAlltree(block, updatedTreeBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedTreeBlocks.has(blockLocationKey)) {
return;
}
updatedTreeBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, "up", true);
const downBlock = this.getNeighborBlock(block, "down", true);
const alltrees = [];
if (upBlock) alltrees.push(upBlock)
if (downBlock) alltrees.push(downBlock)
if (block.typeId == this.treeId) alltrees.push(block)
for (const expendedtree of alltrees) {
const expUpBlock = this.getNeighborBlock(expendedtree, "up", true);
const expDownBlock = this.getNeighborBlock(expendedtree, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock);
expendedtree.setPermutation(expendedtree.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module));
system.runTimeout(() => {
try {
if (updatedTreeBlocks.size <= 4)
this.updateAlltree(expendedtree, updatedTreeBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(upBlock, downBlock) {
const trees = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
trees.push(b)
})
if (!trees.includes(upBlock)) upBlock = null
if (!trees.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) return { module: "top" }
if (upBlock && !downBlock && this.getNeighborBlock(upBlock, "up", true)) {
return { module: "bottom" }
} else if (upBlock) {
return { module: "center" }
} else if (downBlock) {
return { module: "top" }
}
}
}