const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class TrelloAPI {
  constructor({ key, token, baseUrl = 'https://api.trello.com/1', logger = console, fetchImpl } = {}) {
    this.key = key;
    this.token = token;
    this.baseUrl = baseUrl;
    this.logger = logger;
    this.fetch = fetchImpl || fetch;
  }

  _buildUrl(endpoint, params = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const search = new URLSearchParams({ key: this.key, token: this.token, ...params });
    return `${url}?${search.toString()}`;
  }
  async request(...args) {
    let method; let endpoint; let params = {}; let body; let headers = {};

    if (typeof args[0] === 'string' && (args.length === 1 || typeof args[1] === 'object')) {
      endpoint = args[0];
      const opts = args[1] || {};
      method = (opts.method || 'GET').toUpperCase();
      params = opts.params || {};
        body = opts.body;
        headers = opts.headers || {};
        var rawBody = opts.rawBody;
    } else if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      method = args[0].toUpperCase();
      endpoint = args[1];
      const opts = args[2] || {};
      params = opts.params || {};
        body = opts.body;
        headers = opts.headers || {};
        var rawBody = opts.rawBody;
    } else {
      throw new Error('TrelloAPI.request: invalid arguments');
    }

    if (!this.key || !this.token) {
      const err = new Error('TrelloAPI: api key or token missing. Set TRELLO_KEY and TRELLO_TOKEN.');
      err.code = 'MISSING_CREDENTIALS';
      throw err;
    }

    const url = this._buildUrl(endpoint, params);
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: (typeof rawBody === 'string') ? rawBody : (body ? JSON.stringify(body) : undefined),
      };

    this.logger.debug?.(`TrelloAPI -> ${method} ${url}`);

    const res = await this.fetch(url, opts);
    const text = await res.text();
    const contentType = res.headers && res.headers.get ? res.headers.get('content-type') || '' : '';
    let parsed;
    try {
      parsed = contentType.includes('application/json') ? JSON.parse(text) : text;
    } catch (e) {
      parsed = text;
    }

    if (!res.ok) {
      const message = `Trello API Error ${res.status}: ${text}`;
      const err = new Error(message);
      err.status = res.status;
      err.body = parsed;
      if (res.status === 401) {
        err.suggestion = 'Token may be missing required scopes. Visit https://trello.com/app-key to generate a token with read,write scopes.';
      }
      throw err;
    }

    return parsed;
  }

  // HTTP conveniences
  get(endpoint, opts) { return this.request('GET', endpoint, opts); }
  post(endpoint, opts) { return this.request('POST', endpoint, opts); }
  put(endpoint, opts) { return this.request('PUT', endpoint, opts); }
  delete(endpoint, opts) { return this.request('DELETE', endpoint, opts); }

  // Domain helpers
  async verifyToken() {
    return this.get('/members/me');
  }

  async createBoard(name) {
    return this.post('/boards', { params: { name } });
  }

  async deleteBoard(boardId) {
    return this.delete(`/boards/${boardId}`);
  }

  async createList(boardId, name) {
    return this.post('/lists', { params: { idBoard: boardId, name } });
  }

  async updateList(listId, updates) {
    return this.put(`/lists/${listId}`, { params: updates });
  }

  async getList(listId) {
    return this.get(`/lists/${listId}`);
  }

  async getBoardLists(boardId) {
    return this.get(`/boards/${boardId}/lists`);
  }
}

module.exports = TrelloAPI;
