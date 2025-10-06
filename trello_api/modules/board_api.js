const { BaseAPI } = require('../base_api');
const { logger } = require('../../utils/logger');

class BoardAPI extends BaseAPI {
  constructor(baseUrl, apiKey, apiToken) {
    super(`${baseUrl}/boards`, apiKey, apiToken);

    this.organizationUrl = `${baseUrl}/organizations`
    this.boardsUrl = `${baseUrl}/boards`
    
  }

  async getBoardsByName(organizationId, boardName){
    this.baseUrl = `${this.organizationUrl}/${organizationId}/boards`;
    const response =  await this.getAll({'fields' : 'name,id' });
    this.baseUrl = this.boardsUrl
    const board = response.find(b => b.name === boardName);
    return board
  }

  async deleteBoard(boardId) {
    const response = await this.delete(boardId);
    logger.info(`[DELETE_BOARD]`, response.status);
    return response.status;
  }
}

module.exports = { BoardAPI };


