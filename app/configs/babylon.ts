import { NetworkConfig } from "@/types/chain";
import { CHAINS } from "./chains";

const BABYLON_CONTRACTS_MAINNET = {
    chainName: CHAINS.babylon.chainName ?? "",
    channelId: {
        source: 1,
        destination: 4,
        destinationIbcChannelId: "channel-3"
    },
    faucet: "",
    feeAddress: "bbn1fh0yyvuxz7l0vcusq5jc9zvzpm8ec2auvvkh44",
    liquidTokenAddress: {
        babylon: "bbn1s7jzz7cyuqmy5xpr07yepka5ngktexsferu2cr4xeww897ftj77sv30f5s",
        ethereum: "0x70dF20655b3e294facB436383435754dbee3CD70" as `0x${string}`
    },
    lst: "bbn1m7zr5jw4k9z22r9ajggf4ucalwy7uxvu9gkw6tnsmv42lvjpkwasagek5g",
    minimumUnbond: 0.01,
    native: "ubbn",
    rest: "https://babylon.nodes.guru/api",
    reward: "",
    rpc: "https://babylon.nodes.guru/rpc",
    tokenMinter: "bbn1c723xf74f0r9g4uyn0cv2t7pkgcq7x0gaw5h773j78rk35w0j0usslxen6",
    tx_page: "https://www.mintscan.io/babylon/tx/${txHash}",
    ucs3Contract: {
        babylon: "bbn1336jj8ertl8h7rdvnz4dh5rqahd09cy0x43guhsxx6xyrztx292q77945h",
        osmosis: "osmo1336jj8ertl8h7rdvnz4dh5rqahd09cy0x43guhsxx6xyrztx292qs2uecc",
    },
    unstakingOffset: (6 * 60 * 60 * 1000), // 6 hours
};

/* might be used later for testnet testing
const BABYLON_CONTRACTS_TESTNET = {
    chainName: CHAINS.babylon.chainName ?? "",
    lst: "bbn1ug4tume0pw6d4u7r6rhae6cp3udyrv7cr0angx8qegw7ur25sdxq4krcss",
    cw20: "bbn1cnx34p82zngq0uuaendsne0x4s5gsm7gpwk2es8zk8rz8tnj938qqyq8f9",
    feeAddress: "bbn1fh0yyvuxz7l0vcusq5jc9zvzpm8ec2auvvkh44",
    reward: "bbn1ug4tume0pw6d4u7r6rhae6cp3udyrv7cr0angx8qegw7ur25sdxq4krcss",
    faucet: "bbn1lwgg40wkjaqy7tp6522zp7lv0svln7scgc8jx0cqzlg59nmae8ys3pv27v",
    tx_page: "https://testnet.babylon.explorers.guru/transaction/${txHash}",
    rest: "https://babylon-testnet-api.nodes.guru",
    rpc: "https://babylon-testnet-rpc.nodes.guru/rpc",
    unstakingOffset: (0 * 60 * 60 * 1000),
    minimumUnbond: 0.01,
    ucs3Contract: {
        babylon: "",
        osmosis: ""
    }
};
 */

export const BABYLON_CONTRACTS = BABYLON_CONTRACTS_MAINNET;

export const BABYLON_CONFIG: NetworkConfig[] = [];
