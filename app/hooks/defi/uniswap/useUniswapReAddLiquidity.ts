import { useUniswapAddLiquidity } from "@/hooks/defi/uniswap/useUniswapAddLiquidity";
import {
    UNISWAP_V3_REMOVE_SLIPPAGE,
    useUniswapRemoveLiquidity,
} from "@/hooks/defi/uniswap/useUniswapRemoveLiquidity";
import { sleep } from "@/lib";
import { DefiPool } from "@/types/defi";
import { UniswapPosition } from "@/types/defiUniswap";
import { Percent } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import { formatUnits, PublicClient, WalletClient } from "viem";

interface UniswapReAddLiquidityParams {
    publicClient: PublicClient;
    walletClient: WalletClient;
    pool: DefiPool;
    uniswapPool: Pool;
    position: UniswapPosition;
}

export const useUniswapReAddLiquidity = () => {
    const {
        mintPosition,
        statusPrepare: statusMintPrepare,
        statusApproval0: statusMintApproval0,
        statusApproval1: statusMintApproval1,
        statusOperation: statusMintOperation,
    } = useUniswapAddLiquidity();
    const {
        removePosition,
        statusPrepare: statusRemovePrepare,
        statusOperation: statusRemoveOperation,
    } = useUniswapRemoveLiquidity();

    const reAddPosition = async (params: UniswapReAddLiquidityParams) => {
        if (!params.position.tokenA || !params.position.tokenB) {
            throw "error re-adding position";
        }

        // Remove current position
        const removeTxHash = await removePosition({
            removePercentage: new Percent(1, 1),
            ...params,
        });
        const multiplier = new Percent(1, 1).subtract(
            UNISWAP_V3_REMOVE_SLIPPAGE,
        );
        const mintAmount0 =
            (params.position.amount0 *
                BigInt(multiplier.numerator.toString())) /
            BigInt(multiplier.denominator.toString());
        const mintAmount1 =
            (params.position.amount1 *
                BigInt(multiplier.numerator.toString())) /
            BigInt(multiplier.denominator.toString());

        // TODO get better balance check
        await sleep(5);

        // Mint new position
        const mintTxHash = await mintPosition({
            amountA: formatUnits(mintAmount0, params.position.tokenA.decimals),
            amountB: formatUnits(mintAmount1, params.position.tokenB.decimals),
            ...params,
        });
        return { removeTxHash, mintTxHash };
    };

    return {
        reAddPosition,
        statusRemovePrepare,
        statusRemoveOperation,
        statusMintPrepare,
        statusMintApproval0,
        statusMintApproval1,
        statusMintOperation,
    };
};
