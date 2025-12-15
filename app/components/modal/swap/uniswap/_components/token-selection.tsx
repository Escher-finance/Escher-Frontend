import IconCircle from "@/components/global/iconCircle";
import TokenChain from "@/components/global/tokenChain";
import { DialogContent, DialogEmpty, DialogTrigger } from "@/components/ui/dialog-empty";
import { CustomToken } from "@/types/chain";
import { useState } from "react";
import Content from "./token-selection/content";

interface Props {
    selectedToken: CustomToken
    onTokenSelected(token: CustomToken): void
    tokens: CustomToken[]
    enabled: boolean
}

const TokenSelection = (props: Props) => {
    const [open, setOpen] = useState(false);
    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            <DialogTrigger disabled={!props.enabled} className="flex items-center border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue hover:bg-slate-50 rounded-full px-2 py-1 gap-4">
                <div className="flex items-center gap-2">
                    <TokenChain
                        token={props.selectedToken}
                    />
                    <div className="text-black dark:text-white text-2xl font-medium">{props.selectedToken.symbol}</div>
                </div>
                {props.enabled &&
                    <IconCircle
                        icon="FaChevronDown"
                        className="bg-escher-electricblue_light4 dark:bg-escher-darkblue_2"
                        size="sm"
                    />
                }
            </DialogTrigger>
            <DialogContent className="w-[400px]">
                <Content
                    tokens={props.tokens}
                    onTokenSelected={(token) => {
                        props.onTokenSelected(token);
                        setOpen(false);
                    }}
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty >

    );
}

export default TokenSelection;
