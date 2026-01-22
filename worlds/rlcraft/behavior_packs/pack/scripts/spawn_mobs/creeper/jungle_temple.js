import { world } from "@minecraft/server";

/* ========= CONFIGURAÇÃO ========= */
const ENTITY_POOL = [
  { id: "minecraft:creeper", min: 1, max: 1 }
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
    "ecbl_bs:jungle_temple.creeper.mobs",
    new Generator()
  );
});

class Generator {
  onTick(data) {
    const b = data.block;
    const dim = b.dimension;

    for (let r = 0; r < ROLLS; r++) {
      const mob = choice(ENTITY_POOL);
      const count = randInt(mob.min, mob.max);

      for (let i = 0; i < count; i++) {
        dim.spawnEntity(mob.id, {
          x: b.x + 0.5,
          y: b.y + 1,
          z: b.z + 0.5
        });
      }
    }

    dim.runCommand(`setblock ${b.x} ${b.y} ${b.z} air`);
  }
}
