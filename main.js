#!/usr/bin/env node

const jsonfile = require('jsonfile');
const homedir = require('os').homedir();
const configpath = `${homedir}/.focus.json`;
const Pomodoro = require('./pomodoro.js'); 
const Notification = require('node-notifier').Notification;
const inquirer = require('inquirer');
const notifier = new Notification({sound: 'Heya'});
const Datastore = require('nedb');
const moment = require('moment');
const usage = require('cli-usage');
const argv = require('minimist')(process.argv.slice(2));

usage('./usage.md');

db = new Datastore({ filename: './db', autoload: true });

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

const stats = () => {
  const start = moment().startOf('day').unix() * 1000;  
  db.find({
    created: {
      $gte:start,
    }
  }, (err, docs) => {
    console.log(`Focus times today: ${docs.length}`); 
  });
}

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
      db.insert({
        title: answers.task,
        created: Date.now()
      });
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

  if (argv['_'][0] === 'stats') {
    stats(); 
    return;
  } else {
    ask().then(() => {
      pd.start(); 
    });
  }

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
