const path = require('path')

module.exports = {
  entry: [path.join(__dirname, './src/serve.js')],
  output: {
    path: path.join(__dirname, '/'),
    filename: 'app.min.js',
  },
  target: 'node',
  plugins: [],
}
