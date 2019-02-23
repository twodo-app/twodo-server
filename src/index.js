//---------------------------------------------------------
// NPM Packages
const express     = require('express')                // express is our json server
const bodyParser  = require('body-parser')            // express middleware for parsing json bodies
const cors        = require('cors')                   // allows cross origin requests
const lowdb       = require('lowdb')                  // lowdb is a lightweight json db
const Adapter     = require('lowdb/adapters/Memory')  // In test mode the db is saved in memory
const Todo        = require('./api/todo.js')

//---------------------------------------------------------
// Constants
const DB_NAME = 'db'
const PORT    = process.env.PORT || 3000
const VERSION = process.env.VERSION
const ROOT    = `/api/${VERSION}`

//---------------------------------------------------------
// Open the database using the FileSync adapter. Every operation
// in the database will be synchronous.
const db = lowdb( new Adapter(`${DB_NAME}.json`))

// Generate some servicable defaults if we're running the test
// version of the api. Otherwise initalise an empty database
// if one does not already exist.
// .defaults does *not* overwrite data in an existing database.
VERSION !== 'test'
  ? db.defaults({ todos: [], users: [ 'andy', 'trymunx' ] }).write()
  : db.defaults({
    todos: [ Todo.mock(), Todo.mock(), Todo.mock(), Todo.mock() ]
  }).write()

//---------------------------------------------------------
const app = express()
// Parse 'application/json' request bodies as native json
app.use(bodyParser.json()) 
app.use(cors()) 
// Allow cross origin requests in dev mode
// if (VERSION === 'test') app.use(cors())
// Passing in VERSION lets the api module decide what version
// of the api to expose. This is useful as a mock api for client
// testing may not need to be the same as the api exposed in
// production.  
const api = require('./api')(VERSION)

switch (VERSION) { 
  case 'test':
    // Handle GET requests
    app.get( `${ROOT}/todos`, api.todos.get.all(db) )
    app.get( `${ROOT}/todos/filter?`, api.todos.get.filtered(db) )
    app.get( `${ROOT}/todos/:id`, api.todos.get.byID(db) )
    // Handle POST requests
    app.post( `${ROOT}/todos`, api.todos.post.create(db) )
    app.post( `${ROOT}/todos/:id`, api.todos.post.update(db) )
    // Handle DELETE requests
    app.delete( `${ROOT}/todos/:id`, api.todos.delete.byID(db) )
    break
  case 'v1':
    // Handle GET requests
    app.get( `${ROOT}/user`, api.user.get.newUser(db) )
    app.get( `${ROOT}/todos/:user`, api.todos.get.byUser(db) )
    app.get( `${ROOT}/todos/:user/:id`, api.todos.get.byID(db) )
    app.get( `${ROOT}/todos/:user/filter?`, api.todos.get.filtered(db) )
    // Handle POST requests
    app.post( `${ROOT}/todos`, api.todos.post.create(db) )
    app.post( `${ROOT}/todos/:user/:id`, api.todos.post.update(db) )
    // Handle DELETE requests
    app.delete( `${ROOT}/todos/:user/:id`, api.todos.delete.byID(db) )
    break
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  // Refresh the database of anonymous todos every 24 hours.
  if (VERSION !== 'test')
    setInterval(() => {
      db.get('todos')
        .filter(todo => todo.userid === 'andy' || todo.userid === 'trymunx')
        .write()

      db.get('users')
        .filter(user => user === 'andy' || user === 'trymynx')
        .write()
    }, 60 * 60 * 24)
})