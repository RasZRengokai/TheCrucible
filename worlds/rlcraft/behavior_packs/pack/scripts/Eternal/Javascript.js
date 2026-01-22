import { Vector3, Vector2 } from "./Classes";

Math.randomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

String.prototype.toVector2 = function () {
  const pattern = this.match(/^(\d+)\s(\d+)$/);
  if (pattern) {
    const x = parseInt(pattern[1]);
    const y = parseInt(pattern[2]);
    return new Vector2(x, y);
  }

  switch (this.toLowerCase()) {
    case "north":
      return new Vector2(0, 180);
    case "east":
      return new Vector2(0, -90);
    case "south":
      return new Vector2(0, 0);
    case "west":
      return new Vector2(0, 90);
    default:
      return;
  }
};

String.prototype.toEQO = function () {
  const options = {};
  const regex = /^@(a|p|r|e|s|initiator)(?:\[(.+)\])?$/;
  const matches = this.match(regex);
  if (matches && matches.length >= 2) {
    const attributes = matches[2] ? matches[2].split(",") : [];
    let excludeFamilies = [];
    let excludeGameModes = [];
    let excludeTags = [];
    let excludeTypes = [];
    let families = [];
    let tags = [];
    options.location = { x: 0, y: 0, z: 0 }; // Initialize location object with default values

    attributes.forEach((attribute) => {
      const [key, value] = attribute.split("=").map((part) => part.trim());
      let trimmedValue = value;

      // Handle values wrapped in quotes
      const quotedMatch = value.match(/^"(.+)"$/);
      if (quotedMatch) {
        trimmedValue = quotedMatch[1]; // Extract the value inside the quotes
      }

      switch (key) {
        case "c":
          options.closest = parseInt(trimmedValue, 10);
          if (["p", "r", "s", "initiator"].includes(matches[1])) {
            options.closest = 1;
          }
          break;
        case "family":
          if (trimmedValue.startsWith("!")) {
            excludeFamilies.push(trimmedValue.replace(/^!/, ""));
            options.excludeFamilies = excludeFamilies;
          } else {
            families.push(trimmedValue);
            options.families = families;
          }
          break;
        case "l":
          options.maxLevel = parseInt(trimmedValue, 10);
          break;
        case "lm":
          options.minLevel = parseInt(trimmedValue, 10);
          break;
        case "m":
          if (trimmedValue.startsWith("!")) {
            excludeGameModes.push(trimmedValue.replace(/^!/, ""));
            options.excludeGameModes = excludeGameModes;
          } else {
            options.gameMode = parseInt(trimmedValue, 10) || trimmedValue;
          }
          break;
        case "name":
          options.name = trimmedValue;
          break;
        case "r":
          options.maxDistance = parseInt(trimmedValue, 10);
          break;
        case "rm":
          options.minDistance = parseInt(trimmedValue, 10);
          break;
        case "rx":
          options.location.x = parseInt(trimmedValue, 10);
          break;
        case "rxm":
          options.minHorizontalRotation = parseInt(trimmedValue, 10);
          break;
        case "ry":
          options.location.y = parseInt(trimmedValue, 10);
          break;
        case "rym":
          options.minVerticalRotation = parseInt(trimmedValue, 10);
          break;
        case "tag":
          if (trimmedValue.startsWith("!")) {
            excludeTags.push(trimmedValue.replace(/^!/, ""));
            options.excludeTags = excludeTags;
          } else {
            tags.push(trimmedValue);
            options.tags = tags;
          }
          break;
        case "type":
          if (trimmedValue.startsWith("!")) {
            excludeTypes.push(trimmedValue.replace(/^!/, ""));
            options.excludeTypes = excludeTypes;
          } else {
            options.type = trimmedValue;
          }
          if (["a", "p", "r", "s", "initiator"].includes(matches[1])) {
            options.type = "minecraft:player";
          }
          break;
        case "x":
          options.location.x = parseInt(trimmedValue, 10);
          break;
        case "y":
          options.location.y = parseInt(trimmedValue, 10);
          break;
        case "z":
          options.location.z = parseInt(trimmedValue, 10);
          break;
        default:
          console.warn(`'${key}' cannot be converted to EntityQueryOptions property.`);
          break;
      }
    });

    if (["a", "p", "r", "s", "initiator"].includes(matches[1])) {
      options.type = "minecraft:player";
      if (matches[1] !== "a") {
        options.closest = 1;
      }
    }

    return options;
  } else {
    return console.error(`"${this}" is not a valid selector.`);
  }
};

String.prototype.toVector3 = function () {
  const coordinates = this.split(" ").map(parseFloat);
  if (coordinates.some(isNaN) || coordinates.length !== 3)
    return console.error('Invalid string format. It should be "x y z"');
  return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
};

Map.prototype.display = function () {
  this.forEach((value, key) => {
    console.warn(`${key}, ${JSON.stringify(value)}`);
  });
};
