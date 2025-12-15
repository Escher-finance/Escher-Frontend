import { APP_CONFIG } from "@/configs/app";
import { IndexerTransaction } from "@/types/transaction";
import { useEffect, useState } from "react";

function parseData(data: string): IndexerTransaction[] {
    return JSON.parse(data)
        .filter((t: IndexerTransaction | null) => !!t)
        .map((t: IndexerTransaction) => {
            if (t.recipient === undefined || t.recipient === "") {
                t.recipient = null;
            }
            if (t.recipientChannelId === undefined) {
                t.recipientChannelId = null;
            }
            return t;
        });
}

export function useLocalTransactions() {
    const [storedData, setStoredData] = useState<IndexerTransaction[]>([]);

    useEffect(() => {
        const data = localStorage.getItem(APP_CONFIG.dbTransaction);
        if (data) {
            queueMicrotask(() => setStoredData(parseData(data)));
        }
    }, []);

    const saveData = (newData: IndexerTransaction) => {
        const localData = localStorage.getItem(APP_CONFIG.dbTransaction);
        let currentData: IndexerTransaction[] = [];
        if (localData) {
            currentData = parseData(localData);
        }
        const updatedData = [...currentData, newData];
        setStoredData(updatedData);
        localStorage.setItem(APP_CONFIG.dbTransaction, JSON.stringify(updatedData));
    };

    const clearData = () => {
        setStoredData([]);
        localStorage.removeItem(APP_CONFIG.dbTransaction);
    };

    return { storedData, saveData, clearData };
}
