/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world } from "@minecraft/server";
import { Vector } from './vector.js';
export class SplitWallComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.wallId = "lfg_ff:split_wall";
this.MaxPaintedBlocksOnce = 2500;
this.LEFT_OF = { north: "west", west: "south", south: "east", east: "north" };
this.RIGHT_OF = { north: "east", east: "south", south: "west", west: "north" };
this.OPPOSITE = { north: "south", south: "north", east: "west", west: "east", up: "down", down: "up" };
this.INVERTED = { north: "east", east: "south", south: "west", west: "north" };
this.OFFSET_OF = {
north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 }
};
}
getState(block, s) { return block?.permutation.getState(s); }
setStates(block, patch) {
let perm = block.permutation;
for (const [k, v] of Object.entries(patch)) perm = perm.withState(k, v);
block.setPermutation(perm);
}
getNeighbor(block, dir, filterwall = true) {
const off = this.OFFSET_OF[dir];
if (!off) return null;
const nb = block.dimension.getBlock({
x: block.location.x + off.x,
y: block.location.y,
z: block.location.z + off.z
});
return (!nb || (filterwall && nb.typeId !== this.wallId)) ? null : nb;
}
areSamePos(a, b) {
return a && b &&
a.location.x === b.location.x &&
a.location.y === b.location.y &&
a.location.z === b.location.z;
}
getPlacementVariants(block, d, m) {
const L = this.getNeighborByModule(block, d, m, "left");
const R = this.getNeighborByModule(block, d, m, "right");
const F = this.getNeighborByModule(block, d, m, "front");
const B = this.getNeighborByModule(block, d, m, "back");
const U = this.iswall(block.above()) ? block.above?.() : null;
const D = this.iswall(block.below()) ? block.below?.() : null;
const candidates = [L, R, F, B, U, D].filter(Boolean);
const count = new Map();
for (const nb of candidates) {
if (!nb) continue
const v = { ext: this.getState(nb, "lfg_ff:variant_ext"), int: this.getState(nb, "lfg_ff:variant_int") };
if (v.ext !== undefined && v.int !== undefined) count.set(v, (count.get(v) || 0) + 1);
}
let best = { ext: 1, int: 1 }, max = 0;
for (const [v, c] of count) if (c > max) { max = c; best = v; }
return best;
}
getDirectionForInnerCorner(dir, backDir, backBlock) {
const backMod = this.getState(backBlock, "lfg_ff:module");
if (dir === "north") {
return (backMod.includes("inner_corner")) ? (backDir === "south" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "east" ? backDir : dir);
}
if (dir === "west") {
return (backMod.includes("inner_corner")) ? (backDir === "east" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "south" ? dir : backDir);
}
if (dir === "south") {
return (backMod.includes("inner_corner")) ? (backDir === "north" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "east" ? dir : backDir);
}
return (backMod.includes("inner_corner")) ? (backDir === "west" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "south" ? backDir : dir);
}
getDirectionForOuterCorner(dir, frontDir, frontBlock) {
const fMod = this.getState(frontBlock, "lfg_ff:module");
if (dir === "north") {
return (fMod.includes("outer_corner")) ? (frontDir === "south" ? this.INVERTED[frontDir] : dir)
: (frontDir === "west" ? frontDir : dir);
}
if (dir === "west") {
return (fMod.includes("outer_corner")) ? (frontDir === "east" ? this.INVERTED[frontDir] : dir)
: (frontDir === "north" ? dir : frontDir);
}
if (dir === "south") {
return (fMod.includes("outer_corner")) ? (frontDir === "north" ? this.INVERTED[frontDir] : dir)
: (frontDir === "west" ? dir : frontDir);
}
return (fMod.includes("outer_corner")) ? (frontDir === "west" ? this.INVERTED[frontDir] : dir)
: (frontDir === "north" ? frontDir : dir);
}
updateNeighborBlock(nb, placedModule, placedDir, placedBlock, up, down) {
const nMod = this.getState(nb, "lfg_ff:module");
const nDir = this.getState(nb, "minecraft:cardinal_direction");
const isBot = !down
if (!nMod.includes("normal")) return;
const left = this.getNeighbor(nb, this.LEFT_OF[nDir]);
const right = this.getNeighbor(nb, this.RIGHT_OF[nDir]);
if (left && right &&
this.getState(left, "minecraft:cardinal_direction") === nDir &&
this.getState(right, "minecraft:cardinal_direction") === nDir) return;
const fwd = this.getNeighbor(nb, nDir, false);
const back = this.getNeighbor(nb, this.OPPOSITE[nDir], false);
let finalModule = nMod;
let finalDir = nDir;
if (fwd && this.areSamePos(fwd, placedBlock)) {
const check = this.getNeighbor(nb, this.OPPOSITE[placedDir], false);
const notAlreadyConnectedToCorner = (this.getState(right, "lfg_ff:module") !== "outer_corner" && this.getState(right, "lfg_ff:module") !== "inner_corner") || !this.iswall(left)
if (!(check?.typeId === this.wallId && this.getState(check, "minecraft:cardinal_direction") === nDir) && notAlreadyConnectedToCorner) {
finalModule = isBot ? "outer_corner_bot" : "outer_corner_mid";
finalDir = this.getDirectionForOuterCorner(placedDir, nDir, nb);
}
} else if (back && this.areSamePos(back, placedBlock)) {
const check = this.getNeighbor(nb, placedDir, false);
const notAlreadyConnectedToCorner = (this.getState(right, "lfg_ff:module") !== "outer_corner" && this.getState(right, "lfg_ff:module") !== "inner_corner") || !this.iswall(left)
if (!(check?.typeId === this.wallId && this.getState(check, "minecraft:cardinal_direction") === nDir) && notAlreadyConnectedToCorner) {
finalModule = isBot ? "inner_corner_bot" : "inner_corner_mid";
finalDir = this.getDirectionForInnerCorner(placedDir, nDir, nb);
}
}
if (finalModule !== nMod || finalDir !== nDir) {
this.setStates(nb, { "lfg_ff:module": finalModule, "minecraft:cardinal_direction": finalDir });
}
}
iswall(b) { return !!b && b.typeId === this.wallId; }
isFilled(b) { return !!b && (b.typeId === this.wallId || ["lfg_ff:clear_glass", "lfg_ff:clear_glass_pane", "lfg_ff:window_frame"].includes(b.typeId)); }
sameDir(b1, b2) {
if (this.isModule(b1, ["outer_corner_bot", "outer_corner_mid"])) {
if (this.RIGHT_OF[this.getState(b1, "minecraft:cardinal_direction")] === this.getState(b2, "minecraft:cardinal_direction")) return true;
}
if (this.isModule(b2, ["outer_corner_bot", "outer_corner_mid"])) {
if (this.RIGHT_OF[this.getState(b2, "minecraft:cardinal_direction")] === this.getState(b1, "minecraft:cardinal_direction")) return true;
}
if (this.isModule(b1, ["inner_corner_bot", "inner_corner_mid"])) {
if (this.LEFT_OF[this.getState(b1, "minecraft:cardinal_direction")] === this.getState(b2, "minecraft:cardinal_direction")) return true;
}
if (this.isModule(b2, ["inner_corner_bot", "inner_corner_mid"])) {
if (this.LEFT_OF[this.getState(b2, "minecraft:cardinal_direction")] === this.getState(b1, "minecraft:cardinal_direction")) return true;
}
return this.getState(b1, "minecraft:cardinal_direction") === this.getState(b2, "minecraft:cardinal_direction");
}
isModule(b, moduleList = []) {
return moduleList.includes(this.getState(b, "lfg_ff:module"));
}
onPlayerBreak(e) {
const b = e.block;
const dim = e.block.dimension;
const loc = e.block.location;
const module = e.brokenBlockPermutation.getState("lfg_ff:module");
const dir = e.brokenBlockPermutation.getState("minecraft:cardinal_direction");
const left = this.getNeighbor(b, this.LEFT_OF[dir]);
const right = this.getNeighbor(b, this.RIGHT_OF[dir]);
const up = this.isFilled(b.above()) ? b.above() : null
const down = this.isFilled(b.below()) ? b.below() : null
if (module === "normal_bot" || module === "normal_mid") {
system.run(() => {
if (left && this.isModule(left, ["inner_corner_bot", "outer_corner_bot", "inner_corner_mid", "outer_corner_mid"])) {
const leftDown = this.isFilled(left.below()) ? left.below() : null
left.setPermutation(left.permutation.withState("lfg_ff:module", !leftDown ? "normal_bot" : "normal_mid"))
}
if (right && this.isModule(right, ["inner_corner_bot", "outer_corner_bot", "inner_corner_mid", "outer_corner_mid"])) {
const rightDown = this.isFilled(right.below()) ? right.below() : null
right.setPermutation(right.permutation.withState("lfg_ff:module", !rightDown ? "normal_bot" : "normal_mid"))
}
});
}
system.run(() => {
if (up)
this.updateBot(up)
if (down)
this.updateBot(down)
});
}
beforeOnPlayerPlace(e) {
const b = e.block;
const perm = e.permutationToPlace;
const dir = perm.getState("minecraft:cardinal_direction");
const module = perm.getState("lfg_ff:module");
const left = this.getNeighbor(b, this.LEFT_OF[dir]);
const right = this.getNeighbor(b, this.RIGHT_OF[dir]);
const up = this.isFilled(b.above()) ? b.above() : null
const down = this.isFilled(b.below()) ? b.below() : null
e.permutationToPlace = perm
.withState("lfg_ff:module", !down ? "normal_bot" : "normal_mid")
const placementVars = this.getPlacementVariants(b, dir, module);
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant_ext", placementVars.ext).withState("lfg_ff:variant_int", placementVars.int);
if (module === "normal_bot" || module === "normal_mid") {
system.run(() => {
if (left) this.updateNeighborBlock(left, module, dir, b, up, down);
if (right) this.updateNeighborBlock(right, module, dir, b, up, down);
});
}
system.run(() => {
if (up)
this.updateBot(up)
if (down)
this.updateBot(down)
});
}
updateBot(block) {
const down = this.isFilled(block.below()) ? block.below() : null
if (!down) {
block.setPermutation(block.permutation.withState("lfg_ff:module", block.permutation.getState("lfg_ff:module").replace("mid", "bot")))
} else {
block.setPermutation(block.permutation.withState("lfg_ff:module", block.permutation.getState("lfg_ff:module").replace("bot", "mid")))
}
}
variantChanger(e) {
const { smallBrush, variantPicker } = e;
const block = e.block;
const player = e.player;
const face = e.face;
const inv = player.getComponent("inventory").container;
const item = inv.getItem(player.selectedSlotIndex);
if (!item) return;
if (item.typeId === "lfg_ff:color_brush" || item.typeId === "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return;
const current = { ext: block.permutation.getState("lfg_ff:variant_ext"), int: block.permutation.getState("lfg_ff:variant_int") }
const newVariant = (variantPicker != null) ? variantPicker : { ext: face == "ext" ? (current.ext === 6 ? 1 : current.ext + 1) : current.ext, int: face == "int" ? (current.int === 6 ? 1 : current.int + 1) : current.int }
this.setStates(block, { "lfg_ff:variant_int": newVariant.int });
this.setStates(block, { "lfg_ff:variant_ext": newVariant.ext });
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`);
if (!smallBrush) {
item.getComponent("cooldown").startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown");
system.runTimeout(() => player.removeTag("lfg_ff:color_brush:cooldown"), 10);
const module = this.getState(block, "lfg_ff:module");
const dir = this.getState(block, "minecraft:cardinal_direction");
this.expendPaintBFS(block, dir, module, newVariant);
}
}
}
expendPaintBFS(startBlock, startDir, startModule, newVariant) {
const visited = new Set();
const keyOf = b => `${b.location.x},${b.location.y},${b.location.z}`;
const wallId = this.wallId;
const MAX_TOTAL = this.MaxPaintedBlocksOnce ?? 1000;
const MAX_PER_WAVE = 96;
let paintedTotal = 0;
let currentWave = [startBlock];
const step = () => {
if (!currentWave.length || paintedTotal >= MAX_TOTAL) return;
const nextWave = [];
let paintedThisWave = 0;
for (const b of currentWave) {
if (paintedTotal >= MAX_TOTAL || paintedThisWave >= MAX_PER_WAVE) break;
if (!b || (b.typeId !== wallId && b.typeId !== this.wallCapId)) continue;
const k = keyOf(b);
if (visited.has(k)) continue;
visited.add(k);
const curVar = { ext: b.permutation.getState("lfg_ff:variant_ext"), int: b.permutation.getState("lfg_ff:variant_int") };
if (curVar.ext !== newVariant.ext || curVar.int !== newVariant.int) {
try {
this.setStates(b, { "lfg_ff:variant_int": newVariant.int });
this.setStates(b, { "lfg_ff:variant_ext": newVariant.ext });
paintedThisWave++;
paintedTotal++;
} catch { }
}
const m = b.permutation.getState("lfg_ff:module");
const d = b.permutation.getState("minecraft:cardinal_direction");
const L = this.getNeighborByModule(b, d, m, "left");
const R = this.getNeighborByModule(b, d, m, "right");
const F = this.getNeighborByModule(b, d, m, "front");
const B = this.getNeighborByModule(b, d, m, "back");
const U = b.above?.();
const D = b.below?.();
const candidates = [L, R, F, B, U, D].filter(Boolean);
for (const nb of candidates) {
if (nb.typeId !== wallId) continue;
const nk = keyOf(nb);
if (!visited.has(nk)) nextWave.push(nb);
}
}
if (nextWave.length && paintedTotal < MAX_TOTAL) {
currentWave = nextWave;
system.runTimeout(step, 1);
}
};
step();
}
getNeighborByModule(block, dir, mod, side) {
if (mod === "normal_bot" || mod === "normal_mid") {
if (side === "left") return this.getNeighbor(block, this.LEFT_OF[dir]);
if (side === "right") return this.getNeighbor(block, this.RIGHT_OF[dir]);
if (side === "front") return this.getNeighbor(block, dir, false);
if (side === "back") return this.getNeighbor(block, this.OPPOSITE[dir], false);
return null;
}
if (mod === "inner_corner_bot" || mod === "inner_corner_mid") {
if (side === "left") return this.getNeighbor(block, this.LEFT_OF[dir]);
if (side === "right") return this.getNeighbor(block, this.RIGHT_OF[dir]);
if (side === "front") return this.getNeighbor(block, dir, false);
if (side === "back") return this.getNeighbor(block, this.OPPOSITE[dir], false);
return null;
}
if (side === "left") return this.getNeighbor(block, dir, false);
if (side === "right") return this.getNeighbor(block, this.RIGHT_OF[dir]);
if (side === "front") return this.getNeighbor(block, this.LEFT_OF[dir], false);
if (side === "back") return this.getNeighbor(block, this.OPPOSITE[dir], false);
return null;
}
}
const wallComp = new SplitWallComponent()
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!isFirstEvent) return;
const itemList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small",
]
const blockList = [
"lfg_ff:split_wall"
]
if (!blockList.includes(block.typeId)) return;
const getBlockComponent = {
"lfg_ff:split_wall": wallComp
}
let blockComponent = getBlockComponent[block.typeId] ?? null
if (!blockComponent) return;
const dir = block.permutation.getState("minecraft:cardinal_direction")
const module = block.permutation.getState("lfg_ff:module")
let face = null;
if (dir == e.blockFace.toLocaleLowerCase() && module.includes("normal")) face = "ext"
if (wallComp.OPPOSITE[dir] == e.blockFace.toLocaleLowerCase() && module.includes("normal")) face = "int"
if (dir == e.blockFace.toLocaleLowerCase() && module.includes("inner")) face = "ext"
if (wallComp.LEFT_OF[dir] == e.blockFace.toLocaleLowerCase() && module.includes("inner")) face = "ext"
if (wallComp.LEFT_OF[dir] == e.blockFace.toLocaleLowerCase() && module.includes("outer")) face = "int"
if (wallComp.OPPOSITE[dir] == e.blockFace.toLocaleLowerCase() && module.includes("outer")) face = "int"
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
pickerVariant = pickedVar ? JSON.parse(pickedVar) : null
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
pickerVariant = pickedVar ? JSON.parse(pickedVar) : null
}
system.runTimeout(() => {
blockComponent.variantChanger({ block: block, player, smallBrush: true, variantPicker: pickerVariant, face })
}, 1)
return;
}
})
function handleVariantPicker(block, player, face) {
let variant = face == "ext" ? block.permutation.getState("lfg_ff:variant_ext") : block.permutation.getState("lfg_ff:variant_int")
if (!variant) return;
const prevVarStr = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`)
let prevVar = prevVarStr ? JSON.parse(prevVarStr) : { ext: block.permutation.getState("lfg_ff:variant_ext"), int: block.permutation.getState("lfg_ff:variant_int") }
if (!prevVar) return;
if (face == "ext") prevVar.ext = variant
if (face == "int") prevVar.int = variant
player.setDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`, JSON.stringify(prevVar))
player.runCommand(`tellraw @s { "rawtext": [ { "text" : "§9Picked variant §3${variant}§9 for §3" }, { "translate" : "tile.${block.typeId}.name" }, { "text" : " §3(${face == "ext" ? "Exterior" : "Interior"})" } ] }`)
player.dimension.playSound("random.pop", block.location, { pitch: 1.5 })
}