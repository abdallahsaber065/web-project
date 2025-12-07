/**
 * Netlify Serverless Function
 * 
 * Wraps the Express app for serverless deployment on Netlify.
 */

const serverless = require('serverless-http');

// Set environment before importing the app
process.env.SERVERLESS = 'true';

const app = require('../../backend/src/server');

// Export the serverless handler
module.exports.handler = serverless(app);

