import { summarizeInvoices } from "../data.js";

const DEFAULT_RATE = 25;
const MINIMUM_RATE = 0;
const MAXIMUM_RATE = 60;
const STORAGE_KEY = "freelance-flow:tax-reserve-rate";

export function normalizeTaxRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < MINIMUM_RATE || rate > MAXIMUM_RATE) {
    return null;
  }

  return Math.round(rate * 10) / 10;
}

export function calculateTaxReserve(paidIncome, rate = DEFAULT_RATE) {
  const safeIncome = Number.isFinite(paidIncome) ? Math.max(0, paidIncome) : 0;
  const safeRate = normalizeTaxRate(rate) ?? DEFAULT_RATE;
  const reserve = Math.round(safeIncome * safeRate) / 100;

  return {
    income: safeIncome,
    rate: safeRate,
    reserve,
    afterReserve: Math.max(0, safeIncome - reserve)
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/tax-reserve.css", import.meta.url).href;
  document.head.append(stylesheet);
}

function loadRate(storage) {
  try {
    return normalizeTaxRate(storage.getItem(STORAGE_KEY)) ?? DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

function saveRate(storage, rate) {
  try {
    storage.setItem(STORAGE_KEY, String(rate));
  } catch {
    // Keep the selected rate for this session when storage is unavailable.
  }
}

export function initializeTaxReserve(dashboard, storage = localStorage) {
  loadStylesheet();
  let rate = loadRate(storage);

  const section = document.createElement("section");
  section.className = "panel tax-reserve";
  section.setAttribute("aria-labelledby", "tax-reserve-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Cash set-aside</p>
      <h2 id="tax-reserve-heading">Tax reserve</h2>
    </div>
    <strong class="tax-reserve-total"></strong>
    <p class="tax-reserve-context" aria-live="polite"></p>
    <form class="tax-reserve-form">
      <label for="tax-reserve-rate">Reserve percentage</label>
      <div>
        <input id="tax-reserve-rate" name="rate" type="number" min="${MINIMUM_RATE}" max="${MAXIMUM_RATE}" step="0.1" required />
        <span aria-hidden="true">%</span>
        <button type="submit">Update</button>
      </div>
      <p class="tax-reserve-error" role="alert"></p>
    </form>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  const input = section.querySelector("#tax-reserve-rate");
  input.value = String(rate);

  function render() {
    const paidThisMonth = summarizeInvoices(dashboard.getInvoices()).paidThisMonth;
    const plan = calculateTaxReserve(paidThisMonth, rate);
    section.querySelector(".tax-reserve-total").textContent = dashboard.formatCurrency(plan.reserve);
    section.querySelector(".tax-reserve-context").textContent = paidThisMonth
      ? `${plan.rate}% of this month's paid income, leaving ${dashboard.formatCurrency(plan.afterReserve)} after the reserve.`
      : "Paid income received this month will appear here.";
  }

  section.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const nextRate = normalizeTaxRate(input.value);
    const error = section.querySelector(".tax-reserve-error");

    if (nextRate === null) {
      error.textContent = `Enter a percentage from ${MINIMUM_RATE} to ${MAXIMUM_RATE}.`;
      input.focus();
      return;
    }

    error.textContent = "";
    rate = nextRate;
    input.value = String(rate);
    saveRate(storage, rate);
    render();
  });

  document.addEventListener("dashboard:rendered", render);
  render();
}
