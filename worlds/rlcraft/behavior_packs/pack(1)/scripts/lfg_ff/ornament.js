/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";
import { Vector } from './vector.js';
import { PlushComponent } from './plush.js';
export class OrnamentComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
}
beforeOnPlayerPlace(e) {
const block = e.block;
if (block.below().typeId == "lfg_ff:coffee_table") {
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:placement", "down")
}
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
return;
}
}
}
}
const plushComp = new PlushComponent()
const ornamentComp = new OrnamentComponent()
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!isFirstEvent) return;
if (!itemStack) return;
if (blockFace !== "Up") return;
const ORNAMENTS = [
"lfg_ff:ornament_table",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_book",
"lfg_ff:ornament_pumpkins",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:ornament_gifts",
]
const ToolList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small",
]
if (ORNAMENTS.includes(itemStack.typeId) && block.typeId == "lfg_ff:coffee_table" && itemStack.typeId == block.above().typeId) {
const module = getModule(block.above())
const isCreative = player.getGameMode() == "Creative"
let newModule = null
if (module == "v1") newModule = "v2"
if (module == "v2") newModule = "v3"
if (module == "v3") newModule = "v4"
if (!newModule) return;
e.cancel = true;
system.runTimeout(() => {
const blockOrnamentType = block.above().typeId.split("_")[2]
let sound = "place.pointed_dripstone"
if (blockOrnamentType == "book") sound = "dig.candle"
if (blockOrnamentType == "cadre") sound = "block.scaffolding.place"
if (blockOrnamentType == "plant") sound = "place.azalea"
if (blockOrnamentType == "pumpkins") sound = "dig.wood"
if (blockOrnamentType == "desk") sound = "dig.candle"
if (blockOrnamentType == "toys") sound = "dig.wood"
if (blockOrnamentType == "gifts") sound = "dig.wood"
player.dimension.playSound(sound, block.above().location)
block.above().setPermutation(block.above().permutation.withState("lfg_ff:module", newModule))
if (!isCreative)
player.runCommand(`clear @s ${itemStack.typeId} 0 1`)
}, 1)
return;
} else if (ToolList.includes(itemStack.typeId) && block.typeId == "lfg_ff:coffee_table" && (ORNAMENTS.includes(block.above().typeId) || block.above().typeId == "lfg_ff:plush")) {
const getBlockComponent = {
"lfg_ff:plush": plushComp,
"lfg_ff:ornament_table": ornamentComp,
"lfg_ff:ornament_plant": ornamentComp,
"lfg_ff:ornament_cadre": ornamentComp,
"lfg_ff:ornament_book": ornamentComp,
"lfg_ff:ornament_pumpkins": ornamentComp,
"lfg_ff:ornament_desk": ornamentComp,
"lfg_ff:ornament_toys": ornamentComp,
"lfg_ff:ornament_gifts": ornamentComp
}
let blockComponent = getBlockComponent[block.above().typeId] ?? null
if (!blockComponent) return;
if (itemStack.typeId == "lfg_ff:variant_picker") {
system.runTimeout(() => {
handleVariantPicker(block.above(), player)
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:color_brush") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:vs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.above().typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: block.above(), player, smallBrush: false, variantPicker: pickerVariant })
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:tvs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.above().typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: block.above(), player, smallBrush: true, variantPicker: pickerVariant })
}, 1)
return;
}
}
})
function handleVariantPicker(block, player) {
let variant = block.permutation.getState("lfg_ff:variant") ?? null
if (!variant) return;
player.setDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`, variant)
player.runCommand(`tellraw @s { "rawtext": [ { "text" : "§9Picked variant §3${variant}§9 for §3" }, { "translate" : "tile.${block.typeId}.name" } ] }`)
player.dimension.playSound("random.pop", block.location, { pitch: 1.5 })
}
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!itemStack || !isOrnament(itemStack.typeId) || !isOrnament(block.typeId)) return;
const itemOrnamentType = itemStack.typeId.split("_")[2]
const blockOrnamentType = block.typeId.split("_")[2]
if (itemOrnamentType !== blockOrnamentType) return;
const direction = getDirection(block)
const module = getModule(block)
const variant = getVariant(block)
const isCreative = player.getGameMode() == "Creative"
let newModule = null
if (module == "v1") newModule = "v2"
if (module == "v2") newModule = "v3"
if (module == "v3") newModule = "v4"
if (!newModule) return;
e.cancel = true;
system.runTimeout(() => {
let sound = "place.pointed_dripstone"
if (blockOrnamentType == "book") sound = "dig.candle"
if (blockOrnamentType == "cadre") sound = "block.scaffolding.place"
if (blockOrnamentType == "plant") sound = "place.azalea"
if (blockOrnamentType == "pumpkins") sound = "dig.wood"
if (blockOrnamentType == "desk") sound = "dig.candle"
if (blockOrnamentType == "toys") sound = "dig.wood"
if (blockOrnamentType == "gifts") sound = "dig.wood"
player.dimension.playSound(sound, block.location)
block.setPermutation(block.permutation.withState("lfg_ff:module", newModule))
if (!isCreative)
player.runCommand(`clear @s ${itemStack.typeId} 0 1`)
}, 1)
});
world.beforeEvents.playerBreakBlock.subscribe((e) => {
const { block, dimension, player } = e
if (isOrnament(block.typeId)) {
const blockId = block.typeId
const loc = block.location
const module = getModule(block)
const isCreative = player.getGameMode() == "Creative"
system.runTimeout(() => {
if (!isCreative) {
let lootAmount = 1
if (module == "v2") lootAmount = 2
if (module == "v3") lootAmount = 3
if (module == "v4") lootAmount = 4
player.dimension.spawnItem(new ItemStack(blockId, lootAmount), Vector.add(loc, new Vector(0, 0.5, 0)))
}
}, 1)
}
if (isOrnament(block.above().typeId) && block.typeId == "lfg_ff:coffee_table") {
const blockId = block.above().typeId
const loc = block.above().location
const module = getModule(block.above())
const isCreative = player.getGameMode() == "Creative"
system.runTimeout(() => {
if (!isCreative) {
let lootAmount = 1
if (module == "v2") lootAmount = 2
if (module == "v3") lootAmount = 3
if (module == "v4") lootAmount = 4
player.dimension.spawnItem(new ItemStack(blockId, lootAmount), Vector.add(loc, new Vector(0, 0, 0)))
}
player.dimension.runCommand(`setblock ${block.above().location.x} ${block.above().location.y} ${block.above().location.z} air destroy`)
}, 1)
}
if (block.above().typeId == "lfg_ff:plush" && block.typeId == "lfg_ff:coffee_table") {
const blockId = block.above().typeId
const loc = block.above().location
const isCreative = player.getGameMode() == "Creative"
system.runTimeout(() => {
player.dimension.runCommand(`setblock ${block.above().location.x} ${block.above().location.y} ${block.above().location.z} air destroy`)
}, 1)
}
})
function getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
function getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
function getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
function isOrnament(id) {
return id.includes("ornament") && id.includes("lfg_ff:")
}