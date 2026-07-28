import { AfterViewInit, Component, input, signal,effect,inject, computed } from '@angular/core';
import { IonButton, IonIcon, IonAccordion } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';
import anime, { AnimeInstance } from 'animejs';
import { ModalController } from '@ionic/angular/standalone';                                                                                                                                                                                                                 
import { InboxStateService } from '@services/inbox-state.service'; 

@Component({
  selector: 'app-inbox-button',
  template: `
    <div class="notification-button">
      @if (unreadMessages()) {
      <svg class="notification-button-unread" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
        <circle r="4.5" cx="5" cy="5" fill="red" />
      </svg>
      }
      <ion-button class="bell" [slot]="slot()" fill="clear" (click)="showInbox()">
        <ion-icon color="dark" slot="icon-only" name="notifications-outline"></ion-icon>
      </ion-button>
    </div>
  `,
  styles: [
    `
      ion-button {
        --padding-end: 0.5rem;
        --padding-start: 0.5rem;
        font-size: 1.75rem;
      }

      .notification-button {
        position: relative;
        svg {
          position: absolute;
          top: 30%;
          right: 25%;
          z-index: 99;
        }
      }
    `
  ],
  imports: [IonButton, IonIcon],
  standalone: true
})
export class InboxButtonComponent implements AfterViewInit {
  readonly slot = input<IonAccordion['toggleIconSlot']>();
  unreadMessages = computed(() => this.inboxState.unreadCount() > 0);
  private shakeAnimation?: AnimeInstance;
  private readonly modalCtrl = inject(ModalController);                                                                                                                                                                                                                        
  readonly inboxState = inject(InboxStateService);
  constructor() {
    addIcons({ notificationsOutline });
     effect(() => {                                                                                                                                                                                                        
       if (this.unreadMessages()) setTimeout(() => this.shakeAnimation?.restart(), 100);                                                                                                                                   
     }); 
  }

  async showInbox(): Promise<void> {                                                                                                                                                                                    
       const { InboxComponent } = await import('@components/inbox/inbox.component');                                                                                                                                       
       const modal = await this.modalCtrl.create({                                                                                                                                                                         
         component: InboxComponent,                                                                                                                                                                                        
         breakpoints: [0, 0.75, 1],                                                                                                                                                                                        
         initialBreakpoint: 1,                                                                                                                                                                                             
       });                                                                                                                                                                                                                 
       await modal.present();                                                                                                                                                                                              
     }                                                                                                                                                                                                                     
                                                                                                                            
  ngAfterViewInit(): void {
    this.shakeAnimation = anime({
      targets: '.bell',
      translateX: [
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: 0, duration: 50 }
      ],
      easing: 'easeInOutSine',
      duration: 2000,
      autoplay: false
    });
  }
}
