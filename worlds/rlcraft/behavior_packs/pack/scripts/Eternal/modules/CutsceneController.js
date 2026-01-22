import { world, tps } from "../Constants";
import { Cutscene, Scene, Fade, TimedCommand } from "../Classes";
import { runInterval, runTimeout, test } from "../Utils";

const elytraChallenge = new Cutscene(
  "play_elytraChallenge",
  [
    new Scene("201 -7 336", "201 -6 331", "201 -6 337", 4.0, null),
    new Scene("204 182 346", "204 182 346", "202 177 361", 4.0, new Fade(0.5, 0.5, 0.5)),
    new Scene("221 179 371", "221 179 371", "202 177 361", 4.0, null),
    new Scene("185 164 341", "185 164 341", "202 177 361", 4.0, null),
    new Scene("217 204 338", "224 201 338", "226 202 338", 4.0, new Fade(0.5, 0.5, 0.5)),
  ],
  [
    new TimedCommand(0.05, [
      "title @s title eternal.elytra_challenge.main",
      `execute as @p positioned 201 -7.9 337 run event entity @e[type=ecbl_bc:particle_circle,c=1] e:add-instant_despawn`,
      `teleport @s 201 -8 337 facing 204 -8 337`,
      `particle effect_tp_01`,
      `particle effect_tp_02`,
      `particle effect_tp_03`,
      `particle effect_tp_04`,
      `particle effect_tp_05`,
    ]),
    new TimedCommand(4.5, [
      "gamemode spectator @s",
      "effect @s invisibility 999999 0 true",
      "execute as @s positioned 202 177 361 as @e[type=ecbl_bc:elytra_ring,r=1] run event entity @s e:add-instant_despawn",
      "summon ecbl_bc:elytra_ring 202 177 361",
    ]),
    new TimedCommand(7.1, [`titleraw @s actionbar {"rawtext": [{"translate": "translate.elytra_challenge.text1"}]}`]),
    new TimedCommand(17.25, [`teleport @s 224 201 338 facing 225 201 338`]),
    new TimedCommand(17.5, [
      `replaceitem entity @s slot.armor.chest 0 minecraft:elytra 1 0 {  "item_lock": { "mode": "lock_in_slot" } , "keep_on_death": {} }`,
      `title @s actionbar eternal.`,
      "execute as @s positioned 202 177 361 as @e[type=ecbl_bc:elytra_ring,r=1] run event entity @s e:add-instant_despawn",
      "gamemode default @s",
      "effect @s invisibility 0 0 true",
    ]),
    new TimedCommand(19.75, [
      // Adjust to end - 0.5
      `camera @s fade time 0.5 1.0 0.5`,
    ]),
    new TimedCommand(21.25, [
      // Adjust to end
      `tag @s add elytraChallengeCutsceneFinished`,
    ]),
  ],
  false,
  false
);

const football = new Cutscene(
  "play_football",
  [new Scene("424 -5 212", "419 -4 212", "432 -8 212", 4.0, null)],
  [
    new TimedCommand(0.05, [
      "title @s title eternal.elytra_challenge.main",
      `execute as @p positioned 430 -7.9 212 run event entity @e[type=ecbl_bc:particle_circle,c=1] e:add-instant_despawn`,
      `teleport @s 430 -8 212 facing 431 -8 212`,
      `particle effect_tp_01`,
      `particle effect_tp_02`,
      `particle effect_tp_03`,
      `particle effect_tp_04`,
      `particle effect_tp_05`,
    ]),
    new TimedCommand(3.5, [
      // Adjust to end - 0.5
      `camera @s fade time 0.5 1.0 0.5`,
    ]),
    new TimedCommand(4.0, ["tag @s add footballCutsceneFinished"]),
  ],
  false,
  false
);

const cutscenes = [elytraChallenge, football];
runInterval(() => {
  for (const player of world.getAllPlayers()) {
    cutscenes.forEach((cutscene) => {
      if (player.hasTag(cutscene.trigger_tag)) {
        playCutscene(cutscene, player);
      }
    });
  }
});

function playCutscene(cutscene, player) {
  // Cutscene start
  player.runCommandAsync(
    `tag @s remove ${cutscene.trigger_tag}`,
    `tag @s add in_cutscene`,
    `inputpermission set @s camera disabled`,
    `inputpermission set @s movement disabled`
  );

  const checkpoint = player.getCheckpoint();

  let gamemode = null;
  if (cutscene.is_spectator) {
    gamemode = player.getGamemode();
    player.runCommandAsync(`gamemode spectator @s`);
  }
  if (cutscene.is_invisible) player.runCommandAsync(`effect @s invisibility 999999 0 true`);
  // Play all timed commands
  cutscene.timedCommands.forEach((timedCommand) => {
    player.timedCommand(timedCommand.time, timedCommand.commands);
  });
  // Play all scenes
  let timeline = 0;
  cutscene.scenes.forEach((scene, i) => {
    const fade = scene.fade;
    let fadeInTime = 0;
    if (fade) {
      runTimeout(() => {
        player.runCommandAsync(`camera @s fade time ${fade.fadeIn} ${fade.fadeHold} ${fade.fadeOut}`);
      }, timeline);
      fadeInTime = fade.fadeIn;
    }

    const endTime = scene.duration * tps + fadeInTime * tps + 1;
    runTimeout(() => {
      const cameraOffset = 1.62001;
      let temp;
      temp = scene.start.split(" ");
      temp[1] = parseFloat(temp[1]) + cameraOffset;
      const start = temp.join(" ");

      temp = scene.end.split(" ");
      temp[1] = parseFloat(temp[1]) + cameraOffset;
      const end = temp.join(" ");

      temp = scene.focus.split(" ");
      temp[1] = parseFloat(temp[1]) - 1;
      const focus = temp.join(" ");

      runTimeout(() => {
        player.runCommandAsync(`teleport ${player.name} ${scene.start} facing ${focus}`);
      }, fadeInTime * tps);

      runTimeout(() => {
        player.runCommandAsync(
          `camera @s set minecraft:free pos ${start} facing ${scene.focus}`,
          `camera @s set minecraft:free ease ${scene.duration} ${scene.ease_type} pos ${end} facing ${scene.focus}`
        );
      }, fadeInTime * tps + 1);

      runTimeout(() => {
        player.runCommandAsync(`camera @s clear`);
        if (i === cutscene.scenes.length - 1) {
          // Cutscene complete, do any necessary cleanup
          if (cutscene.is_spectator && gamemode) player.runCommandAsync(`gamemode ${gamemode} @s`);
          if (cutscene.is_invisible) player.runCommandAsync(`effect @s invisibility 0`);

          player.runCommandAsync(
            `tag @s remove in_cutscene`,
            `inputpermission set @s camera enabled`,
            `inputpermission set @s movement enabled`
          );
          checkpoint.return();
        }
      }, endTime);
    }, timeline);

    timeline += endTime;
  });
}
