import { createConfig, http } from 'wagmi';
import { holesky, mainnet, sepolia } from 'wagmi/chains';
import { safe } from 'wagmi/connectors';

// [sepolia.id, "https://sepolia.infura.io/v3/1152a3ed05224d72a03659974aeeb8eb"],
// [holesky.id, "https://holesky.infura.io/v3/1152a3ed05224d72a03659974aeeb8eb"],

export const ALLOWED_WALLETS = [
  {
    id: "io.metamask",
    name: "Metamask",
    logo: "/images/wallet/metamask.svg",
    url: "https://metamask.io/"
  },
  {
    id: "io.rabby",
    name: "Rabby",
    logo: "/images/wallet/rabby.svg",
    url: "https://rabby.io/"
  },
  {
    id: "com.okex.wallet",
    name: "OKX",
    logo: "/images/wallet/okx.png",
    url: "https://www.okx.com/"
  },
  {
    id: "me.rainbow",
    name: "Rainbow",
    logo: "/images/wallet/rainbow.svg",
    url: "https://rainbow.me/"
  },
  {
    id: "com.coinbase.wallet",
    name: "Coinbase",
    logo: "/images/wallet/coinbase.svg",
    url: "https://www.coinbase.com/wallet"
  }
  // "xyz.ithaca.porto" // Passkey
  // "com.trustwallet.app",
];

export const EMV_CHAINS = new Map([
  [
    mainnet.id,
    {
      chain: mainnet,
      rpc: "https://rpc.ankr.com/eth/18947e49f3f2e53534da7c68fd7584d7e93b02f1abcf295a4c90cfdd1951d166",
      tx_page: "https://etherscan.io/tx/${txHash}",
    }
  ],
  [
    holesky.id,
    {
      chain: holesky,
      rpc: "https://ethereum-holesky-rpc.publicnode.com",
      tx_page: "https://holesky.etherscan.io/tx/${txHash}",
    }
  ],
  [
    sepolia.id,
    {
      chain: sepolia,
      rpc: "https://sepolia.infura.io/v3/1152a3ed05224d72a03659974aeeb8eb",
      tx_page: "https://etherscan.io/tx/${txHash}",
    }
  ],
]);

export const wagmiConfig = createConfig({
  chains: [mainnet, holesky, sepolia],
  transports: {
    [mainnet.id]: http(EMV_CHAINS.get(mainnet.id)?.rpc),
    [holesky.id]: http(EMV_CHAINS.get(holesky.id)?.rpc),
    [sepolia.id]: http(EMV_CHAINS.get(sepolia.id)?.rpc),
  },
  connectors: [
    safe({
      allowedDomains: [/^app\.safe\.global$/],
    })
  ]
})

export const FAUCET_LINK = {
  "sepolia": "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
  "holesky": "https://cloud.google.com/application/web3/faucet/ethereum/holesky"
}