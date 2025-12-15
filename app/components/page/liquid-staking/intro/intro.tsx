import { EscherTokens } from "@/components/providers/escherProvider"
import { useTheme } from "@/components/providers/themeProvider"
import { APP_CONFIG } from "@/configs/app"
import { formatNumber } from "@/lib/utils"
import { Liquidity, LiquidStaking } from "@/types/chain"
import React from "react"
import { LiquidCard } from "./liquid-card"

interface Props {
    formTokens: EscherTokens
    inflationDatas: {
        babylon?: number
        union?: number
    }
    liquidities: {
        babylon?: Liquidity
        union?: Liquidity
    }
    tvlDatas: {
        babylon?: number
        union?: number
    }
    aprs: {
        babylon?: number
        union?: number
    }
    tradeDatas: {
        babylon?: { logo: string, amount: number }[]
    }

    onNext(liquidStaking: LiquidStaking): void
}


const Intro = (props: Props) => {
    const { themeIsDark } = useTheme();

    return (
        <div className="w-full flex flex-col items-center py-8 gap-6">
            {!APP_CONFIG.networkIsTestnet &&
                <LiquidCard
                    onNext={() => {
                        props.onNext("babylon");
                    }}
                    tokenImage="/images/token/e-babylon.svg"
                    tokenImageDark="/images/token/e-babylon.svg"
                    symbol="eBABY"
                    chain="Babylon"
                    enabled={true}
                    detail={{
                        apr: props.aprs.babylon,
                        tvl: props.tvlDatas.babylon,
                        ratio: props.liquidities.babylon?.exchange_rate && `1 eBABY = ${parseFloat(Number(props.liquidities.babylon?.exchange_rate).toFixed(4)).toString()} BABY`,
                        price: props.formTokens.babylon.ebaby?.coingeckoPrice ? formatNumber(props.formTokens.babylon.ebaby?.coingeckoPrice) : undefined,
                        inflation: props.inflationDatas.babylon ? `${formatNumber(props.inflationDatas.babylon * 100)}%` : undefined,
                        tradeDatas: props.tradeDatas.babylon
                    }}
                    tooltip={{
                        title1: "eBABY: The Liquid Staking Token of Babylon",
                        subtitle1: "Powering Bitcoin-secured staking for a decentralized future.",
                        title2: "What is Babylon?",
                        subtitle2: "A pioneering Bitcoin staking protocol that unlocks BTC's security for Proof-of-Stake chains, enabling trustless restaking, DeFi, and cross-chain interoperability—without compromising decentralization.",
                        link1Text: "babylonlabs.io",
                        link1Url: "https://babylonlabs.io/",
                        link2Text: "docs.babylonlabs.io",
                        link2Url: "https://docs.babylonlabs.io/",
                    }}
                    themeIsDark={themeIsDark}
                />
            }
            <LiquidCard
                onNext={() => {
                    props.onNext("union");
                }}
                tokenImage="/images/token/e-union.svg"
                tokenImageDark="/images/token/e-union.svg"
                symbol="eU"
                chain="Union"
                enabled={true}
                detail={{
                    apr: props.aprs.union,
                    tvl: props.tvlDatas.union,
                    inflation: props.inflationDatas.union ? `${formatNumber(props.inflationDatas.union * 100)}%` : undefined,
                    price: props.formTokens.evm.eU?.coingeckoPrice ? formatNumber(props.formTokens.evm.eU?.coingeckoPrice) : undefined,
                    ratio: props.liquidities.union?.exchange_rate && `1 eU = ${formatNumber(props.liquidities.union?.exchange_rate, false, 4)} U`,
                }}
                tooltip={{
                    title1: "eU: The Liquid Staking Token of U",
                    subtitle1: "Powering Union's hyper-efficient, zero-knowledge infrastructure for seamless interoperability.",
                    title2: "What is Union?",
                    subtitle2: "A next-gen zero-knowledge network enabling seamless cross-chain transfers, DeFi, and NFTs—secured by cryptographic consensus. No trusted third parties. Just pure decentralization",
                    link1Text: "union.build",
                    link1Url: "https://union.build/",
                    link2Text: "docs.union.build",
                    link2Url: "https://docs.union.build/",
                }}
                themeIsDark={themeIsDark}
            />
        </div >
    );
}

export default Intro;