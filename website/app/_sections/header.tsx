"use client";

import ButtonLink from "@/components/global/buttonLink";
import { URL } from "@/config/app";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const Header = () => {
    const pathName = usePathname();
    const autoHeader = useMemo(() => {
        return (["/"].includes(pathName));
    }, [pathName]);

    const [showHeader, setShowHeader] = useState(!autoHeader);
    const [showPromo, setShowPromo] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (autoHeader) {
                if (window.scrollY > 0) {
                    setShowHeader(true);
                } else {
                    setShowHeader(false);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [autoHeader]);

    useEffect(() => {
        if (["/"].includes(pathName)) {
            setShowHeader(false);
        }
    }, [pathName]);

    return (
        <div className={`z-20 sticky top-0 left-0 right-0 flex flex-col bg-white transition-all ${showHeader ? "md:opacity-100" : "md:opacity-0"}`}>
            <div className="w-full md:px-20 flex justify-center md:justify-between items-center py-4">
                <Link href={"/"}>
                    <Image src={"/images/logo.svg"} alt="Escher" width={182} height={182} />
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    {false &&
                        <>
                            <Link href={"#"} className="hover:underline">Staking</Link>
                            <Link href={"#"} className="hover:underline">Integrations</Link>
                            <Link href={"#"} className="hover:underline">Developers</Link>
                            <Link href={"#"} className="hover:underline">Learn</Link>
                        </>
                    }
                    <ButtonLink
                        title="Stake now"
                        url={URL.app}
                        preImage="/icons/stake.svg"
                    />
                </div>
            </div>
            {showPromo &&
                <div className="hidden md:block bg-primary text-white">
                    <div className="container mx-auto relative flex items-center justify-center gap-4 py-3">
                        <div className="text-lg"><span className="font-bold">eU is Live!</span> Stake U. Secure Union. Stay liquid.</div>
                        <ButtonLink
                            title="Get eU"
                            url={URL.app}
                            className="bg-custom-d6d7ff text-primary font-bold py-2 px-4"
                        />
                        <button className="absolute right-0 cursor-pointer" onClick={() => setShowPromo(false)}>
                            <img src="/icons/times.svg" />
                        </button>
                    </div>
                </div>
            }
        </div>
    );
}

export default Header;