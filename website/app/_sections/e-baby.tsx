import ButtonLink from "@/components/global/buttonLink";

const Ebaby = () => {
    return (
        <div className="bg-white pt-28">
            <div className="container mx-auto">
                <div
                    className="flex flex-col items-start justify-center bg-custom-fafbfc px-10 py-20 rounded-2xl leading-none border border-custom-e2e8ee bg-[url('/images/e-baby.svg')] bg-contain bg-right-top bg-no-repeat"
                >
                    <div className="font-funnel-display text-primary font-bold text-[32px]">eBABY is Coming..</div>
                    <div className="font-funnel-display text-custom-5b61ff font-bold text-2xl">Stake Baby. Secure Babylon. Stay liquid.<br />Use it in Tower DEX.</div>
                    <ButtonLink
                        title="Get eBABY"
                        url="#"
                        postImage="/icons/arrow-right-02.svg"
                        className="bg-custom-e1e2ff text-primary mt-8"
                    />
                </div>
            </div>
        </div>
    );
}

export default Ebaby;