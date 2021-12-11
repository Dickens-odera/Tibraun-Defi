const btcTokenContract = artifacts.require("MockBTC");
const ethTokenContract = artifacts.require("MockETH");
const btcMockPriceFeedContract = artifacts.require("MockV3Aggregator");
const ethMockPriceFeedContract = artifacts.require("MockV3Aggregator");
const TokenSwapContract = artifacts.require("TokenSwap");

module.exports = function(deployer, network, accounts) {
    let decimals = 8
    let btcPriceValue = 48000 * 10 ** 8
    let ethPriceValue = 4000 * 10 ** 8
    await deployer.deploy(btcTokenContract);
    await deployer.deploy(ethTokenContract);

    await deployer.deploy(btcMockPriceFeedContract, decimals, btcPriceValue);
    await deployer.deploy(ethMockPriceFeedContract, decimals, ethPriceValue);

    const btcToken = await btcTokenContract.deployed();
    const btcTokenAddress = btcToken.address
    const ethToken = await ethTokenContract.deployed();
    const ethTokenAddress = ethToken.address
    let addressList = [btcTokenAddress, ethTokenAddress]
    let nameList = ["BTC", "ETH"]
    deployer.deploy(TokenSwapContract, ExactInputSingleParams, nameList, addressList);
}