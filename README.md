# Focus
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Partysun/focusapp-cli/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/Partysun/focusapp-cli.svg?branch=master)](https://travis-ci.org/Partysun/focusapp-cli)

Focus is the tiny cli pomodoro application. After pomodoro has eaten, your OS
fires the notification. (Mac OS tested). 

Read more about tech [in wikipedia](https://en.wikipedia.org/wiki/Pomodoro_Technique#Underlying_principles)

![Demo](https://github.com/Partysun/focusapp-cli/blob/master/demo.gif)

## Installation

```bash
npm install -g focusapp-cli
```

## Usage

Run `focus` to start. You can change configuration in ~/.focus.json

Configuration file will create after first launch. Configuration path is `~/.focus.js`
Database saves in `~/.focus.db`.

Options:
- --help, -h
- report
- list
- --version, -v

### Example `shell`

```bash
# Report information about today, week and month
$ focus report
# It's time for work!
$ focus
# Get last 10 focuses
$ focus list
```

## Roadmap

- [x] Report show today tasks
- [ ] Report show heatmap of tasks of the month
- [ ] Set configaration through the args, not only config file
- [x] Autocomplete tasks title

## For Developers

Preparing...

1. fork this repo
2. yarn
3. node.js main.js

Run tests `npm test`

Run linting: `npm run lint` or `xo`

Thank you.

## Use inside tmux session

When using focus within a tmux session, Mac OS notifications doesn't work. This can be solved by following the steps described in this comment: https://github.com/julienXX/terminal-notifier/issues/115#issuecomment-104214742
