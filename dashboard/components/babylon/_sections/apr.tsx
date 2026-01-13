import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { Liquidity, Validator } from "@/types/types";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

interface Props {
    validators?: Validator[]
    rest: string
    liquidity?: Liquidity
}

const Apr = (props: Props) => {

    const getData = useCallback(async () => {
        if (!props.validators || props.validators.length === 0 || !props.liquidity) return undefined;

        let c = 0;
        let totalWeight = props.validators.reduce((sum, v) => sum + v.weight, 0);
        props.validators.map(v => {
            c += (v.commission * v.weight);
        });
        c /= totalWeight;

        // Annual infation rate
        const queryInflation = await fetch(`${props.rest}/cosmos/mint/v1beta1/inflation_rate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const inflation = Number((await queryInflation.json()).inflation_rate) / 2; // half to bitocin, and baby staker

        // total supply of all BABY
        const querySupply = await fetch(`${props.rest}/cosmos/bank/v1beta1/supply`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const totalSupply = (await querySupply.json()).supply.find((v: any) => v.denom === "ubbn").amount ?? "0";

        // tokens for ratio 
        const response = await fetch(`${props.rest}/cosmos/staking/v1beta1/pool`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const tokenomics = (await response.json()).pool;
        const ratio = Number(tokenomics.bonded_tokens) / Number(totalSupply);

        // total supply
        const queryInjection = await fetch(`/api/injection`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resultInjection = await queryInjection.json() as { amount: string }[];

        // injection

        const stakedBaby = formatDecimal(Number(props.liquidity.amount), -6); // 18,690,499 -> change to staked amount of BABY
        const injectionTable = formatDecimal(resultInjection.reduce((sum, cur) => sum += Number(cur.amount), 0), -6);
        const injection = injectionTable / stakedBaby; // 0.000053503117753565944
        console.log({
            totalSupply,
            bonded: tokenomics.bonded_tokens,
            ratio,
            stakedBaby,
            injectionTable,
            injection,
            validators: props.validators,
            totalWeight,
            c,
        });

        console.log({
            inflation,
            infalraio: (inflation / ratio)
        });


        //APR
        // const apr = ((inflation / ratio) * (1 - c) * 0.9) + injection;
        const apr = ((inflation / ratio) * (1 - c)) + injection;

        /*
            "totalWeight": 100,
            "c": 0.07400000000000001,
            "inflation": 0.04,
            "totalSupply": "10199548513330106",
            "bonded": "1956058332029235",
            "ratio": 0.19177891349531812,
            "stakedBaby": 55366201.345605,
            "injectionTable": 1000,
            "injection": 0.000018061560585633,
        */

        return apr;
    }, [props.validators, props.liquidity]);

    const queryData = useQuery({
        queryKey: ["apr", JSON.stringify(props.validators), JSON.stringify(props.liquidity)],
        queryFn: getData,
        refetchInterval: APP_CONFIG.aprInterfal,
        staleTime: APP_CONFIG.aprInterfal,
        enabled: !!props.validators && !!props.liquidity
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-amber-900 text-amber-50 rounded py-8" onClick={() => console.log({ props })}>
            <div className="flex-1">
                {queryData.data ?
                    <div className="text-xl md:text-5xl font-bold">{`${formatNumber(queryData.data * 100)}%`}</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80" onClick={() => queryData.refetch()}>APR</div>
        </div>
    );
}

export default Apr;