export class Porro {
    /**
     * @constructor
     * @param {Object} options
     * @param {number} options.bucketSize - Number of tokens available inside the bucket.
     * @param {number} options.interval - Time interval in ms when tokens are refilled.
     * @param {number} options.tokensPerInterval - Number of refilled tokens per interval.
     */
    constructor(options?: {
        bucketSize: number;
        interval: number;
        tokensPerInterval: number;
    });
    _bucketSize: number;
    _interval: number;
    _tokensPerInterval: number;
    _tokens: number;
    _lastRequest: number;
    /**
     * Returns the current number of tokens inside the bucket.
     */
    get tokens(): number;
    /**
     * Refill the bucket from the previous iteration.
     */
    refill(): void;
    /**
     * Returns the delay that the request will wait before the execution.
     * @param {number} [quantity] Number (positive integer) of "tokens" to burn for the current request. Defaults to `1`.
     * @returns {number}
     */
    request(quantity?: number): number;
    /**
     * Reset bucket to its initial status.
     */
    reset(): void;
    /**
     * Requests a token and returns a Promise that will resolve when the request can execute.
     * @param {number} [quantity] Number (positive integer) of "tokens" to burn for the current request. Defaults to `1`.
     * @returns {Promise} Resolves with the waited milliseconds.
     */
    throttle(quantity?: number): Promise<any>;
}
