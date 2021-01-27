import {
  Component,
  Input,
  EventEmitter,
  Output,
  ElementRef,
} from '@angular/core';
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {APIV3Service} from "core-app/modules/apiv3/api-v3.service";

@Component({
  selector: 'op-ium-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.sass'],
})
export class SummaryComponent {
  @Input('type') type:string = '';
  @Input('project') project:any = null;
  @Input('role') role:any = null;
  @Input('principal') principal:any = null;
  @Input('message') message:string = '';

  @Output('close') close = new EventEmitter<void>();
  @Output('back') back = new EventEmitter<void>();
  @Output() save = new EventEmitter();

  public get text() {
    return {
      title: this.I18n.t('js.invite_user_modal.title', {
        type: this.type,
        project: this.project,
        principal: this.principal,
      }),
      projectLabel: this.I18n.t('js.invite_user_modal.forms.project.label'),
      principalLabel: this.I18n.t('js.invite_user_modal.forms.principal.label'),
      roleLabel: this.I18n.t('js.invite_user_modal.forms.role.label'),
      messageLabel: this.I18n.t('js.invite_user_modal.forms.message.label'),
      backButton: this.I18n.t('js.invite_user_modal.back_button'),
      nextButton: this.I18n.t('js.invite_user_modal.summary.next_button', {
        type: this.type,
        principal: this.principal,
      }),
    };
  }

  constructor(
    readonly I18n:I18nService,
    readonly elementRef:ElementRef,
    readonly api:APIV3Service,
  ) {}

  async invite() {
    const principal = await (async () => {
      if (this.principal.id) {
        return this.principal;
      }

      switch (this.type) {
        case 'user':
          return this.api.users.post({
            email: this.principal.name,
            firstName: this.principal.email,
            status: 'invited',
          });
        //case 'group':
        default:
          return this.api.groups.post({ name: this.principal.name });
        /*
        case 'placeholder':
          return this.api.placeholders.post({ name: this.principal.name });
        */
      }
    })();

    return this.api.memberships.post({
      principal,
      project: this.project,
      roles: [this.role],
    });
  }

  async onSubmit($e:Event) {
    $e.preventDefault();

    this.save.emit({ principal: this.principal });
  }
}