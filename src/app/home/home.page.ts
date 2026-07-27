import { Component } from '@angular/core';
import { HeaderComponent } from '@components/header/header.component';
import { MmCardComponent } from '@components/mm-card/mm-card.component';
import { IonHeader, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  template: `<ion-header mode="ios" class="ion-no-border">
      <app-header [showInboxButton]="true"></app-header>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <app-mm-card title="Implementation Task">
        <p class="m-b-2">Implement functionality to send <strong>INBOX_MESSAGE_TEST</strong> custom event to Braze.</p>
        <p class="m-b-2">
          Braze will send a push notification back to inform the client that there is a new content card available.
        </p>
        <p><strong>Note:</strong> Push notifications may take awhile to arrive</p>
      </app-mm-card>

      <ion-button (click)="sendInboxTestEvent()" color="primary" expand="block" size="large" fill="solid" class="m-t-4">
        Send Test Event
      </ion-button>
    </ion-content> `,
  styles: [],
  standalone: true,
  imports: [IonHeader, IonContent, IonButton, HeaderComponent, MmCardComponent]
})
export class HomePage {
  sendInboxTestEvent(): void {
    // TODO: Log Braze custom event INBOX_MESSAGE_TEST to trigger an Inbox push notification and accompanying content card
  }
}
