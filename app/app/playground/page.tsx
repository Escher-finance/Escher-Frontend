"use client";

import { APP_CONFIG } from "@/configs/app";

const Page = () => {
    return (
        <div className="flex flex-col p-8 gap-6 dark:text-white">
            {APP_CONFIG.enablePlayground && (
                <></>
            )}
        </div>
    );
};

export default Page;
