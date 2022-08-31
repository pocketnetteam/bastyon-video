import { Component, OnInit, ViewChild } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref'

@Component({
  selector: 'my-list-videos-modal',
  templateUrl: './list-videos-modal.component.html',
  styleUrls: [ './list-videos-modal.component.scss' ]
})
export class ListVideosModalComponent implements OnInit {

  @ViewChild('modal', { static: true }) modal: NgbModal

  private openedModal: NgbModalRef

  public gbRun: any;

  constructor (
    private modalService: NgbModal
  ) {}

  ngOnInit () {

  }

  show (gbRun: any) {

    this.gbRun = gbRun;

    this.openedModal = this.modalService.open(this.modal, { centered: true, keyboard: false })
    this.openedModal.shown.subscribe(() => {
      
    });
  }

  hide () {
    this.openedModal.close()
    this.openedModal = null
  }

}
