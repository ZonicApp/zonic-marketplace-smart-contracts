// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct OfferItem {
  uint8 itemType;
  address token;
  uint256 identifier;
  uint256 amount;
}
struct Payout {
  uint8 itemType;
  address token;
  uint256 identifier;
  address recipient;
  uint256 amount;
}
struct Listing {
  address offerer;
  OfferItem[] offers;
  Payout offererPayout;
  Payout[] creatorPayouts;
  uint8 orderType;
  uint32 listedAt;
  uint32 expiredAt;
  address saleId;
  uint8 version;
}
