import React, { createContext, useCallback, useContext, useState } from 'react'
import { notifyTrackingUpdated } from '../utils/tracking'

const TrackingContext = createContext(null)

export const TrackingProvider = ({ children }) => {
    const [version, setVersion] = useState(0)

    const refreshTracking = useCallback(() => {
        setVersion((v) => v + 1)
        notifyTrackingUpdated()
    }, [])

    return (
        <TrackingContext.Provider value={{ version, refreshTracking }}>
            {children}
        </TrackingContext.Provider>
    )
}

export const useTracking = () => {
    const ctx = useContext(TrackingContext)
    if (!ctx) {
        return { version: 0, refreshTracking: () => {} }
    }
    return ctx
}
