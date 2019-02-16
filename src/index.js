//---------------------------------------------------------
// NPM Packages
const express     = require('express')              // express is our json server
const bodyParser  = require('body-parser')          // express middleware for parsing json bodies
const cors        = require('cors')                 // allows cross origin requests
const shortid     = require('shortid')              // UUID generator
const lowdb       = require('lowdb')                // lowdb is a lightweight json db
const Adapter     = process.env.VERSION === 'test'
  ? require('lowdb/adapters/Memory')                // In test mode the db is saved in memory
  : require('lowdb/adapters/FileSync')              // Otherwise write the db to disk
const Todo        = require('./api/todo.js')

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

// Generate some servicable defaults if we're running the test
// version of the api. Otherwise initalise an empty database
// if one does not already exist.
// .defaults does *not* overwrite data in an existing database.
VERSION !== 'test'
  ? db.defaults({ todos: [] }).write()
  : db.defaults({
    todos: [ Todo.mock(), Todo.mock(), Todo.mock(), Todo.mock() ]
  }).write()

//---------------------------------------------------------
const app = express()
// Parse 'application/json' request bodies as native json
app.use(bodyParser.json())  
// Allow cross origin requests in dev mode
if (VERSION === 'dev') app.use(cors())
// Passing in VERSION lets the api module decide what version
// of the api to expose. This is useful as a mock api for client
// testing may not need to be the same as the api exposed in
// production.  
const api = require('./api')(VERSION)

// Handle GET requests
app.get( `${ROOT}/todos`, api.todos.get.all(db) )
app.get( `${ROOT}/todos/filter?`, api.todos.get.filtered(db) )
app.get( `${ROOT}/todos/:id`, api.todos.get.byID(db) )
// Handle POST requests
app.post( `${ROOT}/todos`, api.todos.post.create(db) )
app.post( `${ROOT}/todos/:id`, api.todos.post.update(db) )

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})