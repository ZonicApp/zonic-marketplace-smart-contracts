# Zonic NFT Marketplace Smart Contracts

A solidity smart contract of Zonic NFT Marketplace.

## Setup

Please do the following to set up the project in a state that is ready for testing.

```
cp .env.example .env
npm install
```

If you want to deploy and verify the smart contract on Etherscan, please edit the .env file to enter the deployer wallet's seed phrase, as well as the API keys for Etherscan.

## Run Test

The Zonic NFT Marketplace smart contract has been tested with automated tests. You can run the tests using the following command.

```
npx hardhat test --network ganache
```
