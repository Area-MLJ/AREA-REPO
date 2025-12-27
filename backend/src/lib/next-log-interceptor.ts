const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const blueMethod = '\x1b[34m';
const reset = '\x1b[0m';

function formatNextLog(message: string): string {
  const methodPattern = /\b(GET|POST|PUT|DELETE|PATCH|OPTIONS)\b/;
  const match = message.match(methodPattern);
  
  if (match) {
    const method = match[0];
    return message.replace(methodPattern, `${blueMethod}[${method}]${reset}`);
  }
  
  return message;
}

console.log = function(...args: any[]) {
  const formatted = args.map(arg => 
    typeof arg === 'string' ? formatNextLog(arg) : arg
  );
  originalConsoleLog(...formatted);
};

console.error = function(...args: any[]) {
  const formatted = args.map(arg => 
    typeof arg === 'string' ? formatNextLog(arg) : arg
  );
  originalConsoleError(...formatted);
};

console.warn = function(...args: any[]) {
  const formatted = args.map(arg => 
    typeof arg === 'string' ? formatNextLog(arg) : arg
  );
  originalConsoleWarn(...formatted);
};
