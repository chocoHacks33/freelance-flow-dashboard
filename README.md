# Freelance Flow

Freelance Flow is a small, dependency-free invoice dashboard for solo freelancers. It turns a compact invoice list into a useful view of paid revenue, money still outstanding, and overdue work.

## Run locally

Serve the folder with any static web server, then open the local URL:

```bash
npx serve .
```

The app uses only browser JavaScript and CSS. The starter data is generated relative to the current date, so the example dashboard stays meaningful over time.

## Quality checks

```bash
npm test
npm run check
```

The test suite uses Node's built-in test runner and requires no installed packages.

## Roadmap

The starter includes isolated extension modules for naturally independent follow-up work:

- filter invoices by payment status;
- chart recent paid revenue;
- add and save a new invoice;
- export invoice data as CSV;
- summarize the age of overdue balances.

