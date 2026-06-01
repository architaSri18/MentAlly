export const TRACKING_UPDATED = 'tracking-updated'

export function notifyTrackingUpdated() {
    window.dispatchEvent(new CustomEvent(TRACKING_UPDATED))
}
