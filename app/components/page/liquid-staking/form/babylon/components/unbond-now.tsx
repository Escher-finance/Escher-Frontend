import SwapOsmosis from "@/components/modal/swap/osmosis/swapOsmosis";
import SwapUniswap from "@/components/modal/swap/uniswap/swapUniswap";
import { EBABY_TOKENS } from "@/configs/token";

const UnbondNow = () => {
    return (
        <div className="flex flex-col gap-4 mt-6">
            <SwapUniswap
                initialTokenId={EBABY_TOKENS.mainnet.id}
            />
            <SwapOsmosis />
        </div>
    );
}

export default UnbondNow;