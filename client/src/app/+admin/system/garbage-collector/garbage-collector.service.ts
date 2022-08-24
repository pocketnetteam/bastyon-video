import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../../environments/environment'

@Injectable()
export class GarbageCollectorService {

  static BASE_GARBAGE_COLLECTOR_HISTORY_URL = environment.apiUrl + '/api/v1/garbage-collector'

  constructor (
    private authHttp: HttpClient
  ) {
  }

  public async fetchGbHistory() {
    return new Promise((resolve, reject) => {
      console.log("Fetching garbage state");
      this.authHttp.get(GarbageCollectorService.BASE_GARBAGE_COLLECTOR_HISTORY_URL, {
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
