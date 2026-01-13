"use client";

import animHub from '@/lotties/2a.json';
import lottie, { AnimationItem } from 'lottie-web';
import { useEffect, useRef } from "react";

const Hub2 = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animInstance = useRef<AnimationItem | null>(null);

    const handleMouseEnter = () => {
        animInstance.current?.setDirection(1);
        animInstance.current?.play();
    };

    const handleMouseLeave = () => {
        animInstance.current?.pause();
    };

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        animInstance.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            animationData: animHub,
        });

        return () => animInstance.current?.destroy();
    }, []);

    return (
        <div
            className="relative flex flex-col items-start justify-between bg-primary rounded-2xl p-6 aspect-[416/450] bg-radial-[at_75%_25%] from-[#a3a7ff] to-transparent overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="absolute inset-0 flex justify-end">
                <div className="w-[125%] h-fit mt-[-20%] mr-[-20%]" ref={containerRef} />
            </div>
            <div className="text-white font-bold text-xs bg-custom-5d62ff p-2 rounded">INTEROPERABLE</div>
            <div className="flex flex-col text-white">
                <div className="font-funnel-display font-bold text-2xl">Using (m)ANY Token(s)</div>
                <div className="">Skip the wrapping and swapping.</div>
            </div>
        </div>
    );
}

export default Hub2;