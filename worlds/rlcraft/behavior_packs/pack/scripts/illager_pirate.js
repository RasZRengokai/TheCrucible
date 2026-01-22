import { world, system } from "@minecraft/server";

system.runInterval(() => {
    const overworld = world.getDimension("overworld");
    const pirates = overworld.getEntities({ type: "ecbl_bs:illager_pirate" });

    pirates.forEach(pirate => {
        const pirateLoc = pirate.location;

        // Verifica se existe pelo menos 1 player a até 5 blocos do pirata
        const nearbyPlayers = overworld.getPlayers({
            location: pirateLoc,
            maxDistance: 5
        });
        try {
            if (nearbyPlayers.length > 0) {
                // O próprio pirata executa a ação
                pirate.setProperty("ecbl_bs:target", 'close');
                //pirate.runCommand(`say perto`);
            } else {
                pirate.setProperty("ecbl_bs:target", 'away');
                //pirate.runCommand(`say longe`);

            }
        } catch { }
    });
}, 10);



/////////////////////////

// Map para guardar contagem de hits por entidade
const hitsMap = new Map();

world.afterEvents.entityHurt.subscribe(event => {
    const pirate = event.damageSource.damagingEntity;
    if (!pirate || pirate.typeId !== "ecbl_bs:illager_pirate") return;

    const id = pirate.id; // ID único da entidade
    let hits = hitsMap.get(id) ?? 0;
    hits++;

    //pirate.runCommand(`say hit: ${hits}`);
    pirate.runCommand(`playsound mob.ecbl_bs.pirate.celebrate @a[r=10]`)
    if (hits === 1) {
        // Primeiro ataque: attack_1
        pirate.setProperty("ecbl_bs:attack_type", "attack_1");
    } else if (hits === 2) {
        // Segundo ataque: attack_2
        pirate.setProperty("ecbl_bs:attack_type", "attack_2");

    } else if (hits === 3) {
        // Terceiro ataque: volta para attack_1 e reseta contador
        pirate.setProperty("ecbl_bs:attack_type", "attack_1");
        hits = 0;
    }

    hitsMap.set(id, hits);
});

