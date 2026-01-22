import { world, system } from "@minecraft/server"

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "ecbl_bs:step_on_spike",
        StepOnSpike
    );
});

const IGNORE_TYPES = [
    "minecraft:item",
    "ecbl_bs:mummy",
    "ecbl_bs:sitting_skeleton",
    "ecbl_bs:dead_lying_skeleton",
    "minecraft:zombie",
    "minecraft:bogged",
];

const StepOnSpike = {
    onEntityFallOn(event) {
        const entity = event.entity;
        if (!entity || IGNORE_TYPES.includes(entity.typeId)) return;

        const fall = event.fallDistance;

        if (fall > 3) {
            const damage = Math.floor(fall / 2);
            entity.runCommand(`damage @s ${damage}`);
            entity.runCommand(`effect @s slowness 3 1`);
        } else {
            entity.runCommand(`damage @s 1`);
        }
    }
};


world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "ecbl_bs:step_on_spike_venom",
        StepOnSpikeVenom
    );
});

const StepOnSpikeVenom = {
    onEntityFallOn(event) {
        const entity = event.entity;
        if (!entity) return;
        if (!entity || IGNORE_TYPES.includes(entity.typeId)) return;

        const fall = event.fallDistance;

        if (fall > 3) {
            const damage = Math.floor(fall / 2);
            entity.runCommand(`damage @s ${damage}`);
            entity.runCommand(`effect @s slowness 3 1`);
        } else {
            entity.runCommand(`damage @s 1`);
        }
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////


system.runInterval(() => {
    const overworld = world.getDimension("overworld");
    const entities = overworld.getEntities();

    for (const entity of entities) {
        if (IGNORE_TYPES.includes(entity.typeId)) continue;

        const pos = entity.location;
        const yDecimal = pos.y - Math.floor(pos.y);
        if (Math.abs(yDecimal - 0.5) > 0.01) continue;

        const x = Math.floor(pos.x);
        const y1 = Math.floor(pos.y);
        const y0 = y1 - 1;
        const z = Math.floor(pos.z);

        if (y0 < -64 || y1 > 319) continue;

        const blockAtFeet = overworld.getBlock({ x, y: y1, z });
        const blockBelow = overworld.getBlock({ x, y: y0, z });

        if ((blockAtFeet && blockAtFeet.typeId === "ecbl_bs:spike_block") || (blockBelow && blockBelow.typeId === "ecbl_bs:spike_block")) {
            entity.applyDamage(2);
        }
        if ((blockAtFeet && blockAtFeet.typeId === "ecbl_bs:venom_spike_block") || (blockBelow && blockBelow.typeId === "ecbl_bs:venom_spike_block")) {
            entity.applyDamage(2);
            entity.addEffect('poison', 300, { amplifier: 0 });
        }
    }
}, 10);




