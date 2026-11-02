function normalizeDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function calendarDate(date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function calendarTimestamp(date) {
  return date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

export function escapeCalendarText(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function getCalendarInvoices(invoices) {
  return invoices.flatMap((invoice) => {
    const dueDate = normalizeDate(invoice.dueAt);
    if (invoice.status === "paid" || dueDate === null) {
      return [];
    }

    return [{ invoice, dueDate }];
  });
}

export function buildInvoiceCalendar(invoices, generatedAt = new Date()) {
  const events = getCalendarInvoices(invoices).map(({ invoice, dueDate }) => {
    const endDate = new Date(dueDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const uid = `${String(invoice.id ?? "invoice").replace(/[^a-z0-9.-]+/gi, "-")}@freelance-flow`;

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${calendarTimestamp(generatedAt)}`,
      `DTSTART;VALUE=DATE:${calendarDate(dueDate)}`,
      `DTEND;VALUE=DATE:${calendarDate(endDate)}`,
      `SUMMARY:${escapeCalendarText(`Invoice ${invoice.id} due`)}`,
      `DESCRIPTION:${escapeCalendarText(`${invoice.client} · ${invoice.amount}`)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Freelance Flow//Invoice Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/invoice-calendar.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializeInvoiceCalendar(dashboard) {
  loadStylesheet();

  const tool = document.createElement("section");
  tool.className = "invoice-calendar-tool";
  tool.setAttribute("aria-labelledby", "invoice-calendar-heading");
  tool.innerHTML = `
    <div>
      <p class="eyebrow">Deadline planning</p>
      <h2 id="invoice-calendar-heading">Invoice calendar</h2>
      <p class="invoice-calendar-summary"></p>
    </div>
    <button type="button">Download .ics</button>
  `;
  document.querySelector("#dashboard-tools").append(tool);

  const button = tool.querySelector("button");

  function render() {
    const count = getCalendarInvoices(dashboard.getInvoices()).length;
    tool.querySelector(".invoice-calendar-summary").textContent = count
      ? `${count} unpaid ${count === 1 ? "deadline" : "deadlines"} ready for your calendar.`
      : "No unpaid invoice deadlines to export.";
    button.disabled = count === 0;
  }

  button.addEventListener("click", () => {
    const calendar = buildInvoiceCalendar(dashboard.getInvoices());
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "freelance-flow-invoice-deadlines.ics";
    link.click();
    URL.revokeObjectURL(url);
  });

  document.addEventListener("dashboard:rendered", render);
  render();
}
