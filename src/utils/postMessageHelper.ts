/**
 * PostMessage Helper Utilities
 * Simplified utilities for iframe communication
 */

import type { 
  PostMessage, 
  ParentToIframeMessage, 
  IframeToParentMessage,
  StatsUpdateMessage 
} from '@/types/postMessage';

export class PostMessageHelper {
  private static instance: PostMessageHelper;
  private messageHandlers: Map<string, Function[]> = new Map();

  static getInstance(): PostMessageHelper {
    if (!PostMessageHelper.instance) {
      PostMessageHelper.instance = new PostMessageHelper();
    }
    return PostMessageHelper.instance;
  }

  // Send message to parent window
  sendToParent(message: IframeToParentMessage) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }

  // Send message to iframe
  sendToIframe(iframe: HTMLIFrameElement, message: ParentToIframeMessage) {
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
    }
  }

  // Register message handler
  onMessage(type: string, handler: (payload: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  // Handle incoming message
  handleMessage(event: MessageEvent) {
    const message = event.data as PostMessage;
    if (message?.type) {
      const handlers = this.messageHandlers.get(message.type);
      handlers?.forEach(handler => handler(message.payload));
    }
  }

  // Quick methods for common messages
  requestToken() {
    this.sendToParent({ type: 'GPS_REQUEST_TOKEN' });
  }

  requestGroup() {
    this.sendToParent({ type: 'GPS_REQUEST_GROUP' });
  }

  sendStats(vehicleCount: number, groupCount: number, status: 'online' | 'offline' | 'error' | 'loading') {
    this.sendToParent({
      type: 'GPS_STATS_UPDATE',
      payload: {
        vehicleCount,
        groupCount,
        lastUpdate: new Date().toISOString(),
        status: status === 'loading' ? 'offline' : status,
      }
    });
  }

  notifyReady() {
    this.sendToParent({ type: 'GPS_IFRAME_READY' });
  }
}