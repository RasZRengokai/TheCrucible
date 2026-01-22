import { world, system } from "@minecraft/server"


world.beforeEvents.worldInitialize.subscribe((event) => {

    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:gravestone_generation', new Gravestone())

})

class Gravestone {
    onTick(data) {

        let BlockX = data.block.x
        let BlockY = data.block.y
        let BlockZ = data.block.z

        if (Math.random() < 0.05) { // Chance de 0.3 = 30%

            if (Math.random() < 0.7) { // Chance de 0.3 = 30%

                data.block.dimension.runCommand(`summon zombie ${BlockX} ${BlockY} ${BlockZ}`)

            } else {
                data.block.dimension.runCommand(`summon skeleton ${BlockX} ${BlockY} ${BlockZ}`)

            }
        }
    } 
}