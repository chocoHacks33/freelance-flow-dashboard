const SORTERS = {
  "due-soonest": (left, right) => left.dueAt.localeCompare(right.dueAt),
  "due-latest": (left, right) => right.dueAt.localeCompare(left.dueAt),
  "amount-highest": (left, right) => right.amount - left.amount,
  "amount-lowest": (left, right) => left.amount - right.amount,
  client: (left, right) => left.client.localeCompare(right.client, undefined, { sensitivity: "base" })
};

export function sortInvoices(invoices, sortBy) {
  const compare = SORTERS[sortBy];
  if (!compare) return [...invoices];

  return invoices
    .map((invoice, index) => ({ invoice, index }))
    .sort((left, right) => compare(left.invoice, right.invoice) || left.index - right.index)
    .map(({ invoice }) => invoice);
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/invoice-sorting.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeInvoiceSorting(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "invoice-sorting panel";
  section.setAttribute("aria-labelledby", "invoice-sorting-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Reorder the pipeline</p>
      <h2 id="invoice-sorting-heading">Sort invoices</h2>
    </div>
    <label>
      <span>Order by</span>
      <select>
        <option value="original">Recently added</option>
        <option value="due-soonest">Due date: soonest first</option>
        <option value="due-latest">Due date: latest first</option>
        <option value="amount-highest">Amount: highest first</option>
        <option value="amount-lowest">Amount: lowest first</option>
        <option value="client">Client: A to Z</option>
      </select>
    </label>
    <p class="invoice-sorting-status" role="status" aria-live="polite"></p>
  `;
  document.querySelector("#dashboard-tools").append(section);

  const select = section.querySelector("select");
  const status = section.querySelector(".invoice-sorting-status");

  function applySort(announce = false) {
    const sortedIds = sortInvoices(dashboard.getInvoices(), select.value).map(({ id }) => id);
    const rows = new Map(
      [...document.querySelectorAll("#invoice-rows tr")].map((row) => [row.dataset.invoiceId, row])
    );
    const rowContainer = document.querySelector("#invoice-rows");
    sortedIds.forEach((id) => {
      const row = rows.get(id);
      if (row) rowContainer.append(row);
    });

    status.textContent = announce
      ? `Invoices sorted by ${select.options[select.selectedIndex].text.toLocaleLowerCase()}.`
      : "";
  }

  select.addEventListener("change", () => applySort(true));
  document.addEventListener("dashboard:rendered", () => applySort(false));
  applySort(false);
}
