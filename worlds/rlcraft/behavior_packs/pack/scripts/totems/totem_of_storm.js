import { world, system, ItemStack, EquipmentSlot, ItemLockMode, EntityComponentTypes } from "@minecraft/server"

world.afterEvents.entityHitBlock.subscribe((event) => {
  if (event.hitBlock.typeId === "ecbl_bs:totem_of_storm") {

    event.damagingEntity.runCommand(`setblock ${event.hitBlock.location.x} ${event.hitBlock.location.y} ${event.hitBlock.location.z} air`);
    event.damagingEntity.runCommand(`particle ecbl_bs:thunder_impact ${event.hitBlock.location.x} ${event.hitBlock.location.y} ${event.hitBlock.location.z}`);
    event.damagingEntity.runCommand(`particle ecbl_bs:thunder_impact_2 ${event.hitBlock.location.x} ${event.hitBlock.location.y} ${event.hitBlock.location.z}`);

    event.hitBlock.dimension.spawnItem(new ItemStack('ecbl_bs:totem_of_thunderstorm_item', 1), {
      x: event.hitBlock.location.x + 0.5,
      y: event.hitBlock.location.y + 0.5,
      z: event.hitBlock.location.z + 0.5
    });
  }
});

// Registra o componente de partículas para o totem
world.beforeEvents.worldInitialize.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:totem_of_storm_particles', new TotemParticles())
})

let ticks = 0

class TotemParticles {
  onTick(data) {
    const { x, y, z } = data.block;
    const dim = data.block.dimension;

    dim.runCommand(`particle ecbl_bs:thunder_statue_1 ${x} ${y} ${z}`);
    dim.runCommand(`particle ecbl_bs:thunder_statue_2 ${x} ${y + 0.3} ${z}`);
    //dim.runCommand(`say ${ticks}`);

    ticks++;
    
    if (ticks == 5) {
      dim.runCommand(`playsound mob.ecbl_bs.statue.holy_idle @a[r=10,x=${x},y=${y},z=${z}] ${x} ${y} ${z} 0.5`);

      ticks = 0

    }
  }
}

// Quando o jogador interage com o bloco do totem (deixar o totem) ele é removido e o item é spawnado
world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
  const { player, block } = ev
  const dimension = player.dimension
  const blockPos = block.location

  if (block.typeId === 'ecbl_bs:totem_of_storm') {
    system.run(() => {
      // Remove o bloco do totem
      dimension.runCommand(`setblock ${blockPos.x} ${blockPos.y} ${blockPos.z} air`)
      dimension.runCommand(`particle ecbl_bs:thunder_impact  ${blockPos.x} ${blockPos.y} ${blockPos.z}`);
      dimension.runCommand(`particle ecbl_bs:thunder_impact_2  ${blockPos.x} ${blockPos.y} ${blockPos.z}`);

      // Cria o item de totem
      const totem = new ItemStack('ecbl_bs:totem_of_thunderstorm_item', 1)

      // Spawna o item no centro do bloco
      dimension.spawnItem(totem, {
        x: blockPos.x + 0.5,
        y: blockPos.y + 0.5,
        z: blockPos.z + 0.5
      })
    })
  }
})


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONFIGURAÇÕES DO EFEITO DE TROVÃO
const IGNORED_ENTITY_TYPES = new Set([
  "minecraft:item",
  "minecraft:npc",
  "minecraft:armor_stand",
  "minecraft:arrow",
  "minecraft:experience_orb",
  "minecraft:player",
  "minecraft:leash_knot",
]);

const EFFECT_DURATION_TICKS = 10 * 10; // 10 segundos
const RADIUS = 11;
const KNOCKBACK_STRENGTH = 3;
const KNOCKBACK_HEIGHT = 0.6;
const KNOCKBACK_TRIGGER_COUNT = 20;

const TEMP_TAG_thunderstorm = "has_storm_totem";
const LOCKED_TAG_thunderstorm = "had_storm_totem";
const TOTEM_ID_thunderstorm = "ecbl_bs:totem_of_thunderstorm_item";

const tagRemovalDelays = new Map();
const playerDeathData = {};
const activePlayers = new Map();

system.runInterval(() => {
  for (const player of world.getPlayers()) {

    const mainhand = player.getEquipment(EquipmentSlot.Mainhand);
    const offhand = player.getEquipment(EquipmentSlot.Offhand);

    // Verifica se o totem está em algum dos slots
    const totemNaMain = mainhand && mainhand.typeId === TOTEM_ID_thunderstorm;
    const totemNaOff = offhand && offhand.typeId === TOTEM_ID_thunderstorm;

    if (totemNaMain || totemNaOff) {
      // Atualiza as tags conforme está no slot correto
      if (totemNaMain) {
        player.addTag("totem_mainhand_thunderstorm");
        player.addTag(TEMP_TAG_thunderstorm);

        player.removeTag("totem_offhand_thunderstorm");
      }
      if (totemNaOff) {
        player.addTag("totem_offhand_thunderstorm");
        player.addTag(TEMP_TAG_thunderstorm);

        player.removeTag("totem_mainhand_thunderstorm");
      }
    } else {
      system.runTimeout(() => {

        // Se não houver totem em nenhum slot, remove as tags imediatamente
        player.removeTag("totem_mainhand_thunderstorm");
        player.removeTag(TEMP_TAG_thunderstorm);
        player.removeTag("totem_offhand_thunderstorm");
      }, 1)
    }
  }
});

const itemsToRemove = [
  "ecbl_bs:totem_of_thunderstorm_item"
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

world.afterEvents.entityDie.subscribe((ev) => {
  const player = ev.deadEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  if (!player.hasTag(TEMP_TAG_thunderstorm)) return;

  const name = player.name;
  const dimension = player.dimension;
  const x = Math.floor(player.location.x);
  const y = Math.floor(player.location.y);
  const z = Math.floor(player.location.z);

  playerDeathData[name] = { x, y, z, dimensionId: dimension.id };

  player.runCommand(`gamerule doImmediateRespawn true`);
  player.removeTag(TEMP_TAG_thunderstorm);
        removeItems()

});

// Intervalo para verificar a saúde dos jogadores e os efeitos negativos
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    // Verifica se o jogador tem a tag TEMP_TAG_thunderstorm
    if (player.hasTag(TEMP_TAG_thunderstorm)) {
      // Obtém o componente de saúde do jogador
      const healthComponent = player.getComponent("health");
      if (healthComponent) {
        const currentHealth = healthComponent.currentValue;

        // Verifica as condições para ativar a função
        if (currentHealth < 10) {

          activePlayers.set(player.id, EFFECT_DURATION_TICKS);
          particles(player);

          if (player.hasTag("totem_mainhand_thunderstorm")) {
            handleTotemMainhandActivation(player);
          } else if (player.hasTag("totem_offhand_thunderstorm")) {
            handleTotemOffhandActivation(player);
          }

        }
      }
    }
  }
}, 5); // Executa a cada 5 ticks

world.afterEvents.playerSpawn.subscribe((ev) => {
  const player = ev.player;
  const name = player.name;

  if (!(name in playerDeathData)) return;
  const { x, y, z, dimensionId } = playerDeathData[name];
  delete playerDeathData[name];

  system.runTimeout(() => {
    const dimension = world.getDimension(dimensionId);
    player.teleport({ x, y, z }, { dimension });


    activePlayers.set(player.id, EFFECT_DURATION_TICKS);

    system.runTimeout(() => {
      //player.runCommand(`say ⚡ O poder do Totem da Tempestade foi liberado!`);
      particles(player);


      player.runCommand(`gamerule doImmediateRespawn false`);
      player.runCommand(`clear @s ecbl_bs:totem_of_thunderstorm_item 0 1`);

      // Dá os itens ao jogador
      handleTotemOffhandActivation(player);


    }, 2);
  }, 1);
});

const knockbackCounter = new Map();

system.runInterval(() => {
  for (const [playerId, ticksLeft] of activePlayers.entries()) {
    const player = world.getPlayers().find(p => p.id === playerId);
    if (!player) {
      activePlayers.delete(playerId);
      continue;
    }

    const playerPos = player.location;
    const dimension = player.dimension;
    const mobs = dimension.getEntities({
      location: playerPos,
      maxDistance: RADIUS,
      excludePlayers: true,
    });

    for (const entity of mobs) {
      const typeId = entity.typeId.toLowerCase();
      if (IGNORED_ENTITY_TYPES.has(typeId)) continue;

      const dx = entity.location.x - playerPos.x;
      const dz = entity.location.z - playerPos.z;
      const magnitude = Math.sqrt(dx * dx + dz * dz);
      if (magnitude === 0) continue;

      const dirX = dx / magnitude;
      const dirZ = dz / magnitude;

      try {
        entity.applyKnockback(dirX, dirZ, KNOCKBACK_STRENGTH, KNOCKBACK_HEIGHT);
        player.runCommand(`effect @e[rm=1,r=12] slowness 10 250 false`);

      } catch (e) {
        console.warn(`Erro ao aplicar knockback em ${typeId}: ${e}`);
      }

      const count = knockbackCounter.get(playerId) || 0;
      if (count + 1 >= KNOCKBACK_TRIGGER_COUNT) {
        player.runCommand(`particle ecbl_bs:impact_ring`);
        player.runCommand(`particle ecbl_bs:thunder_impact ~~1~`);
        player.runCommand(`particle ecbl_bs:thunder_impact_2 ~~1~`);
        player.runCommand(`particle ecbl_bs:lightning ~~1~`);

        knockbackCounter.set(playerId, 0);
      } else {
        knockbackCounter.set(playerId, count + 1);
      }
    }

    if (ticksLeft <= 0) {
      //player.runCommand(`say ⚡ Efeito do Totem do Trovão terminou!`);
      player.runCommand(`tag @s remove storm_particles`);
      player.runCommand(`weather clear`);
      activePlayers.delete(playerId);
    } else {
      activePlayers.set(playerId, ticksLeft - 1);
    }
  }
}, 2);

// Função para dar os itens ao jogador
function giveTotemItems(player) {
  for (let i = 0; i < 9; i++) {
    player.runCommand(`replaceitem entity @s slot.hotbar ${i} ecbl_bs:totem_of_thunderstorm_animation 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
  }
}

// Função para limpar os itens do jogador
function clearTotemItems(player) {
  for (let i = 0; i < 9; i++) {
    player.runCommand(`replaceitem entity @s slot.hotbar ${i} air`);
  }
}

// Função para limpar os itens do jogador
function particles(player) {
  player.runCommand(`effect @e[rm=1,r=12] slowness 10 250 false`);
  player.runCommand(`weather thunder`);

  player.runCommand(`particle ecbl_bs:impact_ring`);

  player.runCommand(`particle ecbl_bs:lightning ~~1~`);
  player.runCommand(`particle ecbl_bs:thunder ~~1~`);
  player.runCommand(`particle ecbl_bs:thunder_impact ~~1~`);
  player.runCommand(`particle ecbl_bs:thunder_impact_2 ~~1~`);
  player.runCommand(`particle ecbl_bs:smoke ~~~`);

  player.runCommand(`playsound random.totem @s`);


  player.runCommand(`effect @s absorption ${EFFECT_DURATION_TICKS / 10} 0`);
  player.runCommand(`effect @s regeneration ${EFFECT_DURATION_TICKS / 10} 2`);
  player.runCommand(`camerashake add @s 0.1 1`);
  player.runCommand(`camerashake add @s 0.1 2`);
  player.runCommand(`camerashake add @s 0.1 3`);
  player.runCommand(`camerashake add @s 0.1 4`);
  player.runCommand(`camerashake add @s 0.1 5`);

  player.runCommand(`tag @s add storm_particles`);

}

// Intervalo para verificar a saúde dos jogadores e os efeitos negativos
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    // Verifica se o jogador tem a tag TEMP_TAG_storm
    if (player.hasTag("storm_particles")) {

      player.runCommand(`particle ecbl_bs:thunder_statue_1 ~~0.5~`);

    }
  }
}); // Executa a cada 5 ticks

// Função auxiliar para simular atraso
function delay(ms) {
  return new Promise(resolve => system.runTimeout(resolve, ms));
}

function handleTotemMainhandActivation(player) {
  player.addTag("lock_item_replacer");

  const totem = new ItemStack("ecbl_bs:totem_of_thunderstorm_animation", 1);
  totem.lockMode = ItemLockMode.slot;

  // Usa o componente Equippable para equipar na mão principal
  const equip = player.getComponent(EntityComponentTypes.Equippable);
  equip.setEquipment(EquipmentSlot.Mainhand, totem);

  player.runCommand(`playsound random.totem @s`);

  delay(55).then(() => {
    const current = player.getEquipment(EquipmentSlot.Mainhand);
    if (current && current.typeId === "ecbl_bs:totem_of_thunderstorm_animation") {
      equip.setEquipment(EquipmentSlot.Mainhand, undefined);
    }

    player.removeTag("lock_item_replacer");
  });
}


function handleTotemOffhandActivation(player) {
  player.addTag("lock_item_replacer");

  const totem = new ItemStack("ecbl_bs:totem_of_thunderstorm_animation", 1);
  totem.lockMode = ItemLockMode.slot;

  // Usa o componente de equipamento para aplicar o item na offhand
  const equip = player.getComponent(EntityComponentTypes.Equippable);
  equip.setEquipment(EquipmentSlot.Offhand, totem);

  player.runCommand(`playsound random.totem @s`);

  delay(55).then(() => {
    const current = player.getEquipment(EquipmentSlot.Offhand);
    if (current && current.typeId === "ecbl_bs:totem_of_thunderstorm_animation") {
      equip.setEquipment(EquipmentSlot.Offhand, undefined);
    }

    player.removeTag("lock_item_replacer");
  });
}
