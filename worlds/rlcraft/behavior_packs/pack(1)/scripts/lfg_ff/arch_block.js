/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation, Direction } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class ArchBlockComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.archId = "lfg_ff:arch_block"
this.MaxPaintedBlocksOnce = 300
this.NO_PHYSICS_BLOCKS_IDS = [
"lfg_ff:basket_hoop",
"lfg_ff:better_leaves",
"lfg_ff:bush",
"lfg_ff:carpet",
"lfg_ff:clock",
"lfg_ff:coffee_table",
"lfg_ff:flower_pot",
"lfg_ff:garland",
"lfg_ff:ornament_book",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_table",
"lfg_ff:pillar",
"lfg_ff:roof",
"lfg_ff:staircase_railing",
"lfg_ff:street_lamp",
"lfg_ff:table",
"lfg_ff:tree",
"lfg_ff:wall_shelf",
"lfg_ff:awning",
"lfg_ff:bath_tub",
"lfg_ff:bench",
"lfg_ff:chair",
"lfg_ff:bed",
"lfg_ff:curtains",
"lfg_ff:door",
"lfg_ff:garage_door",
"lfg_ff:lamp",
"lfg_ff:light_switch",
"lfg_ff:piano",
"lfg_ff:sink",
"lfg_ff:sofa",
"lfg_ff:toilet",
"lfg_ff:fridge_block",
"lfg_ff:kitchen_storage_block",
"lfg_ff:letterbox_block",
"lfg_ff:oven_block",
"lfg_ff:wardrobe_block",
"lfg_ff:arch_block",
"lfg_ff:roof_cap",
"lfg_ff:statue",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:xmas_tree",
"lfg_ff:ornament_gifts",
"lfg_ff:ornament_pumkins",
"lfg_ff:letter_tile",
"lfg_ff:plush",
"lfg_ff:wall_board",
"lfg_ff:clear_glass_pane",
"lfg_ff:fence_box",
"minecraft:short_grass",
"minecraft:tall_grass",
"minecraft:poppy",
"minecraft:blue_orchid",
"minecraft:allium",
"minecraft:azure_bluet",
"minecraft:oxeye_daisy",
"minecraft:cornflower",
"minecraft:lily_of_the_valley",
"minecraft:wither_rose",
"minecraft:sunflower",
"minecraft:lilac",
"minecraft:peony",
"minecraft:sculk_vein",
"minecraft:glow_lichen",
"minecraft:lever",
"minecraft:lever",
"minecraft:tripwire_hook",
"minecraft:tripwire_hook",
"minecraft:web",
"minecraft:web",
"minecraft:big_dripleaf",
"minecraft:small_dripleaf_block",
"minecraft:beetroot",
"minecraft:wheat",
"minecraft:potatoes",
"minecraft:carrots",
"minecraft:melon_stem",
"minecraft:pumpkin_stem",
"minecraft:water",
"minecraft:flowing_water",
"minecraft:lava",
"minecraft:flowing_lava",
];
}
isNoPhysicBlock(block) {
if (block && block.typeId == "minecraft:air") return true;
const movableComp = block.getComponent('minecraft:movable')
if (movableComp) {
if (movableComp.movementType == "Popped") return true;
}
if (this.NO_PHYSICS_BLOCKS_IDS.includes(block.typeId)) return true;
if (this.blockIsSlab(block)) return true;
if (block.typeId.includes("carpet")) return true;
if (block.typeId.includes("ornament")) return true;
if (block.typeId.includes("flower")) return true;
if (block.typeId.includes("banner")) return true;
if (block.typeId.includes("trapdoor")) return true;
if (block.typeId.includes("pressure")) return true;
if (block.typeId.includes("button")) return true;
if (block.typeId.includes("candle")) return true;
if (block.typeId.includes("torch")) return true;
if (block.typeId.includes("rail")) return true;
if (block.typeId.includes("dust")) return true;
if (block.typeId.includes("sapling")) return true;
if (block.typeId.includes("crop")) return true;
if (block.typeId.includes("tulip")) return true;
if (block.typeId.includes("bush")) return true;
if (block.typeId.includes("fern")) return true;
if (block.typeId.includes("vine")) return true;
if (block.typeId.includes("frame")) return true;
if (block.typeId.includes("comparator")) return true;
if (block.typeId.includes("repeater")) return true;
if (block.typeId.includes("repeater")) return true;
if (block.typeId.includes("sign") && !block.typeId.includes("hanging")) return true;
if (block.typeId.includes("bud") && !block.typeId.includes("budding")) return true;
if (block.typeId.includes("coral") && !block.typeId.includes("block")) return true;
if (block.typeId.includes("snow_layer") && block.permutation.getState("height") < 2) return true;
return false;
}
blockIsSlab(block) {
const slab_hitbox_blocks = [
"minecraft:bed",
"minecraft:lantern",
"minecraft:soul_lantern",
"minecraft:flower_pot",
"minecraft:flower_pot",
"minecraft:calibrated_sculk_sensor",
"minecraft:sculk_sensor",
"minecraft:campfire",
"minecraft:soul_campfire",
"minecraft:daylight_detector",
"minecraft:daylight_detector_inverted",
"minecraft:daylight_detector_inverted",
"minecraft:stonecutter_block",
"minecraft:amethyst_cluster",
]
return (
(block.typeId.includes("_slab") && !block.typeId.includes("double"))
|| (
slab_hitbox_blocks.includes(block.typeId)
)
|| (
block.typeId.includes("cake")
)
|| (
block.typeId.includes("snow_layer") && block.permutation.getState("height") < 7
)
);
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const verticalHalf = block.permutation.getState('minecraft:vertical_half');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 9 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation.withState("lfg_ff:variant", newVariant))
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, direction, newVariant)
}
}
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const verticalHalf = permutationToPlace.getState('minecraft:vertical_half');
const placedFace = e.face;
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
if (placedFace == "Up" || placedFace == "Down") {
if (this.getModule(frontBlock) == "side_45") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "mid")
} else if ((this.isModule(upBlock, "wall", "side_45", "mid") && placedFace == "Down") || (this.isModule(downBlock, "wall", "side_45", "mid") && placedFace == "Up")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall")
} else if ((this.getModule(upBlock) == "wall" && placedFace == "Up") || (this.getModule(downBlock) == "wall" && placedFace == "Down")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "side_45")
} else if (this.getModule(downBlock) == "wall_solo") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "top_solo").withState('minecraft:cardinal_direction', this.getInvertedDirection(this.getDirection(downBlock))).withState('minecraft:vertical_half', downBlock ? "top" : "bottom")
} else if (this.getModule(upBlock) == "wall_solo") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "top_solo").withState('minecraft:cardinal_direction', this.getInvertedDirection(this.getDirection(upBlock))).withState('minecraft:vertical_half', downBlock ? "top" : "bottom")
} else if (!this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "front", false)) && !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "back", false))) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "top_solo").withState('minecraft:vertical_half', downBlock ? "top" : "bottom").withState('minecraft:cardinal_direction', this.getInvertedDirection(direction))
} else if (!this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "right", false)) && !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "left", false))) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "top_solo").withState('minecraft:vertical_half', downBlock ? "top" : "bottom")
} else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "mid")
}
} else {
if (this.isModule(backBlock, "side_45", "mid")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "side_45")
} else if (!this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "front", false)) && !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "back", false))) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall_solo")
} else if (this.isModule(frontBlock, "wall")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "mid")
} else if (this.isModule(frontBlock, "side_45")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "mid")
} else if (this.isModule(frontBlock, "mid")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "mid")
}
else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall")
}
}
system.runTimeout(() => {
this.updateAllarch(block, direction, verticalHalf)
}, 1)
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down", "front", "back"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, true))
.filter(Boolean);
const variantCount = {};
for (const adjacentBlock of adjacentBlocks) {
const variant = this.getVariant(adjacentBlock);
if (variant !== undefined) {
variantCount[variant] = (variantCount[variant] || 0) + 1;
}
}
let placementVar = 6;
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
if (!block) return "";
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
return block.permutation.getState("lfg_ff:variant")
}
getVerticalPosition(block) {
return block.permutation.getState("minecraft:vertical_half")
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getNeighborBlock(block, direction, side, filterarch) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterarch)
return (
neighborBlock.typeId == this.archId
|| (neighborBlock.typeId == this.archGateId &&
(this.getDirection(neighborBlock) !== this.getDirectionFromBlocks(block, neighborBlock) && this.getOppositeDirection(this.getDirection(neighborBlock)) !== this.getDirectionFromBlocks(block, neighborBlock))
)
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
getDirectionFromPlacedFace(face) {
switch (face) {
case 'West':
return 'west';
case 'East':
return 'east';
case 'North':
return 'north';
case 'South':
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
getDirectionFromBlocks(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
const dx = loc2.x - loc1.x;
const dy = loc2.y - loc1.y;
const dz = loc2.z - loc1.z;
if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) {
return dx > 0 ? 'east' : 'west';
} else if (Math.abs(dz) > Math.abs(dx) && Math.abs(dz) > Math.abs(dy)) {
return dz > 0 ? 'south' : 'north';
} else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
return dy > 0 ? 'up' : 'down';
}
return null;
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
getInvertedDirection(direction) {
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
areSameLocation(block1, block2) {
const loc1 = block1.location;
const loc2 = block2.location;
return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z;
}
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allarchs = [];
if (frontBlock && block.typeId == this.archId) allarchs.push(frontBlock)
if (backBlock && block.typeId == this.archId) allarchs.push(backBlock)
if (rightBlock) allarchs.push(rightBlock)
if (leftBlock) allarchs.push(leftBlock)
if (upBlock) allarchs.push(upBlock)
if (downBlock) allarchs.push(downBlock)
for (const expendedarch of allarchs) {
const expendedVariant = this.getVariant(expendedarch);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedarch);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedarch.setPermutation(expendedarch.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedarch, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllarch(block, direction, verticalHalf, updatedarchBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedarchBlocks.has(blockLocationKey)) {
return;
}
updatedarchBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allarchs = [];
if (frontBlock) allarchs.push(frontBlock)
if (backBlock) allarchs.push(backBlock)
if (rightBlock) allarchs.push(rightBlock)
if (leftBlock) allarchs.push(leftBlock)
if (upBlock) allarchs.push(upBlock)
if (downBlock) allarchs.push(downBlock)
if (block) allarchs.push(block)
for (const expendedarch of allarchs) {
const expDir = this.getDirection(expendedarch);
const expModule = this.getModule(expendedarch);
const expVerticalHalf = this.getVerticalPosition(expendedarch);
const expendedleftBlock = this.getNeighborBlock(expendedarch, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedarch, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedarch, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedarch, expDir, "back", true);
const expendedupBlock = this.getNeighborBlock(expendedarch, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendedarch, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(
expendedleftBlock,
expendedrightBlock,
expendedfrontBlock,
expendedbackBlock,
expendedupBlock,
expendeddownBlock,
expDir, expVerticalHalf, expModule, expendedarch
);
expendedarch.setPermutation(expendedarch.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction)
.withState('minecraft:vertical_half', expNewModuleAndDir.verticalHalf));
system.runTimeout(() => {
try {
if (updatedarchBlocks.size <= 6)
this.updateAllarch(expendedarch, expNewModuleAndDir.direction, expNewModuleAndDir.verticalHalf, updatedarchBlocks);
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
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, upBlock, downBlock, direction, verticalHalf, module, block) {
const archs = []
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
archs.push(b)
})
if (!archs.includes(leftBlock)) leftBlock = null
if (!archs.includes(rightBlock)) rightBlock = null
if (!archs.includes(frontBlock)) frontBlock = null
if (!archs.includes(backBlock)) backBlock = null
if (!archs.includes(upBlock)) upBlock = null
if (!archs.includes(downBlock)) downBlock = null
if (archs.length == 0) return { module: module, direction: direction, verticalHalf: verticalHalf }
if (this.isModule(downBlock, "wall", "side_45") && (this.isModule(backBlock, "mid")) && this.getVerticalPosition(backBlock) == 'top') {
return { module: "side_45", direction: direction, verticalHalf: "top" }
} else if (this.isModule(upBlock, "wall", "side_45") && (this.isModule(backBlock, "mid")) && this.getVerticalPosition(backBlock) == 'bottom') {
return { module: "side_45", direction: direction, verticalHalf: "bottom" }
}
else if (this.isModule(upBlock, "wall") && (this.isModule(block, "mid")) && this.getVerticalPosition(block) == 'bottom') {
return { module: "wall", direction: direction, verticalHalf: "bottom" }
}
else if (this.isModule(downBlock, "wall") && (this.isModule(block, "mid")) && this.getVerticalPosition(block) == 'top') {
return { module: "side_45", direction: direction, verticalHalf: "top" }
}
else if ((this.isModule(block, "wall") && (this.isModule(leftBlock, "mid")) && this.getVerticalPosition(leftBlock) == 'bottom') || (this.isModule(block, "wall") && (this.isModule(rightBlock, "mid")) && this.getVerticalPosition(rightBlock) == 'bottom')) {
return { module: "mid", direction: direction, verticalHalf: "bottom" }
} else if ((this.isModule(block, "wall") && (this.isModule(leftBlock, "mid")) && this.getVerticalPosition(leftBlock) == 'top') || (this.isModule(block, "wall") && (this.isModule(rightBlock, "mid")) && this.getVerticalPosition(rightBlock) == 'top')) {
return { module: "mid", direction: direction, verticalHalf: "top" }
}
else if (this.isModule(block, "mid") && (this.isModule(leftBlock, "side_45")) && this.getVerticalPosition(leftBlock) == 'bottom') {
return { module: "mid", direction: this.getInvertedDirection(this.getDirectionFromBlocks(block, leftBlock)), verticalHalf: "bottom" }
} else if (this.isModule(block, "mid") && (this.isModule(rightBlock, "side_45")) && this.getVerticalPosition(rightBlock) == 'bottom') {
return { module: "mid", direction: this.getInvertedDirection(this.getDirectionFromBlocks(block, rightBlock)), verticalHalf: "bottom" }
}
else if (this.isModule(block, "mid") && (this.isModule(leftBlock, "side_45")) && this.getVerticalPosition(leftBlock) == 'top') {
return { module: "mid", direction: this.getInvertedDirection(this.getDirectionFromBlocks(block, leftBlock)), verticalHalf: "top" }
} else if (this.isModule(block, "mid") && (this.isModule(rightBlock, "side_45")) && this.getVerticalPosition(rightBlock) == 'top') {
return { module: "mid", direction: this.getInvertedDirection(this.getDirectionFromBlocks(block, rightBlock)), verticalHalf: "top" }
}
else if ((this.isModule(block, "wall") && (this.isModule(leftBlock, "mid")) && this.getVerticalPosition(leftBlock) == 'top') || (this.isModule(block, "wall") && (this.isModule(rightBlock, "mid")) && this.getVerticalPosition(rightBlock) == 'top')) {
return { module: "mid", direction: direction, verticalHalf: "top" }
}
else if (this.isModule(downBlock, "wall") && (this.isModule(block, "mid")) && this.getVerticalPosition(block) == 'bottom' && !this.isNoPhysicBlock(block.above())) {
return { module: "side_45", direction: direction, verticalHalf: "top" }
} else if (this.isModule(upBlock, "wall") && (this.isModule(block, "mid")) && this.getVerticalPosition(block) == 'top' && !this.isNoPhysicBlock(block.below())) {
return { module: "side_45", direction: direction, verticalHalf: "bottom" }
}
else if (this.isModule(upBlock, "mid") && (this.isModule(block, "mid")) && this.getVerticalPosition(block) == 'bottom' && this.getVerticalPosition(upBlock) == 'bottom') {
if (this.isModule(downBlock, "wall") || (this.isModule(downBlock, "side_45") && this.getVerticalPosition(downBlock) == verticalHalf)) {
return { module: "wall", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "side_45", direction: direction, verticalHalf: "bottom" }
}
} else if (this.isModule(downBlock, "mid") && (this.isModule(block, "mid")) && this.getVerticalPosition(block) == 'top' && this.getVerticalPosition(downBlock) == 'top') {
if (this.isModule(upBlock, "wall", "side_45")) {
return { module: "wall", direction: direction, verticalHalf: "top" }
} else {
return { module: "side_45", direction: direction, verticalHalf: "top" }
}
}
else if (this.isModule(frontBlock, "side_45") || this.isModule(frontBlock, "mid")) {
return { module: "mid", direction: this.getInvertedDirection(this.getDirectionFromBlocks(block, frontBlock)), verticalHalf: verticalHalf }
} else if (this.isModule(frontBlock, "mid") && (this.isModule(backBlock, "mid"))) {
return { module: "mid", direction: direction, verticalHalf: verticalHalf }
} else if (this.isModule(block, "side_45") && (this.isModule(downBlock, "mid", "wall"))) {
return { module: "side_45", direction: this.getDirection(downBlock), verticalHalf: verticalHalf }
}
else if (!this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "front", false)) && !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "back", false))) {
if ((!upBlock && downBlock) || (upBlock && !downBlock && this.isModule(block, "top_solo"))) {
return { module: "top_solo", direction: this.getInvertedDirection(direction), verticalHalf: downBlock ? "top" : "bottom" }
} else {
return { module: "wall_solo", direction: direction, verticalHalf: verticalHalf }
}
} else if (!this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "left", false)) && !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "right", false))) {
if ((!upBlock && downBlock) || (upBlock && !downBlock && this.isModule(block, "top_solo"))) {
return { module: "top_solo", direction: direction, verticalHalf: downBlock ? "top" : "bottom" }
} else {
return { module: "wall_solo", direction: this.getInvertedDirection(direction), verticalHalf: verticalHalf }
}
}
else {
return { module: module, direction: direction, verticalHalf: verticalHalf }
}
}
}