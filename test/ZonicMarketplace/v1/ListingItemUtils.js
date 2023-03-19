const { ethers, upgrades } = require("hardhat");

const ItemType = Object.freeze({
  COIN: 0,
  ERC20_TOKEN: 1,
  ERC721_TOKEN: 2,
  ERC1155_TOKEN: 3,
});

const OrderType = Object.freeze({
  FULL_OPEN: 0,
  PARTIAL_OPEN: 1,
  FULL_RESTRICTED: 2,
  PARTIAL_RESTRICTED: 3,
  CONTRACT: 4,
})

const listingPrimaryType = 'Listing'
const listingDataTypes = {
  // Clarify if EIP712Domain refers to the domain the contract is hosted on
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ],

  // Data Structure for Offered Item
  OfferItem: [
    { name: "itemType", type: "uint8" },                 // 0 - Native Coin, 1 - ERC-20 Token, 2 - ERC-721 Token, 3 - ERC-1155 Token
    { name: "token", type: "address" },                  // Token Contract Address
    { name: "identifier", type: "uint256" },             // Token Id
    { name: "amount", type: "uint256" },                 // Amount for ERC-1155 Token
  ],
  // Data Structure for Tokens to transfer once the sale is made
  Payout: [
    { name: "itemType", type: "uint8" },                 // 0 - Native Coin, 1 - ERC-20 Token, 2 - ERC-721 Token, 3 - ERC-1155 Token
    { name: "token", type: "address" },                  // Token Contract Address
    { name: "identifier", type: "uint256" },             // Token Id
    { name: "recipient", type: "address" },              // Wallet Address who received the token
    { name: "amount", type: "uint256" },                 // The amount
  ],
  // Refer to PrimaryType
  Listing: [
    { name: "offerer", type: "address" },                // Offerer Wallet Address

    { name: "offers", type: "OfferItem[]" },             // Offered Items
    { name: "offererPayout", type: "Payout" },           // Tokens to transfer to offerer once the sale is made
    { name: "creatorPayouts", type: "Payout[]" },        // Tokens to transfer to creator once the sale is made

    { name: "orderType", type: "uint8" },                // 2 - Sell Now
    { name: "listedAt", type: "uint32" },                // Listed Timestamp
    { name: "expiredAt", type: "uint32" },               // Expired Timestamp
    { name: "saleId", type: "address" },                 // Sale ID
    { name: "version", type: "uint8" },                  // Message Version
  ],
}

function _generateDomain(contractAddress) {
  return {
    "name": "Zonic : NFT Marketplace for L2",
    "chainId": 1, // owner.provider.network.chainId
    "version": "1",
    "verifyingContract": contractAddress,
  }
}

function _generateOfferItem(itemType, tokenAddress, tokenIdentifier, amount) {
  return {
    "itemType": itemType,
    "token": tokenAddress,
    "identifier": tokenIdentifier,
    "amount": amount
  }
}

function _generatePayoutItem(itemType, tokenAddress, tokenIdentifier, recipientAddress, amount) {
  return {
    "itemType": itemType,
    "token": tokenAddress,
    "identifier": tokenIdentifier,
    "recipient": recipientAddress,
    "amount": amount
  }
}

function _generateListingItem(contractAddress, signerAddress, offers, offererPayout, creatorPayouts, orderType, listedAt, expiredAt, saleId, version) {
  const data = {
    "domain": _generateDomain(contractAddress),
    "message": {
        "offerer": signerAddress,
        "offers": offers,
        "offererPayout": offererPayout,
        "creatorPayouts": creatorPayouts,
        "orderType": orderType,
        "listedAt": listedAt,
        "expiredAt": expiredAt,
        "saleId": saleId,
        "version": version,
    },
    primaryType: listingPrimaryType,
    types: listingDataTypes,
  }

  return data
}

function generateDefaultListingItem(contractAddress, signerAddress, erc721TokenAddress, erc721TokenId, listingPriceInEth, creatorPayoutAddress, creatorFeeRate = 500) {
  const offers = [
    _generateOfferItem(ItemType.ERC721_TOKEN, erc721TokenAddress, erc721TokenId, 1),
  ]
  const version = 1 // Message Version
  const marketFeeRate = 250
  const listingPrice = ethers.utils.parseEther(listingPriceInEth)
  const creatorFee = listingPrice.mul(creatorFeeRate).div(10000)
  const marketFee = listingPrice.mul(marketFeeRate).div(10000)
  const earning = listingPrice.sub(creatorFee).sub(marketFee)
  const offererPayout =  _generatePayoutItem(ItemType.COIN, "0x0000000000000000000000000000000000000000", 0, signerAddress, earning.toString())
  const creatorPayouts = [
    _generatePayoutItem(ItemType.COIN, "0x0000000000000000000000000000000000000000", 0, creatorPayoutAddress, creatorFee.toString()),
  ]
  const listedAt = Math.floor(new Date().getTime() / 1000);
  const expiredAt = listedAt + 24 * 60 * 60;
  const saleId = ethers.Wallet.createRandom().address
  const data = _generateListingItem(
    contractAddress,
    signerAddress,
    offers,
    offererPayout,
    creatorPayouts,
    OrderType.FULL_RESTRICTED,
    listedAt,
    expiredAt,
    saleId,
    version)

  return data
}

module.exports = {
  ItemType: ItemType,
  OrderType: OrderType,
  generateOfferItem: _generateOfferItem,
  generatePayoutItem: _generatePayoutItem,
  generateListingItem: _generateListingItem,
  generateDefaultListingItem: generateDefaultListingItem,
}
