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
const TaskModel = require('./task.model.js');

const configpath = `${homedir}/.focus.json`;
const dbpath = `${homedir}/.focus.db`;
const notifier = new Notification({sound: 'Heya'});

usage('./usage.md');

const db = new Datastore({filename: dbpath, autoload: true});
const Task = new TaskModel(db);

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

const report = () => {
  const countToday = Task.count('day');
  const countWeek = Task.count('week');
  const countMonth = Task.count('month');
  Promise.all([countToday, countWeek, countMonth]).then(countes => {
    console.log(`${moment().format('lll')}`);
    console.log('-------------------------------');
    console.log(`Today: ${countes[0]} focuses`);
    console.log(`Week: ${countes[1]} focuses`);
    console.log(`Month: ${countes[2]} focuses`);
  });
};

const listLastTasks = () => {
  Task.list({limit: 10}).then(tasks => {
    if (tasks.length === 0) {
      console.log('0 focuses done yet. You can do it.');
      process.exit();
    }
    const result = tasks.map((task, index) => {
      return `${index + 1}) ${task.title} - ${moment.unix(task.created / 1000).fromNow()}`;
    });
    process.stdout.write(`Last 10 focuses: \n\n${result.join('\n')}`);
    process.exit();
  }).catch(() => {
    console.log('Database error!');
    process.exit();
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
        source: (_, title) => Task.searchTask(title)
      }
    ];

    inquirer.prompt(questions).then(answer => {
      Task.create(answer.task).then(resolve);
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

  if (argv.v || argv.version) {
    console.log(`v${require('./package.json').version}`);
    process.exit();
  } else if (argv._[0] === 'list') {
    listLastTasks();
  } else if (argv._[0] === 'report') {
    report();
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
