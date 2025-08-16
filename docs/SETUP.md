# Setup Guide

This guide will help you set up the Bitcoin Exchange platform on your local development environment or production server.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 15.0 or higher
- **Git** (for cloning the repository)

### Optional (for production)

- **Docker** and **Docker Compose**
- **Nginx** (reverse proxy)
- **SSL certificates** (for HTTPS)

### System Requirements

- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 10GB free space
- **Network**: Internet connection for Bitcoin price feeds

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/orangestandard/bitcoin-exchange.git
cd bitcoin-exchange
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

This will install dependencies for:
- Root project (for running scripts)
- Frontend (React application)
- Backend (Node.js API)

### 3. Verify Installation

Check that all tools are properly installed:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL
psql --version

# Verify dependencies are installed
cd frontend && npm list --depth=0
cd ../backend && npm list --depth=0
```

## Environment Configuration

### 1. Create Environment File

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your specific configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://bitcoin_user:bitcoin_password@localhost:5432/bitcoin_exchange"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars"

# Server Configuration
PORT=3001
NODE_ENV=development

# Bitcoin Network (testnet for development, mainnet for production)
BITCOIN_NETWORK=testnet

# Encryption Key for Private Keys (MUST be exactly 32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# External API Configuration
COINBASE_API_KEY=""  # Optional: for enhanced price feeds
BLOCKCYPHER_API_KEY=""  # Optional: for blockchain data

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
```

### 3. Generate Secure Keys

Generate secure keys for production:

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (exactly 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Database Setup

### 1. Install PostgreSQL

#### On macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### On Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On Windows
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database user
CREATE USER bitcoin_user WITH PASSWORD 'bitcoin_password';

# Create database
CREATE DATABASE bitcoin_exchange OWNER bitcoin_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bitcoin_exchange TO bitcoin_user;

# Exit PostgreSQL
\q
```

### 3. Verify Database Connection

Test the database connection:

```bash
psql -h localhost -U bitcoin_user -d bitcoin_exchange
```

### 4. Run Database Migrations

Set up the database schema:

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optionally, view the database
npx prisma studio
```

## Running the Application

### Development Mode

Start both frontend and backend in development mode:

```bash
# From the root directory
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:5173
- WebSocket server on ws://localhost:3001/ws

### Individual Services

You can also run services individually:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Production Build

Build the application for production:

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## Production Deployment

### Option 1: Docker Deployment (Recommended)

1. **Install Docker and Docker Compose**

2. **Configure production environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Build and deploy**
   ```bash
   # Build and start all services
   docker-compose up -d

   # Run database migrations
   docker-compose exec backend npx prisma migrate deploy
   ```

4. **Verify deployment**
   ```bash
   # Check service status
   docker-compose ps

   # View logs
   docker-compose logs -f
   ```

### Option 2: Manual Deployment

1. **Set up production server**
   - Ubuntu/Debian server with Node.js 18+
   - PostgreSQL 15+
   - Nginx (for reverse proxy)

2. **Clone and build**
   ```bash
   git clone https://github.com/orangestandard/bitcoin-exchange.git
   cd bitcoin-exchange
   npm run install:all
   npm run build
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Frontend
       location / {
           root /path/to/bitcoin-exchange/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # WebSocket
       location /ws {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
       }
   }
   ```

4. **Set up SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

5. **Create systemd service**
   ```bash
   sudo nano /etc/systemd/system/bitcoin-exchange.service
   ```

   ```ini
   [Unit]
   Description=Bitcoin Exchange API
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/bitcoin-exchange/backend
   ExecStart=/usr/bin/node dist/index.js
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable bitcoin-exchange
   sudo systemctl start bitcoin-exchange
   ```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error**: `ECONNREFUSED` or database connection failed

**Solutions**:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Ensure database exists: `psql -l`
- Check firewall settings

#### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solutions**:
- Kill process using the port: `lsof -ti:3001 | xargs kill -9`
- Change port in `.env` file
- Check for other running instances

#### 3. Prisma Migration Errors

**Error**: Prisma migration fails

**Solutions**:
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate`
- Check database permissions
- Verify DATABASE_URL format

#### 4. Frontend Build Errors

**Error**: Frontend build fails with TypeScript errors

**Solutions**:
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript version compatibility
- Update dependencies: `npm update`

#### 5. WebSocket Connection Issues

**Error**: WebSocket connection fails

**Solutions**:
- Check CORS_ORIGIN configuration
- Verify WebSocket URL in frontend
- Check firewall/proxy settings
- Test WebSocket connectivity

### Getting Help

1. **Check logs**:
   ```bash
   # Backend logs
   cd backend && npm run dev

   # Docker logs
   docker-compose logs -f backend
   ```

2. **Verify environment**:
   ```bash
   # Check environment variables
   printenv | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV)"
   ```

3. **Test API endpoints**:
   ```bash
   # Health check
   curl http://localhost:3001/health

   # Test database
   cd backend && npx prisma db push --preview-feature
   ```

4. **Common commands**:
   ```bash
   # Restart services
   npm run dev

   # Reset everything
   npm run clean && npm run install:all && npm run build

   # Database reset
   cd backend && npx prisma migrate reset
   ```

### Performance Optimization

1. **Database indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Implement Redis for session storage and caching
3. **CDN**: Use CDN for static assets in production
4. **Load balancing**: Use multiple backend instances for high traffic
5. **Monitoring**: Set up application monitoring and logging

### Security Checklist

- [ ] Strong JWT secrets (32+ characters)
- [ ] Secure encryption key (exactly 32 characters)
- [ ] HTTPS enabled in production
- [ ] Database password is strong
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive information
- [ ] Logs don't contain sensitive data
- [ ] Regular security updates applied

## Next Steps

After successful setup:

1. **Test the application**: Create a user account and test all features
2. **Configure monitoring**: Set up logging and error tracking
3. **Backup strategy**: Implement database backups
4. **Documentation**: Review API documentation
5. **Testing**: Run the test suite to ensure everything works

For additional help, please refer to:
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [GitHub Issues](https://github.com/orangestandard/bitcoin-exchange/issues)