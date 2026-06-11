import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiCode, ApiCodeMessage } from '../enums/api-code.enum';

export interface ApiResult<T = any> {
  code: ApiCode;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResult> {
    return next.handle().pipe(
      map((data) => ({
        code: ApiCode.SUCCESS,
        message: ApiCodeMessage[ApiCode.SUCCESS],
        data: data ?? null,
        timestamp: Date.now(),
      })),
    );
  }
}
