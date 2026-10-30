function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function buildMonthlyRevenue(invoices, monthCount = 6, today = new Date()) {
  const months = [];

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1, 12);
    months.push({
      key: monthKey(date),
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      total: 0
    });
  }

  const totals = new Map(months.map((month) => [month.key, month]));
  invoices.forEach((invoice) => {
    if (!invoice.paidAt) return;
    const paidDate = new Date(`${invoice.paidAt}T12:00:00`);
    const month = totals.get(monthKey(paidDate));
    if (month) month.total += invoice.amount;
  });

  return months;
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/revenue-chart.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeRevenueChart(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel revenue-panel";
  section.setAttribute("aria-labelledby", "revenue-heading");
  section.innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Paid revenue</p>
        <h2 id="revenue-heading">Six-month trend</h2>
      </div>
      <p>Based on cleared invoices</p>
    </div>
    <div class="revenue-chart"></div>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const months = buildMonthlyRevenue(dashboard.getInvoices());
    const highestTotal = Math.max(...months.map(({ total }) => total), 1);
    const chart = section.querySelector(".revenue-chart");
    chart.setAttribute(
      "aria-label",
      `Paid revenue by month: ${months.map(({ label, total }) => `${label} ${dashboard.formatCurrency(total)}`).join(", ")}`
    );
    chart.setAttribute("role", "img");
    chart.replaceChildren(
      ...months.map(({ label, total }) => {
        const column = document.createElement("div");
        column.className = "revenue-column";
        column.innerHTML = `
          <span class="revenue-value">${dashboard.formatCurrency(total)}</span>
          <span class="revenue-bar" style="height: ${Math.max((total / highestTotal) * 100, total ? 8 : 2)}%"></span>
          <span class="revenue-label">${label}</span>
        `;
        return column;
      })
    );
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}

