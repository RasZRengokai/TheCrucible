import { MinecraftDimensionTypes, world as w, system as s, TicksPerSecond } from "@minecraft/server";

export const namespace = "ecbl_bs";
export const ns = namespace;
export const world = w;
export const gamerules = w.gameRules;
export const tps = TicksPerSecond;
export const system = s;
export const afterEvents = w.afterEvents;
export const beforeEvents = w.beforeEvents;
export const scoreboard = w.scoreboard;
export const structureManager = w.structureManager;
export const scriptEvent = s.afterEvents.scriptEventReceive;
export const overworld = w.getDimension(MinecraftDimensionTypes.overworld);
export const nether = w.getDimension(MinecraftDimensionTypes.nether);
export const end = w.getDimension(MinecraftDimensionTypes.theEnd);
export const tileEntry = new Set();
