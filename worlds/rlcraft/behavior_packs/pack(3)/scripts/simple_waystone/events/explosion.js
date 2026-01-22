import { world, ItemStack } from "@minecraft/server";
import { warpstonePedestalInfo } from "../lib/warpstonePedestal/info";
import { teleporterPadCache } from "../lib/cache/teleporter";
import { teleporterPadSpace } from "../lib/teleporter/space";
import { teleporterPadInfo } from "../lib/teleporter/info";
import { waystoneInfo } from "../lib/waystone/info";
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation: permutation }) => {
    if (permutation.hasTag("simple_waystone:waystone"))
        return explosionController["simple_waystone:waystone"]?.(block, permutation);
    if (permutation.hasTag("simple_waystone:warpstone_pedestal"))
        return explosionController["simple_waystone:warpstone_pedestal"]?.(block, permutation);
    if (permutation.hasTag("simple_waystone:teleporter_pad"))
        return explosionController["simple_waystone:teleporter_pad"]?.(block, permutation);
});
const explosionController = {
    "simple_waystone:waystone": (block, permutation) => {
        const drop = permutation.getItemStack();
        if (drop)
            block.dimension.spawnItem(drop, { x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5 });
        if (permutation.getState("ws:waystone_on") == false)
            return;
        const bottomBlock = permutation.getState("ws:waystone") == 1 ? block : block.below(1);
        if (!bottomBlock)
            return;
        waystoneInfo.removeWaystone(bottomBlock.location, bottomBlock.dimension.id);
    },
    "simple_waystone:warpstone_pedestal": (block, permutation) => {
        warpstonePedestalInfo.remove(block.location, block.dimension.id);
    },
    "simple_waystone:teleporter_pad": (block, permutation) => {
        const teleporter = teleporterPadCache.getTeleporter(`${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`);
        if (teleporter && teleporter != true)
            teleporterPadSpace.spawnShard(block, teleporter.dimension, teleporter.pos);
        teleporterPadInfo.remove(block);
        block.dimension.spawnItem(new ItemStack("ws:teleporter_pad_empty"), block.center());
    }
};
