import memoizee from 'memoizee';
import { AllowNull, Column, CreatedAt, Default, Model, Table, PrimaryKey } from 'sequelize-typescript'
import { doesExist } from '../shared';
import {
  MEMOIZE_LENGTH,
  MEMOIZE_TTL,
  STATIC_PATHS,
  WEBSERVER
} from '../../initializers/constants'
import { join } from 'path';
import { CONFIG } from '@server/initializers/config';
import { createTorrentPromise } from '@server/helpers/webtorrent';
import parseTorrent from 'parse-torrent';
import { writeFile } from 'fs-extra';

@Table({
  tableName: 'image',
  indexes: [
    { fields: [ 'id' ], unique: true },
    { fields: [ 'createdAt' ] },
    { fields: [ 'originalname' ] },
    { fields: [ 'filename' ] },
    { fields: [ 'thumbnailname' ] },
    { fields: [ 'size' ] },
    { fields: [ 'mimetype' ] },
    { fields: [ 'extname' ] },
    { fields: [ 'infoHash' ] }
  ]
})
export class ImageModel extends Model {

  static doesInfohashExistCached = memoizee(ImageModel.doesInfohashExist, {
    promise: true,
    max: MEMOIZE_LENGTH.INFO_HASH_EXISTS,
    maxAge: MEMOIZE_TTL.INFO_HASH_EXISTS
  })
  
  static doesInfohashExist (infoHash: string) {
    const query = 'SELECT 1 FROM "image" WHERE "infoHash" = $infoHash LIMIT 1';
    return doesExist(query, { infoHash })
  }

  @AllowNull(false)
  @PrimaryKey
  @Column
  id: string

  @CreatedAt
  createdAt: Date

  @AllowNull(false)
  @Column
  originalname: string

  @AllowNull(false)
  @Column
  filename: string

  @AllowNull(false)
  @Column
  thumbnailname: string

  @AllowNull(true)
  @Default(null)
  @Column
  size: number

  @AllowNull(true)
  @Default(null)
  @Column
  mimetype: string

  @AllowNull(true)
  @Default(null)
  @Column
  extname: string

  @AllowNull(true)
  @Column
  infoHash: string

  static getImageStaticUrl(imageId, imageName, webServUrl = WEBSERVER.URL) {
    const ipRegex = new RegExp(/\d+\.\d+\.\d+\.\d+/);
    if (webServUrl.indexOf('localhost') == -1) {
      // If webserver url is an IP, use HTTP without SSL
      if (ipRegex.test(webServUrl) == true && !webServUrl.startsWith('http'))
        webServUrl = 'http://' + webServUrl;
      // Else if webserver url already has HTTP, force https
      else if (webServUrl.startsWith('http:'))
        webServUrl = webServUrl.replace('http:', 'https:');
    }
    return webServUrl + join(STATIC_PATHS.IMAGES, imageId, imageName);
  }
  static getTorrentStaticUrl(imageId, webServUrl = WEBSERVER.URL) {
    return webServUrl.replace('http:', 'https:') + join(STATIC_PATHS.TORRENTS, imageId + '.torrent');
  }

  static getImageStaticPath(imageId, imageName) {
    return join(CONFIG.STORAGE.IMAGES_DIR, imageId, imageName);
  }
  static getTorrentStaticPath(imageId) {
    return join(CONFIG.STORAGE.TORRENTS_DIR, imageId + '.torrent')
  }

  static async generateTorrentForImage(imageId, destFolder) {
    const torrentArgs = {
      name: imageId,
      createdBy: 'PeerTube',
      announceList: [
        [ WEBSERVER.WS + '://' + WEBSERVER.HOSTNAME + ':' + WEBSERVER.PORT + '/tracker/socket' ],
        [ WEBSERVER.URL + '/tracker/announce' ]
      ],
      urlList: [
        WEBSERVER.URL + STATIC_PATHS.IMAGES_WEBSEED
      ]
    }
    const torrentContent = await createTorrentPromise(destFolder, torrentArgs);
    const torrentPath = ImageModel.getTorrentStaticPath(imageId);
    // Get the torrent info hash
    const parsedTorrent = parseTorrent(torrentContent);
    // Writing the torrent file
    await writeFile(torrentPath, torrentContent);
    return parsedTorrent.infoHash;
  }

}
