import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";

// Armas permitidas
const allowedWeapons = [
  "minecraft:wooden_sword",
  "minecraft:wooden_axe",
  "minecraft:stone_sword",
  "minecraft:stone_axe",
  "minecraft:golden_sword",
  "minecraft:golden_axe",
  "minecraft:iron_sword",
  "minecraft:iron_axe",
  "minecraft:diamond_sword",
  "minecraft:diamond_axe",
  "minecraft:netherite_sword",
  "minecraft:netherite_axe"
];

// Weapon preference (the higher the number, the better)
const weaponPreference = new Map([
  ["minecraft:wooden_axe", 0],
  ["minecraft:wooden_sword", 1],
  ["minecraft:stone_axe", 2],
  ["minecraft:stone_sword", 3],
  ["minecraft:golden_axe", 4],
  ["minecraft:golden_sword", 5],
  ["minecraft:iron_axe", 6],
  ["minecraft:iron_sword", 7],
  ["minecraft:diamond_axe", 8],
  ["minecraft:diamond_sword", 9],
  ["minecraft:netherite_axe", 10],
  ["minecraft:netherite_sword", 11]
]);

const goblinStolenCache = new Map();
const goblinFirstTheftDone = new Set();

// Calcula uma posição atrás do goblin, em relação ao jogador
function getDropPositionAwayFromPlayer(goblin, player, distance = 0.7) {
  const dx = goblin.location.x - player.location.x;
  const dz = goblin.location.z - player.location.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const nx = dx / length;
  const nz = dz / length;

  return {
    x: goblin.location.x + nx * distance,
    y: goblin.location.y + 1,
    z: goblin.location.z + nz * distance
  };
}

world.afterEvents.entityHitEntity.subscribe(event => {
  const { damagingEntity: goblin, hitEntity: player } = event;

  if (!player?.typeId?.includes("player")) return;
  if (goblin?.typeId !== "ecbl_bs:goblin") return;

  const heldItem = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  if (!heldItem || heldItem.typeId === "minecraft:air") return;

  const enchantable = heldItem.getComponent("enchantable");

  const knownEnchantments = [
    "sharpness", "smite", "bane_of_arthropods", "unbreaking",
    "fire_aspect", "looting", "knockback", "mending",
    "efficiency", "fortune", "silk_touch"
  ];

  for (const enchant of knownEnchantments) {
    const level = enchantable?.getEnchantment(enchant)?.level ?? 0;
    if (level > 0) {
      //goblin.runCommandAsync(`say Ignorando item encantado`);
      return;
    }
  }

  if (!allowedWeapons.includes(heldItem.typeId)) {
    //goblin.runCommandAsync(`say Item não permitido: ${heldItem.typeId}`);
    return;
  }

  // Chance de roubo (20%)
  const chance = Math.random();
  if (chance > 0.5) {
    //goblin.runCommandAsync(`say Tentei roubar mas falhei`);
    return;
  }

  const goblinId = goblin.id;
  const newWeaponLevel = weaponPreference.get(heldItem.typeId) ?? -1;
  const currentWeaponData = goblinStolenCache.get(goblinId);
  const oldWeaponLevel = currentWeaponData ? (weaponPreference.get(currentWeaponData.typeId) ?? -1) : -1;

  if (newWeaponLevel <= oldWeaponLevel) {
    //goblin.runCommandAsync(`say Minha arma atual é melhor`);
    return;
  }

  // Dropa a adaga no primeiro roubo
  if (!goblinFirstTheftDone.has(goblinId)) {
    const dagger = new ItemStack("ecbl_bs:dagger", 1);
    const dropPos = getDropPositionAwayFromPlayer(goblin, player);
    goblin.dimension.spawnItem(dagger, dropPos);
   // //goblin.runCommandAsync(`say Dropando adaga inicial`);
    goblinFirstTheftDone.add(goblinId);
  } else if (currentWeaponData && currentWeaponData.typeId !== "minecraft:air") {
    const drop = new ItemStack(currentWeaponData.typeId, currentWeaponData.amount);
    const dropPos = getDropPositionAwayFromPlayer(goblin, player);
    goblin.dimension.spawnItem(drop, dropPos);
    //goblin.runCommandAsync(`say Dropado: ${currentWeaponData.typeId}`);
  }

  // Salva nova arma
  goblinStolenCache.set(goblinId, {
    typeId: heldItem.typeId,
    amount: heldItem.amount
  });

  // Remove item da mão do jogador
  const playerInventory = player.getComponent("minecraft:inventory")?.container;
  if (playerInventory) {
    for (let i = 0; i < 9; i++) {
      const item = playerInventory.getItem(i);
      if (item && item.typeId === heldItem.typeId) {
        playerInventory.setItem(i, undefined);
        break;
      }
    }
  }

  // Equipa o goblin com o novo item
  system.runTimeout(() => {
    goblin.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand 0 ${heldItem.typeId} ${heldItem.amount}`);
    //goblin.runCommandAsync(`say Roubei: ${heldItem.typeId}`);
  }, 1);
});
