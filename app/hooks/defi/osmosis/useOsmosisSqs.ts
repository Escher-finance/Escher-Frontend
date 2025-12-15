import { formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Params {
    tokenIn: CustomToken
    tokenOut: CustomToken
    amount: string
    poolID: string
}

interface ResponseSqs {
    "amount_in": {
        "denom": string,
        "amount": string
    },
    "amount_out": string,
    "route": [
        {
            "pools": [
                {
                    "id": number,
                    "type": number,
                    "balances": number,
                    "spread_factor": string,
                    "token_out_denom": string,
                    "taker_fee": string,
                    "liquidity_cap": string
                }
            ],
            "has-cw-pool": boolean,
            "out_amount": string,
            "in_amount": string
        }
    ],
    "tokens": [
        {
            "denom": string,
            "liquidity_cap": string
        },
        {
            "denom": string,
            "liquidity_cap": string
        }
    ],
    "liquidity_cap": string,
    "liquidity_cap_overflow": boolean,
    "effective_fee": string,
    "price_impact": string,
    "in_base_out_quote_spot_price": string
}

export const useOsmosisSqsDirect = (params: Params) => {
    const [debouncedParams, setDebouncedParams] = useState<Params>(params);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedParams(params);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [params.tokenIn.denom, params.tokenOut.denom, params.amount, params.poolID, params]);

    const getRoute = async () => {
        let baseUrl = "https://sqs.osmosis.zone/router/custom-direct-quote";
        baseUrl += `?tokenIn=${formatDecimal(Number(debouncedParams.amount), debouncedParams.tokenIn.decimals)}${encodeURI(debouncedParams.tokenIn.denom ?? "")}`;
        baseUrl += `&tokenOutDenom=${encodeURI(debouncedParams.tokenOut.denom ?? "")}`;
        baseUrl += `&poolID=${debouncedParams.poolID}`;
        baseUrl += `&humanDenoms=false`;

        console.log("Fetching osmosis SQS", baseUrl);

        const response = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const route = (await response.json()) as ResponseSqs;
        return {
            route,
            amount_out_formatted: formatDecimal(Number(route.amount_out), -debouncedParams.tokenOut.decimals)
        }
    }

    return useQuery({
        queryKey: ["osmosis-sqs", "direct", debouncedParams.tokenIn.denom, debouncedParams.tokenOut.denom, debouncedParams.amount, debouncedParams.poolID],
        queryFn: getRoute,
        enabled: debouncedParams.amount !== "" &&
            Number(debouncedParams.amount) > 0 &&
            !!debouncedParams.tokenIn.denom &&
            !!debouncedParams.tokenOut.denom
    });
}