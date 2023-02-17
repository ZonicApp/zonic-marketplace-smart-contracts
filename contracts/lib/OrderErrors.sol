// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

function _revertMissingEther() pure {
  revert("Missing Ether");
}

function _revertWithInvalidSignature() pure {
  revert("Invalid Signature");
}

function _revertWithOrderNotStarted() pure {
  revert("Order Not Started");
}

function _revertWithOrderExpired() pure {
  revert("Order Expired");
}

function _revertWithDuplicatedSaleId() pure {
  revert("Duplicate saleId");
}

function _revertWithInvalidOfferCount() pure {
  revert("Invalid Offer Count");
}

function _revertWithUnsupportedListingOrderType() pure {
  revert("Unsupported Listing Order Type");
}

function _revertWithUnsupportedOfferItemType() pure {
  revert("Unsupported Offer Item Type");
}

function _revertWithUnsupportedPayoutItemType() pure {
  revert("Unsupported Payout Item Type");
}

function _revertWithUnsupportedPayoutFormat() pure {
  revert("Unsupported Payout Format");
}

function _revertWithUnsupportedCannotBuyYourOwnItem() pure {
  revert("Cannot buy your own item");
}

function _revertWithUnsupportedCreatorFeeExceedAllowed() pure {
  revert("Total creator fee exceeds the allowed rate");
}
