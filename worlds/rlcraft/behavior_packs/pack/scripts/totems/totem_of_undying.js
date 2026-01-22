import { world, system, ItemStack, BlockPermutation } from "@minecraft/server"

world.afterEvents.entityHitBlock.subscribe((event) => {
    if (event.hitBlock.typeId === "ecbl_bs:totem_of_undying") {

        event.damagingEntity.runCommand(`setblock ${event.hitBlock.location.x} ${event.hitBlock.location.y} ${event.hitBlock.location.z} air`);

        event.hitBlock.dimension.spawnItem(new ItemStack('minecraft:totem_of_undying', 1), {
            x: event.hitBlock.location.x + 0.5,
            y: event.hitBlock.location.y + 0.5,
            z: event.hitBlock.location.z + 0.5
        });
    }
});

world.beforeEvents.worldInitialize.subscribe((event) => {

    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:totem_of_undying_particles', new TotemParticles())

})

let ticks = 0

class TotemParticles {
  onTick(data) {
    const { x, y, z } = data.block;
    const dim = data.block.dimension;

    dim.runCommand(`particle ecbl_bs:undying_statue_1 ${x} ${y} ${z}`);
    dim.runCommand(`particle ecbl_bs:undying_statue_2 ${x} ${y + 0.3} ${z}`);
    //dim.runCommand(`say ${ticks}`);

    ticks++;
    
    if (ticks == 5) {
      dim.runCommand(`playsound mob.ecbl_bs.statue.holy_idle @a[r=10,x=${x},y=${y},z=${z}] ${x} ${y} ${z} 0.5`);

      ticks = 0

    }
  }
}


const allowedBlocks = [
    'ecbl_bs:totem_of_undying_stand'
];

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, block, itemStack, blockFace } = ev;
    const blockPosition = block.location;

    if (
        allowedBlocks.includes(block.typeId) &&
        itemStack?.typeId === 'minecraft:totem_of_undying' &&
        blockFace === 'Up'
    ) {
        let yaw = player.getRotation().y;
        if (yaw < 0) yaw += 360;

        let direction = "north";
        if (yaw >= 45 && yaw < 135) direction = "east";
        else if (yaw >= 135 && yaw < 225) direction = "south";
        else if (yaw >= 225 && yaw < 315) direction = "west";

        const aboveBlock = block.dimension.getBlock({
            x: blockPosition.x,
            y: blockPosition.y + 1,
            z: blockPosition.z
        });
        system.run(() => {


            if (aboveBlock) {
                const permutation = BlockPermutation.resolve("ecbl_bs:totem_of_undying", { "minecraft:cardinal_direction": direction });
                aboveBlock.setPermutation(permutation);
            }

            if (player.getGameMode() !== 'creative') {
                player.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand 0 air`);
            }

            player.dimension.playSound("dig.stone", blockPosition);
        })
    }
})




world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, block } = ev;
    const dimension = player.dimension;
    const blockPos = block.location;

    if (block.typeId === 'ecbl_bs:totem_of_undying') {
        system.run(() => {
            // Remove o bloco
            dimension.runCommand(`setblock ${blockPos.x} ${blockPos.y} ${blockPos.z} air`);

            // Cria o item de totem
            const totem = new ItemStack('minecraft:totem_of_undying', 1);

            // Spawna o item no local
            dimension.spawnItem(totem, {
                x: blockPos.x + 0.5,
                y: blockPos.y + 0.5,
                z: blockPos.z + 0.5
            });
        });
    }
});
