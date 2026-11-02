function parseInvoiceDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function summarizeYearToDate(invoices, today = new Date()) {
  const year = today.getFullYear();
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const payments = invoices.flatMap((invoice) => {
    const paidAt = parseInvoiceDate(invoice.paidAt);
    if (
      invoice.status !== "paid" ||
      !Number.isFinite(invoice.amount) ||
      invoice.amount <= 0 ||
      paidAt === null ||
      paidAt.getFullYear() !== year ||
      paidAt.getTime() > endOfToday.getTime()
    ) {
      return [];
    }

    return [invoice.amount];
  });

  const total = payments.reduce((sum, amount) => sum + amount, 0);
  const elapsedMonths = today.getMonth() + 1;

  return {
    year,
    invoiceCount: payments.length,
    total,
    monthlyAverage: Math.round(total / elapsedMonths),
    largestPayment: payments.length ? Math.max(...payments) : 0
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/year-to-date-earnings.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeYearToDateEarnings(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel year-to-date-earnings";
  section.setAttribute("aria-labelledby", "year-to-date-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Annual pulse</p>
      <h2 id="year-to-date-heading">Year-to-date earnings</h2>
    </div>
    <strong class="year-to-date-total"></strong>
    <p class="year-to-date-count"></p>
    <dl>
      <div>
        <dt>Monthly pace</dt>
        <dd class="year-to-date-average"></dd>
      </div>
      <div>
        <dt>Largest payment</dt>
        <dd class="year-to-date-largest"></dd>
      </div>
    </dl>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const summary = summarizeYearToDate(dashboard.getInvoices());
    section.querySelector(".year-to-date-total").textContent = dashboard.formatCurrency(summary.total);
    section.querySelector(".year-to-date-count").textContent = summary.invoiceCount
      ? `${summary.invoiceCount} paid ${summary.invoiceCount === 1 ? "invoice" : "invoices"} in ${summary.year}.`
      : `No paid invoices recorded in ${summary.year}.`;
    section.querySelector(".year-to-date-average").textContent = dashboard.formatCurrency(summary.monthlyAverage);
    section.querySelector(".year-to-date-largest").textContent = dashboard.formatCurrency(summary.largestPayment);
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}
