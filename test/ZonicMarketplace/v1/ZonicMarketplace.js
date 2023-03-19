const { ethers, upgrades, waffle } = require("hardhat");
const { expect } = require("chai");
const sigUtil = require('@metamask/eth-sig-util');
const { generateDefaultListingItem } = require('./ListingItemUtils');

const marketplaceWallet = new ethers.Wallet(ethers.Wallet.createRandom(), waffle.provider)
const adminWallet = new ethers.Wallet(ethers.Wallet.createRandom(), waffle.provider)

describe("ZonicMarketplaceV1", function () {
  async function deployZonicMarketplaceContract() {
    const [owner, zoner, creator] = await ethers.getSigners();

    const ZonicMarketplaceV1 = await ethers.getContractFactory("ZonicMarketplaceV1");
    const proxy = await upgrades.deployProxy(ZonicMarketplaceV1, [
      "Zonic : NFT Marketplace for L2",
      "1",
      1000,                      // Creator Fee Max Percentage
      250,                       // Marketplace Fee Percentage
      marketplaceWallet.address, // Marketplace Fee Payout Address
      adminWallet.address,       // Admin Address for signature matching
      adminWallet.address,       // Admin Address for order cancelation
    ]);
    await proxy.deployed();

    return proxy
  }

  async function deployMockERC721TokenContract() {
    const MockERC721Token = await ethers.getContractFactory("MockERC721Token");
    const mockERC721Token = await MockERC721Token.deploy();
    await mockERC721Token.deployed();
    return mockERC721Token
  }

  async function prepareSignerAndERC721Token(owner, contract, erc721TokenContract, tokenToMint, approvalForAll = false) {
    const wallet = ethers.Wallet.createRandom()
    const signer = new ethers.Wallet(wallet, waffle.provider)

    await owner.sendTransaction({
      to: signer.address,
      value: ethers.utils.parseEther("0.1")
    });
    await owner.sendTransaction({
      to: adminWallet.address,
      value: ethers.utils.parseEther("0.1")
    });

    for (let i = 1; i <= tokenToMint; i++) {
      // Mint
      await erc721TokenContract.adminMint(signer.address)
      // Approve for Transfer if needed
      if (approvalForAll)
        await erc721TokenContract.connect(signer).setApprovalForAll(contract.address, i);
    }

    return signer
  }

  function signTypedDataV4(data, signer) {
    return sigUtil.signTypedData({
      privateKey: Buffer.from(signer.privateKey.substring(2), 'hex'),
      data: data,
      version: sigUtil.SignTypedDataVersion.V4
    })
  }

  async function getRSV(messageHash) {
    let messageHashBytes = ethers.utils.arrayify(messageHash)
    let flatSig = await adminWallet.signMessage(messageHashBytes);

    let r = `0x${flatSig.slice(2, 66)}`;
    let s = `0x${flatSig.slice(66, 130)}`;
    let v = ethers.BigNumber.from(`0x${flatSig.slice(130, 132)}`).toNumber();

    return { r, s, v }
  }

  async function generateAdminSignature(saleId, expiredInSecond) {
    const expiredAt = Math.floor(new Date().getTime() / 1000 + expiredInSecond)
    return generateAdminSignatureExpiredAt(saleId, expiredAt)
  }

  async function generateAdminSignatureExpiredAt(saleId, expiredAt) {
    let messageHash = ethers.utils.solidityKeccak256(
      ["address", "string", "uint32", "string", "uint256"],
      [saleId, "%", expiredAt, "%", 1]
    );
    let { r, s, v } = await getRSV(messageHash);
    return {
      expiredAt, r, s, v
    }  
  }

  it("ZonicMarketplaceV1: Should process the listing successfully", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    // Mark seller's current wallet balance
    const sellerWalletBalanceBefore = await waffle.provider.getBalance(signer.address)
    const creatorWalletBalanceBefore = await waffle.provider.getBalance(creator.address)
    const marketplaceWalletBalanceBefore = await waffle.provider.getBalance(marketplaceWallet.address)

    // Fulfill Order
    await contract.fulfillBasicOrder(
      data.message,
      Buffer.from(signature.substring(2), 'hex'),
      adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
      { value: ethers.utils.parseEther("1") }
    )

    // Check the new ownership
    expect(await erc721TokenContract.ownerOf(1)).to.be.equal(owner.address)

    // Check the wallets' balance
    const sellerWalletBalanceAfter = await waffle.provider.getBalance(signer.address)
    const creatorWalletBalanceAfter = await waffle.provider.getBalance(creator.address)
    const marketplaceWalletBalanceAfter = await waffle.provider.getBalance(marketplaceWallet.address)

    // Check for seller wallet balance
    expect(await sellerWalletBalanceAfter.sub(sellerWalletBalanceBefore))
      .to.be.equal(ethers.utils.parseEther("0.925"))
    // Check for creator wallet balance
    expect(await creatorWalletBalanceAfter.sub(creatorWalletBalanceBefore))
      .to.be.equal(ethers.utils.parseEther("0.05"))
    // Check for marketplace wallet balance
    expect(await marketplaceWalletBalanceAfter.sub(marketplaceWalletBalanceBefore))
      .to.be.equal(ethers.utils.parseEther("0.025"))
  });

  it("ZonicMarketplaceV1: Should not be able to process to order twice", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    await contract.fulfillBasicOrder(
      data.message,
      Buffer.from(signature.substring(2), 'hex'),
      adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
      { value: ethers.utils.parseEther("1") }
    )
    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
        { value: ethers.utils.parseEther("1") }
      )
    ).to.be.revertedWith('Duplicate saleId')
  })

  it("ZonicMarketplaceV1: Should revert if token is not owned by offerer", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)
    await erc721TokenContract.connect(signer)['safeTransferFrom(address,address,uint256)'](signer.address, zoner.address, 1)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
        { value: ethers.utils.parseEther("1") }
      )
    ).to.be.revertedWith('caller is not token owner or approved')
  })

  it("ZonicMarketplaceV1: Should revert if token transfer is not approved", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, false)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
        { value: ethers.utils.parseEther("1") }
      )
    ).to.be.revertedWith('caller is not token owner or approved')
  })

  it("ZonicMarketplaceV1: Should revert the expired listing", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )
    data.message.expiredAt = data.message.listedAt - 100

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)
  
    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
        { value: ethers.utils.parseEther("1") }
      )
    ).to.be.revertedWith('Order Expired')
  });

  it("ZonicMarketplaceV1: Should be reverted if no ETH is sent", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
      )
    ).to.be.revertedWith('Missing Ether')
  });

  it("ZonicMarketplaceV1: Should be reverted if wrong amount of ETH sent", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    // Get Admin Signature
    const adminSig = await generateAdminSignature(data.message.saleId, 180)

    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
        { value: ethers.utils.parseEther("0.5") }
      )
    ).to.be.revertedWith('Missing Ether')

    await expect(
      contract.fulfillBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex'),
        adminSig.v, adminSig.r, adminSig.s, adminSig.expiredAt,
        { value: ethers.utils.parseEther("2") }
      )
    ).to.be.revertedWith('Missing Ether')
  });

  it("ZonicMarketplaceV1: Should revert the exceeded allowed creator fee rate listing", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const validData = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
      1000,                        // Creator Fee Rate
    )
    // Sign with TypedData v4
    const signatureOfValidData = signTypedDataV4(validData, signer)
  
    // Get Admin Signature
    const adminSigForValidData = await generateAdminSignature(validData.message.saleId, 180)

    await contract.fulfillBasicOrder(
      validData.message,
      Buffer.from(signatureOfValidData.substring(2), 'hex'),
      adminSigForValidData.v, adminSigForValidData.r, adminSigForValidData.s, adminSigForValidData.expiredAt,
      { value: ethers.utils.parseEther("1") }
    )

    const invalidData = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
      1001,                        // Creator Fee Rate
    )
    // Sign with TypedData v4
    const signatureOfInvalidData = signTypedDataV4(invalidData, signer)

    // Get Admin Signature
    const adminSigForInvalidData = await generateAdminSignature(invalidData.message.saleId, 180)

    await expect(
      contract.fulfillBasicOrder(
        invalidData.message,
        Buffer.from(signatureOfInvalidData.substring(2), 'hex'),
        adminSigForInvalidData.v, adminSigForInvalidData.r, adminSigForInvalidData.s, adminSigForInvalidData.expiredAt,
        { value: ethers.utils.parseEther("1") }
      )
    ).to.be.revertedWith('Total creator fee exceeds the allowed rate')
  });

  it("ZonicMarketplaceV1: Should be able to cancel order by referer or admin successfully", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    await contract.connect(signer).cancelBasicOrder(
      data.message,
      Buffer.from(signature.substring(2), 'hex')
    )
    await contract.connect(adminWallet).cancelBasicOrder(
      data.message,
      Buffer.from(signature.substring(2), 'hex')
    )
  })

  it("ZonicMarketplaceV1: Should not be able to cancel order by non-referer or non-zoner successfully", async function () {
    const [owner, zoner, creator] = await ethers.getSigners();

    const contract = await deployZonicMarketplaceContract();
    const erc721TokenContract = await deployMockERC721TokenContract()

    const signer = await prepareSignerAndERC721Token(owner, contract, erc721TokenContract, 1, true)

    const data = generateDefaultListingItem(
      contract.address,
      signer.address,
      erc721TokenContract.address, // Token Address
      1,                           // Token ID
      '1',                         // Listing price in ETH
      creator.address,             // Creator Payout Address
    )

    // Sign with TypedData v4
    const signature = signTypedDataV4(data, signer)

    await expect(
      contract.cancelBasicOrder(
        data.message,
        Buffer.from(signature.substring(2), 'hex')
      )
    ).to.be.revertedWith('Caller is not offerer or admin')
  })
})
