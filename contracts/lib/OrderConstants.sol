// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// keccak256("OfferItem(uint8 itemType,address token,uint256 identifier,uint256 amount)")
bytes32 constant OFFER_ITEM_TYPEHASH = 0x3d2811298909c55efd9f4f108efcfb0e7e2ec71cbbc7afc8b15862b50858ac8e;
// keccak256("Payout(uint8 itemType,address token,uint256 identifier,address recipient,uint256 amount)")
bytes32 constant PAYOUT_TYPEHASH = 0x2f640164aec5dd9f523d2a80beac36e83213daadafecd22ac297bb068187d193;
// keccak256("Listing(address offerer,OfferItem[] offers,Payout offererPayout,Payout[] creatorPayouts,uint8 orderType,uint32 listedAt,uint32 expiredAt,address saleId,uint8 version)OfferItem(uint8 itemType,address token,uint256 identifier,uint256 amount)Payout(uint8 itemType,address token,uint256 identifier,address recipient,uint256 amount)")
bytes32 constant LISTING_TYPEHASH = 0x0b27a7ffaa1672a8a16a672f5069c3a1e39bc0eabe3ec494cb9ea22c797b00e6;
