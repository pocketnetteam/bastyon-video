import { STATIC_PATHS, WEBSERVER } from '@server/initializers/constants'
import { join } from 'path'
import { AllowNull, Column, CreatedAt, Model, Table, PrimaryKey, DataType, Default, IsUUID } from 'sequelize-typescript'

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
    { fields: [ 'extname' ] }
  ]
})
export class ImageModel extends Model {

  @PrimaryKey
  @AllowNull(false)
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
  
}
