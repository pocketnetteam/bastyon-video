import memoizee from 'memoizee';
import { AllowNull, Column, CreatedAt, Default, Model, Table, PrimaryKey } from 'sequelize-typescript'
import { doesExist } from '../shared';
import {
  MEMOIZE_LENGTH,
  MEMOIZE_TTL
} from '../../initializers/constants'

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

}
