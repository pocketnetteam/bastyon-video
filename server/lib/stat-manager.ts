import * as Bull from "bull"
import { mapSeries } from "bluebird"
import { CONFIG } from "@server/initializers/config"
import { ActorFollowModel } from "@server/models/actor/actor-follow"
import { VideoRedundancyModel } from "@server/models/redundancy/video-redundancy"
import { UserModel } from "@server/models/user/user"
import { VideoModel } from "@server/models/video/video"
import { VideoChannelModel } from "@server/models/video/video-channel"
import { VideoCommentModel } from "@server/models/video/video-comment"
import { VideoFileModel } from "@server/models/video/video-file"
import { VideoPlaylistModel } from "@server/models/video/video-playlist"
import {
  ActivityType,
  ServerStats,
  VideoRedundancyStrategyWithManual,
  PerformanceStats
} from "@shared/models"
import { JobQueue } from "./job-queue"
import { logger } from "@server/helpers/logger"
import { TRANSCODING_JOB_TYPE } from "../initializers/constants"

class StatsManager {
  private static instance: StatsManager;

  private readonly instanceStartDate = new Date();

  private inboxMessages = {
    processed: 0,
    errors: 0,
    successes: 0,
    waiting: 0,
    errorsPerType: this.buildAPPerType(),
    successesPerType: this.buildAPPerType()
  };

  private constructor () {}

  updateInboxWaiting (inboxMessagesWaiting: number) {
    this.inboxMessages.waiting = inboxMessagesWaiting
  }

  addInboxProcessedSuccess (type: ActivityType) {
    this.inboxMessages.processed++
    this.inboxMessages.successes++
    this.inboxMessages.successesPerType[type]++
  }

  addInboxProcessedError (type: ActivityType) {
    this.inboxMessages.processed++
    this.inboxMessages.errors++
    this.inboxMessages.errorsPerType[type]++
  }

  async getStats () {
    // const { totalLocalVideos, totalLocalVideoViews, totalVideos } =
    //   await VideoModel.getStats()
    // const { totalLocalVideoComments, totalVideoComments } =
    //   await VideoCommentModel.getStats()
    // const {
    //   totalUsers,
    //   totalDailyActiveUsers,
    //   totalWeeklyActiveUsers,
    //   totalMonthlyActiveUsers
    // } = await UserModel.getStats()
    // const { totalInstanceFollowers, totalInstanceFollowing } =
    //   await ActorFollowModel.getStats()
    // const { totalLocalVideoFilesSize } = await VideoFileModel.getStats()
    // const {
    //   totalLocalVideoChannels,
    //   totalLocalDailyActiveVideoChannels,
    //   totalLocalWeeklyActiveVideoChannels,
    //   totalLocalMonthlyActiveVideoChannels
    // } = await VideoChannelModel.getStats()
    // const { totalLocalPlaylists } = await VideoPlaylistModel.getStats()

    // const videosRedundancyStats = await this.buildRedundancyStats()

    // const performance: PerformanceStats = await this.getPerformanceStats()

    const data: ServerStats = await {
      totalUsers: 1,
      totalDailyActiveUsers: 1,
      totalWeeklyActiveUsers: 1,
      totalMonthlyActiveUsers: 1,

      totalLocalVideos: 1,
      totalLocalVideoViews: 1,
      totalLocalVideoComments: 1,
      totalLocalVideoFilesSize: 1,

      totalVideos: 1,
      totalVideoComments: 1,

      totalLocalVideoChannels: 1,
      totalLocalDailyActiveVideoChannels: 1,
      totalLocalWeeklyActiveVideoChannels: 1,
      totalLocalMonthlyActiveVideoChannels: 1,

      totalLocalPlaylists: 1,

      totalInstanceFollowers: 1,
      totalInstanceFollowing: 1,

      videosRedundancy: [],

      performance: {
        waitTranscodingJobs: 0,
        failTranscodingJobs: 0,
        waitImportsCount: 0,
        activeLivestreams: 0,
        failImportsCount: 0,
        speedByResolution: {}
      },

      ...this.buildAPStats()
    }

    return data
  }

  async getPerformanceStats () {
    const waitTranscodingJobs = await JobQueue.Instance.count(
      "waiting",
      "video-transcoding"
    )
    const failTranscodingJobs = await JobQueue.Instance.count(
      "failed",
      "video-transcoding"
    )

    const waitImportsCount = await JobQueue.Instance.count(
      "waiting",
      "video-import"
    )
    const failImportsCount = await JobQueue.Instance.count(
      "failed",
      "video-import"
    )

    const activeLivestreams = await VideoModel.countLocalLives()

    const completedTranscodingJobs: Bull.Job[] =
      await JobQueue.Instance.listForApi({
        state: "completed",
        start: 0,
        count: 50,
        jobType: "video-transcoding"
      })

    const speedByResolution = {}

    completedTranscodingJobs.forEach((job) => {
      if (job.data.type !== TRANSCODING_JOB_TYPE) return

      const targetResolution: number = job.data.resolution
      const executionTime: number = (job.finishedOn - job.timestamp) / 100

      const fileSize: number =
        job.returnvalue?.VideoStreamingPlaylists?.[0]?.VideoFiles?.[0]?.size ||
        0

      if (!fileSize) return

      const mbpsSpeed: number = (fileSize * 8) / (1000000 * executionTime)

      speedByResolution[targetResolution]
        ? speedByResolution[targetResolution].push(mbpsSpeed)
        : (speedByResolution[targetResolution] = [ mbpsSpeed ])
    })

    Object.keys(speedByResolution).forEach((resolution: string) => {
      const times: any[] = speedByResolution[resolution]
      const averageTime =
        times.reduce((accum, val) => accum + val, 0) / times.length

      speedByResolution[resolution] = averageTime
    })

    const data: PerformanceStats = {
      waitTranscodingJobs,
      failTranscodingJobs,
      waitImportsCount,
      activeLivestreams,
      failImportsCount,
      speedByResolution
    }

    return data
  }

  private buildActivityPubMessagesProcessedPerSecond () {
    const now = new Date()
    const startedSeconds =
      (now.getTime() - this.instanceStartDate.getTime()) / 1000

    return this.inboxMessages.processed / startedSeconds
  }

  private buildRedundancyStats () {
    const strategies = CONFIG.REDUNDANCY.VIDEOS.STRATEGIES.map((r) => ({
      strategy: r.strategy as VideoRedundancyStrategyWithManual,
      size: r.size
    }))

    strategies.push({ strategy: "manual", size: null })

    return mapSeries(strategies, (r) => {
      return VideoRedundancyModel.getStats(r.strategy).then((stats) =>
        Object.assign(stats, { strategy: r.strategy, totalSize: r.size })
      )
    })
  }

  buildSingleRedundancyStat (strategy: VideoRedundancyStrategyWithManual) {
    return VideoRedundancyModel.getStats(strategy)
  }

  private buildAPPerType () {
    return {
      Create: 0,
      Update: 0,
      Delete: 0,
      Follow: 0,
      Accept: 0,
      Reject: 0,
      Announce: 0,
      Undo: 0,
      Like: 0,
      Dislike: 0,
      Flag: 0,
      View: 0
    }
  }

  private buildAPStats () {
    return {
      totalActivityPubMessagesProcessed: this.inboxMessages.processed,

      totalActivityPubMessagesSuccesses: this.inboxMessages.successes,

      // Dirty, but simpler and with type checking
      totalActivityPubCreateMessagesSuccesses:
        this.inboxMessages.successesPerType.Create,
      totalActivityPubUpdateMessagesSuccesses:
        this.inboxMessages.successesPerType.Update,
      totalActivityPubDeleteMessagesSuccesses:
        this.inboxMessages.successesPerType.Delete,
      totalActivityPubFollowMessagesSuccesses:
        this.inboxMessages.successesPerType.Follow,
      totalActivityPubAcceptMessagesSuccesses:
        this.inboxMessages.successesPerType.Accept,
      totalActivityPubRejectMessagesSuccesses:
        this.inboxMessages.successesPerType.Reject,
      totalActivityPubAnnounceMessagesSuccesses:
        this.inboxMessages.successesPerType.Announce,
      totalActivityPubUndoMessagesSuccesses:
        this.inboxMessages.successesPerType.Undo,
      totalActivityPubLikeMessagesSuccesses:
        this.inboxMessages.successesPerType.Like,
      totalActivityPubDislikeMessagesSuccesses:
        this.inboxMessages.successesPerType.Dislike,
      totalActivityPubFlagMessagesSuccesses:
        this.inboxMessages.successesPerType.Flag,
      totalActivityPubViewMessagesSuccesses:
        this.inboxMessages.successesPerType.View,

      totalActivityPubCreateMessagesErrors:
        this.inboxMessages.errorsPerType.Create,
      totalActivityPubUpdateMessagesErrors:
        this.inboxMessages.errorsPerType.Update,
      totalActivityPubDeleteMessagesErrors:
        this.inboxMessages.errorsPerType.Delete,
      totalActivityPubFollowMessagesErrors:
        this.inboxMessages.errorsPerType.Follow,
      totalActivityPubAcceptMessagesErrors:
        this.inboxMessages.errorsPerType.Accept,
      totalActivityPubRejectMessagesErrors:
        this.inboxMessages.errorsPerType.Reject,
      totalActivityPubAnnounceMessagesErrors:
        this.inboxMessages.errorsPerType.Announce,
      totalActivityPubUndoMessagesErrors: this.inboxMessages.errorsPerType.Undo,
      totalActivityPubLikeMessagesErrors: this.inboxMessages.errorsPerType.Like,
      totalActivityPubDislikeMessagesErrors:
        this.inboxMessages.errorsPerType.Dislike,
      totalActivityPubFlagMessagesErrors: this.inboxMessages.errorsPerType.Flag,
      totalActivityPubViewMessagesErrors: this.inboxMessages.errorsPerType.View,

      totalActivityPubMessagesErrors: this.inboxMessages.errors,

      activityPubMessagesProcessedPerSecond:
        this.buildActivityPubMessagesProcessedPerSecond(),
      totalActivityPubMessagesWaiting: this.inboxMessages.waiting
    }
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }
}

// ---------------------------------------------------------------------------

export { StatsManager }
