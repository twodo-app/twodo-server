//---------------------------------------------------------
// NPM Packages
const express     = require('express')              // express is our json server
const bodyParser  = require('body-parser')          // express middleware for parsing json bodies
const shortid     = require('shortid')              // UUID generator
const lowdb       = require('lowdb')                // lowdb is a lightweight json db
const Adapter     = process.env.VERSION === 'test'
  ? require('lowdb/adapters/Memory')                // In test mode the db is saved in memory
  : require('lowdb/adapters/FileSync')              // Otherwise write the db to disk

//---------------------------------------------------------
// Constants
const DB_NAME = 'db'
const PORT    = process.env.PORT || 3000
const VERSION = process.env.VERSION
const ROOT    = `/api/${VERSION}`

//---------------------------------------------------------
// db
// Open the database using the FileSync adapter. Every operation
// in the database will be synchronous.
const db = lowdb( new Adapter(`${DB_NAME}.json`))

VERSION !== 'test'
  ? db.defaults({ todos: [] }).write()
  : db.defaults({
    todos: [
      { id: shortid.generate(), title: 'Do a twodoo', description: '', priority: 4, snoozed: false, complete: false },
      { id: shortid.generate(), title: 'Do a mewtwo', description: '', priority: 2, snoozed: false, complete: false },
      { id: shortid.generate(), title: 'Do a poopoo', description: '', priority: 3, snoozed: false, complete: false },
      { id: shortid.generate(), title: 'Do a bamboo', description: '', priority: 0, snoozed: false, complete: false }
    ]
  }).write()

//---------------------------------------------------------
// app
const app = express()
      app.use(bodyParser.json())  

const api = require('./api')(VERSION)


app.get(`${ROOT}/todos`, api.todos.get.all(db))
app.get(`${ROOT}/todos/filter?`, api.todos.get.filtered(db))
app.get(`${ROOT}/todos/:id`, api.todos.get.byID(db))

app.post(`${ROOT}/todos`, api.todos.post.create(db))
app.post(`${ROOT}/todos/:id`, api.todos.post.update(db))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})