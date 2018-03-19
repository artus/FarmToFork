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

        this.currentIdentity = this.generateKeypair("ftf");
    }

    // Here we'll write our methods.

    /**
     * Generate a keypair based on the supplied seed string.
     * @param {string} keySeed - The seed that should be used to generate the keypair.
     */
    generateKeypair(keySeed) {
        if (typeof keySeed == "undefined" || keySeed == "") return new driver.Ed25519Keypair();
        return new driver.Ed25519Keypair(bip39.mnemonicToSeed(keySeed).slice(0, 32));
    }
}

// Create exports to make some functionality available in the browser.

module.exports = {
    FarmToFork
}