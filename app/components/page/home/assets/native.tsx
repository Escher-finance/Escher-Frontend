import ComingSoon from "@/components/global/comingSoon";
import AssetsNativeRow from "./native-row";

const AssetsNative = () => {
    return (
        <div className="relative flex flex-col">
            {/* header */}
            <div
                className="flex px-6 text-xs font-medium border-t bg-escher-gray25 dark:bg-escher-1a2d49 border-escher-gray300 dark:border-none text-escher-gray500 dark:text-white"
            >
                <div className="flex-1 flex items-center py-4">
                    <div className="w-[28%]">Asset</div>
                    <div className="w-[24%]">Staked Position</div>
                    <div className="w-[24%]">Estimated Reward</div>
                    <div className="w-[24%]">APR</div>
                </div>
            </div>
            {/* content */}
            <div className="flex w-full flex-col">
                <AssetsNativeRow
                    logo={"/images/token-u.png"}
                    name={"U"}
                    balance={"10"}
                    value={"$50.00"}
                    reward={"$20"}
                    apr={"2.18%"}
                />
                <AssetsNativeRow
                    logo={"/images/token-ebabylon.png"}
                    name={"BABYLON"}
                    balance={"0.003"}
                    value={"$1.00"}
                    reward={"$4"}
                    apr={"5.40%"}
                />
            </div>
            <ComingSoon />
        </div>
    );
}

export default AssetsNative;