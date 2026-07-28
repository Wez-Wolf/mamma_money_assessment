import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationService } from '@services/push-notification.service';
import { InboxStateService } from '@services/inbox-state.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit {                                           
     private readonly inboxState = inject(InboxStateService);                              
                                                                                           
     constructor(private pushNotificationService: PushNotificationService) {               
       this.pushNotificationService.init();                                                
       this.inboxState.loadCachedCards();                                                  
     }

  ngOnInit(): void {
    setTimeout(() => {
      const el = document.getElementById('app-splash');
      if (el) {
        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
      }
    }, 2000);
  }
}
