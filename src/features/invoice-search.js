export function invoiceMatchesQuery(invoice, query) {
  const normalizedQuery = String(query ?? "").trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  return [invoice.id, invoice.client].some((value) =>
    String(value ?? "").toLocaleLowerCase().includes(normalizedQuery)
  );
}

export function filterInvoicesByQuery(invoices, query) {
  return invoices.filter((invoice) => invoiceMatchesQuery(invoice, query));
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/invoice-search.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeInvoiceSearch(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "invoice-search panel";
  section.setAttribute("aria-labelledby", "invoice-search-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Find a record</p>
      <h2 id="invoice-search-heading">Search invoices</h2>
    </div>
    <label>
      <span>Invoice ID or client</span>
      <input type="search" autocomplete="off" placeholder="Try INV-1042 or Northstar" />
    </label>
    <p class="invoice-search-status" role="status" aria-live="polite"></p>
  `;
  document.querySelector("#dashboard-tools").append(section);

  const input = section.querySelector("input");
  const status = section.querySelector(".invoice-search-status");

  function applySearch() {
    const invoices = dashboard.getInvoices();
    const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
    const rows = [...document.querySelectorAll("#invoice-rows tr")];
    let visibleCount = 0;

    rows.forEach((row) => {
      const visible = invoiceMatchesQuery(invoiceById.get(row.dataset.invoiceId), input.value);
      row.dataset.searchHidden = String(!visible);
      visibleCount += Number(visible);
    });

    status.textContent = input.value.trim()
      ? `${visibleCount} ${visibleCount === 1 ? "invoice matches" : "invoices match"} your search.`
      : "";
  }

  input.addEventListener("input", applySearch);
  document.addEventListener("dashboard:rendered", applySearch);
  applySearch();
}
