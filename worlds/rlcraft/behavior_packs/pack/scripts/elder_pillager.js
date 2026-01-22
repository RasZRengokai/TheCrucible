import { world, system } from "@minecraft/server";

function delay(ms) {
    return new Promise(resolve => system.runTimeout(resolve, ms));
}

system.runInterval(() => {
    const dimension = world.getDimension("overworld");
    const elder_pillagerEntities = dimension.getEntities({ type: "ecbl_bs:elder_pillager" });

    elder_pillagerEntities.forEach(elder_pillager => {
        if (!elder_pillager.hasTag("teleport_pillager")) return;

        // Delay extra na primeira vez
        const isFirstTime = !elder_pillager.hasTag("first_tp_done");
        if (isFirstTime) {
            elder_pillager.addTag("first_tp_done");

            system.runTimeout(() => {
            });
            return;
        }

        // Teleporte normal
        const loc = elder_pillager.location;
        const nearbyPlayers = dimension.getPlayers({ location: loc, maxDistance: 20 });
        if (nearbyPlayers.length === 0) return;

        const player = nearbyPlayers[0];
        const dx = loc.x - player.location.x;
        const dz = loc.z - player.location.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length === 0) return;

        const dirX = dx / length;
        const dirZ = dz / length;

        const distance = 15 + Math.random() * 10;
        const offsetX = Math.floor(dirX * distance);
        const offsetZ = Math.floor(dirZ * distance);

        const baseX = Math.floor(loc.x + offsetX);
        const baseZ = Math.floor(loc.z + offsetZ);
        let targetY = Math.floor(loc.y);

        let foundAir = false;
        const maxAttempts = 10;
        let attempts = 0;

        while (!foundAir && attempts < maxAttempts) {
            const block = dimension.getBlock({ x: baseX, y: targetY, z: baseZ });
            if (block && block.typeId === "minecraft:air") {
                foundAir = true;
                break;
            }
            targetY++;
            attempts++;
        }

        if (foundAir) {
            elder_pillager.runCommandAsync(`effect @s slow_falling 3 0 true`);
            elder_pillager.runCommandAsync(`effect @s regeneration 3 0 false`);

            system.runTimeout(async () => {
                elder_pillager.runCommandAsync(`event entity @s ecbl_bs:event_elder_pillager_animation_teleport_on`);
                await delay(0.5);
                elder_pillager.runCommandAsync(`playanimation @s animation.ecbl_bs.elder_pillager_teleport_in`);
                elder_pillager.runCommandAsync(`playsound mob.ecbl_bs.elder_pillager.teleport @a[r=10]`);
                await delay(10);

                elder_pillager.runCommandAsync(`tp @s ${baseX} ${targetY} ${baseZ}`);
                elder_pillager.runCommandAsync(`event entity @s ecbl_bs:event_elder_pillager_animation_teleport_off`);

                for (let i = 0; i < 8; i++) {
                    await elder_pillager.runCommandAsync(`particle ecbl_bs:elder_pillager_teleport ~~1~`);
                }

                const healthComp = elder_pillager.getComponent("health");
                if (healthComp) {
                    const currentHealth = Math.floor(healthComp.currentValue);

                    if (currentHealth >= 12) {
                        // Remove a tag para que o próximo teleporte tenha delay de novo
                        elder_pillager.removeTag("first_tp_done");
                        elder_pillager.runCommandAsync(`event entity @s ecbl_bs:event_elder_pillager_teleport_off`);
                    }
                }
            });
        }
    });
}, 60);

// Todos os Illagers conhecidos + seus Illagers customizados
const allowedIllagerIds = [
    "minecraft:evocation_illager",
    "minecraft:pillager",
    "minecraft:vindicator",
    "minecraft:ravager",
    "ecbl_bs:elder_pillager",
    "ecbl_bs:mace_pillager",
    "ecbl_bs:illager_pirate",
    "minecraft:vex",
];

// Intervalo de 5 segundos (100 ticks)
system.runInterval(() => {
    const dimension = world.getDimension("overworld");
    const elderPillagers = dimension.getEntities({ type: "ecbl_bs:elder_pillager" });

    elderPillagers.forEach(elder => {
        const pos = elder.location;

        const nearbyEntities = dimension.getEntities({
            location: pos,
            maxDistance: 20
        });

        nearbyEntities.forEach(entity => {
            const id = entity.typeId;

            if (allowedIllagerIds.includes(id)) {
                entity.runCommandAsync(`effect @s regeneration 3 0 false`);
                entity.runCommandAsync(`particle ecbl_bs:heal_heart ~ ~1 ~`);
            }
        });

        // Som do mago lançando magia
        elder.runCommandAsync(`playsound mob.evocation_illager.cast_spell @a[r=20]`);
    });
}, 200);


const notAllowed = [
    "ecbl_bs:imp"
];

world.afterEvents.entityHurt.subscribe((event) => {
    const attacker = event.damageSource.damagingEntity;
    const target = event.hurtEntity;

    if (!attacker || !target) return;

    if (
        attacker.typeId === "ecbl_bs:elder_pillager" &&
        !notAllowed.includes(target.typeId)
    ) {
        target.addEffect("minecraft:slowness", 200);
        target.addEffect("minecraft:weakness", 200);
        target.playSound('mob.ecbl_bs.elder_pillager.celebrate')
    }
});


world.afterEvents.entityHurt.subscribe((event) => {
    const attacker = event.damageSource.damagingEntity;
    const target = event.hurtEntity;

    if (!attacker || !target) return;

    if (
        attacker.typeId === "ecbl_bs:elder_magic" &&
        !notAllowed.includes(target.typeId)
    ) {
        target.addEffect("minecraft:slowness", 200);
        target.addEffect("minecraft:weakness", 200);
        target.playSound('mob.ecbl_bs.elder_pillager.celebrate')
    }
});

system.runInterval(() => {
    const dimension = world.getDimension("overworld");
    const elder_pillagerEntities = dimension.getEntities({ type: "ecbl_bs:elder_magic" });

    elder_pillagerEntities.forEach(elder_pillager => {

        elder_pillager.runCommandAsync(`particle ecbl_bs:elder_pillager_staff ~~~`);

    })
});

system.runInterval(() => {
    const dimension = world.getDimension("overworld");
    const elder_pillagerEntities = dimension.getEntities({ type: "ecbl_bs:elder_magic" });

    elder_pillagerEntities.forEach(elder_pillager => {

        elder_pillager.runCommandAsync(`particle ecbl_bs:elder_pillager_staff ~~~`);

    })
});