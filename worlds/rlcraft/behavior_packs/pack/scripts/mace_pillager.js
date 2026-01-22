import { world, system } from "@minecraft/server";

world.afterEvents.entityHitEntity.subscribe((data) => {
  const { hitEntity } = data;

  // Verifica se a entidade atingida é o Mace Pillager
  if (hitEntity.typeId === "ecbl_bs:mace_pillager") {

    hitEntity.runCommand("event entity @s ecbl_bs:event_parry_random");

    // Se o Mace Pillager tiver parry, ativa o evento de animação
    if (hitEntity.hasTag("parry")) {
      hitEntity.runCommand("event entity @s ecbl_bs:event_parry_animation");
      hitEntity.runCommand("playsound mob.ecbl_bs.pillager_mace.stunned @a[r=10]");
      hitEntity.runCommand("tag @s remove parry");
    }
  }
});

world.afterEvents.entityHurt.subscribe((event) => {
  const damager = event.damageSource.damagingEntity;
  const target = event.hurtEntity;

  if (damager !== undefined && damager.typeId === "ecbl_bs:mace_pillager") {
    // Calcula a direção baseada nas posições do atacante e da entidade atingida
    const directionX = target.location.x - damager.location.x;
    const directionZ = target.location.z - damager.location.z;

    // Normaliza o vetor para garantir consistência na direção
    const magnitude = Math.sqrt(directionX * directionX + directionZ * directionZ);
    const normalizedX = directionX / magnitude;
    const normalizedZ = directionZ / magnitude;

    // Aplica o knockback para a direção horizontal e um pequeno impulso vertical
    target.applyKnockback(normalizedX, normalizedZ, 5, 0.5); // Adiciona força vertical suave (1)
  }
});

world.afterEvents.entityHitEntity.subscribe((data) => {
  const { damagingEntity, hitEntity } = data;

  if (
    damagingEntity?.typeId === "ecbl_bs:mace_pillager" &&
    hitEntity?.typeId === "minecraft:player"
  ) {
    system.run(() => {
      const healthComponent = hitEntity.getComponent("minecraft:health");
      if (!healthComponent) return;

      const maxHealth = healthComponent.effectiveMax;
      const currentHealth = healthComponent.currentValue;
      const halfHealth = maxHealth / 2;

      if (currentHealth > halfHealth) {
        // Primeiro ataque: reduz para 50%
        healthComponent.setCurrentValue(halfHealth);
      } else {
        // Segundo ataque ou se já estiver abaixo de 50%: mata
        healthComponent.setCurrentValue(0);
      }
    });
  }
});
