const shortid = require('shortid')
const { 
  OK, 
  CREATED,
  BAD_REQUEST, 
  NOT_FOUND } = require('../status.js')
const Todo    = require('../todo.js')

module.exports = {
  get: {
    // GET all todos in the database.
    all: db => (_, res) => {
      const todos = db.get('todos')
        .value()  // It is important to end all db queries with either .value()
                  // or .write() otherwise you won't get the data you were expecting!!

      // Chain methods to set the response status code
      // and then fire a response with the todos json as
      // the body. 
      // It's important to call .json() last as it fires off
      // the response.  
      res.status(OK).json(todos)
    },
    // GET all todos and filter according to some query params.
    filtered: db => (req, res) => {
      const filters = []

      if (req.query.complete === 'true' || req.query.complete === 'false')
        filters.push(x => x.complete === JSON.parse(req.query.complete))
  
      if (req.query.snoozed === 'true' || req.query.complete === 'false')
        filters.push(x => x.snoozed === JSON.parse(req.query.snoozed))

      if (!isNaN( parseInt(req.query.priority )))
        filters.push(x => x.priority === parseInt(req.query.priority))

      const todos = filters
        .reduce((todos, predicate) => todos.filter(predicate), db.get('todos'))
        .value()

      todos.length > 0
        ? res.status(200).json(todos)
        : res.status(404).json(todos)
    },
    // GET a specific todo by id
    // In practice this isn't as useful as the POST counterpart.
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
    // 
    create: db => (req, res) => {
      // Return early if the request has no body.
      if (!req.body)
        return res.sendStatus(BAD_REQUEST)

      // Validate the request body to check it has
      // the required fields and types.
      if (!Todo.validateRequired(req.body)) {
        return res.sendStatus(BAD_REQUEST)
      }

      const todo = Todo.create(req.body)

      db.get('todos').push(todo).write()

      res.status(CREATED).json(todo)
    },
    //
    update: db => (req, res) => {
      const todo = db.get('todos')
        .find({ id: req.params.id })
        .value()

      // Return early if the todo wasn't found.
      // We can't update what doesn't exist!
      if (!todo)
        return res.sendStatus(NOT_FOUND)

      // Return early if the request has no body.
      if (!req.body)
        return res.sendStatus(BAD_REQUEST)

      // Validate the request body to check it has
      // the required fields and types.
      if (!Todo.validateComplete(req.body))
        return res.sendStatus(BAD_REQUEST)

      // Iterate over each key in the existing *todo* and update its
      // value according to corresponding value in the request body. If
      // the body doesn't have that particular key, just fall back to the
      // existing todo data.
      // This is a bad idea(tm) as important keys such as ID and date created
      // can be overwritten. This should be handled better in production!!
      const updatedTodo = {}
      for (const key in todo) {
        updatedTodo[key] = req.body.hasOwnProperty(key)
          ? req.body[key]
          : todo[key]
      }

      // Validation check to ensure no static fields such as ID or date created
      // were overwritten.
      if (!Todo.validateUpdate(updatedTodo, todo))
        return res.sendStatus(BAD_REQUEST)

      db.get('todos') 
        .find({ id: req.params.id })
        .assign(updatedTodo)
        .write()

      res.status(OK).json(updatedTodo)
    }
  },
  delete: {
    byID: db => (req, res) => {
      if (!db.get('todos').find({ id: req.params.id }).value())
        return res.sendStatus(NOT_FOUND)

      db.get('todos')
        .remove({ id: req.params.id })
        .write()

      res.sendStatus(OK)
    }
  }
}