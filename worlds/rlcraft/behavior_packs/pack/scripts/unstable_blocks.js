import { world, system } from "@minecraft/server"

const StepOnBlockComponentMossy = {
  onStepOn(event) {
    const block = event.block; // Block impacted by this event.
    const dimension = event.dimension; // Dimension that contains the block.
    const entity = event.entity; // The entity that stepped on the block. May be undefined.
    if (entity.typeId === "minecraft:player") {
      const { x, y, z } = block.location;
        // Schedule the block to be destroyed after 3 seconds

        system.runTimeout(() => {

            dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
            dimension.runCommand(`kill @e[x=${x},y=${y},z=${z},type=item]`);
            dimension.runCommand(`playsound mob.zombie.woodbreak @a ${x} ${y} ${z} 1`);
            dimension.runCommand(`particle ecbl_bs:collapsing_block ${x} ${y} ${z}`);
            
        }, 5); 
    }
  },
  onTick(data) {
  
    let BlockX = data.block.x
    let BlockY = data.block.y
    let BlockZ = data.block.z


    data.block.dimension.runCommand(`particle ecbl_bs:stone_particle ${BlockX} ${BlockY} ${BlockZ}`)

  }
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
      "ecbl_bs:step_on_component_mossy",
      StepOnBlockComponentMossy
    );
});

const StepOnBlockComponentStoneBrick = {
  onStepOn(event) {
    const block = event.block; // Block impacted by this event.
    const dimension = event.dimension; // Dimension that contains the block.
    const entity = event.entity; // The entity that stepped on the block. May be undefined.
    if (entity.typeId === "minecraft:player") {
      const { x, y, z } = block.location;
        // Schedule the block to be destroyed after 3 seconds

        system.runTimeout(() => {

            dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
            dimension.runCommand(`kill @e[x=${x},y=${y},z=${z},type=item]`);
            dimension.runCommand(`playsound mob.zombie.woodbreak @a ${x} ${y} ${z} 1`);
            dimension.runCommand(`particle ecbl_bs:collapsing_block ${x} ${y} ${z}`);
            
        }, 5); 
    }
  },
  onTick(data) {
  
    let BlockX = data.block.x
    let BlockY = data.block.y
    let BlockZ = data.block.z


    data.block.dimension.runCommand(`particle ecbl_bs:stone_particle ${BlockX} ${BlockY} ${BlockZ}`)

  }
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
      "ecbl_bs:step_on_component_StoneBrick",
      StepOnBlockComponentStoneBrick
    );
});

const StepOnBlockComponentSandstone = {
  onStepOn(event) {
    const block = event.block; // Block impacted by this event.
    const dimension = event.dimension; // Dimension that contains the block.
    const entity = event.entity; // The entity that stepped on the block. May be undefined.
    if (entity.typeId === "minecraft:player") {
      const { x, y, z } = block.location;
        // Schedule the block to be destroyed after 3 seconds

        system.runTimeout(() => {

            dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
            dimension.runCommand(`kill @e[x=${x},y=${y},z=${z},type=item]`);
            dimension.runCommand(`playsound mob.zombie.woodbreak @a ${x} ${y} ${z} 1`);
            dimension.runCommand(`particle ecbl_bs:collapsing_block ${x} ${y} ${z}`);
            
        }, 5); 
    }
  },
  onTick(data) {
  
    let BlockX = data.block.x
    let BlockY = data.block.y
    let BlockZ = data.block.z


    data.block.dimension.runCommand(`particle ecbl_bs:dust ${BlockX} ${BlockY} ${BlockZ}`)

  }
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
      "ecbl_bs:step_on_component_Sandstone",
      StepOnBlockComponentSandstone
    );
});