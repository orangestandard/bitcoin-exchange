# Bitcoin Exchange Platform

A comprehensive Bitcoin-only exchange platform built with modern technologies. Features include user authentication, Bitcoin wallet management, real-time trading, guest purchases, and a modern responsive UI.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure JWT-based authentication with refresh tokens
- **Bitcoin Wallet** - HD wallet generation with encrypted private key storage
- **Real-time Trading** - Buy and sell Bitcoin with live price updates
- **Guest Purchases** - Buy Bitcoin without creating an account
- **Transaction History** - Complete transaction and order management
- **WebSocket Integration** - Real-time price updates and notifications

### Security Features
- AES-256 encrypted private key storage
- Rate limiting on all API endpoints
- Input validation and sanitization
- CORS protection
- Secure headers with Helmet
- Password hashing with bcrypt

### Modern UI/UX
- Responsive design for mobile, tablet, and desktop
- Dark/light theme support with system preference detection
- Smooth animations with Framer Motion
- Real-time updates using WebSocket
- Toast notifications for user feedback
- Loading states and skeleton screens

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **WebSocket** client for real-time updates

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **JWT** authentication
- **WebSocket** server for real-time updates
- **Winston** for logging

### Bitcoin Integration
- **bitcoinjs-lib** for Bitcoin operations
- **HD Wallet** implementation
- **Address validation** and QR code generation
- **Testnet** support for development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/orangestandard/bitcoin-exchange.git
   cd bitcoin-exchange
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**
   ```bash
   cd ..
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

The application will be available at http://localhost:3000

### Individual Service Commands

```bash
# Start only the database
docker-compose up -d postgres

# Build and start backend
docker-compose up -d backend

# Build and start frontend
docker-compose up -d frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📁 Project Structure

```
bitcoin-exchange/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # CSS and styling
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # API route controllers
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docs/                    # Documentation
├── docker-compose.yml       # Docker configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bitcoin_exchange"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server Configuration
PORT=3001
NODE_ENV=development

# Bitcoin Network
BITCOIN_NETWORK=testnet

# Encryption Key (32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# CORS Origin
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE bitcoin_exchange;
   ```

2. **Run migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Wallet Endpoints
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/send` - Send Bitcoin
- `GET /api/wallet/receive` - Get receive address
- `GET /api/wallet/transactions` - Get transaction history

### Trading Endpoints
- `GET /api/trading/market` - Get market data
- `POST /api/trading/buy` - Buy Bitcoin
- `POST /api/trading/sell` - Sell Bitcoin
- `GET /api/trading/orders` - Get order history
- `GET /api/trading/price-history` - Get price history

### Guest Endpoints
- `POST /api/guest/buy` - Guest Bitcoin purchase
- `POST /api/guest/convert` - Convert guest account
- `GET /api/guest/purchase/:id` - Get purchase details

## 🔄 WebSocket Events

### Client → Server
- `PING` - Keep connection alive

### Server → Client
- `PRICE_UPDATE` - Real-time Bitcoin price updates
- `TRANSACTION_UPDATE` - Transaction status updates
- `BALANCE_UPDATE` - Wallet balance updates

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL certificates
5. Configure reverse proxy (Nginx)

### Security Checklist
- [ ] Strong encryption keys
- [ ] Secure JWT secrets
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] HTTPS enabled
- [ ] Database secured
- [ ] Firewall configured
- [ ] Logs monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a demonstration platform for educational purposes. For production use:
- Implement proper Bitcoin node integration
- Add comprehensive security auditing
- Implement proper payment processing
- Add regulatory compliance features
- Conduct thorough security testing

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the API documentation

## 🔄 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced charting and technical analysis
- [ ] Multi-signature wallet support
- [ ] Lightning Network integration
- [ ] Advanced order types (limit, stop-loss)
- [ ] API for third-party integrations
- [ ] Admin dashboard
- [ ] KYC/AML compliance features