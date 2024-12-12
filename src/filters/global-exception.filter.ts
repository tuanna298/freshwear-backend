import { ErrorResponse } from '@/common/base/types';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {
    this.logger = new Logger(GlobalExceptionFilter.name);
  }

  catch(
    exception: HttpException | Prisma.PrismaClientKnownRequestError | Error,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['request-id'] as string;
    const path = request.url;

    let errorResponse: ErrorResponse;

    if (exception instanceof UnprocessableEntityException) {
      errorResponse = this.handleUnprocessableEntityException(exception);
    } else if (exception instanceof BadRequestException) {
      errorResponse = this.handleBadRequestException(exception);
    } else if (exception instanceof ConflictException) {
      errorResponse = this.handleconflictException(exception);
    } else if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception);
    } else if (exception instanceof NotFoundException) {
      errorResponse = this.handleEntityNotFoundError(exception);
    } else {
      errorResponse = this.handleError(exception);
    }

    this.logger.error(exception.message, exception.stack, requestId);

    response.status(errorResponse.statusCode).json({
      ...errorResponse,
      requestId,
      error: {
        ...errorResponse.error,
        path,
      },
    });
  }

  /**
   * Handles UnprocessableEntityException:
   * Check the request payload
   * Validate the input
   * @param exception UnprocessableEntityException
   * @returns ErrorResponse
   */
  private handleUnprocessableEntityException(
    exception: UnprocessableEntityException,
  ): ErrorResponse {
    const r = exception.getResponse();

    return {
      status: 'error',
      statusCode: exception.getStatus(),
      error: {
        code: 'UNPROCESSABLE_ENTITY',
        message: 'Không thể xử lý yêu cầu của bạn.',
        details: typeof r === 'object' ? JSON.stringify(r) : r,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handles conflictException
   * @param exception conflictException
   * @returns ErrorResponse
   */
  private handleconflictException(exception: ConflictException): ErrorResponse {
    return {
      status: 'error',
      statusCode: exception.getStatus(),
      error: {
        code: 'conflict',
        message: 'Có xung đột với yêu cầu của bạn.',
        details: exception.message,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handles BadRequestException
   * @param exception BadRequestException
   * @returns ErrorResponse
   */
  private handleBadRequestException(
    exception: BadRequestException,
  ): ErrorResponse {
    const response = exception.getResponse();
    const message =
      typeof response === 'object' &&
      'message' in response &&
      Array.isArray(response.message)
        ? response.message.join('; ')
        : typeof response === 'object' && 'message' in response
          ? response.message
          : response;

    return {
      status: 'error',
      statusCode: HttpStatus.BAD_REQUEST,
      error: {
        code: 'BAD_REQUEST',
        message: 'Yêu cầu không hợp lệ.',
        details: message as string,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handles HttpException
   * @param exception HttpException
   * @returns ErrorResponse
   */
  private handleHttpException(exception: HttpException): ErrorResponse {
    return {
      status: 'error',
      statusCode: exception.getStatus(),
      error: {
        code: exception.name,
        message: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.',
        details: exception.message,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handles EntityNotFoundError when using findOrFail() or findOneOrFail() from TypeORM
   * @param error EntityNotFoundError
   * @returns ErrorResponse
   */
  private handleEntityNotFoundError(error: NotFoundException): ErrorResponse {
    return {
      status: 'error',
      statusCode: HttpStatus.NOT_FOUND,
      error: {
        code: 'ENTITY_NOT_FOUND',
        message: 'Không tìm thấy tài nguyên.',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handles generic errors
   * @param error Error
   * @returns ErrorResponse
   */
  private handleError(error: Error): ErrorResponse {
    return {
      status: 'error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Đã xảy ra sự cố từ phía chúng tôi.',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
