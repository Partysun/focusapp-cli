#!/usr/bin/env node

const jsonfile = require('jsonfile');
const homedir = require('os').homedir();
const configpath = `${homedir}/.focus.json`;
const Pomodoro = require('./pomodoro.js'); 
const Notification = require('node-notifier').Notification;
const inquirer = require('inquirer');
const notifier = new Notification({sound: 'Heya'});

jsonfile.readFile(configpath, function(err, savedConfig) {
  let config = {
    stepsInSet: 4,
    shortRestDuration: 5,
    longRestDuration: 25,
    focusTime: 30,
    sound: true
  }
  if (err) {
    jsonfile.writeFileSync(configpath, config, {spaces: 2}) 
  } else {
    config = Object.assign({}, config, savedConfig);
  }
  launch(config);
})

const ask = () => {
  return new Promise((resolve) => {
    const questions = [
      {
        type: 'input',
        name: 'task',
        message: 'What\'s the task name'
      },
    ];

    inquirer.prompt(questions).then((answers) => {
      //console.log(answers);
      resolve();
    });
  });
}

function launch(config) {
  const pd = new Pomodoro(
    config.focusTime,
    config.stepsInSet,
    config.shortRestDuration,
    config.longRestDuration
  );
  
  ask().then(() => {
    pd.start(); 
  });

  pd.on('stop', (e) => {
    const { state, step } = e.data;
    notifier.notify({
      'title': 'Focus',
      'message': `Stop: ${state}, step ${step}`,
      sound: config.sound ? 'Heya' : false,
      wait: true,
      timeout: 5
    });
    process.stdout.write('\n');
    process.stdout.write(`Stop: ${state}, step ${step}`);
    // If we are focused in prev step, then we should rest immediatly.
    if (state === 'focus') {
      pd.start();
    } else {
      ask().then(() => {
        pd.start(); 
      });
    }
  });

  pd.on('tick', (e) => {
    const { leftTime, state } = e.data;
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
    process.stdout.write(`${state}: ${leftTime}`);
  });
}
