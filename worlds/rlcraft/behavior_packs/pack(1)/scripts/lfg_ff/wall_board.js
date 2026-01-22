/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation, MolangVariableMap } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class WallBoardComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.boardId = "lfg_ff:wall_board"
this.MaxPaintedBlocksOnce = 300
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 8 ? 1 : variant + 1
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
this.updateAllboard(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const newModuleAndDir = this.getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, direction, this.getVerticalPosition(block), block);
e.permutationToPlace = permutationToPlace
.withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
.withState('lfg_ff:module', newModuleAndDir.module)
.withState('minecraft:vertical_half', newModuleAndDir.verticalHalf)
.withState('minecraft:cardinal_direction', newModuleAndDir.direction)
system.runTimeout(() => {
this.updateAllboard(block, direction)
}, 1)
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down"];
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
getNeighborBlock(block, direction, side, filterboard) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterboard)
return neighborBlock.typeId == this.boardId ? neighborBlock : null;
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
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
let downBlock = this.getNeighborBlock(block, direction, "down", true);
let upBlock = this.getNeighborBlock(block, direction, "up", true);
const allboards = [];
if (leftBlock && (this.getDirection(leftBlock) == direction)) allboards.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction)) allboards.push(rightBlock)
if (upBlock && (this.getDirection(upBlock) == direction)) allboards.push(upBlock)
if (downBlock && (this.getDirection(downBlock) == direction)) allboards.push(downBlock)
for (const expendedboard of allboards) {
const expendedVariant = this.getVariant(expendedboard);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedboard);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedboard.setPermutation(expendedboard.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedboard, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
updateAllboard(block, direction, updatedboardBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedboardBlocks.has(blockLocationKey)) {
return;
}
updatedboardBlocks.add(blockLocationKey);
const leftBlock = this.getNeighborBlock(block, direction, "left", true);
const rightBlock = this.getNeighborBlock(block, direction, "right", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const allboards = [];
if (downBlock) allboards.push(downBlock)
if (upBlock) allboards.push(upBlock)
if (rightBlock) allboards.push(rightBlock)
if (leftBlock) allboards.push(leftBlock)
for (const expendedboard of allboards) {
const expDir = this.getDirection(expendedboard);
const expVerticalHalf = this.getDirection(expendedboard);
const expendedleftBlock = this.getNeighborBlock(expendedboard, expDir, "left", true);
const expendedrightBlock = this.getNeighborBlock(expendedboard, expDir, "right", true);
const expendeddownBlock = this.getNeighborBlock(expendedboard, expDir, "down", true);
const expendedupBlock = this.getNeighborBlock(expendedboard, expDir, "up", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedleftBlock, expendedrightBlock, expendedupBlock, expendeddownBlock, expDir, expVerticalHalf, expendedboard);
expendedboard.setPermutation(expendedboard.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction)
.withState('minecraft:vertical_half', expNewModuleAndDir.verticalHalf));
system.runTimeout(() => {
try {
if (updatedboardBlocks.size <= 4)
this.updateAllboard(expendedboard, expNewModuleAndDir.direction, updatedboardBlocks);
} catch (e) {
}
}, 1);
}
}
getUpdatedModuleAndDirection(leftBlock, rightBlock, upBlock, downBlock, direction, verticalHalf, block) {
const boards = []
const allBlocks = [leftBlock, rightBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
boards.push(b)
})
if (!boards.includes(leftBlock) || (this.getDirection(leftBlock) !== direction)) leftBlock = null
if (!boards.includes(rightBlock) || (this.getDirection(rightBlock) !== direction)) rightBlock = null
if (!boards.includes(upBlock) || (this.getDirection(upBlock) !== direction)) upBlock = null
if (!boards.includes(downBlock) || (this.getDirection(downBlock) !== direction)) downBlock = null
if (!upBlock && !downBlock && !rightBlock && !leftBlock) return { module: "normal", direction: direction, verticalHalf: "bottom" }
if (upBlock && downBlock && rightBlock && leftBlock) {
return { module: "center", direction: direction, verticalHalf: "bottom" }
} else if (rightBlock && leftBlock && (upBlock || downBlock)) {
if (upBlock) {
return { module: "edge_up", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "edge_up", direction: direction, verticalHalf: "top" }
}
} else if (upBlock && downBlock && (rightBlock || leftBlock)) {
if (rightBlock) {
return { module: "edge_side", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "edge_side_rev", direction: direction, verticalHalf: "bottom" }
}
} else if (rightBlock && leftBlock) {
return { module: "edge_2_up", direction: direction, verticalHalf: "bottom" }
} else if (upBlock && downBlock) {
return { module: "edge_2_side", direction: direction, verticalHalf: "bottom" }
} else if ((upBlock || downBlock) && (rightBlock || leftBlock)) {
if (upBlock) {
if (rightBlock)
return { module: "corner", direction: direction, verticalHalf: "bottom" }
else
return { module: "corner_rev", direction: direction, verticalHalf: "bottom" }
} else {
if (rightBlock)
return { module: "corner_rev", direction: direction, verticalHalf: "top" }
else
return { module: "corner", direction: direction, verticalHalf: "top" }
}
} else {
if (rightBlock || leftBlock) {
if (rightBlock) {
return { module: "corner_2_side", direction: direction, verticalHalf: "bottom" }
} else {
return { module: "corner_2_side_rev", direction: direction, verticalHalf: "bottom" }
}
} else {
if (upBlock) {
return { module: "corner_2_up", direction: direction, verticalHalf: "top" }
} else {
return { module: "corner_2_up", direction: direction, verticalHalf: "bottom" }
}
}
}
}
}
export class LetterTileComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.boardId = "lfg_ff:letter_tile"
this.MaxPaintedBlocksOnce = 250
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (!handItem) return
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 3 ? 1 : variant + 1
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
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
e.cancel = true
return;
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["left", "right", "up", "down"];
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
getNeighborBlock(block, direction, side, filterboard) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
if (filterboard)
return neighborBlock.typeId == this.boardId ? neighborBlock : null;
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
isNonSolidBlock(block) {
return block.isAir || ((block.typeId.includes("lava") || block.typeId.includes("water")) && block.typeId.startsWith("minecraft:"));
}
expendPaint(block, direction, newVariant, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
let leftBlock = this.getNeighborBlock(block, direction, "left", true);
let rightBlock = this.getNeighborBlock(block, direction, "right", true);
const allboards = [];
if (leftBlock && (this.getDirection(leftBlock) == direction)) allboards.push(leftBlock)
if (rightBlock && (this.getDirection(rightBlock) == direction)) allboards.push(rightBlock)
for (const expendedboard of allboards) {
const expendedVariant = this.getVariant(expendedboard);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
const expDir = this.getDirection(expendedboard);
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedboard.setPermutation(expendedboard.permutation.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedboard, expDir, newVariant, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
}
const boardComp = new WallBoardComponent()
const letterComp = new LetterTileComponent()
const letterFaceSize = 0.33
const wallBoardDepth = 0.25
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, faceLocation, itemStack, player } = e
if (!e.isFirstEvent) return;
if (!itemStack || itemStack.typeId !== "lfg_ff:letter_tile") return;
if (!block || block.typeId !== "lfg_ff:wall_board") return;
const dir = block.permutation.getState("minecraft:cardinal_direction")
if (boardComp.getOppositeDirection(dir) !== blockFace.toLocaleLowerCase()) return;
const letterBlock = boardComp.getBlockInDirection(block, boardComp.getOppositeDirection(dir))
if (!letterComp.isNonSolidBlock(letterBlock)) return;
const placementVar = letterComp.getPlacementVariant(block, dir)
system.run(() => {
letterBlock.setPermutation(BlockPermutation.resolve("lfg_ff:letter_tile").withState("minecraft:cardinal_direction", dir).withState("lfg_ff:variant", placementVar))
block.dimension.playSound("dig.candle", block.location)
player.runCommand(`clear @s lfg_ff:letter_tile 0 1`)
})
})
const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const NUMBERS = Array.from({ length: 10 }, (_, i) => String(i));
const SYMBOLS = Array.from({ length: 12 }, (_, i) => `s${i + 1}`);
const OFFSETS = {
Letters: 0,
Numbers: 26,
Symbols: 36
};
function getTilesForCategory(cat) {
if (cat === "Letters") return LETTERS;
if (cat === "Numbers") return NUMBERS;
if (cat === "Symbols") return SYMBOLS;
return [];
}
function tileSelection(player, block) {
player.dimension.playSound("random.click", player.location);
const variant = block.permutation.getState("lfg_ff:variant");
const main = new ActionFormData()
.title("Letter Tile Selection")
.body("Choose a category:")
.button("§lLetters", `textures/lfg_ff/lfg_ff/icons/letter_tiles/font_${variant}/a`)
.button("§lNumbers", `textures/lfg_ff/lfg_ff/icons/letter_tiles/font_${variant}/1`)
.button("§lSymbols", `textures/lfg_ff/lfg_ff/icons/letter_tiles/font_${variant}/s1`);
main.show(player).then(resp => {
if (resp.canceled) return;
const choice = resp.selection;
const category = choice === 0 ? "Letters" : choice === 1 ? "Numbers" : "Symbols";
showCategoryMenu(player, block, category);
});
}
function showCategoryMenu(player, block, category) {
const tiles = getTilesForCategory(category);
const offset = OFFSETS[category] || 0;
const currentTileIndex = getLetterTileIndex(block);
const variant = block.permutation.getState("lfg_ff:variant");
const form = new ActionFormData()
.title(`Tiles - ${category}`)
.body("Select a tile:");
tiles.forEach((t, idx) => {
const globalIndex = offset + idx + 1;
const selectedMark = (globalIndex === currentTileIndex) ? "§l§2Selected" : "";
form.button(
selectedMark,
`textures/lfg_ff/lfg_ff/icons/letter_tiles/font_${variant}/${t}`
);
});
form.show(player).then(resp => {
if (resp.canceled) return;
const newGlobalIndex = offset + resp.selection + 1;
setLetterTileIndex(block, newGlobalIndex);
});
}
function getLetterTileIndex(block) {
const page = block.permutation.getState("lfg_ff:letter_page");
const index = block.permutation.getState("lfg_ff:letter_index");
if (page == null || index == null) return null;
return (page - 1) * 16 + index;
}
function setLetterTileIndex(block, globalIndex) {
if (globalIndex < 1 || globalIndex > 48) {
throw new Error("Index out of range.");
}
const page = Math.floor((globalIndex - 1) / 16) + 1;
const index = ((globalIndex - 1) % 16) + 1;
block.setPermutation(
block.permutation
.withState("lfg_ff:letter_page", page)
.withState("lfg_ff:letter_index", index)
);
}
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!isFirstEvent) return;
const itemList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small",
]
const blockList = [
"lfg_ff:wall_board",
"lfg_ff:letter_tile"
]
if (!blockList.includes(block.typeId)) return;
const getBlockComponent = {
"lfg_ff:wall_board": boardComp,
"lfg_ff:letter_tile": letterComp,
}
let blockComponent = getBlockComponent[block.typeId] ?? null
if (!blockComponent) return;
const dir = block.permutation.getState("minecraft:cardinal_direction")
const letterBlock = boardComp.getBlockInDirection(block, boardComp.getOppositeDirection(dir))
const letterDir = letterBlock.permutation.getState("minecraft:cardinal_direction")
let isOnLetterTile = letterBlock.typeId == "lfg_ff:letter_tile" && dir == letterDir
&& ((Math.abs(faceLocation.x - 0.5) < letterFaceSize && ["south", "north"].includes(dir)) || (Math.abs(faceLocation.z - 0.5) < letterFaceSize && ["east", "west"].includes(dir)))
&& Math.abs(faceLocation.y - 0.5) < letterFaceSize
if (boardComp.getOppositeDirection(dir) !== blockFace.toLocaleLowerCase() && isOnLetterTile) return;
if (!itemList.includes(itemStack?.typeId)) {
if (isOnLetterTile) {
system.run(() => {
tileSelection(player, letterBlock)
})
}
return;
}
if (itemStack.typeId == "lfg_ff:variant_picker") {
system.runTimeout(() => {
handleVariantPicker(isOnLetterTile ? letterBlock : block, player)
}, 1)
return;
}
if (isOnLetterTile) {
blockComponent = getBlockComponent[letterBlock.typeId] ?? null
}
if (!blockComponent) return;
if (itemStack.typeId == "lfg_ff:color_brush") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:vs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${isOnLetterTile ? letterBlock.typeId : block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: isOnLetterTile ? letterBlock : block, player, smallBrush: false, variantPicker: pickerVariant })
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:tvs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${isOnLetterTile ? letterBlock.typeId : block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: isOnLetterTile ? letterBlock : block, player, smallBrush: true, variantPicker: pickerVariant })
}, 1)
return;
}
})
function handleVariantPicker(block, player) {
let variant = block.permutation.getState("lfg_ff:variant") ?? null
if (!variant) return;
player.setDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`, variant)
player.runCommand(`tellraw @s { "rawtext": [ { "text" : "§9Picked variant §3${variant}§9 for §3" }, { "translate" : "tile.${block.typeId}.name" } ] }`)
player.dimension.playSound("random.pop", block.location, { pitch: 1.5 })
}
world.beforeEvents.playerBreakBlock.subscribe((e) => {
const { block, dimension, player } = e
if (block.typeId == "lfg_ff:wall_board") {
const dir = block.permutation.getState("minecraft:cardinal_direction")
const letterBlock = boardComp.getBlockInDirection(block, boardComp.getOppositeDirection(dir))
if (!letterBlock || letterBlock.typeId !== "lfg_ff:letter_tile") return;
const letterDir = letterBlock.permutation.getState("minecraft:cardinal_direction")
if (dir !== letterDir) return;
if (player.hasTag("lfg_ff:letter_tile_overlay")) {
e.cancel = true
}
const isCreative = player.getGameMode() == "Creative"
system.runTimeout(() => {
if (isCreative) {
block.dimension.playSound("dig.candle", block.location)
if (letterBlock.isWaterlogged)
block.dimension.runCommand(`setblock ${letterBlock.location.x} ${letterBlock.location.y} ${letterBlock.location.z} minecraft:water replace`);
else
block.dimension.runCommand(`setblock ${letterBlock.location.x} ${letterBlock.location.y} ${letterBlock.location.z} minecraft:air replace`);
} else {
if (letterBlock.isWaterlogged)
block.dimension.runCommand(`setblock ${letterBlock.location.x} ${letterBlock.location.y} ${letterBlock.location.z} minecraft:water destroy`);
else
block.dimension.runCommand(`setblock ${letterBlock.location.x} ${letterBlock.location.y} ${letterBlock.location.z} minecraft:air destroy`);
}
}, 1)
}
})
system.runInterval(() => {
for (const player of world.getAllPlayers()) {
const ray = getRaycastedBlockInfo(player);
if (!ray) {
player.removeTag("lfg_ff:letter_tile_overlay")
continue;
}
const block = ray.block;
if (!block || block.typeId !== "lfg_ff:wall_board") {
player.removeTag("lfg_ff:letter_tile_overlay")
continue;
}
const face = ray.face;
const faceLocation = ray.faceLocation
const dir = block.permutation.getState("minecraft:cardinal_direction")
if (boardComp.getOppositeDirection(dir) !== face.toLocaleLowerCase()) {
player.removeTag("lfg_ff:letter_tile_overlay")
continue;
}
const letterBlock = boardComp.getBlockInDirection(block, boardComp.getOppositeDirection(dir))
if (letterBlock.typeId !== "lfg_ff:letter_tile") {
player.removeTag("lfg_ff:letter_tile_overlay")
continue;
}
const letterDir = letterBlock.permutation.getState("minecraft:cardinal_direction")
if (dir !== letterDir) {
player.removeTag("lfg_ff:letter_tile_overlay")
continue;
}
const { min, max } = getLetterDetectionBox(dir, letterFaceSize);
const inside = (
faceLocation.x >= min.x && faceLocation.x <= max.x &&
faceLocation.y >= min.y && faceLocation.y <= max.y &&
faceLocation.z >= min.z && faceLocation.z <= max.z
);
if (!inside) {
player.removeTag("lfg_ff:letter_tile_overlay")
continue;
}
player.addTag("lfg_ff:letter_tile_overlay")
spawnSelectionBoxParticle(Vector.add(min, block.location), Vector.add(max, block.location), player.dimension, 1 / 5, "white")
}
}, 1);
function getRaycastedBlockInfo(player) {
return player.getBlockFromViewDirection({
includeTypes: ["lfg_ff:wall_board"],
maxDistance: 8,
includeLiquidBlocks: false,
includePassableBlocks: true
});
}
function getLetterDetectionBox(dir, letterFaceSize) {
const minY = 0.5 - letterFaceSize;
const maxY = 0.5 + letterFaceSize;
if (dir === "north" || dir === "south") {
const minX = 0.5 - letterFaceSize;
const maxX = 0.5 + letterFaceSize;
const z = (dir === "north") ? wallBoardDepth : (1 - wallBoardDepth);
return {
min: { x: minX, y: minY, z: z - 0.01 },
max: { x: maxX, y: maxY, z: z + 0.01 }
};
}
if (dir === "east" || dir === "west") {
const minZ = 0.5 - letterFaceSize;
const maxZ = 0.5 + letterFaceSize;
const x = (dir === "west") ? wallBoardDepth : (1 - wallBoardDepth);
return {
min: { x: x - 0.01, y: minY, z: minZ },
max: { x: x + 0.01, y: maxY, z: maxZ }
};
}
return null;
}
function spawnSelectionBoxParticle(pos1, pos2, dimension, duration, color) {
const minX = Math.min(pos1.x, pos2.x);
const maxX = Math.max(pos1.x, pos2.x);
const minY = Math.min(pos1.y, pos2.y);
const maxY = Math.max(pos1.y, pos2.y);
const minZ = Math.min(pos1.z, pos2.z);
const maxZ = Math.max(pos1.z, pos2.z);
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
const centerZ = (minZ + maxZ) / 2;
const sizeX = (maxX - minX) / 2;
const sizeY = (maxY - minY) / 2;
const sizeZ = (maxZ - minZ) / 2;
const colors = {
red: { red: 0.8, green: 0, blue: 0 },
green: { red: 0, green: 0.8, blue: 0 },
blue: { red: 0, green: 0, blue: 0.8 },
white: { red: 1, green: 1, blue: 1 },
purple: { red: 0.75, green: 0, blue: 0.75 },
yellow: { red: 1, green: 1, blue: 0 },
cyan: { red: 0, green: 1, blue: 1 },
orange: { red: 1, green: 0.5, blue: 0 },
};
const rgbColor = colors[color] || color;
const faceConfigs = [
{ x: 0, y: -sizeY, z: 0, size1: sizeX, size2: sizeZ, id: "lfg_ff:letter_tile_overlay_horizontal" },
{ x: 0, y: sizeY, z: 0, size1: sizeX, size2: sizeZ, id: "lfg_ff:letter_tile_overlay_horizontal" },
];
if (sizeX > sizeZ) {
faceConfigs.push({ x: sizeX, y: 0, z: 0, size1: sizeY, size2: sizeZ, id: "lfg_ff:letter_tile_overlay_vertical_z" })
faceConfigs.push({ x: -sizeX, y: 0, z: 0, size1: sizeY, size2: sizeZ, id: "lfg_ff:letter_tile_overlay_vertical_z" })
faceConfigs.push({ x: 0, y: 0, z: 0, size1: sizeY, size2: letterFaceSize, id: "lfg_ff:letter_tile_area_vertical_x" })
} else {
faceConfigs.push({ x: 0, y: 0, z: sizeZ, size1: sizeY, size2: sizeX, id: "lfg_ff:letter_tile_overlay_vertical_x" })
faceConfigs.push({ x: 0, y: 0, z: -sizeZ, size1: sizeY, size2: sizeX, id: "lfg_ff:letter_tile_overlay_vertical_x" })
faceConfigs.push({ x: 0, y: 0, z: 0, size1: sizeY, size2: letterFaceSize, id: "lfg_ff:letter_tile_area_vertical_z" })
}
for (const face of faceConfigs) {
const faceLocation = {
x: centerX + face.x,
y: centerY + face.y,
z: centerZ + face.z
};
const mvm = new MolangVariableMap();
mvm.setFloat(`variable.duration`, face.id.includes("area") ? duration : duration);
mvm.setColorRGB("variable.color", rgbColor);
if (face.id.includes("horizontal")) {
mvm.setFloat(`variable.size_1`, face.size1);
mvm.setFloat(`variable.size_2`, face.size2);
} else {
mvm.setFloat(`variable.size_1`, face.size2);
mvm.setFloat(`variable.size_2`, face.size1);
}
try {
dimension.spawnParticle(face.id, faceLocation, mvm);
} catch {
}
}
}