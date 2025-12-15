import SwapUniswap from "@/components/modal/swap/uniswap/swapUniswap";
import { EU_TOKENS } from "@/configs/token";

const UnbondNow = () => {

    return (
        <div className="flex flex-col gap-4 mt-6">
            <SwapUniswap
                initialTokenId={EU_TOKENS.mainnet.id}
            />
        </div>
    );
}

export default UnbondNow;