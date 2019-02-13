const shortid = require('shortid')
const { 
  OK, 
  CREATED,
  BAD_REQUEST, 
  NOT_FOUND } = require('../status.js')

module.exports = {
  get: {
    all: db => (_, res) => {
      const todos = db.get('todos')
        .value()

      res.status(OK).json(todos)
    },
    //
    filtered: db => (req, res) => {
      res.json(`This is all the todos filtered by: ${Object.keys(req.query)}`)
    },
    //
    byID : db => (req, res) => {
      const todo = db.get('todos')
        .find({ id: req.params.id })
        .value()

      todo == undefined
        ? res.status(NOT_FOUND).json({})
        : res.status(OK).json(todo)
    }
  },
  post: {
    create: db => (req, res) => {
      if (!req.body)
        return res.sendStatus(BAD_REQUEST)

      const todo = {
        id          : shortid.generate(),
        title       : req.body.title || '',
        description : req.body.description || '',
        priority    : req.body.priority || 0,
        snoozed     : req.body.snoozed || false,
        complete    : req.body.complete || false
      }

      db.get('todos').push(todo).write()

      res.status(CREATED).json(todo)
    },
    //
    update: db => (req, res) => {
      const todo = db.get('todos')
        .find({ id: req.params.id })
        .value()

      if (!todo)
        return res.sendStatus(NOT_FOUND)

      for (const key in todo) {
        todo[key] = req.body[key] || todo[key]
      }

      db.get('todos') 
        .find({ id: req.params.id })
        .assign(todo)
        .write()

      res.status(OK).json(todo)
    }
  }
}