// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
let pos;
let map;
let bounds;
let service;
let infoWindow;
let currentInfoWindow;

function initMap() {
  var geocoder = new google.maps.Geocoder();
  var bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  //Checks if the user has valid geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map = new google.maps.Map(document.getElementById("map"), {
        center: pos,
        zoom: 15,
        mapTypeId: "roadmap",
      });

      var input = document.getElementById("pac-input");
      var searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input); // Bias the SearchBox results towards current map's viewport.

      map.addListener("bounds_changed", function () {
        searchBox.setBounds(map.getBounds());
      });
      
      searchBox.addListener("places_changed", function () {
        var places = searchBox.getPlaces();
    
        places.forEach(function (place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });        
        //getNearbyPlaces(pos);
      });
      getNearbyPlaces(pos);
    }, () => {
      // Browser supports geolocation, but user has denied permission
      handleLocationError(true, infoWindow);
    });
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false, infoWindow);
  }

  function getNearbyPlaces(position) {
    let request = {
      location: position,
      rankBy: google.maps.places.RankBy.DISTANCE,
      keyword: "(pub) or (liquor)",
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback);
  }

  // Handle the results (up to 20) of the Nearby Search
  function nearbyCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMarkers(results);
    }
  }

  function createMarkers(places) {
    places.forEach((place) => {
      let marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
      });

      // Add click listener to each marker
      google.maps.event.addListener(marker, "click", () => {
        let request = {
          placeId: place.place_id,
          fields: [
            "name",
            "formatted_address",
            "geometry",
            "rating",
            "website",
            "photos",
          ],
        };

        /* Only fetch the details of a place when the user clicks on a marker.
         * If we fetch the details for all place results as soon as we get
         * the search response, we will hit API rate limits. */
        service.getDetails(request, (placeResult, status) => {
          showDetails(placeResult, marker, status);
        });
      });

      // Adjust the map bounds to include the location of this marker
      bounds.extend(place.geometry.location);
    });
    /* Once all the markers have been placed, adjust the bounds of the map to
     * show all the markers within the visible area. */
    map.fitBounds(bounds);
  }

  function showDetails(placeResult, marker, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      let placeInfowindow = new google.maps.InfoWindow();
      let rating = "None";
      if (placeResult.rating) rating = placeResult.rating;
      placeInfowindow.setContent(
        "<div><strong>" +
          placeResult.name +
          "</strong><br>" +
          "Rating: " +
          rating +
          "<br>Address: " +
          placeResult.formatted_address +
          "<br>Website: " +
          placeResult.website +
          "</div>"
      );
      placeInfowindow.open(marker.map, marker);
      currentInfoWindow.close();
      currentInfoWindow = placeInfowindow;
    } else {
      console.log("showDetails failed: " + status);
    }
  }

  // Handle a geolocation error
  function handleLocationError(browserHasGeolocation, infoWindow) {
    // Set default location to Sydney, Australia
    pos = { lat: -33.856, lng: 151.215 };
    map = new google.maps.Map(document.getElementById("map"), {
      center: pos,
      zoom: 15,
    });

    // Display an InfoWindow at the map center
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Geolocation permissions denied. Using default location."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
    currentInfoWindow = infoWindow;
  }
}
