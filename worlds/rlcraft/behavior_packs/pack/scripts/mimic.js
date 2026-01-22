import { world, system } from "@minecraft/server";

function delay(ms) {
  return new Promise(resolve => system.runTimeout(resolve, ms));
}

world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
  const { source: player, target: entity } = evd;

  if (entity.typeId === "ecbl_bs:mimic") {

    system.run(() => {

      entity.runCommand(`event entity @s ecbl_bs:event_mimic_angry`);

    });
  }
});

world.afterEvents.playerPlaceBlock.subscribe(async (event) => {
  const { block, dimension, player } = event;

  if (block.typeId === "ecbl_bs:mimic_fake_hitbox") {
    const playerX = player.location.x;
    const playerY = player.location.y;
    const playerZ = player.location.z;

    player.runCommand(`summon ecbl_bs:mimic ${block.location.x} ${block.location.y} ${block.location.z}`);
    await player.runCommand(`tp @e[type=ecbl_bs:mimic,x=${block.location.x},y=${block.location.y},z=${block.location.z},c=1] ${block.location.x} ${block.location.y} ${block.location.z} facing ~~~`);
  }
});

world.afterEvents.playerBreakBlock.subscribe(event => {
  const { dimension, block } = event;
  const blockPosition = block.location;
  if (event.brokenBlockPermutation.type.id == "ecbl_bs:mimic_fake_hitbox") {
    dimension.runCommand(`damage @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,type=ecbl_bs:mimic] 4`);
    dimension.runCommand(`setblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} minecraft:air replace`);
    dimension.runCommand(`event entity @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,r=2,type=ecbl_bs:mimic] ecbl_bs:event_mimic_angry`);
  }
})

world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  let player = data.player
  let block = data.block
  if (block.typeId == "ecbl_bs:mimic_fake_hitbox") {
    const blockPosition = block.location;

    system.runTimeout(() => {

      player.runCommand(`setblock ${blockPosition.x} ${blockPosition.y} ${blockPosition.z} minecraft:air replace`);
      player.runCommand(`event entity @e[x=${blockPosition.x},y=${blockPosition.y},z=${blockPosition.z},c=1,r=2,type=ecbl_bs:mimic] ecbl_bs:event_mimic_angry`);

    }, 1);
  }
});

world.afterEvents.entityHurt.subscribe((event) => {

  if (event.damageSource.damagingEntity !== undefined && event.damageSource.damagingEntity.typeId == "ecbl_bs:mimic") {
    event.hurtEntity.runCommand(`effect @s slowness 2 3 false`)
    event.hurtEntity.runCommand(`effect @e[type=ecbl_bs:mimic,r=5] slowness 1 250 true`)
  }
})


