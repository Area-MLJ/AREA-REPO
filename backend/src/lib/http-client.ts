import { logger } from './logger';

export class HttpClient {
  async get(url: string, headers: Record<string, string> = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      logger.error(`HTTP GET error for ${url}:`, error);
      throw error;
    }
  }

  async post(url: string, body?: any, headers: Record<string, string> = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      logger.error(`HTTP POST error for ${url}:`, error);
      throw error;
    }
  }

  async put(url: string, body?: any, headers: Record<string, string> = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      logger.error(`HTTP PUT error for ${url}:`, error);
      throw error;
    }
  }

  async delete(url: string, headers: Record<string, string> = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      logger.error(`HTTP DELETE error for ${url}:`, error);
      throw error;
    }
  }
}

export default new HttpClient();

