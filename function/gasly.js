const typical_fill = 50;
const typical_mileage = 10;
const gas_prices = new Map();

function handleDistances(distanceWithStopover, distanceWithoutStopover) {
  updatePrices();
  console.log("With stopover:", distanceWithStopover);
  console.log("Without stopover:", distanceWithoutStopover);
  console.log(
    ((distanceWithStopover - distanceWithoutStopover) /
      (typical_mileage * 1000) +
      typical_fill) *
      gas_prices.get("detour")
  );
  console.log(typical_fill * gas_prices.get("path"));
  if (gas_prices.get("path") < gas_prices.get("detour")) {
    console.log(
      "Gas station on path has cheaper gas at:",
      gas_prices.get("path")
    );
    return false;
  } else if (
    ((distanceWithStopover - distanceWithoutStopover) /
      (typical_mileage * 1000) +
      typical_fill) *
      gas_prices.get("detour") <
    typical_fill * gas_prices.get("path")
  ) {
    console.log("With detour has cheaper gas at:", gas_prices.get("detour"));
    return true;
  } else {
    console.log("No stopover has cheaper gas at:", gas_prices.get("path"));
    return false;
  }
}

// AMS Student Nest, University Boulevard, UBC, Vancouver, BC, Canada
// Almond Park, West 12th Avenue, Vancouver, BC, Canada
function updatePrices() {
  gas_prices.set("path", 155.9);
  gas_prices.set("detour", 160);
}

module.exports = { handleDistances };
