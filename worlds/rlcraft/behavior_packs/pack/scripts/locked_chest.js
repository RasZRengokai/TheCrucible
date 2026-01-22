import { world, system, ItemStack } from "@minecraft/server";

// Corrige a direção para que a entidade olhe para o jogador
function getFacingTarget(player, from, distance = 1) {
  const rotation = player.getRotation();
  const yawRad = (rotation.y % 360) * (Math.PI / 180);

  const dz = Math.round(Math.cos(yawRad) * distance) * -1;
  const dx = Math.round(Math.sin(-yawRad) * distance) * -1;

  return {
    x: Math.floor(from.x + dx),
    y: Math.floor(from.y),
    z: Math.floor(from.z + dz)
  };
}

world.afterEvents.playerPlaceBlock.subscribe(async (event) => {
  const { block, player } = event;

  if (block.typeId === "ecbl_bs:chest_fake_hitbox") {
    const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=false]`;

    world.getAllPlayers().forEach(player => {
      player.runCommandAsync(testForCommand).then(async (result) => {
        if (result.successCount > 0) {
          const x = block.location.x;
          const y = block.location.y;
          const z = block.location.z;

          player.runCommand(`summon ecbl_bs:locked_chest_entity Chest ${x} ${y} ${z}`);
          player.runCommand(`summon ecbl_bs:locked_chest_inventory Chest ${x} ${y} ${z}`);
          player.runCommand(`setblock ${x} ${y} ${z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=false]`);

          const facingPos = getFacingTarget(player, block.location);

          await player.runCommand(`tp @e[type=ecbl_bs:locked_chest_entity,x=${x},y=${y},z=${z},c=1] ${x} ${y} ${z} facing ${facingPos.x} ${facingPos.y} ${facingPos.z}`);
          await player.runCommand(`tp @e[type=ecbl_bs:locked_chest_inventory,x=${x},y=${y},z=${z},c=1] ${x} ${y + 0.5} ${z}`);
        }
      });
    });
  }
});




////////////////////////////////////////////////////////////////////////////////////////

function delay(ms) {
  return new Promise(resolve => system.runTimeout(resolve, ms));
}

world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  let player = data.player
  let block = data.block
  if (block.typeId == "ecbl_bs:chest_fake_hitbox") {
    const blockPosition = block.location;


    const testForCommand = `testforblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=false]`;

    world.getAllPlayers().forEach(player => {
      player.runCommandAsync(testForCommand).then(async (result) => {
        if (result.successCount > 0) {

          const testForCommand = `testfor @s[hasitem={item=ecbl_bs:chest_key,location=slot.weapon.mainhand}]`;

          world.getAllPlayers().forEach(player => {
            player.runCommandAsync(testForCommand).then((result) => {
              if (result.successCount > 0) {


                system.runTimeout(() => {
                  player.runCommand(`playsound open.iron_door`)
                  player.runCommand(`event entity @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,type=ecbl_bs:locked_chest_entity,r=1] ecbl_bs:event_locked_chest_open`)
                  player.runCommand(`setblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=true]`);
                  if (player.getGameMode() !== 'creative') {
                    player.runCommand(`clear @s ecbl_bs:chest_key 0 1`);
                  }
                }, 1);
              }
              else {
                player.runCommand(`title @s actionbar §c§oYou need a key to §lopen§r§c§o this chest`)
                player.runCommand(`playsound note.bass @s`);
              }
            })
          })
        }
      })
    })
  }
})


world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
  const { source: player, target: entity, itemStack: itemUsed } = evd;

  if (!itemUsed) return;
  world.getAllPlayers().forEach(player => {
    if (player.getGameMode() == 'creative') {

      if (itemUsed.typeId === "ecbl_bs:chest_key" && entity.typeId === "ecbl_bs:locked_chest_entity") {

        evd.cancel = true;

        system.run(() => {
          entity.runCommand(`event entity @s ecbl_bs:event_locked_chest_close`)
          entity.runCommand(`setblock ~~~ ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=false]`);
          entity.runCommand(`playsound random.chestclosed @a ~~~`)
        });
      }
    }
  })
});

world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  let player = data.player
  let block = data.block
  if (player.getGameMode() == 'creative') {
    if (block.typeId == "ecbl_bs:chest_fake_hitbox") {
      const blockPosition = block.location;

      const testForCommand = `testforblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=true]`;

      world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then(async (result) => {
          if (result.successCount > 0) {

            const testForCommand = `testfor @s[hasitem={item=ecbl_bs:chest_key,location=slot.weapon.mainhand}]`;

            world.getAllPlayers().forEach(player => {
              player.runCommandAsync(testForCommand).then((result) => {
                if (result.successCount > 0) {



                  system.runTimeout(() => {
                    player.runCommand(`event entity @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,type=ecbl_bs:locked_chest_entity,r=1] ecbl_bs:event_locked_chest_close`)
                    player.runCommand(`playsound random.chestclosed`)
                    player.runCommand(`setblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=false]`);
                  }, 1);
                }
                else {
                  player.runCommand(`title @s actionbar §c§oYou need a key to §lclose§r§c§o this chest`)
                  player.runCommand(`playsound note.bass @s`);

                }
              })
            })
          }
        })
      })
    }
  }
})


world.afterEvents.playerBreakBlock.subscribe(event => {
  const { dimension, block } = event;
  const blockPosition = block.location;
  if (event.brokenBlockPermutation.type.id == "ecbl_bs:chest_fake_hitbox") {
    dimension.runCommand(`tp @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,type=ecbl_bs:locked_chest_entity,r=1] ${blockPosition.x} ${blockPosition.y - 70} ${blockPosition.z}`);
    dimension.runCommand(`kill @e[x=${blockPosition.x},y=${blockPosition.y - 70},z=${blockPosition.z},r=10,type=ecbl_bs:locked_chest_entity]`);
    dimension.runCommand(`tp @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,type=ecbl_bs:locked_chest_inventory,r=1] ${blockPosition.x} ${blockPosition.y - 70} ${blockPosition.z}`);
    dimension.runCommand(`kill @e[x=${blockPosition.x},y=${blockPosition.y - 70},z=${blockPosition.z},r=10,type=ecbl_bs:locked_chest_inventory]`);
    dimension.runCommand(`setblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} minecraft:air replace`);

  }
})
//////////////////////////////////////////////////////////////////////////////////////////////



system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const blockView = player.getBlockFromViewDirection();
    let block;

    if (blockView) {
      const distance = Math.sqrt(
        Math.pow(blockView.block.location.x - player.location.x, 2) +
        Math.pow(blockView.block.location.y - player.location.y, 2) +
        Math.pow(blockView.block.location.z - player.location.z, 2)
      );

      if (distance <= 7) {
        block = blockView.block;
      }
    }

    if (block) {
      const testForCommand = `testforblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:chest_fake_hitbox ["ecbl_bs:key"=true]`;

      player.runCommandAsync(testForCommand).then(result => {
        if (result.successCount > 0) {
          player.runCommand(`event entity @e[x=${block.location.x},y=${block.location.y},z=${block.location.z},c=1,type=ecbl_bs:locked_chest_entity,r=1] ecbl_bs:event_locked_chest_open`);
        } else {
          player.runCommand(`event entity @e[type=ecbl_bs:locked_chest_entity,r=30] ecbl_bs:event_locked_chest_close`);
        }
      }).catch(error => {
        console.error(error);
      });
    }
  }
});

      
//world.afterEvents.playerPlaceBlock.subscribe((event) => {
//  const block = event.block;
//  const dim = block.dimension;
//
//  // Se o bloco for pistão ou sticky pistão, continua
//  if (block.typeId === "minecraft:piston" || block.typeId === "minecraft:sticky_piston") {
//
//    const x = block.location.x;
//    const y = block.location.y;
//    const z = block.location.z;
//
//    const offsets = [
//      { x: 13, y: 0, z: 0 },
//      { x: -13, y: 0, z: 0 },
//      { x: 0, y: 13, z: 0 },
//      { x: 0, y: -13, z: 0 },
//      { x: 0, y: 0, z: 13 },
//      { x: 0, y: 0, z: -13 },
//    ];
//
//    for (const offset of offsets) {
//      const neighbor = dim.getBlock({
//        x: x + offset.x,
//        y: y + offset.y,
//        z: z + offset.z,
//      });
//
//      if (neighbor && neighbor.typeId === "ecbl_bs:chest_fake_hitbox") {
//        dim.runCommand(`setblock ${x} ${y} ${z} air destroy`);
//        break;
//      }
//    }
//  }
//});





//world.beforeEvents.worldInitialize.subscribe((event) => {
//
//  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:piston_destroy', new PistonDestroy())
//
//})
//
//class PistonDestroy {
//  onTick(data) {
//
//    let BlockX = data.block.x
//    let BlockY = data.block.y
//    let BlockZ = data.block.z
//
//
//
//    // X
//    data.block.dimension.runCommand(`fill ${BlockX + 13} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} air replace minecraft:piston`);
//    data.block.dimension.runCommand(`fill ${BlockX - 13} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} air replace minecraft:piston`);
//    // Y
//    data.block.dimension.runCommand(`fill ${BlockX} ${BlockY + 13} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} air replace minecraft:piston`);
//    data.block.dimension.runCommand(`fill ${BlockX} ${BlockY - 13} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} air replace minecraft:piston`);
//    // Z
//    data.block.dimension.runCommand(`fill ${BlockX} ${BlockY} ${BlockZ + 13} ${BlockX} ${BlockY} ${BlockZ} air replace minecraft:piston`);
//    data.block.dimension.runCommand(`fill ${BlockX} ${BlockY} ${BlockZ - 13} ${BlockX} ${BlockY} ${BlockZ} air replace minecraft:piston`);
//
//
//
//  }
//}

world.beforeEvents.worldInitialize.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:piston_destroy', new PistonDestroy());
});

class PistonDestroy {
  async onTick(data) {
    const block = data.block;
    const dim = block.dimension;
    const x = block.x;
    const y = block.y;
    const z = block.z;

    const worldMinY = -63;
    const worldMaxY = 320;

    const pistons = [];

    // Percorre apenas nas 6 direções principais
    const directions = [
      { dx: 1, dy: 0, dz: 0 },  // Direita (+X)
      { dx: -1, dy: 0, dz: 0 }, // Esquerda (-X)
      { dx: 0, dy: 1, dz: 0 },  // Cima (+Y)
      { dx: 0, dy: -1, dz: 0 }, // Baixo (-Y)
      { dx: 0, dy: 0, dz: 1 },  // Frente (+Z)
      { dx: 0, dy: 0, dz: -1 }, // Trás (-Z)
    ];

    for (const dir of directions) {
      for (let i = 1; i <= 12; i++) { // Percorre 13 blocos em linha reta
        const tx = x + dir.dx * i;
        const ty = y + dir.dy * i;
        const tz = z + dir.dz * i;

        if (ty < worldMinY || ty > worldMaxY) continue;

        const targetBlock = dim.getBlock({ x: tx, y: ty, z: tz });
        if (!targetBlock) continue;

        const id = targetBlock.typeId;
        if (id === "minecraft:piston" || id === "minecraft:sticky_piston") {
          pistons.push({ x: tx, y: ty, z: tz, type: id });
        }
      }
    }

    if (pistons.length === 0) return;

    // Executa os comandos em sequência aguardando cada um terminar
    for (const pos of pistons) {
      await dim.runCommandAsync(`setblock ${pos.x} ${pos.y} ${pos.z} air destroy`);
    }
  }
}
