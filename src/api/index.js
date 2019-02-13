const api = {
  test: require('./test/index.js'),
  v1: require('./v1/index.js')
}

module.exports = (version => {
  switch (version) {
    case 'test':
      console.log('loading test api')
      return api.test
    case 'v1':
      console.log('loading v1 api')
      return api.v1
    default:
      return api.test
  }
})