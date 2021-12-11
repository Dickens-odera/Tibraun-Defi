// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;
import 'https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/ISwapRouter.sol';
import 'https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/TransferHelper.sol';
import 'https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import '@openzeppelin/contracts/interfaces/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
//import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
//import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
//import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';


contract TokenSwap is Ownable {
  // For the scope of these swap examples,
  // we will detail the design considerations when using
  // `exactInput`, `exactInputSingle`, `exactOutput`, and  `exactOutputSingle`.

  // It should be noted that for the sake of these examples, we purposefully pass in the swap router instead of inherit the swap router for simplicity.
  // More advanced example contracts will detail how to inherit the swap router safely.

  

  // This example swaps DAI/WETH9 for single path swaps and DAI/USDC/WETH9 for multi path swaps.


ISwapRouter immutable swapRouter;


  mapping(address => mapping(address => uint256)) balances;
  mapping (string=>address) public allowedTokens;
  address[] allowedTokensList;

  mapping(address => address) public tokenPriceFeedMapping;

  // For this example, we will set the pool fee to 0.3%.
  uint24 public constant poolFee = 3000;

  event AllowedTokensAdded(string[] indexed tokenNames, string[] indexed tokenAddresses, address indexed sender);
  event NewPriceFeedContract(address indexed token, address indexed priceFeed, address indexed sender);

  constructor(ISwapRouter _swapRouter, string[] memory tokenNames, address[] memory tokenAddresses) {
    require(tokenNames.length==tokenAddresses.length);
    for (uint i=0; i<tokenNames.length; i++){
      string memory tokenName=tokenNames[i];
      address tokenAddress=tokenAddresses[i];
      allowedTokens[tokenName]=tokenAddress;
      allowedTokensList.push(tokenAddress);
    }
    swapRouter = _swapRouter;
  }

  
  function addAllowedTokens(string[] memory tokenNames, address[] memory tokenAddresses) public onlyOwner {
    require(tokenNames.length==tokenAddresses.length);
    for (uint i=0; i<tokenNames.length; i++){
      string memory tokenName=tokenNames[i];
      address tokenAddress=tokenAddresses[i];
      allowedTokens[tokenName]=tokenAddress;
      allowedTokensList.push(tokenAddress);
    }
    emit AllowedTokensAdded(tokenNames,tokenAddresses, msg.sender);
  }

  function setPriceFeedContract(address _token, address _priceFeed)
    public
    onlyOwner
  {
    tokenPriceFeedMapping[_token] = _priceFeed;
    emit NewPriceFeedContract(_token,_priceFeed, msg.sender);
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

  /// @notice swapExactInputSingle swaps a fixed amount of DAI for a maximum possible amount of WETH9
  /// using the DAI/WETH9 0.3% pool by calling `exactInputSingle` in the swap router.
  /// @dev The calling address must approve this contract to spend at least `amountIn` worth of its DAI for this function to succeed.
  /// @param amountIn The exact amount of DAI that will be swapped for WETH9.
  /// @return amountOut The amount of WETH9 received.
  function swapExactInputSingle(uint256 amountIn, string memory inputToken, string memory outputToken) external returns (uint256 amountOut) {
    
    // msg.sender must approve this contract
    IERC20(allowedTokens[inputToken]).approve(address(this), amountIn);

    // Transfer the specified amount of DAI to this contract.
    TransferHelper.safeTransferFrom(allowedTokens[inputToken], msg.sender, address(this), amountIn);

    // Approve the router to spend DAI.
    TransferHelper.safeApprove(allowedTokens[inputToken], address(swapRouter), amountIn);

    // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
    // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
    ISwapRouter.ExactInputSingleParams memory params =
      ISwapRouter.ExactInputSingleParams({
          tokenIn: allowedTokens[inputToken],
          tokenOut: allowedTokens[outputToken],
          fee: poolFee,
          recipient: msg.sender,
          deadline: block.timestamp,
          amountIn: amountIn,
          amountOutMinimum: convertInput2Output(amountIn, inputToken, outputToken),
          sqrtPriceLimitX96: 0
      });

      // The call to `exactInputSingle` executes the swap.
      amountOut = swapRouter.exactInputSingle(params);
  }
}