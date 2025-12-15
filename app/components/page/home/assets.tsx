import Card from "@/components/global/card";
import { EscherDefi } from "@/hooks/defi/useDefi";
import { CustomToken } from "@/types/chain";
import AssetsDefi from "./assets/defi";
import AssetsLiquid from "./assets/liquid";
import { useUnionLstData } from "@/hooks/liquidStakingContract/union/lstData";
import { APP_CONFIG } from "@/configs/app";

export interface GroupedTokens {
    balance: number
    balanceDollar?: number
    icon?: string
    name: string
    rate?: number
    symbol: string
    tokens?: CustomToken[]
    tvl?: number
    type: 'liquid' | 'native'
}

interface Props {
    defis: EscherDefi
    isCosmosConnected: boolean
    isEvmConnected: boolean
    rates: {
        babylon: number | undefined
        union: number | undefined
    }
    setTab(value: 'liquid' | 'defi'): void
    tab: 'liquid' | 'defi'
    tokens: CustomToken[]
}

const Assets = (props: Props) => {
    const queryUnionLstData = useUnionLstData();

    return (
        <Card className="flex-1 p-0">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="font-semibold text-escher-gray600 dark:text-white">Your Positions</div>
                <div className="self-start flex gap-2 rounded-lg font-semibold text-sm bg-escher-f5f6f8 dark:bg-escher-darkblue text-escher-777e90 p-1">
                    <button
                        onClick={() => props.setTab('liquid')}
                        className={`px-4 py-2 hover:bg-escher-electricblue_light9 dark:hover:bg-escher-283954 transition-all rounded ${props.tab === 'liquid' && 'text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-283954'}`}
                    >
                        Liquid Staking
                    </button>
                    {!APP_CONFIG.networkIsTestnet &&
                        <button
                            onClick={() => props.setTab('defi')}
                            className={`px-4 py-2 hover:bg-escher-electricblue_light9 dark:hover:bg-escher-283954 transition-all rounded ${props.tab === 'defi' && 'text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-283954'}`}
                        >
                            DeFi Positions
                        </button>
                    }
                </div>
            </div>

            {props.tab === 'liquid' &&
                <AssetsLiquid
                    tokens={props.tokens}
                    rates={props.rates}
                    unionTvl={queryUnionLstData.tvl}
                />
            }

            {props.tab === 'defi' && !APP_CONFIG.networkIsTestnet &&
                <AssetsDefi
                    defis={props.defis}
                    isCosmosConnected={props.isCosmosConnected}
                    isEvmConnected={props.isEvmConnected}
                />
            }
        </Card>
    );
}

export default Assets;