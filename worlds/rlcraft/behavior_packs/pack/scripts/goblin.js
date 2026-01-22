import { world, system } from "@minecraft/server"

system.runInterval(() => {

    const testForCommand = `testfor @e[r=8,type=ecbl_bs:goblin,tag=!animation_first]`;

    world.getAllPlayers().forEach(player => {
        player.runCommandAsync(testForCommand).then(async (result) => {
            if (result.successCount > 0) {

                player.runCommand('effect @e[r=8,type=ecbl_bs:goblin,tag=!animation_first] slowness 2 250 true')
                await player.runCommand('tag @e[r=8,type=ecbl_bs:goblin,tag=!animation_first] add animation_first')
                await player.runCommand('event entity @e[r=8,type=ecbl_bs:goblin] ecbl_bs:event_goblin_animation')
            }
        })
    })

});


  