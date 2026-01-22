/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
import { system, world, Direction } from "@minecraft/server";
import { Vector } from './vector.js';
const bounces = new WeakMap();
function shootCanonBall(source) {
const dimension = source.dimension;
const viewDir = new Vector(source.getViewDirection());
const headLoc = new Vector(source.getHeadLocation());
const ballLoc = headLoc.add(viewDir).add(new Vector(0, 0.1, 0));
const powerMultiplier = 3
const shootVec = viewDir.multiply(new Vector(powerMultiplier, 1, powerMultiplier))
const entity = dimension.spawnEntity("lfg_ff:basket_ball_entity", ballLoc);
entity.setRotation(source.getRotation())
entity.applyImpulse(shootVec)
bounces.set(entity, Math.round(powerMultiplier * 2));
}
system.afterEvents.scriptEventReceive.subscribe((data) => {
const { id, sourceEntity } = data;
if (id === "lfg_ff:basket_ball_on_ground") {
const projectile = sourceEntity;
if (projectile.typeId !== "lfg_ff:basket_ball_entity") return;
const remainingBounces = bounces.get(projectile) ?? 0;
if (remainingBounces <= 0) {
return;
}
if (remainingBounces <= 5) {
projectile.triggerEvent("lfg_ff:pickup_item")
}
applyProjectilePhysics(projectile, remainingBounces - 1);
}
if (id === "lfg_ff:basket_ball_hit_hoop") {
if (!sourceEntity) return;
const velocity = sourceEntity.getVelocity();
const horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
const maxSpeedThreshold = 0.6;
sourceEntity.addTag("lfg_ff:basket_ball_reverse")
const impulse = new Vector(-velocity.x, 0, -velocity.z).normalize().multiply(0.6);
sourceEntity.applyImpulse(impulse);
sourceEntity.dimension.playSound("lfg_ff:basket_ball", sourceEntity.location)
}
if (id === "lfg_ff:basket_ball_hoop_dunk") {
if (!sourceEntity) return;
const balls = sourceEntity.dimension.getEntities({ type: "lfg_ff:basket_ball_entity", location: sourceEntity.location, maxDistance: 1.5 })
for (const ball of balls) {
sourceEntity.playAnimation("animation.lfg_ff.basket_hoop.dunk")
ball.clearVelocity()
ball.addTag('lfg_ff:basket_ball_stop')
}
}
})
function applyProjectilePhysics(projectile, remainingBounces) {
const velocity = projectile.getVelocity();
const viewDir = projectile.getViewDirection();
const horizontalVelocity = Math.sqrt(velocity.x ** 2 + velocity.z ** 2) * 3;
const verticalVelocity = velocity.y * 2;
const reverse = projectile.hasTag("lfg_ff:basket_ball_reverse") ? -1 : 1
const isStoped = projectile.hasTag("lfg_ff:basket_ball_stop") ? 0.5 : 1
projectile.dimension.playSound("lfg_ff:basket_ball", projectile.location)
projectile.applyKnockback(
Vector.multiply(Vector.normalize(viewDir), (remainingBounces / 3) * isStoped * reverse),
(remainingBounces / 7) * isStoped
);
bounces.set(projectile, remainingBounces);
}
function createImpactEffect(projectile) {
projectile.dimension.spawnParticle("minecraft:crop_growth_emitter", projectile.location);
}
world.afterEvents.itemUse.subscribe((e) => {
const { itemStack, source: player } = e
if (player.typeId !== "minecraft:player") return;
if (itemStack.typeId == "lfg_ff:basket_ball_item") {
player.runCommand(`clear @s ${itemStack.typeId} 0 1`)
shootCanonBall(player)
}
})