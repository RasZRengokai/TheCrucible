import { world, system } from "@minecraft/server";

/* ========= CONFIGURAÇÃO ========= */
const ENTITY_POOL = [
  { id: "minecraft:bogged", min: 2, max: 2 },
  { id: "minecraft:zombie", min: 2, max: 2 }
];
const ROLLS = 1;

/** Retorna inteiro aleatório entre min e max (inclusive) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Retorna um elemento aleatório do array */
function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

world.beforeEvents.worldInitialize.subscribe(ev => {
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:jungle_temple.common.mobs",
    new Generator()
  );
});

class Generator {
  onTick(data) {
    const b = data.block;
    const dim = b.dimension;

    // Check if any player is within 32 blocks using dimension command
    try {
      const result = dim.runCommand(`testfor @a[r=32,x=${b.x},y=${b.y},z=${b.z}]`);
      
      if (result.successCount > 0) {
        for (let r = 0; r < ROLLS; r++) {
          const mobData = choice(ENTITY_POOL);
          const count = randInt(mobData.min, mobData.max);

          for (let i = 0; i < count; i++) {
            const spawnPos = { x: b.x + 0.5, y: b.y + 1, z: b.z + 0.5 };
            dim.spawnEntity(mobData.id, spawnPos);

              // Delay pequeno pra garantir que o mob exista antes do comando
              system.runTimeout(() => {
                dim.runCommandAsync(
                  `execute as @e[type=${mobData.id},x=${spawnPos.x},y=${spawnPos.y},z=${spawnPos.z},r=2,c=4] run replaceitem entity @s slot.armor.head 0 leather_helmet`
                );
              }, 2);
            }
          }

        dim.runCommand(`setblock ${b.x} ${b.y} ${b.z} air`);
      }
    } catch {
      // No players nearby or command failed
    }
  }
}
