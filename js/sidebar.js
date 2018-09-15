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