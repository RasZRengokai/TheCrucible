/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
export class ClearGlassPaneComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.clearGlassPaneId = "lfg_ff:clear_glass_pane"
this.MaxPaintedBlocksOnce = 1000
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
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const module = block.permutation.getState("lfg_ff:module");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 15 ? 1 : variant + 1
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
onPlayerBreak(e) {
const block = e.block;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllclearGlassPane(block, direction)
}, 1)
system.run(() => {
if (brokenBlockPermutation.getState("lfg_ff:variant") >= 13)
block.dimension.playSound("break.iron", block.location)
})
}
isNonSolidBlock(block) {
return block.isAir || ((block.typeId.includes("lava") || block.typeId.includes("water")) && block.typeId.startsWith("minecraft:"));
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
system.runTimeout(() => {
this.updateAllclearGlassPane(block, direction)
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
getNeighborBlock(block, direction, side, filterclearGlassPane) {
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
if (filterclearGlassPane)
return (
neighborBlock.typeId == this.clearGlassPaneId
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
const upBlock = block.above()
const downBlock = block.below()
const allclearGlassPanes = [];
if (frontBlock && block.typeId == this.clearGlassPaneId) allclearGlassPanes.push(frontBlock)
if (backBlock && block.typeId == this.clearGlassPaneId) allclearGlassPanes.push(backBlock)
if (rightBlock) allclearGlassPanes.push(rightBlock)
if (leftBlock) allclearGlassPanes.push(leftBlock)
if (upBlock && upBlock.typeId == this.clearGlassPaneId && block.typeId == this.clearGlassPaneId) allclearGlassPanes.push(upBlock)
if (downBlock && downBlock.typeId == this.clearGlassPaneId && block.typeId == this.clearGlassPaneId) allclearGlassPanes.push(downBlock)
for (const expendedclearGlassPane of allclearGlassPanes) {
const expendedVariant = this.getVariant(expendedclearGlassPane);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedclearGlassPane);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedclearGlassPane.setPermutation(expendedclearGlassPane.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedclearGlassPane, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllclearGlassPane(block, direction, updatedclearGlassPaneBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedclearGlassPaneBlocks.has(blockLocationKey)) {
return;
}
updatedclearGlassPaneBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allclearGlassPanes = [];
if (frontBlock) allclearGlassPanes.push(frontBlock)
if (backBlock) allclearGlassPanes.push(backBlock)
if (rightBlock) allclearGlassPanes.push(rightBlock)
if (leftBlock) allclearGlassPanes.push(leftBlock)
if (block && block.typeId == this.clearGlassPaneId) allclearGlassPanes.push(block)
for (const expendedclearGlassPane of allclearGlassPanes) {
const expDir = this.getDirection(expendedclearGlassPane);
const expendedleftBlock = this.getNeighborBlock(expendedclearGlassPane, expDir, "left", false);
const expendedrightBlock = this.getNeighborBlock(expendedclearGlassPane, expDir, "right", false);
const expendedfrontBlock = this.getNeighborBlock(expendedclearGlassPane, expDir, "front", false);
const expendedbackBlock = this.getNeighborBlock(expendedclearGlassPane, expDir, "back", false);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedfrontBlock, expendedbackBlock, expDir, expendedclearGlassPane);
expendedclearGlassPane.setPermutation(expendedclearGlassPane.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
system.runTimeout(() => {
try {
if (updatedclearGlassPaneBlocks.size <= 4)
this.updateAllclearGlassPane(expendedclearGlassPane, expNewModuleAndDir.direction, updatedclearGlassPaneBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, frontBlock, backBlock, direction, block) {
const clearGlassPanes = []
const allBlocks = [leftBlock, rightBlock, frontBlock, backBlock]
allBlocks.forEach((b) => {
if (!b) return;
if (b.isAir || this.isNoPhysicBlock(b, block)) return;
clearGlassPanes.push(b)
})
if (!clearGlassPanes.includes(leftBlock)) leftBlock = null
if (!clearGlassPanes.includes(rightBlock)) rightBlock = null
if (!clearGlassPanes.includes(frontBlock)) frontBlock = null
if (!clearGlassPanes.includes(backBlock)) backBlock = null
if (!frontBlock && !backBlock && !rightBlock && !leftBlock) return { module: "c0", direction: direction }
if (frontBlock && backBlock && rightBlock && leftBlock) {
return { module: "c4", direction: direction }
} else if (rightBlock && leftBlock && (frontBlock || backBlock)) {
if (frontBlock) {
let dir = this.getDirectionFromBlocks(block, frontBlock)
return { module: "c3", direction: dir }
} else {
let dir = this.getDirectionFromBlocks(block, backBlock)
return { module: "c3", direction: dir }
}
} else if (frontBlock && backBlock && (rightBlock || leftBlock)) {
if (rightBlock) {
let dir = this.getDirectionFromBlocks(block, rightBlock)
return { module: "c3", direction: dir }
} else {
let dir = this.getDirectionFromBlocks(block, leftBlock)
return { module: "c3", direction: dir }
}
} else if (rightBlock && leftBlock) {
let dir = this.getDirectionFromBlocks(rightBlock, leftBlock)
return { module: "c2s", direction: dir }
} else if (frontBlock && backBlock) {
let dir = this.getDirectionFromBlocks(backBlock, frontBlock)
return { module: "c2s", direction: dir }
} else if ((frontBlock || backBlock) && (rightBlock || leftBlock)) {
if (frontBlock) {
let dir = this.getDirectionFromBlocks(block, frontBlock)
if (rightBlock) {
return { module: "c2", direction: this.getInvertedDirection(dir) }
}
else {
return { module: "c2", direction: dir }
}
} else {
let dir = this.getDirectionFromBlocks(block, backBlock)
if (rightBlock) {
return { module: "c2", direction: dir }
}
else {
return { module: "c2", direction: this.getInvertedDirection(dir) }
}
}
} else {
let dir = this.getDirectionFromBlocks(clearGlassPanes[0], block)
return { module: "c1", direction: this.getOppositeDirection(dir) }
}
}
isNoPhysicBlock(block, clearGlassPaneToConnect = false) {
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
}
const clearGlassPaneComp = new ClearGlassPaneComponent()
world.afterEvents.playerPlaceBlock.subscribe((e) => {
const { block, dimension, player } = e
const nghBlocks = [block.below(), block.above(), block.north(), block.south(), block.east(), block.west()]
nghBlocks.some(nghblock => {
if (!nghblock) return false;
if (nghblock.typeId == "lfg_ff:clear_glass_pane") {
clearGlassPaneComp.updateAllclearGlassPane(nghblock, clearGlassPaneComp.getDirection(nghblock))
return true;
};
return false;
})
})
world.afterEvents.playerBreakBlock.subscribe((e) => {
const { block, dimension, player } = e
const nghBlocks = [block.below(), block.above(), block.north(), block.south(), block.east(), block.west()]
nghBlocks.some(nghblock => {
if (!nghblock) return false;
if (nghblock.typeId == "lfg_ff:clear_glass_pane") {
clearGlassPaneComp.updateAllclearGlassPane(nghblock, clearGlassPaneComp.getDirection(nghblock))
return true;
};
return false;
})
})