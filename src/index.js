//---------------------------------------------------------
// NPM Packages
const express   = require('express')                  // express is our json server
const lowdb     = require('lowdb')                    // lowdb is a lightweight json db
const Adapter   = process.env.version === 'test'
  ? require('lowdb/adapters/Memory')                  // In test mode the db is saved in memory
  : require('lowdb/adapters/FileSync')                // Otherwise write the db to disk

//---------------------------------------------------------
// Constants
const DB_NAME = 'db'
const PORT    = 3000
const VERSION = process.env.VERSION
const ROOT    = `/api/${VERSION}`

//---------------------------------------------------------
// db
// Open the database using the FileSync adapter. Every operation
// in the database will be synchronous.
const db = lowdb( new Adapter(`${DB_NAME}.json`))

// Write some sensible defaults to the database if it is
// empty.
db.defaults({ todos: [] })
  .write()

//---------------------------------------------------------
// app
const app = express()
const api = require('./api')(VERSION)

app.get(`${ROOT}/todos`, api.todos.get.all(db))
app.get(`${ROOT}/todos/filter?`, api.todos.get.filtered(db))
app.get(`${ROOT}/todos/:id`, api.todos.get.byID(db))

app.post(`${ROOT}/todos`, api.todos.post(db))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})