import { daysOverdue, getInvoiceStatus } from "../data.js";

const BUCKETS = [
  { key: "current", label: "Not yet due", includes: (days) => days === 0 },
  { key: "week", label: "1–7 days", includes: (days) => days >= 1 && days <= 7 },
  { key: "month", label: "8–30 days", includes: (days) => days >= 8 && days <= 30 },
  { key: "older", label: "31+ days", includes: (days) => days >= 31 }
];

export function buildAgingBuckets(invoices, today = new Date()) {
  const buckets = BUCKETS.map(({ key, label }) => ({ key, label, count: 0, total: 0 }));

  invoices.forEach((invoice) => {
    if (getInvoiceStatus(invoice, today) === "paid") return;

    const age = daysOverdue(invoice, today);
    const index = BUCKETS.findIndex(({ includes }) => includes(age));
    if (index === -1) return;
    buckets[index].count += 1;
    buckets[index].total += invoice.amount;
  });

  return buckets;
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/aging-insight.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeAgingInsight(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel aging-panel";
  section.setAttribute("aria-labelledby", "aging-heading");
  section.innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Collection risk</p>
        <h2 id="aging-heading">Outstanding aging</h2>
      </div>
      <p>Unpaid balance by age</p>
    </div>
    <div class="aging-buckets"></div>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const buckets = buildAgingBuckets(dashboard.getInvoices());
    const totalOutstanding = buckets.reduce((total, bucket) => total + bucket.total, 0);
    const container = section.querySelector(".aging-buckets");
    container.replaceChildren(
      ...buckets.map((bucket) => {
        const percentage = totalOutstanding ? Math.round((bucket.total / totalOutstanding) * 100) : 0;
        const row = document.createElement("div");
        row.className = `aging-bucket aging-bucket--${bucket.key}`;
        row.innerHTML = `
          <div class="aging-label">
            <span>${bucket.label}</span>
            <strong>${dashboard.formatCurrency(bucket.total)}</strong>
          </div>
          <div class="aging-track" role="progressbar" aria-label="${bucket.label}: ${dashboard.formatCurrency(bucket.total)}, ${bucket.count} ${bucket.count === 1 ? "invoice" : "invoices"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentage}">
            <span style="width: ${percentage}%"></span>
          </div>
          <small>${bucket.count} ${bucket.count === 1 ? "invoice" : "invoices"}</small>
        `;
        return row;
      })
    );
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}

