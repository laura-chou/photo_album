import { Request, Response, NextFunction } from 'express';
import { getClientIp } from '../common/utils';
import { responseHandler } from '../common/response';
import { LogLevel, LogMessage, setLog } from '../core/logger';

const ipTracker = new Map<string, number>();

const validateRateLimit = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const ip = getClientIp(request);
  const lastRequest = ipTracker.get(ip);
  const now = Date.now();

  if (lastRequest && now - lastRequest < 60000) {
    setLog(LogLevel.ERROR, LogMessage.ERROR.TOOMANYREQUESTS, validateRateLimit.name);
    responseHandler.tooManyRequests(response);
    return;
  }

  ipTracker.set(ip, now);
  next();
};

export default validateRateLimit;