import { Player, world } from "@minecraft/server";
import * as DynamicForms from "./FormUtils";

/**
 *
 * @param {Player} player
 */
function loadGuidebookForm(player) {
  DynamicForms.actionForm(player, "main", homePageData);
}

world.afterEvents.itemUse.subscribe((e) => {
  if (e.itemStack?.typeId !== "ecbl_bc:guidebook") return;
  loadGuidebookForm(e.source);
});

/* ---------------------- Layer 1 -------------------- */
const HowToPlay = [
  {
    text: "how_to_play_1",
    image: "textures/eternal/better_structures/items/bs_guidebook",
  },
];

const ExploreStructures = [
  {
    text: "desert_pyramid",
    image: "textures/eternal/better_structures/ui/desert_temple",
  },
  {
    text: "jungle_temple",
    image: "textures/eternal/better_structures/ui/jungle_temple",
  },
  {
    text: "wandering_trader_camp",
    image: "textures/eternal/better_structures/ui/wandering_trader",
  },
  {
    text: "pillager_camp",
    image: "textures/eternal/better_structures/ui/pillager_outpost",
  },
  {
    text: "pillager_ship",
    image: "textures/eternal/better_structures/ui/pirate_ship",
  },
  {
    text: "ruins",
    image: "textures/eternal/better_structures/ui/ruins",
  },
  {
    text: "dungeon",
    image: "textures/eternal/better_structures/ui/dungeon",
  },
  {
    text: "witch_hut",
    image: "textures/eternal/better_structures/ui/witch_hut",
  },
  {
    text: "nether_fortress",
    image: "textures/eternal/better_structures/ui/nether_fortress",
  },
];

const Blocks = [
  {
    text: "sandstone_set",
    image: "textures/eternal/better_structures/blocks/chiseled_sandstone_bricks",
    subpages: [
      /*--- sandstone ---*/
      {
        text: "sandstone_bricks",
        image: "textures/eternal/better_structures/blocks/sandstone_bricks",
      },
      {
        text: "carved_sandstone",
        image: "textures/eternal/better_structures/blocks/carved_sandstone",
      },
      {
        text: "patterned_sandstone_bricks",
        image: "textures/eternal/better_structures/blocks/chiseled_sandstone_bricks",
      },
      {
        text: "sandstone_pillar",
        image: "textures/eternal/better_structures/blocks/sandstone_pillar_side",
      },
      {
        text: "unstable_sandstone",
        image: "textures/eternal/better_structures/blocks/unstable_sandstone",
      },
    ],
  },
  {
    text: "stone_set",
    image: "textures/eternal/better_structures/blocks/chiseled_stone_bricks",
    subpages: [
      {
        text: "stone_pillar",
        image: "textures/eternal/better_structures/blocks/stone_pillar_side",
      },
      {
        text: "mossy_stone_pillar",
        image: "textures/eternal/better_structures/blocks/mossy_stone_pillar_side",
      },
      {
        text: "patterned_stone_bricks",
        image: "textures/eternal/better_structures/blocks/chiseled_stone_bricks",
      },
      {
        text: "patterned_mossy_stone_bricks",
        image: "textures/eternal/better_structures/blocks/chiseled_mossy_stone_bricks",
      },
      {
        text: "unstable_stone_bricks",
        image: "textures/eternal/better_structures/blocks/unstable_stone_bricks",
      },
    ],
  },
  {
    text: "cobblestone_set",
    image: "textures/eternal/better_structures/blocks/mossy_cobblestone_bricks",
    subpages: [
      {
        text: "cobblestone_bricks",
        image: "textures/eternal/better_structures/blocks/cobblestone_bricks",
      },
      {
        text: "mossy_cobblestone_bricks",
        image: "textures/eternal/better_structures/blocks/mossy_cobblestone_bricks",
      },
      {
        text: "unstable_mossy_cobblestone",
        image: "textures/eternal/better_structures/blocks/unstable_mossy_cobblestone",
      },
    ],
  },
  {
    text: "decorations",
    image: "textures/eternal/better_structures/ui/brazier",
    subpages: [
      {
        text: "metal_torch",
        image: "textures/eternal/better_structures/items/metal_torch",
      },
      {
        text: "metal_soul_torch",
        image: "textures/eternal/better_structures/items/metal_soul_torch",
      },
      {
        text: "brazier",
        image: "textures/eternal/better_structures/ui/brazier",
      },
      {
        text: "soul_brazier",
        image: "textures/eternal/better_structures/ui/soul_brazier",
      },
      {
        text: "gravestone",
        image: "textures/eternal/better_structures/items/gravestone",
      },
      {
        text: "dead_lying_skeleton",
        image: "textures/eternal/better_structures/items/sitting_skeleton",
      },
    ],
  },
  {
    text: "misc",
    image: "textures/eternal/better_structures/ui/health_statue",
    subpages: [
      {
        text: "spike_block",
        image: "textures/eternal/better_structures/ui/spikes",
      },
      {
        text: "venom_spike_block",
        image: "textures/eternal/better_structures/ui/venom_spikes",
      },
      {
        text: "totem_stand",
        image: "textures/eternal/better_structures/ui/totem_stand",
      },
      {
        text: "health_statue",
        image: "textures/eternal/better_structures/ui/health_statue",
      },
    ],
  },

  /*-- traps --*/
];

const Items = [
  {
    text: "totem_of_thunderstorm",
    image: "textures/eternal/better_structures/items/totem_of_thunderstorm",
  },
  {
    text: "totem_of_turtle",
    image: "textures/eternal/better_structures/items/totem_of_turtle",
  },
  {
    text: "totem_of_negation",
    image: "textures/eternal/better_structures/items/totem_of_negation",
  },
  {
    text: "crystal_heart",
    image: "textures/eternal/better_structures/items/crystal_heart",
  },
  {
    text: "dagger",
    image: "textures/eternal/better_structures/items/dagger",
  },
  {
    text: "ravager_hammer",
    image: "textures/eternal/better_structures/items/mace_pillager_item",
  },
];

const Mobs = [
  {
    text: "mimic",
    image: "textures/eternal/better_structures/items/mimic_spawn_egg",
  },
  {
    text: "pirate",
    image: "textures/eternal/better_structures/items/pirate_spawn_egg",
  },
  {
    text: "lava_spirit",
    image: "textures/eternal/better_structures/items/lava_spirit_spawn_egg",
  },
  {
    text: "mace_pillager",
    image: "textures/eternal/better_structures/items/mace_pillager_spawn_egg",
  },
  {
    text: "elder_pillager",
    image: "textures/eternal/better_structures/items/elder_pillager_spawn_egg",
  },
  {
    text: "imp",
    image: "textures/eternal/better_structures/items/imp_spawn_egg",
  },
  {
    text: "mummy",
    image: "textures/eternal/better_structures/items/mummy_spawn_egg",
  },
  {
    text: "goblin",
    image: "textures/eternal/better_structures/items/goblin_spawn_egg",
  },
];

const VoteUpdate = [];
const Settings = [
  {
    text: "particle_toggle",
    onSelect: (pl, back) => DynamicForms.toggleParticles(pl, back),
  },
];
/* ---------------------- Layer 2 -------------------- */

export const dpTag = `ecbl_bs:disable_particle`;
function openSettingsModal(pl) {
  const opts = [{ type: "toggle", text: "particle_toggle", default: pl.hasTag(dpTag) }];
  DynamicForms.modalForm(pl, "settings", opts, (pl, values) => {
    if (values && values[0]) pl.addTag(dpTag);
    else pl.removeTag(dpTag);
  });
}

// Main guidebook
const homePageData = [
  { text: "how_to_play", subpages: HowToPlay, image: "textures/eternal/better_structures/guide/howto" },
  { text: "explore_structures", subpages: ExploreStructures, image: "textures/eternal/better_structures/ui/explore" },
  { text: "blocks", subpages: Blocks, image: "textures/eternal/better_structures/guide/blocks" },
  { text: "items", subpages: Items, image: "textures/eternal/better_structures/guide/items" },
  { text: "mobs", subpages: Mobs, image: "textures/eternal/better_structures/guide/mobs" },
  { text: "settings", newForm: openSettingsModal, image: "textures/eternal/better_structures/ui/settings" },
  { text: "vote_update", subpages: VoteUpdate, image: "textures/eternal/better_structures/ui/communite" },
];
