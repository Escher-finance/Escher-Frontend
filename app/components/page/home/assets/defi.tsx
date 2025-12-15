import { EscherDefi } from "@/hooks/defi/useDefi";
import AssetsDefiRowOsmosis from "./defi/osmosis/defi-row";
import AssetsDefiRowUniswap from "./defi/uniswap/defi-row";

interface Props {
    defis: EscherDefi
    isCosmosConnected: boolean
    isEvmConnected: boolean
}

const AssetsDefi = (props: Props) => {
    return (
        <div className="relative flex flex-col">
            {/* header */}
            <div
                className="flex px-6 text-xs font-medium border-t bg-escher-gray25 dark:bg-escher-1a2d49 border-escher-gray300 dark:border-none text-escher-gray500 dark:text-white"
            >
                <div className="flex-1 flex items-center py-4">
                    <div className="w-[40%]">Apps</div>
                    <div className="w-[30%]">Position</div>
                    <div className="w-[30%]">TVL</div>
                </div>
            </div>
            {/* content */}
            <div className="flex w-full flex-col">

                <AssetsDefiRowUniswap
                    defi={props.defis.uniswap}
                    isEvmConnected={props.isEvmConnected}
                />

                <AssetsDefiRowOsmosis
                    defi={props.defis.osmosis}
                    isCosmosConnected={props.isCosmosConnected}
                />
            </div>
        </div>
    );
}

export default AssetsDefi;