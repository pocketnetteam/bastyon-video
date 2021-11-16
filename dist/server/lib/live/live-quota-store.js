"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveQuotaStore = void 0;
class LiveQuotaStore {
    constructor() {
        this.livesPerUser = new Map();
    }
    addNewLive(userId, liveId) {
        if (!this.livesPerUser.has(userId)) {
            this.livesPerUser.set(userId, []);
        }
        const currentUserLive = { liveId, size: 0 };
        const livesOfUser = this.livesPerUser.get(userId);
        livesOfUser.push(currentUserLive);
    }
    removeLive(userId, liveId) {
        const newLivesPerUser = this.livesPerUser.get(userId)
            .filter(o => o.liveId !== liveId);
        this.livesPerUser.set(userId, newLivesPerUser);
    }
    addQuotaTo(userId, liveId, size) {
        const lives = this.livesPerUser.get(userId);
        const live = lives.find(l => l.liveId === liveId);
        live.size += size;
    }
    getLiveQuotaOf(userId) {
        const currentLives = this.livesPerUser.get(userId);
        if (!currentLives)
            return 0;
        return currentLives.reduce((sum, obj) => sum + obj.size, 0);
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.LiveQuotaStore = LiveQuotaStore;
