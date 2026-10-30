const STORAGE_KEY = "freelance-flow:user-invoices";

function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createInvoice(input, today = new Date()) {
  const id = String(input.id ?? "").trim().toUpperCase();
  const client = String(input.client ?? "").trim();
  const dueAt = String(input.dueAt ?? "");
  const amount = Number(input.amount);

  if (!/^[A-Z0-9-]{3,20}$/.test(id)) {
    throw new Error("Use 3–20 letters, numbers, or hyphens for the invoice ID.");
  }
  if (client.length < 2 || client.length > 80) {
    throw new Error("Enter a client name between 2 and 80 characters.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueAt) || Number.isNaN(new Date(`${dueAt}T12:00:00`).getTime())) {
    throw new Error("Choose a valid due date.");
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    throw new Error("Enter an amount greater than 0 and no more than 1,000,000.");
  }

  return {
    id,
    client,
    issuedAt: localIsoDate(today),
    dueAt,
    amount: Math.round(amount * 100) / 100,
    status: "outstanding"
  };
}

function isStoredInvoice(invoice) {
  return (
    invoice &&
    typeof invoice.id === "string" &&
    typeof invoice.client === "string" &&
    typeof invoice.dueAt === "string" &&
    typeof invoice.amount === "number" &&
    invoice.status === "outstanding"
  );
}

export function loadStoredInvoices(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredInvoice) : [];
  } catch {
    return [];
  }
}

export function saveStoredInvoices(storage, invoices) {
  storage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/invoice-form.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeInvoiceForm(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel invoice-form-panel";
  section.setAttribute("aria-labelledby", "invoice-form-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Keep the pipeline current</p>
      <h2 id="invoice-form-heading">Add an invoice</h2>
    </div>
    <form class="invoice-form">
      <label>Invoice ID <input name="id" autocomplete="off" placeholder="INV-1043" required /></label>
      <label>Client <input name="client" autocomplete="organization" required /></label>
      <label>Due date <input name="dueAt" type="date" required /></label>
      <label>Amount <input name="amount" type="number" min="0.01" max="1000000" step="0.01" inputmode="decimal" required /></label>
      <button type="submit">Add invoice</button>
    </form>
    <p class="form-status" role="status" aria-live="polite"></p>
  `;
  document.querySelector("#dashboard-tools").append(section);

  const form = section.querySelector("form");
  const status = section.querySelector(".form-status");
  form.elements.dueAt.min = localIsoDate(new Date());

  const storedInvoices = loadStoredInvoices(window.localStorage);
  const knownIds = new Set(dashboard.getInvoices().map(({ id }) => id));
  storedInvoices.forEach((invoice) => {
    if (!knownIds.has(invoice.id)) {
      dashboard.addInvoice(invoice);
      knownIds.add(invoice.id);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      const invoice = createInvoice(Object.fromEntries(new FormData(form)));
      const duplicate = dashboard.getInvoices().some(({ id }) => id.toUpperCase() === invoice.id);
      if (duplicate) throw new Error(`Invoice ${invoice.id} is already tracked.`);

      const updatedStoredInvoices = [invoice, ...loadStoredInvoices(window.localStorage)];
      saveStoredInvoices(window.localStorage, updatedStoredInvoices);
      dashboard.addInvoice(invoice);
      form.reset();
      form.elements.dueAt.min = localIsoDate(new Date());
      status.className = "form-status form-status--success";
      status.textContent = `${invoice.id} for ${invoice.client} was added.`;
      form.elements.id.focus();
    } catch (error) {
      status.className = "form-status form-status--error";
      status.textContent = error.message;
    }
  });
}

