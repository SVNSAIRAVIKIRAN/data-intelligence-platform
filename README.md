# Data Intelligence Platform

A comprehensive full-stack web application demonstrating advanced Node.js development practices, including OAuth authentication, background processing, caching, and security implementations.

## 🚀 Features

- **Authentication & Authorization**
  - GitHub OAuth integration
  - Session management
  - Protected routes

- **Advanced Server Features**
  - Background task processing (Redis/Bull)
  - Server-side caching
  - Comprehensive logging
  - Rate limiting
  - Security implementations

- **API System**
  - RESTful endpoints
  - GitHub API integration
  - Rate limiting
  - Error handling

- **Frontend**
  - Responsive design
  - Password strength validation
  - Dynamic content loading
  - Real-time feedback

## 🛠️ Technical Stack

- **Backend**
  - Node.js
  - Express.js
  - Redis
  - Bull (job processing)
  - Passport.js
  - Winston & Morgan (logging)

- **Frontend**
  - EJS templates
  - HTML5/CSS3
  - Vanilla JavaScript

- **Security**
  - Helmet.js
  - CORS protection
  - Session security
  - Rate limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- Redis server
- GitHub account (for OAuth)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd data-intelligence-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Redis server**
   - Windows: Start Redis server from installation
   - Linux: `sudo service redis-server start`
   - Mac: `brew services start redis`

5. **Run the application**
   ```bash
   npm start
   ```

## 🔧 Configuration

Create a `.env` file with the following variables:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_session_secret
```

## 🌟 Key Features

### User Management
- GitHub OAuth login
- Profile management
- Activity tracking

### Background Processing
- Email queue system
- Report generation
- Job status tracking

### Performance
- Server-side caching
- Response compression
- API rate limiting

### Security
- OAuth 2.0 authentication
- Security headers
- Session protection
- CORS configuration

## 📁 Project Structure

```
├── config/
│   ├── logger.js     # Logging configuration
│   ├── queue.js      # Background jobs setup
│   └── cache.js      # Caching middleware
├── views/
│   ├── index.ejs     # Main application page
│   ├── login.ejs     # Login page
│   └── dashboard.ejs # User dashboard
├── logs/             # Application logs
├── server.js         # Main application file
└── package.json      # Dependencies
```

## 🔒 Security

- Helmet.js for security headers
- Rate limiting for API protection
- Secure session configuration
- CORS protection
- Password strength requirements

## 🚀 API Endpoints

### Authentication
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - OAuth callback

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Background Tasks
- `POST /api/send-welcome-email` - Queue welcome email
- `POST /api/generate-report` - Start report generation
- `GET /api/report-status/:jobId` - Check report status

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- Your Name - S V N SAI RAVI KIRAN

## 🙏 Acknowledgments

- GitHub OAuth team
- Redis team
- Bull queue maintainers
- Express.js team
