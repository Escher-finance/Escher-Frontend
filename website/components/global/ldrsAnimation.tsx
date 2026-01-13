'use client';

import { useEffect } from 'react';

export type LoaderType = 'bouncy' | 'tailspin' | 'hatch' | 'ring2';

interface Props {
    type?: LoaderType
    size?: number
    speed?: number
    color?: string
}

const LdrsAnimation = ({ type = 'bouncy', color = '#0008FF', size = 24, speed = 1.75 }: Props) => {
    useEffect(() => {
        async function getLoader() {
            const { bouncy, tailspin, hatch, ring2 } = await import('ldrs');
            bouncy.register();
            tailspin.register();
            hatch.register();
            ring2.register();
        }
        getLoader()
    }, []);

    switch (type) {
        case 'bouncy':
            return (
                // @ts-ignore
                <l-bouncy size={size} speed={speed} color={color}></l-bouncy>
            );

        case 'tailspin':
            return (
                // @ts-ignore
                <l-tailspin size={size} speed={speed} color={color}></l-tailspin>
            );

        case 'hatch':
            return (
                // @ts-ignore
                <l-hatch size={size} speed={speed} color={color}></l-hatch>
            );

        case 'ring2':
            return (
                // @ts-ignore
                <l-ring-2 size={size} speed={speed} color={color}></l-ring-2>
            );

        default:
            return (<></>);
    }
}

export default LdrsAnimation;