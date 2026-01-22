import { world } from "../Constants";
import { display } from "../Utils";

const displayType = "chat";

export class WorldDB {
  constructor(name) {
    if (typeof name !== "string") throw new TypeError("Database name must be a string");

    this.name = name;
    this.propertyIds = [];

    const worldPropertiesIds = world.getDynamicPropertyIds();
    if (worldPropertiesIds) {
      worldPropertiesIds.forEach((id) => {
        const [name] = id.split(":");
        if (name === this.name) this.propertyIds.push(id);
      });
    }
  }

  static serializeEntities(entities) {
    return entities.map((entity) => ({
      id: entity.id,
      entityType: entity.typeId,
    }));
  }

  static deserializeEntities(serializedEntities) {
    return serializedEntities
      .map((data) => {
        const entity = world.getEntity(data.id);
        if (entity) return entity;
        return undefined;
      })
      .filter((entity) => entity !== undefined);
  }

  set(key, value) {
    const id = `${this.name}:${key}`;

    if (Array.isArray(value)) {
      const serializedArray = value.map((item) =>
        item && item.id && item.typeId ? { isEntity: true, ...WorldDB.serializeEntities([item])[0] } : item
      );
      world.setDynamicProperty(id, JSON.stringify(serializedArray));
    } else if (value instanceof Map) {
      const mapObject = {
        isMap: true,
        data: Array.from(value.entries()).map(([k, v]) =>
          v && v.id && v.typeId ? [k, { isEntity: true, ...WorldDB.serializeEntities([v])[0] }] : [k, v]
        ),
      };
      world.setDynamicProperty(id, JSON.stringify(mapObject));
    } else if (value instanceof Set) {
      const setObject = {
        isSet: true,
        data: Array.from(value).map((v) =>
          v && v.id && v.typeId ? { isEntity: true, ...WorldDB.serializeEntities([v])[0] } : v
        ),
      };
      world.setDynamicProperty(id, JSON.stringify(setObject));
    } else {
      world.setDynamicProperty(id, JSON.stringify(value));
    }

    if (!this.propertyIds.includes(id)) this.propertyIds.push(id);
  }

  get(key) {
    const id = `${this.name}:${key}`;
    const value = world.getDynamicProperty(id);

    if (value !== undefined) {
      const parsedValue = JSON.parse(value);

      if (Array.isArray(parsedValue)) {
        return parsedValue.map((item) => (item && item.isEntity ? WorldDB.deserializeEntities([item])[0] : item));
      }

      if (parsedValue && parsedValue.isMap) {
        const map = new Map();
        parsedValue.data.forEach(([k, v]) => map.set(k, v && v.isEntity ? WorldDB.deserializeEntities([v])[0] : v));
        return map;
      }

      if (parsedValue && parsedValue.isSet) {
        const set = new Set();
        parsedValue.data.forEach((v) => set.add(v && v.isEntity ? WorldDB.deserializeEntities([v])[0] : v));
        return set;
      }

      return parsedValue;
    }

    return undefined;
  }

  display(key) {
    const id = `${this.name}:${key}`;
    const value = this.get(key);
    display(`${id} = ${JSON.stringify(value)}`, displayType);
  }

  remove(key) {
    const id = `${this.name}:${key}`;
    const index = this.propertyIds.indexOf(id);

    if (index !== -1) {
      world.setDynamicProperty(id, undefined);
      this.propertyIds.splice(index, 1);
    } else {
      console.log("Property not found");
    }
  }

  displayAll() {
    this.propertyIds.forEach((id) => {
      const key = id.split(":")[1];
      const value = this.get(key);
      display(`${id} = ${JSON.stringify(value)}`, displayType);
    });
  }

  removeAll() {
    this.propertyIds.forEach((id) => {
      world.setDynamicProperty(id, undefined);
    });
    this.propertyIds = [];
  }

  static displayAllProperties() {
    const allPropertyIds = world.getDynamicPropertyIds();
    allPropertyIds.forEach((id) => {
      const value = JSON.parse(world.getDynamicProperty(id));
      display(`${id} = ${JSON.stringify(value)}`, displayType);
    });
  }

  static removeAllProperties() {
    const allPropertyIds = world.getDynamicPropertyIds();
    allPropertyIds.forEach((id) => world.setDynamicProperty(id, undefined));
  }
}
