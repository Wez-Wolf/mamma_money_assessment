import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, closeCircleOutline, cashOutline } from 'ionicons/icons';
import { InboxStateService } from '@services/inbox-state.service';
import { BrazeContentCard } from '@models/braze/braze-content-card';
import { ImageLoaderComponent } from '@components/image-loader/image-loader.component';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { DateTimeStringPipe } from '@pipes/date-time-string.pipe';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    ImageLoaderComponent,
    SpinnerComponent,
    DateTimeStringPipe,
  ],
})
export class InboxComponent {
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  readonly inboxState = inject(InboxStateService);

  constructor() {
    addIcons({ closeOutline, closeCircleOutline, cashOutline });
  }

  /** Dismiss the modal and mark all unread cards as viewed. */
  dismiss(): void {
    for (const card of this.inboxState.cards()) {
      if (!card.viewed) this.inboxState.markAsViewed(card.id);
    }
    this.modalCtrl.dismiss();
  }

  /** Confirm then dismiss a card. */
  async confirmDismiss(card: BrazeContentCard): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Dismiss Message',
      message: 'Are you sure you want to dismiss this message?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Dismiss',
          handler: () => {
            this.inboxState.dismissCard(card.id);
          },
        },
      ],
    });
    await alert.present();
  }

  /** Tap a card — dismiss modal, mark read, log click, navigate. */
  async onCardTap(card: BrazeContentCard): Promise<void> {
    await this.modalCtrl.dismiss();
    this.inboxState.handleCardTap(card);
  }

  /** Log impression when card is visible in viewport. */
  onCardVisible(card: BrazeContentCard): void {
    if (!card.viewed) {
      this.inboxState.markAsViewed(card.id);
    }
    this.inboxState.logCardImpression(card.id);
  }

  /** Pull-to-refresh handler. */
  async doRefresh(event: Event): Promise<void> {
    this.inboxState.refreshCards();
    setTimeout(() => {
      (event.target as HTMLIonRefresherElement).complete();
    }, 1500);
  }

  /** Track card by id for ngFor optimization. */
  trackById(_index: number, card: BrazeContentCard): string {
    return card.id;
  }
}
