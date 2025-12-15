"use client";

import { APP_CONFIG } from "@/configs/app";
import Defi from "./_sections/defi";

const Page = () => {
    return (
        <div className="flex flex-col p-8 gap-6 dark:text-white">
            {APP_CONFIG.enablePlayground && (
                <>
                    <Defi />
                </>
            )}
        </div>
    );
};

export default Page;
