const { NodeFetch } = require('./node_fetch');
//const { logResponse } = require('../utils/loggers_helpers');

class BaseAPI {
  constructor(baseUrl, apiKey, apiToken) {
    this.baseUrl = baseUrl;
    this.authorizationParams = {
        "key" : apiKey,
        "token" : apiToken
    } 
  }
  
  async getAll(params = {}) {
    const finalParams = { ...this.authorizationParams, ...params };
    const response = await NodeFetch.get(this.baseUrl, finalParams);
  //  logResponse('GET_ALL', response);
    return response;
  }

  async delete(itemId) {
    const response = await NodeFetch.delete(`${this.baseUrl}/${itemId}`, this.authorizationParams);
   // logResponse('DELETE', response);
    return response;
  }
}

module.exports = { BaseAPI };
