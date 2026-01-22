/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class WallComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.wallId = "lfg_ff:wall"
this.MaxPaintedBlocksOnce = 2500
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
let newVariant = variant == 14 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", true));
system.runTimeout(() => {
try {
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", false));
} catch (e) {
}
}, 1)
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
this.updateAllwall(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const upBlock = this.getNeighborBlock(block, "up", true);
const downBlock = this.getNeighborBlock(block, "down", true);
const newModuleAndDir = this.getUpdatedModuleAndDirection(upBlock, downBlock, block);
e.permutationToPlace = permutationToPlace
.withState("lfg_ff:variant", this.getPlacementVariant(block))
.withState('lfg_ff:module', newModuleAndDir.module)
system.runTimeout(() => {
this.updateAllwall(block)
}, 1)
}
getPlacementVariant(block) {
const adjacentPositions = ["south", "north", "east", "west", "up", "down"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, pos, true))
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
getNeighborBlock(block, side, filterwall) {
let neighborBlock = null
if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
else if (side == "south")
neighborBlock = block.south()
else if (side == "north")
neighborBlock = block.north()
else if (side == "east")
neighborBlock = block.east()
else if (side == "west")
neighborBlock = block.west()
if (filterwall)
return neighborBlock.typeId == this.wallId ? neighborBlock : null;
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
const leftBlock = this.getNeighborBlock(block, "west", true);
const rightBlock = this.getNeighborBlock(block, "east", true);
const frontBlock = this.getNeighborBlock(block, "south", true);
const backBlock = this.getNeighborBlock(block, "north", true);
const allwalls = [];
if (upBlock) allwalls.push(upBlock)
if (downBlock) allwalls.push(downBlock)
if (rightBlock) allwalls.push(rightBlock)
if (leftBlock) allwalls.push(leftBlock)
if (frontBlock) allwalls.push(frontBlock)
if (backBlock) allwalls.push(backBlock)
for (const expendedwall of allwalls) {
const expendedVariant = this.getVariant(expendedwall);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant && expendedwall.permutation.getState("lfg_ff:in_update") == false) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedwall.setPermutation(expendedwall.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", true));
system.runTimeout(() => {
try {
expendedwall.setPermutation(expendedwall.permutation
.withState("lfg_ff:variant", newVariant)
.withState("lfg_ff:in_update", false));
} catch (e) {
}
}, 2)
this.expendPaint(expendedwall, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllwall(block) {
const upBlock = this.getNeighborBlock(block, "up", true);
const downBlock = this.getNeighborBlock(block, "down", true);
const allwalls = [];
if (upBlock) allwalls.push(upBlock)
if (downBlock) allwalls.push(downBlock)
if (block.typeId == this.wallId) allwalls.push(block)
for (const expendedwall of allwalls) {
const expUpBlock = this.getNeighborBlock(expendedwall, "up", true);
const expDownBlock = this.getNeighborBlock(expendedwall, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedwall);
expendedwall.setPermutation(expendedwall.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module));
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, block) {
const walls = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
walls.push(b)
})
if (!walls.includes(upBlock)) upBlock = null
if (!walls.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) return { module: "normal" }
if (upBlock && downBlock) {
return { module: "center" }
} else if (upBlock) {
const below = block.below()
if (below.typeId.includes("glass") || below.typeId.includes("window") || below.isAir) {
return { module: "center" }
}
return { module: "bottom" }
} else if (downBlock) {
return { module: "top" }
}
}
}