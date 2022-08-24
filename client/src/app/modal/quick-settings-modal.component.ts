import { ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService, AuthStatus, LocalStorageService, User, UserService } from '@app/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref'

@Component({
  selector: 'my-quick-settings',
  templateUrl: './quick-settings-modal.component.html'
})
export class QuickSettingsModalComponent implements OnInit {
  private static readonly QUERY_MODAL_NAME = 'quick-settings'

  @ViewChild('modal', { static: true }) modal: NgbModal

  user: User
  userInformationLoaded = new ReplaySubject<boolean>(1)

  private openedModal: NgbModalRef

  constructor (
    private modalService: NgbModal,
    private userService: UserService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit () {
    this.user = this.userService.getAnonymousUser()
    this.localStorageService.watch()
      .subscribe({
        next: () => this.user = this.userService.getAnonymousUser()
      })

    this.userInformationLoaded.next(true)

    this.authService.loginChangedSource
      .pipe(filter(status => status !== AuthStatus.LoggedIn))
      .subscribe({
        next: () => {
          this.user = this.userService.getAnonymousUser()
          this.userInformationLoaded.next(true)
        }
      })

    this.route.queryParams.subscribe(params => {
      if (params['modal'] === QuickSettingsModalComponent.QUERY_MODAL_NAME) {
        this.openedModal = this.modalService.open(this.modal, { centered: true })

        this.openedModal.hidden.subscribe(() => this.setModalQuery('remove'))
      }
    })
  }

  isUserLoggedIn () {
    return this.authService.isLoggedIn()
  }

  show () {
    this.setModalQuery('add')
  }

  private setModalQuery (type: 'add' | 'remove') {
    const modal = type === 'add'
      ? QuickSettingsModalComponent.QUERY_MODAL_NAME
      : null

    this.router.navigate([], { queryParams: { modal }, queryParamsHandling: 'merge' })
  }
}
