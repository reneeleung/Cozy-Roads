function htmlSidebarLoggedIn(user) {
    return '<h2> Welcome to your Cozy Roads Account!</h2> <h3> Profile </h3> <strong> Name: </strong> '
     + user.displayName + " <br><br> <strong> Email: </strong> " + user.email;
}

$(function () {
    // DOCUMENT READY

    // Check User Authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if(user) {
            // Setup the logged in screen information
            $(".logged-in").removeClass("hidden");
            $("#Statistics").html(htmlSidebarLoggedIn(user));
            $("#firebaseui-auth-container").addClass("hidden");
          
        }
        else {
          console.log("no user signed in")
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