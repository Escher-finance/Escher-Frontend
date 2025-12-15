export interface UniV3AprDataResponse {
    data: {
        feeTier: number;
        latestVolume24hToken0: number;
        latestVolume24hToken1: number;
        avgVolume24hToken0: number;
        avgVolume24hToken1: number;
        highestVolume24hToken0: number;
        highestVolume24hToken1: number;
    } | null;
    error?: unknown;
}
