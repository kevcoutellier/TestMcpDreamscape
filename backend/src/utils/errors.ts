// src/utils/errors.ts
export class AppError extends Error {
    code: string;
    statusCode: number;
    details?: any;
  
    constructor(message: string, code: string, statusCode: number, details?: any) {
      super(message);
      this.name = 'AppError';
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
      
      // Capture stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }