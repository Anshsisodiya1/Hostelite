importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDLwovaug32h6rRy0LckbRXUy0tcwH0Yao",
  authDomain: "hostelite-2585a.firebaseapp.com",
  projectId: "hostelite-2585a",
  messagingSenderId: "673206820752",
  appId: "1:673206820752:web:bd2fbcfcd1a3101a11dd15",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});