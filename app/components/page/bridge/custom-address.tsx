import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { isValidCosmosAddress, isValidEvmAddress } from "@/lib/cosmos";
import { CustomToken } from "@/types/chain";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface Props {
    defaultAddress?: string
    tokenOut: CustomToken
    onAddressSet(val: string): void
    onClose(): void
}

const CustomAddress = (props: Props) => {
    const [addressAck, setAddressAck] = useState(false);
    const [fAddress, setFAddress] = useState<string | undefined>(props.defaultAddress);

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setFAddress(text);
        } catch (err) {
            console.error('Failed to read clipboard: ', err);
        }
    };

    const buttonStatus = useMemo((): { enabled: boolean, text: string } => {
        if (!fAddress || fAddress === "") {
            return {
                enabled: false,
                text: "Input recipient address"
            }
        }

        if (!addressAck) {
            return {
                enabled: false,
                text: "Confirm recipient address"
            }
        }

        if (props.tokenOut.chain.cosmosChain) {
            if (!isValidCosmosAddress(fAddress, props.tokenOut.chain.cosmosChain)) {
                return {
                    enabled: false,
                    text: "Invalid address"
                }
            }
        }

        if (props.tokenOut.chain.viemChain) {
            if (!isValidEvmAddress(fAddress)) {
                return {
                    enabled: false,
                    text: "Invalid address"
                }
            }
        }

        // switch (props.tokenOut.chain.id) {
        //     case CHAINS.mainnet.id:
        //         if (fAddress.slice(0, 2) !== "0x") {
        //             return {
        //                 enabled: false,
        //                 text: "Invalid address"
        //             }
        //         }
        //         break;

        //     case CHAINS.babylon.id:
        //         if (fAddress.slice(0, 3) !== "bbn") {
        //             return {
        //                 enabled: false,
        //                 text: "Invalid address"
        //             }
        //         }
        //         break;
        // }

        return {
            enabled: true,
            text: "Confirm recipient address"
        }
    }, [fAddress, addressAck]);

    return (
        <div
            className="absolute inset-0 overflow-hidden flex flex-col justify-end bg-escher-fafbfc dark:bg-escher-darkblue bg-opacity-75 dark:bg-opacity-85"
            onClick={props.onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white dark:bg-escher-dark_0c203d h-fit p-6 rounded-t-2xl rounded-b-lg flex flex-col border border-escher-E4E8ED dark:border-escher-darkblue_border"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <div className="font-medium text-escher-electricblue dark:text-white">Add Recipient Address</div>

                    <button
                        className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                        onClick={props.onClose}
                    >
                        <Icon type="FaTimes" className="w-3 h-3" />
                    </button>
                </div>
                <div className="text-sm font-medium text-escher-777e90">Swap and send tokens to another address</div>

                <div className="w-full relative h-full flex items-center justify-center mt-6">
                    <input
                        className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-F5F5FF dark:bg-escher-darkblue text-escher-777e90 dark:text-white rounded-full h-full px-4 py-3 font-medium text-sm w-full"
                        onChange={e => {
                            setFAddress(e.target.value)
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="Enter Recipient Address"
                        type="text"
                        value={fAddress}
                    />
                    <button
                        onClick={handlePasteFromClipboard}
                        className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                    >paste</button>
                </div>

                <button
                    className="flex items-center gap-1 mt-4 hover:underline"
                    onClick={() => setAddressAck(prev => !prev)}
                >
                    <input type="checkbox" checked={addressAck} />
                    <div className="text-xs text-escher-777e90 font-medium">The address is correct and not an exchange wallet.</div>
                </button>

                <Button
                    title={buttonStatus.text}
                    enabled={buttonStatus.enabled}
                    className="mt-6"
                    onClick={() => {
                        if (fAddress) {
                            props.onAddressSet(fAddress);
                            props.onClose();
                        }
                    }}
                />
            </motion.div>
        </div>
    );
}

export default CustomAddress;