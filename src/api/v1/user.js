const shortid = require('shortid')
const { CREATED } = require('../status.js')

module.exports = {
  get: {
    newUser: db => (req, res) => {
      const userid = shortid.generate()

      db.get('users')
        .push(userid)
        .write()

      res.status(CREATED).json(userid)
    }
  }
}