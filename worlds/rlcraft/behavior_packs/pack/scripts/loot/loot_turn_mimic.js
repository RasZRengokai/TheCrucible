import { world, system } from "@minecraft/server";

// Lista de tipos de entidades que devem gerar baús
const validTypes = [
    "ecbl_bs:desert_temple.loot",
    "ecbl_bs:jungle_temple.loot",
    "ecbl_bs:dungeon.loot",
    "ecbl_bs:nether_fortress.loot",
    "ecbl_bs:pillager_camp.loot",
    "ecbl_bs:pillager_ship.loot",
    "ecbl_bs:ruins.loot",
    "ecbl_bs:trader_camp.loot",
    "ecbl_bs:witch_hut.loot"
];

// Verifica se há jogadores com a tag que desativa o sistema
function isChestLootSystemActive() {
    for (const player of world.getPlayers()) {
        if (player.hasTag("desactive_chest_loots")) {
            return false;
        }
    }
    return true;
}

// Função que invoca os mimics apenas se a entidade ainda não tiver a tag "mimic"
function spawnMimics() {
    if (!isChestLootSystemActive()) return;

    const dimension = world.getDimension("overworld");
    const allEntities = dimension.getEntities();

    for (const entity of allEntities) {
        if (!validTypes.includes(entity.typeId)) continue;
        if (entity.hasTag("mimic")) continue;

        const yawDeg = entity.getRotation().y;
        const yawRad = yawDeg * (Math.PI / 180);

        const baseX = entity.location.x;
        const baseY = entity.location.y;
        const baseZ = entity.location.z;

        let facingX = Math.sin(yawRad);
        let facingZ = Math.cos(yawRad);

        if (Math.abs(facingX) > Math.abs(facingZ)) {
            facingX = -facingX;
            facingZ = -facingZ;
        }

        const frontX = baseX + facingX;
        const frontZ = baseZ + facingZ;

        const spawnX = Math.floor(frontX);
        const spawnY = Math.floor(baseY - 1);
        const spawnZ = Math.floor(frontZ);

        const lookX = Math.floor(frontX + facingX);
        const lookY = spawnY;
        const lookZ = Math.floor(frontZ + facingZ);

        if (Math.random() < 0.5) {
            entity.runCommand(`fill ~~-1~ ~~1~ air replace chest`);
            entity.runCommand(`summon ecbl_bs:mimic ${spawnX} ${spawnY} ${spawnZ}`);
            entity.runCommand(`tp @e[type=ecbl_bs:mimic,r=1,x=${spawnX},y=${spawnY},z=${spawnZ}] ~ ~ ~ facing ${lookX} ${lookY} ${lookZ}`);
            entity.runCommand(`kill @e[r=3,type=item]`);
        }

        entity.runCommand(`tag @s add mimic`);
        entity.runCommand(`event entity @s ecbl_bs:event_despawn_loot`);
    }
}


system.runInterval(() => {
    system.runTimeout(spawnMimics, 1);
}, 1);

world.beforeEvents.worldInitialize.subscribe((event) => {

    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:mimic_box', new mimic())
  
  })
  
  class mimic {
    onTick(data) {
  
      let BlockX = data.block.x
      let BlockY = data.block.y
      let BlockZ = data.block.z
  
      // here you can type in a command!
      data.block.dimension.runCommand(`tp @e[type=ecbl_bs:mimic,r=2,x=${BlockX},y=${BlockY},z=${BlockZ}]  ${BlockX} ${BlockY} ${BlockZ}`)
  
    }
  } 