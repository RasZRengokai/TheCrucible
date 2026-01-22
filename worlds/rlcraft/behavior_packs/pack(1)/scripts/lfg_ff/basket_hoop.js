/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from './vector.js';
export class BasketHoopComponent {
constructor() {
this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
this.onPlayerBreak = this.onPlayerBreak.bind(this);
this.basketId = "lfg_ff:basket_hoop"
this.basketEntityId = "lfg_ff:basket_hoop_entity"
this.MaxPaintedBlocksOnce = 140
}
variantChanger(e) {
const smallBrush = e.smallBrush
const variantPicker = e.variantPicker
const block = e.block;
const variant = block.permutation.getState("lfg_ff:variant");
const direction = block.permutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
const player = e.player;
let selectedSlot = player.selectedSlotIndex;
let handItem = player.getComponent("inventory").container.getItem(selectedSlot);
if (handItem) {
if (handItem.typeId == "lfg_ff:color_brush" || handItem.typeId == "lfg_ff:variant_selector_small") {
if (player.hasTag("lfg_ff:color_brush:cooldown")) return
let newVariant = variant == 2 ? 1 : variant + 1
if (variantPicker !== null) newVariant = variantPicker
block.setPermutation(block.permutation
.withState("lfg_ff:variant", newVariant));
block.dimension.runCommand(`playsound sign.ink_sac.use @a ${block.location.x} ${block.location.y} ${block.location.z}`)
if (!smallBrush) {
handItem.getComponent('cooldown').startCooldown(player);
player.addTag("lfg_ff:color_brush:cooldown")
system.runTimeout(() => {
player.removeTag("lfg_ff:color_brush:cooldown")
}, 10)
this.expendPaint(block, newVariant, direction)
}
return;
}
}
}
expendPaint(block, newVariant, direction, updatedPaintedBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedPaintedBlocks.has(blockLocationKey)) {
return;
}
updatedPaintedBlocks.add(blockLocationKey);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const allbaskets = [];
if (upBlock) allbaskets.push(upBlock)
if (downBlock) allbaskets.push(downBlock)
if (frontBlock && this.getModule(block) == "cadre") allbaskets.push(frontBlock)
if (backBlock && (this.getModule(block) == "top" || this.getModule(block) == "wall")) allbaskets.push(backBlock)
const basketEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.basketEntityId })[0]
if (basketEntity) {
basketEntity.setProperty("lfg_ff:variant", newVariant)
}
for (const expendedbasket of allbaskets) {
const expendedVariant = this.getVariant(expendedbasket);
const expDir = this.getDirection(expendedbasket);
if (expendedVariant == newVariant) continue;
system.runTimeout(() => {
if (expendedVariant !== newVariant) {
try {
if (updatedPaintedBlocks.size < this.MaxPaintedBlocksOnce) {
expendedbasket.setPermutation(expendedbasket.permutation
.withState("lfg_ff:variant", newVariant));
this.expendPaint(expendedbasket, newVariant, expDir, updatedPaintedBlocks);
}
} catch (e) {
}
}
}, 1);
}
}
onPlayerBreak(e) {
const block = e.block;
const player = e.player;
const brokenBlockPermutation = e.brokenBlockPermutation
const direction = brokenBlockPermutation.getState('minecraft:cardinal_direction');
const center = this.getBlockCenter(block)
if (brokenBlockPermutation.getState("lfg_ff:module") == "cadre") {
const loc = this.getNeighborBlock(block, direction, "front", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
const basketEntity = block.dimension.getEntities({ location: Vector.add(block.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.basketEntityId })[0]
if (basketEntity) {
basketEntity.remove()
}
system.runTimeout(() => {
this.updateAllbasket(this.getNeighborBlock(block, direction, "front", false), direction)
}, 1)
}
if (brokenBlockPermutation.getState("lfg_ff:module") == "wall") {
const loc = this.getNeighborBlock(block, direction, "back", false).location
block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air ${player.getGameMode() == "Creative" ? "replace" : "destroy"}`)
const basketEntity = block.dimension.getEntities({ location: Vector.add(loc, new Vector(0.5, 0, 0.5)), maxDistance: 0.1, type: this.basketEntityId })[0]
if (basketEntity) {
basketEntity.remove()
}
}
system.runTimeout(() => {
this.updateAllbasket(block, direction)
}, 1)
}
beforeOnPlayerPlace(e) {
const block = e.block;
const permutationToPlace = e.permutationToPlace;
const direction = permutationToPlace.getState('minecraft:cardinal_direction');
const placedFace = e.face;
if (placedFace == "Down" || placedFace == "Up") {
let canPlace = false
if (this.getNeighborBlock(block, direction, "back", false).isAir && block.isAir) canPlace = true
if (!canPlace) {
e.cancel = true
return;
}
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "top").withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.run(()=>{
this.getNeighborBlock(block, direction, "back", false).setPermutation(permutationToPlace.withState("lfg_ff:module", "cadre").withState("lfg_ff:variant", this.getPlacementVariant(block, direction)))
const loc = this.getNeighborBlock(block, direction, "back", false).location
const basketRotationY = this.getbasketEntityRotations(direction)
const spawnedbasketEntity = block.dimension.spawnEntity(this.basketEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedbasketEntity.setRotation({ x: 0, y: basketRotationY })
spawnedbasketEntity.setProperty("lfg_ff:rotation_y", basketRotationY);
spawnedbasketEntity.setProperty("lfg_ff:variant", this.getPlacementVariant(block, direction));
})
} else {
e.permutationToPlace = permutationToPlace.withState("lfg_ff:module", "wall").withState("lfg_ff:variant", this.getPlacementVariant(block, direction))
system.run(()=>{
this.getNeighborBlock(block, direction, "back", false).setPermutation(permutationToPlace.withState("lfg_ff:module", "cadre").withState("lfg_ff:variant", this.getPlacementVariant(block, direction)))
const loc = this.getNeighborBlock(block, direction, "back", false).location
const basketRotationY = this.getbasketEntityRotations(direction)
const spawnedbasketEntity = block.dimension.spawnEntity(this.basketEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedbasketEntity.setRotation({ x: 0, y: basketRotationY })
spawnedbasketEntity.setProperty("lfg_ff:rotation_y", basketRotationY);
spawnedbasketEntity.setProperty("lfg_ff:variant", this.getPlacementVariant(block, direction));
})
}
system.runTimeout(() => {
this.updateAllbasket(block, direction)
}, 1)
}
getPlacementVariant(block, direction) {
const adjacentPositions = ["up", "down"];
const adjacentBlocks = adjacentPositions
.map(pos => this.getNeighborBlock(block, direction, pos, true))
.filter(Boolean);
const variantCount = {};
for (const adjacentBlock of adjacentBlocks) {
const variant = this.getVariant(adjacentBlock);
if (variant !== undefined) {
variantCount[variant] = (variantCount[variant] || 0) + 1;
}
}
let placementVar = 1;
let maxCount = 0;
for (const [variant, count] of Object.entries(variantCount)) {
if (count > maxCount) {
maxCount = count;
placementVar = parseInt(variant, 10);
}
}
return placementVar;
}
getModule(block) {
if (!block) return null
return block.permutation.getState("lfg_ff:module")
}
getVariant(block) {
if (!block) return null
return block.permutation.getState("lfg_ff:variant")
}
getDirection(block) {
if (!block) return null
return block.permutation.getState("minecraft:cardinal_direction")
}
getRotationFromDirection(direction) {
switch (direction) {
case 'north': return 0;
case 'south': return 180;
case 'east': return 90;
case 'west': return -90;
default: return 0;
}
}
getBlockCenter(b) {
return { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 }
}
getNeighborBlock(block, direction, side, filterbasket) {
let neighborBlock = null
if (side == "left")
neighborBlock = this.getBlockInDirection(block, this.getLeftDirection(direction));
else if (side == "right")
neighborBlock = this.getBlockInDirection(block, this.getRightDirection(direction));
else if (side == "up")
neighborBlock = block.above()
else if (side == "down")
neighborBlock = block.below()
else if (side == "front")
neighborBlock = this.getBlockInDirection(block, direction);
else if (side == "back")
neighborBlock = this.getBlockInDirection(block, this.getOppositeDirection(direction));
if (filterbasket)
return neighborBlock.typeId == this.basketId ? neighborBlock : null;
else
return neighborBlock
}
getBlockInDirection(block, direction) {
switch (direction) {
case 'north':
return block.north();
case 'south':
return block.south();
case 'east':
return block.east();
case 'west':
return block.west();
}
}
getLeftDirection(direction) {
switch (direction) {
case 'north':
return 'west';
case 'south':
return 'east';
case 'east':
return 'north';
case 'west':
return 'south';
}
}
getRightDirection(direction) {
switch (direction) {
case 'north':
return 'east';
case 'south':
return 'west';
case 'east':
return 'south';
case 'west':
return 'north';
}
}
getOppositeDirection(direction) {
switch (direction) {
case 'north':
return 'south';
case 'south':
return 'north';
case 'east':
return 'west';
case 'west':
return 'east';
case 'up':
return 'down';
case 'down':
return 'up';
default:
return null;
}
}
updateAllbasket(block, direction, updatedbasketBlocks = new Set()) {
const blockLocationKey = `${block.location.x},${block.location.y},${block.location.z}`;
if (updatedbasketBlocks.has(blockLocationKey)) {
return;
}
updatedbasketBlocks.add(blockLocationKey);
const frontBlock = this.getNeighborBlock(block, direction, "front", true);
const backBlock = this.getNeighborBlock(block, direction, "back", true);
const upBlock = this.getNeighborBlock(block, direction, "up", true);
const downBlock = this.getNeighborBlock(block, direction, "down", true);
const allbaskets = [];
if (frontBlock) allbaskets.push(frontBlock)
if (backBlock) allbaskets.push(backBlock)
if (upBlock) allbaskets.push(upBlock)
if (downBlock) allbaskets.push(downBlock)
if (block && block.typeId == this.basketId) allbaskets.push(block)
for (const expendedbasket of allbaskets) {
const expDir = this.getDirection(expendedbasket);
const expendedfrontBlock = this.getNeighborBlock(expendedbasket, expDir, "front", true);
const expendedbackBlock = this.getNeighborBlock(expendedbasket, expDir, "back", true);
const expendedupBlock = this.getNeighborBlock(expendedbasket, expDir, "up", true);
const expendeddownBlock = this.getNeighborBlock(expendedbasket, expDir, "down", true);
const expNewModuleAndDir = this.getUpdatedModuleAndDirection(expendedbackBlock, expendedfrontBlock, expendedupBlock, expendeddownBlock, expDir, expendedbasket);
expendedbasket.setPermutation(expendedbasket.permutation
.withState('lfg_ff:module', expNewModuleAndDir.module)
.withState('minecraft:cardinal_direction', expNewModuleAndDir.direction));
if (!["top", "wall"].includes(this.getModule(this.getNeighborBlock(expendedbasket, expDir, "front", true))) && this.getModule(expendedbasket) == "cadre") {
expendedbasket.setPermutation(BlockPermutation.resolve("minecraft:air"))
const basketEntity = block.dimension.getEntities({ location: Vector.add(expendedbasket.location, new Vector(0.5, 0, 0.5)), maxDistance: 0.25, type: this.basketEntityId })[0]
if (basketEntity) {
basketEntity.remove()
}
} else {
if (this.getModule(expendedbasket) == "top" && this.getModule(this.getNeighborBlock(expendedbasket, expDir, "back", true)) !== "cadre") {
this.getNeighborBlock(expendedbasket, expDir, "back", false).setPermutation(expendedbasket.permutation.withState("lfg_ff:module", "cadre").withState("lfg_ff:variant", this.getVariant(expendedbasket)))
const loc = this.getNeighborBlock(expendedbasket, expDir, "back", false).location
const basketRotationY = this.getbasketEntityRotations(expDir)
const spawnedbasketEntity = block.dimension.spawnEntity(this.basketEntityId, Vector.add(loc, new Vector(0.5, 0, 0.5)))
spawnedbasketEntity.setRotation({ x: 0, y: basketRotationY })
spawnedbasketEntity.setProperty("lfg_ff:rotation_y", basketRotationY);
spawnedbasketEntity.setProperty("lfg_ff:variant", this.getVariant(expendedbasket));
}
}
system.runTimeout(() => {
try {
if (updatedbasketBlocks.size <= 10)
this.updateAllbasket(expendedbasket, expNewModuleAndDir.direction, updatedbasketBlocks);
} catch (e) {
}
}, 1);
}
}
getbasketEntityRotations(dir) {
let rotationY = 0;
switch (dir) {
case 'north':
rotationY = 0;
break;
case 'south':
rotationY = 180;
break;
case 'east':
rotationY = 90;
break;
case 'west':
rotationY = -90;
break;
}
return rotationY;
}
getUpdatedModuleAndDirection(backBlock, frontBlock, upBlock, downBlock, direction, block) {
const baskets = []
const allBlocks = [backBlock, frontBlock, upBlock, downBlock]
allBlocks.forEach((b) => {
if (!b) return;
baskets.push(b)
})
if (!baskets.includes(backBlock)) backBlock = null
if (!baskets.includes(frontBlock)) frontBlock = null
if (!baskets.includes(upBlock)) upBlock = null
if (!baskets.includes(downBlock)) downBlock = null
if (!upBlock && !downBlock) return { module: this.getModule(block), direction: direction }
if (this.getModule(block) == "wall") return { module: this.getModule(block), direction: direction }
if (this.getModule(block) == "cadre") return { module: this.getModule(block), direction: direction }
if (upBlock && downBlock) {
return { module: "mid", direction: direction }
} else if (upBlock) {
return { module: "bot", direction: direction }
} else if (downBlock) {
return { module: "top", direction: direction }
}
return { module: "top", direction: direction }
}
}