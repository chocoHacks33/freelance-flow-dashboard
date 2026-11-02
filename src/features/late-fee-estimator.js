import { daysOverdue, getInvoiceStatus } from "../data.js";

const DEFAULT_MONTHLY_RATE = 1.5;
const MAXIMUM_MONTHLY_RATE = 10;

export function normalizeMonthlyRate(value) {
  if (value === null || String(value).trim() === "") {
    return null;
  }

  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 0 || rate > MAXIMUM_MONTHLY_RATE) {
    return null;
  }

  return Math.round(rate * 100) / 100;
}

export function calculateLateFee(amount, lateDays, monthlyRate = DEFAULT_MONTHLY_RATE) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const safeDays = Number.isFinite(lateDays) ? Math.max(0, Math.floor(lateDays)) : 0;
  const safeRate = normalizeMonthlyRate(monthlyRate) ?? DEFAULT_MONTHLY_RATE;
  return Math.round(safeAmount * (safeRate / 100) * (safeDays / 30) * 100) / 100;
}

export function getOverdueInvoiceOptions(invoices, today = new Date()) {
  return invoices.flatMap((invoice) => {
    if (getInvoiceStatus(invoice, today) !== "overdue" || !Number.isFinite(invoice.amount) || invoice.amount <= 0) {
      return [];
    }

    return [{ ...invoice, lateDays: daysOverdue(invoice, today) }];
  });
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/late-fee-estimator.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeLateFeeEstimator(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel late-fee-estimator";
  section.setAttribute("aria-labelledby", "late-fee-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Overdue scenario</p>
      <h2 id="late-fee-heading">Late-fee estimate</h2>
    </div>
    <div class="late-fee-fields">
      <label for="late-fee-invoice">Invoice</label>
      <select id="late-fee-invoice"></select>
      <label for="late-fee-rate">Monthly rate</label>
      <div class="late-fee-rate-field">
        <input id="late-fee-rate" type="number" min="0" max="${MAXIMUM_MONTHLY_RATE}" step="0.25" value="${DEFAULT_MONTHLY_RATE}" />
        <span aria-hidden="true">%</span>
      </div>
    </div>
    <strong class="late-fee-total"></strong>
    <p class="late-fee-context" aria-live="polite"></p>
    <p class="late-fee-note">Estimate only—use the fee terms agreed with the client.</p>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  const invoiceSelect = section.querySelector("#late-fee-invoice");
  const rateInput = section.querySelector("#late-fee-rate");

  function render() {
    const previousId = invoiceSelect.value;
    const overdueInvoices = getOverdueInvoiceOptions(dashboard.getInvoices());
    invoiceSelect.replaceChildren(
      ...overdueInvoices.map((invoice) => {
        const option = document.createElement("option");
        option.value = invoice.id;
        option.textContent = `${invoice.id} · ${invoice.client}`;
        return option;
      })
    );

    if (overdueInvoices.some((invoice) => invoice.id === previousId)) {
      invoiceSelect.value = previousId;
    }

    const selected = overdueInvoices.find((invoice) => invoice.id === invoiceSelect.value);
    const rate = normalizeMonthlyRate(rateInput.value);
    const controls = section.querySelectorAll("select, input");
    controls.forEach((control) => {
      control.disabled = overdueInvoices.length === 0;
    });

    if (!selected) {
      section.querySelector(".late-fee-total").textContent = "No overdue invoices";
      section.querySelector(".late-fee-context").textContent = "An estimate will appear when an invoice becomes overdue.";
      return;
    }

    if (rate === null) {
      section.querySelector(".late-fee-total").textContent = "Check the rate";
      section.querySelector(".late-fee-context").textContent = `Enter a monthly rate from 0% to ${MAXIMUM_MONTHLY_RATE}%.`;
      return;
    }

    const fee = calculateLateFee(selected.amount, selected.lateDays, rate);
    section.querySelector(".late-fee-total").textContent = dashboard.formatCurrency(fee);
    section.querySelector(".late-fee-context").textContent = `${selected.lateDays} ${selected.lateDays === 1 ? "day" : "days"} late on a ${dashboard.formatCurrency(selected.amount)} balance at ${rate}% monthly.`;
  }

  invoiceSelect.addEventListener("change", render);
  rateInput.addEventListener("input", render);
  document.addEventListener("dashboard:rendered", render);
  render();
}
