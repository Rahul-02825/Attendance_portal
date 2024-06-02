const express = require('express');
const connectDB = require('./config/db');
const passport = require('passport');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const path = require('path');
require('./config/Auth');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware
const corsoption = {
    origin: 'http://localhost:3000', // React app's URL
    credentials: true // Enable sending cookies with requests
};
app.use(cors(corsoption))
app.use(express.json());

// Session storage
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,  // Usually false unless your store does not implement the touch method
    saveUninitialized: false,  // False if you do not want to save empty sessions
    store: new MongoStore({ mongoUrl: 'mongodb://localhost/appdb', collectionName: "sessions" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24,
     } // 1 day
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Authentication Middleware
function ensureAuthenticated(req, res, next) {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    if (req.isAuthenticated()) {
        console.log('User is authenticated');
        return next();
    }
    console.log('User is not authenticated');
    res.status(401).json({ message: 'Not authenticated' });  
}

// Public Routes
app.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user._id });
});

app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});


// Apply ensureAuthenticated middleware to all /api routes
app.use('/api', ensureAuthenticated);

// API Routes
app.use('/api', formapi);
app.use('/api', getnameapi);
app.use('/api', jobapi);
app.use('/api', userapi);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
