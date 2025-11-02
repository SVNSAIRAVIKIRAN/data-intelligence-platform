require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

// Import custom configurations
const logger = require('./config/logger');
const { emailQueue, reportQueue } = require('./config/queue');
const { cacheMiddleware } = require('./config/cache');

const app = express();

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
}

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Security Middleware
app.use(helmet()); // Add security headers
app.use(cors());
app.use(compression()); // Compress responses

// Logging Middleware
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Basic Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter); // Apply rate limiting to all routes

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Store the access token for later API calls
    profile.accessToken = accessToken;
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Temporary data store (in-memory array)
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];

// ===========================
// 1️⃣ RESTful API ENDPOINTS
// ===========================

// GET all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET one user
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST (Create) new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "Name and email required" });

  const newUser = { id: Date.now(), name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT (Update) user
app.put('/api/users/:id', (req, res) => {
  const { name, email } = req.body;
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });

  user.name = name || user.name;
  user.email = email || user.email;
  res.json(user);
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.json({ message: "User deleted successfully" });
});

// ===========================
// Authentication Routes
// ===========================

// GitHub OAuth routes
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] })
);

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  }
);

// Check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// ===========================
// Web Routes
// ===========================

// Render the registration form
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Dashboard (protected route with caching)
app.get('/dashboard', ensureAuthenticated, cacheMiddleware(300), async (req, res) => {
    try {
        // Get user's GitHub repositories using GitHub API
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `token ${req.user.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Log the activity
        logger.info(`User ${req.user.username} accessed dashboard`);

        res.render('dashboard', {
            user: req.user,
            repos: response.data
        });
    } catch (error) {
        logger.error('Dashboard error:', error);
        next(error);
    }
});

// Example of background email task
app.post('/api/send-welcome-email', ensureAuthenticated, async (req, res) => {
    try {
        // Add email job to queue
        await emailQueue.add({
            to: req.user.emails[0].value,
            subject: 'Welcome to our platform!',
            content: `Hello ${req.user.username}, welcome to our platform!`
        });

        res.json({ message: 'Welcome email queued' });
    } catch (error) {
        logger.error('Email queue error:', error);
        next(error);
    }
});

// Example of background report generation
app.post('/api/generate-report', ensureAuthenticated, async (req, res) => {
    try {
        const job = await reportQueue.add({
            userId: req.user.id,
            reportType: 'activity'
        });

        res.json({
            message: 'Report generation started',
            jobId: job.id
        });
    } catch (error) {
        logger.error('Report generation error:', error);
        next(error);
    }
});

// Check report status
app.get('/api/report-status/:jobId', ensureAuthenticated, async (req, res) => {
    try {
        const job = await reportQueue.getJob(req.params.jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        res.json({
            id: job.id,
            state,
            result
        });
    } catch (error) {
        logger.error('Report status check error:', error);
        next(error);
    }
});

// Handle form submission
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  // Create new user
  const newUser = {
    id: Date.now(),
    name: email.split('@')[0], // Use part of email as name
    email: email
  };
  
  users.push(newUser);
  
  // Render result page
  res.render('result', {
    name: newUser.name,
    email: newUser.email,
    message: 'Registration completed successfully!'
  });
});

// ===========================
// Start server
// ===========================
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));