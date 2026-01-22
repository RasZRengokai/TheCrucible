/*-----Guide Book------*/

import {} from "./guidebook/FormUtils.js";
import {} from "./guidebook/Guidebook.js";
import {} from "./guidebook/give_book.js";

/////////loot

import {} from "./loot/loot_turn_mimic.js";

/////////spawn_mobs common

import {} from "./spawn_mobs/common/desert_temple.js";
import {} from "./spawn_mobs/common/jungle_temple.js";
import {} from "./spawn_mobs/common/nether_fortress.js";
import {} from "./spawn_mobs/common/witch_hut.js";
import {} from "./spawn_mobs/common/pillager_ship.js";
import {} from "./spawn_mobs/common/pillager_camp.js";

/////////spawn_mobs difficult

import {} from "./spawn_mobs/difficult/desert_temple.js";
import {} from "./spawn_mobs/difficult/jungle_temple.js";
import {} from "./spawn_mobs/difficult/pillager_ship.js";
import {} from "./spawn_mobs/difficult/pillager_camp.js";
import {} from "./spawn_mobs/difficult/nether_fortress.js";
import {} from "./spawn_mobs/difficult/trader_camp.js";

/////////spawn_mobs creeper
import {} from "./spawn_mobs/creeper/desert_temple.js";
import {} from "./spawn_mobs/creeper/jungle_temple.js";
import {} from "./spawn_mobs/creeper/pillager_ship.js";
import {} from "./spawn_mobs/creeper/nether_fortress.js";
import {} from "./spawn_mobs/creeper/dungeon.js";
import {} from "./spawn_mobs/creeper/ruins.js";
import {} from "./spawn_mobs/creeper/witch_hut.js";

////////////////

import {} from "./torch/block_place_torchs.js";
import {} from "./pillar.js";
import {} from "./item_replace/item_replacer.js";
import {} from "./dead_skeleton.js";
import {} from "./brazier.js";
//import {} from "./item_replace/brazier.js"
import {} from "./item_replace/brazier_delete_item.js";
import {} from "./torch/metal_torch.js";
//import {} from "./torch/weather.js";
import {} from "./unstable_blocks.js";
import {} from "./mimic.js";
import {} from "./structure_placer.js";
import {} from "./spike_blocks.js";
import {} from "./health_statue.js";
import {} from "./mace_pillager.js";
import {} from "./mace.js";
import {} from "./mummy.js";
import {} from "./elder_pillager.js";
import {} from "./goblin.js";
import {} from "./goblin_hurt.js";
import {} from "./particles.js";
import {} from "./item_lore.js";
import {} from "./fog.js";
import {} from "./gravestone.js";
import {} from "./illager_pirate.js";
import {} from "./randomize_totem.js";

import {} from "./totems/totem_of_negation.js";
import {} from "./totems/totem_of_storm.js";
import {} from "./totems/totem_of_turtle.js";
import {} from "./totems/totem_of_undying.js";

import "./mimic_spawning.js";
import "./greet.js";

// import "./StructureModifier.js";
import "./nether_fortress_generator.js";
import "./Eternal/modules/DevTools.js";

import { world, system } from "@minecraft/server";

world.gameRules.commandBlockOutput = false;
world.gameRules.commandBlocksEnabled = true;

const AnimationUseBlock = {
  onStepOn(event) {
    const block = event.block; // Block impacted by this event.
    const dimension = event.dimension; // Dimension that contains the block.
    const entity = event.entity; // The entity that stepped on the block. May be undefined.
  },
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("ecbl_bs:animation_use", AnimationUseBlock);
});

/*--------------------------------------------------------*/
