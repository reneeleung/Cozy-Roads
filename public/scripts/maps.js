/**
* Reference to Firebase database.
* @const
*/
initApp = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var uid = user.uid;
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;
      // user.getIdToken().then(function(accessToken) {
      //   document.getElementById('account-details').textContent = JSON.stringify({
      //     displayName: displayName,
      //     email: email,
      //     emailVerified: emailVerified,
      //     phoneNumber: phoneNumber,
      //     photoURL: photoURL,
      //     uid: uid,
      //     accessToken: accessToken,
      //     providerData: providerData
      //   }, null, '  ');
      // });
    }
  }, function(error) {
    console.log(error);
  });
};

window.addEventListener('load', function() {
  initApp()
});


/**
* Data object to be written to Firebase.
*/
var data = {
  sender: null,
  timestamp: null,
  lat: null,
  lng: null
};

function makeInfoBox(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '2px';
  controlUI.style.marginBottom = '22px';
  controlUI.style.marginTop = '10px';
  controlUI.style.textAlign = 'center';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '100%';
  controlText.style.padding = '6px';
  //controlText.textContent = 'The map shows all clicks made in the last 10 minutes.';
  controlUI.appendChild(controlText);
}

function makeControlMarkers(controlTrashMarkers, map) {
  controlTrashMarkers.style.cursor = 'pointer';
  controlTrashMarkers.style.backgroundImage = "url(./img/trash.png)";
  controlTrashMarkers.style.backgroundSize = 'contain';
  controlTrashMarkers.style.height = '50px';
  controlTrashMarkers.style.width = '50px';
  controlTrashMarkers.style.top = '11px';
  controlTrashMarkers.style.left = '150px';
  controlTrashMarkers.title = 'Click to remove my markers';
}

/**
* Starting point for running the program. Authenticates the user.
* @param {function()} onAuthSuccess - Called when authentication succeeds.
*/
function initAuthentication(onAuthSuccess) {
  // Temporarily disabled; we want to make sure we're not overwriting
  // a signed in user with an anonymous user
  firebase.auth().onAuthStateChanged(user => {
    if (user == null) {
    firebase.auth().signInAnonymously().then(function(authData) {
      data.sender = authData.user.uid;
      myuid = data.sender;
      onAuthSuccess();
    }, function(error) {
      console.log('Login Failed!', error);
    })   // Users will get a new id for every session.
  } else {
    onAuthSuccess();
  }
  });
}





/**
 * Creates a map object with a click listener and a heatmap.
 */
 // Returns true if a user is signed-in.
 function isUserSignedIn() {
   var user = firebase.auth().currentUser;
   console.log(user || "not logged in");
   return !!user && !user.isAnonymous;
 }

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 3,
    styles: [{
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off POI.
    },
    {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus, train stations etc.
    }],
    disableDoubleClickZoom: true,
    streetViewControl: false,
  });

  new AutocompleteDirectionsHandler(map);

  // Create the DIV to hold the control and call the makeInfoBox() constructor
  // passing in this DIV.
  /*var infoBoxDiv = document.createElement('div');
  makeInfoBox(infoBoxDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);*/


  // Create the removeMarkers control
  var controlTrashMarkers = document.createElement('div');
  makeControlMarkers(controlTrashMarkers, map);
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(controlTrashMarkers);

  controlTrashMarkers.addEventListener('click', function() {
    removeMarkers();
  });

  // Listen for clicks and add the location of the click to firebase.
  map.addListener('click', function(e) {
     if(isUserSignedIn()) {
       // alert("User is signed in")
       data.lat = e.latLng.lat();
       data.lng = e.latLng.lng();
       addToFirebase(data);
     }
  });

 // Create a heatmap.
 var heatmap = new google.maps.visualization.HeatmapLayer({
   data: [],
   map: map,
   radius: 16
 });

  initAuthentication(initFirebase.bind(undefined, heatmap));
}

/* Autocomplete and Directions */
/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'WALKING';
  this.safetyMode = 'SAFE';
  var originInput = document.getElementById('origin-input');
  var destinationInput = document.getElementById('destination-input');
  var modeSelector = document.getElementById('mode-selector');
  var safetySelector = document.getElementById('safety-selector');
  this.directionsService = new google.maps.DirectionsService;
  this.directionsDisplays = [];

  var originAutocomplete = new google.maps.places.Autocomplete(
      originInput, {placeIdOnly: true});
  var destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput, {placeIdOnly: true});

  this.setupClickListener('changemode-walking', 'WALKING');
  this.setupClickListener('changemode-transit', 'TRANSIT');
  this.setupClickListener('changemode-driving', 'DRIVING');

  this.setupSafeClickListener('changesafety-safe', 'SAFE');
  this.setupSafeClickListener('changesafety-verysafe', 'VERY SAFE');

  this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(safetySelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
  var radioButton = document.getElementById(id);
  var me = this;
  radioButton.addEventListener('click', function() {
    me.travelMode = mode;
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.setupSafeClickListener = function(id, safety) {
  var radioButton = document.getElementById(id);
  var me = this;
  radioButton.addEventListener('click', function() {
    me.safetyMode = safety;
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', this.map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      window.alert("Please select an option from the dropdown list.");
      return;
    }
    if (mode === 'ORIG') {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });

};

AutocompleteDirectionsHandler.prototype.route = function() {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;

  this.directionsService.route({
    origin: {'placeId': this.originPlaceId},
    destination: {'placeId': this.destinationPlaceId},
    provideRouteAlternatives: true,
    travelMode: this.travelMode
  }, function(response, status) {
    if (status === 'OK') {
      me.directionsDisplays.forEach(direction => {
        direction.setMap(null);
      });
      me.directionsDisplays = [];
      //me.directionsDisplay.setDirections(response);
      //console.log(response.routes.length);
      //show all alternative routes
      var isLocationOnEdge = google.maps.geometry.poly.isLocationOnEdge;
      //loop through all dangerous points
      var ref = firebase.database().ref('clicks');

       for (var i = 0, len = response.routes.length; i < len; ++i) {
         var dangerous_path = false;
         ref.once('value', function(snapshot) {
           snapshot.forEach(function(childSnapshot) {
             var childData = childSnapshot.val();
             var point = new google.maps.LatLng(childData.lat, childData.lng);
             //var path = response.routes[i].legs;
             var path = response.routes[i].overview_path;
             var polyline = new google.maps.Polyline({
               path: path
             })
             if (me.safetyMode == "SAFE" && isLocationOnEdge(point,polyline,13e-5)) {
               dangerous_path = true;
             } else if (me.safetyMode == "VERY SAFE" && isLocationOnEdge(point,polyline,1e-3)) {
               dangerous_path = true;
             }
           });
         });
         if (!dangerous_path) {
           var newDirectionsRenderer = new google.maps.DirectionsRenderer({
             map: me.map,
             directions: response,
             routeIndex: i
           });
           console.log("printed non-dangerous route");
           me.directionsDisplays.push(newDirectionsRenderer);
           showSteps(response,i);
           //onsole.log("added new renderer to displays array");
         } else {
           console.log("dangerous route!");
         }
       }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};

function showSteps(directionResult, route) {
    var myRoute = directionResult.routes[route].legs[0];
    console.log(myRoute.steps.length);
    var instructionsEl = document.getElementById('instructions');
    instructionsEl.innerHTML = "";
    var heading = document.createElement('div');
    heading.style.fontSize = "12px";
    heading.innerHTML = myRoute.duration.text;
    heading.innerHTML +=myRoute.distance.text;
    instructionsEl.appendChild(heading);
    for (var i = 0; i < myRoute.steps.length; i++) {
        var instruction = document.createElement('div');
        instruction.innerHTML = myRoute.steps[i].instructions;
        instructionsEl.appendChild(instruction);
        console.log(myRoute.steps[i].instructions);
    }
    console.log(myRoute.distance.text);
}

/**
 * Set up a Firebase with deletion on clicks older than expirySeconds
 * @param {!google.maps.visualization.HeatmapLayer} heatmap The heatmap to
 * which points are added from Firebase.
 */
function initFirebase(heatmap) {

  // 10 minutes before current time.
  //var startTime = new Date().getTime() - (60 * 10 * 1000);

  // Reference to the clicks in Firebase.
  var clicks = firebase.database().ref('clicks');

  // Listener for when a click is added.
  //clicks.orderByChild('timestamp').startAt(startTime).on('child_added',
  clicks.on('child_added',
    function(snapshot) {

      // Get that click from firebase.
      var newPosition = snapshot.val();
      var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
      //var elapsed = new Date().getTime() - newPosition.timestamp;
      // Add the point to  the heatmap.
      heatmap.getData().push(point);

      // Requests entries older than expiry time (10 minutes).
      /*var expirySeconds = Math.max(60 * 10 * 1000 - elapsed, 0);
      // Set client timeout to remove the point after a certain time.
      window.setTimeout(function() {
        // Delete the old point from the database.
        snapshot.ref().remove();
      }, expirySeconds);*/
    }
  );

  // Remove old data from the heatmap when a point is removed from firebase.
  clicks.on('child_removed', function(snapshot, prevChildKey) {
    var heatmapData = heatmap.getData();
    var i = 0;
    while (snapshot.val().lat != heatmapData.getAt(i).lat()
      || snapshot.val().lng != heatmapData.getAt(i).lng()) {
      i++;
    }
    heatmapData.removeAt(i);
  });
}

/**
 * Updates the last_message/ path with the current timestamp.
 * @param {function(Date)} addClick After the last message timestamp has been updated,
 *     this function is called with the current timestamp to add the
 *     click to the firebase.
 */
function getTimestamp(addClick) {
  // Reference to location for saving the last click time.
  var ref = firebase.database().ref('last_message/' + data.sender);

  ref.onDisconnect().remove();  // Delete reference from firebase on disconnect.

  // Set value to timestamp.
  ref.set(firebase.database.ServerValue.TIMESTAMP, function(err) {
    if (err) {  // Write to last message was unsuccessful.
      console.log(err);
    } else {  // Write to last message was successful.
      ref.once('value', function(snap) {
        addClick(snap.val());  // Add click with same timestamp.
      }, function(err) {
        console.warn(err);
      });
    }
  });
}

/**
 * Adds a click to firebase.
 * @param {Object} data The data to be added to firebase.
 *     It contains the lat, lng, sender and timestamp.
 */
function addToFirebase(data) {
  getTimestamp(function(timestamp) {
    // Add the new timestamp to the record data.
    data.timestamp = timestamp;
    var ref = firebase.database().ref('clicks').push(data, function(err) {
      if (err) {  // Data was not written to firebase.
        console.warn(err);
      }
    });
  });
}


function removeMarkers(){

 var ref = firebase.database().ref('clicks');
 ref.once('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();
    if (childData.sender == myuid) {
      //console.log("match sender");
      ref.child(childKey).remove();
    }
  });
});
}
