var ftfApp = new Vue({
    el: "#ftf-container",
    data: {
        farmToFork: new ftf_module.FarmToFork(),
        activePane: 'identity',

        // Inputs
        identitySeedInput: "ftf",
        assetInput: "",
        actionInput: "",
        otherFirmInput: "",
        activeTransaction: {
            "asset": {
                "data": {
                    "item": "Loading..."
                }
            }
        },

        // Assets
        transactionIds: new Array(),
        assets: new Array(),
        transactionsForAsset: new Array(),
        allAssets: new Array(),

        // Flag
        myAssets: false,
    },
    methods: {
        setActive(pane) {
            this.activePane = pane;
        },
        isActive(pane) {
            return this.activePane == pane;
        },
        getAssets() {
            return this.assets;
        },

        // Forms
        identityButtonClicked() {
            this.farmToFork.currentIdentity = this.farmToFork.generateKeypair(this.identitySeedInput);
        },
        assetButtonClicked() {
            if (this.assetInput == "") return;
            this.farmToFork.createAsset(this.assetInput).then(response => {

                console.log("New asset added.");
                // Do nothing, just reload the asset list.
                ftfApp.loadAssetsIds();
            });
        },

        // Menu
        menuClicked(link) {

            switch (link) {
                case "identity":
                    this.activePane = "identity";
                    break;

                case "assets":
                    this.loadAssetsIds();
                    this.activePane = "assets";
                    break;

                case "all-assets":
                    this.loadAllAssets();
                    this.activePane = "all-assets";
                    break;
            }
        },

        // Loading assets
        loadAssetsIds() {

            this.farmToFork.getAssets().then(response => {
                ftfApp.transactionIds = response;
                ftfApp.loadAssetsFromTransactionIds();
            });

        },
        loadAllAssets() {
            this.farmToFork.getAllAssets().then( response => {
                ftfApp.allAssets = response;
            });
        },
        loadAssetsFromTransactionIds() {

            this.assets = new Array();

            for (let transaction of this.transactionIds) {
                this.farmToFork.connection.getTransaction(transaction.transaction_id).then(response => {
                    if (response.operation == 'CREATE') return ftfApp.farmToFork.connection.listTransactions(response.id, 'CREATE');
                    return ftfApp.farmToFork.connection.listTransactions(response.asset.id, 'CREATE');
                }).then(responseCreate => {
                    ftfApp.assets.push(responseCreate[0]);
                }).catch(err => {
                    console.log(transaction.transaction_id);
                })
            }
        },
        transactionClicked(id, myAssets) {
            this.myAssets = myAssets;
            this.farmToFork.connection.getTransaction(id).then(response => ftfApp.activeTransaction = response);
            this.loadTransactionsForAsset(id);
            this.setActive('transactions');
        },
        loadTransactionsForAsset(assetId) {

            this.farmToFork.connection.listTransactions(assetId).then(response => ftfApp.transactionsForAsset = response);
        },
        actionButtonClicked() {
            this.farmToFork.connection.listTransactions(this.activeTransaction.id).then(response => {
                return ftfApp.farmToFork.updateAsset(response[response.length - 1], ftfApp.actionInput);
            }).then(response => {
                ftfApp.loadTransactionsForAsset(ftfApp.activeTransaction.id);
            });
        },
        otherFirmButtonClicked() {
            this.farmToFork.connection.listTransactions(this.activeTransaction.id).then(response => {
                return this.farmToFork.transferAsset(response[response.length -1], ftfApp.farmToFork.generateKeypair(ftfApp.otherFirmInput).publicKey);
            }).then( response => {
                // Don't do anything with the response, go back to asset overview.
                ftfApp.menuClicked('assets');
            });
        },
    }
});