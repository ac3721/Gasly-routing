const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = 8080;
const urlencodedParser = bodyParser.urlencoded({extended: true});

// const STOPOVER = {
//   // placeId: "ChIJ8dmUZKhzhlQRyhPJRuvlaWk"
//   latLng: { latitude: 49.25768634752348, longitude: -123.16725558491186 }
// };
const STOPOVER = {
  latLng: { 
    latitude: 49.25768634752348,
    longitude: -123.16725558491186
  }
};

async function computeRoute(origin, destination, withStopover = false) {
  const request = {
    origin,
    destination,
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_UNAWARE",
    routeModifiers: { avoidTolls: true, avoidFerries: true }
  };
  
  if (withStopover) {
    request.intermediates = [{ location: STOPOVER }];
  }

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": "AIzaSyAeCfwA9OHLveBZB2p3Z-9sHMV3wS1eZDo",
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline"
    },
    body: JSON.stringify(request)
  });
  return response.json();
}

function main() {
  app.use('/', express.static('public'));
  app.use(urlencodedParser);
  app.use(express.json());

  app.post('/request-routes', async (req, res) => {  // Changed endpoint
    try {
      const origin = req.body.origin;
      const destination = req.body.destination;

      // Compute BOTH routes
      const [withStopover, withoutStopover] = await Promise.all([
        computeRoute(origin, destination, true),
        computeRoute(origin, destination, false)
      ]);

      res.json({
        routeWithStopover: withStopover,
        routeWithoutStopover: withoutStopover,
        stopoverLocation: STOPOVER
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log('Press Ctrl+C to quit.');
  });
}

main();