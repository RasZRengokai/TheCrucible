/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class StatueComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.statueId = "lfg_ff:statue"
this.MaxPaintedBlocksOnce = 100
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
this.updateAllstatue(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
system.runTimeout(() => {
this.updateAllstatue(block)
}, 1)
const placementRotation = this.getNeighborBlock(block, "down", true) ? block.below().permutation.getState("minecraft:cardinal_direction") : permutationToPlace.getState("minecraft:cardinal_direction")
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block)).withState("minecraft:cardinal_direction", placementRotation)
}
getPlacementVariant(block) {
const allBlocks = [block.above(), block.below()]
const validBlocks = []
allBlocks.forEach((b) => {
if (!b || b.typeId !== this.statueId) return;
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
getNeighborBlock(block, side, filterstatue) {
let neighborBlock = null
if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterstatue)
return neighborBlock.typeId == this.statueId ? neighborBlock : null;
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
const allstatues = [];
if (upBlock) allstatues.push(upBlock)
if (downBlock) allstatues.push(downBlock)
for (const expendedstatue of allstatues) {
const expendedVariant = this.getVariant(expendedstatue);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedstatue.setPermutation(expendedstatue.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedstatue, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllstatue(block, updatedstatueBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedstatueBlocks.has(blockLocationKey)) {
return;
}
updatedstatueBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, "up", true);
const downBlock = this.getNeighborBlock(block, "down", true);
const allstatues = [];
if (upBlock) allstatues.push(upBlock)
if (downBlock) allstatues.push(downBlock)
if (block.typeId == this.statueId) allstatues.push(block)
for (const expendedstatue of allstatues) {
const expUpBlock = this.getNeighborBlock(expendedstatue, "up", true);
const expDownBlock = this.getNeighborBlock(expendedstatue, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedstatue);
expendedstatue.setPermutation(expendedstatue.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module));
system.runTimeout(() => {
try {
if (updatedstatueBlocks.size <= 7)
this.updateAllstatue(expendedstatue, updatedstatueBlocks);
} catch (e) {
}
}, 1);
}
}
isModule(block, module1, module2 = null, module3 = null, module4 = null, module5 = null) {
const blockModule = this.getModule(block)
if (blockModule == module1) return true;
if (blockModule == module2) return true;
if (blockModule == module3) return true;
if (blockModule == module4) return true;
if (blockModule == module5) return true;
}
getUpdatedModuleAndDirection(upBlock, downBlock, block) {
const statues = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
statues.push(b)
})
if (!statues.includes(upBlock)) upBlock = null
if (!statues.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) return { module: "small" }
if (upBlock && this.isModule(upBlock, "small", "large_top", "medium_top") && downBlock && this.isModule(downBlock, "small", "large_bot", "medium_bot")) {
return { module: "large_mid" }
}
else if (upBlock && this.getModule(upBlock) == "large_mid") {
return { module: "large_bot" }
}
else if (downBlock && this.getModule(downBlock) == "large_mid") {
return { module: "large_top" }
}
else if (upBlock && this.isModule(upBlock, "medium_top", "small")) {
return { module: "medium_bot" }
}
else if (downBlock && this.isModule(downBlock, "medium_bot", "small")) {
return { module: "medium_top" }
}
else {
return { module: "small" }
}
}
}