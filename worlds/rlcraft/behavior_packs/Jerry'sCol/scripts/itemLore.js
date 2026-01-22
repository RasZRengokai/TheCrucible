import { system, world, ItemStack } from "@minecraft/server";

// All items and blocks from Jerry's Colonies addon
const JERRYS_COLONIES_ITEMS = [
    // Blueprints
    "jerrys_colonies:blueprint_barracks",
    "jerrys_colonies:blueprint_cow_pen",
    "jerrys_colonies:blueprint_forge",
    "jerrys_colonies:blueprint_house_chimney",
    "jerrys_colonies:blueprint_house_farm",
    "jerrys_colonies:blueprint_jail",
    "jerrys_colonies:blueprint_library",
    "jerrys_colonies:blueprint_market_stand",
    "jerrys_colonies:blueprint_road",
    "jerrys_colonies:blueprint_silo",
    "jerrys_colonies:blueprint_tower_house",
    "jerrys_colonies:blueprint_watchtower",
    "jerrys_colonies:blueprint_wheat_farm",
    // Colony items
    "jerrys_colonies:colony_flag",
    "jerrys_colonies:cosmetic_flag",
    "jerrys_colonies:bandit_flag",
    "jerrys_colonies:marauder_flag",
    // Crowns
    "jerrys_colonies:cross_crown",
    "jerrys_colonies:crown",
    "jerrys_colonies:dark_crown",
    "jerrys_colonies:divine_crown",
    "jerrys_colonies:filigree_crown",
    "jerrys_colonies:ice_crown",
    "jerrys_colonies:imperial_crown",
    "jerrys_colonies:luxerious_crown",
    "jerrys_colonies:pale_crown",
    "jerrys_colonies:studded_crown",
    "jerrys_colonies:vine_crown",
    "jerrys_colonies:wreath_crown",
    "jerrys_colonies:consort_crown",
    // Special items
    "jerrys_colonies:guidebook",
    "jerrys_colonies:large_boat",
    "jerrys_colonies:mod_tool",
    "jerrys_colonies:player_id",
    "jerrys_colonies:thearena",
    "jerrys_colonies:totem_of_peace",
    "jerrys_colonies:trumpet",
    "jerrys_colonies:wedding_ring",
    "jerrys_colonies:commander_sword",
    "jerrys_colonies:match_manager",
    "jerrys_colonies:boo",
    "jerrys_colonies:cheer",
    "jerrys_colonies:healing_tonic",
    // Blocks
    "jerrys_colonies:arena_teleporter",
    "jerrys_colonies:ballot_box",
    "jerrys_colonies:blueprint_workbench",
    "jerrys_colonies:food_crate",
    "jerrys_colonies:grave",
    "jerrys_colonies:mailbox",
    "jerrys_colonies:mayor_table",
    "jerrys_colonies:microphone",
    "jerrys_colonies:springfront",
    "jerrys_colonies:taxation_table",
    // Trophies
    "jerrys_colonies:trophy_christmas",
    "jerrys_colonies:trophy_cinco_de_mayo",
    "jerrys_colonies:trophy_heatwave",
    "jerrys_colonies:trophy_love_and_war",
    "jerrys_colonies:trophy_sparkleburst",
    "jerrys_colonies:trophy_spooky",
    "jerrys_colonies:trophy_sweet_treat",
    "jerrys_colonies:trophy_the_harvest",
    "jerrys_colonies:trophy_thunderstrike",
    "jerrys_colonies:trophy_winner_winner_turkey_dinner",
    "jerrys_colonies:trophy_winter_offensive"
];

// Function to check and update item lore in player inventory
function checkPlayerInventory() {
    for (const player of world.getPlayers()) {
        const inventoryComponent = player.getComponent('minecraft:inventory');
        if (!inventoryComponent) continue;

        const inventory = inventoryComponent.container;
        if (!inventory) continue;

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            
            // Check if item exists and is from Jerry's Colonies
            if (item && JERRYS_COLONIES_ITEMS.includes(item.typeId)) {
                // Get current lore
                const currentLore = item.getLore();
                
                // Check if lore already includes "Jerry's Colonies"
                const hasLore = currentLore.some(line => line.includes("Jerry's Colonies"));
                
                // If lore doesn't exist or doesn't include our text, add it
                if (!hasLore) {
                    item.setLore(["§l§sJerry's Colonies"]);
                    inventory.setItem(i, item);
                }
            }
        }
    }
    
    // Schedule next check
    system.runTimeout(checkPlayerInventory, 20); // Check every second (20 ticks)
}

// Start the periodic check
checkPlayerInventory();

// Player skull drop system - when a player kills another player
world.afterEvents.entityDie.subscribe((event) => {
    const deadEntity = event.deadEntity;
    const damageSource = event.damageSource;
    
    // Check if the dead entity is a player
    if (deadEntity.typeId !== "minecraft:player") {
        return;
    }
    
    // Check if the damage was caused by another player
    const killer = damageSource.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player") {
        return;
    }
    
    try {
        const deadPlayerName = deadEntity.name;
        const killerName = killer.name;
        
        // Get current date
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${month}/${day}/${year}`;
        
        // Determine death cause based on killer's weapon
        let deathCause = killerName;
        const killerInventory = killer.getComponent("inventory");
        if (killerInventory && killerInventory.container) {
            const heldItem = killerInventory.container.getItem(killer.selectedSlotIndex);
            if (heldItem) {
                const weaponName = heldItem.nameTag || heldItem.typeId.replace("minecraft:", "").replace(/_/g, " ");
                deathCause = `${killerName}'s ${weaponName}`;
            }
        }
        
        // Create the skull item
        const skull = new ItemStack("minecraft:skeleton_skull", 1);
        skull.nameTag = `§c${deadPlayerName}`;
        skull.setLore([
            `§7Died on ${dateString}`,
            `§7Due to ${deathCause}`
        ]);
        
        // Spawn the skull at the dead player's location
        deadEntity.dimension.spawnItem(skull, deadEntity.location);
        
        console.log(`Player skull dropped: ${deadPlayerName} killed by ${killerName} on ${dateString}`);
    } catch (error) {
        console.error("Error creating player skull:", error);
    }
});
