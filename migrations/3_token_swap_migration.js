const btcTokenContract = artifacts.require("MockBTC");
const TokenSwapContract = artifacts.require("TokenSwap");

module.exports = async function(deployer, network) {
    const btcToken = await btcTokenContract.deployed();
    const btcTokenAddress = btcToken.address
    let addressList = [btcTokenAddress]
    let nameList = ["BTC"]
    await deployer.deploy(TokenSwapContract, "0xE592427A0AEce92De3Edee1F18E0157C05861564", nameList, addressList);
}

//0x326c977e6efc84e512bb9c30f76e30c160ed06fb chainlink
// 0x6373c962dcffc21465973150993e19f56d8640a4 WETH
//0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f DAI