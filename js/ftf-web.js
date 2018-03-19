var ftfApp = new Vue({
    el: "#ftf-container",
    data: {
        farmToFork: new ftf_module.FarmToFork(),
        activePane: 'identity',

        // Inputs
        identitySeedInput: "",
    },
    methods: {
        setActive(pane) {
            this.activePane = pane;
        },
        isActive(pane) {
            return this.activePane == pane;
        },
        identityButtonClicked() {
            this.farmToFork.currentIdentity = this.farmToFork.generateKeypair(this.identitySeedInput);
        }

    }
});