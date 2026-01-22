import { world, system } from "@minecraft/server";
import { dpTag } from "../guidebook/Guidebook";
const Radius = 64;

class ParticlesAndSounds {
  constructor(type, dir) {
    this.type = type;
    this.dir = dir;
    this.onTick = this.onTick.bind(this);
  }
  async onTick(data) {
    const bx = data.block.x;
    const by = data.block.y;
    const bz = data.block.z;
    let flamePos, ashPos;
    let yOff = 0;
    switch (this.dir) {
      case "up":
        yOff = 0;
        flamePos = { x: bx + 0.5, y: by + 0.6, z: bz + 0.5 };
        ashPos = { x: bx + 0.5, y: by + (this.type === "soul" ? 1 : 0.8), z: bz + 0.5 };
        break;
      case "north":
        yOff = 0.1;
        flamePos = { x: bx + 0.5, y: by + 0.8, z: bz + 0.65 };
        ashPos = { x: bx + 0.5, y: by + 1, z: bz + 0.65 };
        break;
      case "south":
        yOff = 0.1;
        flamePos = { x: bx + 0.5, y: by + 0.8, z: bz + 0.35 };
        ashPos = { x: bx + 0.5, y: by + 1, z: bz + 0.35 };
        break;
      case "west":
        yOff = 0.1;
        flamePos = { x: bx + 0.65, y: by + 0.8, z: bz + 0.5 };
        ashPos = { x: bx + 0.65, y: by + 1, z: bz + 0.5 };
        break;
      case "east":
        yOff = 0.1;
        flamePos = { x: bx + 0.35, y: by + 0.8, z: bz + 0.5 };
        ashPos = { x: bx + 0.35, y: by + 1, z: bz + 0.5 };
        break;
      default:
        yOff = 0;
        flamePos = { x: bx + 0.5, y: by + 0.6, z: bz + 0.5 };
        ashPos = { x: bx + 0.5, y: by + (this.type === "soul" ? 1 : 0.8), z: bz + 0.5 };
    }
    for (const p of world.getAllPlayers()) {
      const dx = p.location.x - bx;
      const dy = p.location.y - by;
      const dz = p.location.z - bz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist <= Radius) {
        const base = this.type === "soul" ? "ecbl_bs:torch_soul_light" : "ecbl_bs:torch_light";
        const flame = this.type === "soul" ? "ecbl_bs:torch_soul_flame" : "ecbl_bs:torch_flames";
        const ash = this.type === "soul" ? "ecbl_bs:torch_soul_ashes" : "ecbl_bs:torch_ashes";
        if (!((this.type === "soul" && p.hasTag("ecbl_bs:disable_particle")) || (this.type === "normal" && p.hasTag(dpTag)))) {
          p.spawnParticle(base, { x: bx + 0.5, y: by + 0.7 + yOff, z: bz + 0.5 });
          p.spawnParticle(base, { x: bx + 0.6, y: by + 0.6 + yOff, z: bz + 0.6 });
          p.spawnParticle(base, { x: bx + 0.4, y: by + 0.6 + yOff, z: bz + 0.4 });
          p.spawnParticle(base, { x: bx + 0.4, y: by + 0.6 + yOff, z: bz + 0.6 });
          p.spawnParticle(base, { x: bx + 0.6, y: by + 0.6 + yOff, z: bz + 0.4 });
        }
        p.spawnParticle(flame, flamePos);
        p.spawnParticle(ash, ashPos);
        if (this.dir === "up") {
          const rc = Math.random();
          p.spawnParticle(flame, { x: bx + 0.5, y: by + 0.6, z: bz + 0.5 });
          p.spawnParticle(ash, { x: bx + 0.5, y: by + (this.type === "soul" ? 1 : 0.8), z: bz + 0.5 });
          if (rc < 0.005) {
            data.block.dimension.runCommand(`playsound fire.fire @a ${bx} ${by} ${bz}`);
          }
          if (rc < 0.05) {
            p.spawnParticle("minecraft:basic_smoke_particle", { x: bx, y: by + 1, z: bz });
          }
        }
      }
    }
  }
}

function checkAndSetTorchFace(type, blockPos, faces, lightVal, setLightVal, sound, clearItem) {
  const id = type === "soul" ? "ecbl_bs:metal_soul_torch" : "ecbl_bs:metal_torch";
  for (let face of faces) {
    const tfCmd = `testforblock ${blockPos.x} ${blockPos.y} ${blockPos.z} ${id} [\"minecraft:block_face\"=\"${face}\",\"ecbl_bs:light\"=${lightVal}]`;
    for (const p of world.getAllPlayers()) {
      p.runCommandAsync(tfCmd).then((result) => {
        if (result.successCount > 0) {
          p.runCommand(
            `setblock ${blockPos.x} ${blockPos.y} ${blockPos.z} ${id} [\"minecraft:block_face\"=\"${face}\",\"ecbl_bs:light\"=${setLightVal}]`
          );
          if (sound) p.runCommand(sound);
          if (clearItem) p.runCommand(clearItem);
        }
      });
    }
  }
}

// Register block components for both torch types
world.beforeEvents.worldInitialize.subscribe((ev) => {
  // normal torch
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_torch_particles_up",
    new ParticlesAndSounds("normal", "up")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_torch_particles_north",
    new ParticlesAndSounds("normal", "north")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_torch_particles_south",
    new ParticlesAndSounds("normal", "south")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_torch_particles_west",
    new ParticlesAndSounds("normal", "west")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_torch_particles_east",
    new ParticlesAndSounds("normal", "east")
  );
  // soul torch
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_soul_torch_particles_up",
    new ParticlesAndSounds("soul", "up")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_soul_torch_particles_north",
    new ParticlesAndSounds("soul", "north")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_soul_torch_particles_south",
    new ParticlesAndSounds("soul", "south")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_soul_torch_particles_west",
    new ParticlesAndSounds("soul", "west")
  );
  ev.blockComponentRegistry.registerCustomComponent(
    "ecbl_bs:metal_soul_torch_particles_east",
    new ParticlesAndSounds("soul", "east")
  );
});

// Interact events for both torch types
world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  let block = data.block;
  if (block.typeId == "ecbl_bs:metal_torch") {
    const pos = block.location;
    checkAndSetTorchFace(
      "normal",
      pos,
      ["up", "north", "west", "east", "south"],
      0,
      1,
      `playsound extinguish.candle`,
      null
    );
  } else if (block.typeId == "ecbl_bs:metal_soul_torch") {
    const pos = block.location;
    checkAndSetTorchFace(
      "soul",
      pos,
      ["up", "north", "west", "east", "south"],
      0,
      1,
      `playsound extinguish.candle`,
      null
    );
  }
});

const flint = ["minecraft:flint_and_steel"];
const flint2 = ["minecraft:fire_charge"];

world.beforeEvents.itemUseOn.subscribe((evd) => {
  const { block, itemStack: itemUsed } = evd;
  const pos = block.location;
  if (!itemUsed) return;
  if (flint.includes(itemUsed.typeId)) {
    if (block.permutation.matches("ecbl_bs:metal_torch")) {
      evd.cancel = true;
      checkAndSetTorchFace(
        "normal",
        pos,
        ["up", "north", "west", "east", "south"],
        1,
        0,
        `playsound fire.ignite @s ${pos.x} ${pos.y} ${pos.z}`,
        null
      );
    } else if (block.permutation.matches("ecbl_bs:metal_soul_torch")) {
      evd.cancel = true;
      checkAndSetTorchFace(
        "soul",
        pos,
        ["up", "north", "west", "east", "south"],
        1,
        0,
        `playsound fire.ignite @s ${pos.x} ${pos.y} ${pos.z}`,
        null
      );
    }
  }
  if (flint2.includes(itemUsed.typeId)) {
    if (block.permutation.matches("ecbl_bs:metal_torch")) {
      evd.cancel = true;
      checkAndSetTorchFace(
        "normal",
        pos,
        ["up", "north", "west", "east", "south"],
        1,
        0,
        `playsound fire.ignite @s ${pos.x} ${pos.y} ${pos.z}`,
        `clear @s fire_charge 0 1`
      );
    } else if (block.permutation.matches("ecbl_bs:metal_soul_torch")) {
      evd.cancel = true;
      checkAndSetTorchFace(
        "soul",
        pos,
        ["up", "north", "west", "east", "south"],
        1,
        0,
        `playsound fire.ignite @s ${pos.x} ${pos.y} ${pos.z}`,
        `clear @s fire_charge 0 1`
      );
    }
  }
});

// Remove block logic (only for metal_torch, as in original)
world.afterEvents.playerBreakBlock.subscribe((ev) => {
  const { dimension, block } = ev;
  if (
    ev.brokenBlockPermutation.type.id == "ecbl_bs:metal_torch" ||
    ev.brokenBlockPermutation.type.id == "ecbl_bs:metal_soul_torch"
  ) {
    system.runTimeout(() => {
      dimension.runCommand(
        `fill ${block.location.x} ${block.location.y} ${block.location.z} ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:empty.block replace air`
      );
    });
    system.runTimeout(() => {
      dimension.runCommand(
        `fill ${block.location.x} ${block.location.y} ${block.location.z} ${block.location.x} ${block.location.y} ${block.location.z} air replace ecbl_bs:empty.block`
      );
    }, 5);
  }
});
