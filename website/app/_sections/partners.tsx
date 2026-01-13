"use client";

import Link from "next/link";
import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import "swiper/css";
import "swiper/css/free-mode";
import { Autoplay, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Partners = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 1224px)' })

    const images = [
        "/images/partners/black/union_logo.svg",
        "/images/partners/black/symbiotic_logo.svg",
        "/images/partners/black/tower_logo.svg",
        "/images/partners/black/block-hunters_logo.svg",
        "/images/partners/black/lavender-five_logo.svg",
        "/images/partners/black/01-node_logo.svg",
        "/images/partners/black/babylon_logo.svg",
        "/images/partners/black/oak_logo.svg",
        "/images/partners/black/node-monster_logo.svg",
    ];

    const imagesVar = useMemo(() => {
        return images.length - (isMobile ? 5 : 1);
    }, [isMobile]);

    return (
        <div className="bg-white">
            <div className="container mx-auto flex flex-col items-center pt-18 md:pt-28">
                <div className="px-8 md:px-0">
                    <img src="/images/partners-header-1.svg" />
                </div>

                <div className="overflow-hidden w-full mt-10 relative">
                    <Swiper
                        modules={[FreeMode, Autoplay]}
                        spaceBetween={10}
                        slidesPerView={imagesVar}
                        loop={true}
                        autoplay={{ delay: 0, pauseOnMouseEnter: true }}
                        speed={3000}
                        className="swiper-transition"
                    >
                        {[...images].map((src, index) => (
                            <SwiperSlide key={index}>
                                <Link href={"#"}>
                                    <img src={src} alt="slider" className="" />
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="w-[50px] md:w-[200px] absolute left-0 top-0 bottom-0 bg-gradient-to-l from-transparent to-white z-10" />
                    <div className="w-[50px] md:w-[200px] absolute right-0 top-0 bottom-0 bg-gradient-to-r from-transparent to-white z-10" />
                </div>

            </div>
        </div>
    );
}

export default Partners;