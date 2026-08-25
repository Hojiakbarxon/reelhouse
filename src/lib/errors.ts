import axios from 'axios';
import { extractErrorMessage, type ApiErrorShape } from '@/api/client';

// The backend's global exception filter always answers with
// { statusCode, message, data } (see ExceptionFilterFilter), so we can
// classify failures by HTTP status to drive friendlier, purpose-built UI
// instead of a single generic toast for every failure mode.
export type ApiErrorKind = 'throttle' | 'invalid-credentials' | 'otp' | 'conflict' | 'generic';

export interface ClassifiedError {
  kind: ApiErrorKind;
  message: string;
  status?: number;
}

export function classifyError(error: unknown): ClassifiedError {
  const message = extractErrorMessage(error);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as ApiErrorShape | undefined;
    const raw = Array.isArray(body?.message) ? body.message.join(' ') : (body?.message ?? '');

    // @nestjs/throttler answers 429 on the shared ThrottlerGuard.
    if (status === 429) {
      return { kind: 'throttle', message, status };
    }

    // login() throws BadRequestException("Email or Password is wrong!") for
    // both an unknown email and a bad password.
    if (status === 400 && /email or password/i.test(raw)) {
      return { kind: 'invalid-credentials', message, status };
    }

    // confirmOtp()/resetPassword() throw on a wrong or expired code.
    if (/otp/i.test(raw)) {
      return { kind: 'otp', message, status };
    }

    if (status === 409) {
      return { kind: 'conflict', message, status };
    }

    return { kind: 'generic', message, status };
  }

  return { kind: 'generic', message };
}
