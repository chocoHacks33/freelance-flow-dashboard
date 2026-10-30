import { getInvoiceStatus } from "../data.js";

const HEADERS = ["invoice_id", "client", "issued_at", "due_at", "paid_at", "amount", "status"];

function protectSpreadsheetValue(value) {
  const text = String(value ?? "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

export function escapeCsvValue(value) {
  const text = protectSpreadsheetValue(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function invoicesToCsv(invoices, today = new Date()) {
  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.client,
    invoice.issuedAt,
    invoice.dueAt,
    invoice.paidAt ?? "",
    Number(invoice.amount).toFixed(2),
    getInvoiceStatus(invoice, today)
  ]);

  return [HEADERS, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
}

function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/csv-export.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeCsvExport(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel export-panel";
  section.setAttribute("aria-labelledby", "export-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Portable records</p>
      <h2 id="export-heading">Export invoices</h2>
      <p>Download the current dashboard data for a spreadsheet or bookkeeping tool.</p>
    </div>
    <button type="button">Download CSV</button>
    <p class="export-status" role="status" aria-live="polite"></p>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  const status = section.querySelector(".export-status");
  section.querySelector("button").addEventListener("click", () => {
    const invoices = dashboard.getInvoices();
    const csv = invoicesToCsv(invoices);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `freelance-flow-invoices-${localIsoDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = `${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"} exported.`;
  });
}

