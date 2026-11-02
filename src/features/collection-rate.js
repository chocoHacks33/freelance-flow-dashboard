export function summarizeCollectionRate(invoices) {
  const validInvoices = invoices.filter((invoice) => Number.isFinite(invoice.amount) && invoice.amount > 0);
  const totalAmount = validInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = validInvoices.reduce(
    (sum, invoice) => sum + (invoice.status === "paid" ? invoice.amount : 0),
    0
  );

  return {
    invoiceCount: validInvoices.length,
    paidCount: validInvoices.filter((invoice) => invoice.status === "paid").length,
    totalAmount,
    paidAmount,
    rate: totalAmount === 0 ? 0 : Math.round((paidAmount / totalAmount) * 100)
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/collection-rate.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeCollectionRate(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel collection-rate";
  section.setAttribute("aria-labelledby", "collection-rate-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Portfolio health</p>
      <h2 id="collection-rate-heading">Invoice collection</h2>
    </div>
    <strong class="collection-rate-value"></strong>
    <div class="collection-rate-track" role="progressbar" aria-label="Share of invoiced value collected" aria-valuemin="0" aria-valuemax="100">
      <span></span>
    </div>
    <p class="collection-rate-amount"></p>
    <p class="collection-rate-count"></p>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  function render() {
    const summary = summarizeCollectionRate(dashboard.getInvoices());
    const track = section.querySelector(".collection-rate-track");
    section.querySelector(".collection-rate-value").textContent = summary.invoiceCount ? `${summary.rate}%` : "No data";
    track.setAttribute("aria-valuenow", String(summary.rate));
    track.querySelector("span").style.width = `${summary.rate}%`;
    section.querySelector(".collection-rate-amount").textContent = summary.invoiceCount
      ? `${dashboard.formatCurrency(summary.paidAmount)} collected of ${dashboard.formatCurrency(summary.totalAmount)} invoiced.`
      : "Invoices with positive amounts will appear here.";
    section.querySelector(".collection-rate-count").textContent = summary.invoiceCount
      ? `${summary.paidCount} of ${summary.invoiceCount} ${summary.invoiceCount === 1 ? "invoice" : "invoices"} paid.`
      : "";
  }

  document.addEventListener("dashboard:rendered", render);
  render();
}
