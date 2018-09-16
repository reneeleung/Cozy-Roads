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
      //   document.getElementById('sign-in-status').textContent = 'Signed in';
      //   document.getElementById('sign-in').textContent = 'Sign out';
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
  initApp();
});

function htmlSidebarLoggedIn(user) {
    return '<h2> Welcome to your Cozy Roads Account!</h2> <h3> Profile </h3> <strong> Name: </strong> '
     + user.displayName + " <br><br> <strong> Email: </strong> " + user.email;
}

function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

document.addEventListener("DOMContentLoaded", function(event) {
    // DOCUMENT READY

    // Check User Authentication
    firebase.auth().onAuthStateChanged(function(user) {
      // debugger;
        if(user && user.email != null) {
            // Setup the logged in screen information
            $(".logged-in").removeClass("hidden");
            $("#Statistics").html(htmlSidebarLoggedIn(user));
            $("#firebaseui-auth-container").addClass("hidden");

        }
        else {
          console.log("no user signed in");
        }
    });

    /*
    $("#map").on("click", function(e) {
        if (user) {
            // Yeah sure whatever
        }
        else {
            e.preventDefault()
        }
    })
    */
});

$("#show-sidebar").on("click", function () {
    // Resize map
    $("#map-container").removeClass("col-md-12");
    $("#map-container").addClass("col-md-8");

    // Show Sidebar
    $("#sidebar-container").removeClass("hidden");

    // Hide show sidebar button
    $("#show-sidebar").addClass("hidden");
});

$("#hide-sidebar").on("click", function () {
    // Hide sidebar
    $("#sidebar-container").addClass("hidden");

    // Resize map
    $("#map-container").removeClass("col-md-8");
    $("#map-container").addClass("col-md-12");

    // Unhide button Show-Sidebar
    $("#show-sidebar").removeClass("hidden");
});
