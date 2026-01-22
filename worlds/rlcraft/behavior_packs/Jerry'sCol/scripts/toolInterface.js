import { world, system, ItemStack } from "@minecraft/server";
import { ModalFormData, ActionFormData, MessageFormData } from "@minecraft/server-ui";


// All allowed items
const ALLOWED_ITEMS = {
    // Vanilla Swords
    'minecraft:wooden_sword': 'Wooden Sword',
    'minecraft:stone_sword': 'Stone Sword',
    'minecraft:iron_sword': 'Iron Sword',
    'minecraft:gold_sword': 'Gold Sword',
    'minecraft:diamond_sword': 'Diamond Sword',
    'minecraft:netherite_sword': 'Netherite Sword',
    'minecraft:copper_sword': 'Copper Sword',

    // Bows
    'minecraft:bow': 'Bow',

    // Spears
    'minecraft:wooden_spear': 'Wooden Spear',
    'minecraft:stone_spear': 'Stone Spear',
    'minecraft:iron_spear': 'Iron Spear',
    'minecraft:golden_spear': 'Golden Spear',
    'minecraft:diamond_spear': 'Diamond Spear',
    'minecraft:netherite_spear': 'Netherite Spear',

    // Vanilla Armor
    'minecraft:leather_helmet': 'Leather Helmet',
    'minecraft:leather_chestplate': 'Leather Chestplate',
    'minecraft:leather_leggings': 'Leather Leggings',
    'minecraft:leather_boots': 'Leather Boots',
    'minecraft:chainmail_helmet': 'Chainmail Helmet',
    'minecraft:chainmail_chestplate': 'Chainmail Chestplate',
    'minecraft:chainmail_leggings': 'Chainmail Leggings',
    'minecraft:chainmail_boots': 'Chainmail Boots',
    'minecraft:iron_helmet': 'Iron Helmet',
    'minecraft:iron_chestplate': 'Iron Chestplate',
    'minecraft:iron_leggings': 'Iron Leggings',
    'minecraft:iron_boots': 'Iron Boots',
    'minecraft:golden_helmet': 'Golden Helmet',
    'minecraft:golden_chestplate': 'Golden Chestplate',
    'minecraft:golden_leggings': 'Golden Leggings',
    'minecraft:golden_boots': 'Golden Boots',
    'minecraft:diamond_helmet': 'Diamond Helmet',
    'minecraft:diamond_chestplate': 'Diamond Chestplate',
    'minecraft:diamond_leggings': 'Diamond Leggings',
    'minecraft:diamond_boots': 'Diamond Boots',
    'minecraft:netherite_helmet': 'Netherite Helmet',
    'minecraft:netherite_chestplate': 'Netherite Chestplate',
    'minecraft:netherite_leggings': 'Netherite Leggings',
    'minecraft:netherite_boots': 'Netherite Boots',
    'minecraft:copper_helmet': 'Copper Helmet',
    'minecraft:copper_chestplate': 'Copper Chestplate',
    'minecraft:copper_leggings': 'Copper Leggings',
    'minecraft:copper_boots': 'Copper Boots'
};

// Function to check if an item is allowed based on namespace and patterns
function isItemAllowed(itemId) {
    // Check if it's in the hardcoded ALLOWED_ITEMS list (vanilla items)
    if (ALLOWED_ITEMS[itemId]) {
        return true;
    }
    
    // Allow all items from specific namespaces (addon items)
    const namespace = itemId.split(':')[0];
    if (namespace === 'dm' || namespace === 'knights' || namespace === 'knight') {
        return true;
    }
    
    return false;
}

// Function to get display name for an item
function getItemDisplayName(itemId) {
    // Check if we have a hardcoded name
    if (ALLOWED_ITEMS[itemId]) {
        return ALLOWED_ITEMS[itemId];
    }
    
    // Generate a name from the item ID
    const itemName = itemId.split(':')[1] || itemId;
    return itemName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Equipment slots for /replaceitem command
const EQUIPMENT_SLOTS = {
    'head': 'armor.head',
    'chest': 'armor.chest',
    'legs': 'armor.legs',
    'feet': 'armor.feet',
    'mainhand': 'weapon.mainhand'
};

const EQUIPMENT_SLOT_NAMES = {
    'armor.head': 'Head',
    'armor.chest': 'Chest',
    'armor.legs': 'Legs',
    'armor.feet': 'Feet',
    'weapon.mainhand': 'Main Hand'
};

function getEquipmentSlot(itemId) {
    // Helmets and head armor
    if (itemId.includes('helmet')) return 'armor.head';
    if (itemId.includes('helm')) return 'armor.head';
    if (itemId.includes('armet')) return 'armor.head';
    if (itemId.includes('hat')) return 'armor.head';
    if (itemId.includes('sallet')) return 'armor.head';
    if (itemId.includes('bascinet')) return 'armor.head';
    if (itemId.includes('barbute')) return 'armor.head';
    if (itemId.includes('burgonet')) return 'armor.head';
    if (itemId.includes('kettlehat')) return 'armor.head';
    if (itemId.includes('cabasset')) return 'armor.head';
    if (itemId.includes('morion')) return 'armor.head';
    if (itemId.includes('coif')) return 'armor.head';
    if (itemId.includes('cap')) return 'armor.head';
    if (itemId.includes('cervelliere')) return 'armor.head';
    if (itemId.includes('savoyard')) return 'armor.head';
    if (itemId.includes('sturmhaube')) return 'armor.head';
    if (itemId.includes('bicoque')) return 'armor.head';
    if (itemId.includes('visored_kettle')) return 'armor.head';
    if (itemId.includes('klapvisor')) return 'armor.head';
    
    // Chestplates and chest armor
    if (itemId.includes('chestplate')) return 'armor.chest';
    if (itemId.includes('armour')) return 'armor.chest';
    if (itemId.includes('breastplate')) return 'armor.chest';
    if (itemId.includes('brigadine')) return 'armor.chest';
    if (itemId.includes('puff_slash1')) return 'armor.chest';
    
    // Leggings
    if (itemId.includes('leggings')) return 'armor.legs';
    if (itemId.includes('tontlet')) return 'armor.legs';
    if (itemId.includes('cod_piece')) return 'armor.legs';
    if (itemId.includes('puff_slash2')) return 'armor.legs';
    
    // Boots
    if (itemId.includes('boots')) return 'armor.feet';
    if (itemId.includes('hood')) return 'armor.feet';
    if (itemId.includes('pauldrons')) return 'armor.feet';
    if (itemId.includes('besegews')) return 'armor.feet';
    if (itemId.includes('bevor')) return 'armor.feet';
    if (itemId.includes('plackart')) return 'armor.feet';
    if (itemId.includes('eranche')) return 'armor.feet';
    if (itemId.includes('golden_ball')) return 'armor.feet';
    if (itemId.includes('golden_cross')) return 'armor.feet';
    if (itemId.includes('golden_necklace')) return 'armor.feet';
    if (itemId.includes('cloak')) return 'armor.feet';
    if (itemId.includes('hanging_cloth')) return 'armor.feet';
    if (itemId.includes('landsknecht_layer')) return 'armor.feet';
    if (itemId.includes('robe')) return 'armor.feet';
    if (itemId.includes('giornea')) return 'armor.feet';
    if (itemId.includes('torse')) return 'armor.feet';
    if (itemId.includes('mantle')) return 'armor.feet';
    
    // Weapons - swords and melee weapons
    if (itemId.includes('sword')) return 'weapon.mainhand';
    if (itemId.includes('bow')) return 'weapon.mainhand';
    if (itemId.includes('axe')) return 'weapon.mainhand';
    if (itemId.includes('mace')) return 'weapon.mainhand';
    if (itemId.includes('hammer')) return 'weapon.mainhand';
    if (itemId.includes('spear')) return 'weapon.mainhand';
    if (itemId.includes('lance')) return 'weapon.mainhand';
    if (itemId.includes('dagger')) return 'weapon.mainhand';
    if (itemId.includes('pick')) return 'weapon.mainhand';
    if (itemId.includes('halberd')) return 'weapon.mainhand';
    if (itemId.includes('poleaxe')) return 'weapon.mainhand';
    if (itemId.includes('billhook')) return 'weapon.mainhand';
    if (itemId.includes('fauchard')) return 'weapon.mainhand';
    if (itemId.includes('glaive')) return 'weapon.mainhand';
    if (itemId.includes('partisan')) return 'weapon.mainhand';
    if (itemId.includes('voulge')) return 'weapon.mainhand';
    if (itemId.includes('guisarme')) return 'weapon.mainhand';
    if (itemId.includes('fork')) return 'weapon.mainhand';
    if (itemId.includes('beak')) return 'weapon.mainhand';
    if (itemId.includes('falchion')) return 'weapon.mainhand';
    if (itemId.includes('cutlass')) return 'weapon.mainhand';
    if (itemId.includes('rapier')) return 'weapon.mainhand';
    if (itemId.includes('sabre')) return 'weapon.mainhand';
    if (itemId.includes('saber')) return 'weapon.mainhand';
    if (itemId.includes('messer')) return 'weapon.mainhand';
    if (itemId.includes('seax')) return 'weapon.mainhand';
    if (itemId.includes('feder')) return 'weapon.mainhand';
    if (itemId.includes('longsword')) return 'weapon.mainhand';
    if (itemId.includes('greatsword')) return 'weapon.mainhand';
    if (itemId.includes('sidesword')) return 'weapon.mainhand';
    if (itemId.includes('sickle')) return 'weapon.mainhand';
    if (itemId.includes('stylet')) return 'weapon.mainhand';
    if (itemId.includes('sword_breaker')) return 'weapon.mainhand';
    
    return null;
}

// Test for specific items in equipment slots
function testForItem(citizen, itemId, slot) {
    try {
        const result = citizen.runCommand(`testfor @s[hasitem={item=${itemId},location=slot.${slot}}]`);
        return result.successCount > 0;
    } catch (e) {
        return false;
    }
}

// Get all items in a specific slot
function getItemInSlot(citizen, slot) {
    // First check hardcoded items for performance
    for (const [itemId, itemName] of Object.entries(ALLOWED_ITEMS)) {
        if (testForItem(citizen, itemId, slot)) {
            return {
                id: itemId,
                name: itemName,
                slot: slot
            };
        }
    }
    
    // Try to get the item from the citizen's equipment component
    try {
        const equipment = citizen.getComponent('minecraft:equippable');
        if (equipment) {
            let slotName;
            if (slot === 'armor.head') slotName = 'Head';
            else if (slot === 'armor.chest') slotName = 'Chest';
            else if (slot === 'armor.legs') slotName = 'Legs';
            else if (slot === 'armor.feet') slotName = 'Feet';
            else if (slot === 'weapon.mainhand') slotName = 'Mainhand';
            
            if (slotName) {
                const item = equipment.getEquipment(slotName);
                if (item && isItemAllowed(item.typeId)) {
                    return {
                        id: item.typeId,
                        name: getItemDisplayName(item.typeId),
                        slot: slot
                    };
                }
            }
        }
    } catch (e) {
        // Equipment component not available, continue with testfor method
    }
    
    return null;
}

function getCurrentEquipment(citizen) {
    const equipment = {};

    // Check each equipment slot for specific items
    for (const [slotName, slot] of Object.entries(EQUIPMENT_SLOTS)) {
        const item = getItemInSlot(citizen, slot);
        if (item) {
            equipment[slotName] = {
                slot: slot,
                name: item.name,
                hasItem: true,
                itemId: item.id
            };
        } else {
            equipment[slotName] = null;
        }
    }

    return equipment;
}

function buildEquipmentText(equipment) {
    let text = "§6=== Currently Equipped ===§r\n";

    let hasEquipment = false;
    for (const [slotName, item] of Object.entries(equipment)) {
        if (item && item.hasItem) {
            text += `${EQUIPMENT_SLOT_NAMES[item.slot]}:§r ${item.name}§r\n`;
            hasEquipment = true;
        }
    }
    if (!hasEquipment) {
        text += "Nothing equipped§r\n";
    }

    text += "\nHold armor or weapon and click buttons below§r";

    return text;
}

function showEquipmentManagement(player, citizen) {
    const equipment = getCurrentEquipment(citizen);

    const form = new ActionFormData();
    form.title("§lCitizen Equipment§r");
    form.body(buildEquipmentText(equipment));

    // Check if this is a knight with cavalry spear equipped
    const isKnight = citizen.typeId === "jerrys_colonies:knight";
    const spearTiers = ["minecraft:wooden_spear", "minecraft:stone_spear", "minecraft:iron_spear", "minecraft:golden_spear", "minecraft:diamond_spear", "minecraft:netherite_spear"];
    const hasCavalrySpear = equipment.mainhand && spearTiers.includes(equipment.mainhand.itemId);
    
    // Only show "Equip Held Item" button if knight doesn't have cavalry spear
    if (!isKnight || !hasCavalrySpear) {
        form.button("Equip Held Item", "textures/ui/icon_armor");
    }
    
    form.button("Take All Equipment", "textures/ui/icon_import");
    form.button("Close", "textures/ui/cancel");

    form.show(player).then(response => {
        if (response.canceled) return;

        // Adjust button indices based on whether "Equip Held Item" button is shown
        const equipButtonHidden = isKnight && hasCavalrySpear;
        
        if (!equipButtonHidden) {
            // Normal button layout: [0] Equip, [1] Take All, [2] Close
            switch (response.selection) {
                case 0:
                    equipHeldItem(player, citizen);
                    break;
                case 1:
                    takeAllEquipment(player, citizen);
                    break;
                case 2:
                    // Close
                    break;
            }
        } else {
            // Modified layout: [0] Take All, [1] Close
            switch (response.selection) {
                case 0:
                    takeAllEquipment(player, citizen);
                    break;
                case 1:
                    // Close
                    break;
            }
        }
    });
}

function equipHeldItem(player, citizen) {
    try {
        const playerInventory = player.getComponent('minecraft:inventory');
        if (!playerInventory || !playerInventory.container) {
            player.sendMessage("§cCould not access your inventory!");
            return;
        }

        const playerContainer = playerInventory.container;
        const handItem = playerContainer.getItem(player.selectedSlotIndex);

        if (!handItem) {
            player.sendMessage("§cHold an armor piece or weapon in your hand!");
            return;
        }

        const itemId = handItem.typeId;

        // Only allow armor and weapons
        if (!isItemAllowed(itemId)) {
            player.sendMessage("§cCitizens can only equip armor and weapons!");
            return;
        }

        // Determine the correct equipment slot
        const targetSlot = getEquipmentSlot(itemId);
        
        if (!targetSlot) {
            player.sendMessage("§cThis item cannot be equipped!");
            return;
        }

        // Special handling for cavalry spear on knights - remove all armor first
        const isKnight = citizen.typeId === "jerrys_colonies:knight";
        const spearTiers = ["minecraft:wooden_spear", "minecraft:stone_spear", "minecraft:iron_spear", "minecraft:golden_spear", "minecraft:diamond_spear", "minecraft:netherite_spear"];
        const isCavalrySpear = spearTiers.includes(itemId);
        
        if (isKnight && isCavalrySpear) {
            // Get current equipment
            const equipment = getCurrentEquipment(citizen);
            const armorSlots = ['head', 'chest', 'legs', 'feet'];
            let removedArmor = false;
            
            // Remove and give back all armor pieces
            for (const slotName of armorSlots) {
                const item = equipment[slotName];
                if (item && item.hasItem) {
                    try {
                        // Give the armor to player
                        const giveCommand = `give ${player.name} ${item.itemId} 1`;
                        citizen.dimension.runCommand(giveCommand);
                        
                        // Clear the armor slot
                        const clearCommand = `replaceitem entity @s slot.${item.slot} 0 air`;
                        citizen.runCommand(clearCommand);
                        
                        removedArmor = true;
                    } catch (e) {
                        console.warn(`Error removing ${item.name} from ${slotName}:`, e);
                    }
                }
            }
            
            if (removedArmor) {
                player.sendMessage("§eRemoved all armor from knight (cavalry don't wear armor)!");
            }
        }

        // Check if slot is already occupied
        const currentItem = getItemInSlot(citizen, targetSlot);
        if (currentItem) {
            player.sendMessage(`§cCitizen already has ${currentItem.name} equipped! Use 'Take All Equipment' first.`);
            return;
        }

        // Use /replaceitem command as the entity with @s
        const command = `replaceitem entity @s slot.${targetSlot} 0 ${itemId} 1`;

        const result = citizen.runCommand(command);

        if (result.successCount > 0) {
            // Remove from player's hand (only 1 item)
            if (handItem.amount > 1) {
                handItem.amount -= 1;
                playerContainer.setItem(player.selectedSlotIndex, handItem);
            } else {
                playerContainer.setItem(player.selectedSlotIndex, null);
            }

            player.sendMessage(`§aEquipped ${getItemDisplayName(itemId)} to citizen!`);
            
            // Check if this is a knight and update archer/melee status after a small delay
            if (citizen.typeId === "jerrys_colonies:knight") {
                system.runTimeout(() => {
                    updateKnightCombatMode(citizen);
                }, 2);
            }
        } else {
            player.sendMessage("§cFailed to equip item!");
        }

    } catch (error) {
        player.sendMessage(`§cError equipping item: ${error.message}`);
    }
}

// Update knight to archer, cavalry, or melee mode based on equipped weapon
function updateKnightCombatMode(knight) {
    try {
        // Check if knight has a bow in mainhand
        const hasBow = testForItem(knight, "minecraft:bow", "weapon.mainhand");
        
        // Check if knight has a cavalry spear in mainhand
        const spearTiers = ["minecraft:wooden_spear", "minecraft:stone_spear", "minecraft:iron_spear", "minecraft:golden_spear", "minecraft:diamond_spear", "minecraft:netherite_spear"];
        const hasCavalrySpear = spearTiers.some(spear => testForItem(knight, spear, "weapon.mainhand"));
        
        // Get current variant to check current mode
        const variantComponent = knight.getComponent('minecraft:variant');
        const currentVariant = variantComponent ? variantComponent.value : 1;
        
        if (hasCavalrySpear && currentVariant !== 3) {
            // Knight has cavalry spear but not in cavalry mode - switch to cavalry
            knight.triggerEvent("become_cavalry");
            console.warn(`Knight switched to CAVALRY mode (variant: ${currentVariant} -> 3)`);
        } else if (hasBow && currentVariant !== 2) {
            // Knight has bow but not in archer mode - switch to archer
            knight.triggerEvent("become_archer");
            console.warn(`Knight switched to ARCHER mode (variant: ${currentVariant} -> 2)`);
        } else if (!hasBow && !hasCavalrySpear && (currentVariant === 2 || currentVariant === 3)) {
            // Knight doesn't have bow or cavalry spear but is in archer/cavalry mode - switch to melee
            knight.triggerEvent("become_melee");
            console.warn(`Knight switched to MELEE mode (variant: ${currentVariant} -> 1)`);
        }
    } catch (error) {
        console.warn("Error updating knight combat mode:", error);
    }
}

function takeAllEquipment(player, citizen) {
    try {
        const playerInventory = player.getComponent('minecraft:inventory');
        if (!playerInventory || !playerInventory.container) {
            player.sendMessage("§cCould not access your inventory!");
            return;
        }

        const playerContainer = playerInventory.container;
        let takenCount = 0;

        // Get all current equipment
        const equipment = getCurrentEquipment(citizen);

        // For each equipped item, give it to the player
        for (const [slotName, item] of Object.entries(equipment)) {
            if (item && item.hasItem) {
                try {
                    // Give the item to player using command
                    const giveCommand = `give ${player.name} ${item.itemId} 1`;
                    citizen.dimension.runCommand(giveCommand);

                    // Clear the equipment slot
                    const clearCommand = `replaceitem entity @s slot.${item.slot} 0 air`;
                    citizen.runCommand(clearCommand);

                    takenCount++;

                } catch (e) {
                    console.warn(`Error taking ${item.name} from ${slotName}:`, e);
                }
            }
        }

        // Also try to take any items from the citizen's inventory
        try {
            const citizenInventory = citizen.getComponent('minecraft:inventory');
            if (citizenInventory && citizenInventory.container) {
                const citizenContainer = citizenInventory.container;

                // Check all inventory slots
                for (let i = 0; i < citizenContainer.size; i++) {
                    const item = citizenContainer.getItem(i);
                    if (item && isItemAllowed(item.typeId)) {
                        try {
                            // Try to add to player's inventory
                            const result = playerContainer.addItem(item);
                            if (!result) {
                                // Successfully added, remove from citizen
                                citizenContainer.setItem(i, null);
                                takenCount++;
                            }
                        } catch (e) {
                            console.warn(`Error taking inventory item from slot ${i}:`, e);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Could not access citizen inventory:", e);
        }

        if (takenCount > 0) {
            player.sendMessage(`§aTook ${takenCount} items from citizen!`);
            
            // Check if this is a knight and update archer/melee status after a small delay
            if (citizen.typeId === "jerrys_colonies:knight") {
                system.runTimeout(() => {
                    updateKnightCombatMode(citizen);
                }, 2);
            }
        } else {
            player.sendMessage("§cNo items to take!");
        }

    } catch (error) {
        player.sendMessage(`§cError taking equipment: ${error.message}`);
    }

    // Refresh the equipment view
    system.runTimeout(() => {
        showEquipmentManagement(player, citizen);
    }, 10);
}

// Main interaction handler
world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const entity = event.target;

    // Handle both citizens and knights
    const isCitizenOrKnight = entity.typeId === "jerrys_colonies:citizen" || entity.typeId === "jerrys_colonies:knight";
    
    if (isCitizenOrKnight && player.isSneaking) {
        // For knights, check colony membership and permissions
        if (entity.typeId === "jerrys_colonies:knight") {
            // Get knight's colony
            const knightTags = entity.getTags();
            const knightColonyTag = knightTags.find(tag => tag.startsWith("colony_id:"));
            
            if (!knightColonyTag) {
                event.cancel = true;
                system.run(() => {
                    player.sendMessage("§cThis knight doesn't belong to any colony!");
                });
                return;
            }
            
            const knightColonyId = knightColonyTag.substring("colony_id:".length);
            
            // Get player's colony
            const playerTags = player.getTags();
            const playerColonyTag = playerTags.find(tag => tag.startsWith("colony_member:"));
            
            if (!playerColonyTag) {
                event.cancel = true;
                system.run(() => {
                    player.sendMessage("§cYou must be in a colony to manage knights!");
                });
                return;
            }
            
            const playerColonyId = playerColonyTag.substring("colony_member:".length);
            
            // Check if same colony
            if (knightColonyId !== playerColonyId) {
                event.cancel = true;
                system.run(() => {
                    player.sendMessage("§cYou can only manage knights from your own colony!");
                });
                return;
            }
            
            // Check permissions by loading colony data directly
            event.cancel = true;
            system.run(() => {
                try {
                    // Load colonies from world data
                    const coloniesDataStr = world.getDynamicProperty("saved_colonies");
                    if (!coloniesDataStr) {
                        player.sendMessage("§cCould not load colony data!");
                        return;
                    }
                    
                    const coloniesData = JSON.parse(coloniesDataStr);
                    const colony = coloniesData[playerColonyId];
                    
                    if (!colony) {
                        player.sendMessage("§cCould not find your colony!");
                        return;
                    }
                    
                    // Check if player is colony owner (check both ownerId and owner name for old colonies)
                    const isOwner = colony.ownerId === player.id || colony.owner === player.name;
                    
                    // Check if player has commandKnights permission through their rank
                    let hasCommandKnightsPermission = false;
                    if (!isOwner && colony.ranks && colony.playerRanks && colony.playerRanks[player.name]) {
                        const rankId = colony.playerRanks[player.name];
                        const rank = colony.ranks.find(r => r.id === rankId);
                        if (rank && rank.permissions) {
                            hasCommandKnightsPermission = rank.permissions.commandKnights === true;
                        }
                    }
                    
                    console.warn(`[KNIGHT EQUIPMENT] Player ${player.name} - isOwner: ${isOwner}, hasPermission: ${hasCommandKnightsPermission}`);
                    
                    if (!isOwner && !hasCommandKnightsPermission) {
                        player.sendMessage("§cYou don't have permission to manage knight equipment!");
                        return;
                    }
                    
                    // Player has permission - show equipment UI
                    showEquipmentManagement(player, entity);
                } catch (error) {
                    console.warn("[KNIGHT EQUIPMENT] Error checking permissions:", error, error.stack);
                    player.sendMessage("§cError checking permissions!");
                }
            });
            return;
        }
        
        event.cancel = true;

        system.run(() => {
            showEquipmentManagement(player, entity);
        });
    }
});