import { system } from "@minecraft/server";

// Thanks to Halo333X for the original code, mine is slightly modified to fit in colonies

export class SupplyChestUtils {
    constructor(chest_entity) {
        this.chest_entity = chest_entity;
        this.maxOpen = 5;
        this.maxClose = 0;
    }

    open() {
        const { chest_entity, maxOpen } = this;
        const { dimension, location } = chest_entity;
        
        const chest = this.getChest(chest_entity);
        if (!chest || !chest.hasTag('supply_chest')) return;
        
        const currentState = chest.permutation.getState('jerrys_colonies:open') || 0;
        
 
        if (currentState >= maxOpen) return;
        
        // Play sound only when starting to open
        if (currentState === 0 && !chest_entity.getDynamicProperty('isOpen')) {
            dimension.playSound('random.chestopen', location);
            chest_entity.setDynamicProperty('isOpen', true);
        }
        

        const nextState = currentState + 1;
        const nextChestState = chest.permutation.withState('jerrys_colonies:open', nextState);
        chest.setPermutation(nextChestState);
    }

    close() {
        const { chest_entity, maxClose } = this;
        const { dimension, location } = chest_entity;
        
        const chest = this.getChest(chest_entity);
        if (!chest || !chest.hasTag('supply_chest')) return;
        
        const currentState = chest.permutation.getState('jerrys_colonies:open') || 0;
        

        if (currentState <= maxClose) return;
        

        if (currentState === this.maxOpen && chest_entity.getDynamicProperty('isOpen')) {
            chest_entity.setDynamicProperty('isOpen', false);
            dimension.playSound('random.chestclosed', location);
        }
        

        const nextState = currentState - 1;
        const nextChestState = chest.permutation.withState('jerrys_colonies:open', nextState);
        chest.setPermutation(nextChestState);
    }

    drop() {
        const { chest_entity } = this;
        const { dimension, location } = chest_entity;
        const chest = this.getChest(chest_entity);
        
        if (chest) return;
        
        const inv = chest_entity.getComponent('inventory').container;
        for (let i = 0; i < inv?.size; i++) {
            const item = inv?.getItem(i);
            if (item) {
                dimension.spawnItem(item, location);
                inv?.setItem(i, undefined);
            }
        }
        
        chest_entity.remove();
    }

    getChest(entity) {
        const { location, dimension } = entity;
        const chest = dimension.getBlock(location);
        
        if (chest?.hasTag('supply_chest')) {
            return chest;
        }
    }
}
