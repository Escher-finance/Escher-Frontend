import React from 'react';
import { AiOutlineMoon, AiOutlineSun } from "react-icons/ai";
import { BiTransferAlt } from "react-icons/bi";
import { BsArrowRight, BsArrowUp, BsArrowUpRight, BsExclamationCircle, BsThreeDots, BsWallet2 } from "react-icons/bs";
import { FaArrowLeft, FaArrowRight, FaCheck, FaCheckCircle, FaChevronDown, FaChevronLeft, FaChevronRight, FaCircle, FaExclamationTriangle, FaRegCheckCircle, FaRegCircle, FaRegDotCircle, FaRegTimesCircle, FaTimes } from "react-icons/fa";
import { FaDroplet, FaFaucetDrip } from "react-icons/fa6";
import { FiArrowUp, FiArrowUpRight, FiChevronRight, FiClock, FiCopy, FiExternalLink, FiGift, FiHelpCircle, FiInfo, FiPercent, FiPlus, FiSearch, FiTrendingUp } from "react-icons/fi";
import { IoMdRefresh } from "react-icons/io";
import { IoBookOutline } from "react-icons/io5";
import { LuMoveUpRight } from "react-icons/lu";
import { MdGrain } from "react-icons/md";
import { PiHandCoins } from "react-icons/pi";
import { RiEqualFill, RiLogoutCircleRLine, RiShutDownLine } from "react-icons/ri";
import { TbStackFront } from "react-icons/tb";
import { twMerge } from 'tailwind-merge';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconType =
    'BiTransferAlt' |

    'BsArrowRight' |
    'BsArrowUp' |
    'BsArrowUpRight' |
    'BsExclamationCircle' |
    'BsThreeDots' |
    'BsWallet2' |

    'FaArrowLeft' |
    'FaArrowRight' |
    'FaCheck' |
    'FaCheckCircle' |
    'FaChevronDown' |
    'FaChevronLeft' |
    'FaChevronRight' |
    'FaCircle' |
    'FaDroplet' |
    'FaExclamationTriangle' |
    'FaFaucetDrip' |
    'FaRegCheckCircle' |
    'FaRegCircle' |
    'FaRegDotCircle' |
    'FaRegTimesCircle' |
    'FaTimes' |

    'FiArrowUp' |
    'FiArrowUpRight' |
    'FiChevronRight' |
    'FiClock' |
    'FiCopy' |
    'FiExternalLink' |
    'FiGift' |
    'FiHelpCircle' |
    'FiPercent' |
    'FiPlus' |
    'FiSearch' |
    'FiTrendingUp' |
    'FiInfo' |

    'IoMdRefresh' |

    'IoBookOutline' |

    'LuMoveUpRight' |

    'RiEqualFill' |
    'RiLogoutCircleRLine' |
    'RiShutDownLine' |

    'TbStackFront' |

    'AiOutlineMoon' |
    'AiOutlineSun' |

    'MdGrain' |

    'PiHandCoins'
    ;

const ICON_SIZE_CLASS_DICT: Record<IconSize, string> = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10',
};

const ICON_DICT: Record<IconType, React.ElementType> = {
    BiTransferAlt: BiTransferAlt,

    BsArrowRight: BsArrowRight,
    BsArrowUp: BsArrowUp,
    BsArrowUpRight: BsArrowUpRight,
    BsExclamationCircle: BsExclamationCircle,
    BsThreeDots: BsThreeDots,
    BsWallet2: BsWallet2,

    FaDroplet: FaDroplet,
    FaFaucetDrip: FaFaucetDrip,

    FaArrowLeft: FaArrowLeft,
    FaArrowRight: FaArrowRight,
    FaCheck: FaCheck,
    FaCheckCircle: FaCheckCircle,
    FaChevronDown: FaChevronDown,
    FaChevronLeft: FaChevronLeft,
    FaChevronRight: FaChevronRight,
    FaCircle: FaCircle,
    FaExclamationTriangle: FaExclamationTriangle,
    FaRegCheckCircle: FaRegCheckCircle,
    FaRegCircle: FaRegCircle,
    FaRegDotCircle: FaRegDotCircle,
    FaRegTimesCircle: FaRegTimesCircle,
    FaTimes: FaTimes,

    FiArrowUp: FiArrowUp,
    FiArrowUpRight: FiArrowUpRight,
    FiChevronRight: FiChevronRight,
    FiClock: FiClock,
    FiCopy: FiCopy,
    FiExternalLink: FiExternalLink,
    FiGift: FiGift,
    FiHelpCircle: FiHelpCircle,
    FiPercent: FiPercent,
    FiPlus: FiPlus,
    FiSearch: FiSearch,
    FiTrendingUp: FiTrendingUp,
    FiInfo: FiInfo,

    IoMdRefresh: IoMdRefresh,

    IoBookOutline: IoBookOutline,

    RiLogoutCircleRLine: RiLogoutCircleRLine,
    RiEqualFill: RiEqualFill,
    RiShutDownLine: RiShutDownLine,

    LuMoveUpRight: LuMoveUpRight,

    TbStackFront: TbStackFront,

    AiOutlineMoon: AiOutlineMoon,
    AiOutlineSun: AiOutlineSun,

    MdGrain: MdGrain,

    PiHandCoins: PiHandCoins
};
// ImCheckboxUnchecked

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
