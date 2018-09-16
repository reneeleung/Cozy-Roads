## Cozy-Roads - Hack The North 2018 

Our application can be found at: https://htn18-216503.firebaseapp.com

### Description
This is a crowd-source application using Google Map API and Firebase. People with authorized account can mark dangerous events happened.

Everyone using this application can find the safest route from point A to point B based on the dangerous events recorded.

### To develop the application offline:
* (Install node/npm)[https://nodejs.org/en/download/]
* (Install Firebase)[https://firebase.google.com/docs/auth/web/start]

```sh
firebase init
firebase login
```

* Change the authentication in `<header></header>` to the authentication of your app
```sh
firebase use --add
firebase serve 
open localhost:5000
```
