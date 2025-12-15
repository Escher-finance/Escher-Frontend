import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { APP_CONFIG } from "@/configs/app";
import { ALLOWED_WALLETS } from "@/configs/wagmi";
import { WALLET_IMAGES } from "@/configs/wallet";
import { sleep } from "@/lib";
import { useManager, useWallet } from "@cosmos-kit/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useConnect, useConnection, useConnectors } from "wagmi";
import Button from "../button";
import { Tab, TabTypes, WalletConnect, WalletInstall, WalletList } from "./components";

interface Props {
    isSidebar?: boolean
    initialTab?: TabTypes
    onTabSelected?(val: TabTypes): void
}

const WalletConnection = (props: Props) => {
    const [tab, setTab] = useState<TabTypes>(props.initialTab ?? 'evm');
    const { account, setOpenWalletConnection } = useEscher();
    const { themeIsDark } = useTheme();

    // EVM
    const { connector: evmConnector } = useConnection();
    const { mutate: connectEvm, isPending } = useConnect()
    const connectors = useConnectors();
    const evmConnectors = useMemo(
        () => connectors.filter(v => ALLOWED_WALLETS.map(w => w.id).includes(v.id) && evmConnector?.id !== v.id),
        [connectors, evmConnector]);

    // Cosmos
    const cosmosManager = useManager()
    const cosmosWallet = useWallet();
    const cosmosConnectors = useMemo(
        () => cosmosManager.mainWallets.filter(v => {
            if (v.walletInfo.name === cosmosWallet.wallet?.name && account.cosmos?.isConnected) {
                return false;
            }
            return true;
        }),
        [cosmosManager, cosmosWallet, account]);

    const unavailableWallets = useMemo(() => {
        const availableWallets = connectors.map(c => c.id);
        return ALLOWED_WALLETS.filter(w => !availableWallets.includes(w.id))
    }, [connectors]);

    return (
        <div className="flex flex-col gap-2" onClick={() => console.log({ connectors, unavailbleWallets: unavailableWallets })}>
            {APP_CONFIG.enableEvm &&
                <Tab
                    tab={tab}
                    setTab={(val) => {
                        setTab(val);
                        if (props.onTabSelected) {
                            props.onTabSelected(val);
                        }
                    }}
                    openWalletModal={() => setOpenWalletConnection(true)}
                    isSidebar={props.isSidebar ?? false}
                    isCosmosConnected={account.cosmos?.isConnected ?? false}
                    isEvmConnected={account.evm?.isConnected ?? false}
                />
            }

            {/* Connected EVM wallet */}
            {["all", "evm"].includes(tab) &&
                <>
                    {account.evm?.isConnected && account.evm?.address &&
                        <WalletList
                            address={account.evm?.address}
                            logo={evmConnector?.id ? WALLET_IMAGES[evmConnector?.id] ?? evmConnector?.icon : evmConnector?.icon}
                            name={evmConnector?.name ?? ""}
                            onLogout={account.evm?.disconnect}
                        />
                    }
                </>
            }

            {/* Connected Cosmos wallet */}
            {["all", "cosmos"].includes(tab) &&
                <>
                    {account.cosmos?.isConnected && account.cosmos?.address &&
                        <WalletList
                            address={account.cosmos.address.babylon}
                            logo={cosmosWallet.wallet?.name ? WALLET_IMAGES[cosmosWallet.wallet?.name] ?? cosmosWallet.wallet?.logo : cosmosWallet.wallet?.logo?.toString()}
                            name={cosmosWallet.wallet?.prettyName ?? ""}
                            onLogout={async () => {
                                account.cosmos?.disconnect();
                            }}
                        />
                    }
                </>
            }

            {/* Wallet List */}
            {!props.isSidebar ? <>
                {APP_CONFIG.enableEvm && ["all", "evm"].includes(tab) &&
                    <>
                        {evmConnectors.map((connector, key) => (
                            <WalletConnect
                                key={key}
                                logo={WALLET_IMAGES[connector.id] ?? connector.icon}
                                name={connector.name}
                                isConnecting={isPending}
                                onConnect={() => connectEvm({ connector })}
                            />
                        ))}
                        {unavailableWallets.map((wallet, key) => (
                            <WalletInstall
                                key={key}
                                logo={wallet.logo}
                                name={wallet.name}
                                url={wallet.url}
                            />
                        ))}
                    </>

                }

                {["all", "cosmos"].includes(tab) &&
                    <>
                        {cosmosConnectors.map((connector, key) => (
                            <WalletConnect
                                key={key}
                                logo={WALLET_IMAGES[connector.walletInfo.name] ?? connector.walletInfo.logo}
                                name={connector.walletInfo.prettyName}
                                isConnecting={false}
                                onConnect={async () => {
                                    if (account.cosmos?.isConnected) {
                                        account.cosmos?.disconnect();
                                        await sleep(0.5);
                                    }
                                    await connector.connect(true);
                                }}
                            />
                        ))}
                    </>}
            </>
                :
                <>
                    {(
                        (!account.cosmos?.isConnected && !account.evm?.isConnected) ||
                        (tab === "evm" && !account.evm?.isConnected) ||
                        (tab === "cosmos" && !account.cosmos?.isConnected) ||
                        (tab === "all" && !account.cosmos?.isConnected && !APP_CONFIG.enableEvm)
                    ) &&
                        <Button
                            title='Connect wallet'
                            onClick={() => setOpenWalletConnection(true)}
                            preComponent={
                                <Image src={themeIsDark ? "/icons/wallet.svg" : "/icons/wallet_icon.svg"} width={24} height={24} alt="wallet" />
                            }
                        />
                    }
                </>
            }
        </div>
    );
}

export default WalletConnection;