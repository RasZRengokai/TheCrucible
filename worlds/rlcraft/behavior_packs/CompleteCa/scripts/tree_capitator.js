import { world as w, EquipmentSlot as E, EntityEquippableComponent as C, system as s } from "@minecraft/server";

const B = [
    "minecraft:stripped_oak_wood", "minecraft:stripped_dark_oak_wood", "minecraft:stripped_birch_wood",
    "minecraft:stripped_spruce_wood", "minecraft:stripped_acacia_wood", "minecraft:stripped_jungle_wood",
    "minecraft:stripped_cherry_wood", "minecraft:stripped_mangrove_wood", "minecraft:stripped_pale_oak_wood",
    "minecraft:stripped_oak_log", "minecraft:stripped_dark_oak_log", "minecraft:stripped_birch_log",
    "minecraft:stripped_spruce_log", "minecraft:stripped_acacia_log", "minecraft:stripped_jungle_log",
    "minecraft:stripped_cherry_log", "minecraft:stripped_mangrove_log", "minecraft:stripped_pale_oak_log",
    "minecraft:stripped_crimson_stem", "minecraft:stripped_warped_stem", "minecraft:stripped_bamboo_block",
    "minecraft:oak_log", "minecraft:dark_oak_log", "minecraft:birch_log", "minecraft:spruce_log",
    "minecraft:acacia_log", "minecraft:jungle_log", "minecraft:cherry_log", "minecraft:mangrove_log",
    "minecraft:pale_oak_log", "minecraft:crimson_stem", "minecraft:warped_stem"
];

w.beforeEvents.playerBreakBlock.subscribe(({ block: b, player: p }) => { try { const t = p.getComponent(C.componentId).getEquipment(E.Mainhand); if (t && t.typeId.includes("_axe") && !p.isSneaking && !p.hasTag("off")) for (const k of B) if (k === b.typeId) { p.runCommandAsync("playsound cut @s"); p.runCommandAsync(`particle new:crust ${b.x} ${b.y} ${b.z}`); A(b, p, k); break } } catch { } });

function A(b, p, r) { const d = b.dimension, L = D(b, r); for (const o of L) { const x = d.getBlock(o); x && r.includes(x.typeId) && d.runCommandAsync(`setblock ${o.x} ${o.y} ${o.z} air destroy`) } }

function D(s, r, m = 5) { const Q = [s.location], U = new Set, Z = []; while (Q.length) { const o = Q.pop(), k = `${o.x},${o.y},${o.z}`; if (U.has(k)) continue; U.add(k); const x = s.dimension.getBlock(o); if (x && r.includes(x.typeId)) { Z.push(o); for (let i = -1; i <= 1; i++)for (let j = -1; j <= 1; j++)for (let l = -1; l <= 1; l++)if (i || j || l) { const n = { x: o.x + i, y: o.y + j, z: o.z + l }; Math.abs(n.x - s.location.x) <= m && Math.abs(n.y - s.location.y) <= m + 25 && Math.abs(n.z - s.location.z) <= m && Q.push(n) } } } return Z; }

s.runInterval(() => { for (const p of w.getPlayers()) try { const h = p.getComponent(C.componentId).getEquipment(E.Mainhand).typeId; if (h.includes("_axe") && !p.isSneaking && !p.hasTag("noti")) { p.runCommandAsync("title @s actionbar §6[Tree Capitator] Sneak + Use to Toggle"); p.addTag("noti") } } catch { p.hasTag("noti") && p.removeTag("noti") } }, 20);

w.afterEvents.itemUse.subscribe(({ source: p, itemStack: i }) => { if (i.typeId.includes("_axe") && p.isSneaking && !p.hasTag("off")) s.runTimeout(() => { p.runCommandAsync("title @s actionbar §cTree Capitator Disabled"); p.addTag("off") }, 2); else if (i.typeId.includes("_axe") && p.isSneaking && p.hasTag("off")) s.runTimeout(() => { p.runCommandAsync("title @s actionbar §aTree Capitator Enabled"); p.removeTag("off") }, 2) });
