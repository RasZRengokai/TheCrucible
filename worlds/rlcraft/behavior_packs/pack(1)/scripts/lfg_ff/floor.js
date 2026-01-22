/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class FloorComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.floorId = "lfg_ff:floor"
this.MaxPaintedBlocksOnce = 2000
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = "north"
const floorVar = this.getPlacementVariant(block, direction, 'floor');
const ceilVar = this.getPlacementVariant(block, direction, 'ceiling');
e.permutationToPlace = permutationToPlace
.withState("lfg_ff:variant", floorVar)
.withState("lfg_ff:variant_ceil", ceilVar)
.withState("lfg_ff:in_update", false);
}
getPlacementVariant(block, direction, face = "floor") {
const readVariant = (b) => {
if (!b) return undefined;
const perm = b.permutation;
return (face === 'ceiling')
? perm.getState("lfg_ff:variant_ceil")
: perm.getState("lfg_ff:variant");
};
const adjacentPositions = ["left", "right", "front", "back"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, true))
.filter(Boolean);
const variantCount = {};
for (const nb of adjacentBlocks) {
const v = readVariant(nb);
if (v !== undefined) {
variantCount[v] = (variantCount[v] || 0) + 1;
}
}
let placementVar = 1;
let maxCount = 0;
for (const [vStr, count] of Object.entries(variantCount)) {
const v = parseInt(vStr, 10);
if (count > maxCount) {
maxCount = count;
placementVar = v;
}
}
const max = (face === 'ceiling') ? 6 : 11;
if (placementVar < 1 || placementVar > max) placementVar = 1;
return placementVar;
}
variantChanger(e) {
const smallBrush = e.smallBrush;
const variantPicker = e.variantPicker;
const block = e.block;
const player = e.player;
const targetFace = e.face;
const direction = "north"
const floorVar = block.permutation.getState("lfg_ff:variant");
const ceilVar = block.permutation.getState("lfg_ff:variant_ceil");
const maxByFace = (targetFace === 'ceiling') ? 6 : 11;
const curVar = (targetFace === 'ceiling') ? ceilVar : floorVar;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return;
const isBrush = (handItem.typeId === "lfg_ff:color_brush" || handItem.typeId === "lfg_ff:variant_selector_small");
if (!isBrush) return;
if (player.hasTag("lfg_ff:color_brush:cooldown")) return;
const wrapNext = (v, max) => (v >= max ? 1 : (v + 1));
let newVar = wrapNext(curVar, maxByFace);
if (variantPicker != null) {
const pick = parseInt(variantPicker, 10);
if (!Number.isNaN(pick) && pick >= 1 && pick <= maxByFace) newVar = pick;
}
try {
let perm = block.permutation.withState("lfg_ff:in_update", true);
perm = (targetFace === 'ceiling')
? perm.withState("lfg_ff:variant_ceil", newVar)
: perm.withState("lfg_ff:variant", newVar);
block.setPermutation(perm);
system.runTimeout(() => {
try {
let perm2 = block.permutation.withState("lfg_ff:in_update", false);
perm2 = (targetFace === 'ceiling')
? perm2.withState("lfg_ff:variant_ceil", newVar)
: perm2.withState("lfg_ff:variant", newVar);
block.setPermutation(perm2);
} catch (_) { }
}, 1);
} catch (_) { }
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`);
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown");
system.runTimeout(() => player.removeTag("lfg_ff:color_brush:cooldown"), 10);
this.expendPaint(block, direction, newVar, targetFace);
}
}
getModule(block) {
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
getNeighborBlock(block, direction, side, filterfloor) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterfloor)
return (
neighborBlock.typeId == this.floorId
) ? neighborBlock : null;
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
areSameLocation(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z;
}
expendPaint(block, direction, newVariant, targetFace, updatedPaintedBlocks = new Set()) {
const key = `${block.location.x},${block.location.y},${block.location.z},${targetFace}`;
if (updatedPaintedBlocks.has(key)) return;
updatedPaintedBlocks.add(key);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const neighbors = [frontBlock, backBlock, rightBlock, leftBlock].filter(Boolean);
const readFaceVar = (b) => {
const perm = b.permutation;
return (targetFace === 'ceiling')
? perm.getState("lfg_ff:variant_ceil")
: perm.getState("lfg_ff:variant");
};
for (const nb of neighbors) {
const currentVar = readFaceVar(nb);
if (currentVar === newVariant) continue;
system.runTimeout(() => {
if (updatedPaintedBlocks.size >= this.MaxPaintedBlocksOnce) return;
try {
let perm = nb.permutation.withState("lfg_ff:in_update", true);
perm = (targetFace === 'ceiling')
? perm.withState("lfg_ff:variant_ceil", newVariant)
: perm.withState("lfg_ff:variant", newVariant);
nb.setPermutation(perm);
system.runTimeout(() => {
try {
let perm2 = nb.permutation.withState("lfg_ff:in_update", false);
perm2 = (targetFace === 'ceiling')
? perm2.withState("lfg_ff:variant_ceil", newVariant)
: perm2.withState("lfg_ff:variant", newVariant);
nb.setPermutation(perm2);
} catch (_) { }
}, 2);
const nbDir = "north"
this.expendPaint(nb, nbDir, newVariant, targetFace, updatedPaintedBlocks);
} catch (_) { }
}, 1);
}
}
}
const floorComp = new FloorComponent()
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!isFirstEvent) return;
const itemList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small",
]
const blockList = [
"lfg_ff:floor"
]
if (!blockList.includes(block.typeId)) return;
const getBlockComponent = {
"lfg_ff:floor": floorComp
}
let blockComponent = getBlockComponent[block.typeId] ?? null
if (!blockComponent) return;
let face = e.blockFace == "Up" ? "floor" : e.blockFace == "Down" ? "ceiling" : null
if (!face) return;
if (!itemList.includes(itemStack?.typeId)) {
return;
}
if (itemStack.typeId == "lfg_ff:variant_picker") {
system.runTimeout(() => {
handleVariantPicker(block, player, face)
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:color_brush") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:vs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
const pickerVariantObj = pickedVar ? JSON.parse(pickedVar) : null
if (pickerVariantObj)
pickerVariant = face == "ceiling" ? pickerVariantObj.ceiling : pickerVariantObj.floor
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: block, player, smallBrush: false, variantPicker: pickerVariant, face })
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:tvs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
const pickerVariantObj = pickedVar ? JSON.parse(pickedVar) : null
if (pickerVariantObj)
pickerVariant = face == "ceiling" ? pickerVariantObj.ceiling : pickerVariantObj.floor
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: block, player, smallBrush: true, variantPicker: pickerVariant, face })
}, 1)
return;
}
})
function handleVariantPicker(block, player, face) {
let variant = face == "ceiling" ? block.permutation.getState("lfg_ff:variant_ceil") : block.permutation.getState("lfg_ff:variant")
if (!variant) return;
player.setDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`, JSON.stringify({ ceiling: block.permutation.getState("lfg_ff:variant_ceil"), floor: block.permutation.getState("lfg_ff:variant") }))
player.runCommand(`tellraw @s { "rawtext": [ { "text" : "§9Picked variant §3${variant}§9 for §3" }, { "translate" : "tile.${block.typeId}.name" }, { "text" : " §3(${face == "ceiling" ? "Ceiling" : "Floor"})" } ] }`)
player.dimension.playSound("random.pop", block.location, { pitch: 1.5 })
}