import { getInvoiceStatus } from "../data.js";

export function summarizeClientConcentration(invoices, today = new Date()) {
  const balances = new Map();

  invoices.forEach((invoice) => {
    if (getInvoiceStatus(invoice, today) === "paid") return;

    const normalizedClient = invoice.client.trim().toLocaleLowerCase();
    const current = balances.get(normalizedClient) ?? { client: invoice.client.trim(), balance: 0, invoiceCount: 0 };
    current.balance += invoice.amount;
    current.invoiceCount += 1;
    balances.set(normalizedClient, current);
  });

  const clients = [...balances.values()].sort(
    (left, right) => right.balance - left.balance || left.client.localeCompare(right.client)
  );
  const totalOutstanding = clients.reduce((total, client) => total + client.balance, 0);
  const leadingClient = clients[0] ?? null;

  return {
    clientCount: clients.length,
    totalOutstanding,
    leadingClient,
    leadingShare: leadingClient && totalOutstanding
      ? Math.round((leadingClient.balance / totalOutstanding) * 100)
      : 0
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/client-concentration.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeClientConcentration(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel client-concentration";
  section.setAttribute("aria-labelledby", "client-concentration-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Portfolio resilience</p>
      <h2 id="client-concentration-heading">Client concentration</h2>
    </div>
    <div class="client-concentration-summary"></div>
    <div class="client-concentration-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
      <span></span>
    </div>
    <p class="client-concentration-note"></p>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const summary = summarizeClientConcentration(dashboard.getInvoices());
    const totalLabel = dashboard.formatCurrency(summary.totalOutstanding);
    const progress = section.querySelector(".client-concentration-track");
    const fill = progress.querySelector("span");

    if (!summary.leadingClient) {
      section.querySelector(".client-concentration-summary").textContent = "No unpaid clients";
      section.querySelector(".client-concentration-note").textContent = "All tracked invoices are paid.";
      progress.setAttribute("aria-label", "No outstanding client balance");
      progress.setAttribute("aria-valuenow", "0");
      fill.style.width = "0%";
      return;
    }

    const client = summary.leadingClient;
    const percentage = document.createElement("strong");
    percentage.textContent = `${summary.leadingShare}%`;
    const clientName = document.createElement("span");
    clientName.textContent = client.client;
    section.querySelector(".client-concentration-summary").replaceChildren(percentage, clientName);
    section.querySelector(".client-concentration-note").textContent =
      `${client.client} represents ${dashboard.formatCurrency(client.balance)} of ${totalLabel} outstanding across ${summary.clientCount} ${summary.clientCount === 1 ? "client" : "clients"}.`;
    progress.setAttribute(
      "aria-label",
      `${client.client} represents ${summary.leadingShare}% of the outstanding balance`
    );
    progress.setAttribute("aria-valuenow", String(summary.leadingShare));
    fill.style.width = `${summary.leadingShare}%`;
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}
