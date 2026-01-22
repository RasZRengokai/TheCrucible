import { world, system } from "@minecraft/server";

// EVENTO: Jogador interage com o bloco (health_statue)
world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  const player = data.player;
  const block = data.block;
  if (block.typeId === "ecbl_bs:health_statue") {

    // Verifica se o jogador está segurando o crystal heart na main hand
    const testForCommand = `testfor @s[hasitem={item=ecbl_bs:crystal_heart,location=slot.weapon.mainhand}]`;
    player.runCommandAsync(testForCommand).then((result) => {
      if (result.successCount > 0) {
        // Verifica quantos boosts o jogador já possui (usando tags que começam com "boost")
        const tags = player.getTags();
        const boostTags = tags.filter(tag => tag.startsWith("boost"));
        const currentBoostCount = boostTags.length;

        if (currentBoostCount < 5) { // Máximo de 5 usos (10 corações extras)
          // Define a nova tag – ela será "boost0" no primeiro uso, "boost1" no segundo, etc.
          const newBoostTag = `boost${currentBoostCount}`;
          // Limpa um crystal heart do jogador
          player.runCommand(`clear @s ecbl_bs:crystal_heart 0 1`);
          // Adiciona a tag nova para o boost
          player.runCommand(`tag @s add ${newBoostTag}`);

          const newCount = currentBoostCount + 1;
          // O protocolo: 1 uso = amplificador 0, 2 usos = amplificador 1, etc.
          const amplifier = newCount - 1;

          // Aplica o efeito health_boost com duração infinita e com particulas ocultas
          player.runCommand(`effect @s health_boost infinite ${amplifier} true`);
          // Aplica o efeito regeneração nível 5 por 10 segundos
          player.runCommand(`effect @s regeneration 10 5 true`);
          // Feedback para o jogador usando actionbar
          player.runCommand(`title @s actionbar §a§oI accept your offer from the bottom of my heart.`);
          player.runCommand(`playsound mob.ecbl_bs.statue.heart_totem @s`);

          // Adiciona os efeitos de partículas na localização da estátua
          const blockLocation = block.location;
          player.runCommand(`particle ecbl_bs:heal_statue ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
          player.runCommand(`particle ecbl_bs:heal_statue_impulse ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
          player.runCommand(`particle ecbl_bs:heal_heart_statue ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
        } else {
          // Se já estiver no máximo, informa o jogador
          player.runCommand(`title @s actionbar §c§oMaximum boost reached!`);
          player.runCommand(`playsound note.bass @s`);
        }
      } else {
        player.runCommand(`title @s actionbar §c§oBring me a crystal heart!`);
        player.runCommand(`playsound mob.ecbl_bs.statue.heart_error @s`);
      }
    });
  }
});

// SISTEMA: Reaplicar o efeito health_boost de forma contínua para todos os jogadores
system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const tags = player.getTags();
    const boostTags = tags.filter(tag => tag.startsWith("boost"));
    if (boostTags.length > 0) {
      // Se o jogador tem, por exemplo, 3 tags, então o efeito terá amplificador 2
      const amplifier = boostTags.length - 1;
      player.runCommand(`effect @s health_boost infinite ${amplifier} true`);
    }
  });
}, 20); // Intervalo de 20 ticks (aproximadamente 1 segundo)

// SISTEMA DE MORTE: Armazena coordenadas e dimensão no momento da morte e remove boosts
let lastDeathCoordinates = {};
let lastDeathDimension = {};

world.afterEvents.entityDie.subscribe((eventData) => {
  const entity = eventData.deadEntity;
  if (entity && entity.typeId === "minecraft:player") {
    const player = entity;
    const dimension = player.dimension.id;
    lastDeathCoordinates[player.name] = {
      x: Math.floor(player.location.x),
      y: Math.floor(player.location.y),
      z: Math.floor(player.location.z)
    };
    lastDeathDimension[player.name] = dimension;

    // Verifica se o jogador tinha boosts antes de resetar
    const tags = player.getTags();
    const boostTags = tags.filter(tag => tag.startsWith("boost"));

    if (boostTags.length > 0) {
      boostTags.forEach((tag) => {
        player.runCommand(`tag @s remove ${tag}`);
      });
      player.runCommand(`title @s actionbar §e§oYour heart boost has been reset.`);
    }
  }
});


world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  const player = data.player;
  const block = data.block;
  if (block.typeId === "ecbl_bs:health_statue") {

    if (!player.hasTag("ecbl_bs_first_time_statue")) {
      system.runTimeout(() => {

        world.sendMessage(`- Search the chests in the structures to find a §o§cCrystal Heart.`);
        player.addTag("ecbl_bs_first_time_statue");
      })

    }
  }
});


world.beforeEvents.worldInitialize.subscribe((event) => {

    event.blockComponentRegistry.registerCustomComponent('ecbl_bs:statue', new Statue())

})

let ticks = 0

class Statue {
  onTick(data) {
    const { x, y, z } = data.block;
    const dim = data.block.dimension;
    //dim.runCommand(`say ${ticks}`);

    ticks++;
    
    if (ticks == 5) {
      dim.runCommand(`playsound mob.ecbl_bs.statue.holy_idle @a[r=10,x=${x},y=${y},z=${z}] ${x} ${y} ${z} 0.5`);
      ticks = 0

    }
  }
}