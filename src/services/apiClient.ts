import { createTokenRefreshMessage } from '@/types/postMessage';

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private getTokenFromGpsService(): string {
    // Import dynamically to avoid circular dependency
    const { gpsService } = require('./gpsService');
    return gpsService.getToken();
  }

  private async waitForNewToken(maxWaitTime: number = 10000): Promise<string> {
    const startTime = Date.now();
    const initialToken = this.getTokenFromGpsService();
    
    return new Promise((resolve, reject) => {
      const checkToken = () => {
        const currentToken = this.getTokenFromGpsService();
        
        // If token changed from initial, we got a new one
        if (currentToken && currentToken !== initialToken) {
          console.log('✅ New token received for retry');
          resolve(currentToken);
          return;
        }
        
        // If we've waited too long, reject
        if (Date.now() - startTime > maxWaitTime) {
          reject(new Error('Timeout waiting for new token'));
          return;
        }
        
        // Check again in 500ms
        setTimeout(checkToken, 500);
      };
      
      checkToken();
    });
  }

  private async requestNewToken(): Promise<void> {
    console.log('🔄 Requesting token refresh from parent');
    
    try {
      // Send refresh message to parent
      const refreshMessage = createTokenRefreshMessage();
      window.parent.postMessage(refreshMessage, '*');
    } catch (error) {
      console.error('❌ Failed to request token refresh:', error);
      throw new Error('Unable to request token refresh from parent');
    }
  }

  async request<T = any>(config: RequestConfig, retryCount: number = 0): Promise<ApiResponse<T>> {
    const { url, method = 'GET', headers = {}, body, timeout = 12000 } = config;
    const token = this.getTokenFromGpsService();
    
    console.log(`🚀 API Request (attempt ${retryCount + 1}):`, { url, method, hasToken: !!token });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Add authorization header if token exists
      const requestHeaders = {
        'accept': '*/*',
        ...headers,
        ...(token && { 'Authorization': `Orion ${token}` }),
      };
      
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body,
        signal: controller.signal,
      });
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.warn('🔐 Received 401 Unauthorized');
        
        // If we're in production mode and haven't exceeded retry limit
        if (window.location.hostname !== 'localhost' && retryCount < 2) {
          console.log(`🔄 Attempting token refresh (retry ${retryCount + 1}/2)`);
          
          try {
            // Request new token from parent
            await this.requestNewToken();
            
            // Wait for new token
            await this.waitForNewToken();
            
            // Retry the request with new token
            return this.request<T>(config, retryCount + 1);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            throw new Error(`Token refresh failed: ${refreshError}`);
          }
        } else {
          // Max retries exceeded or not in production
          const errorText = await response.text().catch(() => '');
          throw new Error(`HTTP 401: Unauthorized - ${errorText}`);
        }
      }
      
      // Handle other error status codes
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`❌ API Error: HTTP ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      // Parse successful response
      const data = await response.json();
      console.log('✅ API Request successful');
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
      
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('⏱️ API Request timeout');
        throw new Error('Request timeout');
      }
      
      console.error('💥 API Request error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const apiClient = new ApiClient();
export type { RequestConfig, ApiResponse };