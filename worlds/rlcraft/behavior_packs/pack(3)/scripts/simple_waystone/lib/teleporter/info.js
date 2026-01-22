import { teleporterPadTimer } from "../../functions/teleporter/place";
import { system } from "@minecraft/server";
import { globalCacheTeleporterPad } from "../cache/global";
import { teleporterPadCache } from "../cache/teleporter";
import { apiScoreboard } from "../math/scoreboard";
export const teleporterPadInfo = new class TeleporterPadInfo {
    create(id) {
        apiScoreboard.addObj("simple_waystone/t/" + id);
        globalCacheTeleporterPad.set(id, true);
    }
    remove(block) {
        const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`;
        apiScoreboard.removeObj("simple_waystone/t/" + id, true);
        system.clearRun(teleporterPadTimer.get(id) ?? 0);
        teleporterPadTimer.delete(id);
        teleporterPadCache.remove(id);
    }
    putShard(block, playerId, dimension, pos, broken) {
        const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`;
        const score = apiScoreboard.getObj("simple_waystone/t/" + id);
        apiScoreboard.addScore(score, `0/${playerId}`);
        apiScoreboard.addScore(score, `1/${dimension.replace("minecraft:", "")}`);
        apiScoreboard.addScore(score, `2/${pos.x},${pos.y},${pos.z}`);
        apiScoreboard.setScore(score, `3/broken`, broken ? 1 : 0);
        teleporterPadCache.putShard(id, playerId, dimension, pos, broken);
    }
    removeShard(block) {
        const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`;
        const score = apiScoreboard.getObj("simple_waystone/t/" + id);
        for (const part of score.getParticipants())
            score.removeParticipant(part);
        const timer = teleporterPadTimer.get(id);
        if (timer)
            system.clearRun(timer);
        teleporterPadTimer.delete(id);
        teleporterPadCache.removeShard(id);
    }
};
