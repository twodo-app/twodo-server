//---------------------------------------------------------
// NPM Packages
const shortid = require('shortid') // UUID generator

//---------------------------------------------------------
const completeSchema = {
  id          : String,
  userid      : String,
  title       : String,
  description : String,
  priority    : Number,
  created     : Number,
  due         : Number,
  estimated   : Number,
  timetaken   : Number,
  snoozed     : Boolean,
  complete    : Boolean,
}

const requiredSchema = {
  userid      : String,
  title       : String,
  description : String,
  priority    : Number,
  created     : Number,
  due         : Number,
  estimated   : Number,
}

const staticFields = [
  'id',
  'userid',
  'created',
  'timetaken'
]

//---------------------------------------------------------
// A simple validation that checks the types of each field
// in the todo. In production this should be more advanced,
// checking both the type and the value, but fo test purposes
// this is servicable.
const validateRequired = todo =>
  Object.keys(requiredSchema)
    .reduce((valid, key) => typeof todo[key] === typeof requiredSchema[key]() && valid, true)

const validateComplete = todo =>
  Object.keys(completeSchema)
    .reduce((valid, key) => typeof todo[key] === typeof completeSchema[key]() && valid, true)

// Validation check to ensure the fields defined in staticFields
// remain unchanged when updating a todo.
const validateUpdate = (newTodo, oldTodo) =>
  staticFields.reduce((valid, key) => newTodo[key] === oldTodo[key] && valid, true)

// Takes a todo with all the fields outlined in requiredSchema
// and fills in the rest with some sensible defaults.
const create = todo => ({
  id          : shortid.generate(),
  userid      : todo.userid,
  title       : todo.title,
  description : todo.description,
  priority    : todo.priority,
  created     : todo.created,
  due         : todo.due,
  estimated   : todo.estimated,
  timetaken   : 0,
  snoozed     : false,
  complete    : false
})

// Used to generate some mock todos for testing purposes.
// This lets us test some api GET requests without having
// to POST some todos from the client first.
const mock = () => create({
  userid      : 'test-user',
  title       : 'I am a mock twodo',
  description : 'Use me to test the API!',
  priority    : (Math.random() * 3) | 0,
  created     : Date.now(),
  due         : Date.now() + (Math.random() * 100000),
  estimated   : Date.now() + (Math.random() * 100000)
})

//---------------------------------------------------------
module.exports = { 
  validateRequired, 
  validateComplete, 
  validateUpdate,
  create, 
  mock }