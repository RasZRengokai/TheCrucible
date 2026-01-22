//import { world, system, ItemStack } from "@minecraft/server";
//
//function mainInterval() {
//    system.runInterval(() => {
//        let players = world.getAllPlayers();
//
//        players.forEach(player => {
//            const testForBrazier = `testforblock ~~-1~ ecbl_bs:brazier["ecbl_bs:light":0]`;
//            const testForSoulBrazier = `testforblock ~~-1~ ecbl_bs:soul_brazier["ecbl_bs:light":0]`;
//
//            player.runCommandAsync(testForBrazier).then((result) => {
//                if (result.successCount > 0) {
//                    processPlayer(player);
//                } else {
//                    player.runCommandAsync(testForSoulBrazier).then((result) => {
//                        if (result.successCount > 0) {
//                            processPlayer(player);
//                        }
//                    });
//                }
//            });
//        });
//    }, 10); // Executa a cada 40 ticks (aproximadamente 2 segundos)
//}
//
//function processPlayer(player) {
//    if (player.getGameMode() !== 'creative') {
//        removeRandomItem(player);
//    }
//}
//
//mainInterval(); // Inicia a função principal
//
//function removeRandomItem(player) {
//    // Obter o inventário do jogador
//    const inventoryComponent = player.getComponent("minecraft:inventory");
//    const inventory = inventoryComponent?.container;
//
//    // Verifica se o inventário existe
//    if (inventory) {
//        // Lista para armazenar todos os slots com itens
//        const filledSlots = [];
//
//        // Percorre o inventário
//        for (let i = 0; i < inventory.size; i++) {
//            const itemStack = inventory.getItem(i);
//            if (itemStack) {
//                filledSlots.push({ slot: i, itemStack });
//            }
//        }
//
//        // Se houver ao menos um item no inventário
//        if (filledSlots.length > 0) {
//            // Seleciona um slot aleatório
//            const randomIndex = Math.floor(Math.random() * filledSlots.length);
//            const { slot, itemStack } = filledSlots[randomIndex];
//
//            // Diminui a quantidade do item em 1
//            if (itemStack.amount > 1) {
//                itemStack.amount -= 1;
//                inventory.setItem(slot, itemStack);
//            } else {
//                // Se o item tiver quantidade 1, remove o item do slot
//                inventory.setItem(slot, undefined);
//            }
//
//            // Toca o som quando o item é removido com sucesso
//            player.runCommand(`playsound extinguish.candle @s`);
//        }
//    }
//}
