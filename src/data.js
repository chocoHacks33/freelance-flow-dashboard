const DAY_IN_MS = 86_400_000;

function dateFromToday(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const seedInvoices = [
  {
    id: "INV-1042",
    client: "Northstar Studio",
    issuedAt: dateFromToday(-12),
    dueAt: dateFromToday(18),
    amount: 2400,
    status: "outstanding"
  },
  {
    id: "INV-1041",
    client: "Brightline Cafe",
    issuedAt: dateFromToday(-20),
    dueAt: dateFromToday(10),
    paidAt: dateFromToday(-2),
    amount: 1650,
    status: "paid"
  },
  {
    id: "INV-1040",
    client: "Cedar & Co.",
    issuedAt: dateFromToday(-38),
    dueAt: dateFromToday(-8),
    amount: 3200,
    status: "outstanding"
  },
  {
    id: "INV-1039",
    client: "Orbit Legal",
    issuedAt: dateFromToday(-46),
    dueAt: dateFromToday(-16),
    paidAt: dateFromToday(-7),
    amount: 900,
    status: "paid"
  },
  {
    id: "INV-1038",
    client: "Morrow Goods",
    issuedAt: dateFromToday(-64),
    dueAt: dateFromToday(-34),
    paidAt: dateFromToday(-31),
    amount: 1850,
    status: "paid"
  }
];

export function getInvoiceStatus(invoice, today = new Date()) {
  if (invoice.status === "paid") {
    return "paid";
  }

  const dueDate = new Date(`${invoice.dueAt}T23:59:59`);
  return dueDate.getTime() < today.getTime() ? "overdue" : "outstanding";
}

export function summarizeInvoices(invoices, today = new Date()) {
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return invoices.reduce(
    (summary, invoice) => {
      const status = getInvoiceStatus(invoice, today);

      if (status !== "paid") {
        summary.outstanding += invoice.amount;
      }

      if (status === "overdue") {
        summary.overdue += invoice.amount;
        summary.overdueCount += 1;
      }

      if (invoice.paidAt) {
        const paidDate = new Date(`${invoice.paidAt}T12:00:00`);
        if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
          summary.paidThisMonth += invoice.amount;
        }
      }

      return summary;
    },
    { paidThisMonth: 0, outstanding: 0, overdue: 0, overdueCount: 0 }
  );
}

export function daysOverdue(invoice, today = new Date()) {
  if (getInvoiceStatus(invoice, today) !== "overdue") {
    return 0;
  }

  const dueDate = new Date(`${invoice.dueAt}T12:00:00`);
  const currentDate = new Date(today);
  currentDate.setHours(12, 0, 0, 0);
  return Math.max(1, Math.floor((currentDate.getTime() - dueDate.getTime()) / DAY_IN_MS));
}

