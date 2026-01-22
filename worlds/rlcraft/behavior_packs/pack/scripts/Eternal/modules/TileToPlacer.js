import { ItemStack, world } from "@minecraft/server";
import { runInterval, runTimeout } from "../Utils";

const playersPrevData = new Map();

// Replace tile item to place item
runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const mainhandSlot = player.getEquipmentSlot("Mainhand");
    runTimeout(() => {
      const inventory = player.inventory;
      let availableSlot;
      if (inventory.emptySlotsCount > 0) {
        for (let i = 0; i < inventory.size; i++) {
          const slot = inventory.getSlot(i);
          if (!slot.getItem()) {
            availableSlot = slot;
            break;
          }
        }
      }

      playersPrevData.set(player.id, {
        prevItem: mainhandSlot.getItem(),
        prevEmptySlotsCount: inventory.emptySlotsCount,
        availableSlot: availableSlot,
      });
    });

    if (mainhandSlot.getItem()?.typeId.includes(":item.")) {
      const placerId = mainhandSlot.typeId.replace(/item\./g, "");

      const inventory = player.inventory;

      // Swap the placer item to mainhand player has it in their inventory
      for (let i = 0; i < inventory.size; i++) {
        const slot = inventory.getSlot(i);

        if (slot.getItem()?.typeId === placerId) {
          // Switch selected slot if placer is in the hotbar
          if (i < 9) {
            const prevEmptySlotsCount = playersPrevData.get(player.id).prevEmptySlotsCount;
            const prevItem = playersPrevData.get(player.id).prevItem;
            const availableSlot = playersPrevData.get(player.id).availableSlot;

            mainhandSlot.setItem(prevItem);

            // Clear tile item in the inventory
            if (prevEmptySlotsCount > 0) availableSlot.setItem(undefined);

            player.selectedSlotIndex = i;
          } else {
            mainhandSlot.setItem(slot.getItem());
            slot.setItem(undefined);
          }

          return;
        }
      }

      // Create a placer item if player doesn't have it.
      const placerItem = new ItemStack(placerId);
      player.setEquipment("Mainhand", placerItem);
    }
  }
});
