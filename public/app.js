let routeWithStopoverPolyline = null;
let routeWithoutStopoverPolyline = null;

async function requestRoutes() {
    console.log('🔍 Routes...');
    
    const originPlaceId = document.getElementById('origin-place-id').value;
    const destPlaceId = document.getElementById('destination-place-id').value;
    
    if (!originPlaceId || !destPlaceId) {
        alert('Select addresses from dropdowns');
        return;
    }

    clearMap();

    try {
        const response = await fetch('/request-routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: { placeId: originPlaceId },
                destination: { placeId: destPlaceId }
            })
        });
        
        const data = await response.json();
        console.log('🔍 FULL RESPONSE:', data);

        // ✅ DEBUG: Check both routes
        console.log('Without stopover:', data.routeWithoutStopover?.routes?.[0]);
        console.log('With stopover:', data.routeWithStopover?.routes?.[0]);

        // Blue: Direct
        if (data.routeWithoutStopover?.routes?.[0]?.polyline?.encodedPolyline) {
            const path = google.maps.geometry.encoding.decodePath(
                data.routeWithoutStopover.routes[0].polyline.encodedPolyline
            );
            routeWithoutStopoverPolyline = new google.maps.Polyline({
                path: path,
                strokeColor: '#0000FF',
                strokeOpacity: 0.8,
                strokeWeight: 5,
                map: window.map
            });
            console.log('✅ BLUE drawn');
        }

        // Red: Stopover  
        if (data.routeWithStopover?.routes?.[0]?.polyline?.encodedPolyline) {
            const path = google.maps.geometry.encoding.decodePath(
                data.routeWithStopover.routes[0].polyline.encodedPolyline
            );
            routeWithStopoverPolyline = new google.maps.Polyline({
                path: path,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 6,
                map: window.map
            });
            console.log('✅ RED drawn');
        }

        // Stopover marker
        if (data.stopoverLocation?.latLng?.latitude) {
            new google.maps.Marker({
                position: {
                    lat: data.stopoverLocation.latLng.latitude,
                    lng: data.stopoverLocation.latLng.longitude
                },
                map: window.map,
                icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

function clearMap() {
    if (routeWithStopoverPolyline) {
        routeWithStopoverPolyline.setMap(null);
        routeWithStopoverPolyline = null;
    }
    if (routeWithoutStopoverPolyline) {
        routeWithoutStopoverPolyline.setMap(null);
        routeWithoutStopoverPolyline = null;
    }
}
