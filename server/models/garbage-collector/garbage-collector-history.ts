import { AllowNull, Column, CreatedAt, Model, Table, PrimaryKey, DataType, Default, Is, AutoIncrement, IsUUID } from 'sequelize-typescript'
import { GarbageCollectorState } from '@shared/models/server/garbage-collector.model';
import { throwIfNotValid } from '../utils';
import { isGarbageCollectorStateValid } from '@server/helpers/custom-validators/garbage-collector';

@Table({
  tableName: 'garbageCollector',
  indexes: [
    { fields: [ 'id' ], unique: true },
    { fields: [ 'state' ] },
    { fields: [ 'nbVideos' ] },
    { fields: [ 'error' ] },
    { fields: [ 'createdAt' ] },
    { fields: [ 'finishedOn' ] }
  ]
})
export class GarbageCollectorHistoryModel extends Model {

  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @Column(DataType.UUID)
  id: string

  @AllowNull(false)
  @Column
  progress: number

  @AllowNull(false)
  @Default(GarbageCollectorState.STARTED)
  @Is('GarbageCollectorState', value => throwIfNotValid(value, isGarbageCollectorStateValid, 'state'))
  @Column
  state: GarbageCollectorState

  @AllowNull(true)
  @Column
  nbVideos: number

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.STRING))
  videosUrls: string[]

  @AllowNull(true)
  @Column
  error: string

  @CreatedAt
  createdAt: Date

  @AllowNull(true)
  @Column
  finishedOn: Date

}
