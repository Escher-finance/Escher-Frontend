import { useEscher } from "@/components/providers/escherProvider";
import { DEFIS } from "@/lib/defi";
import { formatDecimal, getUniTokenFromEscherToken } from "@/lib/utils";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/resources/non-fungible-position-manager";
import { Defi, DefiPool } from "@/types/defi";
import {
    UniswapPool,
    UniswapPoolParams,
    UniswapPosition,
    UniswapPositionParams,
} from "@/types/defiUniswap";
import { useQuery } from "@tanstack/react-query";
import {
    CurrencyAmount,
    Fraction,
    Percent,
    Price,
    Token,
} from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import {
    FeeAmount,
    nearestUsableTick,
    Pool,
    Position,
    priceToClosestTick,
    TickMath,
} from "@uniswap/v3-sdk";
import { useEffect, useMemo, useState } from "react";
import { Address, erc20Abi, getContract, PublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { UniswapV3AprResponse, useUniswapApr } from "./useUniswapApr";

export const nonfungiblePositionManagerContractAddress =
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

export const getUniswapPosition = async (
    params: UniswapPositionParams,
): Promise<UniswapPosition | undefined> => {
    if (!params.publicClient || !params.address) {
        return;
    }
    const nfpmContract = getContract({
        address: nonfungiblePositionManagerContractAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        client: params.publicClient,
    });
    const positionCount = await nfpmContract.read.balanceOf([params.address]);
    const positionIdCalls = [];
    for (let i = BigInt(0); i < positionCount; i++) {
        positionIdCalls.push(
            nfpmContract.read.tokenOfOwnerByIndex([params.address, i]),
        );
    }
    const positionIds = await Promise.all(positionIdCalls);

    const positionCalls = [];
    for (const id of positionIds) {
        positionCalls.push(nfpmContract.read.positions([id]));
    }
    const callResponses = await Promise.all(positionCalls);
    let positionInfo: UniswapPosition | undefined;
    for (let i = 0; i < callResponses.length; i++) {
        const position = callResponses[i];
        const tokenId = positionIds[i];

        const tickLower = position[5];
        const tickUpper = position[6];
        const liquidity = position[7];
        const token0 = position[2];
        const token1 = position[3];
        const fee = position[4];

        if (
            params.pool === undefined ||
            params.pool.token0.address.toLowerCase() !== token0.toLowerCase() ||
            params.pool.token1.address.toLowerCase() !== token1.toLowerCase() ||
            params.pool.fee !== fee
        ) {
            continue;
        }

        const isInRange =
            tickLower <= params.pool.tickCurrent &&
            params.pool.tickCurrent < tickUpper;

        const p = new Position({
            pool: params.pool,
            liquidity: liquidity.toString(),
            tickLower,
            tickUpper,
        });

        const amount0 = BigInt(p.amount0.numerator.toString());
        const amount1 = BigInt(p.amount1.numerator.toString());

        if (!positionInfo || positionInfo.tokenId < tokenId) {
            positionInfo = {
                tokenId,
                amount0,
                amount1,
                token0,
                token1,
                fee,
                tickLower,
                tickUpper,
                liquidity,
                feeGrowthInside0LastX128: position[8],
                feeGrowthInside1LastX128: position[9],
                tokensOwed0: position[10],
                tokensOwed1: position[11],
                isInRange,
            };
        }
    }

    return positionInfo;
};

export const UNISWAP_POOLS: UniswapPool[] = [
    {
        chainId: sepolia.id,
        address: "0x6418EEC70f50913ff0d756B48d32Ce7C02b47C47",
        fee: FeeAmount.HIGH,
        token0Id: `${sepolia.id}_0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`, // sepolia USDC
        token1Id: `${sepolia.id}_0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`, // sepolia WETH
    },
    {
        chainId: mainnet.id,
        address: "0xb759f938814C8B7a24344d75fa3FA4add89bDad2",
        fee: FeeAmount.LOW,
        token0Id: `${mainnet.id}_0x70dF20655b3e294facB436383435754dbee3CD70`,
        token1Id: `${mainnet.id}_0xe53dCec07d16D88e386AE0710E86d9a400f83c31`,
    },
    {
        chainId: mainnet.id,
        address: "0xd4C29179Bcf2A835d404DABBbE71880010E50Ce0",
        fee: FeeAmount.MEDIUM,
        token0Id: `${mainnet.id}_0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`,
        token1Id: `${mainnet.id}_0xe53dCec07d16D88e386AE0710E86d9a400f83c31`,
    },
];

export const getUniswapPool = async (params: UniswapPoolParams) => {
    if (!params.publicClient || !params.pool || !params.pool.fee) {
        console.error({
            publicClient: params.publicClient,
            pool: params.pool,
        });

        return;
    }

    const tokenA = getUniTokenFromEscherToken(params.pool.tokenA);
    const tokenB = getUniTokenFromEscherToken(params.pool.tokenB);

    const [liquidityResp, slot0Resp, tokenABalance, tokenBBalance] =
        await params.publicClient.multicall({
            contracts: [
                {
                    address: params.pool.poolAddress as `0x${string}`,
                    abi: IUniswapV3PoolABI.abi,
                    functionName: "liquidity",
                },
                {
                    address: params.pool.poolAddress as `0x${string}`,
                    abi: IUniswapV3PoolABI.abi,
                    functionName: "slot0",
                },
                {
                    address: params.pool.tokenA
                        .contractAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "balanceOf",
                    args: [params.pool.poolAddress as `0x${string}`],
                },
                {
                    address: params.pool.tokenB
                        .contractAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "balanceOf",
                    args: [params.pool.poolAddress as `0x${string}`],
                },
            ],
        });

    const slot0Result = slot0Resp.result as (string | number | bigint)[];

    const liquidity = liquidityResp.result as bigint;
    const sqrtPriceX96 = slot0Result[0] as bigint;
    const tick = slot0Result[1] as number;

    const configuredPool = new Pool(
        tokenA,
        tokenB,
        params.pool.fee,
        sqrtPriceX96.toString(),
        liquidity.toString(),
        tick,
    );

    // https://ethereum.stackexchange.com/questions/161745/how-to-calculate-sqrtpricex96-for-uniswap-pool-creation
    const decimalAdjustment = 10 ** (tokenA.decimals - tokenB.decimals);
    const ratio =
        1 / ((Number(sqrtPriceX96) ** 2 / 2 ** 192) * decimalAdjustment);

    return {
        pool: configuredPool,
        tick: tick,
        ratio,
        balances: {
            tokenA: tokenABalance.result,
            tokenB: tokenBBalance.result,
        },
    };
};

export interface UniswapPoolResult {
    apr: UniswapV3AprResponse | undefined
    defiPool: DefiPool
    pool: Pool | undefined
    tick: number | undefined
    ratio: number | undefined
    balances: {
        tokenA: bigint | undefined
        tokenB: bigint | undefined
    }
    position: UniswapPosition | undefined
    isFetched: boolean
}

export const useUniswapPool = (
    params: UniswapPoolParams,
): UniswapPoolResult => {
    const { tokens } = useEscher();
    const [position, setPosition] = useState<UniswapPosition>();
    const [isFetched, setIsFetched] = useState(false);

    const queryPool = useQuery({
        queryKey: ["uniswapPool", params.pool?.poolAddress, params.pool?.fee],
        queryFn: () => getUniswapPool(params),
        enabled: !!params.publicClient && !!params.pool,
    });

    const queryApr = useUniswapApr({
        pool: params.pool,
        publicClient: params.publicClient
    });

    useEffect(() => {
        (async () => {
            const res = await getUniswapPosition({
                publicClient: params.publicClient,
                address: params.address,
                pool: queryPool.data?.pool,
                poolAddress: params.pool.poolAddress as Address,
            });
            setPosition(res);
            setIsFetched(true);
        })();
    }, [queryPool.data?.pool, params.address, params.publicClient, params.pool.poolAddress]);

    const positionUpdated = useMemo((): UniswapPosition | undefined => {
        if (!position) return undefined;

        const tokenA = tokens.find(
            (t) => t.contractAddress?.toLowerCase() === position.token0.toLowerCase(),
        );
        const tokenB = tokens.find(
            (t) => t.contractAddress?.toLowerCase() === position.token1.toLowerCase(),
        );
        return {
            ...position,
            tokenA: tokenA,
            tokenB: tokenB,
            totalValue:
                tokenA?.coingeckoPrice &&
                tokenA.decimals &&
                tokenB?.coingeckoPrice &&
                tokenB.decimals &&
                formatDecimal(Number(position.amount0), -tokenA.decimals) *
                tokenA.coingeckoPrice +
                formatDecimal(Number(position.amount1), -tokenB.decimals) *
                tokenB.coingeckoPrice,
            totalRewardsValue:
                tokenA?.coingeckoPrice &&
                tokenA.decimals &&
                tokenB?.coingeckoPrice &&
                tokenB.decimals &&
                formatDecimal(Number(position.tokensOwed0), -tokenA.decimals) *
                tokenA.coingeckoPrice +
                formatDecimal(
                    Number(position.tokensOwed1),
                    -tokenB.decimals,
                ) *
                tokenB.coingeckoPrice,
        };
    }, [position, tokens]);

    const balances = useMemo(() => ({
        tokenA: queryPool.data?.balances.tokenA,
        tokenB: queryPool.data?.balances.tokenB
    }), [queryPool.data?.balances]);

    return {
        apr: queryApr.data,
        defiPool: params.pool,
        pool: queryPool.data?.pool,
        tick: queryPool.data?.tick,
        ratio: queryPool.data?.ratio,
        balances: balances,
        position: positionUpdated,
        isFetched: isFetched,
    };
};

const useUniswapMultiPools = (
    pools: DefiPool[],
    address?: Address,
    publicClient?: PublicClient,
): UniswapPoolResult[] => {
    return pools.map((pool) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useUniswapPool({
            address: address,
            pool,
            publicClient,
        }),
    );
};

export interface DefiUniswapQuery {
    info: Defi;
    pools: UniswapPoolResult[];
    isUserDataFetched: boolean;
}
export const useUniswapDefi = (): DefiUniswapQuery => {
    const { account } = useEscher();
    const publicClient = usePublicClient();

    const poolQueries = useUniswapMultiPools(
        DEFIS.uniswap.pools,
        account.evm?.address as Address | undefined,
        publicClient,
    );

    const info = useMemo(
        () => ({
            ...DEFIS.uniswap,
            tvl: poolQueries.reduce(
                (sum, pool) => (sum += pool.apr?.calculationInputs.tvlUsd ?? 0),
                0,
            ),
            position: poolQueries.reduce(
                (sum, p) => sum + (p.position?.totalValue ?? 0),
                0,
            ),
        }),
        [poolQueries],
    );

    const isUserDataFetched = useMemo(
        () => poolQueries.every((pool) => pool.isFetched),
        [poolQueries],
    );

    return {
        info: info,
        pools: poolQueries,
        isUserDataFetched,
    };
};

export function constructPositionFullRange(
    token0Amount: CurrencyAmount<Token>,
    token1Amount: CurrencyAmount<Token>,
    poolInfo: Pool,
): Position {
    return Position.fromAmounts({
        pool: poolInfo,
        tickLower: nearestUsableTick(TickMath.MIN_TICK, poolInfo.tickSpacing),
        tickUpper: nearestUsableTick(TickMath.MAX_TICK, poolInfo.tickSpacing),
        amount0: token0Amount.quotient,
        amount1: token1Amount.quotient,
        useFullPrecision: true,
    });
}

export function constructPositionCustomRange(
    token0Amount: CurrencyAmount<Token>,
    token1Amount: CurrencyAmount<Token>,
    poolInfo: Pool,
    range: Percent,
): Position {
    const currentPrice = poolInfo.token0Price;
    const one = new Fraction(1, 1);
    const priceLowerFraction = currentPrice.asFraction.multiply(
        one.subtract(range),
    );
    const priceUpperFraction = currentPrice.asFraction.multiply(one.add(range));
    const priceLower = new Price(
        currentPrice.baseCurrency,
        currentPrice.quoteCurrency,
        priceLowerFraction.denominator,
        priceLowerFraction.numerator,
    );
    const priceUpper = new Price(
        currentPrice.baseCurrency,
        currentPrice.quoteCurrency,
        priceUpperFraction.denominator,
        priceUpperFraction.numerator,
    );
    return Position.fromAmounts({
        pool: poolInfo,
        tickLower: nearestUsableTick(
            priceToClosestTick(priceLower),
            poolInfo.tickSpacing,
        ),
        tickUpper: nearestUsableTick(
            priceToClosestTick(priceUpper),
            poolInfo.tickSpacing,
        ),
        amount0: token0Amount.quotient,
        amount1: token1Amount.quotient,
        useFullPrecision: true,
    });
}
