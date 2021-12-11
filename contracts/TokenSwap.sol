// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./Bank.sol";

contract TokenSwap is Bank {
  // For the scope of these swap examples,
  // we will detail the design considerations when using
  // `exactInput`, `exactInputSingle`, `exactOutput`, and  `exactOutputSingle`.

  // It should be noted that for the sake of these examples, we purposefully pass in the swap router instead of inherit the swap router for simplicity.
  // More advanced example contracts will detail how to inherit the swap router safely.

  

  // This example swaps DAI/WETH9 for single path swaps and DAI/USDC/WETH9 for multi path swaps.


  ISwapRouter immutable swapRouter;
  
  constructor(ISwapRouter _swapRouter, string[] memory tokenNames, address[] memory tokenAddresses) {
    require(tokenNames.length==tokenAddresses.length);
    for (uint i=0; i<tokenNames.length; i++){
      string memory tokenName=tokenNames[i];
      address tokenAddress=tokenAddresses[i];
      allowedTokens[tokenName]=tokenAddress;
      allowedTokensList.push(tokenAddress);
      allowedTokenNamesList.push(tokenName);
    }
    swapRouter = _swapRouter;
  }

  // For this example, we will set the pool fee to 0.3%.
  uint24 public constant poolFee = 3000;

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