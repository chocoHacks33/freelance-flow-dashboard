import { getInvoiceStatus } from "../data.js";

const DAY_IN_MS = 86_400_000;

function startOfLocalDay(value) {
  const date = new Date(value);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function getInvoicesDueSoon(invoices, windowDays = 14, today = new Date()) {
  const currentDay = startOfLocalDay(today);

  return invoices
    .filter((invoice) => getInvoiceStatus(invoice, today) === "outstanding")
    .map((invoice) => {
      const dueDate = new Date(`${invoice.dueAt}T12:00:00`);
      return {
        ...invoice,
        daysUntilDue: Math.round((dueDate.getTime() - currentDay.getTime()) / DAY_IN_MS)
      };
    })
    .filter(({ daysUntilDue }) => daysUntilDue >= 0 && daysUntilDue <= windowDays)
    .sort((left, right) => left.daysUntilDue - right.daysUntilDue || right.amount - left.amount);
}

export function summarizeDueSoon(invoices, windowDays = 14, today = new Date()) {
  const dueSoon = getInvoicesDueSoon(invoices, windowDays, today);
  return {
    count: dueSoon.length,
    total: dueSoon.reduce((sum, invoice) => sum + invoice.amount, 0),
    nextInvoice: dueSoon[0] ?? null
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/due-forecast.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeDueForecast(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel due-forecast";
  section.setAttribute("aria-labelledby", "due-forecast-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Coming into view</p>
      <h2 id="due-forecast-heading">Due in 14 days</h2>
    </div>
    <strong class="due-forecast-total"></strong>
    <p class="due-forecast-count"></p>
    <p class="due-forecast-next"></p>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const summary = summarizeDueSoon(dashboard.getInvoices());
    section.querySelector(".due-forecast-total").textContent = dashboard.formatCurrency(summary.total);
    section.querySelector(".due-forecast-count").textContent =
      summary.count === 1 ? "1 unpaid invoice is due soon." : `${summary.count} unpaid invoices are due soon.`;
    section.querySelector(".due-forecast-next").textContent = summary.nextInvoice
      ? `${summary.nextInvoice.id} is next, due ${summary.nextInvoice.daysUntilDue === 0 ? "today" : `in ${summary.nextInvoice.daysUntilDue} days`}.`
      : "Nothing is due in the next two weeks.";
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}
