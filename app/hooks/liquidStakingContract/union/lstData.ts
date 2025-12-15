import { safeJson } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const lcd = 'https://rest.union.build';
const delegator = 'union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v';

export const useUnionLstData = () => {
    const queryApr = useQuery({
        queryKey: ["lst", "union", "apr"],
        queryFn: getApr
    });

    const queryTvl = useQuery({
        queryKey: ["lst", "union", "tvl"],
        queryFn: getTvl
    });

    const data = useMemo(() => ({
        apr: queryApr.data?.apr,
        inflation: queryApr.data?.inflation,
        tvl: queryTvl.data?.tvlUsd
    }), [queryApr.data, queryTvl.data]);

    return data;
}

async function getApr() {
    // Fetch network data in parallel
    const [stakingResponse, inflationResponse, supplyResponse] = await Promise.all([
        fetch(`${lcd}/cosmos/staking/v1beta1/pool`),
        fetch(`${lcd}/cosmos/mint/v1beta1/inflation`),
        fetch(`${lcd}/cosmos/bank/v1beta1/supply`)
    ]);

    if (!stakingResponse.ok) {
        const err = await safeJson(stakingResponse);
        throw ({ error: 'staking_pool_failed', detail: err });
    }
    if (!inflationResponse.ok) {
        const err = await safeJson(inflationResponse);
        throw ({ error: 'inflation_failed', detail: err });
    }
    if (!supplyResponse.ok) {
        const err = await safeJson(supplyResponse);
        throw ({ error: 'supply_failed', detail: err });
    }

    const stakingData = await stakingResponse.json() as { pool?: { bonded_tokens?: string } };
    const inflationData = await inflationResponse.json() as { inflation?: string };
    const supplyData = await supplyResponse.json() as { supply?: Array<{ denom?: string; amount?: string }> };

    const bondedTokens = Number(stakingData?.pool?.bonded_tokens || 0);
    const totalSupply = Number((supplyData?.supply || [])[0]?.amount || 0);
    const inflation = Number(inflationData?.inflation || 0);

    const ratio = totalSupply > 0 ? (bondedTokens / totalSupply) : 0;

    // Commission-weighted adjustment using provided validator set (weights sum to 1)
    // L5 12% 5%, Crypto crew 2% 5%, Block hunters 12% 5%, 01 node 14% 5%, Range 10% 5%, Cosmos spaces 25% 5%, Defi Dojo 25% 10%
    const validatorWeights: Array<{ weight: number; commission: number }> = [
        { weight: 0.12, commission: 0.05 },
        { weight: 0.02, commission: 0.05 },
        { weight: 0.12, commission: 0.05 },
        { weight: 0.14, commission: 0.05 },
        { weight: 0.10, commission: 0.05 },
        { weight: 0.25, commission: 0.05 },
        { weight: 0.25, commission: 0.10 },
    ];
    const c = validatorWeights.reduce((sum, v) => sum + (v.weight * v.commission), 0);

    // Final APR per spec: APR * 0.9 * (1 - c), where base APR = inflation / ratio
    const aprBase = ratio > 0 ? (inflation / ratio) : 0;
    const apr = aprBase * 0.9 * (1 - c);

    return { apr, inflation };
}

async function getTvl() {
    const res = await fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`);
    if (!res.ok) {
        const detail = await safeJson(res);
        throw ({ error: 'delegations_failed', detail });
    }
    const json = await res.json() as { delegation_responses?: Array<{ balance?: { amount?: string } }> };
    const delegations = Array.isArray(json?.delegation_responses) ? json.delegation_responses : [];

    let tvlAtomic = 0; // 18-decimal atomic units
    for (const d of delegations) {
        tvlAtomic += Number(d?.balance?.amount || 0);
    }

    // Convert 18-decimal to whole token amount
    const tvlToken = tvlAtomic / 10 ** 18;

    // Fetch USD price from CoinGecko using id 'union-2' (public first, then Pro if available)
    let tvlUsd: number | undefined = undefined;
    const cgId = 'union-2';
    // Public first (no key)
    try {
        const pubRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cgId)}&vs_currencies=usd&precision=full`);
        if (pubRes.ok) {
            const priceJson = await pubRes.json() as { [k: string]: { usd?: number } };
            const price = priceJson?.[cgId]?.usd;
            if (typeof price === 'number' && Number.isFinite(price)) {
                tvlUsd = tvlToken * price;
            }
        }
    } catch { /* empty */ }

    // If still undefined, try Pro with key if present
    if (tvlUsd === undefined && process.env.COINGECKO_API_KEY) {
        try {
            const proRes = await fetch(`https://pro-api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cgId)}&vs_currencies=usd&precision=full`, {
                headers: { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY }
            });
            if (proRes.ok) {
                const priceJson = await proRes.json() as { [k: string]: { usd?: number } };
                const price = priceJson?.[cgId]?.usd;
                if (typeof price === 'number' && Number.isFinite(price)) {
                    tvlUsd = tvlToken * price;
                }
            }
        } catch { /* empty */ }
    }

    return { tvlToken, tvlUsd };
}

/* bak apr
const getUnionApr = async () => {

    const { inflationData, stakingData, supplyData, validators, tvlToken } = await fetchData();

    // APR
    let inflation = inflationData.inflation;
    const bonded_tokens = stakingData.pool?.bonded_tokens;
    const total_supply = supplyData.supply?.[0]?.amount;
    const injection = 0;
    let c = 0;

    // c calculation
    validators.map((v: { commissionRate: string, rate: string }) => {
        // commissionRate : validator's commission rate
        // rate : validator's delegated amount / total bonded
        c += (Number(v.commissionRate) * Number(v.rate));
    });

    inflation = Number(inflation);
    const ratio = BigNumber(bonded_tokens).dividedBy(BigNumber(total_supply)).toNumber();
    const apr = ((inflation / ratio) * (1 - c)) + injection;

    return { apr, inflation, ratio, c, injection, tvlToken }
}

const fetchData = async () => {

    const lcdUrls = {
        mainnet: 'https://rest.union.build',
        testnet: 'https://rest.rpc-node.union-testnet-10.union.build',
    }
    const lcd = lcdUrls.mainnet;
    const delegator = "union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v";

    // Fetch data ====================================================================================
    const [
        stakingResponse, inflationResponse, supplyResponse, delegationsRes
    ] = await Promise.all([
        fetch(`${lcd}/cosmos/staking/v1beta1/pool`),
        fetch(`${lcd}/cosmos/mint/v1beta1/inflation`),
        fetch(`${lcd}/cosmos/bank/v1beta1/supply`),
        fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`),
    ]);

    const stakingData = await stakingResponse.json();
    const inflationData = await inflationResponse.json();
    const supplyData = await supplyResponse.json();

    const delegationsJson = await delegationsRes.json();
    //================================================================================================

    const delegations = Array.isArray(delegationsJson?.delegation_responses) ? delegationsJson.delegation_responses : [];
    const bondedTokens = delegations.reduce((sum: bigint, d: { balance: { amount: string } }) => {
        const v = BigInt(d?.balance?.amount || BigInt(0));
        return sum + v;
    }, BigInt(0));


    const validators = delegations.map((d: { delegation: { validator_address: string; }; balance: { amount: BigNumber.Value; }; }) => ({
        address: d?.delegation?.validator_address,
        balance: d?.balance,
        rate: d?.balance?.amount ? (BigNumber(d?.balance?.amount).dividedBy(BigNumber(bondedTokens))).toString() : "0",
        commissionRate: "0"
    })).filter(Boolean);

    let tvlToken = "0";
    delegations.map((d: { balance: { amount: BigNumber.Value; }; }) => {
        tvlToken = BigNumber(tvlToken).plus(BigNumber(d?.balance?.amount)).toString()
    })
    tvlToken = BigNumber(tvlToken).shiftedBy(-18).toString();

    console.log({ validators, delegations, tvlToken });

    await Promise.all(
        validators.map(async (validator: { address: string; commissionRate: string; }) => {
            const queryValidator = await fetch(`${lcd}/cosmos/staking/v1beta1/validators/${validator.address}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const validatorResponse = await queryValidator.json();
            validator.commissionRate = Number(validatorResponse?.validator?.commission?.commission_rates?.rate).toString();
        })
    );

    return {
        inflationData,
        stakingData,
        supplyData,
        validators,
        tvlToken
    }
}
     */