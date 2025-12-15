"use client";

import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import { useTheme } from "@/components/providers/themeProvider";
import { APP_CONFIG } from "@/configs/app";
import { formatNumber } from "@/lib/utils";
import { LiquidStaking } from "@/types/chain";
import { useState } from "react";
import Token from "./token";

interface Props {
    liquidToken: LiquidStaking
    tvls: {
        babylon?: number
        union?: number
    }
    aprs: {
        babylon?: number;
        union?: number;
    }
    rate: {
        babylon?: string;
        union?: string;
    }
    setLiquidToken(liquidStaking: LiquidStaking): void
}

const LiquidToken = (props: Props) => {
    const { themeIsDark } = useTheme();
    const [showDetails, setShowDetails] = useState(false);

    return (
        <Card className="dark:bg-escher-dark_0c203d">
            <div className="flex justify-between items-center">
                <div
                    className="text-escher-gray500 dark:text-white text-sm"
                    onClick={() => console.log({ props })}
                >Select a liquid staking token</div>
                <button
                    onClick={() => {
                        setShowDetails(prev => !prev);
                    }}
                    className="flex items-center text-escher-electricblue dark:text-white font-semibold text-xs gap-1"
                >
                    <div>Show Details</div>
                    <Icon type="FaChevronDown" size="sm" />
                </button>
            </div>
            <div className="flex gap-6 mt-4">
                {!APP_CONFIG.networkIsTestnet &&
                    <Token
                        symbol={"eBABY"}
                        name={"Babylon"}
                        logo={"/images/token/e-babylon.svg"}
                        enabled={true}
                        active={props.liquidToken === "babylon"}
                        details={{
                            apr: props.aprs.babylon ? `${props.aprs.babylon?.toFixed(2)}%` : "-",
                            tvl: props.tvls.babylon ? `${formatNumber(props.tvls.babylon)}` : "-",
                            ratio: `1:${parseFloat(Number(props.rate.babylon).toFixed(4)).toString()}`
                        }}
                        showDetails={showDetails}
                        onClick={() => props.setLiquidToken("babylon")}
                        themeIsDark={themeIsDark}
                    />
                }
                <Token
                    symbol={"eU"}
                    name={"Union"}
                    logo={"/images/token/e-union.svg"}
                    enabled={true}
                    active={props.liquidToken === "union"}
                    details={{
                        apr: props.aprs.union ? `${props.aprs.union?.toFixed(2)}%` : "-",
                        tvl: props.tvls.union ? `${formatNumber(props.tvls.union)}` : "-",
                        ratio: `1:${formatNumber(Number(props.rate.union), false, 4)}`
                    }}
                    showDetails={showDetails}
                    onClick={() => props.setLiquidToken("union")}
                    themeIsDark={themeIsDark}
                />
            </div>
        </Card>
    );
}

export default LiquidToken;