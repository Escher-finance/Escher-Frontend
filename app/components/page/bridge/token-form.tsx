import { shortenAddress } from "@/lib/text";
import { CustomToken } from "@/types/chain";
import TokenSelection from "./token-selection";
import { formatNumber } from "@/lib/utils";

interface Props {
    activeToken?: CustomToken
    address?: string
    cosmosIsConnected: boolean
    evmIsConnected: boolean
    skipTokenSelection?: boolean
    title: string
    titleNetworkStep?: string
    titleTokenStep?: string
    tokenList: CustomToken[]
    themeIsDark: boolean
    onTokenSelected(token: CustomToken): void
}

const TokenForm = (props: Props) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-escher-777e90 dark:text-white">
                <div>{props.title}</div>
                <div className="flex items-center gap-1 font-medium">
                    <Image alt="" src={props.themeIsDark ? "/icons/wallet-white.svg" : "/icons/wallet-blue.svg"} />
                    <div>{props.address ? shortenAddress(props.address) : "-"}</div>
                </div>
            </div>
            {props.activeToken &&
                <TokenSelection
                    cosmosIsConnected={props.cosmosIsConnected}
                    evmIsConnected={props.evmIsConnected}
                    onTokenSelected={props.onTokenSelected}
                    selectedToken={props.activeToken}
                    skipTokenSelection={props.skipTokenSelection}
                    titleNetworkStep={props.titleNetworkStep}
                    titleTokenStep={props.titleTokenStep}
                    tokens={props.tokenList}
                />
            }
            <div className="flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-400">
                <div className="">
                    Balance : {formatNumber(Number(props.activeToken?.balance?.formattedBalance), true, 4)}
                </div>
                <div className="flex items-center gap-1">
                    <Image alt="" src={props.themeIsDark ? "/icons/wallet-white.svg" : "/icons/wallet-blue.svg"} className="w-4 h-4 opacity-50" />
                    <div>${formatNumber(props.activeToken?.balance?.dollarValue ?? 0)}</div>
                </div>
            </div>
        </div>
    );
}

export default TokenForm;