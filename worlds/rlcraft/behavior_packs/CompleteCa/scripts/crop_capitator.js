import {
    world,
    EquipmentSlot,
    EntityEquippableComponent,
    system
} from "@minecraft/server";

// —— Configuration of supported crops and plants ——
// Flat crops
const FLAT_CROPS = [
    "minecraft:wheat",
    "minecraft:carrots",
    "minecraft:potatoes",
    "minecraft:beetroots",
    "minecraft:nether_wart",
    "minecraft:sweet_berry_bush",
    "minecraft:melon_block",
    "minecraft:pumpkin"
];
// Vertical plants
const VERTICAL_PLANTS = [
    "minecraft:sugar_cane",
    "minecraft:cactus",
    "minecraft:bamboo"
];
// All supported
const CROP_BREAKABLE_BLOCKS = [
    ...FLAT_CROPS,
    ...VERTICAL_PLANTS
];

// —— Search parameters ——
const MAX_HORIZONTAL_DIST = 5;
const MAX_VERTICAL_DIST = 1;
const MAX_VERTICAL_PLANT = 5;

world.beforeEvents.playerBreakBlock.subscribe(({ block, player, cancel }) => {
    try {
        // If disabled for this player, skip
        if (player.hasTag("cropOff")) return;

        // Must be holding a hoe
        const tool = player
            .getComponent(EntityEquippableComponent.componentId)
            .getEquipment(EquipmentSlot.Mainhand);
        if (!tool || !tool.typeId.includes("_hoe")) return;

        const type = block.typeId;
        if (!CROP_BREAKABLE_BLOCKS.includes(type)) return;

        // Cancel individual block break
        cancel = true;

        // Choose harvest algorithm
        let toHarvest = VERTICAL_PLANTS.includes(type)
            ? findVerticalPlants(block)
            : findConnectedCrops(block);

        // Harvest and count
        let count = 0;
        for (const loc of toHarvest) {
            const b = block.dimension.getBlock(loc);
            if (!b || !CROP_BREAKABLE_BLOCKS.includes(b.typeId)) continue;

            // Spawn the same "crust" particle as in your mod example
            player.runCommandAsync(
                `particle new:crust ${loc.x} ${loc.y} ${loc.z}`
            );
            // Break block to drop items
            block.dimension.runCommandAsync(
                `setblock ${loc.x} ${loc.y} ${loc.z} air destroy`
            );
            count++;
        }

        // Play sound and show HUD
        player.runCommandAsync(`playsound random.pop @s`);
        player.runCommandAsync(
            `title @s subtitle §eHarvested: ${count}`
        );

    } catch (err) {
        console.error(err);
    }
});

/**
 * Find connected flat crops in X/Z and small Y radius
 */
function findConnectedCrops(startBlock) {
    const toCheck = [startBlock.location];
    const seen = new Set();
    const connected = [];

    while (toCheck.length) {
        const loc = toCheck.pop();
        const key = `${loc.x},${loc.y},${loc.z}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const blk = startBlock.dimension.getBlock(loc);
        if (
            blk &&
            CROP_BREAKABLE_BLOCKS.includes(blk.typeId) &&
            !VERTICAL_PLANTS.includes(blk.typeId)
        ) {
            connected.push(loc);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    for (let dy = -MAX_VERTICAL_DIST; dy <= MAX_VERTICAL_DIST; dy++) {
                        if (dx === 0 && dz === 0 && dy === 0) continue;
                        const nb = { x: loc.x + dx, y: loc.y + dy, z: loc.z + dz };
                        if (
                            Math.abs(nb.x - startBlock.location.x) <= MAX_HORIZONTAL_DIST &&
                            Math.abs(nb.z - startBlock.location.z) <= MAX_HORIZONTAL_DIST &&
                            Math.abs(nb.y - startBlock.location.y) <= MAX_VERTICAL_DIST
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

/**
 * Find vertical plants within horizontal radius
 */
function findVerticalPlants(startBlock) {
    const connected = [];
    const { x: cx, y: cy, z: cz } = startBlock.location;

    for (let dx = -MAX_HORIZONTAL_DIST; dx <= MAX_HORIZONTAL_DIST; dx++) {
        for (let dz = -MAX_HORIZONTAL_DIST; dz <= MAX_HORIZONTAL_DIST; dz++) {
            for (let dy = 0; dy <= MAX_VERTICAL_PLANT; dy++) {
                const loc = { x: cx + dx, y: cy + dy, z: cz + dz };
                const blk = startBlock.dimension.getBlock(loc);
                if (blk && VERTICAL_PLANTS.includes(blk.typeId)) {
                    connected.push(loc);
                }
            }
        }
    }

    return connected;
}

// Toggle ON/OFF with sneak + use hoe
world.afterEvents.itemUse.subscribe(({ source: player, itemStack: item }) => {
    if (item.typeId.includes("_hoe") && player.isSneaking) {
        if (player.hasTag("cropOff")) {
            player.removeTag("cropOff");
            player.runCommandAsync(`title @s actionbar §a[Crop Capitator] ON`);
        } else {
            player.addTag("cropOff");
            player.runCommandAsync(`title @s actionbar §c[Crop Capitator] OFF`);
        }
    }
});

// Show initial toggle hint when equipping a hoe
system.runInterval(() => {
    world.getPlayers().forEach(p => {
        try {
            const hand = p
                .getComponent(EntityEquippableComponent.componentId)
                .getEquipment(EquipmentSlot.Mainhand).typeId;
            if (hand.includes("_hoe") && !p.hasTag("cropNotif")) {
                p.runCommandAsync(
                    `title @s actionbar §6[Crop Capitator] Sneak + Use to Toggle`
                );
                p.addTag("cropNotif");
            }
        } catch {
            if (p.hasTag("cropNotif")) p.removeTag("cropNotif");
        }
    });
}, 20);
