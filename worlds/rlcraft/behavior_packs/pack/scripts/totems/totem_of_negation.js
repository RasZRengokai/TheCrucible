import { world, system, ItemStack, EquipmentSlot, ItemLockMode, EntityComponentTypes } from "@minecraft/server";

world.afterEvents.entityHitBlock.subscribe((event) => {
  if (event.hitBlock.typeId === "ecbl_bs:totem_of_negation") {

    event.damagingEntity.runCommand(`setblock ${event.hitBlock.location.x} ${event.hitBlock.location.y} ${event.hitBlock.location.z} air`);
    event.damagingEntity.runCommand(`particle ecbl_bs:negation_totem_impact ${event.hitBlock.location.x} ${event.hitBlock.location.y + 1} ${event.hitBlock.location.z}`);

    event.hitBlock.dimension.spawnItem(new ItemStack('ecbl_bs:totem_of_negation_item', 1), {
      x: event.hitBlock.location.x + 0.5,
      y: event.hitBlock.location.y + 0.5,
      z: event.hitBlock.location.z + 0.5
    });
  }
});


// Registra o componente customizado para partículas do totem
world.beforeEvents.worldInitialize.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:totem_of_negation_particles', new TotemParticles());
});

let ticks = 0

class TotemParticles {
  onTick(data) {
    const { x, y, z } = data.block;
    const dim = data.block.dimension;

    dim.runCommand(`particle ecbl_bs:negation_statue_1 ${x} ${y} ${z}`);
    dim.runCommand(`particle ecbl_bs:negation_statue_2 ${x} ${y + 0.3} ${z}`);
    //dim.runCommand(`say ${ticks}`);

    ticks++;
    
    if (ticks == 5) {
      dim.runCommand(`playsound mob.ecbl_bs.statue.holy_idle @a[r=10,x=${x},y=${y},z=${z}] ${x} ${y} ${z} 0.5`);
      ticks = 0

    }
  }
}

// Ao interagir com o bloco baseado no totem, ele é removido e um item é solto
world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
  const { player, block } = ev;
  const dimension = player.dimension;
  const blockPos = block.location;

  if (block.typeId === 'ecbl_bs:totem_of_negation') {
    system.run(() => {
      dimension.runCommand(`setblock ${blockPos.x} ${blockPos.y} ${blockPos.z} air`);
      dimension.runCommand(`particle ecbl_bs:negation_totem_impact ${blockPos.x} ${blockPos.y + 1} ${blockPos.z}`);

      const totem = new ItemStack('ecbl_bs:totem_of_negation_item', 1);
      dimension.spawnItem(totem, {
        x: blockPos.x + 0.5,
        y: blockPos.y + 0.5,
        z: blockPos.z + 0.5
      });
    });
  }
});

const TEMP_TAG_negation = "has_negation_totem";
const TOTEM_ID_negation = "ecbl_bs:totem_of_negation_item";

system.runInterval(() => {
  for (const player of world.getPlayers()) {

    const mainhand = player.getEquipment(EquipmentSlot.Mainhand);
    const offhand = player.getEquipment(EquipmentSlot.Offhand);

    // Verifica se o totem está em algum dos slots
    const totemNaMain = mainhand && mainhand.typeId === TOTEM_ID_negation;
    const totemNaOff = offhand && offhand.typeId === TOTEM_ID_negation;

    if (totemNaMain || totemNaOff) {
      // Atualiza as tags conforme está no slot correto
      if (totemNaMain) {
        player.addTag("totem_mainhand_negation");
        player.addTag(TEMP_TAG_negation);

        player.removeTag("totem_offhand_negation");
      }
      if (totemNaOff) {
        player.addTag("totem_offhand_negation");
        player.addTag(TEMP_TAG_negation);

        player.removeTag("totem_mainhand_negation");
      }
    } else {
      system.runTimeout(() => {

        // Se não houver totem em nenhum slot, remove as tags imediatamente
        player.removeTag("totem_mainhand_negation");
        player.removeTag(TEMP_TAG_negation);
        player.removeTag("totem_offhand_negation");
      }, 1)
    }
  }
});


const itemsToRemove = [
  "ecbl_bs:totem_of_negation_item"
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
  const { deadEntity } = ev;


  // Verifica se a entidade morta é um jogador
  if (deadEntity.typeId === "minecraft:player") {
    const player = deadEntity;
    const name = player.name;
    const dimension = player.dimension;

    const x = Math.floor(player.location.x);
    const y = Math.floor(player.location.y);
    const z = Math.floor(player.location.z);



    if (player.hasTag(TEMP_TAG_negation)) {

      player.runCommand(`gamerule doImmediateRespawn true`);

      system.runTimeout(() => {
        //player.runCommand(`say Eu ainda sinto o poder do Totem...`);
        player.runCommand(`gamerule doImmediateRespawn false`);
        //player.runCommand(`tp @s @e[type=ecbl_bs:gravestone_entity,name=${name}]`);

        system.runTimeout(() => {
          player.runCommand(`playsound random.totem @s`);
        }, 1)


        // Método 1: Remove diretamente 1 totem do inventário (seguro com keepInventory)
        player.runCommand(`clear @s ecbl_bs:totem_of_negation_item 0 1`);

        removeItems()
        totemNegationFunction(player);
      }, 20); // Espera o respawn
    }
  }
});



////////////////////

// Lista de efeitos negativos com nomes identificadores como strings
const NEGATIVE_EFFECTS = [
  "minecraft:slowness",
  "minecraft:mining_fatigue",
  "minecraft:weakness",
  "minecraft:poison",
  "minecraft:wither",
  "minecraft:blindness",
  "minecraft:hunger"
];

// Função para verificar se o jogador possui 3 ou mais efeitos negativos
function hasNegativeEffects(player) {
  let negativeEffectCount = 0;

  for (const effectId of NEGATIVE_EFFECTS) {
    const effect = player.getEffect(effectId); // Usando 'effectId' como string
    if (effect) {
      negativeEffectCount++;
      if (negativeEffectCount >= 3) {
        return true; // Retorna true assim que 3 efeitos negativos forem encontrados
      }
    }
  }

  return false; // Retorna false caso não tenha 3 ou mais efeitos negativos
}

// Intervalo para verificar a saúde dos jogadores e os efeitos negativos
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    // Verifica se o jogador tem a tag TEMP_TAG_negation
    if (player.hasTag(TEMP_TAG_negation)) {
      // Obtém o componente de saúde do jogador
      const healthComponent = player.getComponent("health");
      if (healthComponent) {
        const currentHealth = healthComponent.currentValue;

        // Verifica as condições para ativar a função
        if (currentHealth < 7 || hasNegativeEffects(player)) {
          totemNegationFunction(player); // Ativa a função se qualquer condição for atendida
        }
      }
    }
  }
}, 5); // Executa a cada 5 ticks

/* CONFIGURAÇÕES */
const REGENERATION_DURATION = 15; // Duração da regeneração em segundos
const NEGATIVE_EFFECT_CLEAR_DURATION = 20; // Duração (em segundos) para remoção contínua de efeitos negativos
const REMOVAL_INTERVAL_TICKS = 5; // Intervalo de execução (em ticks) para a limpeza contínua

// Lista de efeitos negativos com nomes identificadores como strings
const EFFECTS = [
  "slowness",
  "mining_fatigue",
  "weakness",
  "poison",
  "wither",
  "blindness",
  "hunger"
];

// Mapeamento para gerenciar ciclos ativos
const activeIntervals = new Map();

/* FUNÇÃO DO TOTEM DA NEGAÇÃO */
function totemNegationFunction(player) {

  if (player.hasTag("totem_mainhand_negation")) {
    handleTotemMainhandActivation(player);
  } else if (player.hasTag("totem_offhand_negation")) {
    handleTotemOffhandActivation(player);
  }

  // Se já existe um ciclo ativo, cancela ele
  if (activeIntervals.has(player.name)) {
    const previousInterval = activeIntervals.get(player.name);
    system.clearRun(previousInterval); // Cancela o ciclo anterior corretamente
    activeIntervals.delete(player.name);
  }

  player.addTag("totem_active");

  player.addTag("negation_particles");

  let negativeCount = 0;
  let ticksPassed = 0;

  // Primeira limpeza imediata
  for (const effectId of EFFECTS) {
    if (player.getEffect(effectId)) {
      negativeCount++;
      player.runCommand(`effect @s clear ${effectId}`);
      player.runCommand(`particle ecbl_bs:negation_totem ~~2~`);



      //player.runCommand(`say efeito ${effectId} limpo`);
    }
  }

  // Regeneração inicial
  player.runCommand(`effect @s regeneration ${REGENERATION_DURATION} ${Math.max(negativeCount - 1, 0)}`);
  player.runCommand(`particle ecbl_bs:heal_square`);
  player.runCommand(`particle ecbl_bs:heal_heart`);
  //player.runCommand(`say regeneração inicial dada com level: ${Math.max(negativeCount, 1)}`);


  // Loop contínuo
  const interval = system.runInterval(() => {
    ticksPassed += REMOVAL_INTERVAL_TICKS;

    // Verifica se ainda está ativo
    if (!player.hasTag("totem_active")) {
      system.clearRun(interval);
      activeIntervals.delete(player.name);
      return;
    }

    let newNegativeCount = 0;
    for (const effectId of EFFECTS) {
      if (player.getEffect(effectId)) {
        newNegativeCount++;
        player.runCommand(`effect @s clear ${effectId}`);
        player.runCommand(`particle ecbl_bs:negation_totem ~~2~`);

        //player.runCommand(`say novo efeito ${effectId} limpo`);
      }
    }

    if (newNegativeCount > 0) {
      negativeCount += newNegativeCount;
      player.runCommand(`effect @s regeneration ${REGENERATION_DURATION} ${Math.max(negativeCount - 1, 0)}`);
      player.runCommand(`particle ecbl_bs:heal_square`);
      player.runCommand(`particle ecbl_bs:heal_heart`);
      player.runCommand(`playsound respawn_anchor.set_spawn @s ~~~ 1 2`);


      //player.runCommand(`say regeneração inicial dada com level: ${Math.max(negativeCount, 1)}`);
    }

    if (ticksPassed >= NEGATIVE_EFFECT_CLEAR_DURATION * 20) {
      player.removeTag("totem_active");
      player.removeTag("negation_particles");

      system.clearRun(interval);
      activeIntervals.delete(player.name);
    }
  }, REMOVAL_INTERVAL_TICKS);

  activeIntervals.set(player.name, interval);
}



// Intervalo para verificar a saúde dos jogadores e os efeitos negativos
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    // Verifica se o jogador tem a tag TEMP_TAG_storm
    if (player.hasTag("negation_particles")) {

      player.runCommand(`particle ecbl_bs:negation_statue_1 ~~0.5~`);

    }
  }
}); // Executa a cada 5 ticks



// Função auxiliar para simular atraso
function delay(ms) {
  return new Promise(resolve => system.runTimeout(resolve, ms));
}

function handleTotemMainhandActivation(player) {
  player.addTag("lock_item_replacer");

  const totem = new ItemStack("ecbl_bs:totem_of_negation_animation", 1);
  totem.lockMode = ItemLockMode.slot;

  // Usa o componente Equippable para equipar na mão principal
  const equip = player.getComponent(EntityComponentTypes.Equippable);
  equip.setEquipment(EquipmentSlot.Mainhand, totem);

  player.runCommand(`playsound random.totem @s`);

  delay(55).then(() => {
    const current = player.getEquipment(EquipmentSlot.Mainhand);
    if (current && current.typeId === "ecbl_bs:totem_of_negation_animation") {
      equip.setEquipment(EquipmentSlot.Mainhand, undefined);
    }

    player.removeTag("lock_item_replacer");
  });
}


function handleTotemOffhandActivation(player) {
  player.addTag("lock_item_replacer");

  const totem = new ItemStack("ecbl_bs:totem_of_negation_animation", 1);
  totem.lockMode = ItemLockMode.slot;

  // Usa o componente de equipamento para aplicar o item na offhand
  const equip = player.getComponent(EntityComponentTypes.Equippable);
  equip.setEquipment(EquipmentSlot.Offhand, totem);

  player.runCommand(`playsound random.totem @s`);

  delay(55).then(() => {
    const current = player.getEquipment(EquipmentSlot.Offhand);
    if (current && current.typeId === "ecbl_bs:totem_of_negation_animation") {
      equip.setEquipment(EquipmentSlot.Offhand, undefined);
    }

    player.removeTag("lock_item_replacer");
  });
}
