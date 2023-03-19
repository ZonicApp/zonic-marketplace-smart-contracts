// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

import {
  OfferItem,
  Payout,
  Listing
} from "./OrderStructs.sol";

import {
  OFFER_ITEM_TYPEHASH,
  PAYOUT_TYPEHASH,
  LISTING_TYPEHASH
} from "./OrderConstants.sol";

import {
  _revertMissingEther,
  _revertWithInvalidSignature,
  _revertWithOrderNotStarted,
  _revertWithOrderExpired,
  _revertWithDuplicatedSaleId,
  _revertWithUnsupportedListingOrderType,
  _revertWithInvalidOfferCount,
  _revertWithUnsupportedOfferItemType,
  _revertWithUnsupportedPayoutItemType,
  _revertWithUnsupportedPayoutFormat,
  _revertWithUnsupportedCreatorFeeExceedAllowed
} from "./OrderErrors.sol";

import {
  OrderType,
  ItemType
} from "./OrderEnums.sol";

contract OrderProcessorUpgradable is OwnableUpgradeable, PausableUpgradeable, EIP712Upgradeable {
  using ECDSAUpgradeable for bytes32;

  uint256 public maxCreatorFeePercentage;  // 10000 = 100%
  uint256 public marketplaceFeePercentage; // 10000 = 100%
  address public marketplaceFeePayoutAddress;
  mapping(address => bool) private usedSaleIds;
  mapping(address => bool) private usedOfferIds;

  // Initializer
  function __OrderProcessor_init(string memory name, string memory version, uint256 _maxCreatorFeePercentage, uint256 _marketplaceFeePercentage, address _marketplaceFeePayoutAddress) internal onlyInitializing {
    __OrderProcessor_init_unchained(name, version, _maxCreatorFeePercentage, _marketplaceFeePercentage, _marketplaceFeePayoutAddress);
  }

  function __OrderProcessor_init_unchained(string memory name, string memory version, uint256 _maxCreatorFeePercentage, uint256 _marketplaceFeePercentage, address _marketplaceFeePayoutAddress) internal onlyInitializing {
    __EIP712_init(name, version);
    __Ownable_init();
    __Pausable_init();
    maxCreatorFeePercentage = _maxCreatorFeePercentage;
    marketplaceFeePercentage = _marketplaceFeePercentage;
    marketplaceFeePayoutAddress = _marketplaceFeePayoutAddress;
  }

  // Admin Functions
  function setMaxCreatorFeePercentage(uint256 _maxCreatorFeePercentage) public onlyOwner {
    require(_maxCreatorFeePercentage <= 1000, "Max creator fee could not exceed 30%");
    maxCreatorFeePercentage = _maxCreatorFeePercentage;
  }

  function setMarketplaceFeePercentage(uint256 _marketplaceFeePercentage) public onlyOwner {
    require(_marketplaceFeePercentage <= 1000, "Marketplace fee could not exceed 10%");
    marketplaceFeePercentage = _marketplaceFeePercentage;
  }

  function setMarketplaceFeePayoutAddress(address _marketplaceFeePayoutAddress) public onlyOwner {
    marketplaceFeePayoutAddress = _marketplaceFeePayoutAddress;
  }

  // Order Functions

  function __validateOrderForFulfill(
    Listing calldata listing,
    bytes calldata signature
  ) internal view returns (uint256 totalPrice, uint256 totalCreatorFee, uint256 marketplaceFee) {
    // Must started
    if (block.timestamp < listing.listedAt)
      _revertWithOrderNotStarted();

    // Must not expired
    if (listing.expiredAt < block.timestamp)
      _revertWithOrderExpired();

    // Must be coming with ETH
    if (msg.value == 0)
      _revertMissingEther();

    // Signature must match the offerer address
    if (__recoverAddressOfListing(listing, signature) != listing.offerer)
      _revertWithInvalidSignature();

    // Check Order Type
    if (listing.orderType != uint8(OrderType.FULL_RESTRICTED))
      _revertWithUnsupportedListingOrderType();

    // Check Offer Item Type
    for (uint i = 0; i < listing.offers.length; i++)
      if (listing.offers[i].itemType != uint8(ItemType.ERC721_TOKEN))
        _revertWithUnsupportedOfferItemType();

    // Check Payout Item Type
    if (listing.offererPayout.itemType != uint8(ItemType.COIN))
      _revertWithUnsupportedPayoutItemType();
    for (uint i = 0; i < listing.creatorPayouts.length; i++)
      if (listing.creatorPayouts[i].itemType != uint8(ItemType.COIN))
        _revertWithUnsupportedPayoutItemType();

    // Check for Payout Format
    if (listing.offererPayout.recipient != listing.offerer)
      _revertWithUnsupportedPayoutFormat();

    // Calculate ETH value for each part
    uint256 offererEarning = listing.offererPayout.amount;
    for (uint i = 0; i < listing.creatorPayouts.length; i++)
      totalCreatorFee = totalCreatorFee + listing.creatorPayouts[i].amount;
    totalPrice = (offererEarning + totalCreatorFee) * 10000 / (10000 - marketplaceFeePercentage);

    // Total creator fee must not exceed maxCreatorFeePercentage
    if (totalCreatorFee * 10000 / totalPrice > maxCreatorFeePercentage)
      _revertWithUnsupportedCreatorFeeExceedAllowed();

    // Check total ETH value
    if (totalPrice != msg.value)
      _revertMissingEther();

    // Validate saleId
    if (__isSaleIdUsed(listing.saleId))
      _revertWithDuplicatedSaleId();

    marketplaceFee = totalPrice - offererEarning - totalCreatorFee;
  }

  function __validateOrderForCancelation(
    Listing calldata listing,
    bytes calldata signature
  ) internal view {
    // Signature must match the offerer address
    if (__recoverAddressOfListing(listing, signature) != listing.offerer)
      _revertWithInvalidSignature();
  }

  function __isSaleIdUsed(address saleId) internal view returns (bool) {
    return usedSaleIds[saleId];
  }

  function __markSaleIdUsed(address saleId) internal {
    usedSaleIds[saleId] = true;
  }

  function __encodeOfferItem(OfferItem calldata offerItem) private pure returns (bytes memory) {
    return abi.encode(OFFER_ITEM_TYPEHASH, offerItem.itemType, offerItem.token, offerItem.identifier, offerItem.amount);
  }

  function __encodePayout(Payout calldata payout) private pure returns (bytes memory) {
    return abi.encode(PAYOUT_TYPEHASH, payout.itemType, payout.token, payout.identifier, payout.recipient, payout.amount);
  }

  function __encodeListing(Listing calldata listing) private pure returns (bytes memory) {
    bytes32[] memory encodedOffers = new bytes32[](listing.offers.length);
    for (uint256 i = 0; i < listing.offers.length; i++)
      encodedOffers[i] = keccak256(__encodeOfferItem(listing.offers[i]));

    bytes32[] memory encodedCreatorPayouts = new bytes32[](listing.creatorPayouts.length);
    for (uint256 i = 0; i < listing.creatorPayouts.length; i++)
      encodedCreatorPayouts[i] = keccak256(__encodePayout(listing.creatorPayouts[i]));

    return
      abi.encode(
        LISTING_TYPEHASH,
        listing.offerer,
        keccak256(abi.encodePacked(encodedOffers)),
        keccak256(__encodePayout(listing.offererPayout)),
        keccak256(abi.encodePacked(encodedCreatorPayouts)),
        listing.orderType,
        listing.listedAt,
        listing.expiredAt,
        listing.saleId,
        listing.version
      );
  }

  function __recoverAddressOfListing(
    Listing calldata listing,
    bytes calldata signature
  ) private view returns (address) {
    return _hashTypedDataV4(keccak256(__encodeListing(listing))).recover(signature);
  }

  // Offer Functions

  // Storage Gap
  uint256[49] private __gap;
}
