import { ReactNode } from "react"

export interface FaqData {
    type: 'general' | 'ebaby' | 'eu' | 'security' | 'epoints' | 'luckydraw'
    title: ReactNode
    content: ReactNode
}