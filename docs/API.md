# API Documentation

## Overview

The Bitcoin Exchange API provides a comprehensive set of endpoints for managing user authentication, Bitcoin wallets, trading operations, and guest purchases. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
Production: https://api.bitcoinexchange.com
Development: http://localhost:3001/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to get a new access token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 10 requests per 15 minutes per IP
- Trading endpoints: 20 requests per minute per IP
- Guest endpoints: 5 requests per hour per IP

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Authentication Endpoints

### Register User

Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John", // optional
  "lastName": "Doe"    // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "wallet": {
      "id": "wallet-id",
      "userId": "user-id",
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "balanceBtc": 0,
      "balanceUsd": 0,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  },
  "message": "User registered successfully"
}
```

### Login User

Authenticate an existing user.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as register response.

### Get Profile

Get the current user's profile information.

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "wallet": {
      "id": "wallet-id",
      "userId": "user-id",
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "balanceBtc": 0.12345678,
      "balanceUsd": 5000.00,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Profile

Update user profile information.

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

### Logout

Logout the current user.

```http
POST /auth/logout
Authorization: Bearer <token>
```

## Wallet Endpoints

### Get Wallet Balance

Get the current wallet balance and address.

```http
GET /wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balanceBtc": 0.12345678,
    "balanceUsd": 5000.00,
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "currentPrice": 40500.00
  }
}
```

### Send Bitcoin

Send Bitcoin to another address.

```http
POST /wallet/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "toAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "amountBtc": 0.001,
  "description": "Payment for services" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txId": "transaction-hash",
    "fee": 0.0001,
    "transaction": {
      "id": "transaction-id",
      "type": "SEND",
      "amountBtc": 0.001,
      "amountUsd": 40.50,
      "fee": 0.0001,
      "status": "PENDING",
      "toAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "description": "Payment for services",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  },
  "message": "Bitcoin sent successfully"
}
```

### Get Receive Address

Get the wallet's receive address and QR code.

```http
GET /wallet/receive
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### Get Transactions

Get transaction history with pagination.

```http
GET /wallet/transactions?page=1&limit=20&type=BUY
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `type` (optional): Transaction type filter (BUY, SELL, SEND, RECEIVE)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-id",
        "type": "BUY",
        "amountBtc": 0.001,
        "amountUsd": 40.50,
        "fee": 0.0001,
        "status": "CONFIRMED",
        "txHash": "transaction-hash",
        "description": "Bitcoin purchase",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

## Trading Endpoints

### Get Market Data

Get current Bitcoin price and market statistics.

```http
GET /trading/market
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPrice": 40500.00,
    "stats": {
      "current": 40500.00,
      "change24h": 1200.50,
      "changePercent24h": 3.05,
      "high24h": 41000.00,
      "low24h": 39500.00,
      "timestamp": "2023-01-01T00:00:00.000Z"
    },
    "historicalPrices": [
      {
        "price": 40000.00,
        "timestamp": "2023-01-01T00:00:00.000Z"
      }
    ],
    "lastUpdate": "2023-01-01T00:00:00.000Z"
  }
}
```

### Buy Bitcoin

Purchase Bitcoin with USD.

```http
POST /trading/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "amountUsd": 1000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-id",
      "type": "BUY",
      "amountBtc": 0.02464135,
      "amountUsd": 990.00,
      "price": 40500.00,
      "status": "COMPLETED",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "completedAt": "2023-01-01T00:00:00.000Z"
    },
    "transaction": {
      "id": "transaction-id",
      "type": "BUY",
      "amountBtc": 0.02464135,
      "amountUsd": 990.00,
      "fee": 0.00024641,
      "status": "CONFIRMED",
      "description": "Buy Bitcoin for $1000"
    },
    "newBalance": {
      "balanceBtc": 0.14809813,
      "balanceUsd": 5990.00
    }
  },
  "message": "Bitcoin purchased successfully"
}
```

### Sell Bitcoin

Sell Bitcoin for USD.

```http
POST /trading/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "amountBtc": 0.001
}
```

### Get Orders

Get trading order history.

```http
GET /trading/orders?page=1&limit=20&type=BUY
Authorization: Bearer <token>
```

### Get Price History

Get historical price data for charts.

```http
GET /trading/price-history?hours=24&limit=100
```

**Query Parameters:**
- `hours` (optional): Time range in hours (default: 24)
- `limit` (optional): Maximum number of data points (default: 100)

## Guest Endpoints

### Guest Bitcoin Purchase

Allow guests to purchase Bitcoin without creating an account.

```http
POST /guest/buy
Content-Type: application/json

{
  "email": "guest@example.com",
  "amountUsd": 100.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseId": "purchase-id",
    "amountBtc": 0.00246914,
    "amountUsd": 98.50,
    "fee": 1.50,
    "walletAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "txHash": "transaction-hash"
  },
  "message": "Bitcoin purchased successfully"
}
```

### Convert Guest Account

Convert a guest purchase into a full user account.

```http
POST /guest/convert
Content-Type: application/json

{
  "purchaseId": "purchase-id",
  "password": "securepassword123",
  "firstName": "John", // optional
  "lastName": "Doe"    // optional
}
```

### Get Guest Purchase

Get details of a guest purchase.

```http
GET /guest/purchase/{purchaseId}
```

## WebSocket API

Connect to the WebSocket endpoint for real-time updates:

```
ws://localhost:3001/ws
```

### Message Format

All WebSocket messages follow this format:

```json
{
  "type": "MESSAGE_TYPE",
  "data": {},
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Price Updates

Receive real-time Bitcoin price updates:

```json
{
  "type": "PRICE_UPDATE",
  "data": {
    "priceUsd": 40500.00,
    "change24h": 1200.50,
    "changePercent24h": 3.05,
    "source": "coinbase"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Keep Alive

Send ping messages to keep the connection alive:

```json
{
  "type": "PING"
}
```

Server will respond with:

```json
{
  "type": "PONG",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

// Get balance
const getBalance = async () => {
  const response = await client.get('/wallet/balance');
  return response.data;
};
```

### Python

```python
import requests

class BitcoinExchangeAPI:
    def __init__(self, base_url='http://localhost:3001/api'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        data = response.json()
        if data['success']:
            self.token = data['data']['token']
        return data
    
    def get_balance(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/wallet/balance', headers=headers)
        return response.json()
```

## Testing

Use the provided Postman collection or curl commands to test the API:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get balance (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/wallet/balance \
  -H "Authorization: Bearer TOKEN"
```