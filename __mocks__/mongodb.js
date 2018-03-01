const MongoDB = jest.genMockFromModule('mongodb')
MongoDB.stats = jest.fn(() => ({
  ok: 1,
}))
MongoDB.statsFail = jest.fn(() => ({
  ok: 0,
}))
MongoDB.statsTimeout = jest.fn(
  () =>
    new Promise(resolve => {
      setTimeout(resolve, 100)
    }),
)
MongoDB.db = jest.fn(db => {
  if (db === 'fail') {
    return {
      stats: MongoDB.statsFail,
    }
  } else if (db === 'timeout') {
    return {
      stats: MongoDB.statsTimeout,
    }
  }
  return {
    stats: MongoDB.stats,
  }
})
MongoDB.close = jest.fn()
MongoDB.MongoClient = {
  connect: jest.fn(() =>
    Promise.resolve({
      db: MongoDB.db,
      close: MongoDB.close,
    }),
  ),
}

module.exports = MongoDB
