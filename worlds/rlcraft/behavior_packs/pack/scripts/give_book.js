import { world, ItemStack } from "@minecraft/server"

const item = "minecraft:book"

world.afterEvents.playerSpawn.subscribe((e) => {
  if (!e.initialSpawn) return;
  if (!e.player.hasTag("ecbl_bc:has_item")) {
    const guidebook = new ItemStack(item);
    e.player.dimension.spawnItem(guidebook, e.player.location);
    e.player.sendMessage("§c[!] §rThe §gBetter Structures Add-On§r has been added.");
    e.player.sendMessage("You have been given a Guidebook.");
    e.player.addTag("ecbl_bc:has_item");
  }
});