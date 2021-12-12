const btcTokenContract = artifacts.require("MockBTC");
const ethTokenContract = artifacts.require("MockETH");
const btcMockPriceFeedContract = artifacts.require("MockV3AggregatorBTC");
const ethMockPriceFeedContract = artifacts.require("MockV3AggregatorETH");

module.exports = function(deployer, network) {
    if (network == "development") {
        let decimals = 8
        let btcPriceValue = 48000 * 10 ** 8
        let ethPriceValue = 4000 * 10 ** 8
        deployer.deploy(btcTokenContract);
        deployer.deploy(ethTokenContract);

        deployer.deploy(btcMockPriceFeedContract, decimals, btcPriceValue);
        deployer.deploy(ethMockPriceFeedContract, decimals, ethPriceValue);
    } else if (network == "matic") {
        deployer.deploy(btcTokenContract);
        deployer.deploy(ethTokenContract);
    }
}