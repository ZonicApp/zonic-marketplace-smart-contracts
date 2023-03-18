require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ganache");
require('@openzeppelin/hardhat-upgrades');
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
require("dotenv").config()

const mnemonic = process.env.SEED_PHRASE

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },
  zksolc: {
    version: "1.3.1",
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: 'ganache',
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      blockGasLimit: 1000000000429720
    },
    ganache: {
      url: "http://localhost:1337",
      gasLimit: 6000000000,
      defaultBalanceEther: 1000,
      blockGasLimit: 1000000000429720,
      timeout: 60000,
    },
    hardhat: {
    },
    optimism: {
      url: "https://mainnet.optimism.io/",
      chainId: 10,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
    optimismGoerli: {
      url: "https://goerli.optimism.io",
      chainId: 420,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
    arbitrumOne: {
      url: "https://arbitrum.blockpi.network/v1/rpc/public",
      chainId: 42161,
      gasPrice: 100000000,
      accounts: {mnemonic: mnemonic}
    },
    arbitrumNova: {
      url: "https://nova.arbitrum.io/rpc",
      chainId: 42170,
      gasPrice: 100000000,
      accounts: {mnemonic: mnemonic}
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc/",
      chainId: 421613,
      gasPrice: 100000000,
      accounts: {mnemonic: mnemonic}
    },
    ethereum: {
      url: 'https://eth-mainnet.public.blastapi.io',
      chainId: 1,
      gasPrice: 13000000000,
      accounts: {mnemonic: mnemonic}
    },
    ethereumGoerli: {
      url: 'https://goerli.blockpi.network/v1/rpc/public',
      chainId: 5,
      gasPrice: 8000000000,
      accounts: {mnemonic: mnemonic}
    },
    baseGoerli: {
      url: 'https://goerli.base.org',
      chainId: 84531,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
    mantleTestnet: {
      url: 'https://rpc.testnet.mantle.xyz',
      chainId: 5001,
      accounts: {mnemonic: mnemonic}
    },
    acrechainTestnet: {
      url: 'https://rpc2-testnet2-acre.synergynodes.com',
      chainId: 9051,
      accounts: {mnemonic: mnemonic}
    },
    zksync2: {
      url: 'https://zksync2-testnet.zksync.dev',
      chainId: 280,
      gasPrice: 250000000,
      ethNetwork: "goerli",
      zksync: true,
      accounts: {mnemonic: mnemonic}
    },
    polygonZkEvmTestnet: {
      url: 'https://rpc.public.zkevm-test.net',
      chainId: 1442,
      accounts: {mnemonic: mnemonic}
    },
    scrollAlphaTestnet: {
      url: 'https://alpha-rpc.scroll.io/l2',
      chainId: 534353,
      accounts: {mnemonic: mnemonic}
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_MAINNET_API_KEY,
      optimism: process.env.ETHERSCAN_OPTIMISM_API_KEY,
      optimismGoerli: process.env.ETHERSCAN_OPTIMISM_API_KEY,
      optimisticEthereum: process.env.ETHERSCAN_OPTIMISM_API_KEY,
      arbitrumOne: process.env.ETHERSCAN_ARBITRUM_ONE_API_KEY,
      arbitrumNova: process.env.ETHERSCAN_ARBITRUM_NOVA_API_KEY,
      baseGoerli: process.env.ETHERSCAN_BASE_GOERLI_API_KEY,
      mantleTestnet: process.env.ETHERSCAN_MANTLE_TESTNET_API_KEY,
      acrechainTestnet: process.env.ETHERSCAN_ACRECHAIN_TESTNET_API_KEY,
      zkSyncTestnet: process.env.ETHERSCAN_ZKSYNC_TESTNET_API_KEY,
      polygonZkEvmTestnet: process.env.ETHERSCAN_POLYGONZKEVM_TESTNET_API_KEY,
      scrollAlphaTestnet: process.env.ETHERSCAN_SCROLL_ALPHA_TESTNET_API_KEY,
    },
    customChains: [
      {
        network: "optimism",
        chainId: 10,
        urls: {
          apiURL: "https://api-optimistic.etherscan.io/api",
          browserURL: "https://optimistic.etherscan.io/"
        }
      },
      {
        network: "optimismGoerli",
        chainId: 420,
        urls: {
          apiURL: "https://api-goerli-optimism.etherscan.io/api",
          browserURL: "https://goerli-optimism.etherscan.io/"
        }
      },
      {
        network: "arbitrumNova",
        chainId: 42170,
        urls: {
          apiURL: "https://api-nova.arbiscan.io/api",
          browserURL: "https://nova.arbiscan.io/"
        }
      },
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org/"
        }
      },
      {
        network: "mantleTestnet",
        chainId: 5001,
        urls: {
          apiURL: "https://explorer.testnet.mantle.xyz/api",
          browserURL: "https://explorer.testnet.mantle.xyz"
        }
      },
      {
        network: "acrechainTestnet",
        chainId: 9051,
        urls: {
          apiURL: "https://testnet.acrescan.com/api",
          browserURL: "https://testnet.acrescan.com"
        }
      },
      {
        network: "zkSyncTestnet",
        chainId: 280,
        urls: {
          apiURL: "https://zksync2-testnet.zkscan.io/api",
          browserURL: "https://zksync2-testnet.zkscan.io/"
        }
      },
      {
        network: "polygonZkEvmTestnet",
        chainId: 1442,
        urls: {
          apiURL: "https://explorer.public.zkevm-test.net/api",
          browserURL: "https://explorer.public.zkevm-test.net"
        }
      },
      {
        network: "scrollAlphaTestnet",
        chainId: 534353,
        urls: {
          apiURL: "https://blockscout.scroll.io/api",
          browserURL: "https://blockscout.scroll.io"
        }
      },
    ]
  },
};
