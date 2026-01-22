import { world, system } from "@minecraft/server";

// Função auxiliar para simular atraso
function delay(ms) {
    return new Promise(resolve => system.runTimeout(resolve, ms));
}

// Evento que é acionado quando uma entidade é atingida por outra entidade
world.afterEvents.entityHitEntity.subscribe(async (data) => {
    const { damagingEntity, hitEntity } = data;

    // Verifica se quem causou o dano é um jogador
    if (damagingEntity.typeId !== "minecraft:player") return;

    // Verifica se a entidade atingida é do tipo "ecbl_bs:dead_lying_skeleton" ou "ecbl_bs:sitting_skeleton"
    if (hitEntity.typeId === "ecbl_bs:dead_lying_skeleton" || hitEntity.typeId === "ecbl_bs:sitting_skeleton") {

        // Array com as tags correspondentes a cada hit
        const hitTags = ['hit1', 'hit2', 'hit3', 'hit4', 'hit5'];

        // Inicializa a variável para o próximo hit
        let nextHitIndex = -1;

        // Determina qual é o próximo hit baseado nas tags atuais
        for (let i = 0; i < hitTags.length; i++) {
            if (!hitEntity.hasTag(hitTags[i])) {
                nextHitIndex = i;
                break;
            }
        }

        // Se nextHitIndex é válido, significa que ainda não atingiu o quinto hit
        if (nextHitIndex !== -1) { 
            const nextHitTag = hitTags[nextHitIndex];
            hitEntity.addTag(nextHitTag);

            const eventNumber = 5 - nextHitIndex;
            hitEntity.runCommand(`event entity @s ecbl_bs:hit_${eventNumber}`);
            hitEntity.runCommand(`playanimation @s animation.ecbl_bs.lying_skeleton.hit`);
            hitEntity.runCommand(`structure load "ecbl_bs/bone_drop" ~~1~`);
            hitEntity.runCommand(`particle minecraft:basic_smoke_particle ~~~`);
            hitEntity.runCommand(`playsound mob.skeleton.hurt @a[r=10]`);
        } else {
            // Se for o último hit, remove a entidade normalmente
            hitEntity.runCommand(`structure load "ecbl_bs/bone_drop" ~~1~`);
            hitEntity.runCommand(`particle minecraft:basic_smoke_particle ~~~`);
            hitEntity.runCommand(`playsound mob.skeleton.hurt @a[r=10]`);
            hitEntity.runCommand(`tp @s ~~-70~`);
            await delay(1000);
            hitEntity.runCommand(`kill @s`);
            return;
        }
    }
});