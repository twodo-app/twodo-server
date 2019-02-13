const api = {
  test: require('./test/index.js'),
  v1: require('./v1/index.js')
}

// Programmatically determine what version of api to expose.
// This is necessary because expressions, including string 
// literals cannot be used in a require() call.
module.exports = (version => {
  switch (version) {
    case 'test':
      console.log('loading test api')
      return api.test
    case 'v1':
      console.log('loading v1 api')
      return api.v1
    // Fall back to the test api if no version, or an invalid
    // version is supplied. This should probably default to v1
    // once in production.
    default:
      return api.test
  }
})