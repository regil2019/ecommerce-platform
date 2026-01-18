class MonitoringService {
  constructor () {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      responseTimes: [],
      statusCodes: {},
      endpointMetrics: {}
    }
  }

  // Increment total requests
  incrementRequests () {
    this.metrics.totalRequests++
  }

  // Increment errors
  incrementErrors () {
    this.metrics.totalErrors++
  }

  // Record response time
  recordResponseTime (endpoint, method, time) {
    this.metrics.responseTimes.push({ endpoint, method, time, timestamp: Date.now() })

    // Keep only last 1000 response times
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift()
    }

    // Update endpoint metrics
    const key = `${method} ${endpoint}`
    if (!this.metrics.endpointMetrics[key]) {
      this.metrics.endpointMetrics[key] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0
      }
    }

    const metric = this.metrics.endpointMetrics[key]
    metric.count++
    metric.totalTime += time
    metric.avgTime = metric.totalTime / metric.count
    metric.minTime = Math.min(metric.minTime, time)
    metric.maxTime = Math.max(metric.maxTime, time)
  }

  // Record status code
  recordStatusCode (code) {
    this.metrics.statusCodes[code] = (this.metrics.statusCodes[code] || 0) + 1
  }

  // Get all metrics
  getMetrics () {
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((sum, item) => sum + item.time, 0) / this.metrics.responseTimes.length
      : 0

    return {
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.totalErrors,
      averageResponseTime: avgResponseTime,
      statusCodes: this.metrics.statusCodes,
      endpointMetrics: this.metrics.endpointMetrics,
      uptime: process.uptime()
    }
  }

  // Reset metrics (for testing or periodic reset)
  reset () {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      responseTimes: [],
      statusCodes: {},
      endpointMetrics: {}
    }
  }
}

// Export singleton instance
const monitoringService = new MonitoringService()
export default monitoringService
