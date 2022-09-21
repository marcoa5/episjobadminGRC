const { environment } = require("./environments/environment");

importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-messaging.js');

firebase.initializeApp(environment.firebase);
  const messaging = firebase.messaging()
  var url=''
  self.addEventListener('notificationclick', function(event) {
    event.notification.close()
    var promise=new Promise(function(resolve){
      setTimeout(resolve,500)
    }).then(function(){
      clients.openWindow('./' + url)
    })
    event.waitUntil(promise)
  })

  if (firebase.messaging.isSupported()){
    messaging.onBackgroundMessage((payload) => {
      if(payload.data.type=='general'){
        url = 'notif'
        const notificationTitle = (payload.data.count=='1'? '1 new notification' : payload.data.count + ' new notifications');
        const notificationOptions = {
          body: payload.data.text,
          badge: 'https://raw.githubusercontent.com/marcoa5/episjobadmingrc/master/src/assets/icons/logo.png',
          icon: 'https://raw.githubusercontent.com/marcoa5/episjobadmingrc/master/src/assets/icons/logo.png',
          tag: 'not',
          requireInteraction: true
        };      
        self.registration.showNotification(notificationTitle, notificationOptions)
      }

      if(payload.data.type=='sj'){
        url='files'
        const notificationTitle = 'New Service Job';
        const notificationOptions = {
        body: payload.data.info,
          badge: 'https://raw.githubusercontent.com/marcoa5/episjobadmingrc/master/src/assets/icons/logo.png',
          icon: 'https://raw.githubusercontent.com/marcoa5/episjobadmingrc/master/src/assets/icons/logo.png',
          //tag: payload.data.title.substring(0,9)=='New Visit'? 'visit' : 'sj',
          requireInteraction: true
        };      
      return self.registration.showNotification(notificationTitle, notificationOptions)
      }
      
    })

    
  }
  
    

  