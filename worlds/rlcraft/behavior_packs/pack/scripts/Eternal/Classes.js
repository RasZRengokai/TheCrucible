import { EquipmentSlot, system, world } from "@minecraft/server";
import {} from "./Server";
import {} from "./Javascript";
import { runInterval, runTimeout } from "./Utils";
import { tps } from "./Constants";

export class CommandResult {
  constructor() {
    this.successCount = 0;
  }
}
export class Fade {
  /**
   * Creates an instance of a Fade.
   * @param {float} fadeIn
   * @param {float} fadeHold
   * @param {float} fadeOut
   */
  constructor(fadeIn, fadeHold, fadeOut) {
    this.fadeIn = fadeIn;
    this.fadeHold = fadeHold;
    this.fadeOut = fadeOut;
  }
}

export class Event {
  constructor() {}
}

export class AfterEvent extends Event {
  constructor() {
    super();
  }
}

export class BeforeEvent extends Event {
  constructor() {
    super();
    this.cancel = false;
  }
}
export class EntityAfterEvent extends AfterEvent {
  constructor(entity) {
    super();
    this.entity = entity;
  }
}
export class EntityOnGroundAfterEvent extends EntityAfterEvent {
  constructor(entity) {
    super(entity);
  }
}
export class PlayerAfterEvent extends AfterEvent {
  constructor(player) {
    super();
    this.player = player;
  }
}
export class EntityJumpAfterEvent extends EntityAfterEvent {
  constructor(entity) {
    super(entity);
  }
}
export class PlayerStartJumpingAfterEvent extends EntityJumpAfterEvent {
  constructor(player) {
    super(player);
  }
}

export class PlayerStopJumpingAfterEvent extends EntityJumpAfterEvent {
  constructor(player) {
    super(player);
  }
}
export class PlayerOnAirJumpAfterEvent extends EntityJumpAfterEvent {
  constructor(player) {
    super(player);
  }
}

export class PlayerOnLandAfterEvent extends PlayerAfterEvent {
  constructor(player) {
    super(player);
  }
}

export class ItemAfterEvent extends PlayerAfterEvent {
  constructor(player, itemStack) {
    super(player);
    this.itemStack = itemStack;
  }
}
export class PlayerOnEquipAfterEvent extends ItemAfterEvent {
  constructor(player, itemStack, equipmentSlot) {
    super(player, itemStack);
    this.equipmentSlot = equipmentSlot;
  }
}

export class PlayerOnUnequipAfterEvent extends PlayerOnEquipAfterEvent {
  constructor(player, itemStack, equipmentSlot) {
    super(player, itemStack, equipmentSlot);
  }
}

export class EventSignal {
  constructor() {
    this._events = new Map();
    this._process = null;
    this._isDisposed = false;
  }
  subscribe(cb) {
    const process = () => {
      this._run(cb);

      if (!this._isDisposed) this._process = system.run(process);
    };
    this._process = system.run(process);
  }
  unsubscribe() {
    this._isDisposed = true;
    system.clearRun(this._process);
  }
}

export class EntityEventSignal extends EventSignal {
  constructor() {
    super();
    this._entityIds = new Set();
  }
}

export class EntityItemEventSignal extends EntityEventSignal {
  constructor() {
    super();
    this._items = new Set();
  }
}

export class EntityJumpAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isJumping && !entity.isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (entity.isOnGround && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityStartJumpingAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isJumping && !entity.isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (!entity.isJumping && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityStopJumpingAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isJumping && !entity.isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
      } else if (!entity.isJumping && this._entityIds.has(entity.id)) {
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
        this._events.delete(entity.id);
        this._entityIds.delete(entity.id);
      }
    }
  }
}

export class PlayerOnAirJumpAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
    this._onAir = new Set();
  }

  _run(cb) {
    for (const player of world.players) {
      if (!player.isJumping && !player.isOnGround) {
        if (this._onAir.has(player.id)) {
          this._entityIds.add(player.id);
        } else this._onAir.add(player.id);
      } else if (
        player.isJumping &&
        !player.isOnGround &&
        this._entityIds.has(player.id) &&
        !this._events.has(player.id)
      ) {
        this._events.set(player.id, new PlayerOnAirJumpAfterEvent(player));
        cb(this._events.get(player.id));
      } else {
        this._events.delete(player.id);
        this._entityIds.delete(player.id);
        this._onAir.delete(player.id);
      }
    }
  }
}

export class PlayerOnEquipAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
    this._previousEquipments = new Map();
  }

  _run(cb) {
    for (const player of world.players) {
      let slots = Object.values(EquipmentSlot);
      const currentEquipments = new Map();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currentEquipments.set(slot, item);
      }

      const previousEquipments = this._previousEquipments.get(player.id) || currentEquipments;
      for (const [slot, itemStack] of currentEquipments) {
        const prevItemStack = previousEquipments.get(slot);
        if (!itemStack.compare(prevItemStack) && !this._entityIds.has(player.id)) {
          this._entityIds.add(player.id);
          this._events.set(player.id, new PlayerOnEquipAfterEvent(player, itemStack, slot));
          cb(this._events.get(player.id));
        } else if (itemStack.compare(prevItemStack) && this._entityIds.has(player.id)) {
          this._events.delete(player.id);
          this._entityIds.delete(player.id);
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class PlayerOnUnequipAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
    this._previousEquipments = new Map();
  }

  _run(cb) {
    for (const player of world.players) {
      let slots = Object.values(EquipmentSlot);
      const currentEquipments = new Map();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        currentEquipments.set(slot, item);
      }

      const previousEquipments = this._previousEquipments.get(player.id) || currentEquipments;
      for (const [slot, itemStack] of currentEquipments) {
        const prevItemStack = previousEquipments.get(slot);
        if (prevItemStack) {
          if (!prevItemStack.compare(itemStack) && !this._entityIds.has(player.id)) {
            this._entityIds.add(player.id);
            this._events.set(player.id, new PlayerOnUnequipAfterEvent(player, prevItemStack, slot));
            cb(this._events.get(player.id));
          } else if (prevItemStack.compare(itemStack) && this._entityIds.has(player.id)) {
            this._events.delete(player.id);
            this._entityIds.delete(player.id);
          }
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class PlayerOnLandAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  _run(cb) {
    for (const player of world.players) {
      if (!player.isOnGround && !this._entityIds.has(player.id)) {
        this._entityIds.add(player.id);
      } else if (player.isOnGround && this._entityIds.has(player.id)) {
        this._events.set(player.id, new PlayerOnLandAfterEvent(player));
        cb(this._events.get(player.id));
        this._events.delete(player.id);
        this._entityIds.delete(player.id);
      }
    }
  }
}

export class Scene {
  /**
   * Creates an instance of Scene.
   * @param {string} start - starting position and rotation. <x y z>
   * @param {string} end - ending position and rotation <x y z>.
   * @param {string} focus - the subject of which the scene will focus on. <x y z|selector>
   * @param {float} duration
   * @param {enum} [ease_type = 'linear']
   */
  constructor(start, end, focus, duration, fade, ease_type = "linear") {
    this.start = start;
    this.end = end;
    this.focus = focus;
    this.duration = duration;
    this.fade = fade;
    this.ease_type = ease_type;
  }
}
export class Cutscene {
  /**
   * Creates an instance of Cutscene.
   * @param {string} trigger_tag - Tag that starts the cutscene.
   * @param {Scene[]} scenes - Scenes to play in order.
   * @param {TimedCommand[]} timedCommands - Commands to play along the cutscene.
   * @param {bool} [is_spectator = true] - Define if cutscene should be played in spectator mode.
   * @param {bool} [is_invisible = true] - Define if cutscene should hide the player while playing.
   */
  constructor(trigger_tag, scenes, timedCommands, is_spectator = true, is_invisible = true) {
    this.trigger_tag = trigger_tag;
    this.scenes = scenes;
    this.timedCommands = timedCommands;
    this.is_spectator = is_spectator;
    this.is_invisible = is_invisible;
  }
}

export class Run {
  constructor() {
    this._process = null;
  }
  dispose() {
    system.clearRun(this._process);
  }
}
export class RunInterval extends Run {
  constructor(cb, interval) {
    super();
    this._process = system.runInterval(cb, interval);
  }
}

export class RunTimeOut extends Run {
  constructor(cb, timeOut) {
    super();
    this._process = system.runTimeout(cb, timeOut);
  }
}

export class Vector2 {
  constructor(x, y) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      this.x = x.x;
      this._y = x.y;
      this.z = x.z !== undefined ? x.z : x.y; // Initialize z if provided, otherwise use y
    } else {
      this.x = x;
      this._y = y;
      this.z = y;
    }
  }

  set y(value) {
    this._y = value;
    this.z = value;
  }

  get y() {
    return this._y;
  }
  toString() {
    return `${this.x} ${this.y}`;
  }

  offset(x, y) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      return new Vector2(this.x + x.x, this.y + x.y);
    }
    return new Vector2(this.x + x, this.y + y);
  }

  check(x, y) {
    return this.x === x && this.y === y;
  }
}

export class Vector3 extends Vector2 {
  constructor(x, y, z) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      super(x.x, x.y);
      this.z = x.z !== undefined ? x.z : x.y; // Initialize z if provided, otherwise use y
    } else {
      super(x, y);
      this.z = z;
    }
  }

  offset(x, y, z) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      return new Vector3(this.x + x.x, this.y + x.y, this.z + (x.z !== undefined ? x.z : x.y));
    }
    return new Vector3(this.x + x, this.y + y, this.z + z);
  }

  check(x, y, z) {
    return this.x === x && this.y === y && this.z === z;
  }

  toVector2() {
    return new Vector2(this.x, this.y);
  }

  toString() {
    return `${this.x} ${this.y} ${this.z}`;
  }

  belowCenter() {
    const x = this._roundToNearestHalf(this.x);
    const y = this.y;
    const z = this._roundToNearestHalf(this.z);
    return new Vector3(x, y, z);
  }

  center() {
    const x = this._roundToNearestHalf(this.x);
    const y = this._roundToNearestHalf(this.y);
    const z = this._roundToNearestHalf(this.z);
    return new Vector3(x, y, z);
  }

  sizeCenter() {
    const x = Math.floor(this.x / 2);
    const y = Math.floor(this.z / 2);
    const z = Math.floor(this.z / 2);
    return new Vector3(x, y, z);
  }

  sizeBelowCenter() {
    const x = Math.floor(this.x / 2);
    const y = 0;
    const z = Math.floor(this.z / 2);
    return new Vector3(x, y, z);
  }

  _roundToNearestHalf(value) {
    return Math.round(value * 2) / 2;
  }
}

export class Music {
  /**
   * Creates an instance of Music.
   * @param {string} track - Identifier of the sound/music defined in the 'sound_definitions.json'.
   * @param {string} tag - tag of players to play the music.
   * @param {number} duration - Duration of the sound/music in seconds.
   * @param {Vector3} [origin=new Vector3()] - Origin coordinates of the selector.
   * @param {number} [volume=1] - Volume of the sound/music.
   * @param {number} [pitch=1] - Pitch of the sound/music.
   */
  constructor(track, tag, duration, origin = new Vector3(), volume = 1, pitch = 1) {
    this.track = track;
    this.tag = tag;
    this.duration = duration;
    this.durationTick = duration * tps;
    this.origin = origin;
    this.volume = volume;
    this.pitch = pitch;
  }
}

export class TimedCommand {
  constructor(time, commands) {
    this.time = time;
    this.timeTick = time * tps;
    this.commands = commands;
  }
}

export class CountDownTimer {
  constructor(durationInSeconds = 10, onEnd = () => {}, onUpdate = () => {}) {
    this.timer = durationInSeconds;
    this.process = runInterval(() => {
      this.minutes = Math.floor(this.timer / 60);
      this.seconds = this.timer % 60;

      // Add leading zero to seconds if less than 10
      this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;

      // Display
      onUpdate(this.minutes, this.seconds);

      // Check if the timer has reached 0
      if (--this.timer < -1) {
        onEnd();
        this.process.dispose();
        return;
      }
    }, 20);
  }
  dispose() {
    this.process.dispose();
  }
}
