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
    base: {
      url: 'https://developer-access-mainnet.base.org',
      chainId: 8453,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
    baseGoerli: {
      url: 'https://goerli.base.org',
      chainId: 84531,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
    mantle: {
      url: 'https://rpc.mantle.xyz',
      chainId: 5000,
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
    zkSyncEra: {
      url: 'https://mainnet.era.zksync.io',
      chainId: 324,
      ethNetwork: "mainnet",
      zksync: true,
      accounts: {mnemonic: mnemonic}
    },
    zkSyncTestnet: {
      url: 'https://zksync2-testnet.zksync.dev',
      chainId: 280,
      ethNetwork: "goerli",
      zksync: true,
      verifyURL: 'https://zksync2-testnet.zkscan.io/verify_smart_contract/contract_verifications',
      accounts: {mnemonic: mnemonic}
    },
    polygonZkEvm: {
      url: 'https://zkevm-rpc.com',
      chainId: 1101,
      accounts: {mnemonic: mnemonic}
    },
    polygonZkEvmTestnet: {
      url: 'https://rpc.public.zkevm-test.net',
      chainId: 1442,
      accounts: {mnemonic: mnemonic}
    },
    scrollAlphaTestnet: {
      url: 'https://scroll-testnet.blockpi.network/v1/rpc/public',
      chainId: 534353,
      accounts: {mnemonic: mnemonic}
    },
    linea: {
      url: 'https://linea-mainnet.infura.io/v3/024616923572461d94293059d417af98',
      chainId: 59144,
      accounts: {mnemonic: mnemonic}
    },
    lineaGoerli: {
      url: 'https://rpc.goerli.linea.build',
      chainId: 59140,
      accounts: {mnemonic: mnemonic}
    },
    opbnb: {
      url: 'https://opbnb-mainnet-rpc.bnbchain.org',
      chainId: 204,
      accounts: {mnemonic: mnemonic}
    },
    taikoTestnet: {
      url: 'https://rpc.a2.taiko.xyz',
      chainId: 167004,
      accounts: {mnemonic: mnemonic}
    },
    shibarium: {
      url: 'https://www.shibrpc.com',
      chainId: 109,
      accounts: {mnemonic: mnemonic}
    },
    lightlink_phoenix: {
      url: 'https://replicator-01.phoenix.lightlink.io/rpc/v1',
      chainId: 1890,
      accounts: {mnemonic: mnemonic}
    },
    metis: {
      url: 'https://metis-mainnet.public.blastapi.io',
      chainId: 1088,
      accounts: {mnemonic: mnemonic}
    },
    scroll: {
      url: 'https://rpc.scroll.io',
      chainId: 534352,
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
      zkSyncEra: process.env.ETHERSCAN_ZKSYNC_ERA_API_KEY,
      polygonZkEvm: process.env.ETHERSCAN_POLYGONZKEVM_API_KEY,
      base: process.env.ETHERSCAN_BASE_API_KEY,
      mantle: process.env.ETHERSCAN_MANTLE_API_KEY,
      baseGoerli: process.env.ETHERSCAN_BASE_GOERLI_API_KEY,
      mantleTestnet: process.env.ETHERSCAN_MANTLE_TESTNET_API_KEY,
      acrechainTestnet: process.env.ETHERSCAN_ACRECHAIN_TESTNET_API_KEY,
      zkSyncTestnet: process.env.ETHERSCAN_ZKSYNC_TESTNET_API_KEY,
      polygonZkEvmTestnet: process.env.ETHERSCAN_POLYGONZKEVM_TESTNET_API_KEY,
      scrollAlphaTestnet: process.env.ETHERSCAN_SCROLL_ALPHA_TESTNET_API_KEY,
      linea: process.env.ETHERSCAN_LINEA_API_KEY,
      lineaGoerli: process.env.ETHERSCAN_LINEA_GOERLI_API_KEY,
      taikoTestnet: process.env.ETHERSCAN_TAIKO_TESTNET_API_KEY,
      opbnb: process.env.ETHERSCAN_OPBNB_API_KEY,
      shibarium: process.env.ETHERSCAN_SHIBARIUM_API_KEY,
      lightlink_phoenix: process.env.ETHERSCAN_LIGHTLINK_PHOENIX_API_KEY,
      metis: process.env.ETHERSCAN_METIS_API_KEY,
      scroll: process.env.ETHERSCAN_SCROLL_API_KEY,
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
        network: "zkSyncEra",
        chainId: 324,
        urls: {
          apiURL: "https://explorer.zksync.io/api",
          browserURL: "https://explorer.zksync.io/"
        }
      },
      {
        network: "polygonZkEvm",
        chainId: 1101,
        urls: {
          apiURL: 'https://api-zkevm.polygonscan.com/api',
          browserURL: 'https://zkevm.polygonscan.com/'
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/"
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
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://explorer.mantle.xyz/api",
          browserURL: "https://explorer.mantle.xyz"
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
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com"
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
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "http://explorer.linea.build/api",
          browserURL: "https://explorer.linea.build"
        }
      },
      {
        network: "lineaGoerli",
        chainId: 59140,
        urls: {
          apiURL: "https://explorer.goerli.linea.build/api",
          browserURL: "https://explorer.goerli.linea.build"
        }
      },
      {
        network: "taikoTestnet",
        chainId: 167004,
        urls: {
          apiURL: "https://explorer.a2.taiko.xyz/api",
          browserURL: "https://explorer.a2.taiko.xyz"
        }
      },
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL: `https://open-platform.nodereal.io/${process.env.ETHERSCAN_OPBNB_API_KEY}/op-bnb-testnet/contract/`,
          browserURL: "https://mainnet.opbnbscan.com"
        }
      },
      {
        network: "shibarium",
        chainId: 109,
        urls: {
          apiURL: ``,
          browserURL: "https://www.shibariumscan.io"
        }
      },
      {
        network: "lightlink_phoenix",
        chainId: 1890,
        urls: {
          apiURL: ``,
          browserURL: "https://phoenix.lightlink.io"
        }
      },
      {
        network: "metis",
        chainId: 1088,
        urls: {
          apiURL: `https://api.routescan.io/v2/network/mainnet/evm/1088/etherscan/api`,
          browserURL: "https://andromeda-explorer.metis.io"
        }
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: `https://api.routescan.io/v2/network/mainnet/evm/534352/etherscan/api`,
          browserURL: "https://blockscout.scroll.io"
        }
      },
    ]
  },
};
