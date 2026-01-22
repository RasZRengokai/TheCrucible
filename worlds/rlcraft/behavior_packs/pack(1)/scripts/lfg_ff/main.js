/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, BlockPermutation, ItemStack, EnchantmentType, MolangVariableMap } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
import { SofaComponent } from './sofa.js';
import { RoofComponent } from './roof.js';
import { TableComponent } from './table.js';
import { WindowFrameComponent } from './window_frame.js';
import { BenchComponent } from './bench.js';
import { PillarComponent } from './pillar.js';
import { WallComponent } from './wall.js';
import * as fence_script from './fence.js';
import { FenceGateComponent } from './fence_gate.js';
import { StreetLampComponent } from './street_lamp.js';
import { BeamComponent } from './beam.js';
import { AwningComponent } from './awning.js';
import { BedComponent } from './bed.js';
import { WallShelfComponent } from './wall_shelf.js';
import { FlowerPotComponent } from './flower_pot.js';
import { BathTubComponent } from './bath_tub.js';
import { SinkComponent } from './sink.js';
import { LampComponent } from './lamp.js';
import { CurtainsComponent } from './curtains.js';
import { GarlandComponent } from './garland.js';
import { ToiletComponent } from './toilet.js';
import { StaircaseRailComponent } from './staircase_railing.js';
import { BinComponent } from './bin.js';
import { GarageDoorComponent } from './garage_door.js';
import { ClockComponent } from './clock.js';
import { ChairComponent } from './chair.js';
import * as flooring from './floor.js';
import { CarpetComponent } from './carpet.js';
import { TreeComponent } from './tree.js';
import { BushComponent } from './bush.js';
import { DoorComponent } from './door.js';
import { PianoComponent } from './piano.js';
import { ExteriorFloorComponent } from './exterior_floor.js';
import { LetterBoxComponent } from './letterbox.js';
import { BasketHoopComponent } from './basket_hoop.js';
import { OvenComponent } from './oven.js';
import { BetterLeavesComponent } from './better_leaves.js';
import { LightSwitchComponent } from './light_switch.js';
import { CoffeeTableComponent } from './coffee_table.js';
import { KitchenStorageComponent } from './kitchen_storage.js';
import { ExteriorWallComponent } from './exterior_wall.js';
import { StructurePlacerComponent } from './structure_placer.js';
import { RoofCapComponent } from './roof_cap.js';
import { ClearGlassComponent } from './clear_glass.js';
import { ArchBlockComponent } from './arch_block.js';
import { StatueComponent } from './statue.js';
import { PlushComponent } from './plush.js';
import { XmasTreeComponent } from './xmas_tree.js';
import * as split_walls from './split_wall.js';
import * as wall_board_and_letter from './wall_board.js';
import * as clear_glass_pane_script from './clear_glass_pane.js';
import * as wardrobe from './wardrobe.js';
import * as fridge from './fridge.js';
import * as ornament from './ornament.js';
import * as basket_ball from './basket_ball.js';
const sofaComponent = new SofaComponent();
const roofComponent = new RoofComponent();
const tableComponent = new TableComponent();
const windowFrameComponent = new WindowFrameComponent();
const benchComponent = new BenchComponent();
const pillarComponent = new PillarComponent();
const wallComponent = new WallComponent();
const fenceComponent = new fence_script.FenceComponent();
const fenceGateComponent = new FenceGateComponent();
const streetLampComponent = new StreetLampComponent();
const beamComponent = new BeamComponent();
const awningComponent = new AwningComponent();
const bedComponent = new BedComponent();
const wallShelfComponent = new WallShelfComponent();
const flowerPotComponent = new FlowerPotComponent();
const bathTubComponent = new BathTubComponent();
const sinkComponent = new SinkComponent();
const lampComponent = new LampComponent();
const curtainsComponent = new CurtainsComponent();
const garlandComponent = new GarlandComponent();
const toiletComponent = new ToiletComponent();
const staircaseRailingComponent = new StaircaseRailComponent();
const binComponent = new BinComponent();
const garageDoorComponent = new GarageDoorComponent();
const clockComponent = new ClockComponent();
const floorComponent = new flooring.FloorComponent();
const carpetComponent = new CarpetComponent();
const chairComponent = new ChairComponent();
const treeComponent = new TreeComponent();
const bushComponent = new BushComponent();
const doorComponent = new DoorComponent();
const pianoComponent = new PianoComponent();
const letterBoxComponent = new LetterBoxComponent();
const basketHoopComponent = new BasketHoopComponent();
const exteriorWallComponent = new ExteriorWallComponent();
const ovenComponent = new OvenComponent();
const exteriorFloorComponent = new ExteriorFloorComponent();
const betterLeavesComponent = new BetterLeavesComponent();
const lightSwitchComponent = new LightSwitchComponent();
const coffeeTableComponent = new CoffeeTableComponent();
const kitchenStorageComponent = new KitchenStorageComponent();
const structurePlacerComponent = new StructurePlacerComponent();
const ornamentComponent = new ornament.OrnamentComponent();
const wardrobeBlockComponent = new wardrobe.WardrobeBlockComponent();
const fridgeBlockComponent = new fridge.FridgeBlockComponent();
const roofCapComponent = new RoofCapComponent();
const clearGlassComponent = new ClearGlassComponent();
const archBlockComponent = new ArchBlockComponent();
const statueComponent = new StatueComponent();
const plushComponent = new PlushComponent();
const splitWallComponent = new split_walls.SplitWallComponent();
const wallBoardComponent = new wall_board_and_letter.WallBoardComponent();
const letterTileComponent = new wall_board_and_letter.LetterTileComponent();
const clearGlassPaneComponent = new clear_glass_pane_script.ClearGlassPaneComponent()
const xmasTreeComponent = new XmasTreeComponent()
system.beforeEvents.startup.subscribe((initEvent) => {
const { blockComponentRegistry } = initEvent;
blockComponentRegistry.registerCustomComponent('lfg_ff:sofa_component', sofaComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:roof_component', roofComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:table_component', tableComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:window_frame_component', windowFrameComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:bench_component', benchComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:pillar_component', pillarComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:xmas_tree_component', xmasTreeComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:wall_component', wallComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:fence_component', fenceComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:fence_gate_component', fenceGateComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:street_lamp_component', streetLampComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:beam_component', beamComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:awning_component', awningComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:bed_component', bedComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:wall_shelf_component', wallShelfComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:flower_pot_component', flowerPotComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:bath_tub_component', bathTubComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:sink_component', sinkComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:lamp_component', lampComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:curtains_component', curtainsComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:garland_component', garlandComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:ornament_component', ornamentComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:toilet_component', toiletComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:staircase_railing_component', staircaseRailingComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:bin_component', binComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:garage_door_component', garageDoorComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:clock_component', clockComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:chair_component', chairComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:floor_component', floorComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:carpet_component', carpetComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:tree_component', treeComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:bush_component', bushComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:door_component', doorComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:piano_component', pianoComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:light_switch_component', lightSwitchComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:basket_hoop_component', basketHoopComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:exterior_wall_component', exteriorWallComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:wardrobe_block_component', wardrobeBlockComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:fridge_block_component', fridgeBlockComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:letterbox_component', letterBoxComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:kitchen_storage_block_component', kitchenStorageComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:oven_block_component', ovenComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:coffee_table_component', coffeeTableComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:better_leaves_component', betterLeavesComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:exterior_floor_component', exteriorFloorComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:structure_placer_block_component', structurePlacerComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:roof_cap_component', roofCapComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:clear_glass_pane_component', clearGlassPaneComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:clear_glass_component', clearGlassComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:arch_block_component', archBlockComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:wall_board_component', wallBoardComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:letter_tile_component', letterTileComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:statue_component', statueComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:split_wall_component', splitWallComponent);
blockComponentRegistry.registerCustomComponent('lfg_ff:plush_component', plushComponent);
});
function getNghDoorsAndGates(poweredBlocks) {
const doorList = []
const fenceGateList = []
for (const poweredBlock of poweredBlocks) {
const nghBlocks = [poweredBlock.below(), poweredBlock.above(), poweredBlock.north(), poweredBlock.south(), poweredBlock.east(), poweredBlock.west()]
nghBlocks.forEach((nghblock) => {
if (nghblock.typeId == "lfg_ff:door") doorList.push(nghblock)
if (nghblock.typeId == "lfg_ff:fence_gate") fenceGateList.push(nghblock)
})
}
return { doorList, fenceGateList };
}
world.afterEvents.pressurePlatePush.subscribe((e) => {
const { block, dimension, redstonePower, previousRedstonePower, source } = e
const poweredBlocks = [block, block.below()]
const { doorList, fenceGateList } = getNghDoorsAndGates(poweredBlocks)
for (const door of doorList) {
doorComponent.openDoor(door, redstonePower > 0)
}
for (const fenceGate of fenceGateList) {
fenceGateComponent.openFenceGate(fenceGate, redstonePower > 0)
}
})
world.afterEvents.pressurePlatePop.subscribe((e) => {
const { block, dimension, redstonePower, previousRedstonePower } = e
const poweredBlocks = [block, block.below()]
const { doorList, fenceGateList } = getNghDoorsAndGates(poweredBlocks)
for (const door of doorList) {
doorComponent.openDoor(door, redstonePower > 0)
}
for (const fenceGate of fenceGateList) {
fenceGateComponent.openFenceGate(fenceGate, redstonePower > 0)
}
})
world.afterEvents.leverAction.subscribe((e) => {
const { block, dimension, isPowered, player } = e
const leverDir = block.permutation.getState("lever_direction")
const blockDirMapping = {
"north": block.south(),
"south": block.north(),
"east": block.west(),
"west": block.east(),
"up_east_west": block.below(),
"up_north_south": block.below(),
"down_east_west": block.above(),
"down_north_south": block.above(),
}
const poweredBlocks = [
block,
blockDirMapping[leverDir]
]
const { doorList, fenceGateList } = getNghDoorsAndGates(poweredBlocks)
for (const door of doorList) {
doorComponent.openDoor(door, isPowered)
}
for (const fenceGate of fenceGateList) {
fenceGateComponent.openFenceGate(fenceGate, isPowered)
}
})
world.afterEvents.buttonPush.subscribe((e) => {
const { block, dimension, source } = e
const buttonDir = block.permutation.getState("facing_direction")
const blockDirMapping = {
0: block.above(),
1: block.below(),
2: block.south(),
3: block.north(),
4: block.east(),
5: block.west(),
}
const poweredBlocks = [
block,
blockDirMapping[buttonDir]
]
const { doorList, fenceGateList } = getNghDoorsAndGates(poweredBlocks)
for (const door of doorList) {
doorComponent.openDoor(door, true)
system.runTimeout(() => {
doorComponent.openDoor(door, false)
}, 20 * 1.5)
}
for (const fenceGate of fenceGateList) {
fenceGateComponent.openFenceGate(fenceGate, true)
system.runTimeout(() => {
fenceGateComponent.openFenceGate(fenceGate, false)
}, 20 * 1.5)
}
})
const OVEN_FURNACE_RECIPES = [
{ product: "minecraft:coal", ingredient: "minecraft:coal_ore" },
{ product: "minecraft:coal", ingredient: "minecraft:deepslate_coal_ore" },
{ product: "minecraft:iron_ingot", ingredient: "minecraft:iron_ore" },
{ product: "minecraft:iron_ingot", ingredient: "minecraft:deepslate_iron_ore" },
{ product: "minecraft:gold_ingot", ingredient: "minecraft:gold_ore" },
{ product: "minecraft:gold_ingot", ingredient: "minecraft:deepslate_gold_ore" },
{ product: "minecraft:copper_ingot", ingredient: "minecraft:copper_ore" },
{ product: "minecraft:copper_ingot", ingredient: "minecraft:deepslate_copper_ore" },
{ product: "minecraft:emerald", ingredient: "minecraft:emerald_ore" },
{ product: "minecraft:emerald", ingredient: "minecraft:deepslate_emerald_ore" },
{ product: "minecraft:diamond", ingredient: "minecraft:diamond_ore" },
{ product: "minecraft:diamond", ingredient: "minecraft:deepslate_diamond_ore" },
{ product: "minecraft:lapis_lazuli", ingredient: "minecraft:lapis_ore" },
{ product: "minecraft:lapis_lazuli", ingredient: "minecraft:deepslate_lapis_ore" },
{ product: "minecraft:redstone", ingredient: "minecraft:redstone_ore" },
{ product: "minecraft:redstone", ingredient: "minecraft:deepslate_redstone_ore" },
{ product: "minecraft:quartz", ingredient: "minecraft:quartz_ore" },
{ product: "minecraft:gold_ingot", ingredient: "minecraft:nether_gold_ore" },
{ product: "minecraft:gold_ingot", ingredient: "minecraft:raw_gold" },
{ product: "minecraft:copper_ingot", ingredient: "minecraft:raw_copper" },
{ product: "minecraft:iron_ingot", ingredient: "minecraft:raw_iron" },
{ product: "minecraft:netherite_scrap", ingredient: "minecraft:ancient_debris" },
{ product: "minecraft:stone", ingredient: "minecraft:cobblestone" },
{ product: "minecraft:cracked_stone_bricks", ingredient: "minecraft:stone_bricks" },
{ product: "minecraft:smooth_basalt", ingredient: "minecraft:basalt" },
{ product: "minecraft:smooth_stone", ingredient: "minecraft:stone" },
{ product: "minecraft:smooth_quartz", ingredient: "minecraft:quartz_block" },
{ product: "minecraft:cracked_polished_blackstone_bricks", ingredient: "minecraft:polished_blackstone_bricks" },
{ product: "minecraft:netherbrick", ingredient: "minecraft:netherrack" },
{ product: "minecraft:cracked_nether_bricks", ingredient: "minecraft:nether_brick" },
{ product: "minecraft:cracked_deepslate_bricks", ingredient: "minecraft:deepslate_bricks" },
{ product: "minecraft:cracked_deepslate_tiles", ingredient: "minecraft:deepslate_tiles" },
{ product: "minecraft:deepslate", ingredient: "minecraft:cobbled_deepslate" },
{ product: "minecraft:glass", ingredient: "minecraft:sand" },
{ product: "minecraft:glass", ingredient: "minecraft:red_sand" },
{ product: "minecraft:smooth_red_sandstone", ingredient: "minecraft:red_sandstone" },
{ product: "minecraft:smooth_sandstone", ingredient: "minecraft:sandstone" },
{ product: "minecraft:brick", ingredient: "minecraft:clay_ball" },
{ product: "minecraft:hardened_clay", ingredient: "minecraft:clay" },
{ product: "minecraft:cooked_porkchop", ingredient: "minecraft:porkchop" },
{ product: "minecraft:cooked_beef", ingredient: "minecraft:beef" },
{ product: "minecraft:cooked_chicken", ingredient: "minecraft:chicken" },
{ product: "minecraft:cooked_mutton", ingredient: "minecraft:mutton" },
{ product: "minecraft:cooked_rabbit", ingredient: "minecraft:rabbit" },
{ product: "minecraft:baked_potato", ingredient: "minecraft:potato" },
{ product: "minecraft:cooked_cod", ingredient: "minecraft:cod" },
{ product: "minecraft:cooked_salmon", ingredient: "minecraft:salmon" },
{ product: "minecraft:dried_kelp", ingredient: "minecraft:kelp" },
{ product: "minecraft:sponge", ingredient: "minecraft:wet_sponge" },
{ product: "minecraft:green_dye", ingredient: "minecraft:cactus" },
{ product: "minecraft:lime_dye", ingredient: "minecraft:sea_pickle" },
{ product: "minecraft:popped_chorus_fruit", ingredient: "minecraft:chorus_fruit" },
];
const OvenGoldItems = [
"minecraft:gold_ingot",
"minecraft:gold_nugget",
"minecraft:raw_gold",
"minecraft:golden_horse_armor",
"minecraft:golden_hoe",
"minecraft:golden_shovel",
"minecraft:golden_pickaxe",
"minecraft:golden_axe",
"minecraft:golden_sword",
"minecraft:golden_boots",
"minecraft:golden_leggings",
"minecraft:golden_chestplate",
"minecraft:golden_helmet",
"minecraft:enchanted_golden_apple",
"minecraft:golden_apple",
"minecraft:golden_carrot",
"minecraft:deepslate_gold_ore",
"minecraft:nether_gold_ore",
"minecraft:gold_ore",
"minecraft:raw_gold_block",
"minecraft:gold_block"
];
const OvenIronItems = [
"minecraft:iron_helmet",
"minecraft:iron_chestplate",
"minecraft:iron_leggings",
"minecraft:iron_boots",
"minecraft:iron_sword",
"minecraft:iron_shovel",
"minecraft:iron_pickaxe",
"minecraft:iron_axe",
"minecraft:iron_hoe",
"minecraft:iron_horse_armor",
"minecraft:chainmail_helmet",
"minecraft:chainmail_chestplate",
"minecraft:chainmail_leggings",
"minecraft:chainmail_boots",
"minecraft:deepslate_iron_ore",
"minecraft:iron_ore",
"minecraft:raw_iron_block",
"minecraft:iron_block",
"minecraft:iron_bars",
"minecraft:iron_trapdoor",
"minecraft:iron_door",
"minecraft:iron_chain",
"minecraft:iron_ingot",
"minecraft:raw_iron",
"minecraft:iron_nugget",
"minecraft:hopper",
"minecraft:tnt_minecart",
"minecraft:hopper_minecart",
"minecraft:minecart",
"minecraft:detector_rail",
"minecraft:activator_rail",
"minecraft:rail",
"minecraft:golden_rail",
"minecraft:chest_minecart"
];
const UPDATES_TITLE = [
"Update 2.0"
]
const UPDATES_ICON = [
"textures/lfg_ff/lfg_ff/icons/icon_update_2.0",
]
const UPDATES_CHANGELOG = [
"§b§lFurniture Builder 2.0 Update§r\n\n\
This 2.0 update introduces §bnew blocks§r, §bnew features§r, seasonal §bHalloween§r and §bChristmas§r content, and full compatibility with §bVibrant Visuals§r.\n\n\
§6§lNew Blocks:§r\n\n\
- §cClear Glass§r + §cClear Glass Pane§r\n\
- §cArch§r\n\
- §cRoof Cap§r\n\
- §cSplit Wall§r\n\
- §cStatue§r\n\
- §cWall Board§r + §cLetter Tile§r\n\
- §cDesk Supplies§r, §cMini Pumpkins§r\n\
- §cToys§r, §cStacked Gifts§r\n\
- §cChristmas Tree§r\n\
- §cPlush§r\n\n\
§6§lNew Features:§r\n\n\
- The add-on is now fully compatible with §bVibrant Visuals§r. Block visuals dynamically adapt with Vibrant Visuals.\n\n\
- Added a §bVibrant Visuals§r category to the Settings Item (optimize world visuals for players using Vibrant Visuals).\n\n\
- Added a §bDebugging§r category to the Settings Item (easily despawn bugged elements and help with support).\n\n\
- Roof tiles can now connect at §asteeper§r and §aflatter§r angles.\n\n\
- Flooring blocks now feature multiple §bceiling variants§r on their underside, independent from the top/floor side.\n\n\
- Structural beams can now be placed §avertically in corners§r (Place them against walls with a solid block in front/on sides to form proper corner connections).\n\n\
§6§lNew Variants:§r\n\n\
- Flooring: §a+1§r\n\
- Column: §a+4§r\n\
- Interior Wall: §a+4§r\n\
- Exterior Wall: §a+4§r\n\
- Framed Window: §a+2§r\n\
- Fence/Gate: §a+2§r\n\
- Lamp: §a+1§r\n\
- Garland: §a+6§r\n\
- Bed / Couch / Cushion: §a+2§r\n\
- Wardrobe: §a+3§r\n\
- Curtains: §a+1§r\n\
- Trash Bin: §a+1§r\n\
- Bushy Leaves / Bush / Tree: §a+2§r\n\
- Roof: §a+1§r\n\
- Bench: §a+1§r\n\
- Street Lamp Post: §a+1§r\n\
- Carpet: §a+2§r\n\
- Grass Floor: §a+3§r\n\n\
§6§lNew Structures:§r\n\n\
- §a14 new structures§r, including §c2 Halloween Specials§r, §c2 Christmas Specials§r and §c2 Lofi Girl Specials§r\n\n\
§6§lFixes:§r\n\n\
- Fixed a bug where some players couldn't sit on sit-able blocks.\n\n\
- Beds now set spawnpoints.\n\n\
- You can now change the variant of a decoration block placed on a coffee table.\n\n\
- Fixed cushion positions on beds, and cushions no longer change the variant of the block behind them when edited.\n\n\
- Fixed lamps where candles glowed too much over time.\n\n\
- Trash bins no longer delete items inside their storage.\n\n\
- Interacting with a cushion on certain blocks no longer removes it from your inventory.\n\n\
- Reduced the randomness of flowered grass when placing Grass Floor blocks.\n\n\
- Roofs now always use the correct variant when placed.\n\n\
- Curtains: retracted parts no longer have a hitbox, and closed curtains now adjust light properly depending on their variant.\n\n\
- Bushy leaves now always use the correct variant when placed.\n\n\
- Fixed duplication bug with chairs when placing them.\n\n\
- Increased oven cooking/smelting time.\n\n\
- Storage blocks: only the one you interact with will open, no more random openings with multiple players, and quickly looking at another storage block after closing one no longer triggers it.\n\n\
- Storage blocks, lamp glow, clocks, basketball hoops, and water particles (bath/sink) now correctly despawn when destroyed by commands or other add-on features.\n\n\
- The following blocks are now visible from farther distances: Carpets, Benches, Tables, Coffee Tables, Fences, Fence Gates, Doors, Street Lamps, Garage Doors.\n\n\
- Structure Placer no longer displays the 'Required resources' message behind the inventory UI.\n\n\
- Structure Placer can no longer place structures below bedrock level or above the sky build limit.\n\n\
- Items containing gold now behave the same as iron items when used in the Microwave.\n\n\
- Added a new Ambient VFX toggle to disable trees, bushy leaves, and bushes animated textures by default. You can now also use the Wrench to enable or disable animated textures directly on these blocks.\n\n\
- Players can now steal the basketball from others. Interact on a nearby player holding the ball (with empty hands) to take it.\n",
];
function updateLogMenu(player) {
const updateMenu = new ActionFormData();
updateMenu.title("Update Log");
updateMenu.body("Select an update version§r:");
UPDATES_TITLE.forEach((version, index) => {
updateMenu.button(version, UPDATES_ICON[index]);
})
updateMenu.show(player).then(result => {
if (result.canceled) return;
let response = result.selection;
updateChangelogMenu(player, response)
});
}
function updateChangelogMenu(player, response) {
const changelog = UPDATES_CHANGELOG[response]
const changelogMenu = new ActionFormData();
changelogMenu.title(UPDATES_TITLE[response]);
changelogMenu.body(changelog)
changelogMenu.button("Back")
changelogMenu.show(player).then(result => {
if (result.canceled) return;
if (result.selection == 0)
updateLogMenu(player);
});
}
world.afterEvents.itemUse.subscribe((e) => {
const { source, itemStack } = e
const player = e.source
if (player.typeId !== "minecraft:player") return
if (itemStack.typeId == "lfg_ff:settings_item") {
globalSettingsUI(player)
}
})
function globalSettingsUI(player) {
player.dimension.playSound("random.click", player.location)
const globalSettingsUI = new ActionFormData()
.title("Furniture Builder Settings")
.body("Select a settings category to configure:")
.button("Ambient VFX", "textures/lfg_ff/lfg_ff/icons/icon_ambient_particles")
.button("Debugging", "textures/lfg_ff/lfg_ff/icons/icon_debugging")
.button("Update Log", "textures/lfg_ff/lfg_ff/icons/icon_update_log")
.button("Vibrant Visuals", "textures/lfg_ff/lfg_ff/icons/icon_vibrant_visual")
.show(player).then((e) => {
if (e.canceled) return;
if (e.selection == 0) {
particleSettingsUI(player)
}
if (e.selection == 1) {
debuggingSettingsUI(player)
}
if (e.selection == 2) {
updateLogMenu(player)
}
if (e.selection == 3) {
vibrantVisualsSettingsUI(player)
}
})
}
function particleSettingsUI(player) {
const defaultParams = { bush: true, tree: true, bushy_leaves: true, flower_pot: true, street_lamp: true, lamp_v7: true, animated_bush: true, animated_better_leaves: true, animated_tree: true }
const worldParticleSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? JSON.stringify(defaultParams)
const particleSettingsUI = new ModalFormData()
.title("Ambient VFX Settings")
.label("Enable or disable ambient particle effects for each block:")
.toggle("Bush §8(flowered variant only - butterflies, bees, fireflies at night)", { defaultValue: JSON.parse(worldParticleSettings).bush, tooltip: undefined })
.toggle("Tree §8(flowered variant only - butterflies, bees, fireflies at night)", { defaultValue: JSON.parse(worldParticleSettings).tree, tooltip: undefined })
.toggle("Bushy Leaves §8(falling leaves)", { defaultValue: JSON.parse(worldParticleSettings).bushy_leaves, tooltip: undefined })
.toggle("Flower Pot §8(butterflies, bees)", { defaultValue: JSON.parse(worldParticleSettings).flower_pot, tooltip: undefined })
.toggle("Street Lamp Post §8(soft glow lighting and fireflies)", { defaultValue: JSON.parse(worldParticleSettings).street_lamp, tooltip: undefined })
.toggle("Lamp (Wall - Variant 7) §8(soft glow lighting)", { defaultValue: JSON.parse(worldParticleSettings).lamp_v7, tooltip: undefined })
.divider()
.label("Animated Textures:")
.toggle("Bush Animated Texture", { defaultValue: JSON.parse(worldParticleSettings).animated_bush, tooltip: undefined })
.toggle("Bushy Leaves Animated Texture", { defaultValue: JSON.parse(worldParticleSettings).animated_better_leaves, tooltip: undefined })
.toggle("Tree Animated Texture", { defaultValue: JSON.parse(worldParticleSettings).animated_tree, tooltip: undefined })
.show(player).then((e) => {
if (e.canceled) return;
const newParams = { bush: e.formValues[1], tree: e.formValues[2], bushy_leaves: e.formValues[3], flower_pot: e.formValues[4], street_lamp: e.formValues[5], lamp_v7: e.formValues[6], animated_bush: e.formValues[9], animated_better_leaves: e.formValues[10], animated_tree: e.formValues[11] }
world.setDynamicProperty("lfg_ff:world_particle_settings", JSON.stringify(newParams))
})
}
function debuggingSettingsUI(player) {
const debuggingSettingsUI = new ActionFormData()
.title("Debugging Settings")
.body("Select a settings category :")
.button("Remove/Despawn")
.button("Global Toggles")
.show(player).then((e) => {
if (e.canceled) return;
if (e.selection == 0) {
debuggingDespawnSettingsUI(player)
}
if (e.selection == 1) {
debuggingTogglesSettingsUI(player)
}
})
}
function vvOptimized() {
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
if (worldVVSetings == undefined) return false;
return worldVVSetings;
}
function vibrantVisualsSettingsUI(player) {
const defaultToggle = false
const worldVVSetings = world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals") == undefined ? defaultToggle : world.getDynamicProperty("lfg_ff:optimized_vibrant_visuals")
const vvSettingsUI = new ModalFormData()
.title("Optimized Vibrant Visuals")
.label("§7This add-on is §bVibrant Visuals Enhanced§r, meaning that many block visuals are designed to adapt dynamically when §aVibrant Visuals§r is enabled. However, you can decide to make your world even more enhanced for §bVibrant Visuals§r with the toggle below.§r\n\n\This toggle adjusts how certain visual effects appear in the world.\n\n\
- When §aON§r: visuals are optimized for players §bwith Vibrant Visuals§r enabled (glow particles will be more adapted for those using Vibrant Visuals).\n\n\
- When §cOFF§r: visuals are optimized for players §bwithout Vibrant Visuals§r enabled (glow particles will be less adapted for those using Vibrant Visuals).\n\n")
.toggle("Optimized Vibrant Visuals", { defaultValue: worldVVSetings, tooltip: undefined })
.show(player).then((e) => {
if (e.canceled) return;
world.setDynamicProperty("lfg_ff:optimized_vibrant_visuals", e.formValues[1])
})
}
function getGlobalDebugToggles() {
const worldGlobalDebugToggles = world.getDynamicProperty("lfg_ff:world_debug_global_settings") ?? undefined
const defaultParams = { inContainerCd: true, removeStorageBlockOnEmpty: true, removeVisualEntityOnEmpty: true, useMainVariantSelectionEvent: true, hideVariantSelectionDebugLogs: true, enableBasketBallSteals: true }
if (worldGlobalDebugToggles == undefined) return defaultParams;
return JSON.parse(worldGlobalDebugToggles)
}
function debuggingTogglesSettingsUI(player) {
const defaultParams = { inContainerCd: true, removeStorageBlockOnEmpty: true, removeVisualEntityOnEmpty: true, useMainVariantSelectionEvent: true, hideVariantSelectionDebugLogs: true, enableBasketBallSteals: true }
const worldDebugGlobalSettings = world.getDynamicProperty("lfg_ff:world_debug_global_settings") ?? JSON.stringify(defaultParams)
const particleSettingsUI = new ModalFormData()
.title("Global Toggles Settings")
.label("§cThese settings are for debugging purposes.\n\nIt's best to keep them all ON, unless someone or the guidebook specifically asked you to change them.\n\n")
.toggle("In Container Cooldown", { defaultValue: JSON.parse(worldDebugGlobalSettings).inContainerCd, tooltip: undefined })
.toggle("Remove Storage On Empty Blocks", { defaultValue: JSON.parse(worldDebugGlobalSettings).removeStorageBlockOnEmpty, tooltip: undefined })
.toggle("Remove Visual Entity On Empty Blocks", { defaultValue: JSON.parse(worldDebugGlobalSettings).removeVisualEntityOnEmpty, tooltip: undefined })
.toggle("Use Main Variant Selection Event", { defaultValue: JSON.parse(worldDebugGlobalSettings).useMainVariantSelectionEvent, tooltip: undefined })
.toggle("Hide Variant Selection Debug Logs", { defaultValue: JSON.parse(worldDebugGlobalSettings).hideVariantSelectionDebugLogs, tooltip: undefined })
.toggle("Enable Basketball Steals", { defaultValue: JSON.parse(worldDebugGlobalSettings).enableBasketBallSteals, tooltip: undefined })
.show(player).then((e) => {
if (e.canceled) return;
const newParams = { inContainerCd: e.formValues[1], removeStorageBlockOnEmpty: e.formValues[2], removeVisualEntityOnEmpty: e.formValues[3], useMainVariantSelectionEvent: e.formValues[4], hideVariantSelectionDebugLogs: e.formValues[5], enableBasketBallSteals: e.formValues[6] }
world.setDynamicProperty("lfg_ff:world_debug_global_settings", JSON.stringify(newParams))
})
}
function debuggingDespawnSettingsUI(player) {
const debuggingSettingsUI = new ActionFormData()
.title("Remove/Despawn Settings")
.body("§lChoose what you want to remove.§r\n\nIt will check the area around you and clear all matching objects within that range.\n\n§cThis is a debugging tool, only use it if you can't remove the object through normal gameplay.\n\n\n§r*Storage Blocks: Wardrobe, Kitchen Cabinet, Refrigerator, Trash Bin, Oven, Mailbox, Structure Placer")
const RemoveElements = [
{ name: "Structure Blueprint", ids: ["lfg_ff:structure_blueprint"], radius: 20 },
{ name: "Guidebook", ids: ["lfg_ff:guidebook"], radius: 5 },
{ name: "Lamp Light/Glow/Candle Flamme", ids: ["lfg_ff:lamp_fade"], radius: 3 },
{ name: "Storage Blocks *", ids: ["lfg_ff:kitchen_storage", "lfg_ff:bin", "lfg_ff:structure_placer", "lfg_ff:letterbox", "lfg_ff:fridge", "lfg_ff:oven", "lfg_ff:wardrobe"], radius: 2 },
{ name: "Oven Food/Item", ids: ["lfg_ff:oven_dummy"], radius: 2 },
{ name: "Bath/Sink/Shower Water", ids: ["lfg_ff:sink_water", "lfg_ff:bath_water_level", "lfg_ff:shower_entity"], radius: 3 },
{ name: "Cushion", ids: ["lfg_ff:pillow_entity"], radius: 3 },
{ name: "Basket Ball", ids: ["lfg_ff:basket_ball_entity"], radius: 3 },
{ name: "Basketball Hoop", ids: ["lfg_ff:basket_hoop_entity"], radius: 5 },
{ name: "Grandfather Clock", ids: ["lfg_ff:clock_pendule"], radius: 3 },
]
for (const element of RemoveElements) {
debuggingSettingsUI.button(`${element.name}\n§o§7(Range: ${element.radius})`)
}
debuggingSettingsUI.show(player).then((e) => {
if (e.canceled) return;
const selectedElement = RemoveElements[e.selection]
searchAndRemoveEntities(player, selectedElement)
})
}
function searchAndRemoveEntities(player, selectedElement) {
const entities = player.dimension.getEntities({ location: player.location, maxDistance: selectedElement.radius }).filter(e => selectedElement.ids.includes(e.typeId))
displayDespawnRangeParticle(player.dimension, player.location, selectedElement.radius, entities.length > 0)
system.runTimeout(() => {
try {
if (entities.length > 0) {
for (const entity of entities) {
if (selectedElement.name == "Storage Blocks *") {
const inv = entity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
player.dimension.spawnItem(item, Vector.add(entity.location, new Vector(0, 0.5, 0)))
}
if (entity.typeId == "lfg_ff:oven") {
let foodEntity = entity.getComponent('rideable')?.getRiders()[0]
if (foodEntity) {
foodEntity.remove()
}
}
if (entity.typeId == "lfg_ff:structure_placer") {
let titleEntity = entity.getComponent('rideable')?.getRiders()[0]
if (titleEntity) {
titleEntity.remove()
}
}
}
if (selectedElement.name == "Oven Food/Item") {
let ovenEntity = entity.getComponent('riding')?.entityRidingOn
if (ovenEntity) {
const inv = ovenEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) {
inv.setItem(i, null)
player.dimension.spawnItem(item, Vector.add(entity.location, new Vector(0, 0.5, 0)))
}
}
}
}
entity.remove()
}
player.sendMessage(`§9<Settings> §2Removed ${selectedElement.name} from the area. (x${entities.length})`)
player.playSound("note.bell", { pitch: 1.1 })
} else {
player.sendMessage(`§9<Settings> §cNo ${selectedElement.name} was found in the area.`)
player.playSound("note.bass", { pitch: 0.8 })
}
} catch { }
}, 3.2 * 20)
}
function displayDespawnRangeParticle(dimension, loc, range, found) {
const spawnLoc = Vector.add(loc, new Vector(0.5, 0.5, 0.5))
let radius = range + 0.2
let duration = 4
const angles = [
0, 45, 90, 135
]
for (const angle of angles) {
let mvm = new MolangVariableMap();
mvm.setFloat(`variable.radius`, radius);
mvm.setFloat(`variable.duration`, duration);
mvm.setFloat(`variable.angle`, angle + 1);
dimension.spawnParticle(`lfg_ff:despawn_range_circle_${found ? "green" : "red"}`, spawnLoc, mvm);
}
const hrzAngles = [
90, 55, 125
]
for (const angle of hrzAngles) {
let rad = angle * 2 * Math.PI / 360;
let height = Math.cos(rad) * radius;
let r2 = Math.sin(rad) * radius;
let mvm = new MolangVariableMap();
mvm.setFloat(`variable.radius`, r2);
mvm.setFloat(`variable.duration`, duration);
dimension.spawnParticle(`lfg_ff:despawn_range_circle_hrz_${found ? "green" : "red"}`, Vector.add(spawnLoc, new Vector(0, height + 0.05, 0)), mvm);
}
}
function calculateDistance(point1, point2) {
const dx = point2.x - point1.x;
const dy = point2.y - point1.y;
const dz = point2.z - point1.z;
return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
world.afterEvents.entitySpawn.subscribe((e) => {
const entity = e.entity
try {
if (entity.typeId == "lfg_ff:wardrobe") {
entity.nameTag = "§r"
}
if (entity.typeId == "lfg_ff:fridge") {
entity.nameTag = "§r"
}
} catch (e) {
}
})
world.afterEvents.itemUse.subscribe((e) => {
const { source, itemStack } = e
if (source.typeId !== "minecraft:player" || !source.isSneaking) return;
if (itemStack.typeId == "lfg_ff:color_brush") {
colorBrushUI(source, false)
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
colorBrushUI(source, true)
}
})
function colorBrushUI(player, targeted) {
const modeInfo = player.getDynamicProperty(`lfg_ff:${targeted ? "tvs" : "vs"}_color_brush_mode`) ?? 0
const brushModeGUI = new ModalFormData()
.title(`${targeted ? "Targeted " : ""}Variant Selector Settings`)
.dropdown("§lSelect tool mode:", ["Normal Mode", "Color Picker Mode"], { defaultValueIndex: modeInfo, tooltip: undefined })
player.dimension.playSound("random.click", player.location, { volume: 1 })
brushModeGUI.show(player).then((selec) => {
if (selec.canceled) return;
player.setDynamicProperty(`lfg_ff:${targeted ? "tvs" : "vs"}_color_brush_mode`, selec.formValues[0])
});
}
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
const { itemStack, player, target } = e
if (!itemStack || !target || !player || player.isSneaking) return;
const itemList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small"
]
const entityList = [
"lfg_ff:bin",
"lfg_ff:fridge",
"lfg_ff:kitchen_storage",
"lfg_ff:letterbox",
"lfg_ff:oven",
"lfg_ff:wardrobe",
]
if (!itemList.includes(itemStack.typeId)) return;
if (!entityList.includes(target.typeId)) return;
const getBlockComponent = {
"lfg_ff:wardrobe": wardrobeBlockComponent,
"lfg_ff:bin": binComponent,
"lfg_ff:fridge": fridgeBlockComponent,
"lfg_ff:kitchen_storage": kitchenStorageComponent,
"lfg_ff:letterbox": letterBoxComponent,
"lfg_ff:oven": ovenComponent,
}
const blockComponent = getBlockComponent[target.typeId]
const block = player.dimension.getBlock(Vector.add(target.location, new Vector(0, 0.2, 0)))
if (itemStack.typeId == "lfg_ff:variant_picker") {
system.runTimeout(() => {
handleVariantPicker(target, player)
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:color_brush") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:vs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
blockComponent.variantChanger({ block, player, smallBrush: false, variantPicker: pickerVariant })
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
const colorPickerMode = player.getDynamicProperty("lfg_ff:tvs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
blockComponent.variantChanger({ block, player, smallBrush: true, variantPicker: pickerVariant })
}, 1)
return;
}
})
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!isFirstEvent) return;
if (!itemStack) return;
if (itemStack.typeId == "lfg_ff:furniture_wrench" && block.typeId == "lfg_ff:clock") {
system.runTimeout(() => {
let clockEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: "lfg_ff:clock_pendule" })[0]
if (!clockEntity) clockEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, -1, 0.5)), maxDistance: 0.1, type: "lfg_ff:clock_pendule" })[0]
if (clockEntity) {
const sound = clockEntity.getProperty("lfg_ff:sound")
clockEntity.setProperty("lfg_ff:sound", !sound)
clockEntity.dimension.playSound("random.click", clockEntity.location)
}
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:furniture_wrench" && ["lfg_ff:better_leaves", "lfg_ff:tree", "lfg_ff:bush"].includes(block.typeId)) {
system.runTimeout(() => {
const isAnimated = block.permutation.getState("lfg_ff:animated")
block.setPermutation(block.permutation.withState("lfg_ff:animated", !isAnimated))
player.sendMessage(`§9<Settings> §fAnimated Texture: ${!isAnimated ? "§2True" : "§cFalse"}.`)
player.dimension.playSound("random.click", block.location)
}, 1)
return;
}
})
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
const { itemStack, player, target } = e;
if (!getGlobalDebugToggles()?.enableBasketBallSteals) return;
if (itemStack) return;
if (target.typeId !== "minecraft:player") return;
if (Vector.distanceBetween(target.location, player.location) > 2.5) return;
let handItem = target.getComponent("inventory").container.getItem(target.selectedSlotIndex);
if (!handItem || handItem.typeId !== "lfg_ff:basket_ball_item") return;
system.runTimeout(() => {
player.getComponent("inventory").container.setItem(player.selectedSlotIndex, handItem);
target.runCommand(`clear @s lfg_ff:basket_ball_item 0 1`)
player.dimension.playSound("random.pop", target.location)
}, 1)
return;
})
function getRaycastedBlockInfo(player) {
return player.getBlockFromViewDirection({
maxDistance: 8.5,
includeLiquidBlocks: false,
includePassableBlocks: true
});
}
world.afterEvents.itemUse.subscribe((e) => {
const { itemStack, source: player } = e
if (getGlobalDebugToggles()?.useMainVariantSelectionEvent) return;
const debugLogs = !getGlobalDebugToggles()?.hideVariantSelectionDebugLogs
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c1")
if (player.typeId !== "minecraft:player") return;
if (!itemStack) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c2")
const itemList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small"
]
const blockList = [
"lfg_ff:wall",
"lfg_ff:basket_hoop",
"lfg_ff:beam",
"lfg_ff:better_leaves",
"lfg_ff:bush",
"lfg_ff:carpet",
"lfg_ff:clock",
"lfg_ff:coffee_table",
"lfg_ff:exterior_wall",
"lfg_ff:fence",
"lfg_ff:flower_pot",
"lfg_ff:garland",
"lfg_ff:ornament_book",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_table",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:ornament_gifts",
"lfg_ff:ornament_pumpkins",
"lfg_ff:pillar",
"lfg_ff:xmas_tree",
"lfg_ff:roof",
"lfg_ff:staircase_railing",
"lfg_ff:street_lamp",
"lfg_ff:table",
"lfg_ff:tree",
"lfg_ff:wall_shelf",
"lfg_ff:window_frame",
"lfg_ff:exterior_floor",
"lfg_ff:grass_path",
"lfg_ff:roof_cap",
"lfg_ff:statue",
"lfg_ff:clear_glass",
"lfg_ff:clear_glass_pane",
"lfg_ff:arch_block",
"lfg_ff:plush",
"lfg_ff:awning",
"lfg_ff:bath_tub",
"lfg_ff:bench",
"lfg_ff:chair",
"lfg_ff:bed",
"lfg_ff:curtains",
"lfg_ff:door",
"lfg_ff:fence_gate",
"lfg_ff:garage_door",
"lfg_ff:lamp",
"lfg_ff:light_switch",
"lfg_ff:piano",
"lfg_ff:sink",
"lfg_ff:sofa",
"lfg_ff:toilet",
]
const specialBlockList = [
"lfg_ff:bin_block",
"lfg_ff:fridge_block",
"lfg_ff:kitchen_storage_block",
"lfg_ff:letterbox_block",
"lfg_ff:oven_block",
"lfg_ff:wardrobe_block",
]
if (player.isSneaking) {
return;
}
if (!itemList.includes(itemStack.typeId)) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c3")
const ray = getRaycastedBlockInfo(player);
if (!ray) {
return;
}
const block = ray.block
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c4")
if (!blockList.includes(block.typeId) && !specialBlockList.includes(block.typeId)) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c5")
const ORNAMENTS = [
"lfg_ff:ornament_table",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_book",
"lfg_ff:ornament_pumpkins",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:ornament_gifts",
]
if (block.typeId == "lfg_ff:coffee_table" && (block.above().typeId == "lfg_ff:plush" || ORNAMENTS.includes(block.above().typeId))) {
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c6")
const getBlockComponent = {
"lfg_ff:wall": wallComponent,
"lfg_ff:basket_hoop": basketHoopComponent,
"lfg_ff:beam": beamComponent,
"lfg_ff:better_leaves": betterLeavesComponent,
"lfg_ff:bush": bushComponent,
"lfg_ff:carpet": carpetComponent,
"lfg_ff:clock": clockComponent,
"lfg_ff:coffee_table": coffeeTableComponent,
"lfg_ff:exterior_wall": exteriorWallComponent,
"lfg_ff:fence": fenceComponent,
"lfg_ff:flower_pot": flowerPotComponent,
"lfg_ff:garland": garlandComponent,
"lfg_ff:ornament_book": ornamentComponent,
"lfg_ff:ornament_cadre": ornamentComponent,
"lfg_ff:ornament_plant": ornamentComponent,
"lfg_ff:ornament_table": ornamentComponent,
"lfg_ff:ornament_desk": ornamentComponent,
"lfg_ff:ornament_toys": ornamentComponent,
"lfg_ff:ornament_gifts": ornamentComponent,
"lfg_ff:ornament_pumpkins": ornamentComponent,
"lfg_ff:pillar": pillarComponent,
"lfg_ff:xmas_tree": xmasTreeComponent,
"lfg_ff:roof": roofComponent,
"lfg_ff:staircase_railing": staircaseRailingComponent,
"lfg_ff:street_lamp": streetLampComponent,
"lfg_ff:table": tableComponent,
"lfg_ff:tree": treeComponent,
"lfg_ff:wall_shelf": wallShelfComponent,
"lfg_ff:window_frame": windowFrameComponent,
"lfg_ff:exterior_floor": exteriorFloorComponent,
"lfg_ff:grass_path": exteriorFloorComponent,
"lfg_ff:roof_cap": roofCapComponent,
"lfg_ff:statue": statueComponent,
"lfg_ff:plush": plushComponent,
"lfg_ff:arch_block": archBlockComponent,
"lfg_ff:clear_glass": clearGlassComponent,
"lfg_ff:clear_glass_pane": clearGlassPaneComponent,
"lfg_ff:bin_block": binComponent,
"lfg_ff:fridge_block": fridgeBlockComponent,
"lfg_ff:kitchen_storage_block": kitchenStorageComponent,
"lfg_ff:letterbox_block": letterBoxComponent,
"lfg_ff:oven_block": ovenComponent,
"lfg_ff:wardrobe_block": wardrobeBlockComponent,
}
const blockComponent = getBlockComponent[block.typeId] ?? null
if (itemStack.typeId == "lfg_ff:variant_picker") {
system.runTimeout(() => {
handleVariantPicker(block, player)
}, 1)
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c7")
if (itemStack.typeId == "lfg_ff:debug_stick") {
system.runTimeout(() => {
handleDebugStick(block, player)
}, 1)
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c8")
if (!blockComponent) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c9")
if (itemStack.typeId == "lfg_ff:color_brush") {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c10")
const colorPickerMode = player.getDynamicProperty("lfg_ff:vs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c10-bis")
blockComponent.variantChanger({ block, player, smallBrush: false, variantPicker: pickerVariant })
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c11")
const colorPickerMode = player.getDynamicProperty("lfg_ff:tvs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c11-bis")
blockComponent.variantChanger({ block, player, smallBrush: true, variantPicker: pickerVariant })
}, 1)
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:2> §c12(end)")
})
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
const { block, blockFace, itemStack, player, isFirstEvent, cancel, faceLocation } = e;
if (!getGlobalDebugToggles()?.useMainVariantSelectionEvent) return;
const debugLogs = !getGlobalDebugToggles()?.hideVariantSelectionDebugLogs
const source = player
if (source.typeId !== "minecraft:player") return;
if (!isFirstEvent) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c2")
if (!itemStack) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c3")
if (itemStack.typeId.includes("shovel") && block.typeId == "lfg_ff:exterior_floor") {
system.runTimeout(() => {
const variant = block.permutation.getState('lfg_ff:variant');
block.setPermutation(BlockPermutation.resolve("lfg_ff:grass_path").withState("lfg_ff:variant", variant))
const direction = block.permutation.getState('minecraft:cardinal_direction');
player.dimension.playSound("use.grass", block.location)
player.dimension.playSound("use.hanging_roots", block.location)
exteriorFloorComponent.updateAllfloor(block, direction)
}, 1)
return
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c4")
if (itemStack.typeId == "lfg_ff:cushion" && block.typeId !== "lfg_ff:bed" && block.typeId !== "lfg_ff:sofa") {
system.runTimeout(() => {
if (e.blockFace == "Up") {
const alreadyPillow = player.dimension.getEntities({ type: "lfg_ff:pillow_entity", location: { x: block.location.x + 0.5, y: block.location.y + 1, z: block.location.z + 0.5 }, maxDistance: 0.2 })[0]
if (alreadyPillow) return
const entity = player.dimension.spawnEntity("lfg_ff:pillow_entity", { x: block.location.x + 0.5, y: block.location.y + 1, z: block.location.z + 0.5 })
entity.setProperty("lfg_ff:shape", 1)
entity.setRotation(player.getRotation())
player.runCommand(`clear @s ${itemStack.typeId} 0 1`)
}
})
return
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c5")
const itemList = [
"lfg_ff:color_brush",
"lfg_ff:variant_picker",
"lfg_ff:variant_selector_small",
"lfg_ff:debug_stick",
]
const blockList = [
"lfg_ff:wall",
"lfg_ff:basket_hoop",
"lfg_ff:beam",
"lfg_ff:better_leaves",
"lfg_ff:bush",
"lfg_ff:carpet",
"lfg_ff:clock",
"lfg_ff:coffee_table",
"lfg_ff:exterior_wall",
"lfg_ff:fence",
"lfg_ff:flower_pot",
"lfg_ff:garland",
"lfg_ff:ornament_book",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_table",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:ornament_gifts",
"lfg_ff:ornament_pumpkins",
"lfg_ff:pillar",
"lfg_ff:xmas_tree",
"lfg_ff:roof",
"lfg_ff:staircase_railing",
"lfg_ff:street_lamp",
"lfg_ff:table",
"lfg_ff:tree",
"lfg_ff:wall_shelf",
"lfg_ff:window_frame",
"lfg_ff:exterior_floor",
"lfg_ff:grass_path",
"lfg_ff:roof_cap",
"lfg_ff:statue",
"lfg_ff:clear_glass",
"lfg_ff:clear_glass_pane",
"lfg_ff:arch_block",
"lfg_ff:plush",
"lfg_ff:awning",
"lfg_ff:bath_tub",
"lfg_ff:bench",
"lfg_ff:chair",
"lfg_ff:bed",
"lfg_ff:curtains",
"lfg_ff:door",
"lfg_ff:fence_gate",
"lfg_ff:garage_door",
"lfg_ff:lamp",
"lfg_ff:light_switch",
"lfg_ff:piano",
"lfg_ff:sink",
"lfg_ff:sofa",
"lfg_ff:toilet",
]
const specialBlockList = [
"lfg_ff:bin_block",
"lfg_ff:fridge_block",
"lfg_ff:kitchen_storage_block",
"lfg_ff:letterbox_block",
"lfg_ff:oven_block",
"lfg_ff:wardrobe_block",
]
if (player.isSneaking) {
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c6")
if (!itemList.includes(itemStack.typeId)) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c7")
if (!blockList.includes(block.typeId) && !specialBlockList.includes(block.typeId)) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c8")
const ORNAMENTS = [
"lfg_ff:ornament_table",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_book",
"lfg_ff:ornament_pumpkins",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:ornament_gifts",
]
if (block.typeId == "lfg_ff:coffee_table" && (block.above().typeId == "lfg_ff:plush" || ORNAMENTS.includes(block.above().typeId)) && blockFace == "Up") {
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c9")
const getBlockComponent = {
"lfg_ff:wall": wallComponent,
"lfg_ff:basket_hoop": basketHoopComponent,
"lfg_ff:beam": beamComponent,
"lfg_ff:better_leaves": betterLeavesComponent,
"lfg_ff:bush": bushComponent,
"lfg_ff:carpet": carpetComponent,
"lfg_ff:clock": clockComponent,
"lfg_ff:coffee_table": coffeeTableComponent,
"lfg_ff:exterior_wall": exteriorWallComponent,
"lfg_ff:fence": fenceComponent,
"lfg_ff:flower_pot": flowerPotComponent,
"lfg_ff:garland": garlandComponent,
"lfg_ff:ornament_book": ornamentComponent,
"lfg_ff:ornament_cadre": ornamentComponent,
"lfg_ff:ornament_plant": ornamentComponent,
"lfg_ff:ornament_table": ornamentComponent,
"lfg_ff:ornament_desk": ornamentComponent,
"lfg_ff:ornament_toys": ornamentComponent,
"lfg_ff:ornament_gifts": ornamentComponent,
"lfg_ff:ornament_pumpkins": ornamentComponent,
"lfg_ff:pillar": pillarComponent,
"lfg_ff:xmas_tree": xmasTreeComponent,
"lfg_ff:roof": roofComponent,
"lfg_ff:staircase_railing": staircaseRailingComponent,
"lfg_ff:street_lamp": streetLampComponent,
"lfg_ff:table": tableComponent,
"lfg_ff:tree": treeComponent,
"lfg_ff:wall_shelf": wallShelfComponent,
"lfg_ff:window_frame": windowFrameComponent,
"lfg_ff:exterior_floor": exteriorFloorComponent,
"lfg_ff:grass_path": exteriorFloorComponent,
"lfg_ff:roof_cap": roofCapComponent,
"lfg_ff:statue": statueComponent,
"lfg_ff:plush": plushComponent,
"lfg_ff:arch_block": archBlockComponent,
"lfg_ff:clear_glass": clearGlassComponent,
"lfg_ff:clear_glass_pane": clearGlassPaneComponent,
"lfg_ff:bin_block": binComponent,
"lfg_ff:fridge_block": fridgeBlockComponent,
"lfg_ff:kitchen_storage_block": kitchenStorageComponent,
"lfg_ff:letterbox_block": letterBoxComponent,
"lfg_ff:oven_block": ovenComponent,
"lfg_ff:wardrobe_block": wardrobeBlockComponent,
}
const blockComponent = getBlockComponent[block.typeId] ?? null
if (itemStack.typeId == "lfg_ff:variant_picker") {
system.runTimeout(() => {
handleVariantPicker(block, player)
}, 1)
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c10")
if (itemStack.typeId == "lfg_ff:debug_stick") {
system.runTimeout(() => {
handleDebugStick(block, player)
}, 1)
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c11")
if (!blockComponent) return;
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c12")
if (itemStack.typeId == "lfg_ff:color_brush") {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c13")
const colorPickerMode = player.getDynamicProperty("lfg_ff:vs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c13-bis")
blockComponent.variantChanger({ block, player, smallBrush: false, variantPicker: pickerVariant })
}, 1)
return;
}
if (itemStack.typeId == "lfg_ff:variant_selector_small") {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c14")
const colorPickerMode = player.getDynamicProperty("lfg_ff:tvs_color_brush_mode") == 1
let pickerVariant = null
if (colorPickerMode) {
const pickedVar = player.getDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`) ?? null
pickerVariant = pickedVar
}
system.runTimeout(() => {
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c14-bis")
blockComponent.variantChanger({ block, player, smallBrush: true, variantPicker: pickerVariant })
}, 1)
return;
}
if (debugLogs) console.warn("§9<lfg_ff:var_selec:1> §c15(end)")
})
function handleVariantPicker(block, player) {
const entityList = [
"lfg_ff:bin",
"lfg_ff:fridge",
"lfg_ff:kitchen_storage",
"lfg_ff:letterbox",
"lfg_ff:oven",
"lfg_ff:wardrobe",
]
if (entityList.includes(block.typeId)) {
let entity = block
const variant = entity.getProperty("lfg_ff:variant") ?? null
if (!variant) return;
player.setDynamicProperty(`lfg_ff:color_picker_info:${entity.typeId}_block`, variant)
player.runCommand(`tellraw @s { "rawtext": [{ "text": "§9Picked variant §3${variant}§9 for §3" }, { "translate": "tile.${entity.typeId}_block.name" }] }`)
player.dimension.playSound("random.pop", entity.location, { pitch: 1.5 })
} else {
let variant = block.permutation.getState("lfg_ff:variant") ?? null
if (!variant) {
if (entityList.includes(block.typeId.replace("_block", ""))) {
const entity = block.dimension.getEntities({ type: block.typeId.replace("_block", ""), location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), closest: 1 })[0]
if (entity) {
variant = entity.getProperty("lfg_ff:variant") ?? null
}
}
}
if (!variant) return;
player.setDynamicProperty(`lfg_ff:color_picker_info:${block.typeId}`, variant)
player.runCommand(`tellraw @s { "rawtext": [{ "text": "§9Picked variant §3${variant}§9 for §3" }, { "translate": "tile.${block.typeId}.name" }] }`)
player.dimension.playSound("random.pop", block.location, { pitch: 1.5 })
}
}
function handleDebugStick(block, player) {
const blockList = [
"lfg_ff:wall",
"lfg_ff:beam",
"lfg_ff:bush",
"lfg_ff:carpet",
"lfg_ff:coffe_table",
"lfg_ff:exterior_wall",
"lfg_ff:fence",
"lfg_ff:flower_pot",
"lfg_ff:garland",
"lfg_ff:ornament_book",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_table",
"lfg_ff:pillar",
"lfg_ff:xmas_tree",
"lfg_ff:roof",
"lfg_ff:staircase_railing",
"lfg_ff:street_lamp",
"lfg_ff:table",
"lfg_ff:tree",
"lfg_ff:wall_shelf",
"lfg_ff:window_frame",
"lfg_ff:bench",
"lfg_ff:curtains",
"lfg_ff:fence_gate",
"lfg_ff:light_switch",
"lfg_ff:sofa",
"lfg_ff:toilet",
]
return
}
world.afterEvents.playerSpawn.subscribe((e) => {
const { initialSpawn, player } = e;
if (player.hasTag("lfg_ff:player_in_entity_container")) {
player.removeTag("lfg_ff:player_in_entity_container");
}
if (!player.hasTag("lfg_ff.has_guidebook")) {
player.dimension.spawnItem(new ItemStack("lfg_ff:guidebook_spawn_egg", 1), player.location);
player.dimension.spawnItem(new ItemStack("lfg_ff:settings_item", 1), player.location);
system.runTimeout(() => {
try {
player.runCommand(`tellraw @s { "rawtext": [{ "text": "§dFurniture Builder Add-On§r installed!" }] }`)
} catch { }
}, 100)
player.addTag("lfg_ff.has_guidebook");
} else {
if (!player.hasTag('lfg_ff:update_2.0_message')) {
system.runTimeout(() => {
try {
player.dimension.spawnItem(new ItemStack("lfg_ff:guidebook_spawn_egg", 1), player.location);
player.dimension.spawnItem(new ItemStack("lfg_ff:settings_item", 1), player.location);
player.addTag('lfg_ff:update_2.0_message');
const defaultParams = { bush: true, tree: true, bushy_leaves: true, flower_pot: true, street_lamp: true, lamp_v7: true, animated_bush: true, animated_better_leaves: true, animated_tree: true }
const prevSettings = world.getDynamicProperty("lfg_ff:world_particle_settings") ?? JSON.stringify(defaultParams)
const newParams = { bush: JSON.parse(prevSettings).bush, tree: JSON.parse(prevSettings).tree, bushy_leaves: JSON.parse(prevSettings).bushy_leaves, flower_pot: JSON.parse(prevSettings).flower_pot, street_lamp: JSON.parse(prevSettings).street_lamp, lamp_v7: JSON.parse(prevSettings).lamp_v7, animated_bush: true, animated_better_leaves: true, animated_tree: true }
world.setDynamicProperty("lfg_ff:world_particle_settings", JSON.stringify(newParams))
player.playSound("random.toast")
player.sendMessage("§dFurniture Builder Add-On§r has been §bupdated§r ! Check out the new features and complete changelog in the §b'Update Log'§r category of the §bSettings Item§r")
} catch { }
}, 100)
}
}
})
const ALL_GUIDE_FEATURES = [
"lfg_ff:furniture_table",
"lfg_ff:color_brush",
"lfg_ff:variant_selector_small",
"lfg_ff:variant_picker",
"lfg_ff:structure_placer_block",
"lfg_ff:wardrobe_block",
"lfg_ff:table",
"lfg_ff:coffee_table",
"lfg_ff:bed",
"lfg_ff:curtains",
"lfg_ff:lamp",
"lfg_ff:light_switch",
"lfg_ff:oven_block",
"lfg_ff:fridge_block",
"lfg_ff:bin_block",
"lfg_ff:kitchen_storage_block",
"lfg_ff:window_frame",
"lfg_ff:exterior_wall",
"lfg_ff:wall",
"lfg_ff:pillar",
"lfg_ff:beam",
"lfg_ff:roof",
"lfg_ff:fence_gate",
"lfg_ff:bush",
"lfg_ff:exterior_floor",
"lfg_ff:street_lamp",
"lfg_ff:awning",
"lfg_ff:garage_door",
"lfg_ff:bench",
"lfg_ff:letterbox_block",
"lfg_ff:basket_hoop",
"lfg_ff:toilet",
"lfg_ff:sink",
"lfg_ff:bath_tub",
"lfg_ff:sofa",
"lfg_ff:cushion",
"lfg_ff:wall_shelf",
"lfg_ff:garland",
"lfg_ff:ornament_furnitures",
"lfg_ff:flower_pot",
"lfg_ff:staircase_railing",
"lfg_ff:piano",
"lfg_ff:clock",
"lfg_ff:door",
"lfg_ff:tree",
"lfg_ff:chair",
"lfg_ff:wall_board",
"lfg_ff:floor",
"lfg_ff:split_wall",
"lfg_ff:roof_cap",
"lfg_ff:arch_block",
"lfg_ff:clear_glass",
"lfg_ff:statue",
"lfg_ff:xmas_tree",
"lfg_ff:settings_item",
]
system.afterEvents.scriptEventReceive.subscribe((data) => {
const { id, sourceEntity } = data;
const MAX_PAGE = 58
if (id === 'lfg_ff:guidebook_use') {
if (!sourceEntity) return
const player = sourceEntity.dimension.getEntities({ type: "minecraft:player", location: sourceEntity.location, maxDistance: 10 })[0]
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (player.isSneaking) {
sourceEntity.setProperty("lfg_ff:is_removed", true)
system.runTimeout(() => {
try {
player.dimension.spawnItem(new ItemStack("lfg_ff:guidebook_spawn_egg", 1), Vector.add(sourceEntity.location, new Vector(0, 1, 0)));
sourceEntity.dimension.playSound("random.pop", sourceEntity.location)
sourceEntity.remove()
} catch { }
}, 8)
return
}
const prop = "lfg_ff:guidebook_page"
const page = sourceEntity.getProperty(prop)
const ornamentFurnitures = [
"lfg_ff:ornament_book",
"lfg_ff:ornament_cadre",
"lfg_ff:ornament_plant",
"lfg_ff:ornament_table",
"lfg_ff:ornament_desk",
"lfg_ff:ornament_toys",
"lfg_ff:ornament_gifts",
"lfg_ff:ornament_pumpkins",
]
if (handItem) {
if (ALL_GUIDE_FEATURES.includes(handItem.typeId) || handItem.typeId == "lfg_ff:fence" || handItem.typeId == "lfg_ff:furniture_wrench" || handItem.typeId == "lfg_ff:basket_ball_item" || ornamentFurnitures.includes(handItem.typeId) || handItem.typeId == "lfg_ff:letter_tile" || handItem.typeId == "lfg_ff:clear_glass_pane" || handItem.typeId == "lfg_ff:grass_path") {
let itemId = handItem.typeId
if (handItem.typeId == "lfg_ff:grass_path") itemId = "lfg_ff:exterior_floor"
if (handItem.typeId == "lfg_ff:letter_tile") itemId = "lfg_ff:wall_board"
if (handItem.typeId == "lfg_ff:clear_glass_pane") itemId = "lfg_ff:clear_glass"
if (handItem.typeId == "lfg_ff:fence") itemId = "lfg_ff:fence_gate"
if (handItem.typeId == "lfg_ff:furniture_wrench") itemId = "lfg_ff:light_switch"
if (handItem.typeId == "lfg_ff:basket_ball_item") itemId = "lfg_ff:basket_hoop"
if (ornamentFurnitures.includes(handItem.typeId)) itemId = handItem.typeId.replace("book", "furnitures").replace("cadre", "furnitures").replace("plant", "furnitures").replace("table", "furnitures").replace("pumpkins", "furnitures").replace("desk", "furnitures").replace("gifts", "furnitures").replace("toys", "furnitures")
let searchPage = ALL_GUIDE_FEATURES.indexOf(itemId) + 1 + 2
player.dimension.playSound("random.pop", player.location, { pitch: 0.8 })
system.runTimeout(() => {
player.dimension.playSound("random.pop", player.location, { pitch: 1.5 })
}, 2)
if (searchPage > page)
sourceEntity.playAnimation("animation.lfg_ff.guide_book.next_page")
else if (searchPage < page)
sourceEntity.playAnimation("animation.lfg_ff.guide_book.previous_page")
system.runTimeout(() => {
sourceEntity.setProperty(prop, searchPage)
}, 5)
return;
}
if (["lfg_ff:carpet", "lfg_ff:better_leaves", "lfg_ff:plush"].includes(handItem.typeId)) {
player.dimension.playSound("random.pop", player.location, { pitch: 1.5 })
player.sendMessage("§9<Guidebook> §fThis block doesn't have a dedicated page in the guidebook. it doesn't have auto-connection/interaction and can just change variant.")
return;
}
}
if (page < MAX_PAGE) {
sourceEntity.playAnimation("animation.lfg_ff.guide_book.next_page")
system.runTimeout(() => {
sourceEntity.setProperty(prop, page + 1)
}, 5)
}
}
if (id === 'lfg_ff:guidebook_punch') {
if (!sourceEntity) return
const player = sourceEntity.dimension.getEntities({ type: "minecraft:player", location: sourceEntity.location, maxDistance: 10 })[0]
if (player.isSneaking) {
sourceEntity.setProperty("lfg_ff:is_removed", true)
system.runTimeout(() => {
try {
player.dimension.spawnItem(new ItemStack("lfg_ff:guidebook_spawn_egg", 1), Vector.add(sourceEntity.location, new Vector(0, 1, 0)));
sourceEntity.dimension.playSound("random.pop", sourceEntity.location)
sourceEntity.remove()
} catch { }
}, 8)
return
}
const prop = "lfg_ff:guidebook_page"
const page = sourceEntity.getProperty(prop)
if (page > 1) {
sourceEntity.playAnimation("animation.lfg_ff.guide_book.previous_page")
system.runTimeout(() => {
sourceEntity.setProperty(prop, page - 1)
}, 5)
}
}
if (id === "lfg_ff:seat_rotation_to_player_view") {
if (!sourceEntity) return
const rideableComponent = sourceEntity.getComponent('rideable');
const riders = rideableComponent.getRiders();
const rider = riders.length > 0 ? riders[0] : null;
if (!rider) return;
sourceEntity.setRotation({ x: 0, y: rider.getRotation().y });
}
if (id == "lfg_ff:wardrobe_player_near") {
if (!sourceEntity) return
const inv = sourceEntity.getComponent('inventory').container;
let itemCount = 0
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) itemCount++
}
const fillLevel = Math.ceil(3 * (itemCount / inv.size))
sourceEntity.setProperty('lfg_ff:fill', fillLevel)
removeStorageBlockOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:oven_player_near") {
if (!sourceEntity) return
sourceEntity.setProperty("lfg_ff:vv_opti", vvOptimized())
const inv = sourceEntity.getComponent('inventory').container;
const item = inv.getItem(0);
const amount = item?.amount ?? 0
const findRecipeByIngredient = (ingredient) => {
if (!ingredient) return false;
if (
OVEN_FURNACE_RECIPES.find(recipe => recipe.ingredient === ingredient.typeId)
|| ingredient.typeId.includes("wood")
|| ingredient.typeId.includes("log")
|| ingredient.typeId.includes("stripped_log")
|| ingredient.typeId.includes("stripped_wood")
|| ingredient.typeId.includes("terracotta")
) return true
return false
};
let isValidItem = findRecipeByIngredient(item)
if (item && (OvenIronItems.includes(item.typeId) || OvenGoldItems.includes(item.typeId)) && sourceEntity.getProperty("lfg_ff:shape") == "small" && sourceEntity.getProperty("lfg_ff:variant") == 1) {
sourceEntity.setProperty("lfg_ff:iron_boom", true)
isValidItem = true
} else {
sourceEntity.setProperty("lfg_ff:iron_boom", false)
}
sourceEntity.setDynamicProperty("lfg_ff:oven_time_to_cook", amount * 160)
sourceEntity.setDynamicProperty("lfg_ff:oven_is_valid_item", isValidItem)
if (!sourceEntity.getProperty("lfg_ff:door_open") && item && isValidItem) {
if (sourceEntity.getProperty("lfg_ff:variant") == 1) {
if (sourceEntity.getProperty("lfg_ff:shape") == "medium") {
sourceEntity.setProperty("lfg_ff:active", true)
try {
const block = sourceEntity.dimension.getBlock(sourceEntity.location)
block?.setPermutation(block.permutation.withState("lfg_ff:active", true))
} catch { }
} else {
system.runTimeout(() => {
try {
if (!sourceEntity.getProperty("lfg_ff:door_open") && item && sourceEntity.getProperty("lfg_ff:shape") !== "medium") {
sourceEntity.setProperty("lfg_ff:active", true)
const block = sourceEntity.dimension.getBlock(sourceEntity.location)
block?.setPermutation(block.permutation.withState("lfg_ff:active", true))
}
} catch { }
}, 11)
}
} else {
sourceEntity.setProperty("lfg_ff:active", true)
try {
const block = sourceEntity.dimension.getBlock(sourceEntity.location)
block?.setPermutation(block.permutation.withState("lfg_ff:active", true))
} catch { }
}
} else {
sourceEntity.setProperty("lfg_ff:active", false)
try {
const block = sourceEntity.dimension.getBlock(sourceEntity.location)
block?.setPermutation(block.permutation.withState("lfg_ff:active", false))
} catch { }
}
removeStorageBlockOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:fridge_player_near") {
if (!sourceEntity) return
const inv = sourceEntity.getComponent('inventory').container;
let itemCount = 0
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) itemCount++
}
const fillLevel = Math.ceil(3 * (itemCount / inv.size))
sourceEntity.setProperty('lfg_ff:fill', fillLevel)
removeStorageBlockOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:letterbox_player_near") {
if (!sourceEntity) return
const inv = sourceEntity.getComponent('inventory').container;
let itemCount = 0
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) itemCount++
}
const fillLevel = itemCount
sourceEntity.setProperty('lfg_ff:fill', fillLevel)
removeStorageBlockOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:structure_placer_player_near") {
if (!sourceEntity) return
const inv = sourceEntity.getComponent('inventory').container;
let itemCount = 0
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) itemCount++
}
const fillLevel = Math.min(3, itemCount)
sourceEntity.setProperty('lfg_ff:fill', fillLevel)
removeStorageBlockOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:kitchen_storage_player_near") {
if (!sourceEntity) return
const inv = sourceEntity.getComponent('inventory').container;
let itemCount = 0
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item) itemCount++
}
const fillLevel = Math.ceil(2 * (itemCount / inv.size))
sourceEntity.setProperty('lfg_ff:fill', fillLevel)
removeStorageBlockOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:basket_hoop_player_near") {
if (!sourceEntity) return
removeVisualEntityOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:clock_player_near") {
if (!sourceEntity) return
removeVisualEntityOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:lamp_fade_player_near") {
if (!sourceEntity) return
removeVisualEntityOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:bath_water_player_near") {
if (!sourceEntity) return
removeVisualEntityOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:shower_water_player_near") {
if (!sourceEntity) return
removeVisualEntityOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:sink_water_player_near") {
if (!sourceEntity) return
removeVisualEntityOnEmptyBlock(sourceEntity)
}
if (id == "lfg_ff:oven_container_full") {
if (!sourceEntity) return;
let foodEntity = sourceEntity.getComponent('rideable').getRiders()[0]
if (!foodEntity) {
foodEntity = sourceEntity.dimension.spawnEntity("lfg_ff:oven_dummy", sourceEntity.location)
foodEntity.setProperty("lfg_ff:shape", sourceEntity.getProperty("lfg_ff:shape"))
foodEntity.setProperty("lfg_ff:variant", sourceEntity.getProperty("lfg_ff:variant"))
sourceEntity.runCommand(`ride @e[type=${foodEntity.typeId}] start_riding @s teleport_rider until_full`)
}
if (!sourceEntity.getComponent('rideable').getRiders()[0]) return;
const foodInv = foodEntity.getComponent('inventory').container;
let foodItem = foodInv.getItem(0);
const inv = sourceEntity.getComponent('inventory').container;
let cookingItem = inv.getItem(0);
if (!cookingItem) return;
if (!foodItem || foodItem.typeId !== cookingItem.typeId) {
if (itemIsBlock(sourceEntity.dimension.getBlock(sourceEntity.location), cookingItem)) {
foodEntity.setProperty("lfg_ff:is_block", true)
} else {
foodEntity.setProperty("lfg_ff:is_block", false)
}
foodEntity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${cookingItem.typeId}`)
foodEntity.getComponent('inventory')?.container?.setItem(0, cookingItem)
}
const currentCookingTime = sourceEntity.getDynamicProperty("lfg_ff:oven_current_cooking_time")
const timeToCook = sourceEntity.getDynamicProperty("lfg_ff:oven_time_to_cook")
const isValidItem = sourceEntity.getDynamicProperty("lfg_ff:oven_is_valid_item") ?? false
foodEntity.setProperty("lfg_ff:animate", isValidItem)
if (isValidItem) {
if (currentCookingTime >= timeToCook) {
if (cookingItem && (OvenIronItems.includes(cookingItem.typeId) || OvenGoldItems.includes(cookingItem.typeId)) && sourceEntity.getProperty("lfg_ff:shape") == "small") {
return
}
let recipe = OVEN_FURNACE_RECIPES.find(r => r.ingredient === cookingItem.typeId);
let newId = null;
if (!recipe) {
if (cookingItem.typeId.includes("terracotta") && !cookingItem.typeId.includes("glazed")) {
const parts = cookingItem.typeId.replace("minecraft:", "").replace("terracotta", "")
newId = `minecraft:${parts}glazed_terracotta`
if (cookingItem.typeId == "minecraft:light_gray_terracotta") newId = "minecraft:silver_glazed_terracotta"
}
else if (
cookingItem.typeId.includes("wood")
|| cookingItem.typeId.includes("log")
|| cookingItem.typeId.includes("stripped_log")
|| cookingItem.typeId.includes("stripped_wood")
) {
newId = "minecraft:charcoal"
}
} else {
newId = recipe.product;
}
if (newId == null) return
const cookedItem = new ItemStack(newId, cookingItem.amount)
if (itemIsBlock(sourceEntity.dimension.getBlock(sourceEntity.location), cookedItem)) {
foodEntity.setProperty("lfg_ff:is_block", true)
} else {
foodEntity.setProperty("lfg_ff:is_block", false)
}
foodEntity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${cookedItem.typeId}`)
foodEntity.getComponent('inventory')?.container?.setItem(0, cookedItem)
sourceEntity.getComponent('inventory')?.container?.setItem(0, cookedItem)
if (sourceEntity.getProperty("lfg_ff:variant") == 1 && ["small", "large"].includes(sourceEntity.getProperty("lfg_ff:shape"))) {
sourceEntity.dimension.playSound("note.bell", sourceEntity.location, { pitch: 0.8 })
sourceEntity.dimension.playSound("note.xylophone", sourceEntity.location, { pitch: 0.8 })
}
if (sourceEntity.getProperty("lfg_ff:variant") == 1 && ["medium"].includes(sourceEntity.getProperty("lfg_ff:shape"))) {
sourceEntity.dimension.playSound("extinguish.candle", sourceEntity.location)
}
if (sourceEntity.getProperty("lfg_ff:variant") == 2) {
sourceEntity.dimension.playSound("extinguish.candle", sourceEntity.location)
}
sourceEntity.setDynamicProperty("lfg_ff:oven_current_cooking_time", 0)
} else {
sourceEntity.setDynamicProperty("lfg_ff:oven_current_cooking_time", currentCookingTime + 1)
}
} else {
sourceEntity.setDynamicProperty("lfg_ff:oven_current_cooking_time", 0)
}
}
if (id == "lfg_ff:oven_container_empty") {
if (!sourceEntity) return;
let foodEntity = sourceEntity.getComponent('rideable').getRiders()[0]
if (foodEntity) {
foodEntity.remove()
}
}
if (id == "lfg_ff:oven_opened") {
if (!sourceEntity) return;
let foodEntity = sourceEntity.getComponent('rideable')?.getRiders()[0]
if (foodEntity) {
foodEntity.setProperty("lfg_ff:door_open", true)
}
}
if (id == "lfg_ff:oven_closed") {
if (!sourceEntity) return;
let foodEntity = sourceEntity.getComponent('rideable')?.getRiders()[0]
if (foodEntity) {
foodEntity.setProperty("lfg_ff:door_open", false)
}
}
if (id == "lfg_ff:bin_player_near") {
if (!sourceEntity) return
}
if (id == "lfg_ff:kitchen_storage_box_selection") {
if (!sourceEntity) return;
const shape = sourceEntity.getProperty("lfg_ff:shape")
let rot = sourceEntity.getRotation().y
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
sourceEntity.triggerEvent(`lfg_ff:${shape}_box_${rot}`)
sourceEntity.nameTag = "§r"
const loc = sourceEntity.location
sourceEntity.dimension.runCommand(`structure save lfg_ff:temp_kitchen_storage_hitbox_placing ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y} ${loc.z} true memory false`)
sourceEntity.dimension.runCommand(`structure load lfg_ff:temp_kitchen_storage_hitbox_placing ${loc.x} ${loc.y} ${loc.z} 0_degrees none true false`)
sourceEntity.remove()
}
if (id == "lfg_ff:bin_box_selection") {
if (!sourceEntity) return;
const shape = sourceEntity.getProperty("lfg_ff:shape")
let rot = sourceEntity.getRotation().y
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
if (shape == "double")
sourceEntity.triggerEvent(`lfg_ff:${shape}_box_${rot}`)
else
sourceEntity.triggerEvent(`lfg_ff:${shape}_box`)
sourceEntity.nameTag = "§r"
const loc = sourceEntity.location
sourceEntity.dimension.runCommand(`structure save lfg_ff:temp_bin_hitbox_placing ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y} ${loc.z} true memory false`)
sourceEntity.dimension.runCommand(`structure load lfg_ff:temp_bin_hitbox_placing ${loc.x} ${loc.y} ${loc.z} 0_degrees none true false`)
sourceEntity.remove()
}
if (id == "lfg_ff:oven_box_selection") {
if (!sourceEntity) return;
const shape = sourceEntity.getProperty("lfg_ff:shape")
let rot = sourceEntity.getRotation().y
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
if (sourceEntity.getProperty("lfg_ff:variant") == 1) {
if (shape == "medium")
sourceEntity.triggerEvent(`lfg_ff:${shape}_box`)
else
sourceEntity.triggerEvent(`lfg_ff:${shape}_box_${rot}`)
} else {
if (shape == "small")
sourceEntity.triggerEvent(`lfg_ff:furnace_${shape}_box`)
else
sourceEntity.triggerEvent(`lfg_ff:furnace_${shape}_box_${rot}`)
}
sourceEntity.nameTag = "§r"
const loc = sourceEntity.location
sourceEntity.dimension.runCommand(`structure save lfg_ff:temp_oven_hitbox_placing ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y} ${loc.z} true memory false`)
sourceEntity.dimension.runCommand(`structure load lfg_ff:temp_oven_hitbox_placing ${loc.x} ${loc.y} ${loc.z} 0_degrees none true false`)
sourceEntity.remove()
}
if (id == "lfg_ff:letterbox_box_selection") {
if (!sourceEntity) return;
let rot = sourceEntity.getRotation().y
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
sourceEntity.triggerEvent(`lfg_ff:box_${rot}`)
sourceEntity.nameTag = "§r"
const loc = sourceEntity.location
sourceEntity.dimension.runCommand(`structure save lfg_ff:temp_letterbox_hitbox_placing ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y} ${loc.z} true memory false`)
sourceEntity.dimension.runCommand(`structure load lfg_ff:temp_letterbox_hitbox_placing ${loc.x} ${loc.y} ${loc.z} 0_degrees none true false`)
sourceEntity.remove()
}
if (id == "lfg_ff:structure_placer_box_selection") {
if (!sourceEntity) return;
let rot = sourceEntity.getRotation().y
if (rot == -180) rot = 180
if (rot == 90) rot = 270
if (rot == -90) rot = 90
sourceEntity.triggerEvent(`lfg_ff:box_${rot}`)
sourceEntity.nameTag = "§r"
const loc = sourceEntity.location
sourceEntity.dimension.runCommand(`structure save lfg_ff:temp_structure_placer_hitbox_placing ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y} ${loc.z} true memory false`)
sourceEntity.dimension.runCommand(`structure load lfg_ff:temp_structure_placer_hitbox_placing ${loc.x} ${loc.y} ${loc.z} 0_degrees none true false`)
sourceEntity.remove()
}
if (id == 'lfg_ff:pillow_remove') {
const entity = sourceEntity
const dimension = entity.dimension
const location = entity.location
dimension.spawnItem(new ItemStack(`lfg_ff:cushion`, 1), location);
dimension.playSound("random.pop", location)
entity.remove()
}
if (id == 'lfg_ff:wardrobe_out_of_block') {
return
}
if (id == 'lfg_ff:has_player_rider_manager') {
const entity = sourceEntity
const dimension = entity.dimension
const location = entity.location
if (!entity.hasTag("lfg_ff:hasPlayerRider")) return;
switch (entity.typeId) {
case "lfg_ff:pillow_entity":
entity.setProperty("lfg_ff:rider", true)
break;
}
}
if (id == 'lfg_ff:is_riding_manager') {
const entity = sourceEntity
const dimension = entity.dimension
const location = entity.location
}
if (id == 'lfg_ff:is_not_riding_manager') {
const entity = sourceEntity
const dimension = entity.dimension
const location = entity.location
if (entity.hasTag("lfg_ff:isRiding")) return;
switch (entity.typeId) {
case "lfg_ff:structure_placer_title":
entity.remove()
break;
}
}
if (id == 'lfg_ff:has_no_player_rider_manager') {
const entity = sourceEntity
const dimension = entity.dimension
const location = entity.location
if (entity.hasTag("lfg_ff:hasPlayerRider")) return;
switch (entity.typeId) {
case "lfg_ff:pillow_entity":
entity.setProperty("lfg_ff:rider", false)
break;
case "lfg_ff:sofa_seat":
entity.remove()
break;
case "lfg_ff:chair_seat":
entity.remove()
break;
case "lfg_ff:bench_seat":
entity.remove()
break;
case "lfg_ff:bed_seat":
entity.remove()
break;
case "lfg_ff:bath_tub_seat":
entity.remove()
break;
case "lfg_ff:jacuzi_seat":
entity.remove()
break;
case "lfg_ff:toilet_seat":
const block = sourceEntity.dimension.getBlock(sourceEntity.location)
if (block.typeId == "lfg_ff:toilet") {
block.setPermutation(block.permutation.withState("lfg_ff:module", "close"))
sourceEntity.dimension.playSound("random.door_open", sourceEntity.location)
sourceEntity.dimension.playSound("bucket.empty_water", sourceEntity.location)
}
entity.remove()
break;
}
}
if (id == "lfg_ff:entity_container_open_set_cooldown") {
if (!sourceEntity) return;
if (!getGlobalDebugToggles()?.inContainerCd) return;
const interactIndex = sourceEntity.getProperty("lfg_ff:interacting_player_index")
if (interactIndex <= 0) return;
const searchedTag = `lfg_ff:is_selecting:storage:${interactIndex}`
const player = world.getAllPlayers().filter(p => p.hasTag(searchedTag) && !p.hasTag("lfg_ff:player_in_entity_container"))[0]
if (!player) return;
player.addTag("lfg_ff:player_in_entity_container")
}
if (id == "lfg_ff:entity_container_close_remove_cooldown") {
if (!sourceEntity) return;
const interactIndex = sourceEntity.getProperty("lfg_ff:interacting_player_index")
if (interactIndex <= 0) return;
const searchedTag = `lfg_ff:is_selecting:storage:${interactIndex}`
const player = world.getAllPlayers().filter(p => p.hasTag(searchedTag) && p.hasTag("lfg_ff:player_in_entity_container"))[0]
if (!player) return;
player.removeTag("lfg_ff:player_in_entity_container")
}
});
function itemIsBlock(block, item) {
if (
item?.typeId == 'minecraft:bedrock' || item.typeId.includes("trapdoor")
) {
return true
} else
if (
item?.typeId?.includes("kelp") ||
item?.typeId?.includes("coral") ||
item?.typeId?.includes("vine") ||
item?.typeId?.includes("glowstone_dust") ||
item?.typeId?.includes("hopper") ||
item?.typeId?.includes("chain") ||
item?.typeId?.includes("dripstone") ||
item?.typeId == "minecraft:bamboo" ||
item?.typeId?.includes("candle") ||
item?.typeId?.includes("campfire") ||
item?.typeId?.includes("cauldron") ||
item?.typeId?.includes("armor_stand") ||
item?.typeId?.includes("sign") ||
item?.typeId?.includes("item_frame") ||
item?.typeId?.includes("painting") ||
item?.typeId?.includes("mushroom") ||
item?.typeId?.includes("bell") ||
item?.typeId?.includes("rail") ||
item?.typeId?.includes("shovel") ||
item?.typeId?.includes("torch") ||
item?.typeId?.includes("amethyst_cluster") ||
item?.typeId?.includes("blud") ||
item?.typeId?.includes("door") ||
item?.typeId?.includes("ladder") ||
item?.typeId?.includes("iron_bars") ||
item?.typeId?.includes("bed") ||
item?.typeId == "minecraft:bamboo" ||
item?.typeId == "minecraft:lantern" ||
item?.typeId == "minecraft:soul_lantern" ||
item?.typeId == "minecraft:deadbush" ||
item?.typeId == "minecraft:sniffer_egg" ||
item?.typeId?.includes("sea_pickle") ||
item?.typeId?.includes("brewing_stand") ||
item?.typeId?.includes("frame") ||
item?.typeId?.includes("tripwire_hook") ||
item?.typeId?.includes("minecraft:lever") ||
item?.typeId?.includes("amethyst") ||
item?.typeId?.includes("poppy") ||
item?.typeId?.includes("sapling")
) {
return false
} else {
try {
if (block.dimension.runCommand(`setblock ${block.x} -64 ${block.z} ${item?.typeId}`).successCount > 0) {
block.dimension.runCommand(`setblock ${block.x} -64 ${block.z} bedrock`)
return true;
} else {
return false;
}
} catch (error) {
return false;
}
}
}
function removeStorageBlockOnEmptyBlock(sourceEntity) {
if (!getGlobalDebugToggles()?.removeStorageBlockOnEmpty) return;
const block = sourceEntity.dimension.getBlock(sourceEntity.location)
if (!block || block.typeId !== `${sourceEntity.typeId}_block`) {
system.runTimeout(() => {
try {
if (!block || block.typeId !== `${sourceEntity.typeId}_block`) {
if (!sourceEntity) return;
const inv = sourceEntity.getComponent('inventory').container;
for (let i = 0; i < inv.size; i++) {
const item = inv.getItem(i);
if (item)
sourceEntity.dimension.spawnItem(item, Vector.add(sourceEntity.location, new Vector(0, 0.5, 0)))
}
sourceEntity.remove()
}
} catch { }
}, 20 * 5)
}
}
function removeVisualEntityOnEmptyBlock(sourceEntity) {
if (!getGlobalDebugToggles()?.removeVisualEntityOnEmpty) return;
const block = sourceEntity.dimension.getBlock(sourceEntity.location);
const typeId = sourceEntity.typeId;
let validBlockTypes = [];
switch (typeId) {
case "lfg_ff:clock_pendule":
validBlockTypes = ["lfg_ff:clock"];
break;
case "lfg_ff:basket_hoop_entity":
validBlockTypes = ["lfg_ff:basket_hoop"];
break;
case "lfg_ff:bath_water_level":
validBlockTypes = ["lfg_ff:bath_tub"];
break;
case "lfg_ff:sink_water":
validBlockTypes = ["lfg_ff:sink"];
break;
case "lfg_ff:shower_entity":
validBlockTypes = ["lfg_ff:bath_tub"];
break;
case "lfg_ff:lamp_fade":
validBlockTypes = ["lfg_ff:lamp", "lfg_ff:street_lamp"];
break;
default:
return;
}
if (!block || !validBlockTypes.includes(block.typeId)) {
system.runTimeout(() => {
try {
const checkBlock = sourceEntity.dimension.getBlock(sourceEntity.location);
if (!checkBlock || !validBlockTypes.includes(checkBlock.typeId)) {
sourceEntity?.remove();
}
} catch { }
}, 20 * 5);
}
}
const SIMPLE_STICK_DROP = [
"lfg_ff:better_leaves",
"lfg_ff:bush"
]
function randomInt(min, max) {
if (min > max) [min, max] = [max, min];
return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getFortuneMultiplier(fortuneLevel) {
const rolls = {
0: [1],
1: [1, 1, 1, 1, 1, 2],
2: [1, 1, 1, 1, 2, 3],
3: [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 1, 1]
};
const table = rolls[Math.min(fortuneLevel, 3)];
const index = Math.floor(Math.random() * table.length);
return table[index];
}
world.afterEvents.playerBreakBlock.subscribe((e) => {
const { block, brokenBlockPermutation, player, dimension, itemStackBeforeBreak } = e
if (!SIMPLE_STICK_DROP.includes(brokenBlockPermutation.type.id)) return;
if (player.getGameMode() !== "Survival") return;
let fortuneMultiplier = 1
if (itemStackBeforeBreak) {
const enchantment = itemStackBeforeBreak.getComponent("enchantable");
if (enchantment) {
let enchantmentType = "silk_touch"
if (enchantment.hasEnchantment(new EnchantmentType(enchantmentType))) return;
let fortune = "fortune"
if (enchantment.hasEnchantment(new EnchantmentType(fortune))) {
const level = enchantment.getEnchantment(new EnchantmentType(fortune)).level
if (level == 1) fortuneMultiplier = 1.25
if (level == 2) fortuneMultiplier = 1.65
if (level == 3) fortuneMultiplier = 2
}
}
if (itemStackBeforeBreak.typeId == "minecraft:shears") {
block.dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id, 1), Vector.add(block.location, new Vector(0.5, 0.5, 0.5)))
return;
}
}
let dropInfos = null
if (SIMPLE_STICK_DROP.includes(brokenBlockPermutation.type.id)) {
dropInfos = [
{ id: "minecraft:stick", amount: randomInt(1, 2), rate: 0.15 },
]
}
if (!dropInfos || dropInfos.length == 0) return;
for (const dropInfo of dropInfos) {
if (Math.random() <= (dropInfo.rate * fortuneMultiplier))
block.dimension.spawnItem(new ItemStack(dropInfo.id, dropInfo.amount), Vector.add(block.location, new Vector(0.5, 0.5, 0.5)))
}
})
const STORAGE_TYPES = new Set([
"lfg_ff:kitchen_storage",
"lfg_ff:bin",
"lfg_ff:structure_placer",
"lfg_ff:letterbox",
"lfg_ff:fridge",
"lfg_ff:oven",
"lfg_ff:wardrobe"
]);
const MAX_SELECT_IDX = 16;
const SELECT_TAG_PREFIX = "lfg_ff:is_selecting:storage:";
const ENTITY_PROP_IDX = "lfg_ff:interacting_player_index";
const RAY_MAX_DIST = 7;
const ANTI_COLLISION_RADIUS = 8;
const FOV_DEG = 60;
function rayAabbHitT(origin, dir, minB, maxB) {
const inv = (c) => (Math.abs(c) <= 0 ? Infinity : 1 / c);
const invX = inv(dir.x);
const invY = inv(dir.y);
const invZ = inv(dir.z);
let tMin = (minB.x - origin.x) * invX;
let tMax = (maxB.x - origin.x) * invX;
if (tMin > tMax) [tMin, tMax] = [tMax, tMin];
let tyMin = (minB.y - origin.y) * invY;
let tyMax = (maxB.y - origin.y) * invY;
if (tyMin > tyMax) [tyMin, tyMax] = [tyMax, tyMin];
if (tMin > tyMax || tyMin > tMax) return null;
if (tyMin > tMin) tMin = tyMin;
if (tyMax < tMax) tMax = tyMax;
let tzMin = (minB.z - origin.z) * invZ;
let tzMax = (maxB.z - origin.z) * invZ;
if (tzMin > tzMax) [tzMin, tzMax] = [tzMax, tzMin];
if (tMin > tzMax || tzMin > tMax) return null;
if (tzMin > tMin) tMin = tzMin;
if (tzMax < tMax) tMax = tzMax;
if (tMax < 0) return null;
const tHit = tMin >= 0 ? tMin : tMax;
return tHit >= 0 ? tHit : null;
}
function getStorageHitbox(entity) {
const typeId = entity.typeId;
let loc = { ...entity.location };
let size = null;
if (typeId === "lfg_ff:kitchen_storage") {
size = { h: 1, l: 1 };
}
else if (typeId === "lfg_ff:structure_placer") {
size = { h: 1, l: 1 };
}
else if (typeId === "lfg_ff:letterbox") {
size = { h: 0.7, l: 0.7 };
}
else if (typeId === "lfg_ff:bin") {
const shape = entity.getProperty("lfg_ff:shape");
if (shape === "double") {
try {
const block = entity.dimension.getBlock({
x: Math.floor(loc.x),
y: Math.floor(loc.y),
z: Math.floor(loc.z),
});
if (block?.typeId === "lfg_ff:bin_block" && typeof binComponent?.getNeighborBlock === "function") {
const moduleState = block.permutation.getState("lfg_ff:module");
if (moduleState === "double_left") {
const rightNeighbor = binComponent.getNeighborBlock(block, binComponent.getDirection(block), "right", false);
if (rightNeighbor) {
const rightCenter = binComponent.getBlockCenter(rightNeighbor);
const curCenter = binComponent.getBlockCenter(block);
if (rightCenter && curCenter) {
loc.x = (curCenter.x + rightCenter.x) / 2;
loc.z = (curCenter.z + rightCenter.z) / 2;
}
}
}
}
} catch (e) {
}
}
const binSizes = {
small: { h: 1.2, l: 1 },
double: { h: 1.2, l: 1.8 },
stack: { h: 1, l: 1 },
};
size = binSizes[shape] ?? null;
}
else if (typeId === "lfg_ff:fridge") {
const shape = entity.getProperty("lfg_ff:shape");
const fridgeSizes = {
small: { h: 1, l: 1 },
vrt: { h: 2, l: 1 },
hrz: { h: 1, l: 2 },
large: { h: 3, l: 1 },
};
size = fridgeSizes[shape] ?? null;
}
else if (typeId === "lfg_ff:oven") {
const shape = entity.getProperty("lfg_ff:shape");
const ovenSizes = {
small: { h: 0.7, l: 0.8 },
medium: { h: 1.2, l: 0.8 },
large: { h: 1, l: 1 },
};
size = ovenSizes[shape] ?? null;
}
else if (typeId === "lfg_ff:wardrobe") {
const shape = entity.getProperty("lfg_ff:shape");
const wardrobeSizes = {
"small": { h: 1, l: 1 },
"vrt": { h: 2, l: 1 },
"hrz": { h: 1, l: 2 },
"square": { h: 2, l: 2 },
"large": { h: 3, l: 2 }
};
size = wardrobeSizes[shape] ?? null;
}
if (!size) return null;
return { base: loc, size };
}
function isSameEntity(a, b) {
if (!a || !b) return false;
if (a.id && b.id) return a.id === b.id;
return a === b;
}
function getUsedIndexesAroundEntity(ent) {
const used = new Set();
const nearPlayers = ent.dimension.getPlayers({
location: ent.location,
maxDistance: ANTI_COLLISION_RADIUS,
});
for (const p of nearPlayers) {
const idx = getPlayerIndexFromTags(p);
if (idx > 0) used.add(idx);
}
const nearEntities = ent.dimension.getEntities({
location: ent.location,
maxDistance: ANTI_COLLISION_RADIUS,
}).filter(e => STORAGE_TYPES.has(e.typeId));
for (const e of nearEntities) {
try {
const idx = e.getProperty?.(ENTITY_PROP_IDX) ?? 0;
if (typeof idx === "number" && idx > 0) used.add(idx);
} catch (_) { }
}
return used;
}
function pickFreeIndex(usedSet) {
for (let n = 1; n <= MAX_SELECT_IDX; n++) if (!usedSet.has(n)) return n;
return 0;
}
function getPlayerIndexFromTags(player) {
for (let n = 1; n <= MAX_SELECT_IDX; n++) {
if (player.hasTag(SELECT_TAG_PREFIX + n)) return n;
}
return 0;
}
function setPlayerIndexTag(player, idx) {
for (let n = 1; n <= MAX_SELECT_IDX; n++) {
const t = SELECT_TAG_PREFIX + n;
if (player.hasTag(t)) player.removeTag(t);
}
if (idx > 0) player.addTag(SELECT_TAG_PREFIX + idx);
}
function numericId(id) {
const n = parseInt(id, 10);
if (!Number.isNaN(n)) return n;
let h = 0;
for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
return h;
}
system.runInterval(() => {
const players = world.getAllPlayers().sort((a, b) => numericId(a.id) - numericId(b.id));
const selections = [];
const unionNearby = new Set();
for (const player of players) {
const nearby = player.dimension.getEntities({
location: player.location,
maxDistance: RAY_MAX_DIST,
}).filter(e => STORAGE_TYPES.has(e.typeId));
for (const e of nearby) unionNearby.add(e);
if (!nearby.length) {
setPlayerIndexTag(player, 0);
continue;
}
const COS_FOV = Math.cos((FOV_DEG * Math.PI) / 180);
const viewDir = player.getViewDirection();
const pLoc = player.getHeadLocation();
const vLen = Math.hypot(viewDir.x, viewDir.y, viewDir.z) || 1;
const rayDir = { x: viewDir.x / vLen, y: viewDir.y / vLen, z: viewDir.z / vLen };
let best = { entity: null, t: Number.POSITIVE_INFINITY };
for (const entity of nearby) {
const hb = getStorageHitbox(entity);
if (!hb) continue;
const { base, size } = hb;
const center = { x: base.x, y: base.y + size.h * 0.5, z: base.z };
const toCenter = { x: center.x - pLoc.x, y: center.y - pLoc.y, z: center.z - pLoc.z };
const toLen = Math.hypot(toCenter.x, toCenter.y, toCenter.z) || 1;
const toDir = { x: toCenter.x / toLen, y: toCenter.y / toLen, z: toCenter.z / toLen };
const cosAng = toDir.x * rayDir.x + toDir.y * rayDir.y + toDir.z * rayDir.z;
if (cosAng < COS_FOV) continue;
const minB = { x: base.x - size.l / 2, y: base.y, z: base.z - size.l / 2 };
const maxB = { x: base.x + size.l / 2, y: base.y + size.h, z: base.z + size.l / 2 };
const tHit = rayAabbHitT(pLoc, rayDir, minB, maxB);
if (tHit === null || tHit > RAY_MAX_DIST) continue;
if (tHit < best.t) best = { entity, t: tHit };
}
if (best.entity) selections.push({ player, entity: best.entity, t: best.t });
else setPlayerIndexTag(player, 0);
}
const selectedIds = new Set(selections.map(s => s.entity.id));
for (const e of unionNearby) {
const selectedTag = `${e.typeId}:is_selected`;
if (selectedIds.has(e.id)) {
if (!e.hasTag(selectedTag)) {
e.addTag(selectedTag);
}
} else {
if (e.hasTag(selectedTag)) {
e.removeTag(selectedTag);
}
}
}
const entityClaim = new Map();
const selectionsByEntity = new Map();
for (const sel of selections) {
const list = selectionsByEntity.get(sel.entity.id);
if (list) list.push(sel); else selectionsByEntity.set(sel.entity.id, [sel]);
}
for (const sel of selections) {
const ent = sel.entity;
if (entityClaim.has(ent.id)) continue;
try {
const cur = ent.getProperty?.(ENTITY_PROP_IDX);
if (typeof cur === "number" && cur > 0) {
const candidates = selectionsByEntity.get(ent.id) || [];
const keeper = candidates.find(({ player }) => player.hasTag(SELECT_TAG_PREFIX + cur));
if (keeper) {
entityClaim.set(ent.id, { idx: cur, player: keeper.player });
setPlayerIndexTag(keeper.player, cur);
}
}
} catch (_) {
}
}
for (const sel of selections) {
const { player, entity } = sel;
if (entityClaim.has(entity.id)) {
const claimed = entityClaim.get(entity.id);
if (claimed.player && claimed.player.id === player.id) {
setPlayerIndexTag(player, claimed.idx);
} else {
setPlayerIndexTag(player, 0);
}
continue;
}
const used = getUsedIndexesAroundEntity(entity);
const idx = pickFreeIndex(used);
if (idx === 0) {
setPlayerIndexTag(player, 0);
continue;
}
entityClaim.set(entity.id, { idx, player });
setPlayerIndexTag(player, idx);
try { entity.setProperty?.(ENTITY_PROP_IDX, idx); } catch (_) {
}
}
for (const e of unionNearby) {
if (!entityClaim.has(e.id)) {
try {
const cur = e.getProperty?.(ENTITY_PROP_IDX) ?? 0;
if (cur !== 0) e.setProperty?.(ENTITY_PROP_IDX, 0);
} catch (_) {
}
}
}
}, 1);