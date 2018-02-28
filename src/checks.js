const sleep = require('then-sleep')

const timeoutCheck = async ({ check, timeout = 5000 }) =>
  new Promise(async (resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error('Check Timed Out'))
    }, timeout)
    await check()
    clearTimeout(id)
    resolve()
  })

module.exports = {
  timeoutCheck,
}
