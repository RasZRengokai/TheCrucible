import { system, world, ItemStack } from "@minecraft/server";
import { itemsWithLore } from "./constants/item_lore_constants";

function checkPlayerInventory() {
  for (const player of world.getPlayers()) {
    const inventory = player.getComponent('minecraft:inventory').container;
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (item && itemsWithLore[item.typeId]) {
        item.setLore(itemsWithLore[item.typeId]);
        inventory.setItem(i, item);
      }
    }
  }
  system.runTimeout(checkPlayerInventory, 10);
}

checkPlayerInventory();
