// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

//import 'https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import '@openzeppelin/contracts/interfaces/IERC20.sol';

contract Bank is Ownable {
    mapping(address => mapping(address => uint256)) public balances;
    mapping (string=>address) public allowedTokens;
    address[] allowedTokensList;
    string[] allowedTokenNamesList;

    mapping(address => address) public tokenPriceFeedMapping;

    event AllowedTokensAdded(string[] indexed tokenNames, address[] indexed tokenAddresses, address indexed sender);
    event NewPriceFeedContract(address indexed token, address indexed priceFeed);
  
    function addAllowedTokens(string[] memory tokenNames, address[] memory tokenAddresses) public onlyOwner {
        require(tokenNames.length==tokenAddresses.length);
        for (uint i=0; i<tokenNames.length; i++){
            string memory tokenName=tokenNames[i];
            address tokenAddress=tokenAddresses[i];
            allowedTokens[tokenName]=tokenAddress;
            allowedTokensList.push(tokenAddress);
            allowedTokenNamesList.push(tokenName);
        }
        emit AllowedTokensAdded(tokenNames,tokenAddresses, msg.sender);
    }

    function setPriceFeedContract(address _token, address _priceFeed)
        public
        onlyOwner
    {
        tokenPriceFeedMapping[_token] = _priceFeed;
        emit NewPriceFeedContract(_token,_priceFeed);
    }

    function getTokenValue(address _token)
        public
        view
        returns (uint256, uint256)
    {
        //price feed address
        address tokenPriceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            tokenPriceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    function convertInput2Output(uint256 _amountIn, string memory _inputToken, string memory _outputToken) public view returns(uint){
        (uint inputTokenPrice, uint inputTokenDecimals)=getTokenValue(allowedTokens[_inputToken]);
        uint input2USD = (_amountIn*inputTokenPrice) / 10**inputTokenDecimals;

        (uint outputTokenPrice,)=getTokenValue(allowedTokens[_outputToken]);
        uint output2USD = outputTokenPrice;
        uint input2Output = input2USD/output2USD;
        return input2Output;
    }


    function deposit(uint256 value, string memory token) public {
        require(allowedTokens[token] != address(0));
        IERC20(allowedTokens[token]).transferFrom(msg.sender, address(this), value);
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
        return bankBalanceInUSD;
    }

    function withdraw(string memory token, uint amount) public {
        require(balances[msg.sender][allowedTokens[token]]>=amount, "Insufficient Balance");
        balances[msg.sender][allowedTokens[token]]-=amount;
        IERC20(allowedTokens[token]).transfer(msg.sender, amount);
    }

    function send(string memory token, uint amount, address beneficiary) public {
        require(balances[msg.sender][allowedTokens[token]]>=amount, "Insufficient Balance");
        balances[msg.sender][allowedTokens[token]]-=amount;
        IERC20(allowedTokens[token]).transfer(beneficiary, amount);
    }
}
