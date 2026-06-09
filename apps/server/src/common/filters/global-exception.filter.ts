import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ApiCode, ApiCodeMessage } from '../enums/api-code.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let code: ApiCode = ApiCode.INTERNAL_ERROR;
    let message: string = ApiCodeMessage[ApiCode.INTERNAL_ERROR];
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let details: any = null;

    // NestJS HTTP 异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message[0];
          details = responseObj.message;
        }
      }
      
      code = this.mapHttpStatusToCode(status);
    }
    // Prisma 已知错误
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      code = this.mapPrismaError(exception);
      message = this.getPrismaErrorMessage(exception);
      status = HttpStatus.BAD_REQUEST;
    }
    // Prisma 验证错误
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      code = ApiCode.PARAM_ERROR;
      message = '数据验证失败';
      status = HttpStatus.BAD_REQUEST;
    }
    // 其他错误
    else {
      console.error('未捕获的异常:', exception);
    }

    response.status(status).json({
      code,
      message,
      data: null,
      ...(details && { details }),
      timestamp: Date.now(),
    });
  }

  private mapHttpStatusToCode(status: number): ApiCode {
    const map: Record<number, ApiCode> = {
      400: ApiCode.PARAM_ERROR,
      401: ApiCode.UNAUTHORIZED,
      403: ApiCode.FORBIDDEN,
      404: ApiCode.NOT_FOUND,
      409: ApiCode.CONFLICT,
      422: ApiCode.PARAM_ERROR,
      429: ApiCode.RATE_LIMIT,
      500: ApiCode.INTERNAL_ERROR,
    };
    return map[status] || ApiCode.INTERNAL_ERROR;
  }

  private mapPrismaError(error: Prisma.PrismaClientKnownRequestError): ApiCode {
    const codeMap: Record<string, ApiCode> = {
      'P2002': ApiCode.ALREADY_EXISTS,      // 唯一约束冲突
      'P2003': ApiCode.DELETE_DENIED,        // 外键约束失败
      'P2025': ApiCode.NOT_FOUND,            // 记录未找到
      'P2014': ApiCode.CONFLICT,             // 关系冲突
    };
    return codeMap[error.code] || ApiCode.DB_ERROR;
  }

  private getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const meta = error.meta as Record<string, any>;
    
    switch (error.code) {
      case 'P2002':
        const target = meta?.target || '字段';
        return `${target} 已存在，请使用其他值`;
      case 'P2003':
        return '存在关联数据，无法执行操作';
      case 'P2025':
        return '记录不存在或已被删除';
      case 'P2014':
        return '数据关联关系冲突';
      default:
        return '数据库操作失败';
    }
  }
}
