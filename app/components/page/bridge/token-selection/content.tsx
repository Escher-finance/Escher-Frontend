import Icon from "@/components/global/icons";
import { useEscher } from "@/components/providers/escherProvider";
import { DialogTitle } from "@/components/ui/dialog-empty";
import { APP_CONFIG } from "@/configs/app";
import { CustomToken } from "@/types/chain";
import Image from "next/image";
import { useMemo, useState } from "react";
import ChainList from "./chain-list";
import TokenList from "./token-list";

export interface GroupedTokens {
    symbol: string
    name: string
    balance: number
    icon?: string
}

interface Props {
    cosmosIsConnected: boolean
    evmIsConnected: boolean
    onTokenSelected(token: CustomToken): void
    setOpen(val: boolean): void
    skipTokenSelection?: boolean
    titleNetworkStep?: string
    titleTokenStep?: string
    tokens: CustomToken[]
}

const Content = (props: Props) => {
    const uniqueTokensLength = useMemo(() => {
        return new Set(
            props.tokens.map((t) => t.symbol)
        ).size;
    }, [props.tokens]);
    const skipTokenSelection = props.skipTokenSelection && uniqueTokensLength === 1;

    const { setOpenWalletConnection } = useEscher();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [step, setStep] = useState<'token' | 'chain'>(skipTokenSelection ? 'chain' : 'token');
    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | undefined>(
        skipTokenSelection ? props.tokens.at(0)?.symbol : undefined
    );
    const [selectedTokenLogo, setSelectedTokenLogo] = useState<string | undefined>(
        skipTokenSelection ? props.tokens.at(0)?.icon : undefined
    );

    const filteredTokens = useMemo(() => props.tokens.filter(
        v => step === 'token' ?
            v.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            :
            v.chain.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
        [searchQuery, props.tokens]
    );

    const groupedTokens: GroupedTokens[] = useMemo(() => {
        const result: GroupedTokens[] = [];

        filteredTokens.filter(v => !v.isUniswap).map((t, /* _tK */) => {
            const found = result.findIndex(r => r.symbol == t.symbol);
            if (found == -1) {
                result.push({
                    symbol: t.symbol,
                    name: t.name,
                    balance: Number(t.balance?.formattedBalance ?? 0),
                    icon: t.icon
                })
            } else {
                result[found].balance = Number(result[found].balance) + Number(t.balance?.formattedBalance ?? 0);
            }
        });

        return result;
    }, [filteredTokens]);

    return (
        <div className="flex flex-col w-full p-4">
            <DialogTitle className="hidden"></DialogTitle>
            {/* header */}
            <div className="flex items-center">
                <button
                    className="text-escher-electricblue dark:text-white bg-escher-gray100 dark:bg-escher-darkblue rounded-full flex items-center justify-center w-8 h-8 hover:bg-escher-gray200"
                    onClick={() => props.setOpen(false)}
                >
                    <Icon type="FaArrowLeft" size="sm" />
                </button>
                <div className="flex-1 flex justify-center items-center text-escher-black dark:text-white">
                    {step === 'token' ?
                        <div>{props.titleTokenStep ?? 'Select a token to stake'}</div>
                        :
                        <div>{props.titleNetworkStep ?? 'Select network'}</div>
                    }
                </div>
                <div className="w-8"></div>
            </div>

            {/* search */}
            <div className="flex gap-2 mt-6">
                {(step === 'chain' && selectedTokenSymbol) &&
                    <button
                        onClick={() => setStep('token')}
                        className="flex gap-2 items-center px-2 rounded-full bg-escher-gray100 dark:bg-escher-darkblue hover:bg-escher-gray200 transition-all text-sm font-semibold dark:text-white dark:border dark:border-escher-darkblue_border"
                    >
                        {selectedTokenLogo &&
                            <Image src={selectedTokenLogo} alt="" width={20} height={20} />
                        }
                        <div>{selectedTokenSymbol}</div>
                    </button>
                }
                <div className="flex-1 relative flex justify-center items-center h-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={step === 'token' ? `Search token` : 'Search network'}
                        className="border dark:bg-escher-darkblue dark:text-white border-escher-gray200 dark:border-escher-darkblue_border rounded-full w-full p-2 py-1.5 pl-9"
                    />
                    <Icon type="FiSearch" className="text-escher-gray200 absolute left-2" size="lg" />
                </div>
            </div>

            {filteredTokens.length === 0 ?
                <div className="text-center text-sm text-escher-777e90 mt-4">
                    --No {step === 'token' ? 'token' : 'network'} found--
                </div>
                :
                <div className="max-h-[480px] overflow-y-scroll">
                    {/* content */}
                    {step === 'token' &&
                        <TokenList
                            tokens={groupedTokens}
                            uniswapTokens={filteredTokens.filter(v => v.isUniswap)}
                            onTokenGroupSelected={(props) => {
                                setSelectedTokenSymbol(props.symbol);
                                setSelectedTokenLogo(props.logoUri);
                                setStep('chain');
                                setSearchQuery('');
                            }}
                            onTokenSelected={props.onTokenSelected}
                        />
                    }
                    {step === 'chain' &&
                        <ChainList
                            tokens={filteredTokens.filter(v => !v.isUniswap)}
                            onTokenSelected={props.onTokenSelected}
                        />
                    }
                </div>
            }

            {((APP_CONFIG.enableEvm && !props.evmIsConnected) || !props.cosmosIsConnected) &&
                <>
                    <hr className="my-4" />
                    <button
                        onClick={() => {
                            props.setOpen(false);
                            setOpenWalletConnection(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-escher-E7E8FE hover:bg-escher-electricblue_light2 text-escher-electricblue dark:text-white p-2 font-semibold rounded-lg"
                    >
                        <Image alt="" src={"/icons/wallet-blue.svg"} />
                        <div className="dark:text-escher-electricblue">Add wallet</div>
                    </button>
                </>
            }
        </div>
    );
}

export default Content;
