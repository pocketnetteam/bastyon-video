import { ActorFollowModel } from '@server/models/actor/actor-follow'
import { getServerActor } from '@server/models/application/application'
import { ImageRedundancyModel } from '@server/models/image/image-redundancy'
import { logger } from '../../helpers/logger'
import { CONFIG } from '../../initializers/config'
import { AbstractScheduler } from './abstract-scheduler'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { ImageModel } from '@server/models/image/image'
import fetch from 'node-fetch'
import { ensureDir } from 'fs-extra'
import { join } from 'path'

const streamPipeline = promisify(pipeline)

export class ImagesRedundancyScheduler extends AbstractScheduler {

  private static instance: ImagesRedundancyScheduler

  protected schedulerIntervalMs = CONFIG.REDUNDANCY.IMAGES.CHECK_INTERVAL

  private constructor () {
    super()
  }

  protected async internalExecute () {
    // logger.info('Running images redundancy scheduler')
    // Get all the actors we are following
    const actors = await this.getAllActorsWithRedundancy()
    // For each actor, check image redundancy
    await Promise.all(actors.map(async (actor) => {
      const serverUrl = new URL(actor.url).origin
      // Query database to find a potential "fromDate" (date from which we are up-to-date)
      const currentImageRedundancy = (await ImageRedundancyModel.getImageRedundancyForActor(serverUrl))[0]
      // Get a list of the oldest "new" images from the "up-to-date" for this actor
      let response
      try {
        response = await ImageRedundancyModel.getImagesFromDate(currentImageRedundancy)
      } catch (err) {
        logger.info('Images redundancy: ' + serverUrl + ' is not reachable:')
        logger.info(err)
      }
      if (!response) { return }
      const imagesToDownload = await response.json()
      // If we need to download some image(s)
      if (imagesToDownload && imagesToDownload.length > 0) {
        const newFromDate = await this.downloadImagesFromServer(serverUrl, imagesToDownload)
        // Update the image redundancy date for this actor if needed
        if (newFromDate) {
          currentImageRedundancy.fromDate = newFromDate
          currentImageRedundancy.save()
        }
      }
    }))
  }

  // Get all the actors we are following and that have redundancy enabled
  private async getAllActorsWithRedundancy () {
    const serverActor = await getServerActor()
    // Get all the actors we are following
    const resultList = await ActorFollowModel.listFollowingForApi({
      id: serverActor.id,
      start: undefined,
      count: undefined,
      sort: '-createdAt'
    })
    // Keep all the actors that have redundancy enabled
    return resultList.data.filter((a) => {
      return a.ActorFollowing.getRedundancyAllowed()
    }).map((a) => a.ActorFollowing)
  }

  // Download the images simultaneously and returns the highest "createdAt" date between all the images
  private async downloadImagesFromServer (serverUrl, imagesToDownload) {
    let resDate: Date
    // For each file
    await Promise.all(imagesToDownload.map(async (imageToDownload) => {
      // Create the images folder if needed
      await ensureDir(join(CONFIG.STORAGE.IMAGES_DIR, imageToDownload.id))
      // Download the main image
      await this.downloadFile(
        ImageModel.getImageStaticUrl(imageToDownload.id, imageToDownload.filename, serverUrl),
        ImageModel.getImageStaticPath(imageToDownload.id, imageToDownload.filename)
      )
      // Download the thumbnail
      await this.downloadFile(
        ImageModel.getImageStaticUrl(imageToDownload.id, imageToDownload.thumbnailname, serverUrl),
        ImageModel.getImageStaticPath(imageToDownload.id, imageToDownload.thumbnailname)
      )
      // Generate the torrent file
      const torrentHash = await ImageModel.generateTorrentForImage(imageToDownload.id, join(CONFIG.STORAGE.IMAGES_DIR, imageToDownload.id))
      // Update the result date (highest date) if needed
      const currentCreatedAt = new Date(imageToDownload.createdAt)
      resDate = (!resDate || resDate < currentCreatedAt) ? currentCreatedAt : resDate
      // Create/save image entry in database
      imageToDownload.createdAt = imageToDownload.updatedAt = new Date()
      imageToDownload.infoHash = torrentHash
      const newImage = new ImageModel(imageToDownload)
      newImage.save()
    }))
    return resDate
  }

  // Download a file, and save it
  private async downloadFile (url, filePath) {
    const response = await fetch(url)
    if (!response.ok) { throw new Error(`downloadFile: Unexpected response ${response.statusText}`) }
    await streamPipeline(response.body, createWriteStream(filePath))
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }

}
