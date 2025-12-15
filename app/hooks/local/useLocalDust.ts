import { APP_CONFIG } from "@/configs/app";
import { LocalDust } from "@/types/transaction";
import { useState } from "react";

export function parseLocalDustData(data: string): LocalDust[] {
    return JSON.parse(data)
        .filter((t: LocalDust | null) => !!t);
}

export function useLocalDust() {
    const [localDusts, setLocalDusts] = useState<LocalDust[]>(() => {
        const data = localStorage.getItem(APP_CONFIG.dbDust);
        return data ? parseLocalDustData(data) : [];
    });

    const saveData = (newData: LocalDust) => {
        const localData = localStorage.getItem(APP_CONFIG.dbDust);
        let currentData: LocalDust[] = [];
        if (localData) {
            currentData = parseLocalDustData(localData);
        }
        const updatedData = [...currentData, newData];
        setLocalDusts(updatedData);
        localStorage.setItem(APP_CONFIG.dbDust, JSON.stringify(updatedData));
    };

    const clearData = () => {
        setLocalDusts([]);
        localStorage.removeItem(APP_CONFIG.dbDust);
    };

    return { localDusts, saveData, clearData };
}
