import { Request, Response, NextFunction } from 'express';
import { AppError} from '../exceptions';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(err); 

    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError && err.isOperational) {
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
};