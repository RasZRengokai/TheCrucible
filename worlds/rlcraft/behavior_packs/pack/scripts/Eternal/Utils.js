import { afterEvents, beforeEvents, world, overworld, nether, end, scoreboard } from "./Constants";
import { Entity, Dimension, ScriptEventSource } from "@minecraft/server";
import { RunInterval, RunTimeOut, Vector3, CommandResult } from "./Classes";

const entityRunCommand = Entity.prototype.runCommand;
const dimensionRunCommand = Dimension.prototype.runCommand;
const entityRunCommandAsync = Entity.prototype.runCommandAsync;
const dimensionRunCommandAsync = Dimension.prototype.runCommandAsync;

export function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function generateUUIDv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function idTranslate(id) {
  return id
    .split(":")[1]
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function forceSpawn(dimension, id, location, teleportOptions) {
  return new Promise((resolve, reject) => {
    const ec = runInterval(() => {
      const entity = dimension.spawnEntity(id, location);

      if (entity) {
        entity.teleport(location, teleportOptions);
        ec.dispose();
        resolve(entity);
      }
    });
  });
}

export function runCommand(source, ...commands) {
  const result = new CommandResult();

  const flattenedCommands = commands.flat();

  flattenedCommands.forEach((command) => {
    if (source === Entity) {
      const cr = entityRunCommand.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    } else if (source === Dimension) {
      const cr = dimensionRunCommand.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    }
  });
  return result;
}

export async function runCommandAsync(source, ...commands) {
  const result = new CommandResult();

  const flattenedCommands = commands.flat();

  const commandPromises = flattenedCommands.map(async (command) => {
    if (source === Entity) {
      try {
        const cr = await entityRunCommandAsync.call(this, command);
        if (cr.successCount > 0) {
          result.successCount++;
        }
      } catch (error) {}
    } else if (source === Dimension) {
      const cr = await dimensionRunCommandAsync.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    }
  });

  await Promise.all(commandPromises);

  return result;
}

export function fetchAllEntities(selectorList) {
  let entities = new Set([]);
  selectorList.forEach((selector) => {
    overworld.getEntities(selector).forEach((entity) => {
      entities.add(entity);
    });
    nether.getEntities(selector).forEach((entity) => {
      entities.add(entity);
    });
    end.getEntities(selector).forEach((entity) => {
      entities.add(entity);
    });
  });
  return entities;
}
export function ForbidSpawn(selectorList) {
  runInterval(() => {
    let entities = fetchAllEntities(selectorList);

    for (let entity of entities) {
      try {
        entity.remove();
      } catch (error) {}
    }
  });
}

export function runInterval(callback, interval) {
  return new RunInterval(callback, interval);
}

export function runTimeout(callback, timeOut) {
  return new RunTimeOut(callback, timeOut);
}

export function getScoreboard(id) {
  return scoreboard.getObjective(id);
}

export function addScoreboard(id, displayName) {
  const isObjectiveExist = getScoreboard(id);
  if (isObjectiveExist) return;

  if (!displayName) displayName = id;
  scoreboard.addObjective(id, displayName);
}

export function removeScoreboard(id) {
  scoreboard.removeObjective(id);
}

export function addScore(id, participant, score) {
  getScoreboard(id).addScore(participant, score);
}

export function getScore(id, participant) {
  return getScoreboard(id).getScore(participant);
}

export function setScore(id, participant, score) {
  getScoreboard(id).setScore(participant, score);
}

export function removeParticipant(id, participant) {
  return getScoreboard(id).removeParticipant(participant);
}

export function removeAllParticipant(id) {
  const scoreboard = getScoreboard(id);
  if (!scoreboard) return;
  for (const participant of scoreboard.getParticipants()) {
    removeParticipant(id, participant);
  }
}

export function display(value, type = "chat") {
  value = JSON.stringify(value, null, 0);
  switch (type) {
    case "chat":
      world.sendMessage(`${value}`);
      break;
    case "error":
      console.error(value);
      break;
    case "log":
      console.log(value);
      break;
    default:
      world.sendMessage(`${value}`);
      break;
  }
}

export function arraysEqual(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (arr1 == null || arr2 == null) return false;
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; ++i) {
    if (typeof arr1[i] === "object" && typeof arr2[i] === "object") {
      if (!objectsEqual(arr1[i], arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function objectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

export function getScriptEventSource(event) {
  switch (event.sourceType) {
    case ScriptEventSource.Block:
      return event.sourceBlock;
    case ScriptEventSource.Entity:
      return event.sourceEntity;
    case ScriptEventSource.NPCDialogue:
      return event.initiator;
    default:
      return;
  }
}

export function onPlayerLoad(callback) {
  afterEvents.playerJoin.subscribe((event) => {
    const sys = runInterval(() => {
      const players = world.getAllPlayers();
      if (players.length > 0) {
        const player = world.getEntity(event.playerId);
        callback(player);
        sys.dispose();
      }
    }, 1);
  });
}

export function onWorldOpen(callback) {
  onPlayerLoad((player) => {
    const players = world.getAllPlayers();
    if (players.length === 1) {
      callback(player);
    }
  });
}

export function onWorldClose(callback) {
  beforeEvents.playerLeave.subscribe((event) => {
    const players = world.getAllPlayers();
    if (players.length === 1) {
      callback(event.player);
    }
  });
}
