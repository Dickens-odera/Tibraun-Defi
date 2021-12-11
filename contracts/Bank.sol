// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;
import 'https://github.com/Uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import "./TokenSwap.sol";

contract Bank is TokenSwap {
    ISwapRouter immutable swapRouter;
    constructor(ISwapRouter swapRouter, string[] memory tokenNames, address[] memory tokenAddresses) public 
    TokeSwap(swapRouter,tokenNames,tokenAddresses){

    }
    
    function deposit(uint256 value, string memory token) public {
        require(allowedTokens[token] != address(0));
        IERC20(allowedTokens[token]).transfer(address(this), value);
        balances[msg.sender][allowedTokens[token]] += value;
    }

    function getTokenBalance(string memory token)
        public
        view
        returns (uint256)
    {
        require(allowedTokens[token] != address(0));
        return balances[msg.sender][allowedTokens[token]];
    }

    function getBankBalanceInUSD() public view returns (uint256) {
        uint256 bankBalanceInUSD;
        for (uint256 i = 0; i < allowedTokensList.length; i++) {
            (uint price, uint decimals) = getTokenValue(allowedTokensList[i]);
            if (allowedTokensList[i] != address(0)) {
                bankBalanceInUSD += ((balances[msg.sender][
                    allowedTokensList[i]
                ] * price) / (10**decimals));
            }
        }
    }
}
