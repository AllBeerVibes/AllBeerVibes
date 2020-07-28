
  // This example adds a search box to a map, using the Google Place Autocomplete
  // feature. People can enter geographical searches. The search box will return a
  // pick list containing a mix of places and predicted search terms.
  // This example requires the Places library. Include the libraries=places
  // parameter when you first load the API. For example:
  // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
  let pos;
  let map;
  let bounds;
  let infoWindow;
  let currentInfoWindow;
  let service;
  let infoPane;

  function initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map = new google.maps.Map(document.getElementById('map'), {
          center: pos,
          zoom: 15,
          mapTypeId: "roadmap"
        });
  
        var input = document.getElementById("pac-input");
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input); // Bias the SearchBox results towards current map's viewport.
    
        map.addListener("bounds_changed", function() {
          searchBox.setBounds(map.getBounds());
          
        });
        var markers = []; // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
    
        searchBox.addListener("places_changed", function() {
          var places = searchBox.getPlaces();
             
          if (places.length == 0) {
            return;
          } // Clear out the old markers.
    
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = []; // For each place, get the icon, name and location.
    
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
    
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            }; // Create a marker for each place.
    
            markers.push(
              new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
              })
            );
    
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      });
    } else {
      pos = {
        lat: -33.8688,
        lng: 151.2195
      };
      map2 = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15,
        mapTypeId: "roadmap"
      });

      var input = document.getElementById("pac-input");
      var searchBox2 = new google.maps.places.SearchBox(input);
      map2.controls[google.maps.ControlPosition.TOP_LEFT].push(input); // Bias the SearchBox results towards current map's viewport.
  
      map2.addListener("bounds_changed", function() {
        searchBox2.setBounds(map.getBounds());
        
      });
      var markers2 = []; // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
  
      searchBox2.addListener("places_changed", function() {
        var places2 = searchBox.getPlaces();
           
        if (places2.length == 0) {
          return;
        } // Clear out the old markers.
  
        markers2.forEach(function(marker) {
          marker2.setMap(null);
        });
        markers2 = []; // For each place, get the icon, name and location.
  
        var bounds2 = new google.maps.LatLngBounds();
        places2.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
  
          var icon2 = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          }; // Create a marker for each place.
  
          markers2.push(
            new google.maps.Marker({
              map: map,
              icon: icon2,
              title: place.name,
              position: place.geometry.location
            })
          );
  
          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds2.union(place.geometry.viewport);
          } else {
            bounds2.extend(place.geometry.location);
          }
        });
        map2.fitBounds(bounds2);
      });
    }
    
    function getNearbyPlaces(position) {
      let request = {
          location: position,
          rankBy: google.maps.places.RankBy.DISTANCE,
          keyword: 'liquor'
          };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, nearbyCallback);
                }

    function nearbyCallback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
          createMarkers(results);
        }
      }

      function createMarkers(places) {
        places.forEach(place => {
          let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
          });
  
          // Add click listener to each marker
          google.maps.event.addListener(marker, 'click', () => {
            let request = {
              placeId: place.place_id,
              fields: ['name', 'formatted_address', 'geometry', 'rating',
                'website', 'photos']
            };
  
            /* Only fetch the details of a place when the user clicks on a marker.
             * If we fetch the details for all place results as soon as we get
             * the search response, we will hit API rate limits. */
            service.getDetails(request, (placeResult, status) => {
              showDetails(placeResult, marker, status)
            });
          });
  
          // Adjust the map bounds to include the location of this marker
          bounds.extend(place.geometry.location);
        });
        /* Once all the markers have been placed, adjust the bounds of the map to
         * show all the markers within the visible area. */
        map.fitBounds(bounds);
      }

}

