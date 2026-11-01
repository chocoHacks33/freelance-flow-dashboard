import { daysOverdue, getInvoiceStatus } from "../data.js";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function getOverdueInvoices(invoices, today = new Date()) {
  return invoices
    .filter((invoice) => getInvoiceStatus(invoice, today) === "overdue")
    .map((invoice) => ({ ...invoice, overdueDays: daysOverdue(invoice, today) }))
    .sort((left, right) => right.overdueDays - left.overdueDays || right.amount - left.amount);
}

export function buildReminderMessage(invoice, today = new Date()) {
  const overdueDays = daysOverdue(invoice, today);
  const dayLabel = overdueDays === 1 ? "day" : "days";
  const dueDate = dateFormatter.format(new Date(`${invoice.dueAt}T12:00:00`));

  return [
    `Hi ${invoice.client},`,
    "",
    `Just a quick reminder that invoice ${invoice.id} for ${currency.format(invoice.amount)} was due on ${dueDate} and is now ${overdueDays} ${dayLabel} overdue. Could you let me know when payment is scheduled?`,
    "",
    "Thank you."
  ].join("\n");
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/overdue-reminder.css", import.meta.url).href;
  document.head.append(stylesheet);
}

async function copyText(textarea) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(textarea.value);
    return;
  }

  textarea.focus();
  textarea.select();
  if (!document.execCommand("copy")) {
    throw new Error("Copy command was unavailable");
  }
}

export function initializeOverdueReminder(dashboard) {
  loadStylesheet();

  const section = document.createElement("section");
  section.className = "panel overdue-reminder";
  section.setAttribute("aria-labelledby", "overdue-reminder-heading");
  section.innerHTML = `
    <div class="overdue-reminder-heading">
      <div>
        <p class="eyebrow">Collections helper</p>
        <h2 id="overdue-reminder-heading">Draft a payment reminder</h2>
      </div>
      <label for="overdue-reminder-invoice">Overdue invoice</label>
      <select id="overdue-reminder-invoice"></select>
    </div>
    <label class="overdue-reminder-draft-label" for="overdue-reminder-draft">Editable reminder draft</label>
    <textarea id="overdue-reminder-draft" rows="6"></textarea>
    <div class="overdue-reminder-actions">
      <button type="button">Copy reminder</button>
      <p class="overdue-reminder-status" role="status" aria-live="polite"></p>
    </div>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  const select = section.querySelector("select");
  const textarea = section.querySelector("textarea");
  const button = section.querySelector("button");
  const status = section.querySelector(".overdue-reminder-status");
  let overdueInvoices = [];

  function updateDraft() {
    const invoice = overdueInvoices.find(({ id }) => id === select.value);
    textarea.value = invoice ? buildReminderMessage(invoice) : "";
    status.textContent = "";
  }

  function render() {
    const selectedId = select.value;
    overdueInvoices = getOverdueInvoices(dashboard.getInvoices());
    select.replaceChildren();

    overdueInvoices.forEach((invoice) => {
      const option = document.createElement("option");
      option.value = invoice.id;
      option.textContent = `${invoice.id} · ${invoice.client} · ${invoice.overdueDays}d overdue`;
      select.append(option);
    });

    const retainedInvoice = overdueInvoices.find(({ id }) => id === selectedId);
    if (retainedInvoice) {
      select.value = retainedInvoice.id;
    }

    const hasOverdueInvoices = overdueInvoices.length > 0;
    select.disabled = !hasOverdueInvoices;
    textarea.disabled = !hasOverdueInvoices;
    button.disabled = !hasOverdueInvoices;
    textarea.placeholder = hasOverdueInvoices ? "" : "No overdue invoices need a reminder.";
    updateDraft();
  }

  select.addEventListener("change", updateDraft);
  button.addEventListener("click", async () => {
    try {
      await copyText(textarea);
      status.textContent = "Reminder copied. Review it before sending.";
    } catch {
      status.textContent = "Copy failed. Select the draft and copy it manually.";
      textarea.focus();
    }
  });

  document.addEventListener("dashboard:rendered", render);
  render();
}
