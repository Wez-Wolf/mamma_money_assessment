import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router'; 
import { JSONParse } from '@utils/json-parse';
import { BrazeParsedExtra,BrazePushNotification,BrazePushNotificationData } from '@models/braze/braze-push-notification';
import { PushNotifications,ActionPerformed } from '@capacitor/push-notifications';
import { InboxStateService } from './inbox-state.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly inboxState = inject(InboxStateService);
  private readonly router = inject(Router);  

  init() {
    PushNotifications.addListener('registration', (token) => {
      console.log('~ PushNotificationService ~ token:', token); //good for sending to server
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: BrazePushNotification) => {         
        
        console.log('~ PushNotificationService ~ notification:', notification); //good for seeing when notification is received while app is open
       const data = notification?.data as BrazePushNotificationData;                                         
       if (!data?.extra) return;                                                           
                                                                                           
       const extras = JSONParse<BrazeParsedExtra>(data.extra);                             
       if (extras?.type === 'inbox') {
         if (data.ab_cd) {
           const cardData = JSONParse<Record<string, unknown>>(data.ab_cd);
           if (cardData) this.inboxState.addCardFromPush(cardData);
         } else {
           this.inboxState.refreshCards();
         }
       }                                                                                   
     }
    );

    PushNotifications.addListener(                                                          
     'pushNotificationActionPerformed',                                                    
     (notification: ActionPerformed) => {                                                  
       const data = notification.notification.data as BrazePushNotificationData;           
       if (!data?.extra) return;                                                           
                                                                                           
       const extras = JSONParse<BrazeParsedExtra>(data.extra);                             
       if (extras?.type === 'inbox') {                                                     
         this.inboxState.refreshCards();                                                   
         const url = data.uri || '/complete';                                              
         if (url.startsWith('http')) {                                                     
           window.open(url, '_blank');                                                     
         } else {                                                                          
           this.router.navigateByUrl(url);                                                 
         }                                                                                 
       }                                                                                   
     }                                                                                     
   );

    this.registerPush();
  }

  async registerPush(): Promise<void> {
    let pushReq = await PushNotifications.checkPermissions();

    if (pushReq.receive === 'prompt') {
      pushReq = await PushNotifications.requestPermissions();
    }

    if (pushReq.receive) {
      // Ask iOS user for permission/auto grant android permission
      await PushNotifications.register();
    }
  }
}
