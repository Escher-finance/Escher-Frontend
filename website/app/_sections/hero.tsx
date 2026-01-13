import ButtonLink from "@/components/global/buttonLink"
import { URL } from "@/config/app"

const Hero = () => {
    return (<>
        <div className="md:fixed inset-0 md:inset-6">
            <div className="container mx-auto h-[50vh] md:h-full flex flex-col gap-0 rounded-none md:rounded-[48px] bg-custom-f8f8ff">
                <div className="flex-1 bg-[url('/images/hero.svg')] bg-no-repeat bg-cover bg-bottom rounded-none md:rounded-t-[48px]"></div>
                <div className="flex flex-col items-center pb-10">
                    {false &&
                        <div className="flex items-center justify-center gap-48 font-funnel-display text-primary font-semibold">
                            <div className="flex flex-col items-center">
                                <div className="text-xl">APR</div>
                                <div className="text-4xl">7.3%</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-xl">TVL</div>
                                <div className="text-4xl">$na</div>
                            </div>
                        </div>
                    }

                    <div className="text-3xl md:text-7xl font-semibold text-text font-funnel-display mt-4">Staking Made Limitless</div>

                    <div className="flex items-center justify-center gap-4 mt-6">
                        <ButtonLink
                            title="Stake now"
                            url={URL.app}
                            preImage="/icons/stake.svg"
                        />
                        {false &&
                            <ButtonLink
                                title="Bridge now"
                                url="#"
                                preImage="/icons/bridge.svg"
                                className="bg-custom-d6d7ff text-primary"
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
        <div className="md:h-screen pointer-events-none"></div>
    </>)
}

export default Hero