/**
 * Rate Limiter for Subscan API
 * 
 * Subscan API has a rate limit of 5 calls per second.
 * This rate limiter queues API calls and ensures we don't exceed the limit.
 * When the limit is reached, it waits 2 seconds before continuing.
 */

class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private callsThisSecond = 0
  private lastResetTime = Date.now()
  private readonly maxCallsPerSecond = 5
  private readonly resetInterval = 1000 // 1 second in milliseconds
  private readonly waitTimeOnLimit = 2000 // 2 seconds wait when limit hit

  /**
   * Add an API call to the queue and execute it when rate limit allows
   * @param apiCall The async function to execute
   * @returns Promise that resolves with the API call result
   */
  async addToQueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      this.processQueue()
    })
  }

  /**
   * Process the queue of API calls respecting rate limits
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      
      // Reset counter if a second has passed
      if (now - this.lastResetTime >= this.resetInterval) {
        this.callsThisSecond = 0
        this.lastResetTime = now
      }

      // If we've hit the limit, wait 2 seconds before continuing
      if (this.callsThisSecond >= this.maxCallsPerSecond) {
        console.log('Rate limit reached (5 calls/second). Waiting 2 seconds...')
        await this.sleep(this.waitTimeOnLimit)
        this.callsThisSecond = 0
        this.lastResetTime = Date.now()
        continue
      }

      // Execute the next call
      const apiCall = this.queue.shift()
      if (apiCall) {
        this.callsThisSecond++
        await apiCall()
      }
    }

    this.processing = false
  }

  /**
   * Sleep utility function
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current queue status (for debugging)
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      callsThisSecond: this.callsThisSecond,
      maxCallsPerSecond: this.maxCallsPerSecond,
    }
  }
}

// Export a singleton instance to be used across the application
export const subscanRateLimiter = new RateLimiter()
