import { ItemStack, BlockPermutation } from "@minecraft/server";
export const teleporterPadSpace = new class TeleporterPadSpace {
    spawnShard(block, dimension, pos) {
        const shard = new ItemStack("ws:teleport_shard" + (block.permutation.getState("ws:broken") ? "_broken" : ""));
        if (dimension != undefined && pos != undefined) {
            shard.setDynamicProperty("0", dimension);
            shard.setDynamicProperty("1", pos);
            shard.setLore([`Dimension: §7${dimension.replace("minecraft:", "")}`, `At: §7${pos.x}, ${pos.y}, ${pos.z}`]);
        }
        this.setEmptyPad(block);
        block.dimension.spawnItem(shard, block.center());
    }
    setEmptyPad(block) {
        const dir = block.permutation.getState("minecraft:cardinal_direction");
        if (dir)
            block.setPermutation(BlockPermutation.resolve("ws:teleporter_pad_empty", { "minecraft:cardinal_direction": dir }));
    }
    setFullPad(block, broken) {
        block.setPermutation(BlockPermutation.resolve("ws:teleporter_pad", {
            "ws:broken": broken,
            "minecraft:cardinal_direction": block.permutation.getState("minecraft:cardinal_direction") ?? "south"
        }));
    }
};
