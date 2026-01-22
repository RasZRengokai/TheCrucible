// particles.optimized.js
import { world, system } from "@minecraft/server";

/* -------------------------------------------------
 * Utils
 * -------------------------------------------------*/
function anyPlayerNear(loc, players, radius = 32) {
  const r2 = radius * radius;
  for (const p of players) {
    const dx = p.location.x - loc.x;
    const dy = p.location.y - loc.y;
    const dz = p.location.z - loc.z;
    if (dx * dx + dy * dy + dz * dz < r2) return true;
  }
  return false;
}

function timeOfDayToClock(time) {
  const hours = Math.floor(((time / 1000) + 6) % 24);
  const minutes = Math.floor(((time % 1000) * 60) / 1000);
  return {
    formatted: `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`,
    hour: hours,
  };
}

/* -------------------------------------------------
 * Consts
 * -------------------------------------------------*/
const RADIUS = 32;

const DRIP_WATER_BLOCKS = [
  "minecraft:mossy_cobblestone",
  "minecraft:cobblestone",
  "minecraft:stone",
  "minecraft:dirt",
  "ecbl_bs:unstable_mossy_cobblestone",
  "ecbl_bs:unstable_stone_bricks",
  "ecbl_bs:mossy_stone_pillar",
  "ecbl_bs:stone_pillar",
  "ecbl_bs:chiseled_stone_bricks",
  "ecbl_bs:chiseled_mossy_stone_bricks",
  "ecbl_bs:cobblestone_bricks",
  "ecbl_bs:mossy_cobblestone_bricks",
];

/* -------------------------------------------------
 * ÚNICO INTERVALO + AGENDADOR
 * -------------------------------------------------*/
let tick = 0;
system.runInterval(() => {
  tick++;

  const overworld = world.getDimension("overworld");
  const players = overworld.getPlayers();
  try {

    // ------------- FIREBALL (lava_spit) [antes: 1 tick] -------------
    if (tick % 1 === 0) {
      const entities = overworld.getEntities({ type: "ecbl_bs:lava_spit" });
      for (const e of entities) {
        if (anyPlayerNear(e.location, players, RADIUS)) {
          overworld.spawnParticle("ecbl_bs:fire_0", {
            x: e.location.x,
            y: e.location.y + 0.5,
            z: e.location.z,
          });
        }
      }
    }

    // ------------- DRIP WATER [antes: 60 ticks] -------------
    if (tick % 60 === 0) {
      const entities = overworld.getEntities({ type: "ecbl_bs:drip_water" });
      for (const w of entities) {
        if (!anyPlayerNear(w.location, players, RADIUS)) continue;

        const wx = Math.floor(w.location.x);
        const wy = Math.floor(w.location.y) + 2;
        const wz = Math.floor(w.location.z);
        const blockBelow = overworld.getBlock({ x: wx, y: wy, z: wz });

        if (blockBelow && DRIP_WATER_BLOCKS.includes(blockBelow.typeId)) {
          if (Math.random() < 0.1) {
            overworld.spawnParticle("ecbl_bs:dripping_water", {
              x: w.location.x,
              y: w.location.y + 2.8,
              z: w.location.z,
            });
          }
        }
      }
    }

    // ------------- NETHER SOULS [antes: 400 ticks] -------------
    if (tick % 400 === 0) {
      const entities = overworld.getEntities({ type: "ecbl_bc:nether_souls" });
      for (const e of entities) {
        if (anyPlayerNear(e.location, players, RADIUS)) {
          overworld.spawnParticle("ecbl_bs:soul", {
            x: e.location.x,
            y: e.location.y,
            z: e.location.z,
          });
        }
      }
    }

    // ------------- NETHER ASHES [antes: 200 ticks] -------------
    if (tick % 200 === 0) {
      const entities = overworld.getEntities({ type: "ecbl_bc:nether_ashes" });
      for (const e of entities) {
        if (anyPlayerNear(e.location, players, RADIUS)) {
          overworld.spawnParticle("ecbl_bs:floating_ashes", {
            x: e.location.x,
            y: e.location.y,
            z: e.location.z,
          });
        }
      }
    }

    // ------------- IMP [antes: 2 ticks] -------------
    if (tick % 2 === 0) {
      const entities = overworld.getEntities({ type: "ecbl_bs:imp" });
      for (const e of entities) {
        if (anyPlayerNear(e.location, players, RADIUS)) {
          const pos = { x: e.location.x, y: e.location.y, z: e.location.z };
          overworld.spawnParticle("ecbl_bs:fire_particles_1", pos);
          overworld.spawnParticle("ecbl_bs:fire_particles_2", pos);
        }
      }
    }

    // ------------- MUMMY cockroach [antes: 100 ticks] -------------
    if (tick % 100 === 0) {

      const entities = overworld.getEntities({ type: "ecbl_bs:mummy" });
      for (const e of entities) {
        try {
          if (anyPlayerNear(e.location, players, RADIUS)) {
            overworld.spawnParticle("ecbl_bs:mummy_cockroach", {
              x: e.location.x,
              y: e.location.y + 0.5,
              z: e.location.z,
            });
          }
        } catch { }
      }
    }
    // ------------- MUMMY dust [antes: 10 ticks] -------------
    if (tick % 10 === 0) {
      const entities = overworld.getEntities({ type: "ecbl_bs:mummy" });
      for (const e of entities) {
        try {
        if (anyPlayerNear(e.location, players, RADIUS)) {
          overworld.spawnParticle("ecbl_bs:mummy_dust", {
            x: e.location.x,
            y: e.location.y + 1,
            z: e.location.z,
          });
        }
      } catch { }
    }
    }

    // ------------- FIREFLIES à noite [antes: 200 ticks] -------------
    if (tick % 200 === 0) {
      const { hour } = timeOfDayToClock(world.getTimeOfDay());
      if (hour >= 18 || hour < 6) {
        const entities = overworld.getEntities({ type: "ecbl_bs:fireflies" });
        for (const f of entities) {
          if (!anyPlayerNear(f.location, players, RADIUS)) continue;
          overworld.spawnParticle("ecbl_bs:fireflies", {
            x: f.location.x,
            y: f.location.y - 3,
            z: f.location.z,
          });
        }
      }
    }

    // mantém o contador “pequeno” para não estourar
    if (tick >= 1e9) tick = 0;
  } catch { }
}, 1);

/* -------------------------------------------------
 * AFTER EVENTS
 * (consolidados em uma única inscrição)
 * -------------------------------------------------*/
world.afterEvents.entityHitEntity.subscribe((ev) => {
  try {
    const { damagingEntity, hitEntity } = ev;
    if (!damagingEntity || damagingEntity.typeId !== "minecraft:player") return;
    if (!hitEntity) return;

    const cfg = ({
      "ecbl_bs:moth": { half: 4, sendExit: true },
      "ecbl_bs:cockroach": { half: 4, sendExit: false },
      "ecbl_bs:fireflies": { half: 13, sendExit: false },
      "ecbl_bc:floating_sand": { half: 13, sendExit: false },
    })[hitEntity.typeId];

    if (!cfg) return;

    const { x, y, z } = hitEntity.location;
    const H = cfg.half;

    // sela ar com empty.block
    hitEntity.runCommand(
      `fill ${x - H} ${y - H} ${z - H} ${x + H} ${y + H} ${z + H} ecbl_bs:empty.block replace air`
    );

    system.runTimeout(() => {
      try {
        // devolve ar
        hitEntity.runCommand(
          `fill ${x - H} ${y - H} ${z - H} ${x + H} ${y + H} ${z + H} air replace ecbl_bs:empty.block`
        );
        if (cfg.sendExit) {
          hitEntity.runCommand(`event entity @e ecbl_bs:exit`);
        }
        hitEntity.runCommand(`event entity @s despawn`);
      } catch { }
    }, 2);
  } catch { }
});

/* -------------------------------------------------
 * Block components (mantidos)
 * -------------------------------------------------*/
class ParticleSoul {
  async onTick(data) {
    const { x, y, z } = data.block;
    const skip = world.getPlayers().some((p) => p.hasTag("desactive_chest_loots"));
    if (!skip) {
      data.block.dimension.runCommand(`summon ecbl_bc:nether_souls ${x} ${y} ${z}`);
      await data.block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
    }
  }
}

class ParticleAshes {
  onTick(data) {
    const { x, y, z } = data.block;
    const skip = world.getPlayers().some((p) => p.hasTag("desactive_chest_loots"));
    if (!skip) {
      data.block.dimension.runCommand(`summon ecbl_bc:nether_ashes ${x} ${y} ${z}`);
      data.block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
    }
  }
}

class ParticleMoth {
  onTick(data) {
    const { x, y, z } = data.block;
    const skip = world.getPlayers().some((p) => p.hasTag("desactive_chest_loots"));
    if (!skip) {
      data.block.dimension.runCommand(`summon ecbl_bs:moth ${x} ${y} ${z}`);
      data.block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
    }
  }
}

class ParticleFireflies {
  onTick(data) {
    const { x, y, z } = data.block;
    const skip = world.getPlayers().some((p) => p.hasTag("desactive_chest_loots"));
    if (!skip) {
      data.block.dimension.runCommand(`summon ecbl_bs:fireflies ${x} ${y} ${z}`);
      data.block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
    }
  }
}

class ParticleCockroaches {
  onTick(data) {
    const { x, y, z } = data.block;
    const skip = world.getPlayers().some((p) => p.hasTag("desactive_chest_loots"));
    if (!skip) {
      data.block.dimension.runCommand(`summon ecbl_bs:cockroach ${x} ${y + 3} ${z}`);
      data.block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
    }
  }
}

world.beforeEvents.worldInitialize.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:particle.soul", new ParticleSoul());
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:particle.ashes", new ParticleAshes());
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:particle.moth", new ParticleMoth());
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:particle.fireflies", new ParticleFireflies());
  event.blockComponentRegistry.registerCustomComponent("ecbl_bs:particle.cockroaches", new ParticleCockroaches());
});
