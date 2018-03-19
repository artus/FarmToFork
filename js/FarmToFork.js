// Require dependencies.
const driver = require('bigchaindb-driver');
const bip39 = require('bip39');

// Require the dotenv library.
require('dotenv').config()

class FarmToFork {

    /**
     * Initialise a new class that we'll use to handle our connection with the network.
     */
    constructor() {
        // Initialise a new connection.
        this.connection = new driver.Connection(process.env.APP_URL, {
            app_id: process.env.APP_ID,
            app_key: process.env.APP_KEY
        });
    }

    // Here we'll write our methods.
}

// Create exports to make some functionality available in the browser.

module.exports = {
    FarmToFork
}