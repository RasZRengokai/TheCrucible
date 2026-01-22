/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { world, system, BlockPermutation, ItemStack, StructureManager } from "@minecraft/server";
import { Vector } from './vector.js';
import { ModalFormData } from "@minecraft/server-ui";
import { AwningComponent } from './awning.js';
import { GarageDoorComponent } from './garage_door.js';
export class LightSwitchComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
}
vvOptimized() {
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
if (worldVVSetings == undefined) return false;
return worldVVSetings;
}
isLampWallV7Enabled() {
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? undefined
if (worldParticleSettings == undefined) return true;
const parseRes = JSON.parse(worldParticleSettings).lamp_v7
return parseRes ? parseRes : parseRes == undefined ? true : false
}
onPlayerInteract(e) {
const block = e.block;
const player = e.player;
const variant = block.permutation.getState("lfg_ff:variant");
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
const blockLocationKey = `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
const masterKey = world.getDynamicProperty(blockLocationKey) ?? undefined
if (handItem) {
if (handItem.typeId == "lfg_ff:furniture_wrench") {
const wirelessConnectionGUI = new ModalFormData()
.title("Switch Wireless Connection")
.textField("Enter the connection key:", "e.g `Bedroom1`", { defaultValue: masterKey, tooltip: undefined })
player.dimension.playSound("random.click", player.location, { volume: 1 })
wirelessConnectionGUI.show(player).then((selec) => {
if (selec.canceled) return;
world.setDynamicProperty(blockLocationKey, String(selec.formValues[0]))
});
return
}
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
const colorPickerMode = player.getDynamicProperty(`lfg_ff:${handItem.typeId.includes("small") ? "tvs" : "vs"}_color_brush_mode`) == 1
let newVariant = variant == 3 ? 1 : variant + 1
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
}
return;
}
}
const isActivated = block.permutation.getState("lfg_ff:activated")
if (!isActivated) return;
block.setPermutation(block.permutation.withState("lfg_ff:activated", false));
block.dimension.runCommand(`playsound click_on.bamboo_wood_button @a ${block.location.x} ${block.location.y} ${block.location.z} 1 1.5`)
system.runTimeout(() => {
block.setPermutation(block.permutation.withState("lfg_ff:activated", true));
block.dimension.runCommand(`playsound click_off.bamboo_wood_button @a ${block.location.x} ${block.location.y} ${block.location.z} 1 1.2`)
}, 5)
const allDynamicPropertyIds = world.getDynamicPropertyIds();
const allGarageDoors = []
const allAwnings = []
for (const propKey of allDynamicPropertyIds) {
if (propKey.startsWith("lfg_ff:wall_switch_channel:")) {
const prop = world.getDynamicProperty(propKey)
if (prop !== masterKey || masterKey == "") continue;
const parts = propKey.split(":")[2].split(",")
const [x, y, z] = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
const loc = new Vector(x, y, z)
if (this.isChunkLoaded(player.dimension, loc)) {
const targetBlock = player.dimension.getBlock(loc)
if (targetBlock.typeId == 'lfg_ff:lamp') {
this.handleLights(targetBlock)
}
if (targetBlock.typeId == 'lfg_ff:awning') {
const edgeBlocks = new AwningComponent().getAlignedEdgeBlocks(targetBlock)
allAwnings.push(edgeBlocks)
}
if (targetBlock.typeId == 'lfg_ff:garage_door') {
const edgeBlocks = new GarageDoorComponent().getAlignedEdgeBlocks(targetBlock)
allGarageDoors.push(edgeBlocks)
}
}
}
}
const onlyGarageDoorPairs = this.cleanPairs(allGarageDoors) ?? []
for (const pair of onlyGarageDoorPairs) {
this.handleGarageDoor(pair.left, player)
}
const onlyAwningPairs = this.cleanPairs(allAwnings) ?? []
for (const pair of onlyAwningPairs) {
this.handleAwning(pair.left, player)
}
}
cleanPairs(pairs) {
const unique = [];
for (const pair of pairs) {
const { left, right } = pair;
let exists = false;
for (const u of unique) {
const sameOrder =
this.isEqual(left, u.left) && this.isEqual(right, u.right);
const swapped =
this.isEqual(left, u.right) && this.isEqual(right, u.left);
if (sameOrder || swapped) {
exists = true;
break;
}
}
if (!exists) {
unique.push(pair);
}
}
return unique;
}
isEqual(b1, b2) {
return b1.location.x == b2.location.x && b1.location.y == b2.location.y && b1.location.z == b2.location.z
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const blockLocationKey = `lfg_ff:wall_switch_channel:${block.location.x},${block.location.y},${block.location.z}`;
world.setDynamicProperty(blockLocationKey, null);
}
isChunkLoaded(dimension, position) {
try {
const block = dimension.getBlock(position);
return block?.isValid ?? false;
} catch (error) {
return false;
}
}
getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
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
if (upBlock && upBlock.typeId == "lfg_ff:light_switch") alllamps.push(upBlock);
if (downBlock && downBlock.typeId == "lfg_ff:light_switch") alllamps.push(downBlock);
for (const expendedlamp of alllamps) {
if (updateBlocks.size < 50) {
affectedBlocks.push(...this.getExpendBlocks(expendedlamp, updateBlocks));
}
}
return affectedBlocks;
}
handleAwning(block, player) {
const comp = new AwningComponent()
comp.wirelessInteract(block, player)
}
handleGarageDoor(block, player) {
const comp = new GarageDoorComponent()
comp.wirelessInteract(block, player)
}
handleLights(block) {
const module = this.getModule(block)
const variant = this.getVariant(block)
const direction = block.permutation.getState('minecraft:cardinal_direction');
if (["floor_top", 'wall_normal', "floor_normal", "roof_normal"].includes(module) || (["floor_center", 'floor_bot'].includes(module) && (variant == 2 || variant == 7))) {
const lightOn = block.permutation.getState("lfg_ff:light_on");
block.setPermutation(block.permutation.withState("lfg_ff:light_on", !lightOn))
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
}