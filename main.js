#!/usr/bin/env node

const homedir = require('os').homedir();
const jsonfile = require('jsonfile');
const Notification = require('node-notifier').Notification;
const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const Datastore = require('nedb');
const moment = require('moment');
const usage = require('cli-usage');
const argv = require('minimist')(process.argv.slice(2));
const Pomodoro = require('./pomodoro.js');

const configpath = `${homedir}/.focus.json`;
const dbpath = `${homedir}/.focus.db`;
const notifier = new Notification({sound: 'Heya'});

usage('./usage.md');

const db = new Datastore({filename: dbpath, autoload: true});

jsonfile.readFile(configpath, (err, savedConfig) => {
  let config = {
    stepsInSet: 4,
    shortRestDuration: 5,
    longRestDuration: 25,
    focusTime: 30,
    sound: true
  };
  if (err) {
    jsonfile.writeFileSync(configpath, config, {spaces: 2});
  } else {
    config = Object.assign({}, config, savedConfig);
  }
  launch(config);
});

const stats = () => {
  const start = moment().startOf('day').unix() * 1000;
  db.find({
    created: {
      $gte: start
    }
  }, (err, docs) => {
    if (err) {
      console.log('App crushes with the database error!');
    }
    console.log(`Focus times today: ${docs.length}`);
  });
};

const searchTask = (_, input) => {
  return new Promise((resolve, reject) => {
    db.find({title: new RegExp(input)}, (err, docs) => {
      if (err) {
        reject();
      }
      const result = docs.map(task => {
        return task.title;
      }).filter((task, index, tasks) => tasks.indexOf(task) === index);
      if (result.length === 0 && input && input.length > 0) {
        resolve([input]);
      }
      resolve(result);
    });
  });
};

const ask = () => {
  return new Promise(resolve => {
    const questions = [
      {
        type: 'autocomplete',
        name: 'task',
        message: 'Create new task or search',
        pageSize: 3,
        source: searchTask
      }
    ];

    inquirer.prompt(questions).then(answers => {
      db.insert({
        title: answers.task,
        created: Date.now()
      });
      resolve();
    });
  });
};

function launch(config) {
  const pd = new Pomodoro(
    config.focusTime,
    config.stepsInSet,
    config.shortRestDuration,
    config.longRestDuration
  );

  if (argv._[0] === 'report') {
    stats();
  } else {
    ask().then(() => {
      pd.start();
    });
  }

  pd.on('stop', e => {
    const {state, step} = e.data;
    notifier.notify({
      title: 'Focus',
      message: `Stop: ${state}, step ${step}`,
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

  pd.on('tick', e => {
    const {leftTime, state} = e.data;
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
    process.stdout.write(`${state}: ${leftTime}`);
  });
}
