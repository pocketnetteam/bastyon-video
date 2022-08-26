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
  public isFetchingHistory: boolean = false;
  // Current garbage collector state
  public currentGb: any;
  public fetchingCurrentGb: boolean = false;
  // Number of pages for the history
  public nbPages: number;
  // Current page number
  public currentPage: number = 0;

  // Internal variables
  private interval: any;
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
    this.fetchCurrentState();
    this.setIntervalFetch();
    this.fetchGbHistory();
  }

  setIntervalFetch() {
    if (this.interval)
      clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.fetchCurrentState();
    }, this.refreshTime);
  }

  fetchGbHistory() {
    if (this.isFetchingHistory)
      return;
    this.isFetchingHistory = true;
    this.garbageCollectorService.fetchGbHistory(this.currentPage).then(({ history, nbPages }) => {
      this.gbRuns = history;
      this.nbPages = nbPages;
      if (this.gbRuns && this.gbRuns.length <= 0 && this.currentPage > 0) {
        this.currentPage = 0;
        this.fetchGbHistory();
      }
    }, (err) => {
      this.gbRuns = null;
      this.hasError = true;
    }).finally(() => {
      this.isFetchingHistory = false;
    });
  }

  fetchCurrentState() {
    if (this.fetchingCurrentGb)
      return;
    this.fetchingCurrentGb = true;
    this.garbageCollectorService.fetchLatestGb().then(({ history, nbPages }) => {
      if (history && history.length > 0)
        this.currentGb = history[0];
        if (this.currentGb && this.currentGb.state != GarbageCollectorState.STARTED && this.currentPage == 0 && this.gbRuns != undefined) {
          if (this.gbRuns.length <= 0 || this.currentGb.id != this.gbRuns[0].id)
            this.gbRuns.unshift(this.currentGb);
          else if (this.currentGb.state != this.gbRuns[0].state)
            this.gbRuns[0] = this.currentGb;
        }
    }, (err) => {
      this.currentGb = null;
      this.hasError = true;
      clearInterval(this.interval);
    }).finally(() => {
      this.fetchingCurrentGb = false;
    });
  }

  executeGarbageCollector() {
    this.isExecuting = true;
    this.garbageCollectorService.triggerGarbageCollector().then(() => {}).finally(() => { });
    setTimeout(() => {
      this.isExecuting = false;
    }, this.refreshTime);
  }

  openModalListVideos(gbRun: any) {
    this.listVideosModal.show(gbRun);
  }

  changePage(pageChange: number) {
    this.currentPage += pageChange;
    this.currentPage = (this.currentPage < 0) ? 0 : this.currentPage;
    this.currentPage = (this.currentPage >= this.nbPages) ? this.nbPages - 1 : this.currentPage;
    this.fetchGbHistory();
  }

}
