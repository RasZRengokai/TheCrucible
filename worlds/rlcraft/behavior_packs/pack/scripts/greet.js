import { system, world, ItemStack } from "@minecraft/server";

world.afterEvents.playerSpawn.subscribe((e) => {
  const { initialSpawn, player } = e;

  if (initialSpawn && player) {
    system.runTimeout(() => {
      player.sendMessage({ translate: "notification.ecbl_bc.vv_setting_reminder" });
    }, 100);
  }
});
