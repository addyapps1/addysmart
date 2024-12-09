// Import dependencies
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception occurred:', err);
    process.exit(1);
});

// Environment variables
dotenv.config({ path: './config.env' });
console.log("NODE_ENV:",process.env.NODE_ENV); // Should output 'development'
const { NODE_ENV, DEV_HOST, PROD_HOST, HOSTED_CONN, LOCAL_CONN, PORT, NODE_SERVER_NAME } = process.env;
const HOST = NODE_ENV === 'development' ? DEV_HOST : PROD_HOST;
const URL = NODE_ENV === 'development' ? LOCAL_CONN : HOSTED_CONN;
const port = PORT || 7990;

// Database connection
mongoose.connect(URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
});

const connection = mongoose.connection;
connection.on('open', () => {
    console.log('Mongoose connected with mongoDB');
});
connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection occurred:', err);
    process.exit(1);
});

// Start the server
const server = app.listen(port, () => {
    // const address = server.address();
    console.log(`${NODE_SERVER_NAME} Server is running in ${NODE_ENV} mode on http://localhost:${port}`);
    console.log(`Client URL: http://${HOST}`);
    console.log('Waiting for database connection...');
});

// Gracefully handle shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});


// // CREATE A SERVER
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');


// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//     console.error('Uncaught Exception occurred:', err);
//     process.exit(1);
// });


// // Environment variables
// dotenv.config({ path: './config.env' });
// const { NODE_ENV, DEV_HOST, PROD_HOST, HOSTED_CONN, LOCAL_CONN, PORT, NODE_SERVER_NAME} = process.env;
// const HOST = NODE_ENV === 'development' ? DEV_HOST : PROD_HOST;
// const URL = NODE_ENV === 'development' ? LOCAL_CONN : HOSTED_CONN;
// const port = PORT || 7990;

// // Requiring app module
// const app = require('./app');

// // Database connection
// mongoose.connect(URL, {   
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//     // useFindAndModify: false,
//     // useCreateIndex: true
// });

// const connection = mongoose.connection;
// connection.on('open', () => {
//     console.log('Mongoose connected with mongoDB')
// })
// connection.on('error', (err) => {
//     console.error('MongoDB connection error:', err);
// });

// // Handle unhandled rejections
// process.on('unhandledRejection', (err) => {
//     console.error('Unhandled Rejection occurred:', err);
//     process.exit(1);
// });

// // Start the server
// const server = app.listen(port, () => {
//     // const address = server.address();
//     console.log(`${NODE_SERVER_NAME} Server is running in ${NODE_ENV} mode on http://localhost:${port}`);
//     console.log(`Client URL: http://${HOST}`);
//     console.log('Waiting for database connection...');
// });

// // Gracefully handle shutdown
// process.on('SIGTERM', () => {
//     console.log('SIGTERM received. Shutting down gracefully...');
//     server.close(() => {
//         console.log('Server closed.');
//         process.exit(0);
//     });
// });
