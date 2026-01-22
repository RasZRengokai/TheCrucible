import { world } from "@minecraft/server"

world.beforeEvents.worldInitialize.subscribe((event) => {

    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:totem.generator', new Generator())

})

class Generator {
    onTick(data) {

        let BlockX = data.block.x
        let BlockY = data.block.y
        let BlockZ = data.block.z


        const randomChoice = Math.floor(Math.random() * 4);

        switch (randomChoice) {
            case 0:
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:totem_of_negation_stand`)
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY + 1} ${BlockZ} ecbl_bs:totem_of_negation `)

                break;
            case 1:
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:totem_of_turtle_stand `)
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY + 1} ${BlockZ} ecbl_bs:totem_of_turtle `)
                break;
            case 2:
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:totem_of_storm_stand `)
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY + 1} ${BlockZ} ecbl_bs:totem_of_storm `)
                break;
            case 3:
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:totem_of_undying_stand `)
                data.block.dimension.runCommand(`setblock ${BlockX} ${BlockY + 1} ${BlockZ} ecbl_bs:totem_of_undying`)
                break;
        }

    }
} 
