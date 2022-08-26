import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../../environments/environment'

@Injectable()
export class GarbageCollectorService {

  static BASE_GARBAGE_COLLECTOR_HISTORY_URL = environment.apiUrl + '/api/v1/garbage-collector';

  static NB_ENTRIES_PER_PAGE = 10;

  constructor (
    private authHttp: HttpClient
  ) {
  }

  public async fetchLatestGb() {
    return new Promise((resolve, reject) => {
      // console.log("Fetching garbage state");
      this.authHttp.get(GarbageCollectorService.BASE_GARBAGE_COLLECTOR_HISTORY_URL + '?limit=1', {
        headers: { 'ignoreLoadingBar': 'true' },
      }).subscribe({
        error: (e) => reject(e),
        next: (res) => resolve(res)
      });
    });
  }

  public async fetchGbHistory(pageNumber = 0) {
    return new Promise((resolve, reject) => {
      // console.log("Fetching garbage state");
      const offset = GarbageCollectorService.NB_ENTRIES_PER_PAGE * pageNumber;
      this.authHttp.get(GarbageCollectorService.BASE_GARBAGE_COLLECTOR_HISTORY_URL + '?limit=' + GarbageCollectorService.NB_ENTRIES_PER_PAGE + '&offset=' + offset, {
        headers: { 'ignoreLoadingBar': 'true' },
      }).subscribe({
        error: (e) => reject(e),
        next: (res) => resolve(res)
      });
    });
  }

  public triggerGarbageCollector() {
    return new Promise((resolve, reject) => {
      this.authHttp.post(GarbageCollectorService.BASE_GARBAGE_COLLECTOR_HISTORY_URL + '/request', {}).subscribe({
        error: (e) => reject(e),
        next: (res) => resolve(res)
      });
    });
  }

}
