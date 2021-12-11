const btcTokenContract = artifacts.require("MockBTC");
const ethTokenContract = artifacts.require("MockETH");
const btcMockPriceFeedContract = artifacts.require("MockV3AggregatorBTC");
const ethMockPriceFeedContract = artifacts.require("MockV3AggregatorETH");
const TokenSwapContract = artifacts.require("TokenSwap");

module.exports = function(deployer) {
    let decimals = 8
    let btcPriceValue = 48000 * 10 ** 8
    let ethPriceValue = 4000 * 10 ** 8
    deployer.deploy(btcTokenContract);
    deployer.deploy(ethTokenContract);

    deployer.deploy(btcMockPriceFeedContract, decimals, btcPriceValue);
    deployer.deploy(ethMockPriceFeedContract, decimals, ethPriceValue);
}