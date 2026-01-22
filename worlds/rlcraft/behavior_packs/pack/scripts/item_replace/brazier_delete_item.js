import { world, system } from "@minecraft/server";

const Meats = {
  "minecraft:beef": true,
  "minecraft:chicken": true,
  "minecraft:porkchop": true,
  "minecraft:mutton": true,
  "minecraft:rabbit": true,
  "minecraft:cod": true,
  "minecraft:salmon": true
};

world.beforeEvents.itemUseOn.subscribe((event) => {
  const player = event.source;
  const block = event.block;
  const itemInHand = event.itemStack;

  if (block.typeId === "ecbl_bs:brazier" || block.typeId === "ecbl_bs:soul_brazier") {
    const blockPosition = block.location;
    const testForLight = `testforblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} ${block.typeId}["ecbl_bs:light"=0]`;

    event.cancel = true;

    player.runCommandAsync(testForLight).then(result => {
      if (result.successCount > 0) {
        if (itemInHand) {
          const itemType = itemInHand.typeId;
          const isShovel = itemType.endsWith("_shovel");
          const isFlintAndSteel = itemType === "minecraft:flint_and_steel";

          if (!isShovel && !isFlintAndSteel && !Meats[itemType]) {
            const itemData = itemInHand.data ?? -1;

            // Remove apenas 1 unidade do item da mão
            player.runCommandAsync(`clear @s ${itemType} ${itemData} 1`)
              .then(() => {
                player.runCommandAsync(`particle minecraft:campfire_smoke_particle ${blockPosition.x} ${blockPosition.y + 1} ${blockPosition.z}`);
                player.runCommandAsync(`playsound extinguish.candle @s`);
              })
              .catch((error) => {
                console.error(`Erro ao executar o comando clear: ${error}`);
              });
          }
        }
      }
    }).catch((error) => {
      console.error(`Erro ao verificar o estado de luz do bloco: ${error}`);
    });
  }
});
