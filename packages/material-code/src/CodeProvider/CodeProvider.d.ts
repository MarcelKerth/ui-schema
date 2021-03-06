import * as React from 'react'

export interface WidgetCodeProviderProps {
    theme: string
}

export type WidgetCodeContext = React.Context<WidgetCodeProviderProps>

export type WidgetCodeProvider = (props: React.PropsWithChildren<WidgetCodeProviderProps>) => React.ReactElement

export function useWidgetCode(): WidgetCodeProviderProps
