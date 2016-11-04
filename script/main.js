var map;
var poly;
var infoWindow = null;
var GatesArray = [];
var markerArray = [];
var jsonpath = new Array;
var Positions = new Array;
var setNewPath = false;
var bounds = null;
var WaypointCounter = 0;

// Initialize the app
function initMap() {
    var mapOptions = {
        zoom: 3,
        center: new google.maps.LatLng(6.0, 0.0),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var polyOptions = {
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    };
    poly = new google.maps.Polyline(polyOptions);
    poly.setMap(map);

    google.maps.event.addListener(map, 'click', function (event) {
        if (setNewPath == true) {
            placeMarker(event.latLng);
        }
    });

    bounds = new google.maps.LatLngBounds();
}


// Add the gates from BGL
function addGate(latitude, longitude, name) {
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var image = 'images/airport_1.png';
    var gate = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: name,
        icon: image,
        labelContent: name
    });

    google.maps.event.addListener(gate, 'dblclick', function () {
        setNewPath = true;
        var pbPath = poly.getPath();
        pbPath.push(myLatlng);
        Positions.push({
            latitude: myLatlng.lat(),
            longitude: myLatlng.lng(),
            seq: WaypointCounter++
        });

        createJson();
        markerArray.push(gate);

        if (typeof InfoWindow !== 'undefined') {
            InfoWindow.close();
        }
        InfoWindow = new google.maps.InfoWindow({
            content: name
        });

        InfoWindow.open(map, gate);
        document.all.gatename.innerHTML = name;
        map.panTo(gate.getPosition());
        map.setZoom(18);
    });

    GatesArray.push(gate);
}

// Add a taxiway as polyline to draw it on the map (BGL)
function addTaxiway(startLat, startLng, stopLat, stopLng) {
    var taxiwayCoordinates = [
        new google.maps.LatLng(startLat, startLng),
        new google.maps.LatLng(stopLat, stopLng)
    ];

    var taxiway = new google.maps.Polyline({
        path: taxiwayCoordinates,
        strokeColor: '#f4a460',
        strokeOpacity: 0.7,
        strokeWeight: 1
    });

    var newPoint = new google.maps.LatLng(startLat, startLng);
    bounds.extend(newPoint);

    taxiway.setMap(map);
}

// Fit the map to the drawed markers
function FitToBounce() {
    map.fitBounds(bounds);
}

// Add a new pushbackpoint
function placeMarker(location) {
    var pbPath = poly.getPath();
    pbPath.push(location);

    var marker = new google.maps.Marker({
        position: location,
        animation: google.maps.Animation.DROP,
        map: map,
        draggable: true,
        title: String(WaypointCounter++)
    });

    // When dragged renew the json
    google.maps.event.addListener(marker, 'dragend', function () {
        renewPath();
    });

    markerArray.push(marker);
    renewPath();
}

function renewPath() {
    WaypointCounter = 1;
    jsonpath.length = 0;
    Positions.length = 0;

    poly.setMap(null);
    var polyOptions = {
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    };

    poly = new google.maps.Polyline(polyOptions);
    poly.setMap(map);
    var pbPath = poly.getPath();


    for (var i = 0; i < markerArray.length; i++) {
        Positions.push({

            latitude: markerArray[i].getPosition().lat(),
            longitude: markerArray[i].getPosition().lng(),
            seq: WaypointCounter++

        });


        pbPath.push(markerArray[i].getPosition());
    }

    createJson();
}

// Create a JSON string
function createJson() {
    jsonpath.push({
        Position: {
            Positions
        }
    });
    var jsonString = JSON.stringify(jsonpath);
    document.all.json.innerHTML = jsonString;
}
