import React from 'react';
import { FiChevronDown, FiCopy, FiDownload, FiInfo, FiLogOut, FiRefreshCw, FiSearch } from "react-icons/fi";
import { twMerge } from 'tailwind-merge';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconType =
    'FiInfo' |
    'FiLogOut' |
    'FiDownload' |
    'FiSearch' |
    'FiChevronDown' |
    'FiRefreshCw' |
    'FiCopy'
    ;

const ICON_SIZE_CLASS_DICT: Record<IconSize, string> = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10',
};

const ICON_DICT: Record<IconType, React.ElementType> = {
    FiInfo: FiInfo,
    FiLogOut: FiLogOut,
    FiDownload: FiDownload,
    FiChevronDown: FiChevronDown,
    FiSearch: FiSearch,
    FiRefreshCw: FiRefreshCw,
    FiCopy: FiCopy
};

type IconProps = {
    type: IconType;
    size?: IconSize;
    className?: string;
};

const Icon = ({ type, size = 'md', className = '' }: IconProps) => {
    const IconComponent = ICON_DICT[type];
    const sizeClassName = ICON_SIZE_CLASS_DICT[size];

    return (
        <IconComponent className={twMerge(`grow-0 shrink-0`, sizeClassName, className)} />
    );
};

export default Icon;
