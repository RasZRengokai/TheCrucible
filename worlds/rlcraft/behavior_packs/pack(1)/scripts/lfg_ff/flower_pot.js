/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class FlowerPotComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.onTick = this.onTick.bind(this);
this.flower_potId = "lfg_ff:flower_pot"
this.MaxPaintedBlocksOnce = 50
}
isEnabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
return JSON.parse(worldParticleSettings).flower_pot
}
onTick(e) {
if (Math.random() < 0.75) return;
if (!this.isEnabled()) return;
const block = e.block;
if (this.getModule(block) !== "floor" && this.getModule(block) !== "suspended") return;
const timeOfDay = world.getTimeOfDay()
const isNight = timeOfDay < 23200 && timeOfDay > 12800
if (isNight) return;
block.dimension.spawnParticle(Math.random() > 0.4 ? "lfg_ff:butterfly_small" : "lfg_ff:plant_bee_small", Vector.add(block.location, new Vector(0.5, 0.5, 0.5)))
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 5 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant));
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
this.updateAllflower_pot(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const placedFace = e.face;
if (placedFace == "Down") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "suspended")
}
system.runTimeout(() => {
this.updateAllflower_pot(block)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block))
}
getPlacementVariant(block) {
const allBlocks = [block.above(), block.below()]
const validBlocks = []
allBlocks.forEach((b) => {
if (!b || b.typeId !== this.flower_potId) return;
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
expendPaint(block, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const upBlock = block.above()
const downBlock = block.below()
const allflower_pots = [];
if (upBlock.typeId == this.flower_potId) allflower_pots.push(upBlock)
if (downBlock.typeId == this.flower_potId) allflower_pots.push(downBlock)
for (const expendedflower_pot of allflower_pots) {
const expendedVariant = this.getVariant(expendedflower_pot);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedflower_pot.setPermutation(expendedflower_pot.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedflower_pot, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllflower_pot(block) {
const upBlock = block.above()
const downBlock = block.below()
const allflower_pots = [];
if (upBlock.typeId == this.flower_potId) allflower_pots.push(upBlock)
if (downBlock.typeId == this.flower_potId) allflower_pots.push(downBlock)
if (block.typeId == this.flower_potId) allflower_pots.push(block)
for (const expendedflower_pot of allflower_pots) {
const expUpBlock = expendedflower_pot.above().typeId == this.flower_potId ? expendedflower_pot.above() : null
const expDownBlock = expendedflower_pot.below().typeId == this.flower_potId ? expendedflower_pot.below() : null
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedflower_pot);
expendedflower_pot.setPermutation(expendedflower_pot.permutation
.withState('lfg_ff:module', expNewModuleAndDir));
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, block) {
const flower_pots = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
flower_pots.push(b)
})
if (!flower_pots.includes(upBlock)) upBlock = null
if (!flower_pots.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) {
if (block.below().isAir) return "suspended"
else return "floor"
}
if (upBlock && downBlock) return "cable"
if (upBlock) {
return "suspended"
} else {
return "cable"
}
}
}