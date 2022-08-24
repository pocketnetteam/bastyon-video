import { SortMeta } from 'primeng/api'
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Notifier, RestPagination, RestTable } from '@app/core'
import { peertubeLocalStorage } from '@root-helpers/peertube-web-storage'
import { GarbageCollectorState, Job, JobState, JobType } from '@shared/models'
import { JobStateClient } from '../../../../types/job-state-client.type'
import { JobTypeClient } from '../../../../types/job-type-client.type'
import { GarbageCollectorService } from './garbage-collector.service'
import { ListVideosModalComponent } from './list-videos-modal/list-videos-modal.component'

@Component({
  selector: 'garbage-collector',
  templateUrl: './garbage-collector.component.html',
  styleUrls: [ './garbage-collector.component.scss' ]
})
export class GarbageCollectorComponent implements OnInit, OnDestroy {
  
  // Number of milliseconds to refresh UI
  private refreshTime: number = 5000;

  // List of garbage collector runs
  public gbRuns: any[];

  // Internal variables
  private interval: any;
  private isRequesting: boolean = false;
  private isTriggering: boolean = false;
  public isExecuting: boolean = false;
  public hasError: boolean = false;

  public garbageCollectorRunningState = GarbageCollectorState.STARTED;
  public garbageCollectorCompleteState = GarbageCollectorState.COMPLETED;
  public garbageCollectorFailedState = GarbageCollectorState.FAILED;
  public GARBAGE_COLLECTOR_STATES: { [ id in GarbageCollectorState ]: string } = {
    [GarbageCollectorState.STARTED]: 'Running',
    [GarbageCollectorState.COMPLETED]: 'Completed',
    [GarbageCollectorState.FAILED]: 'Failed'
  };

  @ViewChild('listVideosModal', { static: true }) listVideosModal: ListVideosModalComponent

  constructor (
    // private notifier: Notifier,
    private garbageCollectorService: GarbageCollectorService
  ) {
  }

  getIdentifier() {
    return 'GarbageCollectorComponent'
  }

  ngOnDestroy() {
    if (this.interval)
      clearInterval(this.interval);
  }

  ngOnInit() {
    this.interval = setInterval(() => {
      this.fetchGbHistory();
    }, this.refreshTime);
    this.fetchGbHistory();
  }

  fetchGbHistory() {
    if (this.isRequesting)
      return;
    this.isRequesting = true;
    this.garbageCollectorService.fetchGbHistory().then((gbRuns: any[]) => {
      this.gbRuns = gbRuns;
    }, (err) => {
      this.gbRuns = null;
      this.hasError = true;
      clearInterval(this.interval);
    }).finally(() => {
      this.isRequesting = false;
      if (!this.isTriggering)
        this.isExecuting = false;
    });
  }

  executeGarbageCollector() {
    if (this.isTriggering)
      return;
    this.isTriggering = true;
    this.isExecuting = true;
    this.garbageCollectorService.triggerGarbageCollector().then(() => {

    }).finally(() => {
      this.isTriggering = false;
    });
  }

  openModalListVideos(gbRun: any) {
    this.listVideosModal.show(gbRun);
  }

}
