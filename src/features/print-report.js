export function formatReportTimestamp(value, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const options = { dateStyle: "long", timeStyle: "short" };
  if (timeZone) {
    options.timeZone = timeZone;
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/print-report.css", import.meta.url).href;
  document.head.append(stylesheet);
}

export function initializePrintReport() {
  loadStylesheet();

  const reportHeading = document.createElement("section");
  reportHeading.className = "print-report-heading";
  reportHeading.setAttribute("aria-hidden", "true");
  reportHeading.innerHTML = `
    <p>Freelance Flow</p>
    <h2>Invoice and cash-flow report</h2>
    <time></time>
  `;
  document.querySelector("#main-content").prepend(reportHeading);

  const button = document.createElement("button");
  button.className = "print-report-button";
  button.type = "button";
  button.textContent = "Print report";
  document.querySelector("#dashboard-tools").append(button);

  function refreshTimestamp() {
    const now = new Date();
    const time = reportHeading.querySelector("time");
    time.dateTime = now.toISOString();
    time.textContent = `Generated ${formatReportTimestamp(now)}`;
  }

  window.addEventListener("beforeprint", refreshTimestamp);
  button.addEventListener("click", () => {
    refreshTimestamp();
    window.print();
  });

  refreshTimestamp();
}
