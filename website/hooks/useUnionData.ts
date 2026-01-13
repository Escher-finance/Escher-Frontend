import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import BigNumber from 'bignumber.js';

const getUnionData = async () => {

    const { inflationData, stakingData, supplyData, validators, tvl, ratio, eUPrice } = await fetchData();

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
    const stakingRatio = BigNumber(bonded_tokens).dividedBy(BigNumber(total_supply)).toNumber();
    const apr = ((inflation / stakingRatio) * (1 - c)) + injection;

    return {
        apr: `${(apr * 100).toFixed(2)}%`,
        inflation: `${formatNumber(Number(inflation) * 100)}%`,
        tvl: `$${formatNumber(tvl)}`,
        ratio,
        price: `$${formatNumber(eUPrice.toNumber())}`,
    }
}

export const useUnionData = () => {
    return useQuery({
        queryKey: ["dataUnion"],
        queryFn: getUnionData
    });
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
        stakingRes, inflationRes, supplyRes, delegationsRes, coingeckoRes, rateRes
    ] = await Promise.all([
        fetch(`${lcd}/cosmos/staking/v1beta1/pool`),
        fetch(`${lcd}/cosmos/mint/v1beta1/inflation`),
        fetch(`${lcd}/cosmos/bank/v1beta1/supply`),
        fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`),
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=union-2&vs_currencies=usd`),
        fetch(`/api/union`),
    ]);

    const stakingData = await stakingRes.json();
    const inflationData = await inflationRes.json();
    const supplyData = await supplyRes.json();
    const coingeckoData = await coingeckoRes.json();
    const rateData = await rateRes.json();
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

    const unionPrice = BigNumber(coingeckoData["union-2"]?.usd ?? 0);
    const eUPrice = unionPrice.times(BigNumber(rateData?.contractData?.data?.redemption_rate ?? 0));

    let tvl = BigNumber(0);
    delegations.map((d: { balance: { amount: BigNumber.Value; }; }) => {
        tvl = BigNumber(tvl).plus(BigNumber(d?.balance?.amount))
    })
    tvl = tvl
        .shiftedBy(-18)
        .times(unionPrice);

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
        tvl: tvl.toNumber(),
        ratio: `1 eU = ${Number(rateData?.contractData?.data?.redemption_rate).toFixed(4)} U`,
        eUPrice
    }
}