require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/warehouse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const partRoutes = require('./routes/parts');
const locationRoutes = require('./routes/locations');
const inwardItemRoutes = require('./routes/inwardItems');
const putawayRoutes = require('./routes/putaway');
const picklistRoutes = require('./routes/picklist');
const userRoutes = require('./routes/user');

// Use routes
app.use('/api/parts', partRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/inward-items', inwardItemRoutes);
app.use('/api/putaway', putawayRoutes);
app.use('/api/picklist', picklistRoutes);
app.use('/api/user', userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
