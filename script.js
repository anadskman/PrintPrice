const defaultValues = {
  weight: 85,
  hours: 4,
  minutes: 30,
  quantity: 1,
  spoolPrice: 22,
  spoolWeight: 1000,
  printerPower: 120,
  electricityPrice: 0.35,
  printerPrice: 300,
  printerLifetime: 3000,
  labourMinutes: 15,
  hourlyRate: 12,
  failureRate: 10,
  markup: 30
};

const inputIds = Object.keys(defaultValues);

const money = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2
});

function getNumber(id, minimum = 0) {
  const input = document.getElementById(id);
  const value = Number(input.value);

  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(minimum, value);
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function setBar(id, cost, totalCost) {
  let percentage = 0;

  if (totalCost > 0 && cost > 0) {
    percentage = Math.max(2, (cost / totalCost) * 100);
  }

  document.getElementById(id).style.width = `${Math.min(100, percentage)}%`;
}

function calculate() {
  const weight = getNumber("weight");
  const hours = getNumber("hours");
  const minutes = getNumber("minutes");
  const quantity = Math.max(1, Math.floor(getNumber("quantity", 1)));

  const spoolPrice = getNumber("spoolPrice");
  const spoolWeight = getNumber("spoolWeight", 1);
  const printerPower = getNumber("printerPower");
  const electricityPrice = getNumber("electricityPrice");
  const printerPrice = getNumber("printerPrice");
  const printerLifetime = getNumber("printerLifetime", 1);

  const labourMinutes = getNumber("labourMinutes");
  const hourlyRate = getNumber("hourlyRate");
  const failureRate = getNumber("failureRate");
  const markup = getNumber("markup");

  const printHours = hours + minutes / 60;

  const filamentPerPrint = weight * (spoolPrice / spoolWeight);

  const electricityPerPrint =
    printHours *
    (printerPower / 1000) *
    electricityPrice;

  const wearPerPrint =
    printHours *
    (printerPrice / printerLifetime);

  const labourPerPrint =
    (labourMinutes / 60) * hourlyRate;

  const baseCostPerPrint =
    filamentPerPrint +
    electricityPerPrint +
    wearPerPrint +
    labourPerPrint;

  const failurePerPrint = baseCostPerPrint * (failureRate / 100);
  const costPerPrint = baseCostPerPrint + failurePerPrint;

  const pricePerPrint = costPerPrint * (1 + markup / 100);

  const filamentCost = filamentPerPrint * quantity;
  const electricityCost = electricityPerPrint * quantity;
  const wearCost = wearPerPrint * quantity;
  const labourCost = labourPerPrint * quantity;
  const failureCost = failurePerPrint * quantity;

  const totalCost = costPerPrint * quantity;
  const totalPrice = pricePerPrint * quantity;
  const profit = totalPrice - totalCost;

  setText("totalPrice", money.format(totalPrice));
  setText("totalCost", money.format(totalCost));
  setText("profit", money.format(profit));
  setText("totalHours", `${printHours.toFixed(1)} hours`);

  let perPrintText = `${money.format(pricePerPrint)} per print`;

  if (quantity > 1) {
    perPrintText += ` × ${quantity}`;
  }

  setText("perPrintPrice", perPrintText);

  setText("filamentCost", money.format(filamentCost));
  setText("electricityCost", money.format(electricityCost));
  setText("wearCost", money.format(wearCost));
  setText("labourCost", money.format(labourCost));
  setText("failureCost", money.format(failureCost));

  setBar("filamentBar", filamentCost, totalCost);
  setBar("electricityBar", electricityCost, totalCost);
  setBar("wearBar", wearCost, totalCost);
  setBar("labourBar", labourCost, totalCost);
  setBar("failureBar", failureCost, totalCost);
}

function saveSettings() {
  const settings = {};

  inputIds.forEach((id) => {
    settings[id] = getNumber(id);
  });

  localStorage.setItem("printprice-settings", JSON.stringify(settings));

  const saveButton = document.getElementById("saveButton");
  const quoteStatus = document.getElementById("quoteStatus");
  saveButton.textContent = "Settings saved";
  quoteStatus.textContent = "RATES SAVED";

  setTimeout(() => {
    saveButton.textContent = "Save these settings";
    quoteStatus.textContent = "LIVE ESTIMATE";
  }, 1800);
}

function loadSettings() {
  const savedSettings = localStorage.getItem("printprice-settings");

  if (!savedSettings) {
    return;
  }

  try {
    const settings = JSON.parse(savedSettings);

    inputIds.forEach((id) => {
      if (settings[id] !== undefined) {
        document.getElementById(id).value = settings[id];
      }
    });
  } catch (error) {
    localStorage.removeItem("printprice-settings");
  }
}

function resetCalculator() {
  inputIds.forEach((id) => {
    document.getElementById(id).value = defaultValues[id];
  });

  localStorage.removeItem("printprice-settings");
  document.getElementById("saveButton").textContent = "Save these settings";

  calculate();
}

inputIds.forEach((id) => {
  document.getElementById(id).addEventListener("input", calculate);
});

document.getElementById("saveButton").addEventListener("click", saveSettings);
document.getElementById("resetButton").addEventListener("click", resetCalculator);

loadSettings();
calculate();
