const TokenSwap = artifacts.require("TokenSwap");
const web3 = require("web3");
require('dotenv').config();

contract("TokenSwap", async(accounts) =>{
  let instance;
  beforeEach(async () => {
    instance = await TokenSwap.deployed();
    [owner, alice, bob] = accounts;
    const DAIAddress = process.env.DAI_TOKEN_ADDRESS;
    const USDTAddress = process.env.USDT_TOKEN_ADDRESS;
  });

  it("deploys successfully", async() => {
      assert(instance,"Swap token contract deployed successfully");
  });

  it("can add allowed tokens", async() => {
      const tokenNames = [
        "BTC",
        "ETH"
      ];

      const tokenAddresses = [
          "0x...",
          "0xvhdd..."
      ];

    const result = await instance.addAllowedTokens(tokenNames, tokenAddresses, { from: owner});
    const allowedTokens = await instance.allowedTokens();
    let allowedTokensList;
    for(let i = 0; i < tokenNames.length; i++) {
      allowedTokensList = await instance.allowedTokensList(i);
    }
    console.log(allowedTokens);
    console.log(allowedTokensList);
    assert(result.receipt.status, true);
    assert.equal(allowedTokens(tokenNames[0]),"BTC");
    assert.equal(allowedTokensList[0], tokenAddresses[0]);
    assert.equal(result.logs[0].args.sender, owner);
    assert.equal(result.logs[0].args.tokenNames, tokenNames);
    assert.equal(result.logs[0].args.tokenAddresses, tokenAddresses);
  });

  it("should enable token swap", async () => {
    let amount = 10; // amount.toString()
    let tokenName = [];
    let tokenList = [];
    const result = instance.methods.swapExactInputSingle(amount).send({
      from: alice,
      gasPrice: 200000,
      gasLimit: 3000000
    }).catch((data) => {
      console.log(data);
    }).error((error) => {
      console.error(error);
    });
  });
  
  it("can set price feed contract", async() => {
    let tokenList = [];
    let priceFeed = "0x..."
    const allowedTokens = await instance.allowedTokens();
    for (let i = 0; i < allowedTokens.length; i++ ){
      const tokens = await instance.allowedTokensList(i);
      tokenList.push(tokens);
    }
    console.log(tokenList);
    const result = await instance.setPriceFeedContract(tokenList[0], priceFeed, {from: owner});
    assert(result.receipt.status, true);
    assert.equal(result.logs[0].args.token, tokenList[0]);
    assert.equal(result.logs[0].args.priceFeed, priceFeed);
    assert.equal(result.logs[0].args.sender, owner);
  });
});
