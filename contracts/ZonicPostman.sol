// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract ZonicPostman is Ownable, Pausable {
  constructor() {
  }

  function erc20TransferFrom(address recipient, address tokenAddress, uint256 amount) external whenNotPaused {
    IERC20 tokenContract = IERC20(tokenAddress);
    tokenContract.transferFrom(msg.sender, recipient, amount);
  }

  function erc721TransferFrom(address recipient, address tokenAddress, uint256 identifier) external whenNotPaused {
    IERC721 tokenContract = IERC721(tokenAddress);
    tokenContract.transferFrom(msg.sender, recipient, identifier);
  }

  function erc721SafeTransferFrom(address recipient, address tokenAddress, uint256 identifier) external whenNotPaused {
    IERC721 tokenContract = IERC721(tokenAddress);
    tokenContract.safeTransferFrom(msg.sender, recipient, identifier);
  }

  function erc1155SafeTransferFrom(address recipient, address tokenAddress, uint256 identifier, uint256 amount, bytes calldata data) external whenNotPaused {
    IERC1155 tokenContract = IERC1155(tokenAddress);
    tokenContract.safeTransferFrom(msg.sender, recipient, identifier, amount, data);
  }

  function erc1155SafeBatchTransferFrom(address recipient, address tokenAddress, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external whenNotPaused {
    IERC1155 tokenContract = IERC1155(tokenAddress);
    tokenContract.safeBatchTransferFrom(msg.sender, recipient, ids, amounts, data);
  }

  /*
   * Admin Function
   */

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }
}
