export class PersistentPorro extends Porro {
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
    static Hydrate(state: {
        bucketSize: number;
        interval: number;
        tokensPerInterval: number;
        tokens: number;
        lastRequest: number;
    }): PersistentPorro;
    /**
     * Create the bucke and store it in the database
     */
    getState(): {
        bucketSize: number;
        interval: number;
        tokensPerInterval: number;
        tokens: number;
        lastRequest: number;
    };
}
import { Porro } from "./porro.mjs";
