import { world } from "@minecraft/server";

world.afterEvents.entityHurt.subscribe((event) => {

  if (event.damageSource.damagingEntity !== undefined && event.damageSource.damagingEntity.typeId == "ecbl_bs:mummy") {
    event.hurtEntity.runCommand(`effect @s weakness 30 0 false`)
  }
})


