module.exports = {
  get: {
    all: db => (req, res) => {
      res.json('This is all the todos')
    },
    //
    filtered: db => (req, res) => {
      res.json(`This is all the todos filtered by: ${Object.keys(req.query)}`)
    },
    //
    byID : db => (req, res) => {
      res.json(`This is the todo with the id: ${req.params.id}`)
    }
  },
  post: db => (req, res) => {
    
  }
}