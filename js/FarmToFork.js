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
            app_key: process.env.APP_KEY,
        });
        //this.connection = new driver.Connection(process.env.APP_URL);

        this.currentIdentity = this.generateKeypair("ftf");
    }

    // Here we'll write our methods.

    /**
     * Generate a keypair based on the supplied seed string.
     * @param {string} keySeed - The seed that should be used to generate the keypair.
     * @returns {*} The generated keypair.
     */
    generateKeypair(keySeed) {
        if (typeof keySeed == "undefined" || keySeed == "") return new driver.Ed25519Keypair();
        return new driver.Ed25519Keypair(bip39.mnemonicToSeed(keySeed).slice(0, 32));
    }

    createAsset(foodItem) {

        return new Promise((resolve, reject) => {

            // Create asset object.
            const assetData = {
                "type": "FtfTutorialAsset",
                "item": foodItem,
            };

            // Create metadata object.
            const metaData = {
                "action": "Introduced",
                "date": new Date().toISOString(),
            };

            // Create a CREATE transaction.
            const introduceFoodItemToMarketTransaction = driver.Transaction.makeCreateTransaction(

                // Include the foodItem as asset data.
                assetData,
                // Include metadata to give information on the action.
                metaData,
                // Create an output.
                [driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(this.currentIdentity.publicKey))],
                // Include the public key
                this.currentIdentity.publicKey
            );

            // We sign the transaction
            const signedTransaction = driver.Transaction.signTransaction(introduceFoodItemToMarketTransaction, this.currentIdentity.privateKey);

            // Post the transaction to the network
            this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {

                // Let the promise resolve the created transaction.
                resolve(postedTransaction);

                // Catch exceptions
            }).catch(err => {

                reject(err);
            })
        });

    }

    /**
     * Get a list of ids of unspent transactions for a certain public key.
     * @returns {Array} An array containing all unspent transactions for a certain public key.
     */
    getAssets() {

        return new Promise((resolve, reject) => {

            // Get a list of ids of unspent transactions from a public key.
            this.connection.listOutputs(this.currentIdentity.publicKey, false).then(response => {

                resolve(response);
            });
        }).catch(err => {
            reject(err);
        })

    }

    /**
     * Get a list of all assets that belong to our POC. (they contain the string 'FtfTutorialAsset)
     * 
     * @returns {Array} The array of all assets that belong to our POC.
     */
    getAllAssets() {

        return new Promise((resolve, reject) => {

            this.connection.searchAssets('FtfTutorialAsset').then(response => {
                resolve(response);
            });

        }).catch(error => {
            reject(error);
        })
    }

    /**
     * Load a transaction by using its transaction id.
     * @param {*} transactionId 
     */
    loadTransaction(transactionId) {
        return new Promise((resolve, reject) => {

            // Get the transaction by its ID.
            this.connection.getTransaction(transactionId).then(response => {
                resolve(response);
            }).catch(err => {
                reject(err);
            })
        });
    }

    /**
     * Update the asset by issuing a TRANSFER transaction with metadata containing the action performed on the asset.
     * 
     * @param {*} transaction - The transaction that needs to be chained upon.
     * @param {*} action - The action performed on the asset (e.g. processed with preservative).
     */
    updateAsset(transaction, action) {

        return new Promise((resolve, reject) => {

            console.log(transaction);

            // Create metadata for action.
            const metaData = {
                "action": action,
                "date": new Date().toISOString()
            };

            // Create a new TRANSFER transaction.
            const updateAssetTransaction = driver.Transaction.makeTransferTransaction(

                // previous transaction.
                [{ tx: transaction, output_index: 0 }],

                // Create new output.
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(this.currentIdentity.publicKey))],

                // Add metadata.
                metaData
            )

            // Sign new transaction.
            const signedTransaction = driver.Transaction.signTransaction(updateAssetTransaction, this.currentIdentity.privateKey);

            console.log("Posting transaction.");
            // Post the new transaction.
            this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {

                // Return the posted transaction to the callback function.
                resolve(postedTransaction);

            }).catch(err => {
                reject(err);
            });
        });

    }

    /**
     * Transfer an asset to another owner by using his/her/its public key.
     * 
     * @param {*} transaction - The transaction that needs to be chained upon.
     * @param {*} receiverPublicKey - The public key of the receiver.
     */
    transferAsset(transaction, receiverPublicKey) {

        return new Promise((resolve, reject) => {

            // Construct metadata.
            const metaData = {
                "action": "Transfer food-item to another firm.",
                "date": new Date().toISOString()
            };

            // Construct the new transaction
            const transferTransaction = driver.Transaction.makeTransferTransaction(

                // The previous transaction to be chained upon.
                [{ tx: transaction, output_index: 0 }],

                // The (poutput) condition to be fullfilled in the next transaction.
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(receiverPublicKey))],

                // Metadata
                metaData
            );

            // Sign the new transaction.
            const signedTransaction = driver.Transaction.signTransaction(transferTransaction, this.currentIdentity.privateKey);

            // Post the transaction.
            this.connection.postTransactionCommit(signedTransaction).then(successfullyPostedTransaction => {

                // Return the posted transaction to the callback funcion.
                resolve(successfullyPostedTransaction);

            }).catch(error => {

                // Throw error
                reject(error);
            })

        });
    }
}

// Create exports to make some functionality available in the browser.

module.exports = {
    FarmToFork
}