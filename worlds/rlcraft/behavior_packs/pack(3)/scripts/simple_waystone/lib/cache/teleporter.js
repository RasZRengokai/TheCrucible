import { globalCacheTeleporterPad } from "./global";
export const teleporterPadCache = new class TeleporterPadCache {
    getTeleporter(id) { return globalCacheTeleporterPad.get(id); }
    remove(id) { globalCacheTeleporterPad.delete(id); }
    putShard(id, owner, dimension, pos, broken) {
        globalCacheTeleporterPad.set(id, {
            owner,
            dimension,
            pos,
            broken
        });
    }
    removeShard(id) {
        globalCacheTeleporterPad.set(id, true);
    }
};
