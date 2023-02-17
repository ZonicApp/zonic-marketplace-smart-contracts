// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract PersonalSignLib {
  function __recoverAddress(bytes memory data, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
    bytes32 msgHash = keccak256(data);
    bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
    return ecrecover(messageDigest, v, r, s);
  }
}
