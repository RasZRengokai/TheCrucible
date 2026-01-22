import { world } from "@minecraft/server"


class BlockFilterUp {
    onTick(data) {
        const block = data.block;
        const belowBlock = block.dimension.getBlock({ x: block.x, y: block.y - 1, z: block.z });

        if (!belowBlock) return;

        const belowBlockId = belowBlock.typeId;
        const validBlock = solidBlocks.some(fragment => belowBlockId.includes(fragment));
        const Invalid = InvalidName.some(fragment => belowBlockId.includes(fragment));

        if (!validBlock || Invalid) {
            block.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`);
        }
    }
}

class BlockFilterNorth {
    onTick(data) {
        const block = data.block;
        const belowBlock = block.dimension.getBlock({ x: block.x, y: block.y, z: block.z + 1 });
        //block.dimension.runCommand(`say norte`);

        if (!belowBlock) return;

        const belowBlockId = belowBlock.typeId;
        const validBlock = solidBlocks.some(fragment => belowBlockId.includes(fragment));
        const Invalid = InvalidName.some(fragment => belowBlockId.includes(fragment));

        if (!validBlock || Invalid) {
            block.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`);
        }
    }
}

class BlockFilterSouth {
    onTick(data) {
        const block = data.block;
        const belowBlock = block.dimension.getBlock({ x: block.x, y: block.y, z: block.z - 1 });
        //block.dimension.runCommand(`say Sul`);

        if (!belowBlock) return;

        const belowBlockId = belowBlock.typeId;
        const validBlock = solidBlocks.some(fragment => belowBlockId.includes(fragment));
        const Invalid = InvalidName.some(fragment => belowBlockId.includes(fragment));

        if (!validBlock || Invalid) {
            block.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`);
        }
    }
}

class BlockFilterWest {
    onTick(data) {
        const block = data.block;
        const belowBlock = block.dimension.getBlock({ x: block.x + 1, y: block.y, z: block.z });
        //block.dimension.runCommand(`say West`);

        if (!belowBlock) return;

        const belowBlockId = belowBlock.typeId;
        const validBlock = solidBlocks.some(fragment => belowBlockId.includes(fragment));
        const Invalid = InvalidName.some(fragment => belowBlockId.includes(fragment));

        if (!validBlock || Invalid) {
            block.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`);
        }
    }
}

class BlockFilterEast {
    onTick(data) {
        const block = data.block;
        const belowBlock = block.dimension.getBlock({ x: block.x - 1, y: block.y, z: block.z });
        //block.dimension.runCommand(`say east`);

        if (!belowBlock) return;

        const belowBlockId = belowBlock.typeId;
        const validBlock = solidBlocks.some(fragment => belowBlockId.includes(fragment));
        const Invalid = InvalidName.some(fragment => belowBlockId.includes(fragment));

        if (!validBlock || Invalid) {
            block.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`);
        }
    }
}

//////////////////////////////////


const InvalidName = [
    "gate", "door", "slab", "statue", "brazier", "totem", "spike", "grindstone", "enchanting", "pressure",
    "heavy", "button", "torch", "redstone_wire", "piston", "rail"
];


// Lista de trechos de IDs de blocos que não devem permitir a continuação
const solidBlocks = [
    "block", "_planks", "fence", "bamboo_mosaic", "glass", "bars", "brick", "blackstone", "deepslate", "stone",
    "copper", "quartz", "prismarine", "wool", "slime", "concrete", "clay", "terracotta", "mud", "table", "beehive",
    "furnace", "smoker", "respawn", "book", "composter", "barrel", "sea_lantern", "jukebox", "beacon", "dispenser",
    "dropper", "observer", "piston", "loom", "target", "shroomlight", "nylium", "netherrack", "basalt", "soul_sand",
    "soul_soil", "dirt", "ore", "gravel", "ancient_debris", "podzol", "mycelium", "granite", "diorite", "andesite",
    "sand", "log", "wood", "stem", "hyphae", "leaves", "pumpkin", "snow", "ice", "tuff", "froglight", "obsidian",
    "sponge", "bedrock", "scaffolding"
];
world.beforeEvents.worldInitialize.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:block_filter_up', new BlockFilterUp());
    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:block_filter_north', new BlockFilterNorth());
    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:block_filter_south', new BlockFilterSouth());
    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:block_filter_west', new BlockFilterWest());
    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:block_filter_east', new BlockFilterEast());
});