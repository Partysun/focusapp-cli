const Pomodoro = require('./../pomodoro.js');

jest.useFakeTimers();

describe('Pomodoro should works', () => {

  test('config works', () => {
    const pom = new Pomodoro(1);
    expect(pom.focusTime).toBe(60);
    const pom2 = new Pomodoro(45);
    expect(pom2.focusTime).toBe(45 * 60);
    expect(pom2.stepsInSet).toBe(4);
  });

  test('calls the tick handler 2 times after 2 second', () => {
    const pom = new Pomodoro(1);
    const handler = jest.fn();
    pom.start();
    pom.on('tick', handler);

    expect(handler).not.toBeCalled();
    jest.runTimersToTime(2100);
    expect(handler).toBeCalled();
    expect(handler.mock.calls.length).toBe(2);
  });

  test('calls the stop handler', () => {
    const pom = new Pomodoro(1);
    const handler = jest.fn();
    pom.start();
    pom.on('stop', handler);

    expect(handler).not.toBeCalled();
    pom.stop();
    expect(handler).toBeCalled();
  });

  test('humanize should format seconds to string 00:00', () => {
    const pom = new Pomodoro(1);
    const time = pom.humanize(72);
    expect(time).toBe('1:12');
    const time2 = pom.humanize(0);
    expect(time2).toBe('0:00');
    const time3 = pom.humanize(-1);
    expect(time3).toBe('0:00');
  })

  test('the sequence of rests (short and long) should works', () => {
    const pom = new Pomodoro(3, 2, 1, 2);

    const nextStep = (pom) => {
      pom.start();
      pom.stop();
    }

    nextStep(pom);
    expect(pom.state).toBe('focus');
    nextStep(pom);
    expect(pom.state).toBe('rest');
    expect(pom.calcDuration()).toBe(60);
    expect(pom.step).toBe(1);
    nextStep(pom);
    expect(pom.state).toBe('focus');
    expect(pom.calcDuration()).toBe(60 * 3);
    nextStep(pom);
    expect(pom.state).toBe('rest');
    expect(pom.calcDuration()).toBe(120);
    expect(pom.step).toBe(2);
    nextStep(pom);
    expect(pom.state).toBe('focus');
    nextStep(pom);
    expect(pom.state).toBe('rest');
    expect(pom.calcDuration()).toBe(60);
    expect(pom.step).toBe(1);
    nextStep(pom);
    expect(pom.state).toBe('focus');
    expect(pom.calcDuration()).toBe(60 * 3);
    nextStep(pom);
    expect(pom.state).toBe('rest');
    expect(pom.calcDuration()).toBe(120);
    expect(pom.step).toBe(2);
    nextStep(pom);
    nextStep(pom);
    nextStep(pom);
    nextStep(pom);
    expect(pom.state).toBe('rest');
    expect(pom.calcDuration()).toBe(120);
  });

});
