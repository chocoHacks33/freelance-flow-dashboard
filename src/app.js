import { getInvoiceStatus, seedInvoices, summarizeInvoices } from "./data.js";
import { initializeStatusFilter } from "./features/status-filter.js";
import { initializeRevenueChart } from "./features/revenue-chart.js";
import { initializeInvoiceForm } from "./features/invoice-form.js";
import { initializeCsvExport } from "./features/csv-export.js";
import { initializeAgingInsight } from "./features/aging-insight.js";
import { initializeLateFeeEstimator } from "./features/late-fee-estimator.js";

let invoices = [...seedInvoices];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function formatCurrency(value) {
  return currency.format(value);
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function createInvoiceRow(invoice) {
  const row = document.createElement("tr");
  const status = getInvoiceStatus(invoice);
  row.dataset.status = status;
  row.dataset.invoiceId = invoice.id;

  const values = [invoice.id, invoice.client, formatDate(invoice.dueAt), formatCurrency(invoice.amount)];
  values.forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });

  const statusCell = document.createElement("td");
  const statusPill = document.createElement("span");
  statusPill.className = `status-pill status-pill--${status}`;
  statusPill.textContent = status;
  statusCell.append(statusPill);
  row.append(statusCell);

  return row;
}

export function renderDashboard() {
  const summary = summarizeInvoices(invoices);
  document.querySelector("#paid-total").textContent = formatCurrency(summary.paidThisMonth);
  document.querySelector("#outstanding-total").textContent = formatCurrency(summary.outstanding);
  document.querySelector("#overdue-total").textContent = formatCurrency(summary.overdue);
  document.querySelector("#overdue-count").textContent = `${summary.overdueCount} ${summary.overdueCount === 1 ? "invoice" : "invoices"}`;
  document.querySelector("#invoice-count").textContent = `${invoices.length} invoices tracked`;

  const rows = document.querySelector("#invoice-rows");
  rows.replaceChildren(...invoices.map(createInvoiceRow));
  document.dispatchEvent(new CustomEvent("dashboard:rendered"));
}

const dashboard = {
  addInvoice(invoice) {
    invoices = [invoice, ...invoices];
    renderDashboard();
  },
  formatCurrency,
  getInvoices() {
    return invoices.map((invoice) => ({ ...invoice }));
  }
};

renderDashboard();
initializeStatusFilter(dashboard);
initializeRevenueChart(dashboard);
initializeInvoiceForm(dashboard);
initializeCsvExport(dashboard);
initializeAgingInsight(dashboard);
initializeLateFeeEstimator(dashboard);

