import { VideoModel } from '@server/models/video/video'
import { logger } from '../../helpers/logger'
import { CONFIG } from '../../initializers/config'
import { AbstractScheduler } from './abstract-scheduler'
import { Op } from 'sequelize'
import { POCKETNET_PROXY_META } from '@server/initializers/constants'
import moment from 'moment'

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
  }

  protected async internalExecute () {
    
    logger.info('Running redundancy scheduler for garbage collector');

    this.oldVideos = [];
    this.videosToDelete = [];

    await this.fetchOldVideos();
    await this.checkVideosBlockchain();

    logger.info('Garbage collector: Found ' + this.videosToDelete.length + ' video(s) to delete !');
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }

  // Find all the old videos from database
  private async fetchOldVideos() {
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
    }
  }

  // For each chunk of 100 videos, check the blockchain (nbBlockchainChecks times)
  private async checkVideosBlockchain() {
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
          uuid: v.uuid
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

}
