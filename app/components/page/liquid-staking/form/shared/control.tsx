import { Action } from "@/types/transaction";

interface Props {
    canClaim?: boolean
    page: Action
    setOperation(val: Action): void
    setPage(val: Action): void
}

const Control = (props: Props) => {
    return (
        <div className="self-start text-sm font-semibold flex justify-center items-center gap-1 bg-escher-gray100 dark:bg-escher-darkblue text-escher-777e90 rounded-lg p-1">
            <button
                onClick={() => {
                    props.setOperation("bond");
                    props.setPage("bond");
                }}
                className={`px-4 py-2 rounded-lg transition-all ${props.page === "bond" && 'bg-escher-electricblue_light4 dark:bg-escher-darkblue_5 text-escher-electricblue dark:text-white'}`}
            >
                Stake
            </button>

            <div className="h-full py-1">
                <div className="w-px h-full bg-escher-gray200 dark:bg-escher-darkblue_5"></div>
            </div>

            <button
                onClick={() => {
                    props.setOperation("unbond");
                    props.setPage("unbond");
                }}
                className={`px-4 py-2 rounded-lg transition-all ${props.page === "unbond" && 'bg-escher-electricblue_light4 dark:bg-escher-darkblue_5 text-escher-electricblue dark:text-white'}`}
            >
                Unstake
            </button>

            <div className="h-full py-1">
                <div className="w-px h-full bg-escher-gray200 dark:bg-escher-darkblue_5"></div>
            </div>

            <button
                onClick={() => {
                    props.setPage("dust");
                }}
                className={`px-4 py-2 rounded-lg transition-all ${props.page === "dust" ? 'bg-escher-electricblue_light4 dark:bg-escher-darkblue_5 text-escher-electricblue dark:text-white' : ""}`}
            >
                Dust
            </button>

            <div className="h-full py-1">
                <div className="w-px h-full bg-escher-gray200 dark:bg-escher-darkblue_5"></div>
            </div>

            <button
                onClick={() => {
                    props.setPage("withdraw");
                }}
                className={`px-4 py-2 rounded-lg transition-all ${props.page === "withdraw" ? 'bg-escher-electricblue_light4 dark:bg-escher-darkblue_5 text-escher-electricblue dark:text-white' : ""}`}
            >
                {props.canClaim ? "Claim" : "Claim?"}
            </button>
        </div>
    );
}

export default Control;