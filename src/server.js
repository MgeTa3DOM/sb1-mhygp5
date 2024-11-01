const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const socketIO = require('socket.io');
const { createServer } = require('http');
const routes = require('./routes');
const { setupWebhooks } = require('./webhooks');
const { initializeIntegrations } = require('./integrations');
const config = require('./config');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = socketIO(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(config.mongoUri)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Initialize integrations
initializeIntegrations();

// Setup routes
app.use('/api', routes);

// Setup webhooks
setupWebhooks(app);

// WebSocket handling
io.on('connection', (socket) => {
  logger.info('New client connected');
  require('./websockets/handlers')(socket, io);
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});