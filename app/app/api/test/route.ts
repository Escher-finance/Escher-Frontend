import { UNION_CONTRACTS } from "@/configs/union";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { NextResponse } from "next/server";
import dataMainnet from "./data-mainnet.json";
import dataTestnet from "./data.json";

function hexToString(hex: string): string {
    try {
        return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString('utf8')
    } catch (error) {
        console.error('hexToString error:', error);
        return hex;
    }
}

function base64ToString(base64: string): string {
    try {
        return Buffer.from(base64, 'base64').toString('utf8')
    } catch (error) {
        console.error('base64ToString error:', error);
        return base64;
    }
}

export async function GET() {
    const res = await getTx(false);

    return NextResponse.json(res);
}

const test1 = async () => { // eslint-disable-line @typescript-eslint/no-unused-vars

    const client = await CosmWasmClient.connect("https://rpc.rpc-node.union-testnet-10.union.build");
    const msg: { accounting_state: Record<string, unknown> } = {
        accounting_state: {}
    };

    const result = await client?.queryContractSmart(
        UNION_CONTRACTS.holesky.lstAtUnionAddress,
        msg
    );

    return result;
}

// list tx mainnet
const getTx = async (isMainnet: boolean) => {
    const data = isMainnet ? dataMainnet : dataTestnet;
    const res = data.data.v2_packets.filter(v =>
        v.decoded.instruction.operand._type === "Batch"
    ).map(v => {
        let type = "bond";
        let payload;
        let payloadString;

        try {
            payloadString = v.decoded.instruction.operand.instructions?.at(1)?.operand.contractCalldata !== undefined ?
                hexToString(v.decoded.instruction.operand.instructions.at(1)?.operand.contractCalldata ?? "") : undefined;
            const rawPayload = payloadString ? JSON.parse(payloadString) : undefined;

            // Ensure payload is an array before mapping
            if (Array.isArray(rawPayload)) {
                payload = rawPayload.map((v: { wasm: { execute: { msg: string; contract_addr: string } } }) => {
                    const msg = JSON.parse(base64ToString(v.wasm.execute.msg));
                    if (msg.unbond) type = "unbond";

                    return {
                        contract_addr: v.wasm.execute.contract_addr,
                        msg,
                        raw: v
                    }
                });
            } else {
                payload = undefined;
            }
        } catch (error) {
            console.error('Test error:', error);
        }

        return {
            type,
            packet_hash: v.packet_hash,
            success: v.success,
            token_order: v.decoded.instruction.operand.instructions?.at(0)?.operand,
            call_data: payload,
        };
    })
        .filter(v => v.type === "unbond");

    return res;
}