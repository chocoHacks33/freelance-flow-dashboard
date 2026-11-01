const DAY_IN_MS = 86_400_000;

function parseInvoiceDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return null;
  }

  const timestamp = Date.parse(`${value}T12:00:00Z`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function summarizePaymentTiming(invoices) {
  const completed = invoices.flatMap((invoice) => {
    const issuedAt = parseInvoiceDate(invoice.issuedAt);
    const paidAt = parseInvoiceDate(invoice.paidAt);
    const dueAt = parseInvoiceDate(invoice.dueAt);

    if (invoice.status !== "paid" || issuedAt === null || paidAt === null || paidAt < issuedAt) {
      return [];
    }

    return [{ daysToPay: Math.round((paidAt - issuedAt) / DAY_IN_MS), onTime: dueAt !== null && paidAt <= dueAt }];
  });

  if (completed.length === 0) {
    return { invoiceCount: 0, averageDays: 0, onTimeCount: 0, onTimeRate: 0 };
  }

  const totalDays = completed.reduce((sum, invoice) => sum + invoice.daysToPay, 0);
  const onTimeCount = completed.filter((invoice) => invoice.onTime).length;

  return {
    invoiceCount: completed.length,
    averageDays: Math.round(totalDays / completed.length),
    onTimeCount,
    onTimeRate: Math.round((onTimeCount / completed.length) * 100)
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/payment-timing.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializePaymentTiming(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel payment-timing";
  section.setAttribute("aria-labelledby", "payment-timing-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Payment habits</p>
      <h2 id="payment-timing-heading">Time to payment</h2>
    </div>
    <strong class="payment-timing-average"></strong>
    <p class="payment-timing-context"></p>
    <div class="payment-timing-track" role="progressbar" aria-label="Invoices paid by their due date" aria-valuemin="0" aria-valuemax="100">
      <span></span>
    </div>
    <p class="payment-timing-rate"></p>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const summary = summarizePaymentTiming(dashboard.getInvoices());
    const average = section.querySelector(".payment-timing-average");
    const context = section.querySelector(".payment-timing-context");
    const track = section.querySelector(".payment-timing-track");

    average.textContent = summary.invoiceCount ? `${summary.averageDays} days` : "No history";
    context.textContent = summary.invoiceCount
      ? `Average across ${summary.invoiceCount} paid ${summary.invoiceCount === 1 ? "invoice" : "invoices"}.`
      : "Paid invoices with issue dates will appear here.";
    track.setAttribute("aria-valuenow", String(summary.onTimeRate));
    track.querySelector("span").style.width = `${summary.onTimeRate}%`;
    section.querySelector(".payment-timing-rate").textContent = summary.invoiceCount
      ? `${summary.onTimeRate}% paid on time (${summary.onTimeCount} of ${summary.invoiceCount}).`
      : "On-time rate is not available yet.";
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}
