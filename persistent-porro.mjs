import { Porro } from './porro.mjs'

export class PersistentPorro extends Porro {

  /**
   * @constructor
   * @param {Object} options
   * @param {number} options.bucketSize - Number of tokens available inside the bucket.
   * @param {number} options.interval - Time interval in ms when tokens are refilled.
   * @param {number} options.tokensPerInterval - Number of refilled tokens per interval.
   */
  constructor(options = {}) {
    super(options)
  }

  /**
   * Create the bucke and store it in the database
   */
  getState() {
    return {
      bucketSize: this._bucketSize,
      interval: this._interval,
      tokensPerInterval: this._tokensPerInterval,
      tokens: this._tokens,
      lastRequest: this._lastRequest
    }
  }

  /**
   * Hydrate the bucket with given state
   * 
   * @param {Object} state
   * @param {number} state.bucketSize - Number of tokens available inside the bucket.
   * @param {number} state.interval - Time interval in ms when tokens are refilled.
   * @param {number} state.tokensPerInterval - Number of refilled tokens per interval.
   * @param {number} state.tokens - Number of tokens available inside the bucket during save.
   * @param {number} state.lastRequest - milliseconds of last request.
   */
  static Hydrate(state) {
    const { bucketSize, interval, tokensPerInterval, tokens, lastRequest } = state

    const porro = new PersistentPorro({ bucketSize, interval, tokensPerInterval })
    porro._tokens = tokens ?? bucketSize
    porro._lastRequest = lastRequest ?? Date.now()

    return porro
  }
}
