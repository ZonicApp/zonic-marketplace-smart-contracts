// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

enum OrderType {
  FULL_OPEN,
  PARTIAL_OPEN,
  FULL_RESTRICTED,
  PARTIAL_RESTRICTED,
  CONTRACT
}

enum ItemType {
  COIN,
  ERC20_TOKEN,
  ERC721_TOKEN,
  ERC1155_TOKEN
}
