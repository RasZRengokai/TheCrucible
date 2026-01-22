/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class ToiletComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.toiletId = "lfg_ff:toilet"
}
beforeOnPlayerPlace(e) {
const block = e.block;
system.run(()=>{
block.dimension.spawnParticle("lfg_ff:dust_particles", Vector.add(block.location, new Vector(0.5, 0, 0.5)))
})
}
onPlayerInteract(e) {
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const module = this.getModule(block)
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
if (module == "open") {
const seatEntity = player.dimension.spawnEntity("lfg_ff:toilet_seat", center)
seatEntity.setRotation({ x: 0, y: this.getRotationFromDirection(direction) })
seatEntity.getComponent("minecraft:rideable").addRider(player)
} else {
player.dimension.playSound("random.door_open", center)
block.setPermutation(block.permutation.withState("lfg_ff:module", "open"))
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
const center = this.getBlockCenter(block)
const seatEntity = block.dimension.getEntities({ location: center, maxDistance: 0.75, type: "lfg_ff:toilet_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
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
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
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
}