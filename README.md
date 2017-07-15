# Focusapp-cli
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Partysun/focusapp-cli/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/Partysun/focusapp-cli.svg?branch=master)](https://travis-ci.org/Partysun/focusapp-cli)

Focus is the tiny cli pomodoro application
Read more about tech [in wikipedia](https://en.wikipedia.org/wiki/Pomodoro_Technique#Underlying_principles)

## Installation

```bash
npm install -g focusapp-cli
```

## Usage

Run `focus` to start
You can change configuration in ~/.focus.json
Configuration file will create after first launch.

Options: 
- --help, -h
- stats

### Example `shell`

# get stats information
$ focus stats
# start your focus time
$ focus

## Roadmap

- [ ] Stats show count of all tasks 
- [ ] Stats show today tasks
- [ ] Stats show heatmap of tasks of the month
- [ ] Set configaration through the args, not only config file
- [x] Autocomplete tasks title
