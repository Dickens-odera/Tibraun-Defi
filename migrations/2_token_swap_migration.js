const TokenSwap = artifacts.require("TokenSwap");

module.exports = function(deployer,network,accounts){
    deployer.deploy(TokenSwap);
}