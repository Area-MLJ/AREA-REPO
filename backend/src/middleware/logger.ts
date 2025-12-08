import { NextApiRequest, NextApiResponse } from 'next';

interface LogData {
  timestamp: string;
  method: string;
  url: string;
  headers: any;
  body: any;
  query: any;
  ip: string;
  userAgent: string;
}

export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static logRequest(req: NextApiRequest): LogData {
    const logData: LogData = {
      timestamp: this.formatTimestamp(),
      method: req.method || 'UNKNOWN',
      url: req.url || '',
      headers: req.headers,
      body: req.body,
      query: req.query,
      ip: req.headers['x-forwarded-for'] as string || 
           req.headers['x-real-ip'] as string || 
           req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    console.log('\n🔍 ===== API REQUEST =====');
    console.log(`📅 ${logData.timestamp}`);
    console.log(`🔗 ${logData.method} ${logData.url}`);
    console.log(`🌐 IP: ${logData.ip}`);
    console.log(`🖥️  User-Agent: ${logData.userAgent}`);
    
    if (Object.keys(logData.query).length > 0) {
      console.log(`❓ Query:`, logData.query);
    }
    
    if (logData.body) {
      // Masquer les mots de passe dans les logs
      const safeBody = { ...logData.body };
      if (safeBody.password) safeBody.password = '[MASKED]';
      console.log(`📦 Body:`, safeBody);
    }

    // Headers importants seulement
    const importantHeaders = {
      'content-type': logData.headers['content-type'],
      'authorization': logData.headers.authorization ? '[PRESENT]' : '[NONE]',
      'origin': logData.headers.origin,
      'referer': logData.headers.referer
    };
    console.log(`📋 Headers:`, importantHeaders);

    return logData;
  }

  static logResponse(res: NextApiResponse, statusCode: number, data?: any, error?: any) {
    console.log(`\n📤 ===== API RESPONSE =====`);
    console.log(`📅 ${this.formatTimestamp()}`);
    console.log(`📊 Status: ${statusCode}`);
    
    if (error) {
      console.log(`❌ Error:`, error);
    }
    
    if (data && statusCode < 400) {
      // Masquer les tokens dans les logs
      const safeData = typeof data === 'object' ? { ...data } : data;
      if (safeData.token) safeData.token = '[TOKEN_PRESENT]';
      console.log(`✅ Data:`, safeData);
    }
    
    console.log(`🔚 ========================\n`);
  }

  static logError(error: any, context?: string) {
    console.log(`\n💥 ===== ERROR =====`);
    console.log(`📅 ${this.formatTimestamp()}`);
    if (context) console.log(`📍 Context: ${context}`);
    console.log(`❌ Error:`, error);
    if (error.stack) console.log(`📚 Stack:`, error.stack);
    console.log(`🔚 ===================\n`);
  }

  static logDatabase(query: string, params?: any) {
    console.log(`\n🗄️  ===== DATABASE =====`);
    console.log(`📅 ${this.formatTimestamp()}`);
    console.log(`🔍 Query: ${query}`);
    if (params) {
      // Masquer les données sensibles
      const safeParams = Array.isArray(params) ? [...params] : { ...params };
      if (typeof safeParams === 'object') {
        if (safeParams.password) safeParams.password = '[MASKED]';
        if (safeParams.password_hash) safeParams.password_hash = '[MASKED]';
      }
      console.log(`📝 Params:`, safeParams);
    }
    console.log(`🔚 =====================\n`);
  }

  static logAuth(action: string, userId?: string, email?: string) {
    console.log(`\n🔐 ===== AUTH =====`);
    console.log(`📅 ${this.formatTimestamp()}`);
    console.log(`🔑 Action: ${action}`);
    if (userId) console.log(`👤 User ID: ${userId}`);
    if (email) console.log(`📧 Email: ${email}`);
    console.log(`🔚 ==================\n`);
  }
}

// Middleware pour logger automatiquement les requêtes
export function withLogger(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Log de la requête
    Logger.logRequest(req);
    
    try {
      await handler(req, res);
    } catch (error) {
      Logger.logError(error, `Handler for ${req.method} ${req.url}`);
      throw error;
    }
  };
}