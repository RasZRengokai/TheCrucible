import { ns, world, structureManager, system } from "./Eternal/Constants";
import { Vector3 } from "./Eternal/Classes";
import { getRandomElement } from "./Eternal/Utils";

/**
 * Structure placement configuration
 */
const structureConfigs = {
  jungle_temple: {
    structures: [
      {
        id: `${ns}:jungle_temple_1`,
        offset: new Vector3(0, -17, 0),
        parts: [],
      },
      {
        id: `${ns}:jungle_temple_2`,
        offset: new Vector3(0, -39, 5),
        parts: [],
      },
      {
        id: `${ns}:jungle_temple_3`,
        offset: new Vector3(3, -32, 3),
        parts: [],
      },
    ],
  },
  desert_pyramid: {
    structures: [
      {
        id: `${ns}:deserttemple1_part1`,
        offset: new Vector3(3, -43, 13),
        parts: [
          { id: `${ns}:deserttemple1_part2`, offset: new Vector3(22, 10, 64) },
          { id: `${ns}:deserttemple1_part3`, offset: new Vector3(64, 0, 0) },
        ],
      },
      {
        id: `${ns}:deserttemple2_part1`,
        offset: new Vector3(12, -29, 10),
        parts: [{ id: `${ns}:deserttemple2_part2`, offset: new Vector3(64, 6, 20) }],
      },
      {
        id: `${ns}:deserttemple3_part1`,
        offset: new Vector3(20, -38, 19),
        parts: [
          { id: `${ns}:deserttemple3_part2`, offset: new Vector3(33, 0, 64) },
          { id: `${ns}:deserttemple3_part3`, offset: new Vector3(64, 0, 0) },
        ],
      },
    ],
  },
};

/**
 * Places a structure at the given location
 * @param {string} structureType - Type of structure (jungle_temple, desert_pyramid)
 * @param {Dimension} dimension - Dimension to place in
 * @param {Vector3} origin - Origin location
 */
function placeStructure(structureType, dimension, origin) {
  const config = structureConfigs[structureType];
  if (!config) {
    return;
  }

  // Pick random variant
  const variant = getRandomElement(config.structures);
  // console.warn(variant.id);

  // Calculate placement position
  const mainStructure = structureManager.get(variant.id);
  if (!mainStructure) {
    return;
  }

  let placementOrigin = new Vector3(mainStructure.size).sizeBelowCenter();
  placementOrigin.x *= -1;
  placementOrigin.z *= -1;
  placementOrigin = placementOrigin.offset(variant.offset);
  placementOrigin = placementOrigin.offset(origin);

  // Place main structure with retry logic
  const mainInterval = system.runInterval(() => {
    try {
      structureManager.place(variant.id, dimension, placementOrigin);
      system.clearRun(mainInterval);

      // Place additional parts
      for (const part of variant.parts) {
        const partInterval = system.runInterval(() => {
          try {
            const partOrigin = placementOrigin.offset(part.offset);
            structureManager.place(part.id, dimension, partOrigin);
            system.clearRun(partInterval);
          } catch (error) {
            if (error.name !== "LocationInUnloadedChunkError") {
              system.clearRun(partInterval);
            }
          }
        }, 1);
      }
    } catch (error) {
      if (error.name !== "LocationInUnloadedChunkError") {
        system.clearRun(mainInterval);
      }
    }
  }, 1);
}

/**
 * Handle scriptevent command for structure placement
 * Format: /scriptevent ecbl_bs:place_structure <type> <x> <y> <z>
 * Example: /scriptevent ecbl_bs:place_structure jungle_temple ~ ~ ~
 */
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "ecbl_bs:place_structure") {
    const args = event.message.split(" ");

    if (args.length !== 4) {
      return;
    }

    const [structureType, x, y, z] = args;
    const dimension = event.sourceEntity?.dimension || world.getDimension("overworld");

    // Parse coordinates (support relative ~)
    const origin = event.sourceBlock?.location || event.sourceEntity?.location;
    if (!origin) {
      return;
    }

    const parsedX = x === "~" ? origin.x : parseInt(x);
    const parsedY = y === "~" ? origin.y : parseInt(y);
    const parsedZ = z === "~" ? origin.z : parseInt(z);

    const location = new Vector3(parsedX, parsedY, parsedZ);

    placeStructure(structureType, dimension, location);
  }
});
