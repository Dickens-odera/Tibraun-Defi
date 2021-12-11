const Bank = artifacts.require("Bank");
const web3 = require("web3");
require('dotenv').config();

contract("Bank", async(accounts) =>{
  let instance;
  let tokenNames = [];
  let tokenAddresses = [];
  beforeEach(async () => {
    instance = await Bank.deployed();
    [owner, alice, bob] = accounts;
    const DAIAddress = process.env.DAI_TOKEN_ADDRESS;
    const USDTAddress = process.env.USDT_TOKEN_ADDRESS;
    tokenNames = [
      "BTC",
      "ETH"
    ];
    tokenAddresses = [
      "0x...",
      "0xvhdd..."
    ];
  });

  it("deploys successfully", async() => {
      assert(instance,"Swap token contract deployed successfully");
  });

  it("can add allowed tokens", async() => {
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

  decribe("deposits", function(){
    it("can enable a user to deposit token", async() => {
      let value = 10;
      const result = await instance.deposit(value,tokenNames[0], {from: alice});
      assert(result.receipt.status,true);
      assert.equal(instance.balances([alice][tokenNames[tokenNames[0]]]), value);
    });

    it("can get token balance", async() => {
      const result = await instance.getTokenBalance(tokenNames[0], {from: alice});
      const balance = await instance.balances([alice][tokenNames[0]]);
      assert.equal(result,balance);
    });
    
    it("can get token balance in USD", async() =>{
      const result = await instance.getBankBalanceInUSD();
      //to be continued
    });
  });
});
