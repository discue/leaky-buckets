import test from 'ava'
import { PersistentPorro } from './persistent-porro.mjs'

function sleep(ms, result = true) {
  return new Promise(resolve => setTimeout(resolve, ms, result))
}

test('default', async t => {
  t.plan(6)

  const bucket = new PersistentPorro({
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2
  })

  t.throws(() => bucket.request(-1))

  t.is(bucket.request(), 0)
  t.is(bucket.request(), 0)

  const ms = bucket.request()
  t.true(ms > 900 && ms < 1100)

  await sleep(ms)

  t.is(bucket.request(), 0)
  t.true(bucket.request() > 0)
})

test('PersistentPorro', async t => {
  t.plan(10)

  const bucket = new PersistentPorro({
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2
  })

  t.is(bucket.request(), 0)
  t.is(bucket.request(), 0)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 4000)
  t.is(bucket.request(), 4000)
})

test('Hydrate without internal state', async t => {
  t.plan(10)

  const bucket = PersistentPorro.Hydrate({
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2
  })

  t.is(bucket.request(), 0)
  t.is(bucket.request(), 0)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 4000)
  t.is(bucket.request(), 4000)
})

test('Hydrate with internal state full', async t => {
  t.plan(8)

  const bucket = PersistentPorro.Hydrate({
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2,
    tokens: 0,
    lastRequest: Date.now()
  })

  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 4000)
  t.is(bucket.request(), 4000)
})

test('Hydrate with internal state half full', async t => {
  t.plan(9)

  const bucket = PersistentPorro.Hydrate({
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2,
    tokens: 1,
    lastRequest: Date.now()
  })

  t.is(bucket.request(), 0)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 4000)
  t.is(bucket.request(), 4000)
})

test('getState with internal state full', async t => {
  t.plan(13)

  const bucket = PersistentPorro.Hydrate({
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2,
    tokens: 0,
    lastRequest: Date.now()
  })

  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 1000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 2000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 3000)
  t.is(bucket.request(), 4000)
  t.is(bucket.request(), 4000)

  const state = bucket.getState()
  t.is(state.bucketSize, 2)
  t.is(state.interval, 1000)
  t.is(state.tokensPerInterval, 2)
  t.is(state.tokens, -8)
  t.true(state.lastRequest > Date.now() - 100)
})

test('options', t => {
  t.plan(11)

  const options = {
    bucketSize: 2,
    interval: 1000,
    tokensPerInterval: 2
  }
  t.truthy(new PersistentPorro(options))

  t.throws(() => PersistentPorro())
  t.throws(() => new PersistentPorro())
  t.throws(() => new PersistentPorro(null))
  t.throws(() => new PersistentPorro({}))
  t.throws(() => new PersistentPorro({ ...options, bucketSize: '1' }))
  t.throws(() => new PersistentPorro({ ...options, interval: '1' }))
  t.throws(() => new PersistentPorro({ ...options, tokensPerInterval: '1' }))
  t.throws(() => new PersistentPorro({ ...options, bucketSize: 0 }))
  t.throws(() => new PersistentPorro({ ...options, interval: 0 }))
  t.throws(() => new PersistentPorro({ ...options, tokensPerInterval: 0 }))
})

test('throttle', async t => {
  t.plan(1)

  const bucket = new PersistentPorro({
    bucketSize: 5,
    interval: 1000,
    tokensPerInterval: 2
  })

  const start = Date.now()
  for (let i = 0; i < 10; i++) {
    await bucket.throttle()
  }
  const end = Date.now()

  const time = end - start
  t.true(time >= 3000)
})

test('reset', async t => {
  t.plan(1)

  const bucket = new PersistentPorro({
    bucketSize: 5,
    interval: 1000,
    tokensPerInterval: 2
  })

  const start = Date.now()
  for (let i = 0; i < 10; i++) {
    await bucket.throttle()
    bucket.reset()
  }
  const end = Date.now()

  const time = end - start
  t.true(time >= 0 && time < 10)
})

test('refill', async t => {
  t.plan(1)

  const bucket = new PersistentPorro({
    bucketSize: 3,
    interval: 1000,
    tokensPerInterval: 2
  })

  await bucket.throttle()
  await bucket.throttle()
  await bucket.throttle()

  await sleep(2000)

  t.is(bucket.request(), 0)
})

test('quantity', async t => {
  t.plan(7)

  const bucket = new PersistentPorro({
    bucketSize: 10,
    interval: 100,
    tokensPerInterval: 2
  })

  t.is(bucket.request(), 0)
  t.is(bucket.request(), 0)
  t.is(bucket.request(), 0)
  t.is(bucket.request(7), 0)
  t.true(bucket.request(1) > 0)
  t.is(bucket.tokens, -1)
  await sleep(bucket._interval)
  t.is(bucket.tokens, 1)
})

test('promise', async t => {
  t.plan(1)

  const bucket = new PersistentPorro({
    bucketSize: 10,
    interval: 100,
    tokensPerInterval: 2
  })

  await t.throwsAsync(bucket.throttle(-1))
})
