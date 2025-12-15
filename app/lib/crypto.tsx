import { hex } from "@scure/base"

const hexes = /*#__PURE__*/ Array.from({ length: 256 }, (_v, i) =>
    i.toString(16).padStart(2, '0'),
)

export function toHex(value: Uint8Array): string {
    let string = ''
    for (let i = 0; i < value.length; i++) {
        string += hexes[value[i]]
    }
    const hex = `0x${string}`;
    return hex;
}

export function bytesToHex(bytes: Uint8Array): string {
    return hex.encode(bytes)
}

export const hexOf = (addr: string) => {
    return toHex(Buffer.from(addr));
};