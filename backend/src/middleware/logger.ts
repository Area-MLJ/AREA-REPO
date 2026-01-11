import { NextApiRequest, NextApiResponse } from 'next';

// ANSI Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  
  // Styles
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  private static colorize(text: string, color: string): string {
    return `${color}${text}${colors.reset}`;
  }

  private static maskSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const masked = { ...obj };
    const sensitiveKeys = ['password', 'token', 'jwt_token', 'refresh_token', 'access_token', 'secret', 'password_hash'];
    
    Object.keys(masked).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        masked[key] = '[REDACTED]';
      }
    });
    
    return masked;
  }

  private static getLogLevel(status: number): 'INFO' | 'WARN' | 'ERROR' {
    if (status >= 500) return 'ERROR';
    if (status >= 400) return 'WARN';
    return 'INFO';
  }

  static logRequest(req: NextApiRequest) {
    const timestamp = this.colorize(this.formatTimestamp(), colors.gray);
    const method = req.method || 'UNKNOWN';
    const url = req.url || '';
    const ip = req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string || 
               req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Method colors
    const methodColors: { [key: string]: string } = {
      'GET': colors.green,
      'POST': colors.blue,
      'PUT': colors.yellow,
      'DELETE': colors.red,
      'PATCH': colors.magenta
    };
    const coloredMethod = this.colorize(method, methodColors[method] || colors.white);
    
    console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[REQUEST]', colors.cyan)} ${coloredMethod} ${this.colorize(url, colors.white)}`);
    console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[CLIENT]', colors.cyan)} IP: ${this.colorize(ip, colors.yellow)} | User-Agent: ${this.colorize(userAgent.slice(0, 80), colors.gray)}${userAgent.length > 80 ? '...' : ''}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
      const maskedBody = this.maskSensitiveData(req.body);
      console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[BODY]', colors.cyan)} ${JSON.stringify(maskedBody)}`);
    }
    
    const relevantHeaders = {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? '[PRESENT]' : '[NONE]',
      'origin': req.headers.origin,
      'referer': req.headers.referer
    };
    console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[HEADERS]', colors.cyan)} ${JSON.stringify(relevantHeaders)}`);
  }

  static logResponse(res: NextApiResponse, status: number, data?: any, error?: any) {
    const timestamp = this.colorize(this.formatTimestamp(), colors.gray);
    const level = this.getLogLevel(status);
    
    // Status code colors
    let statusColor = colors.green; // 2xx
    if (status >= 400 && status < 500) statusColor = colors.yellow; // 4xx
    if (status >= 500) statusColor = colors.red; // 5xx
    
    // Level colors
    const levelColors: { [key: string]: string } = {
      'INFO': colors.brightBlue,
      'WARN': colors.brightYellow,
      'ERROR': colors.brightRed
    };
    
    console.log(`[${timestamp}] ${this.colorize(`[${level}]`, levelColors[level])} ${this.colorize('[RESPONSE]', colors.cyan)} Status: ${this.colorize(status.toString(), statusColor)}`);
    
    if (data) {
      const maskedData = this.maskSensitiveData(data);
      if (maskedData.token) maskedData.token = '[JWT_TOKEN]';
      console.log(`[${timestamp}] ${this.colorize(`[${level}]`, levelColors[level])} ${this.colorize('[DATA]', colors.cyan)} ${JSON.stringify(maskedData)}`);
    }
    
    if (error) {
      console.log(`[${timestamp}] ${this.colorize(`[${level}]`, levelColors[level])} ${this.colorize('[ERROR]', colors.red)} ${typeof error === 'string' ? error : JSON.stringify(error)}`);
    }
  }

  static logAuth(action: string, userId?: string, email?: string) {
    const timestamp = this.colorize(this.formatTimestamp(), colors.gray);
    const details = [
      this.colorize(action, colors.bold),
      userId ? `UserID: ${this.colorize(userId, colors.magenta)}` : null,
      email ? `Email: ${this.colorize(email, colors.cyan)}` : null
    ].filter(Boolean).join(' | ');
    
    console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[AUTH]', colors.brightMagenta)} ${details}`);
  }

  static logDatabase(operation: string, params?: any) {
    const timestamp = this.colorize(this.formatTimestamp(), colors.gray);
    const maskedParams = params ? this.maskSensitiveData(params) : null;
    
    console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[DATABASE]', colors.brightGreen)} ${this.colorize(operation, colors.green)}`);
    if (maskedParams) {
      console.log(`[${timestamp}] ${this.colorize('[INFO]', colors.brightBlue)} ${this.colorize('[DB_PARAMS]', colors.brightGreen)} ${JSON.stringify(maskedParams)}`);
    }
  }

  static logError(error: any, context?: string) {
    const timestamp = this.colorize(this.formatTimestamp(), colors.gray);
    const message = error?.message || error?.toString() || 'Unknown error';
    
    console.log(`[${timestamp}] ${this.colorize('[ERROR]', colors.brightRed)} ${this.colorize(`[${context || 'GENERAL'}]`, colors.red)} ${this.colorize(message, colors.red)}`);
    
    if (error?.stack) {
      // Log only first few lines of stack trace for readability
      const stackLines = error.stack.split('\n').slice(0, 5);
      console.log(`[${timestamp}] ${this.colorize('[ERROR]', colors.brightRed)} ${this.colorize('[STACK]', colors.red)} ${this.colorize(stackLines.join(' | '), colors.dim)}`);
    }
    
    if (error?.code) {
      console.log(`[${timestamp}] ${this.colorize('[ERROR]', colors.brightRed)} ${this.colorize('[CODE]', colors.red)} ${this.colorize(error.code, colors.yellow)}`);
    }
  }

  // Utility method for general logging
  static log(level: 'INFO' | 'WARN' | 'ERROR', component: string, message: string, data?: any) {
    const timestamp = this.colorize(this.formatTimestamp(), colors.gray);
    
    const levelColors: { [key: string]: string } = {
      'INFO': colors.brightBlue,
      'WARN': colors.brightYellow,
      'ERROR': colors.brightRed
    };
    
    const componentColor = component === 'AUTH' ? colors.brightMagenta :
                          component === 'DATABASE' ? colors.brightGreen :
                          component === 'REQUEST' ? colors.cyan :
                          colors.white;
    
    console.log(`[${timestamp}] ${this.colorize(`[${level}]`, levelColors[level])} ${this.colorize(`[${component}]`, componentColor)} ${message}`);
    
    if (data) {
      const maskedData = this.maskSensitiveData(data);
      console.log(`[${timestamp}] ${this.colorize(`[${level}]`, levelColors[level])} ${this.colorize('[DATA]', componentColor)} ${JSON.stringify(maskedData)}`);
    }
  }
}