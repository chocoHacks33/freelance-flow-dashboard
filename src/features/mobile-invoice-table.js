export function buildInvoiceDisplayCells(invoice, formatDate, formatCurrency) {
  return [
    { label: "Invoice", value: invoice.id },
    { label: "Client", value: invoice.client },
    { label: "Due", value: formatDate(invoice.dueAt) },
    { label: "Amount", value: formatCurrency(invoice.amount) }
  ];
}

export function initializeMobileInvoiceTable() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/mobile-invoice-table.css", import.meta.url).href;
  document.head.append(stylesheet);
}
