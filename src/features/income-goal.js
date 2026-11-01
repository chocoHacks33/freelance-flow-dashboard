import { summarizeInvoices } from "../data.js";

const DEFAULT_GOAL = 5000;
const MINIMUM_GOAL = 100;
const MAXIMUM_GOAL = 1_000_000;
const STORAGE_KEY = "freelance-flow:monthly-income-goal";

export function normalizeMonthlyGoal(value) {
  const goal = Number(value);
  if (!Number.isFinite(goal) || goal < MINIMUM_GOAL || goal > MAXIMUM_GOAL) {
    return null;
  }

  return Math.round(goal);
}

export function calculateIncomeGoalProgress(paidThisMonth, goal) {
  const safePaid = Number.isFinite(paidThisMonth) ? Math.max(0, paidThisMonth) : 0;
  const safeGoal = normalizeMonthlyGoal(goal) ?? DEFAULT_GOAL;

  return {
    goal: safeGoal,
    paid: safePaid,
    remaining: Math.max(0, safeGoal - safePaid),
    percent: Math.min(100, Math.round((safePaid / safeGoal) * 100))
  };
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/income-goal.css", import.meta.url).href;
  document.head.append(stylesheet);
}

function loadGoal(storage) {
  try {
    return normalizeMonthlyGoal(storage.getItem(STORAGE_KEY)) ?? DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

function saveGoal(storage, goal) {
  try {
    storage.setItem(STORAGE_KEY, String(goal));
  } catch {
    // Keep the goal usable for this session when browser storage is unavailable.
  }
}

export function initializeIncomeGoal(dashboard, storage = localStorage) {
  loadStylesheet();
  let goal = loadGoal(storage);

  const section = document.createElement("section");
  section.className = "panel income-goal";
  section.setAttribute("aria-labelledby", "income-goal-heading");
  section.innerHTML = `
    <div>
      <p class="eyebrow">Monthly target</p>
      <h2 id="income-goal-heading">Income goal</h2>
    </div>
    <strong class="income-goal-total"></strong>
    <div class="income-goal-track" role="progressbar" aria-label="Monthly income goal progress" aria-valuemin="0" aria-valuemax="100">
      <span></span>
    </div>
    <p class="income-goal-status" aria-live="polite"></p>
    <form class="income-goal-form">
      <label for="income-goal-input">Goal amount</label>
      <div>
        <input id="income-goal-input" name="goal" type="number" min="${MINIMUM_GOAL}" max="${MAXIMUM_GOAL}" step="100" required />
        <button type="submit">Save goal</button>
      </div>
      <p class="income-goal-error" role="alert"></p>
    </form>
  `;
  document.querySelector("#dashboard-widgets").append(section);

  const input = section.querySelector("#income-goal-input");
  input.value = String(goal);

  function render() {
    const paidThisMonth = summarizeInvoices(dashboard.getInvoices()).paidThisMonth;
    const progress = calculateIncomeGoalProgress(paidThisMonth, goal);
    const track = section.querySelector(".income-goal-track");

    section.querySelector(".income-goal-total").textContent = `${dashboard.formatCurrency(progress.paid)} of ${dashboard.formatCurrency(progress.goal)}`;
    track.setAttribute("aria-valuenow", String(progress.percent));
    track.querySelector("span").style.width = `${progress.percent}%`;
    section.querySelector(".income-goal-status").textContent = progress.remaining
      ? `${progress.percent}% reached · ${dashboard.formatCurrency(progress.remaining)} to go.`
      : "Goal reached for this month.";
  }

  section.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const nextGoal = normalizeMonthlyGoal(input.value);
    const error = section.querySelector(".income-goal-error");

    if (nextGoal === null) {
      error.textContent = `Enter a goal from ${dashboard.formatCurrency(MINIMUM_GOAL)} to ${dashboard.formatCurrency(MAXIMUM_GOAL)}.`;
      input.focus();
      return;
    }

    error.textContent = "";
    goal = nextGoal;
    input.value = String(goal);
    saveGoal(storage, goal);
    render();
  });

  document.addEventListener("dashboard:rendered", render);
  render();
}
