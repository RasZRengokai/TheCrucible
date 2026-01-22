import { ns, world, structureManager, system } from "./Eternal/Constants";
import { WorldDB } from "./Eternal/modules/WorldDB";
import { Vector2, Vector3 } from "./Eternal/Classes";
import { getRandomElement } from "./Eternal/Utils";

const db = new WorldDB(ns);
const table = "tickers";
export const chunkSize = 16;

/**
 * Interface for modified structures
 */
export class StructureInfo {
  /**
   * @param {String} structureId - The structure id of the modified structure.
   * @param {Vector3} placingOffset - The offset of the new structure upon replacing.
   * @param {StructureInfo[]} parts - The extended parts of the structure
   */
  constructor(structureId, placingOffset, parts = []) {
    this.structureId = structureId;
    this.placingOffset = placingOffset;
    this.parts = parts;
  }
}

/**
 * Interface for modifying minecraft structures
 */
class ModifyStructure {
  /**
   * @param {String} structureId - The structure id of the minecraft structure to be modified.
   * @param {StructureInfo[]} structureInfo - Random set of structure information to what to replace the original structure.
   * @param {Function} condition - Returning condition to begin checking structure.
   * @param {Number} tolerance - Amount of difference of similarity can tolerate.
   * @param {Vector2} checkingOffset - Offset of the checking location from the chunk XZ origin
   * @param {String[]} ignoredBlocks - Block id of the blocks to ignore when checking structure location.
   * @param {Number} depth - How deep to check for the structure.
   * @param {StructurePlaceOptions} placingOptions - Options for structure placement.
   */
  constructor(
    structureId,
    structureInfo,
    condition,
    tolerance = 0,
    checkingOffset = new Vector2(0, 0),
    ignoredBlocks = [],
    depth = 0,
    placingOptions = undefined
  ) {
    this.structureId = structureId;
    this.structureInfo = structureInfo;
    this.condition = condition;
    this.tolerance = tolerance;
    this.checkingOffset = checkingOffset;
    this.ignoredBlocks = ignoredBlocks;
    this.depth = depth;
    this.placingOptions = placingOptions;
  }
}

// Structure Modifying
const modifyStructures = [
  new ModifyStructure(
    `${ns}:minecraft_jungle_temple`,
    [
      new StructureInfo(`${ns}:jungle_temple_1`, new Vector3(0, -18, 0)),
      new StructureInfo(`${ns}:jungle_temple_2`, new Vector3(0, -40, 5)),
      new StructureInfo(`${ns}:jungle_temple_3`, new Vector3(3, -33, 3)),
    ],
    (block) => {
      const cobbleIds = ["minecraft:cobblestone", "minecraft:mossy_cobblestone"];
      const isCobble = cobbleIds.includes(block.typeId);

      const cobbleStairIds = ["minecraft:stone_stairs", "minecraft:mossy_cobblestone_stairs"];
      const isCobbleStair = cobbleStairIds.includes(block.north()?.typeId);

      return isCobble && isCobbleStair;
    },
    0.0,
    new Vector2(5, 7),
    [`minecraft:grass_block`, `minecraft:dirt`],
    5
  ),
  new ModifyStructure(
    `${ns}:minecraft_desert_pyramid`,
    [
      new StructureInfo(`${ns}:deserttemple1_part1`, new Vector3(3, -30, 13), [
        new StructureInfo(`${ns}:deserttemple1_part2`, new Vector3(22, 10, 64)),
        new StructureInfo(`${ns}:deserttemple1_part3`, new Vector3(64, 0, 0)),
      ]),
      new StructureInfo(`${ns}:deserttemple2_part1`, new Vector3(12, -15, 10), [
        new StructureInfo(`${ns}:deserttemple2_part2`, new Vector3(64, 6, 20)),
      ]),
      new StructureInfo(`${ns}:deserttemple3_part1`, new Vector3(20, -21, 19), [
        new StructureInfo(`${ns}:deserttemple3_part2`, new Vector3(33, 0, 64)),
        new StructureInfo(`${ns}:deserttemple3_part3`, new Vector3(64, 0, 0)),
      ]),
    ],
    (block) => {
      if (block?.typeId !== "minecraft:sandstone") return false;
      const offsetBlock = block.offset(new Vector3(0, -3, -2));
      return offsetBlock.typeId === "minecraft:orange_terracotta";
    },
    0.0,
    new Vector2(2, 2)
  ),
];

async function main() {
  for (const modStruct of modifyStructures) {
    const struct = structureManager.get(modStruct.structureId);

    if (struct) {
      const structInfo = getRandomElement(modStruct.structureInfo);

      for (const player of world.players) {
        const chunks = getChunks(player);

        const dimension = player.dimension;
        for (const chunk of chunks) {
          const x = chunk.x * chunkSize;
          const z = chunk.z * chunkSize;

          const checkingOffset = modStruct.checkingOffset;
          let block = dimension.getTopmostBlock(new Vector2(x, z).offset(checkingOffset));
          for (let i = 0; i < modStruct.depth; i++) {
            try {
              if (modStruct.ignoredBlocks.length === 0) break;
              else if (modStruct.ignoredBlocks.includes(block?.typeId)) block = block.below();
              else break;
            } catch (error) {
              if (error.name != "LocationInUnloadedChunkError") console.error(error);
            }
          }

          let genCondi = false;
          try {
            genCondi = block && modStruct.condition(block);
          } catch (error) {
            if (error.name != "LocationInUnloadedChunkError") console.error(error);
          }
          if (genCondi) {
            const origin = new Vector3(block.location).offset(
              -checkingOffset.x,
              -(struct.size.y - 1),
              -checkingOffset.z
            );
            const rate = checkStructure(struct, origin, dimension);
            if (rate > 0.99) {
              //console.warn(rate);
              const newStruct = structureManager.get(structInfo.structureId);
              if (newStruct) {
                clearStructure(struct, origin, dimension);
                let newOrigin = new Vector3(newStruct.size).sizeBelowCenter();
                newOrigin.x *= -1;
                newOrigin.z *= -1;
                newOrigin = newOrigin.offset(structInfo.placingOffset);
                newOrigin = newOrigin.offset(origin);
                const test = false;
                const mainStruct = system.runInterval(() => {
                  try {
                    structureManager.place(structInfo.structureId, dimension, newOrigin, modStruct.placingOptions);
                    system.clearRun(mainStruct);
                  } catch (error) {
                    if (error.name != "LocationInUnloadedChunkError") console.error(error);
                  }
                });

                for (const parts of structInfo.parts) {
                  const partStruct = system.runInterval(() => {
                    try {
                      const partOrigin = newOrigin.offset(parts.placingOffset);
                      structureManager.place(parts.structureId, dimension, partOrigin, modStruct.placingOptions);
                      system.clearRun(partStruct);
                    } catch (error) {
                      if (error.name != "LocationInUnloadedChunkError") console.error(error);
                    }
                  });
                }
              } else throw new ReferenceError("Missing modified structure.");
            }
          }
        }
      }
    }
  }
  system.runTimeout(main, 40);
}

export function clearStructure(structure, origin, dimension) {
  const size = structure.size;
  for (let dx = 0; dx < size.x; dx++) {
    for (let dy = 0; dy < size.y; dy++) {
      for (let dz = 0; dz < size.z; dz++) {
        const position = { x: origin.x + dx, y: origin.y + dy, z: origin.z + dz };
        const structureBlockId = structure.getBlockPermutation(new Vector3(dx, dy, dz)).type.id;

        if (structureBlockId !== "minecraft:air") {
          const block = dimension.getBlock(position);
          block?.setType("minecraft:air");

          if (structureBlockId === "minecraft:chest") {
            system.runTimeout(() => {
              const items = dimension.getEntities({ type: "minecraft:item", location: position, maxDistance: 5 });
              for (const item of items) {
                item.remove();
              }
            }, 5);
          }
        }
      }
    }
  }
}

function checkStructure(structure, origin, dimension) {
  const size = structure.size;
  let matchingBlocks = 0;
  let totalBlocks = 0;

  for (let dx = 0; dx < size.x; dx++) {
    for (let dy = 0; dy < size.y; dy++) {
      for (let dz = 0; dz < size.z; dz++) {
        const position = { x: origin.x + dx, y: origin.y + dy, z: origin.z + dz };
        const structureBlockId = structure.getBlockPermutation(new Vector3(dx, dy, dz)).type.id;
        if (structureBlockId === "minecraft:air") continue;

        const block = dimension.getBlock(position);

        if (block?.typeId === structureBlockId) matchingBlocks++;
        totalBlocks++;
      }
    }
  }

  return matchingBlocks / totalBlocks;
}

// Get chunks in front of player
export function getChunks(player) {
  const radius = 12;
  const coneAngle = Math.PI / 2; // 90 degrees
  const chunks = [];
  const vd = player.viewDirection;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const chunk = player.chunk.offset(dx, 0, dz);
      const chunkCenter = {
        x: chunk.x * chunkSize + chunkSize / 2,
        z: chunk.z * chunkSize + chunkSize / 2,
      };

      const direction = {
        x: chunkCenter.x - player.x,
        z: chunkCenter.z - player.z,
      };

      const magnitude = Math.sqrt(direction.x ** 2 + direction.z ** 2);
      direction.x /= magnitude;
      direction.z /= magnitude;

      const dotProduct = direction.x * vd.x + direction.z * vd.z;
      const angle = Math.acos(dotProduct);

      if (angle <= coneAngle / 2) {
        chunks.push(chunk);
      }
    }
  }

  return chunks;
}

main();

system.runInterval(() => {
  const tickers = db.get(table) ?? new Map();
  for (const player of world.players) {
    const _tickers = world.getEntities({ type: `${ns}:ticker` });
    if (_tickers.length > world.players.length) {
      for (const ticker of _tickers) {
        ticker.dispose();
      }
    }

    if (tickers.has(player.id)) {
      const ticker = tickers.get(player.id);
      if (ticker) {
        const offset = player.getFacingOffset(chunkSize * 6);
        try {
          ticker.teleport(offset);
        } catch (error) {}
      } else tickers.delete(player.id);
    } else {
      try {
        const ticker = player.dimension.spawnEntity(`${ns}:ticker`, player.location);
        if (ticker) tickers.set(player.id, ticker);
      } catch (error) {
        if (error.name != "LocationInUnloadedChunkError") console.error(error);
      }
    }
  }
  db.set(table, tickers);
});
