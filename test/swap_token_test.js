const truffleAssertions = require("truffle-assertions");
const truffleAssert = require("truffle-assertions")

const TokenSwapContract = artifacts.require("TokenSwap");

//Development Mocks: in production these wouldnt be required
const btcTokenContract = artifacts.require("MockBTC");
const ethTokenContract = artifacts.require("MockETH");
const btcMockPriceFeedContract = artifacts.require("MockV3AggregatorBTC");
const ethMockPriceFeedContract = artifacts.require("MockV3AggregatorETH");

const Web3 = require("web3")



contract("TokenSwap", accounts => {
    it("should allow only owner to add allowed tokens and set price feeds.", async() => {
        let TokenSwap = await TokenSwapContract.deployed()
        let BTC = await btcTokenContract.deployed()
        let ETH = await ethTokenContract.deployed()
        let btcPriceFeed = await btcMockPriceFeedContract.deployed()
        let ethPriceFeed = await ethMockPriceFeedContract.deployed()

        await truffleAssert.reverts(TokenSwap.addAllowedTokens(["ETH"], [ETH.address], { from: accounts[1] })) //should revert as the user is not the owner
        await truffleAssert.passes(TokenSwap.addAllowedTokens(["ETH"], [ETH.address], { from: accounts[0] }))



        await truffleAssert.reverts(TokenSwap.setPriceFeedContract(BTC.address, btcPriceFeed.address, { from: accounts[1] })) //should revert as the user is not the owner
        await truffleAssert.passes(TokenSwap.setPriceFeedContract(BTC.address, btcPriceFeed.address, { from: accounts[0] }))
        await truffleAssert.passes(TokenSwap.setPriceFeedContract(ETH.address, ethPriceFeed.address, { from: accounts[0] }))
    })
    it("should allow any user to get price of an erc20 token perfectly", async() => {
        let TokenSwap = await TokenSwapContract.deployed()
        let BTC = await btcTokenContract.deployed()
        let ETH = await ethTokenContract.deployed()

        await truffleAssert.passes(TokenSwap.getTokenValue(BTC.address, { from: accounts[0] }))
        await truffleAssert.passes(TokenSwap.getTokenValue(ETH.address, { from: accounts[1] }))

        let price = await TokenSwap.getTokenValue(BTC.address, { from: accounts[2] })
        assert.equal(price[0].toNumber(), 48000 * 10 ** price[1].toNumber())
        price = await TokenSwap.getTokenValue(ETH.address, { from: accounts[1] })
        assert.equal(price[0].toNumber(), 4000 * 10 ** price[1].toNumber())
    })
    it("should allow users swap from one erc20 token to another", async() => {
        let TokenSwap = await TokenSwapContract.deployed()

        let outputValue = await TokenSwap.convertInput2Output(100000000, "BTC", "ETH", { from: accounts[0] })
        assert.equal(outputValue.toNumber(), 48000 / 4000)
    })
    it("should allow users to deposit erc20 tokens if they have sufficient balance and get balances in token and usd", async() => {
        let TokenSwap = await TokenSwapContract.deployed()
        let BTC = await btcTokenContract.deployed()

        await truffleAssert.reverts(TokenSwap.deposit(100000000, "BTC", { from: accounts[1] })) // reverts as a result of insufficient balance
        await BTC.approve(TokenSwap.address, 100000000)
        let btcBalance = await TokenSwap.balances(accounts[0], BTC.address)
        assert.equal(btcBalance, 0)
        await truffleAssert.passes(TokenSwap.deposit(100000000, "BTC", { from: accounts[0] }))
        btcBalance = await TokenSwap.getTokenBalance("BTC")
        assert.equal(btcBalance.toNumber(), 100000000)
        usdBalance = await TokenSwap.getBankBalanceInUSD()
        assert.equal(usdBalance.toNumber(), 4800000000000)
    })
    it("should ensure that users can withdraw and send erc20 tokens if they have the sufficient balance", async() => {
        let TokenSwap = await TokenSwapContract.deployed()
        let BTC = await btcTokenContract.deployed()

        await truffleAssert.reverts(TokenSwap.withdraw("BTC", 100, { from: accounts[1] })) // reverts as a result of insufficient balance
        await truffleAssert.reverts(TokenSwap.send("BTC", 100, accounts[2], { from: accounts[1] })) // reverts as a result of insufficient balance
        let startBtcBalance = await BTC.balanceOf(accounts[0])
        await truffleAssert.passes(TokenSwap.withdraw("BTC", 50000000, { from: accounts[0] }))
        let btcBalance = await TokenSwap.getTokenBalance("BTC")
        assert.equal(btcBalance.toNumber(), 50000000) // withdrew half of my btc
        btcBalance = await BTC.balanceOf(accounts[0])
        assert.equal(btcBalance.toNumber(), startBtcBalance.toNumber() + 50000000) // address btc balance withdrawn
        await truffleAssert.passes(TokenSwap.send("BTC", 50000000, accounts[1], { from: accounts[0] }))
        btcBalance = await TokenSwap.getTokenBalance("BTC")
        assert.equal(btcBalance.toNumber(), 0) // sent the other half to account1
        btcBalance = await BTC.balanceOf(accounts[1])
        assert.equal(btcBalance.toNumber(), 50000000) // account1 new balance
    })
    it("should allow users to swap one erc20 token for another", async() => {
        let TokenSwap = await TokenSwapContract.deployed()

        //await TokenSwap.swapExactInputSingle(50000000, "BTC", "ETH", { from: accounts[1] })

        //will have to be tested on the polygon testnet 
    })
})