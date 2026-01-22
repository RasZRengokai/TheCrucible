/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system } from "@minecraft/server";
import { Vector } from './vector.js';
export class RoofComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.roofId = "lfg_ff:roof";
this.roofCapId = "lfg_ff:roof_cap";
this.MaxPaintedBlocksOnce = 2000;
this.SOUND_BY_VARIANT = new Map([
[1, "dig.deepslate_bricks"],
[2, "dig.grass"],
[3, "dig.deepslate_bricks"],
[4, "dig.grass"],
[5, "dig.grass"],
[6, "dig.wood"],
[7, "break.iron"],
[8, "dig.deepslate"],
[9, "dig.deepslate_bricks"],
[10, "dig.wood"],
[11, "break.iron"],
[12, "break.iron"],
[13, "dig.deepslate"],
]);
this.LEFT_OF = { north: "west", west: "south", south: "east", east: "north" };
this.RIGHT_OF = { north: "east", east: "south", south: "west", west: "north" };
this.OPPOSITE = { north: "south", south: "north", east: "west", west: "east", up: "down", down: "up" };
this.INVERTED = { north: "east", east: "south", south: "west", west: "north" };
this.OFFSET_OF = {
north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 },
};
}
playVariantSound(dim, loc, variant) {
const s = this.SOUND_BY_VARIANT.get(variant);
if (s) dim.playSound(s, loc);
}
getState(block, s) { return block?.permutation.getState(s); }
setStates(block, patch) {
let perm = block.permutation;
for (const [k, v] of Object.entries(patch)) perm = perm.withState(k, v);
block.setPermutation(perm);
}
getNeighbor(block, dir, filterRoof = true) {
const off = this.OFFSET_OF[dir];
if (!off) return null;
const nb = block.dimension.getBlock({
x: block.location.x + off.x,
y: block.location.y,
z: block.location.z + off.z
});
return (!nb || (filterRoof && nb.typeId !== this.roofId)) ? null : nb;
}
areSamePos(a, b) {
return a && b &&
a.location.x === b.location.x &&
a.location.y === b.location.y &&
a.location.z === b.location.z;
}
getPlacementVariant(block, d, m) {
const L = this.getNeighborByModule(block, d, m, "left");
const R = this.getNeighborByModule(block, d, m, "right");
const F = this.getNeighborByModule(block, d, m, "front");
const B = this.getNeighborByModule(block, d, m, "back");
const U = block.above?.();
const D = block.below?.();
const LU = L ? L.above() : null;
const RU = R ? R.above() : null;
const FU = F ? F.above() : null;
const LD = L ? L.below() : null;
const RD = R ? R.below() : null;
const BD = B ? B.below() : null;
const candidates = [L, R, F, B, U, D, LU, RU, FU, LD, RD, BD].filter(Boolean).filter(b => (this.isRoof(b) || b.typeId == this.roofCapId));
const count = new Map();
for (const nb of candidates) {
const v = this.getState(nb, "lfg_ff:variant");
if (v !== undefined) count.set(v, (count.get(v) || 0) + 1);
}
let best = 1, max = 0;
for (const [v, c] of count) if (c > max) { max = c; best = Number(v); }
return best;
}
determineModuleAndDirection(left, right, front, back, dir) {
if (front) {
const fDir = this.getState(front, "minecraft:cardinal_direction");
const fMod = this.getState(front, "lfg_ff:module");
const notOppOrOuter =
(fDir == this.RIGHT_OF[dir] && fMod == "outer_corner") ||
(fDir !== this.OPPOSITE[dir] && fMod !== "outer_corner") ||
(fDir === this.OPPOSITE[dir] && fMod === "outer_corner");
if (fDir !== dir && fMod !== "inner_corner" && notOppOrOuter) {
let nd = this.getDirectionForOuterCorner(dir, fDir, front);
return { module: "outer_corner", direction: nd };
}
}
if (back) {
const bDir = this.getState(back, "minecraft:cardinal_direction");
const bMod = this.getState(back, "lfg_ff:module");
const notOppOrInner =
(bDir !== this.RIGHT_OF[dir] && bMod == "inner_corner") ||
(bDir !== this.OPPOSITE[dir] && bMod !== "inner_corner") ||
(bDir === this.OPPOSITE[dir] && bMod === "inner_corner");
if (bDir !== dir && bMod !== "outer_corner" && notOppOrInner) {
let nd = this.getDirectionForInnerCorner(dir, bDir, back);
return { module: "inner_corner", direction: nd };
}
}
return { module: "normal", direction: dir };
}
getDirectionForInnerCorner(dir, backDir, backBlock) {
const backMod = this.getState(backBlock, "lfg_ff:module");
if (dir === "north") {
return (backMod === "inner_corner") ? (backDir === "south" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "east" ? backDir : dir);
}
if (dir === "west") {
return (backMod === "inner_corner") ? (backDir === "east" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "south" ? dir : backDir);
}
if (dir === "south") {
return (backMod === "inner_corner") ? (backDir === "north" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "east" ? dir : backDir);
}
return (backMod === "inner_corner") ? (backDir === "west" ? this.OPPOSITE[this.INVERTED[backDir]] : dir)
: (backDir === "south" ? backDir : dir);
}
getDirectionForOuterCorner(dir, frontDir, frontBlock) {
const fMod = this.getState(frontBlock, "lfg_ff:module");
if (dir === "north") {
return (fMod === "outer_corner") ? (frontDir === "south" ? this.INVERTED[frontDir] : dir)
: (frontDir === "west" ? frontDir : dir);
}
if (dir === "west") {
return (fMod === "outer_corner") ? (frontDir === "east" ? this.INVERTED[frontDir] : dir)
: (frontDir === "north" ? dir : frontDir);
}
if (dir === "south") {
return (fMod === "outer_corner") ? (frontDir === "north" ? this.INVERTED[frontDir] : dir)
: (frontDir === "west" ? dir : frontDir);
}
return (fMod === "outer_corner") ? (frontDir === "west" ? this.INVERTED[frontDir] : dir)
: (frontDir === "north" ? frontDir : dir);
}
updateNeighborBlock(nb, placedModule, placedDir, placedBlock) {
const nMod = this.getState(nb, "lfg_ff:module");
const nDir = this.getState(nb, "minecraft:cardinal_direction");
if (nMod !== "normal") return;
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
const notAlreadyConnectedToCorner = (this.getState(right, "lfg_ff:module") !== "outer_corner" && this.getState(right, "lfg_ff:module") !== "inner_corner") || !this.isRoof(left)
if (!(check?.typeId === this.roofId && this.getState(check, "minecraft:cardinal_direction") === nDir) && notAlreadyConnectedToCorner) {
finalModule = "outer_corner";
finalDir = this.getDirectionForOuterCorner(placedDir, nDir, nb);
}
} else if (back && this.areSamePos(back, placedBlock)) {
const check = this.getNeighbor(nb, placedDir, false);
const notAlreadyConnectedToCorner = (this.getState(right, "lfg_ff:module") !== "outer_corner" && this.getState(right, "lfg_ff:module") !== "inner_corner") || !this.isRoof(left)
if (!(check?.typeId === this.roofId && this.getState(check, "minecraft:cardinal_direction") === nDir) && notAlreadyConnectedToCorner) {
finalModule = "inner_corner";
finalDir = this.getDirectionForInnerCorner(placedDir, nDir, nb);
}
}
if (finalModule !== nMod || finalDir !== nDir) {
this.setStates(nb, { "lfg_ff:module": finalModule, "minecraft:cardinal_direction": finalDir });
}
}
isRoof(b) { return !!b && b.typeId === this.roofId; }
sameDir(b1, b2) {
if (this.isModule(b1, ["outer_corner"])) {
if (this.RIGHT_OF[this.getState(b1, "minecraft:cardinal_direction")] === this.getState(b2, "minecraft:cardinal_direction")) return true;
}
if (this.isModule(b2, ["outer_corner"])) {
if (this.RIGHT_OF[this.getState(b2, "minecraft:cardinal_direction")] === this.getState(b1, "minecraft:cardinal_direction")) return true;
}
if (this.isModule(b1, ["inner_corner"])) {
if (this.LEFT_OF[this.getState(b1, "minecraft:cardinal_direction")] === this.getState(b2, "minecraft:cardinal_direction")) return true;
}
if (this.isModule(b2, ["inner_corner"])) {
if (this.LEFT_OF[this.getState(b2, "minecraft:cardinal_direction")] === this.getState(b1, "minecraft:cardinal_direction")) return true;
}
return this.getState(b1, "minecraft:cardinal_direction") === this.getState(b2, "minecraft:cardinal_direction");
}
isModule(b, moduleList = []) {
return moduleList.includes(this.getState(b, "lfg_ff:module"));
}
isAngle(b, angleList = []) {
return angleList.includes(this.getState(b, "lfg_ff:angle"));
}
reevaluateAnglesAt(block, count) {
if (!this.isRoof(block)) return;
const dir = this.getState(block, "minecraft:cardinal_direction");
const F = this.getNeighbor(block, dir, true);
const B = this.getNeighbor(block, this.OPPOSITE[dir], true);
const R = this.getNeighbor(block, this.RIGHT_OF[dir], true);
const L = this.getNeighbor(block, this.LEFT_OF[dir], true);
const U = block.above?.();
const D = block.below?.();
if (this.isRoof(U) && this.sameDir(block, U)) {
if (this.isAngle(block, ["45", "22_h", "67_l"])) {
this.setStates(U, { "lfg_ff:angle": "67_h" });
}
if (this.isAngle(U, ["67_h"]))
this.setStates(block, { "lfg_ff:angle": "67_l" });
return;
}
if (this.isRoof(D) && this.sameDir(block, D)) {
if (this.isAngle(D, ["45", "22_h", "67_l"])) {
this.setStates(block, { "lfg_ff:angle": "67_h" });
}
if (this.isAngle(block, ["67_h"]))
this.setStates(D, { "lfg_ff:angle": "67_l" });
return;
}
if (this.isRoof(F) && this.sameDir(block, F)) {
if (this.isAngle(block, ["45", "22_l"])) {
if (this.isModule(block, "outer_corner") && !this.isAngle(R, ["22_h"])) {
} else if (!this.isAngle(F.above(), ["67_h"])) {
if (!this.isAngle(F, ["22_h"])) {
system.run(() => {
this.reevaluateAnglesAround(F, count + 1)
})
}
this.setStates(F, { "lfg_ff:angle": "22_h" });
}
}
if (this.isAngle(F, ["45", "22_h", "67_l"])) {
if (this.isModule(block, "outer_corner") && !this.isAngle(R, ["22_l"])) {
} else {
if (!this.isAngle(block, ["22_l"])) {
system.run(() => {
this.reevaluateAnglesAround(block, count + 1)
})
}
this.setStates(block, { "lfg_ff:angle": "22_l" });
}
} else if (this.isAngle(F, ["22_l"]) && this.isAngle(R, ["22_l"]) && this.isModule(block, "outer_corner")) {
this.setStates(block, { "lfg_ff:angle": "22_l" });
}
return;
}
if (this.isRoof(B) && this.sameDir(block, B)) {
if (this.isAngle(B, ["45", "22_l"])) {
if (this.isModule(block, "inner_corner") && !this.isAngle(B, ["22_h"])) {
} else {
if (!this.isAngle(block, ["22_h"])) {
system.run(() => {
this.reevaluateAnglesAround(block, count + 1)
})
}
this.setStates(block, { "lfg_ff:angle": "22_h" });
}
} else if (this.isAngle(B, ["22_h"]) && this.isAngle(R, ["22_h"]) && this.isModule(block, "inner_corner")) {
this.setStates(block, { "lfg_ff:angle": "22_h" });
}
if (this.isAngle(block, ["45", "22_h", "67_l"])) {
if (this.isModule(block, "inner_corner") && !this.isAngle(B, ["22_l"])) {
} else {
if (!this.isAngle(B, ["22_l"])) {
system.run(() => {
this.reevaluateAnglesAround(B, count + 1)
})
}
this.setStates(B, { "lfg_ff:angle": "22_l" });
}
}
return;
}
this.setStates(block, { "lfg_ff:angle": "45" });
}
reevaluateAnglesAround(block, count = 0) {
if (count > 2) return;
if (!block) return;
this.reevaluateAnglesAt(block, count);
const dir = this.getState(block, "minecraft:cardinal_direction");
const mod = this.getState(block, "lfg_ff:module");
if (!dir) return;
const L = this.getNeighborByModule(block, dir, mod, "left");
const R = this.getNeighborByModule(block, dir, mod, "right");
const F = this.getNeighborByModule(block, dir, mod, "front");
const B = this.getNeighborByModule(block, dir, mod, "back");
const U = block.above?.();
const D = block.below?.();
const LU = L ? L.above() : null;
const RU = R ? R.above() : null;
const FU = F ? F.above() : null;
const LD = L ? L.below() : null;
const RD = R ? R.below() : null;
const BD = B ? B.below() : null;
const candidates = [L, R, F, B, U, D, LU, RU, FU, LD, RD, BD].filter(Boolean);
for (const nb of candidates) {
if (this.isRoof(nb)) this.reevaluateAnglesAt(nb, count);
}
}
onPlayerBreak(e) {
const dim = e.block.dimension;
const loc = e.block.location;
const v = e.brokenBlockPermutation.getState("lfg_ff:variant");
this.playVariantSound(dim, loc, v);
}
beforeOnPlayerPlace(e) {
const b = e.block;
const perm = e.permutationToPlace;
const dir = perm.getState("minecraft:cardinal_direction");
const left = this.getNeighbor(b, this.LEFT_OF[dir]);
const right = this.getNeighbor(b, this.RIGHT_OF[dir]);
const front = this.getNeighbor(b, dir);
const back = this.getNeighbor(b, this.OPPOSITE[dir]);
const { module, direction } = this.determineModuleAndDirection(left, right, front, back, dir);
e.permutationToPlace = perm
.withState("lfg_ff:module", module)
.withState("minecraft:cardinal_direction", direction);
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:angle", "45");
const placementVar = this.getPlacementVariant(b, direction, module);
e.permutationToPlace = e.permutationToPlace.withState("lfg_ff:variant", placementVar);
system.run(() => this.playVariantSound(b.dimension, b.location, placementVar));
if (module === "normal") {
system.run(() => {
if (left) this.updateNeighborBlock(left, module, direction, b);
if (right) this.updateNeighborBlock(right, module, direction, b);
});
}
system.run(() => this.reevaluateAnglesAround(b));
}
variantChanger(e) {
const { smallBrush, variantPicker } = e;
const block = e.block;
const player = e.player;
const inv = player.getComponent("inventory").container;
const item = inv.getItem(player.selectedSlotIndex);
if (!item) return;
if (item.typeId === "lfg_ff:color_brush" || item.typeId === "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return;
const current = this.getState(block, "lfg_ff:variant");
const newVariant = (variantPicker != null) ? variantPicker : (current === 13 ? 1 : current + 1);
this.setStates(block, { "lfg_ff:variant": newVariant });
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
const roofId = this.roofId;
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
if (!b || (b.typeId !== roofId && b.typeId !== this.roofCapId)) continue;
const k = keyOf(b);
if (visited.has(k)) continue;
visited.add(k);
const curVar = b.permutation.getState("lfg_ff:variant");
if (curVar !== newVariant) {
try {
this.setStates(b, { "lfg_ff:variant": newVariant });
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
const LU = L ? L.above() : null;
const RU = R ? R.above() : null;
const FU = F ? F.above() : null;
const LD = L ? L.below() : null;
const RD = R ? R.below() : null;
const BD = B ? B.below() : null;
const candidates = [L, R, F, B, U, D, LU, RU, FU, LD, RD, BD].filter(Boolean);
for (const nb of candidates) {
if (nb.typeId !== roofId && nb.typeId !== this.roofCapId) continue;
if (nb.typeId == this.roofCapId && this.isWeatherVane(nb)) continue
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
isWeatherVane(block) {
return ["wv_mid", "wv_top"].includes(block.permutation.getState("lfg_ff:module"))
}
getNeighborByModule(block, dir, mod, side) {
if (mod === "normal") {
if (side === "left") return this.getNeighbor(block, this.LEFT_OF[dir]);
if (side === "right") return this.getNeighbor(block, this.RIGHT_OF[dir]);
if (side === "front") return this.getNeighbor(block, dir, false);
if (side === "back") return this.getNeighbor(block, this.OPPOSITE[dir], false);
return null;
}
if (mod === "inner_corner") {
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