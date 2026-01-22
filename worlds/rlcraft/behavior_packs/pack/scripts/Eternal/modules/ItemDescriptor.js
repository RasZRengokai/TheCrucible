import { EquipmentSlot, world } from "@minecraft/server";
import { runInterval } from "../Utils";
import { ns } from "../Constants";

/**
 * Class representing an item description.
 */
class ItemDescription {
  /**
   * Create an item description.
   * @param {string} id - The ID of the item.
   * @param {string[]} lore - The lore of the item.
   */
  constructor(id, lore) {
    this.id = id;
    this.lore = lore;
  }
}

/**
 * Array of item descriptions.
 * @type {ItemDescription[]}
 */
const itemDescriptions = [
  new ItemDescription(`${ns}:night_vision_goggles`, ["§r§9\nGrants Night Vision."]),
  new ItemDescription(`${ns}:mining_helmet`, ["§r§9\nProvides light."]),
  new ItemDescription(`${ns}:rabbit_boots`, ["§r§9\nGrants Jump Boost."]),
  new ItemDescription(`${ns}:ethereal_cloak`, ["§r§9\nGrants Invisibility and Speed."]),
  new ItemDescription(`${ns}:ice_helmet`, ["§r§9\nFreezes attackers on hit."]),
  new ItemDescription(`${ns}:ice_chestplate`, ["§r§9\nFreezes attackers on hit."]),
  new ItemDescription(`${ns}:ice_leggings`, ["§r§9\nFreezes attackers on hit."]),
  new ItemDescription(`${ns}:ice_boots`, ["§r§9\nFreezes attackers on hit."]),
  new ItemDescription(`${ns}:cactus_helmet`, ["§r§9\nReflects 10% damage taken. (Stackable)"]),
  new ItemDescription(`${ns}:cactus_chestplate`, ["§r§9\nReflects 10% damage taken. (Stackable)"]),
  new ItemDescription(`${ns}:cactus_leggings`, ["§r§9\nReflects 10% damage taken. (Stackable)"]),
  new ItemDescription(`${ns}:cactus_boots`, ["§r§9\nReflects 10% damage taken. (Stackable)"]),
  new ItemDescription(`${ns}:tnt_helmet`, ["§r§9\nExplodes when hit."]),
  new ItemDescription(`${ns}:tnt_chestplate`, ["§r§9\nExplodes when hit."]),
  new ItemDescription(`${ns}:tnt_leggings`, ["§r§9\nExplodes when hit."]),
  new ItemDescription(`${ns}:tnt_boots`, ["§r§9\nExplodes when hit."]),
  new ItemDescription(`${ns}:netherwalker_boots`, ["§r§9\nTurns lava into magma blocks."]),
  new ItemDescription(`${ns}:vampire_blade`, ["§r§9Steals health per hit."]),
  new ItemDescription(`${ns}:thorns_crown`, ["§r§9Increases damage by 20%"]),
];

runInterval(() => {
  for (const iDes of itemDescriptions) {
    for (const player of world.players) {
      const imap = player.getItems(iDes.id).inventory;
      const emap = player.getItems(iDes.id).equipments;

      for (const [slotId, item] of imap) {
        if (item.getLore().length === 0) {
          item.setLore(iDes.lore);
          player.inventory.setItem(slotId, item);
        }
      }
      for (const [slotId, item] of emap) {
        if (item.getLore().length === 0) {
          item.setLore(iDes.lore);
          player.setEquipment(slotId, item);
        }
      }
    }
  }
});
