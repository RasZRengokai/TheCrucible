import { world, EquipmentSlot, EntityEquippableComponent, system } from "@minecraft/server";

function isShearable(typeId) {
    return (
        typeId === "minecraft:web" ||
        typeId === "minecraft:vine" ||
        typeId.startsWith("minecraft:bamboo") ||
        typeId.endsWith("_leaves")
    );
}
const MAX_HORIZONTAL_DIST = 6;
const MAX_VERTICAL_DIST = 6;

function findConnectedBlocks(startBlock, blockType) {
    const toCheck = [startBlock.location];
    const seen = new Set();
    const connected = [];

    while (toCheck.length) {
        const loc = toCheck.pop();
        const key = `${loc.x},${loc.y},${loc.z}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const blk = startBlock.dimension.getBlock(loc);
        if (blk && blk.typeId === blockType) {
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


world.beforeEvents.playerBreakBlock.subscribe(({ block, player, cancel }) => {
    try {

        if (player.hasTag("shearOff")) return;

        const equipComp = player.getComponent(EntityEquippableComponent.componentId);
        if (!equipComp) return;
        const tool = equipComp.getEquipment(EquipmentSlot.Mainhand);
        if (!tool || !tool.typeId.includes("shears")) return;

        const type = block.typeId;
        if (!isShearable(type)) return;

        // Cancelar el rompimiento estándar y procesar cluster
        cancel = true;

        const toMine = findConnectedBlocks(block, type);
        let count = 0;
        for (const loc of toMine) {
            const b = block.dimension.getBlock(loc);
            if (!b || b.typeId !== type) continue;
            player.runCommandAsync(`particle new:crust ${loc.x} ${loc.y} ${loc.z}`);
            block.dimension.runCommandAsync(`setblock ${loc.x} ${loc.y} ${loc.z} air destroy`);
            count++;
        }

        player.runCommandAsync(`playsound random.pop @s`);
        player.runCommandAsync(`title @s subtitle §aSheared: ${count}`);
    } catch (err) {
        console.error(err);
    }
});

// Suscriptor para toggle ON/OFF con sneak + usar tijeras
world.afterEvents.itemUse.subscribe(({ source: player, itemStack: item }) => {
    try {
        if (!item.typeId.includes("shears") || !player.isSneaking) return;
        if (player.hasTag("shearOff")) {
            player.removeTag("shearOff");
            player.runCommandAsync(`title @s actionbar §a[ShearCapitator] ON`);
        } else {
            player.addTag("shearOff");
            player.runCommandAsync(`title @s actionbar §c[ShearCapitator] OFF`);
        }
    } catch { }
});

// Mensaje inicial en actionbar al equipar tijeras
system.runInterval(() => {
    for (const p of world.getPlayers()) {
        try {
            const equipComp = p.getComponent(EntityEquippableComponent.componentId);
            if (!equipComp) {
                if (p.hasTag("shearNotif")) p.removeTag("shearNotif");
                continue;
            }
            const hand = equipComp.getEquipment(EquipmentSlot.Mainhand)?.typeId || "";
            if (hand.includes("shears") && !p.hasTag("shearNotif")) {
                p.runCommandAsync(`title @s actionbar §6[ShearCapitator] Sneak+Use para Toggle`);
                p.addTag("shearNotif");
            }
        } catch {
            if (p.hasTag("shearNotif")) p.removeTag("shearNotif");
        }
    }
}, 20);
