import { addScoreboard, getScoreboard, removeParticipant, setScore, removeScoreboard } from "../Utils";

export class ScoreboardDB {
  constructor(id) {
    this.id = id;
    addScoreboard(id);
    this.sb = getScoreboard(id);
    this.participants = [];
  }

  set(key, value) {
    let displayValue;

    if (value instanceof Map) {
      displayValue = JSON.stringify({
        isMap: true,
        data: Array.from(value.entries()),
      });
    } else if (value instanceof Set) {
      displayValue = JSON.stringify({
        isSet: true,
        data: Array.from(value),
      });
    } else if (value && value.id && value.typeId) {
      displayValue = JSON.stringify({
        isEntity: true,
        id: value.id,
        entityType: value.typeId,
      });
    } else {
      displayValue = JSON.stringify(value);
    }

    const displayName = `${key} = ${displayValue}`;
    const existingParticipant = this.#getParticipant(key);
    if (existingParticipant) removeParticipant(this.id, existingParticipant);

    setScore(this.id, displayName, 0);
  }

  get(key) {
    const participant = this.#getParticipant(key);

    if (!participant) return null;

    const match = participant.displayName.match(/^\s*[\w$]+\s*=\s*(.*)\s*$/);
    // console.warn(JSON.stringify(participant.displayName, null, 0));
    if (match) {
      const valueStr = match[1].trim();
      try {
        const parsedValue = JSON.parse(valueStr);

        if (parsedValue && parsedValue.isMap) {
          return new Map(parsedValue.data);
        } else if (parsedValue && parsedValue.isSet) {
          return new Set(parsedValue.data);
        } else if (parsedValue && parsedValue.isEntity) {
          const entity = world.getEntity(parsedValue.id);
          return entity && entity.typeId === parsedValue.entityType ? entity : null;
        } else {
          return parsedValue;
        }
      } catch {
        return valueStr;
      }
    }
    return null;
  }

  remove(key) {
    const participant = this.#getParticipant(key);
    if (participant) {
      removeParticipant(this.id, participant);
    }
  }

  dispose() {
    removeScoreboard(this.id);
  }

  #getParticipant(key) {
    this.participants = this.sb.getParticipants();

    return this.participants.find((participant) => {
      const displayName = participant.displayName;
      if (typeof displayName !== "string") return false;

      const match = displayName.match(/^\s*([\w$]+)\s*=/);
      const fetchedKey = match ? match[1] : null;
      return fetchedKey === key;
    });
  }
}
