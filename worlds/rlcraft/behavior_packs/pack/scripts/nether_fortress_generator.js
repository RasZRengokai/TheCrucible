import { system, world } from "@minecraft/server";
import { getChunks, chunkSize, StructureInfo } from "./StructureModifier";
import { Vector3 } from "./Eternal/Classes";
import { structureManager } from "./Eternal/Constants";

// const structInfo = new StructureInfo("ecbl_bs:nf1", new Vector3(0, 0, 0), [
//   new StructureInfo("ecbl_bs:nf2", new Vector3(64, 0, 0)),
//   new StructureInfo("ecbl_bs:nf3", new Vector3(0, 0, 64)),
//   new StructureInfo("ecbl_bs:nf4", new Vector3(64, 0, 64)),
//   new StructureInfo("ecbl_bs:nf5", new Vector3(0, 0, 128)),
// ]);
const structInfo = new StructureInfo("ecbl_bs:nether", new Vector3(0, 0, 0));
async function main() {
  for (const player of world.players) {
    const chunks = getChunks(player);

    const dimension = player.dimension;
    for (const chunk of chunks) {
      const x = chunk.x * chunkSize;
      const z = chunk.z * chunkSize;
      try {
        const origin = new Vector3(x, 24, z);
        // const origin = new Vector3(196, -60 -343);
        const checkingLoc = origin.offset(13, 24, 14);
        const block = dimension.getBlock(checkingLoc);

        if (block?.typeId === "minecraft:mob_spawner") {
          const block2 = dimension.getBlock(checkingLoc.offset(0, -1, 0));
          if (block2?.typeId === "minecraft:magma") {
            block.setType("minecraft:air");
            block2.setType("minecraft:air");

            const newStruct = structureManager.get("ecbl_bs:nf1");
            if (newStruct) {
              let newOrigin = new Vector3(newStruct.size).sizeBelowCenter();
              newOrigin.x *= -1;
              newOrigin.z *= -1;
              newOrigin = newOrigin.offset(structInfo.placingOffset);
              newOrigin = newOrigin.offset(origin);
              structureManager.place(structInfo.structureId, dimension, newOrigin);
              for (const parts of structInfo.parts) {
                const partOrigin = newOrigin.offset(parts.placingOffset);
                structureManager.place(parts.structureId, dimension, partOrigin);
              }
            } else throw new ReferenceError("Missing modified structure.");
          }
        }
      } catch (error) {
        if (error.name != "LocationInUnloadedChunkError") console.error(error);
      }
    }
  }
  system.runTimeout(main, 40);
}

main();
