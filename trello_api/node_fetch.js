const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { logger } = require('../utils/logger');

class NodeFetch {
  static async get(url, params) {
    try {
      const fullUrl = `${url}?${new URLSearchParams(params)}`;

      logger.info(`HTTP Full URL: ${fullUrl}`);
      const response = await fetch(fullUrl, { method: 'GET' });
      const responseHandled = await this.handleResponse(response);
      return responseHandled;
    } catch (error) {
      logger.error(`GET ${url} failed: ${error.message}`);
      throw error;
    }
  }

  static async delete(url, params) {
    try {
      const fullUrl = `${url}?${new URLSearchParams(params)}`;
      const options = { method: 'DELETE' };
      logger.info(`HTTP Full URL: ${fullUrl}`);
      logger.info(`HTTP Options: ${options}`);

      return await fetch(fullUrl, options);
    } catch (error) {
      logger.error(`DELETE ${url} failed: ${error.message}`);
      throw error;
    }
  }

  static async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      logger.error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      throw new Error(`Request failed with status ${response.status}`);
    }

    return data;
  }
}

module.exports = { NodeFetch };
