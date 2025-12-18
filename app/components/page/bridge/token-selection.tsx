import IconCircle from "@/components/global/iconCircle";
import TokenChain from "@/components/global/tokenChain";
import { DialogContent, DialogEmpty, DialogTrigger } from "@/components/ui/dialog-empty";
import { CustomToken } from "@/types/chain";
import { useState } from "react";
import Content from "./token-selection/content";

interface Props {
    cosmosIsConnected: boolean
    evmIsConnected: boolean
    onTokenSelected(token: CustomToken): void
    selectedToken: CustomToken
    skipTokenSelection?: boolean
    titleNetworkStep?: string
    titleTokenStep?: string
    tokens: CustomToken[]
}

const TokenSelection = (props: Props) => {
    const [open, setOpen] = useState(false);
    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            <DialogTrigger
                className="flex items-center justify-between border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue hover:bg-slate-50 dark:hover:bg-escher-dark_0c203d rounded-full p-3 gap-4"
            >
                <div className="flex items-center gap-2">
                    <TokenChain
                        token={props.selectedToken}
                    />
                    <div className="flex flex-col items-start gap-1">
                        <div className="text-black dark:text-white text-xl font-semibold leading-none">{props.selectedToken.symbol}</div>
                        <div className="text-escher-777e90 text-sm leading-none">{props.selectedToken.chain.name}</div>
                    </div>
                </div>
                <IconCircle
                    icon="FaChevronDown"
                    className="bg-escher-electricblue_light4 dark:bg-escher-darkblue_2"
                    size="sm"
                />
            </DialogTrigger>
            <DialogContent className="w-[400px]">
                <Content
                    evmIsConnected={props.evmIsConnected}
                    tokens={props.tokens}
                    cosmosIsConnected={props.cosmosIsConnected}
                    onTokenSelected={(token) => {
                        props.onTokenSelected(token);
                        setOpen(false);
                    }}
                    setOpen={setOpen}
                    titleTokenStep={props.titleTokenStep}
                    titleNetworkStep={props.titleNetworkStep}
                    skipTokenSelection={props.skipTokenSelection}
                />
            </DialogContent>
        </DialogEmpty >

    );
}

export default TokenSelection;
