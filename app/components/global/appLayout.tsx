'use client';

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import MobileWarning from '../global/mobile-warning';
import Header from "./header";
import Sidebar from "./sidebar/sidebar";

const AppLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const pathName = usePathname();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isPortrait = useMediaQuery({ orientation: 'portrait' });

    const isMobileAndPortrait = useMemo(() => {
        return isMobile && isPortrait;
    }, [isMobile, isPortrait]);

    if (isMobileAndPortrait) {
        return (
            <MobileWarning />
        );
    }

    if (['/onboard'].includes(pathName)) {
        return (
            <>{children}</>
        );
    }

    return (
        <main className="flex bg-escher-gray50 dark:bg-escher-darkblue h-screen w-full">
            {/* sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/* header */}
                <Header />

                {/* content */}
                <section className="flex-1 h-full flex flex-col overflow-y-scroll">
                    {children}
                </section>
            </div>
        </main>
    );
}

export default AppLayout;