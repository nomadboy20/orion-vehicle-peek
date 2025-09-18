// Parent window handler for iframe communication
// This code should be added to the parent page that contains the iframe

class IframeHandler {
  constructor(iframeSelector) {
    this.iframeSelector = iframeSelector;
    this.iframe = null;
    this.accessToken = null;
    this.groupCode = null;
    this.init();
  }

  init() {
    // Find the iframe element
    this.iframe = document.querySelector(this.iframeSelector);
    
    if (!this.iframe) {
      console.error('Iframe not found with selector:', this.iframeSelector);
      return;
    }

    // Listen for messages from iframe
    window.addEventListener('message', this.handleMessage.bind(this));
    
    console.log('📡 Parent: Iframe handler initialized');
  }

  // Get iframe reference
  getIframe() {
    return this.iframe;
  }

  // Set access token (call this when you have the token)
  setAccessToken(token) {
    this.accessToken = token;
    console.log('🔑 Parent: Access token set');
    
    // Send token to iframe if it's ready
    if (this.iframe && this.iframe.contentWindow) {
      this.sendAccessToken();
    }
  }

  // Set group code (call this when you have the group code)
  setGroupCode(groupCode) {
    this.groupCode = groupCode;
    console.log('🏷️ Parent: Group code set to:', groupCode);
    
    // Send group code to iframe if it's ready
    if (this.iframe && this.iframe.contentWindow) {
      this.sendGroupCode();
    }
  }

  // Handle messages from iframe
  handleMessage(event) {
    // Verify origin if needed (recommended for security)
    // if (event.origin !== 'your-expected-origin') return;
    
    const data = event.data;
    console.log('📨 Parent: Received message from iframe:', data);

    switch (data.type) {
      case 'request_access_token':
        console.log('📤 Parent: Iframe requested access_token');
        this.sendAccessToken();
        break;
        
      case 'request_group_code':
        console.log('📤 Parent: Iframe requested group_code');
        this.sendGroupCode();
        break;
        
      default:
        console.log('📨 Parent: Unknown message type:', data.type);
    }
  }

  // Send access token to iframe
  sendAccessToken() {
    if (this.accessToken && this.iframe && this.iframe.contentWindow) {
      console.log('🔑 Parent: Sending access_token to iframe');
      this.iframe.contentWindow.postMessage({
        access_token: this.accessToken
      }, '*');
    } else {
      console.warn('⚠️ Parent: Cannot send access_token - missing token or iframe not ready');
    }
  }

  // Send group code to iframe
  sendGroupCode() {
    if (this.groupCode && this.iframe && this.iframe.contentWindow) {
      console.log('🏷️ Parent: Sending group_code to iframe');
      this.iframe.contentWindow.postMessage({
        group_code: this.groupCode
      }, '*');
    } else {
      console.warn('⚠️ Parent: Cannot send group_code - missing code or iframe not ready');
    }
  }

  // Send both token and group code
  sendBothData() {
    if (this.accessToken && this.groupCode && this.iframe && this.iframe.contentWindow) {
      console.log('📦 Parent: Sending both access_token and group_code to iframe');
      this.iframe.contentWindow.postMessage({
        access_token: this.accessToken,
        group_code: this.groupCode
      }, '*');
    }
  }
}

// Usage example:
// const iframeHandler = new IframeHandler('#my-iframe'); // or '.iframe-class'
// 
// // Set your data when available
// iframeHandler.setAccessToken('your-jwt-token-here');
// iframeHandler.setGroupCode('your-group-code-here');
//
// // Or set data-group-code attribute on iframe element:
// iframeHandler.getIframe().setAttribute('data-group-code', 'your-group-code');

// Alternative simple implementation without class:
function setupIframeMessaging(iframeSelector) {
  const iframe = document.querySelector(iframeSelector);
  let accessToken = null;
  let groupCode = null;
  
  if (!iframe) {
    console.error('Iframe not found');
    return;
  }

  // Listen for iframe messages
  window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data.type === 'request_access_token' && accessToken) {
      iframe.contentWindow.postMessage({ access_token: accessToken }, '*');
    }
    
    if (data.type === 'request_group_code' && groupCode) {
      iframe.contentWindow.postMessage({ group_code: groupCode }, '*');
    }
  });

  // Return functions to set data
  return {
    setAccessToken: (token) => {
      accessToken = token;
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ access_token: token }, '*');
      }
    },
    setGroupCode: (code) => {
      groupCode = code;
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ group_code: code }, '*');
      }
    }
  };
}

// Simple usage:
// const messaging = setupIframeMessaging('#my-iframe');
// messaging.setAccessToken('your-token');
// messaging.setGroupCode('your-group-code');