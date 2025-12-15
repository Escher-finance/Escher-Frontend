import { APP_CONFIG } from '@/configs/app';
import { useQuery } from '@tanstack/react-query';

export const useMoralisBalance = (address?: string) => {
    const getData = async () => {
        const response = await fetch(`/api/user/${address}/balance`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            console.error(result.errors?.[0]?.message || 'Failed to fetch data');
            return [];
        }

        if (result.length === 0) {
            return [];
        }

        return result as { token_address: string, balance: string, usd_price: number, usd_value: number }[];
    }

    return useQuery(
        {
            queryKey: ['moralisBalance'],
            queryFn: getData,
            refetchInterval: APP_CONFIG.balanceRefetchInterval,
            staleTime: APP_CONFIG.balanceRefetchInterval,
            enabled: !!address
        }
    );
};
