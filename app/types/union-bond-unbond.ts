export interface Root {
    data: {
        v2_packets: V2Packet[]
    }
}

export interface V2Packet {
    packet_hash: string
    status: string
    success: boolean
    decoded: Decoded
}

export interface Decoded {
    instruction: Instruction
    path: string
    salt: string
}

export interface Instruction {
    _ack: Ack | null
    _index: string
    _instruction_hash: string
    opcode: number
    operand: Operand
    version: number
}

export interface Ack {
    _tag: string
    acknowledgements?: Acknowledgement[]
    fillType?: string
    marketMaker?: string
    data?: string
}

export interface Acknowledgement {
    _index: string
    _type: string
    fillType?: string
    marketMaker?: string
    data?: string
}

export interface Operand {
    _type: "Batch" | "TokenOrder" | "Call"
    instructions?: Instruction[] // only if _type === "Batch"

    // TokenOrder fields
    _metadata?: {
        _type: string
        metadata: string
        solverAddress: string
    }
    baseAmount?: string
    baseToken?: string
    kind?: number
    metadata?: string
    quoteAmount?: string
    quoteToken?: string
    receiver?: string
    sender?: string

    // Call fields
    contractAddress?: string
    contractCalldata?: string
    eureka?: boolean
}
