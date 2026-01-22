import { runInterval } from "../Utils";

class Timer {
  constructor(onTick = () => {}, onComplete = () => {}) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  formatTime(hours, minutes, seconds) {
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${hours > 0 ? formattedHours + ":" : ""}${formattedMinutes}:${formattedSeconds}`;
  }

  dispose() {
    this.counter.dispose();
  }

  end() {
    this.counter.dispose();
    this.onComplete();
  }
}

export class FlexibleTimer extends Timer {
  constructor(durationInSeconds, onTick, onComplete, isCountingUp = false) {
    super(onTick, onComplete);
    this.isCountingUp = isCountingUp;
    this.initialDuration = durationInSeconds;

    if (isCountingUp) {
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    } else {
      this.hours = Math.floor(durationInSeconds / 3600);
      this.minutes = Math.floor((durationInSeconds % 3600) / 60);
      this.seconds = durationInSeconds % 60;
    }
  }

  start() {
    this.counter = runInterval(() => {
      this.onTick(this.formatTime(this.hours, this.minutes, this.seconds));

      if (this.isCountingUp) {
        if (this.seconds === 59) {
          this.seconds = 0;
          if (this.minutes === 59) {
            this.hours++;
            this.minutes = 0;
          } else {
            this.minutes++;
          }
        } else {
          this.seconds++;
        }

        if (this.hours * 3600 + this.minutes * 60 + this.seconds >= this.initialDuration) {
          this.end();
        }
      } else {
        if (this.seconds === 0) {
          if (this.minutes === 0) {
            if (this.hours === 0) {
              this.end();
            } else {
              this.hours--;
              this.minutes = 59;
              this.seconds = 59;
            }
          } else {
            this.minutes--;
            this.seconds = 59;
          }
        } else {
          this.seconds--;
        }
      }
    }, 20);
  }
}

export class TimeTracker extends Timer {
  constructor(onTick, onComplete) {
    super(onTick, onComplete);
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
  }

  start() {
    this.counter = runInterval(() => {
      this.onTick(this.formatTime(this.hours, this.minutes, this.seconds));

      if (this.seconds === 59) {
        this.seconds = 0;
        if (this.minutes === 59) {
          this.hours++;
          this.minutes = 0;
        } else {
          this.minutes++;
        }
      } else {
        this.seconds++;
      }
    }, 20);
  }
}
