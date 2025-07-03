# Message Board Dashboard

A real-time message board application built with Next.js that displays streaming messages with authentication and Docker deployment capabilities.

## Features

- 🚀 **Real-time messaging** - Server-Sent Events (SSE) for live message streaming
- 🔐 **API Key Authentication** - Secure message posting with API key validation
- 📊 **Live Dashboard** - Clean table interface with real-time message display
- 🔄 **Auto-management** - Automatic message scrolling and old message removal
- 🐳 **Docker Ready** - Full containerization with environment variable support
- ⚙️ **Configurable** - Environment-based configuration for easy deployment

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18
- **Containerization**: Docker & Docker Compose

## Quick Start

### Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd message_board
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Dashboard: `http://localhost:3001`
   - API: `http://localhost:3001/api/message`

### Production with Docker

1. **Start with Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application**:
   - Dashboard: `http://localhost:3001`

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
API_KEY=your-secret-api-key-here
PORT=3001
```

- `API_KEY`: Secret key required for posting messages
- `PORT`: Port number for the application (default: 3001)

## API Usage

### Get Single Message

```bash
curl http://localhost:3001/api/message
```

### Stream Messages (SSE)

```bash
curl -N "http://localhost:3001/api/message?stream=true"
```

### Post Message (Authenticated)

```bash
curl -X POST http://localhost:3001/api/message \
  -H "Content-Type: application/json" \
  -H "apiKey: your-secret-api-key-here" \
  -d '{"message": "Hello World!", "type": "info"}'
```

### Response Format

```json
{
  "id": 1751571567708,
  "timestamp": "2025-07-03T19:39:27.708Z",
  "message": "Hello World!",
  "type": "info"
}
```

## Dashboard Features

### Real-time Display
- Messages appear instantly when posted via API
- Connection status indicator (green/red dot)
- Live message counter

### Table Interface
- **ID**: Unique timestamp-based identifier
- **Timestamp**: Formatted date and time
- **Type**: Message category with color-coded badges
- **Message**: Content text

### Auto-management
- Automatically scrolls to show latest messages
- Removes oldest messages when exceeding 20 entries
- Maintains smooth performance with large message volumes

## Architecture

### Message Flow
```
POST /api/message → Authentication → Broadcast → SSE Stream → Dashboard
```

### Components

#### API Layer (`app/api/message/route.ts`)
- **GET**: Streaming endpoint with Server-Sent Events
- **POST**: Authenticated message submission
- **Broadcasting**: Real-time message distribution to all connected clients

#### Dashboard (`app/page.tsx`)
- **EventSource**: SSE client for real-time updates
- **State Management**: React hooks for message buffer
- **Auto-scroll**: Automatic UI updates and cleanup

### Security
- API key validation for all POST requests
- CORS headers for cross-origin support
- Non-root user execution in Docker container

## Docker Deployment

### Build and Run
```bash
# Start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Health Monitoring
The container includes health checks that verify API availability:
```bash
# Check container health
docker-compose ps
```

### Docker Configuration

#### Dockerfile Features
- Multi-stage build for optimized image size
- Non-root user for security
- Production-ready Next.js build
- Alpine Linux base for minimal footprint

#### Docker Compose Features
- Environment variable integration
- Port mapping from .env file
- Health checks with automatic restarts
- Volume-free deployment

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
├── app/
│   ├── api/message/route.ts    # API endpoints
│   ├── globals.css             # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Dashboard component
├── .env                       # Environment variables
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Container definition
└── package.json              # Dependencies
```

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Change PORT in .env file
PORT=3002
```

**API key authentication fails**:
```bash
# Verify API key in .env matches request header
API_KEY=your-secret-key
```

**Docker build fails**:
```bash
# Clean Docker cache
docker-compose down
docker system prune
docker-compose up --build
```

### Health Check Status
If container shows "unhealthy":
```bash
# Check logs for errors
docker-compose logs message-board

# Verify API accessibility
curl http://localhost:3001/api/message
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Docker logs: `docker-compose logs`
- Verify environment configuration
- Test API endpoints manually