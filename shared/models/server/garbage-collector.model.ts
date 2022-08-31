export const enum GarbageCollectorState {
    STARTED = 1,
    COMPLETED = 2,
    FAILED = 3
}

export interface GarbageCollectorHistory {
    id: string
    progress: number
    state: GarbageCollectorState
    nbVideos: number
    videosUrls: string[]
    error: string
    createdAt: Date | string
    finishedOn: Date | string
}