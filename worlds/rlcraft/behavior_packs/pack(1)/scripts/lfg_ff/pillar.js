/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class PillarComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.pillarId = "lfg_ff:pillar"
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
let newVariant = variant == 10 ? 1 : variant + 1
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
this.updateAllpillar(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
system.runTimeout(() => {
this.updateAllpillar(block)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block))
}
getPlacementVariant(block) {
const allBlocks = [block.above(), block.below()]
const validBlocks = []
allBlocks.forEach((b) => {
if (!b || b.typeId !== this.pillarId) return;
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
getNeighborBlock(block, side, filterpillar) {
let neighborBlock = null
if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterpillar)
return neighborBlock.typeId == this.pillarId ? neighborBlock : null;
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
const allpillars = [];
if (upBlock) allpillars.push(upBlock)
if (downBlock) allpillars.push(downBlock)
for (const expendedpillar of allpillars) {
const expendedVariant = this.getVariant(expendedpillar);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedpillar.setPermutation(expendedpillar.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedpillar, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllpillar(block) {
const upBlock = this.getNeighborBlock(block, "up", true);
const downBlock = this.getNeighborBlock(block, "down", true);
const allpillars = [];
if (upBlock) allpillars.push(upBlock)
if (downBlock) allpillars.push(downBlock)
if (block.typeId == this.pillarId) allpillars.push(block)
for (const expendedpillar of allpillars) {
const expUpBlock = this.getNeighborBlock(expendedpillar, "up", true);
const expDownBlock = this.getNeighborBlock(expendedpillar, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock);
expendedpillar.setPermutation(expendedpillar.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module));
}
}
getUpdatedModuleAndDirection(upBlock, downBlock) {
const pillars = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
pillars.push(b)
})
if (!pillars.includes(upBlock)) upBlock = null
if (!pillars.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) return { module: "normal" }
if (upBlock && downBlock) {
return { module: "center" }
} else if (upBlock) {
return { module: "bottom" }
} else if (downBlock) {
return { module: "top" }
}
}
}