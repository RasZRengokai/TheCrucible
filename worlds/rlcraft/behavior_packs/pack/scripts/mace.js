import { world, EquipmentSlot, system } from "@minecraft/server";

world.afterEvents.entityHurt.subscribe((event) => {
  const damager = event.damageSource.damagingEntity;
  const target = event.hurtEntity;

  // Verifica se o atacante é um jogador
  if (!damager || !damager.isValid() || damager.typeId !== "minecraft:player") return;

  const mainHandItem = damager.getEquipment(EquipmentSlot.Mainhand);
  
  if (mainHandItem && mainHandItem.typeId === "ecbl_bs:mace_pillager_item") {
    const dx = target.location.x - damager.location.x;
    const dz = target.location.z - damager.location.z;
    const mag = Math.sqrt(dx * dx + dz * dz);

    if (mag === 0) return; // Evita divisão por zero

    const nx = dx / mag;
    const nz = dz / mag;

    // Aplica knockback com força horizontal 2.5 e vertical 0.5
    target.applyKnockback(nx, nz, 2.5, 0.5);
  }
});


system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const mainHandItem = player.getEquipment(EquipmentSlot.Mainhand); // Verifica item na mão principal

    if (mainHandItem && mainHandItem.typeId === "ecbl_bs:mace_pillager_item") {

      player.runCommand(`effect @s slowness 1 0 true`);
    }
  }
});