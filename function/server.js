const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const port = 8080;
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const { handleDistances, updatePrices } = require("./gasly");

// const STOPOVER = {
//   // placeId: "ChIJ8dmUZKhzhlQRyhPJRuvlaWk"
//   latLng: { latitude: 49.25768634752348, longitude: -123.16725558491186 }
// };
const STOPOVER = {
  latLng: {
    latitude: 49.264300976364076,
    longitude: -123.16800106813271,
  },
};

async function computeRoute(origin, destination, withStopover = false) {
  const request = {
    origin,
    destination,
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_UNAWARE",
    routeModifiers: { avoidTolls: true, avoidFerries: true },
  };

  if (withStopover) {
    request.intermediates = [{ location: STOPOVER }];
  }

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "AIzaSyAeCfwA9OHLveBZB2p3Z-9sHMV3wS1eZDo",
        "X-Goog-FieldMask":
          "routes.distanceMeters,routes.duration,routes.polyline",
      },
      body: JSON.stringify(request),
    }
  );
  return response.json();
}

function main() {
  app.use("/", express.static("public"));
  app.use(urlencodedParser);
  app.use(express.json());

  app.post("/request-routes", async (req, res) => {
    try {
      const origin = req.body.origin;
      const destination = req.body.destination;

      const [withStopover, withoutStopover] = await Promise.all([
        computeRoute(origin, destination, true),
        computeRoute(origin, destination, false),
      ]);

      const distanceWithStopover =
        withStopover.routes && withStopover.routes[0]
          ? withStopover.routes[0].distanceMeters
          : null;

      const distanceWithoutStopover =
        withoutStopover.routes && withoutStopover.routes[0]
          ? withoutStopover.routes[0].distanceMeters
          : null;

      const useStopover = handleDistances(
        distanceWithStopover,
        distanceWithoutStopover
      );

      // Get gas prices from gasly module
      const { getGasPrices } = require("./gasly");
      const gasPrices = getGasPrices();

      res.json({
        routeWithStopover: withStopover,
        routeWithoutStopover: withoutStopover,
        stopoverLocation: STOPOVER,
        distanceWithStopover,
        distanceWithoutStopover,
        useStopover,
        gasPrice: gasPrices.detour,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/update-data", async (req, res) => {
    try {
      console.log("Calling Python Flask API to capture and scan...");

      // Call Python Flask API
      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("Python API response:", data);

      if (data.success && data.number) {
        // Update prices with the scanned number
        const scannedPrice = parseFloat(data.number);
        updatePrices((detourPrice = scannedPrice));

        res.json({
          success: true,
          number: data.number,
          confidence: data.confidence,
          message: "Price updated successfully",
        });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error("Error calling Python API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log("Press Ctrl+C to quit.");
  });
}

main();
