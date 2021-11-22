import { AllowNull, Column, Default, Model, Table, DataType } from 'sequelize-typescript'
import fetch from 'node-fetch';
import { join } from 'path';
import { CONFIG } from '@server/initializers/config';

@Table({
  tableName: 'imageRedundancy',
  indexes: [
    { fields: [ 'actorUrl' ] },
    { fields: [ 'fromDate' ] }
  ]
})
export class ImageRedundancyModel extends Model {

  @AllowNull(false)
  @Column
  actorUrl: string

  @AllowNull(false)
  @Default(null)
  @Column(DataType.DATE)
  fromDate: Date

  // Return the imageRedundancy object for the actor defined by this URL
  static getImageRedundancyForActor (actorUrl: string) : Promise<[ImageRedundancyModel, boolean]> {
    const query = {
      where: {
        actorUrl: actorUrl
      },
      defaults: {
        fromDate: new Date(0)
      }
    }
    return ImageRedundancyModel.findOrCreate(query);
  }

  // Request the server to get a list of images ID using the imageRedundancy date
  static getImagesFromDate (imageRedundancy: ImageRedundancyModel) {
    // Prepare URL
    const url = new URL(join(imageRedundancy.actorUrl, 'api/v1/images'));
    // Set params
    url.search = new URLSearchParams({
      order: '-createdAt',
      limit: CONFIG.REDUNDANCY.IMAGES.NB_IMAGES_PER_REQ.toString(),
      createdAt: imageRedundancy.fromDate.toISOString()
    }).toString();
    return fetch(url);
  }

}