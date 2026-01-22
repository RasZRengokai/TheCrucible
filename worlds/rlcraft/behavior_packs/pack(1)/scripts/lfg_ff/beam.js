/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation, Direction } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class BeamComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.beamId = "lfg_ff:beam"
this.MaxPaintedBlocksOnce = 500
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
"lfg_ff:beam",
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
const faceLocation = e.faceLocation;
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
if (placedFace == "Up" || placedFace == "Down") {
if (placedFace == "Up") {
if (downBlock) {
if (this.getModule(downBlock) == "border_vrt" || this.getModule(downBlock) == "hzr_wall_corner" || this.getModule(downBlock) == "border_corner") {
const frontSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "front", false))
const rightSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "right", false))
const leftSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "left", false))
if (frontSolid && leftSolid) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", this.getLeftDirection(direction)).withState("minecraft:vertical_half", "bottom")
} else if (frontSolid && rightSolid) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", direction).withState("minecraft:vertical_half", "bottom")
} else {
if (this.getModule(downBlock) == "border_vrt")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", this.getDirection(downBlock)).withState("minecraft:vertical_half", "bottom")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:vertical_half", "bottom")
}
} else if (this.getModule(downBlock) == "hzr_wall") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall")
} else if (this.isModule(downBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
} else if (this.getModule(downBlock) == "hzr_floor") {
if (this.getVerticalPosition(downBlock) == "bottom")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
} else if (this.getModule(downBlock) == "hzr_cross") {
if (this.getVerticalPosition(downBlock) == "bottom")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
}
} else {
if (upBlock && this.isModule(upBlock, "vrt_wall") && this.getDirection(upBlock) == direction)
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
}
} else {
if (upBlock) {
if (this.getModule(upBlock) == "border_vrt" || this.getModule(upBlock) == "hzr_wall_corner" || this.getModule(upBlock) == "border_corner") {
const frontSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "front", false))
const rightSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "right", false))
const leftSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "left", false))
if (frontSolid && leftSolid) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", this.getLeftDirection(direction)).withState("minecraft:vertical_half", "bottom")
} else if (frontSolid && rightSolid) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", direction).withState("minecraft:vertical_half", "bottom")
} else {
if (this.getModule(upBlock) == "border_vrt")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", this.getDirection(upBlock)).withState("minecraft:vertical_half", "bottom")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:vertical_half", "bottom")
}
} else if (this.getModule(upBlock) == "hzr_wall") {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall")
} else if (this.isModule(upBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
} else if (this.getModule(upBlock) == "hzr_floor") {
if (this.getVerticalPosition(upBlock) == "top")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
} else if (this.getModule(upBlock) == "hzr_cross") {
if (this.getVerticalPosition(upBlock) == "top")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
}
} else {
if (downBlock && this.isModule(downBlock, "vrt_wall") && this.getDirection(downBlock) == direction)
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
}
}
} else {
if (frontBlock) {
if (this.isModule(frontBlock, "hzr_floor", "hzr_cross")) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
} else if (this.isModule(frontBlock, "hzr_wall_corner")) {
if (this.getVerticalPosition(frontBlock) == "bottom")
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall").withState("minecraft:cardinal_direction", this.getInvertedDirection((direction == this.getDirection(frontBlock) ? direction : this.getOppositeDirection(direction))))
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall").withState("minecraft:cardinal_direction", this.getInvertedDirection((direction == this.getDirection(frontBlock) ? this.getOppositeDirection(direction) : direction)))
} else if (this.isModule(frontBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t")) {
if (direction == this.getOppositeDirection(this.getDirection(frontBlock)))
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
else if (direction == this.getDirection(frontBlock))
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall").withState("minecraft:cardinal_direction", this.getInvertedDirection((direction == this.getLeftDirection(this.getDirection(frontBlock)) ? direction : this.getOppositeDirection(direction))))
} else if (this.isModule(frontBlock, "hzr_wall")) {
if (direction == this.getOppositeDirection(this.getDirection(frontBlock)))
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall")
else if (direction == this.getDirection(frontBlock))
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_floor")
else
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall").withState("minecraft:cardinal_direction", this.getInvertedDirection((direction == this.getLeftDirection(this.getDirection(frontBlock)) ? direction : this.getOppositeDirection(direction))))
}
} else {
if (leftBlock || rightBlock) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "hzr_wall")
} else {
const frontSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "front", false))
const rightSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "right", false))
const leftSolid = !this.isNoPhysicBlock(this.getNeighborBlock(block, direction, "left", false))
if (frontSolid && leftSolid) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", this.getLeftDirection(direction)).withState("minecraft:vertical_half", "bottom")
} else if (frontSolid && rightSolid) {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "border_vrt").withState("minecraft:cardinal_direction", direction).withState("minecraft:vertical_half", "bottom")
} else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "vrt_wall")
}
}
}
}
system.runTimeout(() => {
this.updateAllbeam(block, direction, verticalHalf)
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
getVerticalPosition(block) {
return block.permutation.getState("minecraft:vertical_half")
}
getDirection(block) {
return block.permutation.getState("minecraft:cardinal_direction")
}
getNeighborBlock(block, direction, side, filterbeam) {
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
if (filterbeam)
return (
neighborBlock.typeId == this.beamId
|| (neighborBlock.typeId == this.beamGateId &&
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
const allbeams = [];
if (frontBlock && block.typeId == this.beamId) allbeams.push(frontBlock)
if (backBlock && block.typeId == this.beamId) allbeams.push(backBlock)
if (rightBlock) allbeams.push(rightBlock)
if (leftBlock) allbeams.push(leftBlock)
if (upBlock) allbeams.push(upBlock)
if (downBlock) allbeams.push(downBlock)
for (const expendedbeam of allbeams) {
const expendedVariant = this.getVariant(expendedbeam);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedbeam);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedbeam.setPermutation(expendedbeam.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedbeam, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllbeam(block, direction, verticalHalf, updatedbeamBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedbeamBlocks.has(blockLocationKey)) {
return;
}
updatedbeamBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allbeams = [];
if (frontBlock) allbeams.push(frontBlock)
if (backBlock) allbeams.push(backBlock)
if (rightBlock) allbeams.push(rightBlock)
if (leftBlock) allbeams.push(leftBlock)
if (upBlock) allbeams.push(upBlock)
if (downBlock) allbeams.push(downBlock)
for (const expendedbeam of allbeams) {
const expDir = this.getDirection(expendedbeam);
const expModule = this.getModule(expendedbeam);
const expVerticalHalf = this.getVerticalPosition(expendedbeam);
const expendedleftBlock = this.getNeighborBlock(expendedbeam, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedbeam, expDir, "right", true);
const expendedfrontBlock = this.getNeighborBlock(expendedbeam, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedbeam, expDir, "back", true);
const expendedupBlock = this.getNeighborBlock(expendedbeam, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendedbeam, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(
expendedleftBlock,
expendedrightBlock,
expendedfrontBlock,
expendedbackBlock,
expendedupBlock,
expendeddownBlock,
expDir, expVerticalHalf, expModule, expendedbeam
);
expendedbeam.setPermutation(expendedbeam.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction)
.withState('minecraft:vertical_half', expNewModuleAndDir.verticalHalf));
system.runTimeout(() => {
try {
if (updatedbeamBlocks.size <= 6)
this.updateAllbeam(expendedbeam, expNewModuleAndDir.direction, expNewModuleAndDir.verticalHalf, updatedbeamBlocks);
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
const beams = []
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
beams.push(b)
})
if (!beams.includes(leftBlock)) leftBlock = null
if (!beams.includes(rightBlock)) rightBlock = null
if (!beams.includes(frontBlock)) frontBlock = null
if (!beams.includes(backBlock)) backBlock = null
if (!beams.includes(upBlock)) upBlock = null
if (!beams.includes(downBlock)) downBlock = null
if (beams.length == 0) return { module: module, direction: direction, verticalHalf: verticalHalf }
if (
((rightBlock && this.getModule(rightBlock) == "hzr_wall") || (leftBlock && this.getModule(leftBlock) == "hzr_wall"))
&& ((upBlock && this.isModule(upBlock, "vrt_wall", "wall_corner_3", "wall_corner_t", "wall_corner")) || (downBlock && this.isModule(downBlock, "vrt_wall", "wall_corner_3", "wall_corner_t", "wall_corner")))
) {
const isWallCorner3 = backBlock && this.isModule(backBlock, "hzr_floor", "wall_corner", "wall_corner_3", "hzr_cross")
if (upBlock) {
if (downBlock) {
if (leftBlock)
return { module: isWallCorner3 ? "wall_corner_3" : "wall_corner_t", direction: direction, verticalHalf: this.getVerticalPosition(leftBlock) }
else
return { module: isWallCorner3 ? "wall_corner_3" : "wall_corner_t", direction: direction, verticalHalf: this.getVerticalPosition(rightBlock) }
} else {
return { module: isWallCorner3 ? "wall_corner_3" : "wall_corner_t", direction: direction, verticalHalf: "bottom" }
}
} else {
return { module: isWallCorner3 ? "wall_corner_3" : "wall_corner_t", direction: direction, verticalHalf: "top" }
}
} else if (module == "hzr_floor" && (rightBlock || leftBlock) && (frontBlock || backBlock)) {
if ((
((rightBlock && this.isModule(rightBlock, "hzr_floor") && (this.getDirection(rightBlock) == this.getInvertedDirection(direction) || this.getDirection(rightBlock) == this.getInvertedDirection(this.getOppositeDirection(direction)))))
|| (leftBlock && this.isModule(leftBlock, "hzr_floor") && (this.getDirection(leftBlock) == this.getInvertedDirection(direction) || this.getDirection(leftBlock) == this.getInvertedDirection(this.getOppositeDirection(direction))))
&& ((frontBlock && this.isModule(frontBlock, "hzr_floor") && (this.getDirection(frontBlock) == this.getOppositeDirection(direction) || this.getDirection(frontBlock) == direction))
|| (backBlock && this.isModule(backBlock, "hzr_floor") && (this.getDirection(backBlock) == this.getOppositeDirection(direction) || this.getDirection(backBlock) == direction)))
)) {
return { module: "hzr_cross", direction: direction, verticalHalf: verticalHalf }
} else {
return { module: module, direction: direction, verticalHalf: verticalHalf }
}
} else if (module == "hzr_wall" && backBlock && this.getModule(backBlock) == "hzr_wall") {
if (verticalHalf == "top") {
if (this.getOppositeDirection(direction) == this.getInvertedDirection(this.getDirection(backBlock)))
return { module: "hzr_wall_corner", direction: this.getInvertedDirection(direction), verticalHalf: verticalHalf }
else
return { module: "hzr_wall_corner", direction: direction, verticalHalf: verticalHalf }
} else {
if (this.getOppositeDirection(direction) == this.getInvertedDirection(this.getDirection(backBlock)))
return { module: "hzr_wall_corner", direction: this.getInvertedDirection(this.getInvertedDirection(this.getOppositeDirection(direction))), verticalHalf: verticalHalf }
else
return { module: "hzr_wall_corner", direction: this.getInvertedDirection(this.getOppositeDirection(direction)), verticalHalf: verticalHalf }
}
} else if (this.isModule(block, "hzr_floor", "vrt_wall") && backBlock && this.isModule(backBlock, "hzr_floor", "wall_corner", "wall_corner_3") && ((upBlock && this.isModule(upBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t")) || (downBlock && this.isModule(downBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t")))) {
if ((upBlock && this.isModule(upBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t")) && (downBlock && this.isModule(downBlock, "vrt_wall", "wall_corner", "wall_corner_3", "wall_corner_t"))) {
return { module: "wall_corner", direction: direction, verticalHalf: this.getVerticalPosition(backBlock) }
} else if (upBlock && this.isModule(upBlock, "vrt_wall")) {
return { module: "wall_corner", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "wall_corner", direction: direction, verticalHalf: "top" }
}
}
else if (module == "border_vrt" && ((leftBlock && this.isModule(leftBlock, 'hzr_wall', 'hzr_wall_corner', 'wall_corner_3', 'wall_corner_t')) || (backBlock && this.isModule(backBlock, 'hzr_wall', 'hzr_wall_corner', 'wall_corner_3', 'wall_corner_t')))) {
if (leftBlock && this.isModule(leftBlock, 'hzr_wall', 'hzr_wall_corner', 'wall_corner_3', 'wall_corner_t')) {
return { module: "border_corner", direction: this.getVerticalPosition(leftBlock) == "top" ? this.getInvertedDirection(direction) : direction, verticalHalf: this.getVerticalPosition(leftBlock) }
} else if (backBlock && this.isModule(backBlock, 'hzr_wall', 'hzr_wall_corner', 'wall_corner_3', 'wall_corner_t')) {
return { module: "border_corner", direction: this.getVerticalPosition(backBlock) == "top" ? this.getInvertedDirection(direction) : direction, verticalHalf: this.getVerticalPosition(backBlock) }
}
}
else if (module == "hzr_wall_corner" && ((upBlock && verticalHalf == "bottom") || (downBlock && verticalHalf == "top"))) {
if (upBlock && verticalHalf == "bottom") {
return { module: "border_corner", direction: direction, verticalHalf: "bottom" }
} else if (downBlock && verticalHalf == "top") {
return { module: "border_corner", direction: direction, verticalHalf: "top" }
}
}
else {
return { module: module, direction: direction, verticalHalf: verticalHalf }
}
}
}