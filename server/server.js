const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/projects');
const inviteRoutes = require('./routes/inviteRoutes');
const taskRoutes = require('./routes/taskRoutes');




// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); 
  });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);       
app.use('/api/projects', projectRoutes); 
app.use('/api/invites', inviteRoutes);
app.use('/api/tasks', taskRoutes);




// Root route
app.get('/', (req, res) => {
  res.send('🌍 Welcome to Planova API');
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
