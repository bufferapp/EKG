const MongoDBCore = {}
const Server = function() {
  this.connection = {
    command: (cmd, args, cb) =>
      cb(null, {
        result: {
          ok: 1,
        },
      }),
    destroy: () => {},
  }
  this.on = (type, cb) => {
    if (type === 'connect') {
      this.connectCb = cb
    }
  }
  this.connect = () => this.connectCb(this.connection)
}
MongoDBCore.Server = jest.fn(Server)
module.exports = MongoDBCore
