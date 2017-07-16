const moment = require('moment');

class Task {

  constructor(db) {
    this.db = db;
  }

  /**
   * Create the new task.
   * @param {string} title - Title of the new task.
   * @returns {Promise<Task>}
   */
  create(title) {
    return new Promise((resolve, reject) => {
      this.db.insert({
        title,
        created: Date.now()
      }, (err, newTask) => {
        if (err) {
          reject();
        }
        resolve(newTask);
      });
    });
  }

  /**
   * List tasks in descending order of 'created' timestamp.
   * @param {number} skip - Number of tasks to be skipped.
   * @param {number} limit - Limit number of tasks to be returned.
   * @returns {Promise<Task[]>}
   */
  list({skip = 0, limit = 50} = {}) {
    return new Promise((resolve, reject) => {
      this.db.find({})
      .sort({created: -1})
      .skip(skip)
      .limit(limit)
      .exec((err, tasks) => {
        if (err) {
          reject();
        }
        resolve(tasks);
      });
    });
  }

  count(from = 'day') {
    const start = moment().startOf(from).unix() * 1000;
    return new Promise((resolve, reject) => {
      this.db.count({
        created: {
          $gte: start
        }
      }, (err, count) => {
        if (err) {
          reject();
        }
        resolve(count);
      });
    });
  }

  searchTask(title) {
    return new Promise((resolve, reject) => {
      this.db.find({title: new RegExp(title)}, (err, docs) => {
        if (err) {
          reject();
        }
        const result = docs.map(task => {
          return task.title;
        }).filter((task, index, tasks) => tasks.indexOf(task) === index);
        if (result.length === 0 && title && title.length > 0) {
          resolve([title]);
        }
        resolve(result);
      });
    });
  }

}

module.exports = Task;
