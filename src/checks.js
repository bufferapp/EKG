const sleep = require('then-sleep')

const timeoutCheck = async ({ check, timeout = 5000 }) => {
  return Promise.race([
    await sleep(timeout).then(() => {
      throw new Error('Check Timeout')
    }),
    await check(),
  ])
}

module.exports = {
  timeoutCheck,
}
