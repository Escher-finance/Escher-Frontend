"use client";

import ButtonLink from "@/components/global/buttonLink";
import { motion } from "framer-motion";

const Defi = () => {
    return (
        <div className="bg-white py-28">
            <div className="relative flex flex-col items-center justify-center text-center md:pt-14">
                <div className="absolute inset-0 bg-[url('/images/grid-left.svg')] bg-contain bg-left bg-no-repeat opacity-50 md:opacity-100" />
                <div className="absolute inset-0 bg-[url('/images/grid-right.svg')] bg-contain bg-right bg-no-repeat opacity-50 md:opacity-100" />
                <div className="w-full md:w-[636px] flex flex-col items-center z-10">
                    <div className="font-funnel-display font-semibold text-2xl md:text-5xl leading-none">DeFi Connectivity</div>
                    <div className="text-sm md:text-lg text-text-light mt-4 leading-none">Blue Chip Underlying Assets, Unparallel User Experience. Access higher<br />rewards from the comfort of your preferred chain.</div>
                    {false &&
                        < ButtonLink
                            title="View more"
                            url="#"
                            postImage="/icons/arrow-up-right-03.svg"
                            className="bg-custom-e1e2ff text-primary mt-6"
                        />
                    }

                    <div className="w-full mt-10 overflow-hidden">
                        <motion.img
                            src={"/images/defi-1.svg"}
                            alt=""
                            width={1024}
                            height={1024}
                            className=""
                            animate={{
                                rotate: 360
                            }}
                            transition={{
                                rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Defi;