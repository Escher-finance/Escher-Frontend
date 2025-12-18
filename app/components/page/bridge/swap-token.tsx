import Image from "next/image";

interface Props {
    onSwap(): void
}

const SwapToken = (props: Props) => {
    return (
        <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-escher-e4e8ed dark:bg-escher-darkblue_4" />
            <button
                className="border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full p-1 hover:bg-escher-electricblue_light9 transition-all"
                onClick={props.onSwap}
            >
                <Image alt="" src={"/icons/arrows-gray.svg"} width={16} height={16} />
            </button>
            <div className="h-px flex-1 bg-escher-e4e8ed dark:bg-escher-darkblue_4" />
        </div>
    );
}

export default SwapToken;