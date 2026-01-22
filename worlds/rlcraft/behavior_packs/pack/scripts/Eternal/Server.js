import {
  Dimension,
  Entity,
  BlockPermutation,
  Player,
  WorldAfterEvents,
  EntityComponentTypes,
  Container,
  ItemStack,
  World,
  Block,
  ItemComponentTypes,
  ScriptEventCommandMessageAfterEvent,
  ScriptEventSource,
  EquipmentSlot,
  GameMode,
  DimensionTypes,
  BlockComponentTypes,
  BlockTypes,
  WeatherType,
} from "@minecraft/server";
import {
  Vector2,
  EntityJumpAfterEventSignal,
  EntityStartJumpingAfterEventSignal,
  EntityStopJumpingAfterEventSignal,
  PlayerOnAirJumpAfterEventSignal,
  PlayerOnLandAfterEventSignal,
  PlayerOnEquipAfterEventSignal,
  PlayerOnUnequipAfterEventSignal,
  Vector3,
} from "./Classes";
import { afterEvents, beforeEvents } from "./Constants";
import { runTimeout, runCommand, runCommandAsync, arraysEqual } from "./Utils";

const errors = {
  DURABILITY_MISSING: `Item must have 'minecraft:durability' component.`,
  INVALID_HEALTH: `Entity has no valid health component.`,
  VARIANT_MISSING: `Entity must have 'minecraft:variant' component.`,
  RIDING_MISSING: `Entity must have 'minecraft:rideable' component.`,
  TYPE_FAMILY_MISSING: `Entity must have 'minecraft:type_family' component.`,
  MOVEMENT_MISSING: `Entity must have 'minecraft:movement' component.`,
};

// WorldAfterEvents methods

Object.defineProperty(WorldAfterEvents.prototype, "entityJump", {
  get: function () {
    return new EntityJumpAfterEventSignal();
  },
});
Object.defineProperty(WorldAfterEvents.prototype, "entityStartJumping", {
  get: function () {
    return new EntityStartJumpingAfterEventSignal();
  },
});
Object.defineProperty(WorldAfterEvents.prototype, "entityStopJumping", {
  get: function () {
    return new EntityStopJumpingAfterEventSignal();
  },
});
Object.defineProperty(WorldAfterEvents.prototype, "playerOnAirJump", {
  get: function () {
    return new PlayerOnAirJumpAfterEventSignal();
  },
});
Object.defineProperty(WorldAfterEvents.prototype, "playerOnLand", {
  get: function () {
    return new PlayerOnLandAfterEventSignal();
  },
});

Object.defineProperty(WorldAfterEvents.prototype, "playerOnUnequip", {
  get: function () {
    return new PlayerOnUnequipAfterEventSignal();
  },
});

Object.defineProperty(WorldAfterEvents.prototype, "playerOnEquip", {
  get: function () {
    return new PlayerOnEquipAfterEventSignal();
  },
});

// World methods
Object.defineProperty(World.prototype, "getEntities", {
  value: function (selector) {
    const dimensionTypes = DimensionTypes.getAll();

    const entities = new Set();
    for (const type of dimensionTypes) {
      const dimension = this.getDimension(type.typeId);
      if (dimension) {
        dimension.getEntities(selector).forEach((entity) => {
          entities.add(entity);
        });
      }
    }

    return Array.from(entities);
  },
});

Object.defineProperty(World.prototype, "players", {
  get: function () {
    return this.getAllPlayers();
  },
  enumerable: true,
});

// ItemStack methods
Object.defineProperty(ItemStack.prototype, "isVanillaBlock", {
  get: function () {
    if (BlockTypes.get(this.typeId)) return true;
    return false;
  },
});
Object.defineProperty(ItemStack.prototype, "compare", {
  value: function (itemStack) {
    if (itemStack === null || itemStack === undefined) return false;
    if (
      this.amount === itemStack.amount &&
      this.isStackable === itemStack.isStackable &&
      this.keepOnDeath === itemStack.keepOnDeath &&
      this.lockMode === itemStack.lockMode &&
      this.maxAmount === itemStack.maxAmount &&
      this.nameTag === itemStack.nameTag &&
      this.type === itemStack.type &&
      this.typeId === itemStack.typeId &&
      arraysEqual(this.getCanDestroy(), itemStack.getCanDestroy()) &&
      arraysEqual(this.getComponents(), itemStack.getComponents()) &&
      arraysEqual(this.getComponents(), itemStack.getComponents()) &&
      arraysEqual(this.getLore(), itemStack.getLore()) &&
      arraysEqual(this.getTags(), itemStack.getTags()) &&
      this.getDynamicPropertyTotalByteCount() === itemStack.getDynamicPropertyTotalByteCount()
    ) {
      return true;
    }
    return false;
  },
});

Object.defineProperty(ItemStack.prototype, "enchantableComponent", {
  get: function () {
    return this.getComponent(ItemComponentTypes.Enchantable);
  },
  enumerable: true,
});

Object.defineProperty(ItemStack.prototype, "enchantmentSlots", {
  get: function () {
    return this.enchantableComponent?.slots;
  },
  enumerable: true,
});

Object.defineProperty(ItemStack.prototype, "addEnchantments", {
  value: function (...enchantments) {
    const enchantmentList = enchantments.flat();

    enchantmentList.forEach((ench) => this.enchantableComponent?.addEnchantments(ench));
  },
});

Object.defineProperty(ItemStack.prototype, "canAddEnchantment", {
  value: function (enchantment) {
    return this.enchantableComponent?.canAddEnchantment(enchantment);
  },
});

Object.defineProperty(ItemStack.prototype, "getEnchantment", {
  value: function (enchantmentType) {
    return this.enchantableComponent?.getEnchantment(enchantmentType);
  },
});
Object.defineProperty(ItemStack.prototype, "hasEnchantment", {
  value: function (enchantmentType) {
    try {
      return this.enchantableComponent?.hasEnchantment(enchantmentType);
    } catch (e) {
      return false;
    }
  },
});

Object.defineProperty(ItemStack.prototype, "removeEnchantment", {
  value: function (enchantmentType) {
    return this.enchantableComponent?.removeEnchantment(enchantmentType);
  },
});

Object.defineProperty(ItemStack.prototype, "removeEnchantments", {
  value: function () {
    return this.enchantableComponent?.removeAllEnchantments();
  },
});

Object.defineProperty(ItemStack.prototype, "durabilityComponent", {
  get: function () {
    return this.getComponent(ItemComponentTypes.Durability);
  },
  enumerable: true,
});

Object.defineProperty(ItemStack.prototype, "durability", {
  get: function () {
    return this.durabilityComponent.maxDurability - this.durabilityComponent.damage;
  },
  set: function (durability) {
    let newDamage = this.durabilityComponent.maxDurability - durability;
    if (newDamage < 0) {
      newDamage = 0;
    } else if (newDamage > this.durabilityComponent.maxDurability) {
      newDamage = this.durabilityComponent.maxDurability;
    }

    this.durabilityComponent.damage = newDamage;
  },
  enumerable: true,
});
Object.defineProperty(ItemStack.prototype, "maxDurability", {
  get: function () {
    return this.durabilityComponent.maxDurability;
  },
  enumerable: true,
});

// Block methods

Object.defineProperty(Block.prototype, "getAdjacentBlocks", {
  value: function () {
    const adjacentBlocks = [];
    const offsets = [
      [-1, -1, -1],
      [-1, -1, 0],
      [-1, -1, 1],
      [-1, 0, -1],
      [-1, 0, 0],
      [-1, 0, 1],
      [-1, 1, -1],
      [-1, 1, 0],
      [-1, 1, 1],
      [0, -1, -1],
      [0, -1, 0],
      [0, -1, 1],
      [0, 0, -1],
      [0, 0, 1],
      [0, 1, -1],
      [0, 1, 0],
      [0, 1, 1],
      [1, -1, -1],
      [1, -1, 0],
      [1, -1, 1],
      [1, 0, -1],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, -1],
      [1, 1, 0],
      [1, 1, 1],
    ];

    for (let i = 0; i < offsets.length; i++) {
      const [dx, dy, dz] = offsets[i];
      const adjacentBlock = this.offset(new Vector3(dx, dy, dz));
      if (adjacentBlock) adjacentBlocks.push(adjacentBlock);
    }
    return adjacentBlocks;
  },
});

Object.defineProperty(Block.prototype, "getState", {
  value: function (state) {
    return this.permutation.getState(state);
  },
});

Object.defineProperty(Block.prototype, "setState", {
  value: function (state, value) {
    const perm = this.permutation.withState(state, value);
    this.setPermutation(perm);
    return perm;
  },
});

Object.defineProperty(Block.prototype, "inventoryComponent", {
  get: function () {
    return this.getComponent(BlockComponentTypes.Inventory);
  },
  enumerable: true,
});

Object.defineProperty(Block.prototype, "inventory", {
  get: function () {
    return this.inventoryComponent.container;
  },
});

Object.defineProperty(Block.prototype, "getItems", {
  value: function (typeId) {
    const map = new Map();
    const inv = this.inventory;
    for (let i = 0; i < inv.size; i++) {
      const item = inv.getItem(i);
      if (item) {
        if (typeId) {
          if (item.typeId === typeId) map.set(i, item);
        } else map.set(i, item);
      }
    }

    return map;
  },
});

// Player methods

Object.defineProperty(Player.prototype, "isMortal", {
  get: function () {
    return this.gamemode === "survival" || this.gamemode === "adventure";
  },
  enumerable: true,
});

Object.defineProperty(Player.prototype, "clearItem", {
  value: function (typeId, maxCount = "", data = -1) {
    this.runCommand(`clear @s ${typeId} ${data} ${maxCount}`);
  },
});

Object.defineProperty(Player.prototype, "isUsingItem", {
  get: function () {
    if (playersUsingItem.has(this.id)) return true;
    return false;
  },
  enumerable: true,
});
Object.defineProperty(Player.prototype, "getItems", {
  value: function (typeId) {
    const eMap = new Map();
    const equipmentSlots = Object.values(EquipmentSlot).filter((value) => typeof value === "string");

    for (const slot of equipmentSlots) {
      const item = this.getEquipment(slot);
      if (item) {
        if (typeId) {
          if (item.typeId === typeId) eMap.set(slot, item);
        } else eMap.set(slot, item);
      }
    }

    const iMap = new Map();

    const inv = this.inventory;
    for (let i = 0; i < inv.size; i++) {
      const item = inv.getItem(i);
      if (item) {
        if (typeId) {
          if (item.typeId === typeId) iMap.set(i, item);
        } else iMap.set(i, item);
      }
    }

    return { equipments: eMap, inventory: iMap };
  },
});
Object.defineProperty(Player.prototype, "damageItem", {
  value: function (slot, damage = 1) {
    const eqSlot = this.getEquipmentSlot(slot);
    const item = eqSlot.getItem();
    if (!item) return;

    const unbreaking = item.getEnchantment("unbreaking");
    const unbreakingLevel = unbreaking ? unbreaking.level : 0;
    const unbreakingChance = 1 / (unbreakingLevel + 1);

    if (Math.random() < unbreakingChance && this.gamemode !== GameMode.creative) {
      item.durability -= damage;
      if (item.durability <= 0) {
        eqSlot.setItem(null);
        this.dimension.playSound("random.break", this.location);
      } else {
        eqSlot.setItem(item);
      }
    }
    return item;
  },
});

Object.defineProperty(Player.prototype, "stopSound", {
  value: function (id) {
    this.runCommandAsync(`stopsound @s ${id}`);
  },
});
Object.defineProperty(Player.prototype, "doUseAnimation", {
  value: function () {
    runTimeout(() => {
      const slot = this.getEquipmentSlot(EquipmentSlot.Mainhand);
      const item = slot.getItem();
      slot.setItem(null);

      runTimeout(() => {
        slot.setItem(item);
      }, 2);
    });
  },
});

Object.defineProperty(Player.prototype, "gamemode", {
  get: function () {
    return this.getGameMode();
  },
  set: function (gamemode) {
    this.setGamemode(gamemode);
  },
  enumerable: true,
});

// Entity methods
Object.defineProperty(Entity.prototype, "chunk", {
  get: function () {
    const chunkSize = 16;
    const x = Math.floor(this.x / chunkSize);
    const y = Math.floor(this.y / chunkSize);
    const z = Math.floor(this.z / chunkSize);
    return new Vector3(x, y, z);
  },
});

Object.defineProperty(Entity.prototype, "effectAdd", {
  value: function (effectName, durationInSeconds = 30, amplifier = 0, hideParticles = false) {
    this.runCommand(`effect @s ${effectName} ${durationInSeconds} ${amplifier} ${hideParticles}`);
  },
});

Object.defineProperty(Entity.prototype, "effectClear", {
  value: function (effectType = null) {
    switch (typeof effectType) {
      case "undefined":
        this.runCommand("effect @s clear");
        break;
      case "object":
        if (effectType === null) this.runCommand("effect @s clear");
        else this.runCommand(`effect @s ${effectType.getName()} 0`);
        break;
      case "string":
        this.runCommand(`effect @s ${effectType} 0`);
        break;
    }
  },
});

Object.defineProperty(Entity.prototype, "sendMolang", {
  value: function (molang) {
    this.playAnimation("animation.common.look_at_target", { stopExpression: `${molang} return true;` });
  },
});

Object.defineProperty(Entity.prototype, "entityProjectileComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Projectile);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "projectileOwner", {
  get: function () {
    return this.entityProjectileComponent.owner;
  },
  set: function (player) {
    this.entityProjectileComponent.owner = player;
  },
});

Object.defineProperty(Entity.prototype, "entityItemComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Item);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "toItemStack", {
  value: function () {
    return this.entityItemComponent.itemStack;
  },
});
Object.defineProperty(Entity.prototype, "headLocation", {
  get: function () {
    return this.getHeadLocation();
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "getFacingOffset", {
  value: function (offsetValue) {
    const vd = new Vector3(this.vdx, this.vdy, this.vdz);
    const offset = {
      x: vd.x * offsetValue,
      y: vd.y * offsetValue,
      z: vd.z * offsetValue,
    };

    const hl = new Vector3(this.hx, this.hy, this.hz);

    return hl.offset(offset.x, offset.y, offset.z);
  },
});
Object.defineProperty(Entity.prototype, "viewDirection", {
  get: function () {
    return this.getViewDirection();
  },
  set: function (direction) {
    this.rotation = { x: direction.x, y: direction.y };
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "isPlayer", {
  get: function () {
    return this.typeId === "minecraft:player";
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "movementComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Movement);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "speed", {
  get: function () {
    return this.movementComponent.currentValue;
  },
  set: function (value) {
    return this.movementComponent.setCurrentValue(value);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "healthComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Health);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "health", {
  get: function () {
    if (this.healthComponent) {
      return this.healthComponent.currentValue;
    } else return 0;
  },
  set: function (value) {
    return this.healthComponent.setCurrentValue(value);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "maxHealth", {
  get: function () {
    return this.healthComponent.effectiveMax;
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "missingHealth", {
  get: function () {
    return this.maxHealth - this.health;
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "dispose", {
  value: function () {
    this.remove();
  },
});

Object.defineProperty(Entity.prototype, "equippableComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Equippable);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "getEntities", {
  value: function (filter) {
    if (typeof filter === "string") {
      filter = filter.toEQO();
    }
    filter.location = this.location;
    return this.dimension.getEntities(filter);
  },
});

Object.defineProperty(Entity.prototype, "getEquipment", {
  value: function (slot) {
    return this.equippableComponent?.getEquipment(slot);
  },
});

Object.defineProperty(Entity.prototype, "getEquipmentSlot", {
  value: function (slot) {
    return this.equippableComponent?.getEquipmentSlot(slot);
  },
});

Object.defineProperty(Entity.prototype, "setEquipment", {
  value: function (slot, item) {
    return this.equippableComponent?.setEquipment(slot, item);
  },
});
Object.defineProperty(Entity.prototype, "setEquipmentFromInventory", {
  value: function (slot, slotId) {
    const invItem = this.inventory.getItem(slotId);
    const eqItem = this.equippableComponent?.getEquipment(slot);
    const info = this.equippableComponent?.setEquipment(slot, invItem);
    this.inventory.setItem(slotId, eqItem);
    return info;
  },
});

Object.defineProperty(Entity.prototype, "variantComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Variant);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "getVariant", {
  value: function () {
    return this.variantComponent.value;
  },
});

Object.defineProperty(Entity.prototype, "typeFamilyComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.TypeFamily);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "getTypeFamilies", {
  value: function () {
    return this.typeFamilyComponent?.getTypeFamilies();
  },
});
Object.defineProperty(Entity.prototype, "hasTypeFamily", {
  value: function (typeFamily) {
    return this.typeFamilyComponent?.hasTypeFamily(typeFamily);
  },
});

Object.defineProperty(Entity.prototype, "ridingComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Riding);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "getRide", {
  value: function () {
    return this.ridingComponent.entityRidingOn;
  },
});

Object.defineProperty(Entity.prototype, "getRiders", {
  value: function () {
    return this.ridingComponent.getRiders();
  },
});

Object.defineProperty(Entity.prototype, "inventoryComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Inventory);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "inventory", {
  get: function () {
    return this.inventoryComponent.container;
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "isTamed", {
  get: function () {
    if (this.getComponent(EntityComponentTypes.IsTamed)) return true;
    else return false;
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "tameableComponent", {
  get: function () {
    return this.getComponent(EntityComponentTypes.Tameable);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "tameOwner", {
  get: function () {
    return this.tameableComponent.tamedToPlayer;
  },
  set: function (player) {
    return this.tameableComponent.tame(player);
  },
});

Object.defineProperty(Entity.prototype, "rotation", {
  get: function () {
    return new Vector2(this.getRotation().x, this.getRotation().y);
  },
  set: function (rotation) {
    this.setRotation(rotation);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "velocity", {
  get: function () {
    return this.getVelocity();
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "x", {
  get: function () {
    return this.location.x;
  },
  set: function (x) {
    const location = this.location;
    location.x += x;
    this.teleport(location);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "y", {
  get: function () {
    return this.location.y;
  },
  set: function (y) {
    const location = this.location;
    location.y += y;
    this.teleport(location);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "z", {
  get: function () {
    return this.location.z;
  },
  set: function (z) {
    const location = this.location;
    location.z += z;
    this.teleport(location);
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "rx", {
  get: function () {
    return this.rotation.x;
  },
  set: function (rx) {
    this.setRotation({ x: rx, y: this.rotation.y });
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "ry", {
  get: function () {
    return this.rotation.y;
  },
  set: function (ry) {
    this.setRotation({ x: this.rotation.x, y: ry });
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "hx", {
  get: function () {
    return this.headLocation.x;
  },
  enumerable: true,
});
Object.defineProperty(Entity.prototype, "hy", {
  get: function () {
    return this.headLocation.y;
  },
  enumerable: true,
});
Object.defineProperty(Entity.prototype, "hz", {
  get: function () {
    return this.headLocation.z;
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "vx", {
  get: function () {
    return this.velocity.x;
  },
  enumerable: true,
});
Object.defineProperty(Entity.prototype, "vy", {
  get: function () {
    return this.velocity.y;
  },
  enumerable: true,
});
Object.defineProperty(Entity.prototype, "vz", {
  get: function () {
    return this.velocity.z;
  },
  enumerable: true,
});

Object.defineProperty(Entity.prototype, "vdx", {
  get: function () {
    return this.viewDirection.x;
  },
  enumerable: true,
});
Object.defineProperty(Entity.prototype, "vdy", {
  get: function () {
    return this.viewDirection.y;
  },
  enumerable: true,
});
Object.defineProperty(Entity.prototype, "vdz", {
  get: function () {
    return this.viewDirection.z;
  },
  enumerable: true,
});

// Container methods
Object.defineProperty(Container.prototype, "forEachSlot", {
  value: function (cb) {
    for (let slotId = 0; slotId < this.size; slotId++) {
      const slotObj = this.getSlot(slotId);
      cb(slotObj, slotId);
    }
  },
});

Object.defineProperty(Container.prototype, "getItems", {
  value: function () {
    const items = new Map();
    this.forEachSlot((slot, id) => {
      const item = slot.getItem();
      if (item) items.set(id, item);
    });
    return items;
  },
});

Object.defineProperty(Container.prototype, "sort", {
  value: function (cb) {
    const items = [];
    for (let i = 0; i < this.size; i++) {
      const item = this.getItem(i);
      if (item) {
        items.push({ slot: i, item });
      }
    }

    items.sort((a, b) => cb(a.item, b.item));

    for (let i = 0; i < this.size; i++) {
      this.setItem(i, null);
    }

    items.forEach(({ slot, item }, index) => {
      this.setItem(index, item);
    });
  },
});

// BlockPermutation methods
Object.defineProperty(BlockPermutation.prototype, "setState", {
  value: function (state, value) {
    return BlockPermutation.resolve(this.type.id, {
      ...this.getAllStates(),
      [state]: value,
    });
  },
});

// ScriptEventCommandMessageAfterEvent methods
Object.defineProperty(ScriptEventCommandMessageAfterEvent.prototype, "source", {
  get: function () {
    switch (this.sourceType) {
      case ScriptEventSource.Block:
        return this.sourceBlock;
      case ScriptEventSource.Entity:
        return this.sourceEntity;
      case ScriptEventSource.NPCDialogue:
        return this.initiator;
      default:
        return;
    }
  },
});

// Dimension methods
const randomId = Math.floor(Math.random() * 1000000);
let weather;

beforeEvents.weatherChange.subscribe((e) => {
  const { duration, previousWeather } = e;
  if (duration === randomId) {
    weather = previousWeather;
    e.cancel = true;
  }
});

Object.defineProperty(Dimension.prototype, "weather", {
  get: function () {
    for (const weatherType of Object.values(WeatherType)) {
      this.setWeather(weatherType, randomId);
      if (weather) break;
    }
    const _weather = weather;
    weather = undefined;
    return _weather;
  },
  set: function (weatherType, duration) {
    this.setWeather(weatherType, duration);
  },
});

beforeEvents.worldInitialize.subscribe(() => {
  // Block methods
  const blockCenter = Block.prototype.center;
  Object.defineProperty(Block.prototype, "center", {
    get: function () {
      return blockCenter.call(this);
    },
  });

  const blockBottomCenter = Block.prototype.bottomCenter;
  Object.defineProperty(Block.prototype, "bottomCenter", {
    get: function () {
      return blockBottomCenter.call(this);
    },
  });

  // Entity methods

  Object.defineProperty(Entity.prototype, "location", {
    set: function (location) {
      this.teleport(location);
    },
  });
  Object.defineProperty(Entity.prototype, "runCommand", {
    value: function (...commands) {
      return runCommand.call(this, Entity, ...commands);
    },
  });

  Object.defineProperty(Entity.prototype, "runCommandAsync", {
    value: function (...commands) {
      return runCommandAsync.call(this, Entity, ...commands);
    },
  });

  // Dimension methods
  const dimensionGetEntities = Dimension.prototype.getEntities;

  Object.defineProperty(Dimension.prototype, "runCommand", {
    value: function (...commands) {
      return runCommand.call(this, Dimension, ...commands);
    },
  });

  Object.defineProperty(Dimension.prototype, "runCommandAsync", {
    value: function (...commands) {
      return runCommandAsync.call(this, Dimension, ...commands);
    },
  });

  Object.defineProperty(Dimension.prototype, "getEntities", {
    value: function (filter) {
      if (typeof filter === "string") {
        return dimensionGetEntities.call(this, filter.toEQO());
      }
      return dimensionGetEntities.call(this, filter);
    },
  });
});

const playersUsingItem = new Set();
afterEvents.itemUse.subscribe((e) => {
  const { source: player } = e;
  playersUsingItem.add(player.id);
});

afterEvents.itemStopUse.subscribe((e) => {
  const { source: player } = e;
  if (playersUsingItem.has(player.id)) playersUsingItem.delete(player.id);
});
