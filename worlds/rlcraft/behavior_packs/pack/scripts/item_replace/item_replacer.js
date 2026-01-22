import { world, system } from "@minecraft/server";
import exchangeConfigs from "./item_const.js"

// Função principal que executa a cada intervalo
function mainInterval() {
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      if (!player.hasTag("lock_item_replacer")) {

        // Itera sobre cada configuração de troca
        for (const config of exchangeConfigs) {
          const { itemsToExchange, itemToReceive, tag } = config;

          if (player.getGameMode() === "creative") {
            // Verifica se o jogador possui itens válidos para troca
            if (hasValidItems(player, itemsToExchange)) {
              // Verifica se o jogador já possui o item a ser recebido
              if (hasItem(player, itemToReceive)) {
                // Apenas retira os itens de troca
                clearItems(player, itemsToExchange);
              } else {
                // Adiciona um item a ser recebido e retira os itens de troca
                addItem(player, itemToReceive, 1);
                clearItems(player, itemsToExchange);
              }
            }
          } else {
            // Verifica se o jogador possui itens válidos para troca
            if (hasValidItems(player, itemsToExchange)) {
              // Realiza a troca de itens
              clearItemsAndGive(player, itemsToExchange, itemToReceive);
            }
          }
        }
      }
    }
  });
}

mainInterval(); // Inicia a função principal

/**
 * Função para remover itens válidos do inventário do jogador e substituí-los pelo item correspondente (modo survival)
 * @param {Player} player - O jogador cujo inventário será verificado
 * @param {Array} itemsToExchange - Lista de itens que devem ser trocados
 * @param {string} itemToReceive - Item que o jogador irá receber em troca
 */
function clearItemsAndGive(player, itemsToExchange, itemToReceive) {
  let inventory = player.getComponent("minecraft:inventory").container;
  let totalCount = 0;

  // Percorre o inventário e remove os itens de troca
  for (let i = 0; i < inventory.size; i++) {
    let item = inventory.getItem(i);
    if (item && itemsToExchange.includes(item.typeId)) {
      totalCount += item.amount;
      inventory.setItem(i, undefined);
    }
  }

  // Se algum item foi removido, adiciona o item de recebimento
  if (totalCount > 0) {
    player.dimension.runCommand(`give "${player.nameTag}" ${itemToReceive} ${totalCount}`);
  }
}

/**
 * Função para remover itens válidos do inventário do jogador (modo criativo)
 * @param {Player} player - O jogador cujo inventário será verificado
 * @param {Array} itemsToExchange - Lista de itens que devem ser trocados
 */
function clearItems(player, itemsToExchange) {
  let inventory = player.getComponent("minecraft:inventory").container;

  // Percorre o inventário e remove os itens de troca
  for (let i = 0; i < inventory.size; i++) {
    let item = inventory.getItem(i);
    if (item && itemsToExchange.includes(item.typeId)) {
      inventory.setItem(i, undefined);
    }
  }
}

/**
 * Função para verificar se o jogador possui itens válidos no inventário
 * @param {Player} player - O jogador cujo inventário será verificado
 * @param {Array} itemsToExchange - Lista de itens que devem ser trocados
 * @returns {boolean} - Retorna true se o jogador possuir itens válidos, false caso contrário
 */
function hasValidItems(player, itemsToExchange) {
  let inventory = player.getComponent("minecraft:inventory").container;
  for (let i = 0; i < inventory.size; i++) {
    let item = inventory.getItem(i);
    if (item && itemsToExchange.includes(item.typeId)) {
      return true;
    }
  }
  return false;
}

/**
 * Função para verificar se o jogador possui um item específico
 * @param {Player} player - O jogador cujo inventário será verificado
 * @param {string} type - ID do item a verificar
 * @returns {boolean} - Retorna true se o jogador possuir o item, false caso contrário
 */
function hasItem(player, type) {
  let inventory = player.getComponent("minecraft:inventory").container;
  for (let i = 0; i < inventory.size; i++) {
    let item = inventory.getItem(i);
    if (item && item.typeId === type) {
      return true;
    }
  }
  return false;
}

/**
 * Função para adicionar um item ao inventário do jogador usando comando
 * @param {Player} player - O jogador que irá receber o item
 * @param {string} type - ID do item a ser adicionado
 * @param {number} count - Quantidade do item a ser adicionado
 */
function addItem(player, type, count) {
  player.dimension.runCommand(`give "${player.nameTag}" ${type} ${count}`);
}
