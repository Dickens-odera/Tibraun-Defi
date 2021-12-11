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

  it("should enable token swap", async() => {
    let amount = 10; // amount.toString()
    const result = instance.methods.swapExactInputSingle(amount).send({
      from: alice,
      gasPrice:200000,
      gasLimit:3000000
    }).catch(( data) => {
        console.log(data);
    }).error(( error) => {
        console.error(error);
    });
  });
});
