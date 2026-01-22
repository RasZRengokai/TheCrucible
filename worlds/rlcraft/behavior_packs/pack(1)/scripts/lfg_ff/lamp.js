/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
import { ModalFormData } from "@minecraft/server-ui";
export class LampComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.lampId = "lfg_ff:lamp"
this.MaxPaintedBlocksOnce = 100
}
isLampWallV7Enabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
const parseRes = JSON.parse(worldParticleSettings).lamp_v7
return parseRes ? parseRes : parseRes == undefined ? true : false
}
vvOptimized() {
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
if (worldVVSetings == undefined) return false;
return worldVVSetings;
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
if (handItem.typeId == "lfg_ff:furniture_wrench") {
const blockLocationKey = `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
const masterKey = world.getDynamicProperty(blockLocationKey) ?? undefined
const expBlocks = this.getExpendBlocks(block)
const wirelessLampGUI = new ModalFormData()
.title("Switch Wireless Connection")
.textField("Enter the connection key:", "e.g `Bedroom1`", { defaultValue: masterKey, tooltip: undefined })
player.dimension.playSound("random.click", player.location, { volume: 1 })
wirelessLampGUI.show(player).then((selec) => {
if (selec.canceled) return;
for (const lamp of expBlocks) {
try {
const lampLocationKey = `lfg_ff:wall_switch_channel:${lamp.location.x},${lamp.location.y},${lamp.location.z}`;
world.setDynamicProperty(lampLocationKey, String(selec.formValues[0]))
} catch (e) {
}
}
});
return
}
if (["lfg_ff:variant_picker", "lfg_ff:debug_stick"].includes(handItem.typeId)) {
return
}
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const colorPickerMode = player.getDynamicProperty(`lfg_ff:${handItem.typeId.includes("small") ? "tvs" : "vs"}_color_brush_mode`) == 1
let newVariant = variant == 7 ? 1 : variant + 1
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
if (pickedVar) newVariant = pickedVar
}
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant).withState("lfg_ff:light_on", false));
const fadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (handItem.typeId == "lfg_ff:color_brush") {
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
if (["floor_top", 'wall_normal', "floor_normal", "roof_normal"].includes(module) || (["floor_center", 'floor_bot'].includes(module) && (variant == 2 || variant == 7))) {
const lightOn = block.permutation.getState("lfg_ff:light_on");
block.setPermutation(block.permutation.withState("lfg_ff:light_on", !lightOn))
if (lightOn) {
if (variant < 4 || variant == 7) {
block.dimension.runCommand(`playsound click_on.bamboo_wood_button @a ${block.location.x} ${block.location.y} ${block.location.z} 0.5 1.5`)
block.dimension.runCommand(`playsound use.copper @a ${block.location.x} ${block.location.y} ${block.location.z} 1 0.6`)
} else {
block.dimension.runCommand(`playsound extinguish.candle @a ${block.location.x} ${block.location.y} ${block.location.z} 1 1`)
}
} else {
if (variant < 4 || variant == 7) {
block.dimension.runCommand(`playsound click_on.bamboo_wood_button @a ${block.location.x} ${block.location.y} ${block.location.z} 0.5 2`)
block.dimension.runCommand(`playsound use.copper @a ${block.location.x} ${block.location.y} ${block.location.z} 1 1.2`)
} else {
block.dimension.runCommand(`playsound fire.ignite @a ${block.location.x} ${block.location.y} ${block.location.z} 1 1`)
}
}
if (["floor_center", 'floor_bot', "floor_top"].includes(module) && (variant == 2 || variant == 7)) {
const expBlocks = this.getExpendBlocks(block)
for (const lamp of expBlocks) {
try {
lamp.setPermutation(lamp.permutation.withState("lfg_ff:light_on", !lightOn));
} catch (e) {
}
}
}
if (lightOn) {
const fadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
if (["floor_center", 'floor_bot', "floor_top"].includes(module) && (variant == 2 || variant == 7)) {
const expBlocks = this.getExpendBlocks(block)
for (const lamp of expBlocks) {
try {
const expFadeEntity = lamp.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(lamp.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (expFadeEntity) {
expFadeEntity.remove()
}
} catch (e) {
}
}
}
} else {
const allShapes = [
"floor_normal_1",
"floor_normal_2",
"floor_normal_3",
"floor_normal_lustre",
"floor_top_1",
"floor_top_2",
"floor_top_3",
"floor_top_lustre",
"floor_bot_2",
"roof_normal_lamp",
"roof_normal_lamp_3",
"roof_normal_lustre",
"wall_normal_lamp",
"wall_normal_lamp_3",
"wall_normal_lustre",
"street_lamp",
"lofi_roof_normal",
"lofi_wall_normal",
"lofi_floor_normal",
"lofi_floor_all",
]
function getLampShape(variant, module) {
let shape = null
switch (module) {
case "floor_normal": shape = variant == 7 ? "lofi_floor_normal" : variant > 3 ? "floor_normal_lustre" : `floor_normal_${variant}`; break;
case "floor_top": shape = variant == 7 ? "lofi_floor_all" : variant > 3 ? "floor_top_lustre" : `floor_top_${variant}`; break;
case "floor_bot": shape = variant == 7 ? "lofi_floor_all" : "floor_bot_2"; break;
case "roof_normal": shape = variant == 7 ? "lofi_roof_normal" : variant > 3 ? "roof_normal_lustre" : (variant == 3 ? "roof_normal_lamp_3" : "roof_normal_lamp"); break;
case "wall_normal": shape = variant == 7 ? "lofi_wall_normal" : variant > 3 ? "wall_normal_lustre" : (variant == 3 ? "wall_normal_lamp_3" : "wall_normal_lamp"); break;
}
return shape;
}
if (["floor_center", 'floor_bot', "floor_top"].includes(module) && (variant == 2 || variant == 7)) {
const expBlocks = this.getExpendBlocks(block)
for (const lamp of expBlocks) {
try {
let shape = getLampShape(this.getVariant(lamp), this.getModule(lamp))
if (shape == null) continue;
const rotationY = this.getletterboxEntityRotations(direction)
const fade = block.dimension.spawnEntity("lfg_ff:lamp_fade", Vector.add(lamp.location, new Vector(0.5, 0, 0.5)))
fade.setProperty("lfg_ff:shape", allShapes.indexOf(shape))
fade.setProperty("lfg_ff:rotation_y", rotationY);
} catch (e) {
}
}
} else {
let shape = getLampShape(variant, module)
if (shape == null) return;
if (shape == "lofi_wall_normal" && (!this.isLampWallV7Enabled() || this.vvOptimized())) return;
const rotationY = this.getletterboxEntityRotations(direction)
const fade = block.dimension.spawnEntity("lfg_ff:lamp_fade", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
fade.setProperty("lfg_ff:shape", allShapes.indexOf(shape))
fade.setProperty("lfg_ff:rotation_y", rotationY);
fade.setProperty("lfg_ff:vv_opti", this.vvOptimized());
}
}
}
}
getletterboxEntityRotations(dir) {
let rotationY = 0;
switch (dir) {
case 'north':
rotationY = 0;
break;
case 'south':
rotationY = 180;
break;
case 'east':
rotationY = 90;
break;
case 'west':
rotationY = -90;
break;
}
return rotationY;
}
getExpendBlocks(block, updateBlocks = new Set()) {
const affectedBlocks = [];
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updateBlocks.has(blockLocationKey)) {
return affectedBlocks;
}
updateBlocks.add(blockLocationKey);
affectedBlocks.push(block);
const upBlock = block.above();
const downBlock = block.below();
const alllamps = [];
if (upBlock && upBlock.typeId == this.lampId) alllamps.push(upBlock);
if (downBlock && downBlock.typeId == this.lampId) alllamps.push(downBlock);
for (const expendedlamp of alllamps) {
if (updateBlocks.size < this.MaxPaintedBlocksOnce) {
affectedBlocks.push(...this.getExpendBlocks(expendedlamp, updateBlocks));
}
}
return affectedBlocks;
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const fadeEntity = block.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
const blockLocationKey = `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
world.setDynamicProperty(blockLocationKey, null);
system.runTimeout(() => {
this.updateAlllamp(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const placedFace = e.face;
const blockLocationKey = `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
if (placedFace == "Down") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "roof_normal")
const upLocationKey = `lfg_ff:wall_switch_channel:${block.above().location.x},${block.above().location.y},${block.above().location.z}`;
const masterKey = world.getDynamicProperty(upLocationKey) ?? ""
system.run(() => {
world.setDynamicProperty(blockLocationKey, masterKey)
})
}
else if (placedFace == "Up") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "floor_normal")
const downLocationKey = `lfg_ff:wall_switch_channel:${block.below().location.x},${block.below().location.y},${block.below().location.z}`;
const masterKey = world.getDynamicProperty(downLocationKey) ?? ""
system.run(() => {
world.setDynamicProperty(blockLocationKey, masterKey)
})
}
else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall_normal")
}
system.runTimeout(() => {
this.updateAlllamp(block)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block))
}
getPlacementVariant(block) {
const allBlocks = [block.above(), block.below()]
const validBlocks = []
allBlocks.forEach((b) => {
if (!b || b.typeId !== this.lampId) return;
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
const alllamps = [];
if (upBlock.typeId == this.lampId) alllamps.push(upBlock)
if (downBlock.typeId == this.lampId) alllamps.push(downBlock)
for (const expendedlamp of alllamps) {
const expendedVariant = this.getVariant(expendedlamp);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedlamp.setPermutation(expendedlamp.permutation
.withState("lfg_ff:variant", newVariant).withState("lfg_ff:light_on", false));
const fadeEntity = expendedlamp.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(expendedlamp.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
this.expendPaint(expendedlamp, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAlllamp(block) {
const upBlock = block.above()
const downBlock = block.below()
const alllamps = [];
if (upBlock.typeId == this.lampId) alllamps.push(upBlock)
if (downBlock.typeId == this.lampId) alllamps.push(downBlock)
if (block.typeId == this.lampId) alllamps.push(block)
for (const expendedlamp of alllamps) {
const expUpBlock = expendedlamp.above().typeId == this.lampId ? expendedlamp.above() : null
const expDownBlock = expendedlamp.below().typeId == this.lampId ? expendedlamp.below() : null
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedlamp);
expendedlamp.setPermutation(expendedlamp.permutation
.withState('lfg_ff:module', expNewModuleAndDir).withState("lfg_ff:light_on", false));
const fadeEntity = expendedlamp.dimension.getEntities({ type: "lfg_ff:lamp_fade", location: Vector.add(expendedlamp.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1 })[0]
if (fadeEntity) {
fadeEntity.remove()
}
}
}
getUpdatedModuleAndDirection(upBlock, downBlock, block) {
const lamps = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
lamps.push(b)
})
if (!lamps.includes(upBlock)) upBlock = null
if (!lamps.includes(downBlock)) downBlock = null
if (this.getModule(block) == "wall_normal") return "wall_normal"
if (!upBlock && !downBlock) {
if (!block.above().isAir) return "roof_normal"
else return "floor_normal"
}
if (upBlock && downBlock) {
if (this.getModule(upBlock).includes("roof") && this.getModule(downBlock).includes("roof")) {
return "roof_cable"
}
else if (this.getModule(upBlock).includes("floor") && this.getModule(downBlock).includes("floor")) {
return "floor_center"
}
else if (this.getModule(block).includes("floor")) {
return "floor_center"
}
else if (this.getModule(block).includes("roof")) {
return "roof_cable"
}
}
if (upBlock) {
if (this.getModule(upBlock).includes("roof")) {
return "roof_normal"
}
else if (this.getModule(upBlock).includes("floor")) {
return "floor_bot"
}
else if (this.getModule(block).includes("floor")) {
return "floor_bot"
}
else if (this.getModule(block).includes("roof")) {
return "roof_normal"
}
}
if (downBlock) {
if (this.getModule(downBlock).includes("roof")) {
return "roof_cable"
}
else if (this.getModule(downBlock).includes("floor")) {
return "floor_top"
}
else if (this.getModule(block).includes("floor")) {
return "floor_top"
}
else if (this.getModule(block).includes("roof")) {
return "roof_cable"
}
}
return this.getModule(block)
}
}