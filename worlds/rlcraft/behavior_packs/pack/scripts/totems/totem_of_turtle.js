import { world, system, ItemStack, EquipmentSlot, ItemLockMode, EntityComponentTypes } from "@minecraft/server"

world.afterEvents.entityHitBlock.subscribe((event) => {
    if (event.hitBlock.typeId === "ecbl_bs:totem_of_turtle") {

        event.damagingEntity.runCommand(`setblock ${event.hitBlock.location.x} ${event.hitBlock.location.y} ${event.hitBlock.location.z} air`);
        event.damagingEntity.runCommand(`particle ecbl_bs:turtle_totem_impact ${event.hitBlock.location.x} ${event.hitBlock.location.y + 1} ${event.hitBlock.location.z}`);

        event.hitBlock.dimension.spawnItem(new ItemStack('ecbl_bs:totem_of_turtle_item', 1), {
            x: event.hitBlock.location.x + 0.5,
            y: event.hitBlock.location.y + 0.5,
            z: event.hitBlock.location.z + 0.5
        });
    }
});

// Função auxiliar para simular atraso
function delay(ms) {
    return new Promise(resolve => system.runTimeout(resolve, ms));
}

world.beforeEvents.worldInitialize.subscribe((event) => {

    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:totem_of_turtle_particles', new TotemParticles())

})

let ticks = 0

class TotemParticles {
  onTick(data) {
    const { x, y, z } = data.block;
    const dim = data.block.dimension;

    dim.runCommand(`particle ecbl_bs:turtle_statue_1 ${x} ${y} ${z}`);
    dim.runCommand(`particle ecbl_bs:turtle_statue_2 ${x} ${y + 0.3} ${z}`);
    //dim.runCommand(`say ${ticks}`);

    ticks++;
    
    if (ticks == 5) {
      dim.runCommand(`playsound mob.ecbl_bs.statue.holy_idle @a[r=10,x=${x},y=${y},z=${z}] ${x} ${y} ${z} 0.5`);

      ticks = 0

    }
  }
}

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, block } = ev;
    const dimension = player.dimension;
    const blockPos = block.location;

    if (block.typeId === 'ecbl_bs:totem_of_turtle') {
        system.run(() => {
            // Remove o bloco
            dimension.runCommand(`setblock ${blockPos.x} ${blockPos.y} ${blockPos.z} air`);
            dimension.runCommand(`particle ecbl_bs:turtle_totem_impact ${blockPos.x} ${blockPos.y + 1} ${blockPos.z}`);

            // Cria o item de totem
            const totem = new ItemStack('ecbl_bs:totem_of_turtle_item', 1);

            // Spawna o item no local
            dimension.spawnItem(totem, {
                x: blockPos.x + 0.5,
                y: blockPos.y + 0.5,
                z: blockPos.z + 0.5
            });
        });
    }
});

/////////////////////////////////////////////////////////

// Configurações
const TEMP_TAG_turtle = "has_turtle_totem";
const LOCKED_TAG_turtle = "had_turtle_totem";
const TOTEM_ID_turtle = "ecbl_bs:totem_of_turtle_item";
const EFFECT_DURATION_TICKS_turtle = 15 * 20; // 15 segundos
const activeTurtlePlayers = new Map();
const tagRemovalDelays = new Map();
const deathLocations = new Map();

system.runInterval(() => {
    for (const player of world.getPlayers()) {

        const mainhand = player.getEquipment(EquipmentSlot.Mainhand);
        const offhand = player.getEquipment(EquipmentSlot.Offhand);

        // Verifica se o totem está em algum dos slots
        const totemNaMain = mainhand && mainhand.typeId === TOTEM_ID_turtle;
        const totemNaOff = offhand && offhand.typeId === TOTEM_ID_turtle;

        if (totemNaMain || totemNaOff) {
            // Atualiza as tags conforme está no slot correto
            if (totemNaMain) {
                player.addTag("totem_mainhand_turtle");
                player.addTag(TEMP_TAG_turtle);

                player.removeTag("totem_offhand_turtle");
            }
            if (totemNaOff) {
                player.addTag("totem_offhand_turtle");
                player.addTag(TEMP_TAG_turtle);

                player.removeTag("totem_mainhand_turtle");
            }
        } else {
            system.runTimeout(() => {

                // Se não houver totem em nenhum slot, remove as tags imediatamente
                player.removeTag("totem_mainhand_turtle");
                player.removeTag(TEMP_TAG_turtle);
                player.removeTag("totem_offhand_turtle");
            }, 1)
        }
    }
});


// Função para lidar com o spawn do jogador com totem
function handleTurtleTotemSpawn_no_death(player) {
    if (!player.hasTag(LOCKED_TAG_turtle)) return;

    activeTurtlePlayers.set(player.id, EFFECT_DURATION_TICKS_turtle);

    delay(1).then(() => {
        player.runCommand(`playsound random.totem @s`);
        player.runCommand(`gamerule doImmediateRespawn false`);

        // SUMMON entidade do escudo e marca com tag do player
        player.runCommand(`summon ecbl_bs:turtle_shield`);
        player.runCommand(`tag @e[type=ecbl_bs:turtle_shield,c=1,r=2,x=~,y=~,z=~] add "${player.name}"`);

        player.runCommand(`particle ecbl_bs:turtle_totem_1 ~~1.5~`);
        player.runCommand(`particle ecbl_bs:turtle_totem_impact ~~1.5~`);

        player.runCommand(`effect @s absorption 5 2`);
        player.runCommand(`effect @s resistance 15 4`);
        player.runCommand(`effect @s regeneration 15 0`);

    });
}


// Função para lidar com o spawn do jogador com totem
function handleTurtleTotemSpawn(player) {
    if (!player.hasTag(LOCKED_TAG_turtle)) return;

    activeTurtlePlayers.set(player.id, EFFECT_DURATION_TICKS_turtle);

    if (deathLocations.has(player.id)) {
        const { x, y, z } = deathLocations.get(player.id);
        system.runTimeout(() => {
            player.runCommand(`tp @s ${x} ${y} ${z}`);
        }, 1);
        deathLocations.delete(player.id);
    }

    delay(1).then(() => {
        player.runCommand(`playsound random.totem @s`);
        player.runCommand(`gamerule doImmediateRespawn false`);

        // SUMMON entidade do escudo e marca com tag do player
        player.runCommand(`summon ecbl_bs:turtle_shield`);
        player.runCommand(`tag @e[type=ecbl_bs:turtle_shield,c=1,r=2,x=~,y=~,z=~] add "${player.name}"`);

        player.runCommand(`particle ecbl_bs:turtle_totem_1 ~~1.5~`);
        player.runCommand(`particle ecbl_bs:turtle_totem_impact ~~1.5~`);

        player.runCommand(`effect @s absorption 5 2`);
        player.runCommand(`effect @s resistance 15 4`);


        // Dá os itens
        giveTotemItems(player);

        // Remove os itens depois de um tempo
        system.runTimeout(() => {
            clearTotemItems(player);
        }, 55); // Cerca de 2.75 segundos depois
    });
}

// Chamar a função no player spawn
world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;
    handleTurtleTotemSpawn(player);
});

// Intervalo para verificar a saúde dos jogadores e os efeitos negativos
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        // Verifica se o jogador tem a tag TEMP_TAG_turtle
        if (player.hasTag(TEMP_TAG_turtle)) {
            // Obtém o componente de saúde do jogador
            const healthComponent = player.getComponent("health");
            if (healthComponent) {
                const currentHealth = healthComponent.currentValue;

                // Verifica as condições para ativar a função
                if (currentHealth < 4) {
                    totemTurtleFunction(player);
                }
            }
        }
    }
}, 5); // Executa a cada 5 ticks

function totemTurtleFunction(player) {

    if (player.hasTag("totem_mainhand_turtle")) {
        handleTotemMainhandActivation(player);
    } else if (player.hasTag("totem_offhand_turtle")) {
        handleTotemOffhandActivation(player);
    }
    player.removeTag(TEMP_TAG_turtle);
    player.addTag(LOCKED_TAG_turtle);
    activeTurtlePlayers.set(player.id, EFFECT_DURATION_TICKS_turtle);
    handleTurtleTotemSpawn_no_death(player);
}

const itemsToRemove = [
  "ecbl_bs:totem_of_turtle_item"
];

// Pega a dimensão padrão (ex: overworld)
const overworld = world.getDimension("overworld");

function removeItems() {
  const entities = overworld.getEntities();

  for (const entity of entities) {
    if (entity.typeId === "minecraft:item") {
      const itemComp = entity.getComponent("minecraft:item");
      if (!itemComp) continue;

      const itemType = itemComp.itemStack.typeId;

      if (itemsToRemove.includes(itemType)) {
        entity.remove();
        break;
      }
    }
  }
}

world.afterEvents.entityDie.subscribe(ev => {
    const player = ev.deadEntity;
    if (!player || player.typeId !== "minecraft:player") return;
    if (!player.hasTag(TEMP_TAG_turtle)) return;

    // Armazena a localização de morte do jogador
    const { x, y, z } = player.location;
    deathLocations.set(player.id, { x, y, z });

    player.removeTag(TEMP_TAG_turtle);
    player.addTag(LOCKED_TAG_turtle);
    activeTurtlePlayers.set(player.id, EFFECT_DURATION_TICKS_turtle);

    // Feedback de ativação do totem
    player.runCommand(`gamerule doImmediateRespawn true`);
        removeItems()

});


const PROJECTILES_EFFECTS = {
    "minecraft:skeleton": "null",
    "minecraft:arrow": "null",
    "minecraft:snowball": "null",
    "minecraft:egg": "null",
    "minecraft:fireball": "null",
    "minecraft:pillager": "null",
    "minecraft:bogged": "poison",
    "minecraft:player": "null",
    "minecraft:stray": "slowness",
    "minecraft:shulker": "levitation",
    "minecraft:blaze": "null",
    "minecraft:breeze": "null",
    "minecraft:llama": "null",
    "minecraft:trader_llama": "null",
    "ecbl_bs:lava_spirit": "null"
};

world.afterEvents.entityHurt.subscribe((event) => {
    const victim = event.hurtEntity;
    if (!victim || victim.typeId !== "minecraft:player") return;
    if (!victim.hasTag(LOCKED_TAG_turtle)) return;

    // Captura a posição do jogador antes do knockback
    const pos = victim.location;
    const healthComponent = victim.getComponent("health");
    const currentHealth = healthComponent.currentValue;
    const originalDamage = event.damage;

    // Verifica se o dano veio de uma entidade que deve ser bloqueada
    const damageSource = event.damageSource;
    const attacker = damageSource?.damagingEntity;

    if (attacker && PROJECTILES_EFFECTS[attacker.typeId] !== undefined) {
        const effectToClear = PROJECTILES_EFFECTS[attacker.typeId];

        if (effectToClear !== "null") {
            victim.runCommand(`effect @s clear ${effectToClear}`);
        }

        // Restaura toda a vida perdida causada pelo ataque
        system.run(() => {
            victim.teleport(pos, { checkForBlocks: false });
        });
        victim.runCommand(`playsound item.trident.hit_ground @s ~~~ 1 0.6`);
        victim.runCommand(`particle ecbl_bs:turtle_totem_impact ~~1.5~`);
        victim.runCommand(`particle ecbl_bs:turtle_totem_1 ~~1.5~`);
        return; // Sai do código antes de aplicar qualquer outra lógica de dano
    }
    victim.runCommand(`playsound item.trident.hit_ground @s ~~~ 1 0.6`);
    victim.runCommand(`particle ecbl_bs:turtle_totem_impact ~~1.5~`);
    victim.runCommand(`particle ecbl_bs:turtle_totem_1 ~~1.5~`);

    // Anula o knockback teleportando de volta para a posição original
    system.run(() => {
        victim.teleport(pos, { checkForBlocks: false });
    });
});
activeTurtlePlayers
// Contador do efeito
system.runInterval(() => {
    for (const [playerId, ticksLeft] of activeTurtlePlayers.entries()) {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (!player) {
            activeTurtlePlayers.delete(playerId);
            continue;
        }

        if (ticksLeft <= 0) {
            player.removeTag(LOCKED_TAG_turtle);
            activeTurtlePlayers.delete(playerId);
            player.runCommand(`event entity @e[type=ecbl_bs:turtle_shield,r=1,x=~,y=~,z=~] ecbl_bs:shield_despawn`);
        } else {
            activeTurtlePlayers.set(playerId, ticksLeft - 1);
        }
    }
}, 1);

system.runInterval(() => {
    for (const [playerId, _] of activeTurtlePlayers.entries()) {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (!player) continue;

        // Executa partículas enquanto o efeito estiver ativo
        player.runCommand(`particle ecbl_bs:turtle_totem_2 ~ ~1.5 ~`);

    }
}, 2);



system.runInterval(() => {
    for (const [playerId, _] of activeTurtlePlayers.entries()) {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (!player) continue;

        // Teleportar a entidade "turtle_shield" com o nome do jogador
        player.runCommand(`tp @e[type=ecbl_bs:turtle_shield,tag="${player.name}"] ~~0.5~`);
    }
});




////////////////////

const PROJECTILE_TYPES = [
    "minecraft:arrow",
    "minecraft:snowball",
    "minecraft:fireball",
    "minecraft:small_fireball",
    "minecraft:llama_spit",
    "minecraft:thrown_trident",
    "minecraft:shulker_bullet"
];

function executeParticleEffect(entity, particleName, times, interval) {
    let count = 0;
    function loop() {
        if (!entity || !entity.isValid()) return;
        if (count < times) {
            try {
                entity.runCommandAsync(`particle ${particleName} ~~~`);
            } catch (error) {
                console.error("Erro ao executar partícula:", error);
                return;
            }
            count++;
            system.runTimeout(loop, interval);
        }
    }
    loop();
}

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.hasTag(LOCKED_TAG_turtle)) {

            const playerLoc = player.location;


            for (const projType of PROJECTILE_TYPES) {
                player.runCommand(`kill @e[type=${projType},r=2,x=${player.location.x},y=${player.location.y},z=${player.location.z}]`);
            }

            // Busca todos os projéteis próximos (até 3 blocos)
            const nearby = player.dimension.getEntities({
                location: playerLoc,
                maxDistance: 3
            });

            for (const proj of nearby) {
                // Filtra apenas projéteis definidos
                if (!PROJECTILE_TYPES.includes(proj.typeId)) continue;
                // Se já recebeu impulso, ignora
                if (proj.hasTag("impulse_apply")) continue;

                const projLoc = proj.location;
                let dx = projLoc.x - playerLoc.x;
                let dy = projLoc.y - playerLoc.y;
                let dz = projLoc.z - playerLoc.z;
                const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (len === 0) continue;

                // Normalizar direção
                dx /= len; dy /= len; dz /= len;

                // Se estiver muito próximo, aplica impulso forte
                const closeThreshold = 1.0;
                if (len < closeThreshold) {
                    proj.addTag("impulse_apply");
                    const closeStrength = 8.0;  // impulso bem forte
                    proj.applyImpulse({
                        x: dx * closeStrength,
                        y: dy * closeStrength + 0.5,
                        z: dz * closeStrength
                    });
                    executeParticleEffect(proj, "ecbl_bs:turtle_statue_1", 60, 1);
                    player.runCommand(`playsound item.trident.hit_ground @s ~~~ 1 0.6`);
                    continue;
                }

                // Repulsão normal
                proj.addTag("impulse_apply");
                const impulseStrength = 3.0;
                proj.applyImpulse({
                    x: dx * impulseStrength,
                    y: dy + 0.2,
                    z: dz * impulseStrength
                });

                // Efeito de partículas e som
                executeParticleEffect(proj, "ecbl_bs:turtle_statue_1", 40, 1);
                player.runCommand(`playsound item.trident.hit_ground @s ~~~ 1 0.6`);
            }
        }
    }
});


// Função para dar os itens ao jogador
function giveTotemItems(player) {
    player.addTag("lock_item_replacer")

    player.runCommand(`clear @s ecbl_bs:totem_of_turtle_item 0 1`);
    const totem = new ItemStack("ecbl_bs:totem_of_turtle_animation", 1);
    totem.lockMode = ItemLockMode.slot;

    // Usa o componente de equipamento para aplicar o item na offhand
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    equip.setEquipment(EquipmentSlot.Offhand, totem);
}

// Função para limpar os itens do jogador
function clearTotemItems(player) {
    player.removeTag("lock_item_replacer")

    player.runCommand(`replaceitem entity @s slot.weapon.offhand 0 air`);

}

///

function handleTotemMainhandActivation(player) {
    player.addTag("lock_item_replacer");

    const totem = new ItemStack("ecbl_bs:totem_of_turtle_animation", 1);
    totem.lockMode = ItemLockMode.slot;

    // Usa o componente Equippable para equipar na mão principal
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    equip.setEquipment(EquipmentSlot.Mainhand, totem);

    player.runCommand(`playsound random.totem @s`);

    delay(55).then(() => {
        const current = player.getEquipment(EquipmentSlot.Mainhand);
        if (current && current.typeId === "ecbl_bs:totem_of_turtle_animation") {
            equip.setEquipment(EquipmentSlot.Mainhand, undefined);
        }

        player.removeTag("lock_item_replacer");
    });
}


function handleTotemOffhandActivation(player) {
    player.addTag("lock_item_replacer");

    const totem = new ItemStack("ecbl_bs:totem_of_turtle_animation", 1);
    totem.lockMode = ItemLockMode.slot;

    // Usa o componente de equipamento para aplicar o item na offhand
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    equip.setEquipment(EquipmentSlot.Offhand, totem);

    player.runCommand(`playsound random.totem @s`);

    delay(55).then(() => {
        const current = player.getEquipment(EquipmentSlot.Offhand);
        if (current && current.typeId === "ecbl_bs:totem_of_turtle_animation") {
            equip.setEquipment(EquipmentSlot.Offhand, undefined);
        }

        player.removeTag("lock_item_replacer");
    });
}