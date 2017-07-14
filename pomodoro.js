const Emitter = require('emmett');

const STATES = {
  focus: 'focus',
  rest: 'rest'
}

//https://en.wikipedia.org/wiki/Pomodoro_Technique#Underlying_principles
class Promodoro extends Emitter {

  /**
   * Create a Promodoro timer.
   *
   * @param {number} focusTime - The time to focus in minutes.
   */
  constructor(focusTime = 30, stepsInSet = 4, shortRestDuration = 5, longRestDuration = 25) {
    super();

    this.state = STATES.rest;
    // The index of current interval in promodoro tech.
    this.step = 0;
    this.stepsInSet = stepsInSet;
    this.shortRestDuration = shortRestDuration * 60;
    this.longRestDuration = longRestDuration * 60;
    this.focusTime = focusTime * 60;

    this._identity = '[object Promodoro]';
  }

  /**
   * Start the promodoro timer.
   * 
   * @param {function} tick - The tick func is fired every 1 second.
   * @return {promise}
   */
  start() {
    const startTime = Date.now();
    this.state = this.state === STATES.rest ? STATES.focus : STATES.rest;
    this.step = this.step < this.stepsInSet ? this.step + 1 : 0;
    const duration = ((step, state) => {
      if (state === STATES.focus) {
        return this.focusTime; 
      } else {
        return step === 1 ? this.longRestDuration : this.shortRestDuration;
      }
    })(this.step, this.state);

    this.emit('start', {
      duration: duration,
      state: this.state,
      step: this.step
    });
    this.launchTimer(duration, startTime, this.state);
  }

  stop() {
    this.emit('stop', {
      step: this.step,
      state: this.state
    });
  }

  launchTimer(duration, startTimestamp, state) {
    let interval = setInterval((start, state) => {
      const now = Date.now();
      const deltaMS = now - start;
      const delta = Math.floor(deltaMS / 1000);
      const leftTime = duration - delta;

      this.emit('tick', {
        leftTime: this.humanize(leftTime),
        state: state
      });

      if (delta > duration - 1) {
        clearInterval(interval);
        interval = null;
        this.stop();
      }

    }, 1000, startTimestamp, state);
  }

  teardown() {
    this.emit('teardown');
    // Killing event emitter
    this.kill(); 
  }

  /**
   * Seconds are humanized to the readable string.
   *
   * @param {number} time - Any time value in seconds.
   * @return {string} The time string, ex.: '1 min 25 sec'.
   */
  humanize(time) {
    const mins = Math.floor(time / 60);
    const secs = time % 60; 
    return mins + ':' + (secs > 9 ? secs : `0${secs}`);
  }

  /**
   * Overriding the `toString` method for debugging purposes.
   *
   * @return {string} - The promodoro's identity.
   */
  toString() {
    return this._identity; 
  }
   
}

/**
 * Version
 */
Promodoro.VERSION = '0.1.0';

module.exports = Promodoro;
