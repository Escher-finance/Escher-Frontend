'use client';

import { useEffect, useMemo } from 'react';
import { useTheme } from '../providers/themeProvider';

export type LoaderType = 'bouncy' | 'tailspin' | 'hatch' | 'ring2';

interface Props {
    type?: LoaderType
    size?: number
    speed?: number
    color?: string
}

const defaultColor = "#0008FF";

const LdrsAnimation = ({ type = 'bouncy', color = '#0008FF', size = 24, speed = 1.75 }: Props) => {
    const { themeIsDark } = useTheme();

    const updatedColor = useMemo(() => {
        if (themeIsDark && color === defaultColor) {
            return "#fff";
        }
        return color;
    }, [themeIsDark, color]);

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

    const result = useMemo(() => {
        switch (type) {
            case 'bouncy':
                return (
                    <l-bouncy size={size} speed={speed} color={updatedColor}></l-bouncy>
                );

            case 'tailspin':
                return (
                    <l-tailspin size={size} speed={speed} color={updatedColor}></l-tailspin>
                );

            case 'hatch':
                return (
                    <l-hatch size={size} speed={speed} color={updatedColor}></l-hatch>
                );

            case 'ring2':
                return (
                    <l-ring-2 size={size} speed={speed} color={updatedColor}></l-ring-2>
                );

            default:
                return (<></>);
        }
    }, [size, updatedColor, type, speed]);

    return result;
}

export default LdrsAnimation;