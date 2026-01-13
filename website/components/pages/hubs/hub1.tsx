"use client";

import animHub from '@/lotties/1a.json';
import lottie, { AnimationItem } from 'lottie-web';
import { useEffect, useRef } from "react";

const Hub1 = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animInstance = useRef<AnimationItem | null>(null);

    const handleMouseEnter = () => {
        animInstance.current?.setDirection(1);
        animInstance.current?.play();
    };

    const handleMouseLeave = () => {
        animInstance.current?.setDirection(-1);
        animInstance.current?.play();
    };

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        animInstance.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: animHub,
        });

        return () => animInstance.current?.destroy();
    }, []);

    return (
        <div
            className="relative flex flex-col items-start justify-between bg-custom-b6b9ff rounded-2xl p-6 aspect-[416/450] bg-radial-[at_75%_25%] from-[#a3a7ff] to-transparent overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="absolute inset-0 flex justify-end">
                <div className="w-[100%] h-fit mt-[-11%] mr-[-35%]" ref={containerRef} />
            </div>
            <div className="text-primary font-bold text-xs bg-custom-9ea1ff p-2 rounded">CROSS - CHAIN</div>
            <div className="flex flex-col text-primary">
                <div className="font-funnel-display font-bold text-2xl">From (m)ANY Chain(s)</div>
                <div className="">No need to leave your favorite network.</div>
            </div>
        </div>
    );
}

export default Hub1;