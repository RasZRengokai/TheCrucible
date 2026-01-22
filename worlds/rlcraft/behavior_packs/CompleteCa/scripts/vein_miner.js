import {
    world,
    EquipmentSlot,
    EntityEquippableComponent,
    system
} from "@minecraft/server";

// —— Configuración de minerales soportados ——
const ORE_BREAKABLE_BLOCKS = [
    "minecraft:coal_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:lapis_ore",
    "minecraft:redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:nether_quartz_ore",
    "minecraft:nether_gold_ore",
    "minecraft:ancient_debris",
    "minecraft:copper_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:deepslate_copper_ore"
];

// —— Niveles de herramienta requeridos (harvest levels vanilla) ——
const ORE_REQUIRED_LEVEL = new Map([
    // nivel 0: madera o superior
    ["minecraft:coal_ore", 0],
    ["minecraft:deepslate_coal_ore", 0],
    ["minecraft:nether_quartz_ore", 0],
    // nivel 1: piedra o superior
    ["minecraft:iron_ore", 1],
    ["minecraft:deepslate_iron_ore", 1],
    ["minecraft:lapis_ore", 1],
    ["minecraft:deepslate_lapis_ore", 1],
    ["minecraft:copper_ore", 1],
    ["minecraft:deepslate_copper_ore", 1],
    // nivel 2: hierro o superior
    ["minecraft:redstone_ore", 2],
    ["minecraft:deepslate_redstone_ore", 2],
    ["minecraft:gold_ore", 2],
    ["minecraft:deepslate_gold_ore", 2],
    ["minecraft:diamond_ore", 2],
    ["minecraft:deepslate_diamond_ore", 2],
    ["minecraft:emerald_ore", 2],
    ["minecraft:deepslate_emerald_ore", 2],
    // nivel 3: diamante o superior
    ["minecraft:ancient_debris", 3],
    // nether_gold_ore: en vanilla suelta pepitas con pico de hierro o mejor, pero no produce bloque; 
    // para simplificar, se puede requerir nivel 2:
    ["minecraft:nether_gold_ore", 2]
]);

const MAX_HORIZONTAL_DIST = 6;
const MAX_VERTICAL_DIST = 6;

// Función para obtener nivel de pico según tipoId
function getPickaxeLevel(typeId) {
    if (typeId.endsWith("wooden_pickaxe")) return 0;
    if (typeId.endsWith("stone_pickaxe")) return 1;
    if (typeId.endsWith("iron_pickaxe")) return 2;
    if (typeId.endsWith("diamond_pickaxe")) return 3;
    if (typeId.endsWith("netherite_pickaxe")) return 4;
    return 0;
}

world.beforeEvents.playerBreakBlock.subscribe(({ block, player, cancel }) => {
    try {
        if (player.hasTag("veinOff")) return;

        const tool = player
            .getComponent(EntityEquippableComponent.componentId)
            .getEquipment(EquipmentSlot.Mainhand);
        if (!tool || !tool.typeId.includes("_pickaxe")) return;

        const pickLevel = getPickaxeLevel(tool.typeId);
        const required = ORE_REQUIRED_LEVEL.get(block.typeId) || 0;
        if (pickLevel < required) {
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou need level ${required} to mine this."}]}`);
            cancel = true;
            return;
        }

        const type = block.typeId;
        if (!ORE_BREAKABLE_BLOCKS.includes(type)) return;

        cancel = true;
        const toMine = findConnectedOres(block, type);
        let count = 0;

        for (const loc of toMine) {
            const b = block.dimension.getBlock(loc);
            if (!b || b.typeId !== type) continue;

            // Corrige la ejecución del comando con backticks y sin argumentos extra
            player.runCommandAsync(`particle new:crust ${loc.x} ${loc.y} ${loc.z}`);
            block.dimension.runCommandAsync(`setblock ${loc.x} ${loc.y} ${loc.z} air destroy`);
            count++;
        }

        player.runCommandAsync(`playsound random.pop @s`);
        player.runCommandAsync(`title @s subtitle §eMinered: ${count}`);

    } catch (err) {
        console.error(err);
    }
});

function findConnectedOres(startBlock, oreType) {
    const toCheck = [startBlock.location];
    const seen = new Set();
    const connected = [];

    while (toCheck.length) {
        const loc = toCheck.pop();
        const key = `${loc.x},${loc.y},${loc.z}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const blk = startBlock.dimension.getBlock(loc);
        if (blk && blk.typeId === oreType) {
            connected.push(loc);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        if (dx === 0 && dy === 0 && dz === 0) continue;
                        const nb = { x: loc.x + dx, y: loc.y + dy, z: loc.z + dz };
                        if (
                            Math.abs(nb.x - startBlock.location.x) <= MAX_HORIZONTAL_DIST &&
                            Math.abs(nb.y - startBlock.location.y) <= MAX_VERTICAL_DIST &&
                            Math.abs(nb.z - startBlock.location.z) <= MAX_HORIZONTAL_DIST
                        ) {
                            toCheck.push(nb);
                        }
                    }
                }
            }
        }
    }

    return connected;
}

world.afterEvents.itemUse.subscribe(({ source: player, itemStack: item }) => {
    if (item.typeId.includes("_pickaxe") && player.isSneaking) {
        if (player.hasTag("veinOff")) {
            player.removeTag("veinOff");
            player.runCommandAsync(`title @s actionbar §a[VeinMiner] ON`);
        } else {
            player.addTag("veinOff");
            player.runCommandAsync(`title @s actionbar §c[VeinMiner] OFF`);
        }
    }
});

system.runInterval(() => {
    world.getPlayers().forEach(p => {
        try {
            const hand = p
                .getComponent(EntityEquippableComponent.componentId)
                .getEquipment(EquipmentSlot.Mainhand).typeId;
            if (hand.includes("_pickaxe") && !p.hasTag("veinNotif")) {
                p.runCommandAsync(
                    `title @s actionbar §6[VeinMiner] Sneak + Use para Toggle`
                );
                p.addTag("veinNotif");
            }
        } catch {
            if (p.hasTag("veinNotif")) p.removeTag("veinNotif");
        }
    });
}, 20);
