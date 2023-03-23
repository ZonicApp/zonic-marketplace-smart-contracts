const { ethers, upgrades, waffle } = require("hardhat");
const { expect } = require("chai");

describe("ZonicPostman", function () {
  async function deployZonicPostmanContract() {
    const ZonicPostman = await ethers.getContractFactory("ZonicPostman");
    const zonicPostman = await ZonicPostman.deploy();
    await zonicPostman.deployed();
    return zonicPostman
  }

  async function deployPostmanCallerContract() {
    const PostmanCaller = await ethers.getContractFactory("PostmanCaller");
    const postmanCaller = await PostmanCaller.deploy();
    await postmanCaller.deployed();
    return postmanCaller
  }

  async function deployMockERC20TokenContract() {
    const MockERC20Token = await ethers.getContractFactory("MockERC20Token");
    const mockERC20Token = await MockERC20Token.deploy();
    await mockERC20Token.deployed();
    return mockERC20Token
  }

  async function deployMockERC721TokenContract() {
    const MockERC721Token = await ethers.getContractFactory("MockERC721Token");
    const mockERC721Token = await MockERC721Token.deploy();
    await mockERC721Token.deployed();
    return mockERC721Token
  }

  it("ZonicPostman: Should be transfer erc20 token successfully", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicPostmanContract();
  })
})
