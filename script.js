"use strict";

const DEFAULT_VALUES = {
    printName: "",
    material: "PLA",
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

const NUMBER_INPUT_IDS = [
    "weight",
    "hours",
    "minutes",
    "quantity",
    "spoolPrice",
    "spoolWeight",
    "printerPower",
    "electricityPrice",
    "printerPrice",
    "printerLifetime",
    "labourMinutes",
    "hourlyRate",
    "failureRate",
    "markup"
];

const STORAGE_KEYS = {
    defaults: "printprice-defaults",
    history: "printprice-history",
    currency: "printprice-currency",
    theme: "printprice-theme"
};

const CURRENCY_LOCALES = {
    EUR: "en-IE",
    USD: "en-US",
    GBP: "en-GB",
    JPY: "ja-JP",
    CNY: "zh-CN",
    CAD: "en-CA",
    AUD: "en-AU",
    NZD: "en-NZ",
    CHF: "de-CH",
    INR: "en-IN"
};

const REGION_CURRENCIES = {
    IE: "EUR",
    AT: "EUR",
    BE: "EUR",
    HR: "EUR",
    CY: "EUR",
    EE: "EUR",
    FI: "EUR",
    FR: "EUR",
    DE: "EUR",
    GR: "EUR",
    IT: "EUR",
    LV: "EUR",
    LT: "EUR",
    LU: "EUR",
    MT: "EUR",
    NL: "EUR",
    PT: "EUR",
    SK: "EUR",
    SI: "EUR",
    ES: "EUR",
    US: "USD",
    GB: "GBP",
    JP: "JPY",
    CN: "CNY",
    CA: "CAD",
    AU: "AUD",
    NZ: "NZD",
    CH: "CHF",
    IN: "INR"
};

const calculator = document.getElementById("calculator");
const currencySelect = document.getElementById("currency");
const themeButton = document.getElementById("themeButton");
const saveDefaultsButton = document.getElementById("saveDefaultsButton");
const resetButton = document.getElementById("resetButton");
const saveCalculationButton = document.getElementById(
    "saveCalculationButton"
);
const copyButton = document.getElementById("copyButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const statusMessage = document.getElementById("statusMessage");

let currentCalculation = null;
let statusTimer;

function getStoredItem(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);

        if (item === null) {
            return fallback;
        }

        return JSON.parse(item);
    } catch (error) {
        return fallback;
    }
}

function setStoredItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        showStatus("Your browser would not allow this to be saved.", true);
        return false;
    }
}

function removeStoredItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
    }
}


function showStatus(message, isError = false) {
    clearTimeout(statusTimer);

    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);

    statusTimer = setTimeout(() => {
        statusMessage.textContent = "";
        statusMessage.classList.remove("error");
    }, 3500);
}


function detectCurrency() {
    try {
        const locale = new Intl.Locale(navigator.language);
        const region = locale.region;

        return REGION_CURRENCIES[region] || "EUR";
    } catch (error) {
        return "EUR";
    }
}

function getCurrency() {
    return currencySelect.value || "EUR";
}

function getCurrencyFormatter(currency = getCurrency()) {
    const locale = CURRENCY_LOCALES[currency] || navigator.language;

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "JPY" ? 0 : 2,
        maximumFractionDigits: currency === "JPY" ? 0 : 2
    });
}

function formatMoney(value, currency = getCurrency()) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return getCurrencyFormatter(currency).format(safeValue);
}

function getCurrencySymbol(currency = getCurrency()) {
    const parts = getCurrencyFormatter(currency).formatToParts(0);
    const currencyPart = parts.find((part) => part.type === "currency");

    return currencyPart ? currencyPart.value : currency;
}

function updateCurrencyUnits() {
    const currency = getCurrency();
    const symbol = getCurrencySymbol(currency);

    document.querySelectorAll("[data-currency-unit]").forEach((element) => {
        element.textContent = symbol;
    });

    document.querySelectorAll("[data-electricity-unit]").forEach((element) => {
        element.textContent = `${symbol}/kWh`;
    });

    document.querySelectorAll("[data-hourly-unit]").forEach((element) => {
        element.textContent = `${symbol}/hr`;
    });
}

function setStartingCurrency() {
    const savedCurrency = getStoredItem(STORAGE_KEYS.currency);
    const detectedCurrency = detectCurrency();
    const wantedCurrency = savedCurrency || detectedCurrency;

    const supported = Array.from(currencySelect.options).some(
        (option) => option.value === wantedCurrency
    );

    currencySelect.value = supported ? wantedCurrency : "EUR";
    updateCurrencyUnits();
}


function applyTheme(theme) {
    const safeTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = safeTheme;
    themeButton.setAttribute(
        "aria-pressed",
        safeTheme === "dark" ? "true" : "false"
    );

    themeButton.textContent =
        safeTheme === "dark" ? "Light mode" : "Dark mode";

    const themeColour = document.querySelector('meta[name="theme-color"]');

    if (themeColour) {
        themeColour.content = safeTheme === "dark" ? "#121212" : "#ffffff";
    }
}

function setStartingTheme() {
    const savedTheme = getStoredItem(STORAGE_KEYS.theme);

    if (savedTheme) {
        applyTheme(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(newTheme);
    setStoredItem(STORAGE_KEYS.theme, newTheme);
}

function getNumber(id) {
    const input = document.getElementById(id);
    let value = Number(input.value);

    if (!Number.isFinite(value)) {
        value = 0;
    }

    const minimum =
        input.min !== "" && Number.isFinite(Number(input.min))
            ? Number(input.min)
            : 0;

    const maximum =
        input.max !== "" && Number.isFinite(Number(input.max))
            ? Number(input.max)
            : Number.MAX_SAFE_INTEGER;

    return Math.min(maximum, Math.max(minimum, value));
}

function getInputValues() {
    const values = {
        printName: document.getElementById("printName").value.trim(),
        material: document.getElementById("material").value
    };

    NUMBER_INPUT_IDS.forEach((id) => {
        values[id] = getNumber(id);
    });

    values.quantity = Math.max(1, Math.floor(values.quantity));
    values.hours = Math.floor(values.hours);
    values.minutes = Math.floor(values.minutes);

    return values;
}

function setInputValues(values) {
    const combinedValues = {
        ...DEFAULT_VALUES,
        ...values
    };

    document.getElementById("printName").value =
        combinedValues.printName || "";

    document.getElementById("material").value =
        combinedValues.material || "PLA";

    NUMBER_INPUT_IDS.forEach((id) => {
        document.getElementById(id).value = combinedValues[id];
    });
}

function validateInputs() {
    let valid = true;

    NUMBER_INPUT_IDS.forEach((id) => {
        const input = document.getElementById(id);
        const value = Number(input.value);
        const inputValid =
            input.value !== "" &&
            Number.isFinite(value) &&
            input.checkValidity();

        input.setAttribute("aria-invalid", inputValid ? "false" : "true");

        if (!inputValid) {
            valid = false;
        }
    });

    return valid;
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function setProgress(id, cost, totalCost) {
    const progress = document.getElementById(id);
    const percentage =
        totalCost > 0 ? Math.min(100, (cost / totalCost) * 100) : 0;

    progress.value = Number.isFinite(percentage) ? percentage : 0;
}

function formatNumber(value, maximumDecimals = 2) {
    return new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: maximumDecimals
    }).format(value);
}


function calculate() {
    const values = getInputValues();
    const currency = getCurrency();

    validateInputs();

    const printHours = values.hours + values.minutes / 60;

    const filamentPerPrint =
        values.weight * (values.spoolPrice / values.spoolWeight);

    const electricityPerPrint =
        printHours *
        (values.printerPower / 1000) *
        values.electricityPrice;

    const wearPerPrint =
        printHours *
        (values.printerPrice / values.printerLifetime);

    const labourPerPrint =
        (values.labourMinutes / 60) * values.hourlyRate;

    const baseCostPerPrint =
        filamentPerPrint +
        electricityPerPrint +
        wearPerPrint +
        labourPerPrint;

    const failurePerPrint =
        baseCostPerPrint * (values.failureRate / 100);

    const productionCostPerPrint =
        baseCostPerPrint + failurePerPrint;

    const profitPerPrint =
        productionCostPerPrint * (values.markup / 100);

    const suggestedPricePerPrint =
        productionCostPerPrint + profitPerPrint;

    const quantity = values.quantity;

    const costs = {
        filament: filamentPerPrint * quantity,
        electricity: electricityPerPrint * quantity,
        wear: wearPerPrint * quantity,
        labour: labourPerPrint * quantity,
        failure: failurePerPrint * quantity
    };

    const totalCost = productionCostPerPrint * quantity;
    const totalPrice = suggestedPricePerPrint * quantity;
    const totalProfit = profitPerPrint * quantity;

    currentCalculation = {
        values,
        currency,
        printHours,
        costs,
        productionCostPerPrint,
        suggestedPricePerPrint,
        totalCost,
        totalPrice,
        totalProfit
    };

    setText("totalPrice", formatMoney(totalPrice));
    setText(
        "perPrintPrice",
        `${formatMoney(suggestedPricePerPrint)} each`
    );

    setText("totalCost", formatMoney(totalCost));
    setText("profit", formatMoney(totalProfit));

    setText("filamentCost", formatMoney(costs.filament));
    setText("electricityCost", formatMoney(costs.electricity));
    setText("wearCost", formatMoney(costs.wear));
    setText("labourCost", formatMoney(costs.labour));
    setText("failureCost", formatMoney(costs.failure));

    setProgress("filamentBar", costs.filament, totalCost);
    setProgress("electricityBar", costs.electricity, totalCost);
    setProgress("wearBar", costs.wear, totalCost);
    setProgress("labourBar", costs.labour, totalCost);
    setProgress("failureBar", costs.failure, totalCost);

    setText(
        "filamentCalculation",
        `${formatNumber(values.weight)} g × ` +
        `(${formatMoney(values.spoolPrice)} ÷ ` +
        `${formatNumber(values.spoolWeight)} g) = ` +
        formatMoney(filamentPerPrint)
    );

    setText(
        "electricityCalculation",
        `${formatNumber(printHours)} hr × ` +
        `${formatNumber(values.printerPower / 1000, 3)} kW × ` +
        `${formatMoney(values.electricityPrice)}/kWh = ` +
        formatMoney(electricityPerPrint)
    );

    setText(
        "wearCalculation",
        `${formatNumber(printHours)} hr × ` +
        `(${formatMoney(values.printerPrice)} ÷ ` +
        `${formatNumber(values.printerLifetime)} hr) = ` +
        formatMoney(wearPerPrint)
    );

    setText(
        "labourCalculation",
        `${formatNumber(values.labourMinutes)} min ÷ 60 × ` +
        `${formatMoney(values.hourlyRate)}/hr = ` +
        formatMoney(labourPerPrint)
    );

    setText(
        "failureCalculation",
        `${formatMoney(baseCostPerPrint)} × ` +
        `${formatNumber(values.failureRate)}% = ` +
        formatMoney(failurePerPrint)
    );

    setText(
        "profitCalculation",
        `${formatMoney(productionCostPerPrint)} × ` +
        `${formatNumber(values.markup)}% = ` +
        formatMoney(profitPerPrint)
    );

    document.getElementById("totalPrice").title =
        formatMoney(totalPrice);

    return currentCalculation;
}


function saveDefaults() {
    const defaults = {
        ...getInputValues(),
        currency: getCurrency()
    };

    if (setStoredItem(STORAGE_KEYS.defaults, defaults)) {
        showStatus("Your defaults have been saved.");
    }
}

function resetInputs() {
    const savedDefaults = getStoredItem(STORAGE_KEYS.defaults);

    if (savedDefaults) {
        setInputValues(savedDefaults);

        if (savedDefaults.currency) {
            currencySelect.value = savedDefaults.currency;
            setStoredItem(STORAGE_KEYS.currency, savedDefaults.currency);
        }

        showStatus("Inputs reset to your saved defaults.");
    } else {
        setInputValues(DEFAULT_VALUES);
        showStatus("Inputs reset.");
    }

    updateCurrencyUnits();
    calculate();
}

function getHistory() {
    const history = getStoredItem(STORAGE_KEYS.history, []);
    return Array.isArray(history) ? history : [];
}

function saveCalculation() {
    if (!currentCalculation) {
        return;
    }

    const history = getHistory();

    const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        ...currentCalculation
    };

    history.unshift(entry);

    const trimmedHistory = history.slice(0, 20);

    if (setStoredItem(STORAGE_KEYS.history, trimmedHistory)) {
        renderHistory();
        showStatus("Calculation saved.");
    }
}

function deleteHistoryItem(id) {
    const history = getHistory().filter((entry) => entry.id !== id);

    setStoredItem(STORAGE_KEYS.history, history);
    renderHistory();
    showStatus("Calculation deleted.");
}

function clearHistory() {
    const history = getHistory();

    if (history.length === 0) {
        return;
    }

    const shouldClear = window.confirm(
        "Delete all saved PrintPrice calculations?"
    );

    if (!shouldClear) {
        return;
    }

    removeStoredItem(STORAGE_KEYS.history);
    renderHistory();
    showStatus("History cleared.");
}

function loadHistoryItem(id) {
    const entry = getHistory().find((item) => item.id === id);

    if (!entry) {
        showStatus("That calculation could not be found.", true);
        return;
    }

    setInputValues(entry.values);

    if (entry.currency) {
        currencySelect.value = entry.currency;
        setStoredItem(STORAGE_KEYS.currency, entry.currency);
    }

    updateCurrencyUnits();
    calculate();

    document
        .getElementById("calculator")
        .scrollIntoView({ behavior: "smooth", block: "start" });

    showStatus("Saved calculation loaded.");
}

function makeHistoryButton(text, action, id) {
    const button = document.createElement("button");

    button.type = "button";
    button.className =
        action === "load" ? "history-load" : "history-delete";

    button.textContent = text;
    button.dataset.action = action;
    button.dataset.id = id;

    return button;
}

function renderHistory() {
    const history = getHistory();

    historyList.replaceChildren();
    historyEmpty.hidden = history.length > 0;
    clearHistoryButton.disabled = history.length === 0;

    history.forEach((entry) => {
        const article = document.createElement("article");
        article.className = "history-item";

        const information = document.createElement("div");
        information.className = "history-info";

        const title = document.createElement("h3");
        title.textContent =
            entry.values.printName ||
            `${formatNumber(entry.values.weight)}g ` +
            `${entry.values.material} print`;

        const details = document.createElement("p");
        details.textContent =
            `${entry.values.hours}h ${entry.values.minutes}m · ` +
            `${entry.values.quantity} ` +
            `${entry.values.quantity === 1 ? "print" : "prints"}`;

        const date = document.createElement("time");
        date.dateTime = entry.createdAt;

        date.textContent = new Intl.DateTimeFormat(navigator.language, {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(entry.createdAt));

        const price = document.createElement("strong");
        price.className = "history-price";
        price.textContent = formatMoney(entry.totalPrice, entry.currency);

        const actions = document.createElement("div");
        actions.className = "history-actions";

        actions.append(
            makeHistoryButton("Load", "load", entry.id),
            makeHistoryButton("Delete", "delete", entry.id)
        );

        information.append(title, details, date);
        article.append(information, price, actions);
        historyList.append(article);
    });
}


function createResultText() {
    const calculation = currentCalculation;
    const values = calculation.values;

    return [
        values.printName || `${values.material} print`,
        `Quantity: ${values.quantity}`,
        `Filament: ${formatNumber(values.weight)}g per print`,
        `Print time: ${values.hours}h ${values.minutes}m`,
        `Production cost: ${formatMoney(
            calculation.totalCost,
            calculation.currency
        )}`,
        `Suggested price: ${formatMoney(
            calculation.totalPrice,
            calculation.currency
        )}`,
        `Price per print: ${formatMoney(
            calculation.suggestedPricePerPrint,
            calculation.currency
        )}`,
        `Estimated profit: ${formatMoney(
            calculation.totalProfit,
            calculation.currency
        )}`,
        "",
        "Calculated with PrintPrice"
    ].join("\n");
}

async function copyResult() {
    if (!currentCalculation) {
        return;
    }

    const resultText = createResultText();

    try {
        await navigator.clipboard.writeText(resultText);
        showStatus("Result copied.");
    } catch (error) {
        const textArea = document.createElement("textarea");

        textArea.value = resultText;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.append(textArea);
        textArea.select();

        const copied = document.execCommand("copy");
        textArea.remove();

        showStatus(
            copied ? "Result copied." : "The result could not be copied.",
            !copied
        );
    }
}


calculator.addEventListener("submit", (event) => {
    event.preventDefault();
});

calculator.addEventListener("input", (event) => {
    if (
        event.target.matches("input") ||
        event.target.matches("select")
    ) {
        calculate();
    }
});

currencySelect.addEventListener("change", () => {
    setStoredItem(STORAGE_KEYS.currency, getCurrency());
    updateCurrencyUnits();
    calculate();

    showStatus(
        "Currency changed. Your entered prices were not converted."
    );
});

themeButton.addEventListener("click", toggleTheme);
saveDefaultsButton.addEventListener("click", saveDefaults);
resetButton.addEventListener("click", resetInputs);
saveCalculationButton.addEventListener("click", saveCalculation);
copyButton.addEventListener("click", copyResult);
clearHistoryButton.addEventListener("click", clearHistory);

historyList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "load") {
        loadHistoryItem(id);
    }

    if (action === "delete") {
        deleteHistoryItem(id);
    }
});


function initialise() {
    setStartingTheme();
    setStartingCurrency();

    const savedDefaults = getStoredItem(STORAGE_KEYS.defaults);

    setInputValues(savedDefaults || DEFAULT_VALUES);

    if (savedDefaults && savedDefaults.currency) {
        currencySelect.value = savedDefaults.currency;
        updateCurrencyUnits();
    }

    calculate();
    renderHistory();
}

initialise();