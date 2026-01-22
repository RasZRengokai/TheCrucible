import { world } from "@minecraft/server";

/* ========= CONFIGURAÇÃO ========= */
const ENTITY_POOL = [
  { id: "minecraft:bogged", min: 3, max: 3 },
  { id: "minecraft:stray", min: 1, max: 1 }
];

/** Retorna inteiro aleatório entre min e max (inclusive) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

world.beforeEvents.worldInitialize.subscribe(ev => {
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:jungle_temple.difficult.mobs",
    new Generator()
  );
});

class Generator {
  onTick(data) {
    const b = data.block;
    const dim = b.dimension;

    for (const mob of ENTITY_POOL) {
      const count = randInt(mob.min, mob.max);
      for (let i = 0; i < count; i++) {
        dim.spawnEntity(mob.id, {
          x: b.x + 0.5,
          y: b.y + 1,
          z: b.z + 0.5
        });
      }
    }

    // Remove o bloco após o spawn
    dim.runCommand(`setblock ${b.x} ${b.y} ${b.z} air`);
  }
}
