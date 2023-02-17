//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MockERC721Token is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721("MockNFT", "MOCKNFT") {
  }

  function adminMint(address to) public onlyOwner {
    _tokenIds.increment();
    _mint(to, _tokenIds.current());
  }

  function adminMintBulk(address to, uint256 amount) public onlyOwner {
    for (uint i = 0; i < amount; i++) {
      _tokenIds.increment();
      _mint(to, _tokenIds.current());
    }
  }

  function totalSupply() public view returns (uint256) {
    return _tokenIds.current();
  }
}
