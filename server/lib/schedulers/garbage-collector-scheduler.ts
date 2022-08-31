import { VideoModel } from '@server/models/video/video'
import { logger } from '../../helpers/logger'
import { CONFIG } from '../../initializers/config'
import { AbstractScheduler } from './abstract-scheduler'
import { Op } from 'sequelize'
import { POCKETNET_PROXY_META } from '@server/initializers/constants'
import moment from 'moment'
import { GarbageCollectorHistoryModel } from '@server/models/garbage-collector/garbage-collector-history'
import { GarbageCollectorState } from '../../../shared/models'

const { Api } = require('../../../../node_modules/peertube-plugin-pocketnet-auth/libs/api');
const api = new Api({});
api.init();
POCKETNET_PROXY_META.map((proxy) => api.addproxy(proxy));

export class GarbageCollectorScheduler extends AbstractScheduler {

  private static instance: GarbageCollectorScheduler

  protected schedulerIntervalMs = CONFIG.REDUNDANCY.GARBAGE_COLLECTOR_CHECK_INTERVAL

  // Number of times we will run the RPC call to check the blockchain (to be sure)
  private nbBlockchainChecks = 5;
  // Delay when we consider a video as "old", and that will be checked on the blockchain
  private timePeriodOldVideos = { weeks: 2 };

  private oldVideos: Array<VideoModel> = [];
  private videosToDelete: Array<VideoModel> = [];

  private constructor () {
    super()
    // If server crashed while garbage collector was running, we will need to change the state
    this.clearPendingGbEntries();
  }

  protected async internalExecute () {
    
    logger.info('Running redundancy scheduler for garbage collector');

    this.oldVideos = [];
    this.videosToDelete = [];

    // Clear pending gb entries if needed
    await this.clearPendingGbEntries();

    var gcModel = await GarbageCollectorHistoryModel.create({
      progress: 0,
      state: GarbageCollectorState.STARTED
    });

    await this.fetchOldVideos(gcModel);
    await this.checkVideosBlockchain(gcModel);

    gcModel.update({
      progress: 100,
      nbVideos: this.videosToDelete.length,
      videosUrls: this.videosToDelete.map((v) => v.url),
      state: GarbageCollectorState.COMPLETED,
      finishedOn: new Date()
    });

    logger.info('Garbage collector: Found ' + this.videosToDelete.length + ' video(s) to delete !');
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }

  // Find all the old videos from database
  private async fetchOldVideos(gcModel: GarbageCollectorHistoryModel) {
    try {
      let maxPublishedAt = moment().subtract(this.timePeriodOldVideos);
      const query = {
        where: {
          publishedAt: {
            [Op.lt]: maxPublishedAt.format()
          }
        }
      }
      this.oldVideos = await VideoModel.findAll(query)
      this.oldVideos = this.oldVideos.map((v) => {
        v['encodedUrl'] = this.encodeVideoUrl(v);
        return v;
      });
      return;
    } catch(err) {
      logger.error('Garbage collector: Cannot fetch videos from database');
      logger.error('Error: ', err);
      gcModel.update({
        state: GarbageCollectorState.FAILED,
        error: err,
        finishedOn: new Date()
      });
    }
  }

  // For each chunk of 100 videos, check the blockchain (nbBlockchainChecks times)
  private async checkVideosBlockchain(gcModel: GarbageCollectorHistoryModel) {
    var nbVideosTotal = this.oldVideos.length;
    while (this.oldVideos.length > 0) {
      var currentChunk = this.oldVideos.splice(0, 100), lastNbVideosBlockchain, hasBlockchainDoubt = false, vidsToDelete;
      for (var i = 0; i < this.nbBlockchainChecks; i++) {
        vidsToDelete = await this.checkBlockchain(currentChunk);
        if (i > 0 && lastNbVideosBlockchain && (!vidsToDelete || vidsToDelete.length != lastNbVideosBlockchain))
          hasBlockchainDoubt = true;
        lastNbVideosBlockchain = (vidsToDelete) ? vidsToDelete.length : undefined;
      }
      if (!hasBlockchainDoubt && lastNbVideosBlockchain > 0)
        this.videosToDelete = this.videosToDelete.concat(vidsToDelete);
      // Update progress
      gcModel.update({
        progress: 100 - Math.round((this.oldVideos.length / nbVideosTotal) * 100)
      });
    }
    return;
  }

  // Take the list of videos as parameter, and return only the ones that are not on the blockchain
  private async checkBlockchain(videos) {
    if (videos.length <= 0) return;
    try {
      var vidsToDelete = [];
      var oldVideosStrings = videos.map((video) => {
        return video.encodedUrl
      });
      var blockchainVideos = await api.rpc('searchlinks', [oldVideosStrings, 'video', 0, oldVideosStrings.length]);
      if (!blockchainVideos || blockchainVideos.length <= 0)
        return;
      var blockchainVideosStrings = blockchainVideos.map((post) => post.u);
      vidsToDelete = vidsToDelete.concat(videos.filter((video) => {
        if (blockchainVideosStrings.indexOf(video.encodedUrl) == -1)
          return true;
        return false;
      }).map((v) => {
        return {
          host: v.host,
          uuid: v.uuid,
          url: v.url
        }
      }));
      return vidsToDelete;
    } catch(error) {
      console.error("Error: " + error);
      return;
    }
  }

  private encodeVideoUrl(video) {
    let url = new URL(video.url);
    return encodeURIComponent(`peertube://${url.host}/${video.uuid}`);
  }

  // Make sure to clear all pending garbage collector entries to a finished state
  async clearPendingGbEntries() {
    const query = { where: { state: { [Op.eq]: GarbageCollectorState.STARTED }}};
    var runningGbs = await GarbageCollectorHistoryModel.findAll(query);
    runningGbs.forEach((gb) => {
      gb.update({
        state: GarbageCollectorState.FAILED,
        error: 'Server stopped while garbage collector was running',
        finishedOn: new Date()
      });
      gb.save();
    });
  }

}