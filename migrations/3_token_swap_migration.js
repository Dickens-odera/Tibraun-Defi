const btcTokenContract = artifacts.require("MockBTC");
const TokenSwapContract = artifacts.require("TokenSwap");

module.exports = async function(deployer) {
    const btcToken = await btcTokenContract.deployed();
    const btcTokenAddress = btcToken.address
    let addressList = [btcTokenAddress]
    let nameList = ["BTC"]
    await deployer.deploy(TokenSwapContract, "0xE592427A0AEce92De3Edee1F18E0157C05861564", nameList, addressList);
}