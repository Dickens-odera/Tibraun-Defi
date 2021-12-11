const truffleAssert = require("truffle-assertions")

const TokenSwapContract = artifacts.require("TokenSwap");

//Development Mocks: in production these wouldnt be required
const btcTokenContract = artifacts.require("MockBTC");
const ethTokenContract = artifacts.require("MockETH");
const btcMockPriceFeedContract = artifacts.require("MockV3AggregatorBTC");
const ethMockPriceFeedContract = artifacts.require("MockV3AggregatorETH");

const Web3 = require("web3")



contract("TokenSwap", accounts => {
    it("should allow only owner to add allowed tokens.", async() => {
        let TokenSwap = await TokenSwapContract.deployed()
        let BTC = await btcTokenContract.deployed()
        let ETH = await ethTokenContract.deployed()
        let btcPriceFeed = await btcMockPriceFeedContract.deployed()
        let ethPriceFeed = await ethMockPriceFeedContract.deployed()

        await truffleAssert.reverts(yieldFarm.addAllowedTokens(DFT.address, { from: accounts[1] })) // should revert as non-owners can't add tokens
        await truffleAssert.passes(yieldFarm.addAllowedTokens(DFT.address, { from: accounts[0] }))
        await truffleAssert.passes(yieldFarm.addAllowedTokens(DAI.address, { from: accounts[0] }))
        await truffleAssert.passes(yieldFarm.addAllowedTokens(WETH.address, { from: accounts[0] }))
    })
})