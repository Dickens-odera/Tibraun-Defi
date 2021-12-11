// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./TokenSwap.sol";

contract Bank is TokenSwap {
    mapping(address => mapping(address => uint256)) balances;

    function deposit(uint256 value, string memory token) public {
        require(allowedToken[token] != address(0));
        IERC20(allowedTokens[token]).transfer(address(this), value);
        balances[msg.sender][allowedTokens[token]] += value;
    }

    function getTokenBalance(string memory token)
        public
        view
        returns (uint256)
    {
        require(allowedToken[token] != address(0));
        return balances[msg.sender][allowedTokens[token]];
    }

    function getBankBalanceInUSD() public view returns (uint256) {
        uint256 bankBalanceInUSD;
        for (uint256 i = 0; i < allowedTokensList.length; i++) {
            (price, decimals) = getTokenPrice(allowedTokensList[i]);
            if (allowedTokensList[i] != address(0)) {
                bankBalanceInUSD += ((balances[msg.sender][
                    allowedTokensList[i]
                ] * price) / (10**decimals));
            }
        }
    }
}
