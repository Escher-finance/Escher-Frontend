import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { WalletList } from "@/components/global/walletConnection/components";
import { useEscher } from "@/components/providers/escherProvider";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "@/components/ui/dialog-empty";
import { CHAINS } from "@/configs/chains";
import { isValidCosmosAddress, isValidEvmAddress } from "@/lib/cosmos";
import { shortenAddress } from "@/lib/text";
import { CustomToken } from "@/types/chain";
import { useWallet } from "@cosmos-kit/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useConnection } from "wagmi";

interface Props {
    defaultAddress?: string
    selectedToken: CustomToken
    onRecipientAddressChange(val: string): void
    open?: boolean
    setOpen?(val: boolean): void
}

const RecipientForm = (props: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            <DialogTrigger className="flex flex-row items-center gap-1" disabled={false}>
                <div
                    className=" bg-escher-electricblue_light9 rounded-full aspect-square flex items-center justify-center"
                >
                    <Image src={'/icons/wallet_icon_blue.svg'} alt="" width={20} height={20} className="rounded-full" />
                </div>
                <div>
                    {props.defaultAddress ? shortenAddress(props.defaultAddress) : "Enter recipient"}
                </div>
                <Icon className="text-escher-electricblue dark:text-white" size="xs" type="FaChevronRight" />
            </DialogTrigger>
            <DialogContent title="Receive" className="w-[500px]">
                <Content
                    onRecipientAddressChange={props.onRecipientAddressChange}
                    selectedToken={props.selectedToken}
                    defaultAddress={props.defaultAddress}
                    open={open}
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty >
    );
}

const Content = (props: Props) => {
    const { account, setOpenWalletConnection } = useEscher();
    const [recipient, setRecipient] = useState<string | undefined>(props.defaultAddress);
    const { connector: connectorEvm } = useConnection();
    const cosmosWallet = useWallet();

    const [isWalletConnected, connectorIcon, connectorName] = useMemo(() => {
        switch (props.selectedToken.chain.network) {
            case "evm": return [
                account.evm?.isConnected,
                connectorEvm?.icon,
                connectorEvm?.name
            ];
            case "cosmos":
                switch (props.selectedToken.chain.id) {
                    case CHAINS.babylon.id:
                        return [
                            account.cosmos?.isConnected,
                            cosmosWallet.wallet?.logo?.toString(),
                            cosmosWallet.wallet?.prettyName
                        ];
                    case CHAINS.osmosis.id:
                        return [
                            account.cosmos?.isConnected,
                            cosmosWallet.wallet?.logo?.toString(),
                            cosmosWallet.wallet?.prettyName
                        ];
                }
                break;
        }

        return [undefined, undefined];
    }, [account.cosmos?.isConnected, account.evm?.isConnected, connectorEvm?.icon, connectorEvm?.name, cosmosWallet.wallet?.logo, cosmosWallet.wallet?.prettyName, props.selectedToken.chain.id, props.selectedToken.chain.network]);

    const buttonStatus = useMemo((): { enabled: boolean, text: string } => {
        if (!recipient || recipient === "") {
            return {
                enabled: false,
                text: "Input recipient address"
            }
        }

        if (props.selectedToken.chain.cosmosChain) {
            if (!isValidCosmosAddress(recipient, props.selectedToken.chain.cosmosChain)) {
                return {
                    enabled: false,
                    text: "Invalid address"
                }
            }
        }

        if (props.selectedToken.chain.viemChain) {
            if (!isValidEvmAddress(recipient)) {
                return {
                    enabled: false,
                    text: "Invalid address"
                }
            }
        }

        return {
            enabled: true,
            text: "Confirm recipient address"
        }
    }, [props.selectedToken.chain.cosmosChain, props.selectedToken.chain.viemChain, recipient]);

    return (
        <div className="flex flex-col gap-2 w-full p-4">
            <DialogTitle className="hidden"></DialogTitle>
            {/* header */}
            <div className="flex items-center">
                <button
                    className="text-escher-electricblue bg-escher-gray100 rounded-full flex items-center justify-center w-8 h-8 hover:bg-escher-gray200"
                    onClick={() => props.setOpen && props.setOpen(false)}
                >
                    <Icon type="FaArrowLeft" size="sm" />
                </button>
                <div className="flex-1 flex justify-center items-center text-escher-gray500 dark:text-white">
                    Receive
                </div>
                <div className="w-8"></div>
            </div>
            <div className="flex flex-row gap-1 items-center">
                <Image src={'/icons/wallet_icon_blue.svg'} alt="" width={20} height={20} className="rounded-full" />
                <div className="text-escher-electricblue dark:text-white text-xs">Your wallet</div>
            </div>
            {isWalletConnected ?
                <WalletList
                    address={props.defaultAddress ?? ""}
                    logo={connectorIcon ?? ""}
                    name={connectorName ?? ""}
                />
                :

                <button
                    onClick={() => {
                        if (props.setOpen) {
                            props.setOpen(false);
                        }
                        setOpenWalletConnection(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-escher-E7E8FE hover:bg-escher-electricblue_light2 text-escher-electricblue p-2 font-semibold rounded-lg"
                >
                    <Image alt="" src={"/icons/wallet-blue.svg"} />
                    <div>Add wallet</div>
                </button>
            }

            <div className="flex flex-row justify-between mt-4">
                <div className="flex flex-row gap-1 items-center">
                    <Image src={'/icons/wallet_icon_blue.svg'} alt="" width={20} height={20} className="rounded-full" />
                    <div className="text-escher-electricblue dark:text-white text-xs">Custom wallet</div>
                </div>
                <div className="text-xs dark:text-white">CEX addresses are not supported</div>
            </div>
            <div
                className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-F5F5FF dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-2 py-1 w-full flex flex-row gap-2 items-center"
            >
                <Image
                    height={25}
                    width={25}
                    src={props.selectedToken.chain.icon ?? ""} alt={props.selectedToken.chain.name}
                />
                <input
                    className="w-full bg-transparent outline-none py-1"
                    value={recipient}
                    onChange={e => {
                        setRecipient(e.currentTarget.value)
                    }}
                    type="text"
                />
            </div>

            <Button
                title={buttonStatus.text}
                enabled={buttonStatus.enabled}
                className="mt-6"
                onClick={() => {
                    if (recipient) {
                        props.onRecipientAddressChange(recipient);
                        if (props.setOpen) {
                            props.setOpen(false);
                        }
                    }
                }}
            />
        </div>
    );
}

export default RecipientForm
