// config.js

module.exports = {
    // Database configuration
    database: {
        host: 'your_database_host',
        port: 'your_database_port',
        user: 'your_database_user',
        password: 'your_database_password',
        database: 'your_database_name',
    },

    // Server configuration
    server: {
        port: process.env.PORT || 8000, // Use the provided PORT environment variable or default to 8000
    },

    // JWT secret key for authentication
    secretKey: 'your_secret_key_for_jwt',
};