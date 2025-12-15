const Claim = () => {
    return (
        <div className="relative mt-6 p-6 rounded-2xl bg-gradient-to-b from-[#E7E8FF] dark:from-[#142c51] to-slate-50 dark:to-[#091d3b]">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(50%_50%_at_50%_0%,_white,_transparent)] dark:hidden" />
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(70%_70%_at_50%_0%,_white,_transparent)] dark:hidden" />
            <div className="relative bg-white dark:bg-escher-darkblue shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 flex flex-col text-sm text-escher-text3 dark:text-white leading-tight gap-2 rounded-lg z-40">
                <div className="text-base"><b>Claim?!?</b></div>
                <div className="dark:text-gray-400 flex flex-col gap-2">
                    <div>That's the old way—fragmented, manual, chaotic <br /> With Escher, there's no need to claim.</div>
                    <div>Once the unbonding period ends, your assets are automatically sent to your wallet.</div>
                    <div>Less chaos. More order. Fewer clicks. Fewer worries.</div>
                </div>
            </div>
        </div>
    );
}

export default Claim;