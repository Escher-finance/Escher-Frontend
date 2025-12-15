export function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export const hasCommonElement = (arrA: string[], arrB: string[]) => {
    const setB = new Set(arrB);
    return arrA.some((item) => setB.has(item));
};