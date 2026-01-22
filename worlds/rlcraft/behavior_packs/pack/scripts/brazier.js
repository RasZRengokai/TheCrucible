import { world, system } from "@minecraft/server"


world.beforeEvents.worldInitialize.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:sound_fire", new SoundFire());
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:sound_fire_soul", new SoundFireSoul());
});

class SoundFire {
  onTick(data) {
    const bx = data.block.x + 0.5; // Centraliza o ponto do bloco
    const by = data.block.y + 0.5;
    const bz = data.block.z + 0.5;

    const players = data.block.dimension.getPlayers();
    let count = 0;
    const raio = 32;

    for (const player of players) {
      const px = player.location.x;
      const py = player.location.y;
      const pz = player.location.z;

      const dx = px - bx;
      const dy = py - by;
      const dz = pz - bz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance <= raio) {
        count++;
        if (count > 1) break;
      }
    }

    if (count !== 1) return; // Só continua se houver exatamente 1 jogador
      data.block.dimension.spawnParticle("ecbl_bs:brazier_flame", {
        x: data.block.x + 0.5,
        y: data.block.y + 1,
        z: data.block.z + 0.5,
      });
  }
}

class SoundFireSoul {
  onTick(data) {
    const bx = data.block.x; // Centraliza o ponto do bloco
    const by = data.block.y;
    const bz = data.block.z;

    const players = data.block.dimension.getPlayers();
    let count = 0;
    const raio = 32;

    for (const player of players) {
      const px = player.location.x;
      const py = player.location.y;
      const pz = player.location.z;

      const dx = px - bx;
      const dy = py - by;
      const dz = pz - bz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance <= raio) {
        count++;
        if (count > 1) break;
      }
    }

    if (count !== 1) return; // Só continua se houver exatamente 1 jogador
    data.block.dimension.spawnParticle("ecbl_bs:brazier_soul_flame", {
      x: data.block.x + 0.5,
      y: data.block.y + 1,
      z: data.block.z + 0.5,
    });
  }
}



const flint = ["minecraft:flint_and_steel"];

world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { source: player, block, itemStack: itemUsed } = evd;

  if (!itemUsed) return;

  if (flint.includes(itemUsed.typeId)) {
    if (block.permutation.matches("ecbl_bs:brazier")) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:brazier["ecbl_bs:light"=1]`;

      // Cancela a interação original do jogador para evitar que o bloco seja queimado
      evd.cancel = true;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then((result) => {
          if (result.successCount > 0) {
            system.run(() => {
              player.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:brazier["ecbl_bs:light"=0]`);
              player.runCommand(`playsound fire.ignite @s ${block.location.x} ${block.location.y} ${block.location.z}`);
            });
          }
        });
      });
    }
  }
});

world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { source: player, block, itemStack: itemUsed } = evd;

  if (!itemUsed) return;

  if (flint.includes(itemUsed.typeId)) {
    if (block.permutation.matches("ecbl_bs:soul_brazier")) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:soul_brazier["ecbl_bs:light"=1]`;

      // Cancela a interação original do jogador para evitar que o bloco seja queimado
      evd.cancel = true;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then((result) => {
          if (result.successCount > 0) {
            system.run(() => {
              player.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:soul_brazier["ecbl_bs:light"=0]`);
              player.runCommand(`playsound fire.ignite @s ${block.location.x} ${block.location.y} ${block.location.z}`);
            });
          }
        });
      });
    }
  }
});

const shovel = [
  "minecraft:wooden_shovel",
  "minecraft:stone_shovel",
  "minecraft:iron_shovel",
  "minecraft:golden_shovel",
  "minecraft:diamond_shovel",
  "minecraft:netherite_shovel"
];

world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { source: player, block, itemStack: itemUsed } = evd;

  if (!itemUsed) return;

  if (shovel.includes(itemUsed.typeId)) {
    if (block.permutation.matches("ecbl_bs:brazier")) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:brazier["ecbl_bs:light"=0]`;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then((result) => {
          if (result.successCount > 0) {

            system.run(() => {
              player.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:brazier["ecbl_bs:light"=1]`);
              player.runCommand(`playsound extinguish.candle`);

            })
          }
        })
      })
    }
  }
})

world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { source: player, block, itemStack: itemUsed } = evd;

  if (!itemUsed) return;

  if (shovel.includes(itemUsed.typeId)) {
    if (block.permutation.matches("ecbl_bs:soul_brazier")) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:soul_brazier["ecbl_bs:light"=0]`;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then((result) => {
          if (result.successCount > 0) {

            system.run(() => {
              player.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:soul_brazier["ecbl_bs:light"=1]`);
              player.runCommand(`playsound extinguish.candle`);

            })
          }
        })
      })
    }
  }
})

const Meats = {
  "minecraft:beef": "ecbl_bs/beef_drop",
  "minecraft:chicken": "ecbl_bs/chicken_drop",
  "minecraft:porkchop": "ecbl_bs/porkchop_drop",
  "minecraft:mutton": "ecbl_bs/mutton_drop",
  "minecraft:rabbit": "ecbl_bs/rabbit_drop",
  "minecraft:cod": "ecbl_bs/cod_drop",
  "minecraft:salmon": "ecbl_bs/salmon_drop"
};

world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { source: player, block, itemStack: itemUsed } = evd;

  if (!itemUsed) return;

  if (Meats[itemUsed.typeId]) {
    if (block.permutation.matches("ecbl_bs:brazier")) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:brazier["ecbl_bs:light"=0]`;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then((result) => {
          if (result.successCount > 0) {
            system.run(() => {

              player.runCommand(`playsound extinguish.candle`);
              if (player.getGameMode() !== 'creative') {
                player.runCommand(`clear @s ${itemUsed.typeId} 0 1`);
              }
              player.runCommand(`structure load "${Meats[itemUsed.typeId]}" ${block.location.x} ${block.location.y + 1} ${block.location.z}`);
            });
          }
        });
      });
    }
  }
});


world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { source: player, block, itemStack: itemUsed } = evd;

  if (!itemUsed) return;

  if (Meats[itemUsed.typeId]) {
    if (block.permutation.matches("ecbl_bs:soul_brazier")) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:soul_brazier["ecbl_bs:light"=0]`;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then((result) => {
          if (result.successCount > 0) {
            system.run(() => {

              player.runCommand(`playsound extinguish.candle`);
              if (player.getGameMode() !== 'creative') {
                player.runCommand(`clear @s ${itemUsed.typeId} 0 1`);
              }
              player.runCommand(`structure load "${Meats[itemUsed.typeId]}" ${block.location.x} ${block.location.y + 1} ${block.location.z}`);
            });
          }
        });
      });
    }
  }
});





system.runInterval(() => {
  // Verifica se um jogador está em cima dos blocos especificados
  world.getAllPlayers().forEach(player => {
    const playerPos = player.location;
    const blockX = Math.floor(playerPos.x);
    const blockY = Math.floor(playerPos.y) - 1;
    const blockZ = Math.floor(playerPos.z);

    const testForBrazier = `testforblock ${blockX} ${blockY} ${blockZ} ecbl_bs:brazier["ecbl_bs:light"=0]`;
    const testForSoulBrazier = `testforblock ${blockX} ${blockY} ${blockZ} ecbl_bs:soul_brazier["ecbl_bs:light"=0]`;

    // Verifica se o bloco abaixo do jogador é ecbl_bs:brazier com luz igual a 0
    player.runCommandAsync(testForBrazier).then(result => {
      if (result.successCount > 0) {
        // Executa o comando de dano no jogador
        player.runCommandAsync(`damage @s 2 fire`);
      }
    })
    player.runCommandAsync(testForSoulBrazier).then(result => {
      if (result.successCount > 0) {
        // Executa o comando de dano no jogador
        player.runCommandAsync(`damage @s 2 fire`);
      }
    })
  });
}, 10); // Executa a cada 10 ticks (aproximadamente 0,5 segundos)




