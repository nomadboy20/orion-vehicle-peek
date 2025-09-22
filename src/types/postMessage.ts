/**
 * PostMessage API Type Definitions
 * 
 * This file defines all the message types and payloads used for communication
 * between the parent window and the GPS tracking iframe.
 */

// Base message structure
export interface BaseMessage {
  type: string;
  payload?: any;
}

// =============================================================================
// PARENT TO IFRAME MESSAGES
// =============================================================================

export interface SetTokenMessage extends BaseMessage {
  type: 'GPS_SET_TOKEN';
  payload: {
    token: string;
  };
}

export interface SetGroupMessage extends BaseMessage {
  type: 'GPS_SET_GROUP';
  payload: {
    groupCode: string;
  };
}

// =============================================================================
// IFRAME TO PARENT MESSAGES
// =============================================================================

export interface RequestTokenMessage extends BaseMessage {
  type: 'GPS_REQUEST_TOKEN';
  payload?: never;
}

export interface RequestGroupMessage extends BaseMessage {
  type: 'GPS_REQUEST_GROUP';
  payload?: never;
}

export interface TokenRefreshMessage extends BaseMessage {
  type: 'GPS_TOKEN_REFRESH';
  payload: {
    reason: '401_unauthorized';
  };
}

export interface IframeReadyMessage extends BaseMessage {
  type: 'GPS_IFRAME_READY';
  payload?: {
    version?: string;
    capabilities?: string[];
  };
}

export interface StatsUpdateMessage extends BaseMessage {
  type: 'GPS_STATS_UPDATE';
  payload: {
    activeVehicles: number;
    lastUpdate: string; // ISO timestamp
    status: 'online' | 'offline' | 'error' | 'loading';
    errorMessage?: string;
  };
}

export interface ErrorMessage extends BaseMessage {
  type: 'GPS_ERROR';
  payload: {
    error: string;
    code?: string;
    details?: any;
  };
}

export interface LogMessage extends BaseMessage {
  type: 'GPS_LOG';
  payload: {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
  };
}

// =============================================================================
// UNION TYPES
// =============================================================================

// Messages from parent to iframe
export type ParentToIframeMessage = 
  | SetTokenMessage
  | SetGroupMessage;

// Messages from iframe to parent
export type IframeToParentMessage = 
  | RequestTokenMessage
  | RequestGroupMessage
  | TokenRefreshMessage
  | IframeReadyMessage
  | StatsUpdateMessage
  | ErrorMessage
  | LogMessage;

// All possible messages
export type PostMessage = ParentToIframeMessage | IframeToParentMessage;

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isSetTokenMessage(message: BaseMessage): message is SetTokenMessage {
  return message.type === 'GPS_SET_TOKEN';
}

export function isSetGroupMessage(message: BaseMessage): message is SetGroupMessage {
  return message.type === 'GPS_SET_GROUP';
}

export function isRequestTokenMessage(message: BaseMessage): message is RequestTokenMessage {
  return message.type === 'GPS_REQUEST_TOKEN';
}

export function isRequestGroupMessage(message: BaseMessage): message is RequestGroupMessage {
  return message.type === 'GPS_REQUEST_GROUP';
}

export function isTokenRefreshMessage(message: BaseMessage): message is TokenRefreshMessage {
  return message.type === 'GPS_TOKEN_REFRESH';
}

export function isIframeReadyMessage(message: BaseMessage): message is IframeReadyMessage {
  return message.type === 'GPS_IFRAME_READY';
}

export function isStatsUpdateMessage(message: BaseMessage): message is StatsUpdateMessage {
  return message.type === 'GPS_STATS_UPDATE';
}

export function isErrorMessage(message: BaseMessage): message is ErrorMessage {
  return message.type === 'GPS_ERROR';
}

export function isLogMessage(message: BaseMessage): message is LogMessage {
  return message.type === 'GPS_LOG';
}

// Generic type guard for parent messages
export function isParentToIframeMessage(message: BaseMessage): message is ParentToIframeMessage {
  return isSetTokenMessage(message) || isSetGroupMessage(message);
}

// Generic type guard for iframe messages  
export function isIframeToParentMessage(message: BaseMessage): message is IframeToParentMessage {
  return isRequestTokenMessage(message) || 
         isRequestGroupMessage(message) ||
         isTokenRefreshMessage(message) ||
         isIframeReadyMessage(message) ||
         isStatsUpdateMessage(message) ||
         isErrorMessage(message) ||
         isLogMessage(message);
}

// =============================================================================
// MESSAGE VALIDATION
// =============================================================================

export function validateSetTokenMessage(message: any): message is SetTokenMessage {
  return message?.type === 'GPS_SET_TOKEN' &&
         typeof message?.payload?.token === 'string' &&
         message.payload.token.length > 0;
}

export function validateSetGroupMessage(message: any): message is SetGroupMessage {
  return message?.type === 'GPS_SET_GROUP' &&
         typeof message?.payload?.groupCode === 'string' &&
         message.payload.groupCode.length > 0;
}

export function validateStatsUpdateMessage(message: any): message is StatsUpdateMessage {
  return message?.type === 'GPS_STATS_UPDATE' &&
         typeof message?.payload?.activeVehicles === 'number' &&
         typeof message?.payload?.lastUpdate === 'string' &&
         ['online', 'offline', 'error', 'loading'].includes(message?.payload?.status);
}

// =============================================================================
// MESSAGE BUILDERS
// =============================================================================

export function createSetTokenMessage(token: string): SetTokenMessage {
  return {
    type: 'GPS_SET_TOKEN',
    payload: { token }
  };
}

export function createSetGroupMessage(groupCode: string): SetGroupMessage {
  return {
    type: 'GPS_SET_GROUP',
    payload: { groupCode }
  };
}

export function createRequestTokenMessage(): RequestTokenMessage {
  return {
    type: 'GPS_REQUEST_TOKEN'
  };
}

export function createRequestGroupMessage(): RequestGroupMessage {
  return {
    type: 'GPS_REQUEST_GROUP'
  };
}

export function createTokenRefreshMessage(): TokenRefreshMessage {
  return {
    type: 'GPS_TOKEN_REFRESH',
    payload: {
      reason: '401_unauthorized',
    },
  };
}

export function createIframeReadyMessage(version?: string, capabilities?: string[]): IframeReadyMessage {
  return {
    type: 'GPS_IFRAME_READY',
    payload: { version, capabilities }
  };
}

export function createStatsUpdateMessage(
  activeVehicles: number, 
  status: 'online' | 'offline' | 'error' | 'loading',
  errorMessage?: string
): StatsUpdateMessage {
  return {
    type: 'GPS_STATS_UPDATE',
    payload: {
      activeVehicles,
      lastUpdate: new Date().toISOString(),
      status,
      errorMessage
    }
  };
}

export function createErrorMessage(error: string, code?: string, details?: any): ErrorMessage {
  return {
    type: 'GPS_ERROR',
    payload: { error, code, details }
  };
}

export function createLogMessage(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any
): LogMessage {
  return {
    type: 'GPS_LOG',
    payload: { level, message, data }
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const MESSAGE_TYPES = {
  // Parent to iframe
  SET_TOKEN: 'GPS_SET_TOKEN' as const,
  SET_GROUP: 'GPS_SET_GROUP' as const,
  
  // Iframe to parent
  REQUEST_TOKEN: 'GPS_REQUEST_TOKEN' as const,
  REQUEST_GROUP: 'GPS_REQUEST_GROUP' as const,
  TOKEN_REFRESH: 'GPS_TOKEN_REFRESH' as const,
  IFRAME_READY: 'GPS_IFRAME_READY' as const,
  STATS_UPDATE: 'GPS_STATS_UPDATE' as const,
  ERROR: 'GPS_ERROR' as const,
  LOG: 'GPS_LOG' as const,
} as const;

export const LOG_LEVELS = {
  INFO: 'info' as const,
  WARN: 'warn' as const,
  ERROR: 'error' as const,
  DEBUG: 'debug' as const,
} as const;

export const STATS_STATUS = {
  ONLINE: 'online' as const,
  OFFLINE: 'offline' as const,
  ERROR: 'error' as const,
  LOADING: 'loading' as const,
} as const;