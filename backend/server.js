const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const sequelize = require('./config/db');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const cookieParser = require('cookie-parser');
const path = require('path')

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

// Test Sequelize connection
sequelize.authenticate()
  .then(() => console.log('MySQL DB connected successfully.'))
  .catch((err) => console.error('Unable to connect to DB:', err));

// CREATE AND UPDATE THE SCHEMA 
//  const { syncDatabase } = require('./models');
// syncDatabase(); 

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)


// Start the server
app.listen(4000, () => {
  console.log(`Server running on http://localhost:4000`);
});
