# GPS API Documentation

## Base URL
```
https://api-d.gpsguard.eu/api/v1
```

## Authentication

All API requests require authentication using an Orion token in the Authorization header:

```http
Authorization: Orion YOUR_ACCESS_TOKEN
```

## Endpoints

### Get Groups

Retrieves a list of all available vehicle groups.

```http
GET /groups
```

**Headers:**
```http
Authorization: Orion YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Response:**
```json
[
  {
    "code": "GROUP_001",
    "name": "Fleet Alpha"
  },
  {
    "code": "GROUP_002", 
    "name": "Fleet Beta"
  }
]
```

**Response Codes:**
- `200` - Success
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

### Get Vehicles by Group

Retrieves vehicles for a specific group.

```http
GET /group/{groupCode}
```

**Path Parameters:**
- `groupCode` (string, required) - The code of the group to retrieve vehicles for

**Headers:**
```http
Authorization: Orion YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Example Request:**
```http
GET /group/GROUP_001
Authorization: Orion abc123def456
```

**Response:**
```json
[
  {
    "code": "VEHICLE_001",
    "name": "Truck Alpha 1",
    "spz": "BA123AB", 
    "speed": 45,
    "batteryPercentage": 85,
    "odometer": 125000,
    "lastPosition": {
      "lat": 48.1486,
      "lng": 17.1077
    },
    "lastPositionTimestamp": "2024-01-15T10:30:00.000Z"
  },
  {
    "code": "VEHICLE_002",
    "name": "Van Beta 2",
    "spz": "BA456CD",
    "speed": 0,
    "batteryPercentage": 92,
    "odometer": 89500,
    "lastPosition": {
      "lat": 48.1520,
      "lng": 17.1095
    },
    "lastPositionTimestamp": "2024-01-15T10:28:00.000Z"
  }
]
```

**Response Codes:**
- `200` - Success
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Group not found
- `500` - Internal Server Error

## Data Models

### Group Object

```typescript
interface Group {
  code: string;    // Unique group identifier
  name: string;    // Human-readable group name
}
```

### Vehicle Object

```typescript
interface Vehicle {
  code: string;                    // Unique vehicle identifier
  name: string;                    // Human-readable vehicle name
  spz: string;                     // License plate number
  speed: number;                   // Current speed in km/h
  batteryPercentage: number;       // Battery level (0-100)
  odometer: number;                // Total distance in kilometers
  lastPosition: {                  // Last known GPS position
    lat: number;                   // Latitude
    lng: number;                   // Longitude
  };
  lastPositionTimestamp: string;   // ISO 8601 timestamp
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes

- `INVALID_TOKEN` - The provided authorization token is invalid
- `EXPIRED_TOKEN` - The authorization token has expired
- `GROUP_NOT_FOUND` - The specified group code does not exist
- `INSUFFICIENT_PERMISSIONS` - User doesn't have access to the requested resource
- `RATE_LIMIT_EXCEEDED` - Too many requests in a short time period
- `SERVICE_UNAVAILABLE` - GPS service is temporarily unavailable

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **60 requests per minute** per token
- **1000 requests per hour** per token
- **10 concurrent connections** per token

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

When rate limits are exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995260

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

## Usage Examples

### JavaScript/TypeScript

```javascript
const API_BASE = 'https://api-d.gpsguard.eu/api/v1';
const TOKEN = 'your-access-token';

// Get all groups
async function getGroups() {
  const response = await fetch(`${API_BASE}/groups`, {
    headers: {
      'Authorization': `Orion ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Get vehicles for a group
async function getVehiclesByGroup(groupCode) {
  const response = await fetch(`${API_BASE}/group/${groupCode}`, {
    headers: {
      'Authorization': `Orion ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Usage
try {
  const groups = await getGroups();
  console.log('Available groups:', groups);
  
  if (groups.length > 0) {
    const vehicles = await getVehiclesByGroup(groups[0].code);
    console.log('Vehicles in first group:', vehicles);
  }
} catch (error) {
  console.error('API Error:', error);
}
```

### cURL Examples

**Get Groups:**
```bash
curl -X GET "https://api-d.gpsguard.eu/api/v1/groups" \
  -H "Authorization: Orion YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Get Vehicles:**
```bash
curl -X GET "https://api-d.gpsguard.eu/api/v1/group/GROUP_001" \
  -H "Authorization: Orion YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Best Practices

### Error Handling
```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Orion ${TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error ${response.status}: ${errorData.error.message}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}
```

### Caching
```javascript
class GPSAPICache {
  constructor(ttl = 30000) { // 30 seconds default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

const cache = new GPSAPICache();

async function getCachedVehicles(groupCode) {
  const cacheKey = `vehicles_${groupCode}`;
  let vehicles = cache.get(cacheKey);
  
  if (!vehicles) {
    vehicles = await getVehiclesByGroup(groupCode);
    cache.set(cacheKey, vehicles);
  }
  
  return vehicles;
}
```

### Retry Logic
```javascript
async function apiRequestWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest(url, options);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Webhook Support

*Note: Webhook functionality is planned for future API versions.*

Future webhook events will include:
- Vehicle position updates
- Battery level changes
- Speed threshold alerts
- Geofence entry/exit events

## API Versioning

The current API version is `v1`. Future versions will maintain backward compatibility where possible.

Version headers:
```http
API-Version: v1
```

## Support

For API support and questions:
- **Documentation**: [API Docs URL]
- **Support Email**: api-support@gpsguard.eu
- **Status Page**: [Status Page URL]