import { world, system } from "@minecraft/server";
import { dpTag } from "./guidebook/Guidebook";

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function fog() {
  const offY = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12];
  const rad = 64;
  const dim = world.getDimension("overworld");
  const ents = dim.getEntities({ type: "ecbl_bc:witch_hut_fog" });
  const pls = dim.getPlayers();

  for (const f of ents) {
    const { x, y, z } = f.location;
    for (const p of pls) {
      if (dist(p.location, f.location) >= rad) continue;
      // if (p.graphicsMode === "Deferred") continue;
      if (p.hasTag(dpTag)) continue;
      for (const oy of offY) {
        p.spawnParticle("ecbl_bs:witch_hut_fog", { x, y: y + oy, z });
      }
    }
  }
}

system.runInterval(() => {
  fog();
}, 200);
