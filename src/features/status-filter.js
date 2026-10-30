import { getInvoiceStatus } from "../data.js";

const FILTERS = ["all", "outstanding", "overdue", "paid"];

export function filterInvoicesByStatus(invoices, status, today = new Date()) {
  if (status === "all") {
    return [...invoices];
  }

  return invoices.filter((invoice) => getInvoiceStatus(invoice, today) === status);
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/status-filter.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeStatusFilter(dashboard) {
  loadStylesheet();

  const container = document.querySelector("#dashboard-tools");
  const section = document.createElement("section");
  section.className = "invoice-filter panel";
  section.setAttribute("aria-labelledby", "filter-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Narrow the pipeline</p>
      <h2 id="filter-heading">Filter invoices</h2>
    </div>
    <div class="filter-options" role="group" aria-label="Invoice status">
      ${FILTERS.map(
        (filter) => `<button type="button" data-status-filter="${filter}" aria-pressed="${filter === "all"}">${filter}</button>`
      ).join("")}
    </div>
  `;
  container.append(section);

  let activeFilter = "all";

  function applyFilter() {
    const rows = [...document.querySelectorAll("#invoice-rows tr")];
    let visibleCount = 0;

    rows.forEach((row) => {
      const visible = activeFilter === "all" || row.dataset.status === activeFilter;
      row.hidden = !visible;
      visibleCount += Number(visible);
    });

    document.querySelector("#invoice-count").textContent =
      activeFilter === "all"
        ? `${rows.length} invoices tracked`
        : `${visibleCount} of ${rows.length} invoices shown`;
  }

  section.addEventListener("click", (event) => {
    const button = event.target.closest("[data-status-filter]");
    if (!button) return;

    activeFilter = button.dataset.statusFilter;
    section.querySelectorAll("[data-status-filter]").forEach((option) => {
      option.setAttribute("aria-pressed", String(option === button));
    });
    applyFilter();
  });

  document.addEventListener("dashboard:rendered", applyFilter);
  applyFilter();
}

