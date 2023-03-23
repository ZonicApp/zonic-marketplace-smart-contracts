// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "./lib/OrderProcessorUpgradable.sol";
import "./lib/PersonalSignLib.sol";

import {
  _revertWithUnsupportedCannotBuyYourOwnItem
} from './lib/OrderErrors.sol';

import {
  OrderType,
  ItemType
} from "./lib/OrderEnums.sol";

contract ZonicMarketplaceV1 is OrderProcessorUpgradable, ReentrancyGuardUpgradeable, PersonalSignLib {
  event ZonicBasicOrderFulfilled(address offerer, address buyer, address token, uint256 identifier, address currency, uint256 totalPrice, uint256 creatorFee, uint256 marketplaceFee, address saleId);
  event ZonicBasicOrderCanceled(address offerer, address token, uint256 identifier, address saleId);

  address signerAddress;
  address adminAddress;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(string memory signDomainName, string memory signVersion, uint256 _maxCreatorFeePercentage, uint256 _marketplaceFeePercentage, address _marketplaceFeePayoutAddress, address _signerAddress, address _adminAddress) public initializer {
    __OrderProcessor_init(signDomainName, signVersion, _maxCreatorFeePercentage, _marketplaceFeePercentage, _marketplaceFeePayoutAddress);
    __ReentrancyGuard_init();
    signerAddress = _signerAddress;
    adminAddress = _adminAddress;
  }

  function fulfillBasicOrder(
    Listing calldata listing,
    bytes calldata signature,
    uint8 adminSignatureV,
    bytes32 adminSignatureR,
    bytes32 adminSignatureS,
    uint32 adminSigExpiredAt
  ) external payable whenNotPaused nonReentrant {
    require(__recoverAddress(abi.encodePacked(listing.saleId, "%", adminSigExpiredAt, "%", address(this), "%", block.chainid), adminSignatureV, adminSignatureR, adminSignatureS) == signerAddress, "Invalid admin Signature");
    require(adminSigExpiredAt > block.timestamp, "Admin signature is expired");

    // Offerer and buyer could not be the same address
    if (listing.offerer == msg.sender)
      _revertWithUnsupportedCannotBuyYourOwnItem();

    uint256 marketplaceFee;
    uint256 totalPrice;
    uint256 totalCreatorFee;
    (totalPrice, totalCreatorFee, marketplaceFee) = __validateOrderForFulfill(listing, signature);

    // Mark Sale Id used
    __markSaleIdUsed(listing.saleId);

    // Send Event ahead of Transfer event
    __emitZonicBasicOrderFulfilledEvent(listing, totalPrice, totalCreatorFee, marketplaceFee);

    // -------------------
    // -- Process Order --
    // -------------------

    // Transfer Offered Item
    _transferOfferItems(listing);

    // Transfer Payout
    _transferPayout(listing, marketplaceFee);
  }

  function __emitZonicBasicOrderFulfilledEvent(
    Listing calldata listing,
    uint256 totalPrice,
    uint256 totalCreatorFee,
    uint256 marketplaceFee
  ) private {
    emit ZonicBasicOrderFulfilled(
      listing.offerer,
      msg.sender,
      listing.offers[0].token,
      listing.offers[0].identifier,
      listing.offererPayout.token,
      totalPrice,
      totalCreatorFee,
      marketplaceFee,
      listing.saleId);
  }

  function cancelBasicOrder(
    Listing calldata listing,
    bytes calldata signature
  ) external whenNotPaused nonReentrant {
    // Check if caller is of offerer or admin
    require(msg.sender == listing.offerer || msg.sender == adminAddress, "Caller is not offerer or admin");

    __validateOrderForCancelation(listing, signature);
    __markSaleIdUsed(listing.saleId);
    emit ZonicBasicOrderCanceled(
      listing.offerer,
      listing.offers[0].token,
      listing.offers[0].identifier,
      listing.saleId);
  }

  /* Admin Functions */
  function setSignerAddress(address _signerAddress) public onlyOwner {
    signerAddress = _signerAddress;
  }

  function setAdminAddress(address _adminAddress) public onlyOwner {
    adminAddress = _adminAddress;
  }

  function pause() public {
    require(_msgSender() == owner() || _msgSender() == adminAddress, "Caller does not have permission");
    _pause();
  }

  function unpause() public {
    require(_msgSender() == owner() || _msgSender() == adminAddress, "Caller does not have permission");
    _unpause();
  }

  /* Helper Methods */
  function _transferOfferItems(
    Listing memory listing
  ) internal {
    for (uint i = 0; i < listing.offers.length; i++) {
      _performTransfer(
        listing.offerer,
        msg.sender,
        listing.offers[i].itemType,
        listing.offers[i].token,
        listing.offers[i].identifier,
        listing.offers[i].amount
      );
    }
  }

  function _transferPayout(
    Listing memory listing,
    uint256 marketplaceFee
  ) internal {
    // Transfer Offerer payout
    _performTransfer(
      msg.sender,
      listing.offererPayout.recipient,
      listing.offererPayout.itemType,
      listing.offererPayout.token,
      listing.offererPayout.identifier,
      listing.offererPayout.amount
    );

    // Transfer Creator Payouts
    for (uint i = 0; i < listing.creatorPayouts.length; i++)
      _performTransfer(
        msg.sender,
        listing.creatorPayouts[i].recipient,
        listing.creatorPayouts[i].itemType,
        listing.creatorPayouts[i].token,
        listing.creatorPayouts[i].identifier,
        listing.creatorPayouts[i].amount
      );

    // Transfer Marketplace Fee
    _performTransfer(
      msg.sender,
      marketplaceFeePayoutAddress,
      listing.offererPayout.itemType,
      listing.offererPayout.token,
      listing.offererPayout.identifier,
      marketplaceFee
    );    
  }

  function _performTransfer(
    address sender,
    address recipient,
    uint8 itemType,
    address tokenAddress,
    uint256 identifier,
    uint256 amount
  ) internal {
    if (itemType == uint8(ItemType.COIN)) {
      // Native Currency
      require(sender == msg.sender, "Invalid sender");
      require(tokenAddress == address(0), "Invalid address");
      _transferEth(payable(recipient), amount);
    } else if (itemType == uint8(ItemType.ERC20_TOKEN)) {
      // ERC20
      IERC20 tokenContract = IERC20(tokenAddress);
      tokenContract.transferFrom(sender, recipient, amount);
    } else if (itemType == uint8(ItemType.ERC721_TOKEN)) {
      // ERC721
      IERC721 tokenContract = IERC721(tokenAddress);
      tokenContract.safeTransferFrom(sender, recipient, identifier);
      require(tokenContract.ownerOf(identifier) == recipient, "Transfer Failed");
    } else if (itemType == uint8(ItemType.ERC1155_TOKEN)) {
      // ERC1155
      IERC1155 tokenContract = IERC1155(tokenAddress);
      tokenContract.safeTransferFrom(sender, recipient, identifier, amount, "");
    }
  }

  function _transferEth(address payable to, uint256 amount) internal {
    if (amount == 0)
      return;
    (bool sent,) = to.call{ value: amount }("");
    require(sent, "Ether not sent");
  }

  /* Fail Safe Methods */
  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    payable(msg.sender).transfer(balance);
  }

  function withdrawERC20Token(address tokenAddress) public onlyOwner {
    IERC20 tokenContract = IERC20(tokenAddress);
    tokenContract.transfer(msg.sender, tokenContract.balanceOf(address(this)));
  }

  function withdrawERC721Token(address tokenAddress, uint256 tokenId) public onlyOwner {
    IERC721 tokenContract = IERC721(tokenAddress);
    tokenContract.safeTransferFrom(address(this), msg.sender, tokenId);
  }

  function withdrawERC721Tokens(address tokenAddress, uint256[] memory tokenIds) public onlyOwner {
    IERC721 tokenContract = IERC721(tokenAddress);
    for (uint i = 0; i < tokenIds.length; i++)
      tokenContract.safeTransferFrom(address(this), msg.sender, tokenIds[i]);
  }

  /* Storage Gap */
  uint256[50] __gap;
}
