/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class ChairComponent {
constructor() {
this.onPlayerInteract = this.onPlayerInteract.bind(this);
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.chairId = "lfg_ff:chair"
this.MaxPaintedBlocksOnce = 100
}
onPlayerInteract(e) {
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
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
let newVariant = variant == 7 ? 1 : variant + 1
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
if (pickedVar) newVariant = pickedVar
}
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant));
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
if (module !== 'top') {
const center = this.getBlockCenter(block)
const direction = this.getDirection(block)
const seatEntity = player.dimension.spawnEntity("lfg_ff:chair_seat", center)
seatEntity.setRotation({ x: 0, y: this.getRotationFromDirection(direction) })
seatEntity.getComponent("minecraft:rideable").addRider(player)
} else {
const center = this.getBlockCenter(block.below())
const direction = this.getDirection(block.below())
const seatEntity = player.dimension.spawnEntity("lfg_ff:chair_seat", center)
seatEntity.setRotation({ x: 0, y: this.getRotationFromDirection(direction) })
seatEntity.getComponent("minecraft:rideable").addRider(player)
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
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const center = this.getBlockCenter(block)
const seatEntity = block.dimension.getEntities({ location: center, maxDistance: 0.25, type: "lfg_ff:chair_seat" })[0]
if (seatEntity) {
seatEntity.remove()
}
if (brokenBlockPermutation.getState("lfg_ff:module") == "mid") {
block.setType(this.chairId)
block.setPermutation(block.permutation.withState("lfg_ff:module", "bot").withState("lfg_ff:variant", brokenBlockPermutation.getState("lfg_ff:variant")).withState("minecraft:cardinal_direction", brokenBlockPermutation.getState("minecraft:cardinal_direction")))
}
system.runTimeout(() => {
this.updateAllchair(block)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const placedFace = e.face;
if (block.below().typeId == this.chairId && this.getModule(block.below()) == "bot") {
e.permutationToPlace = BlockPermutation.resolve("minecraft:air")
system.run(() => {
block.below().setPermutation(block.below().permutation.withState("lfg_ff:module", "mid").withState("minecraft:cardinal_direction", permutationToPlace.getState("minecraft:cardinal_direction")))
block.dimension.playSound("dig.wood", block.location)
e.player.runCommand(`clear @s ${permutationToPlace.type.id} 0 1`)
})
} else {
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block))
}
system.runTimeout(() => {
this.updateAllchair(block)
}, 1)
}
getPlacementVariant(block) {
const allBlocks = [block.above(), block.below()]
const validBlocks = []
allBlocks.forEach((b) => {
if (!b || b.typeId !== this.chairId) return;
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
const allchairs = [];
if (upBlock.typeId == this.chairId) allchairs.push(upBlock)
if (downBlock.typeId == this.chairId) allchairs.push(downBlock)
for (const expendedchair of allchairs) {
const expendedVariant = this.getVariant(expendedchair);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedchair.setPermutation(expendedchair.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedchair, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllchair(block) {
const upBlock = block.above()
const downBlock = block.below()
const allchairs = [];
if (upBlock.typeId == this.chairId) allchairs.push(upBlock)
if (downBlock.typeId == this.chairId) allchairs.push(downBlock)
if (block.typeId == this.chairId) allchairs.push(block)
for (const expendedchair of allchairs) {
const expDir = this.getDirection(expendedchair);
const expUpBlock = expendedchair.above().typeId == this.chairId ? expendedchair.above() : null
const expDownBlock = expendedchair.below().typeId == this.chairId ? expendedchair.below() : null
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expUpBlock, expDownBlock, expendedchair, expDir);
expendedchair.setPermutation(expendedchair.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module).withState("minecraft:cardinal_direction", expNewModuleAndDir.dir));
}
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getUpdatedModuleAndDirection(upBlock, downBlock, block, direction) {
const chairs = []
const allBlocks = [upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
chairs.push(b)
})
if (!chairs.includes(upBlock)) upBlock = null
if (!chairs.includes(downBlock)) downBlock = null
if (this.getModule(block) == "mid") return { module: "mid", dir: direction }
if (downBlock && this.getModule(downBlock) == "mid") {
return { module: "top", dir: this.getDirection(downBlock) }
}
return { module: "bot", dir: direction }
}
}