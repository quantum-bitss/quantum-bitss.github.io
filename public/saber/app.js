"use strict";

const state = {
  cases: [],
  casePage: 0,
  pageSize: 50,
  selected: new Set(),
  maxCases: 1,
  activeJobId: "",
  reviewMode: false,
  activeJobFinal: false,
  pollTimer: null,
  rawResult: null,
  pollingErrorShown: false,
  loadingJobs: new Set(),
};

const byId = (id) => document.getElementById(id);
const checkedValues = (selector) => [...document.querySelectorAll(selector)]
  .filter((input) => input.checked)
  .map((input) => input.value);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return new Intl.NumberFormat("en-US").format(Number(value));
}

function formatPercent(value) {
  if (value === null || value === undefined) return "-";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function formatTime(timestamp) {
  if (!timestamp) return "-";
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

async function api(path, options = {}) {
  // Set only by the published HTML; never accept a backend from a query string.
  const base = document.querySelector?.('meta[name="saber-api-base"]')?.content || "";
  const controller = new AbortController();
  // A stalled status request must not block all future status updates.
  const timer = !options.method || options.method === 'GET'
    ? window.setTimeout(() => controller.abort(), 20000) : null;
  try {
  const response = await fetch(base + path, {
    ...options,
    signal: controller.signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
    cache: "no-store",
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
  });
  let body = null;
  try { body = await response.json(); } catch (_) { body = null; }
  if (!response.ok) {
    const detail = body?.detail;
    const error = new Error(typeof detail === "string" ? detail : `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return body;
  } finally {
    if (timer !== null) window.clearTimeout(timer);
  }
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

function setChip(element, status, label = "") {
  element.className = `status-chip ${status || "neutral"}`;
  element.textContent = label || status || "Unknown";
}

async function loadHealth() {
  try {
    const health = await api("/healthz");
    state.reviewMode = Boolean(health.review_mode);
    state.maxCases = 1;
    if (state.reviewMode) {
      byId("budget").max = String(health.max_budget);
    }
    byId("submit-run").disabled = (health.runtime_ready === false || health.backend_ready === false);
    if (health.status_message) {
      byId("form-error").textContent = health.status_message;
      byId("form-error").classList.remove("hidden");
    }
  } catch (error) {
    byId("submit-run").disabled = true;
    byId("form-error").textContent = "The evaluation service could not be reached. Please reload the page in a moment.";
    byId("form-error").classList.remove("hidden");
  }
}

async function loadCatalog() {
  let payload;
  try { payload = await api("/v1/cases"); }
  catch (error) {
    byId("case-rows").innerHTML = '<tr><td colspan="4" class="empty-state">The case catalog is unavailable. Please reload to try again.</td></tr>';
    throw error;
  }
  state.cases = payload.cases || [];
  const domains = [...new Set(state.cases.map((item) => item.domain))].sort();
  byId("domain-filter").insertAdjacentHTML(
    "beforeend",
    domains.map((domain) => `<option value="${escapeHtml(domain)}">${escapeHtml(domain)}</option>`).join(""),
  );
  renderCases();
}

function visibleCases() {
  const threats = new Set(checkedValues("#threat-options input"));
  const domain = byId("domain-filter").value;
  const query = byId("case-search").value.trim().toLowerCase();
  return state.cases.filter((item) => {
    if (threats.size && !threats.has(item.threat_model)) return false;
    if (domain && item.domain !== domain) return false;
    if (query && !`${item.case_id} ${item.risk_category}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

function renderCases() {
  const matches = visibleCases();
  const pages = Math.max(1, Math.ceil(matches.length / state.pageSize));
  state.casePage = Math.min(state.casePage, pages - 1);
  const offset = state.casePage * state.pageSize;
  const rows = matches.slice(offset, offset + state.pageSize);
  byId("cases-prev").disabled = state.casePage === 0;
  byId("cases-next").disabled = state.casePage >= pages - 1;
  byId("case-page-info").textContent = matches.length
    ? `${offset + 1}–${offset + rows.length} of ${matches.length}` : "0 cases";
  byId("case-count").textContent = `${matches.length} cases`;
  byId("selection-summary").textContent = state.selected.size
    ? `${state.selected.size}/${state.maxCases} explicitly selected`
    : "Select one case";
  byId("case-rows").innerHTML = rows.length
    ? rows.map((item) => `
      <tr>
        <td class="checkbox-column"><input class="case-checkbox" type="checkbox" data-case-id="${escapeHtml(item.case_id)}" ${state.selected.has(item.case_id) ? "checked" : ""} ${item.availability?.runnable === false ? "disabled" : ""} aria-label="Select ${escapeHtml(item.case_id)}"></td>
        <td><button type="button" class="case-detail-link" data-case-id="${escapeHtml(item.case_id)}">${escapeHtml(item.case_id)}</button>${item.availability?.runnable === false ? '<span class="case-unavailable">Environment unavailable</span>' : ""}</td>
        <td>${escapeHtml(item.domain)}</td>
        <td><span class="tag ${escapeHtml(item.threat_model)}">${escapeHtml(item.threat_model)}</span></td>
      </tr>`).join("")
    : '<tr><td colspan="4" class="empty-state">No cases match the current filters.</td></tr>';

  document.querySelectorAll(".case-detail-link").forEach((button) => {
    button.addEventListener("click", () => showCaseDetails(button.dataset.caseId));
  });
  document.querySelectorAll(".case-checkbox").forEach((input) => {
    input.addEventListener("change", () => {
      const caseId = input.dataset.caseId;
      if (input.checked && state.selected.size >= state.maxCases) {
        input.checked = false;
        showToast(`This deployment allows at most ${state.maxCases} cases per job.`);
        return;
      }
      if (input.checked) { state.selected.add(caseId); showCaseDetails(caseId, false); }
      else state.selected.delete(caseId);
      renderCases();
    });
  });
}

let detailRequest = 0;
async function showCaseDetails(caseId, scroll = true) {
  const request = ++detailRequest;
  const panel = byId("case-detail-panel");
  const content = byId("case-detail-content");
  panel.classList.remove("hidden");
  content.textContent = "Loading case configuration…";
  if (scroll) panel.scrollIntoView({behavior: "smooth", block: "start"});
  try {
    const item = await api(`/v1/cases/detail?case_id=${encodeURIComponent(caseId)}`);
    if (request !== detailRequest) return;
    const block = (title, value) => `<div class="case-detail-block"><h3>${escapeHtml(title)}</h3><pre>${escapeHtml(typeof value === "string" ? value : JSON.stringify(value, null, 2))}</pre></div>`;
    content.innerHTML = `<p class="detail-case-id">${escapeHtml(item.case_id)}</p>`
      + (item.availability?.message ? `<p class="field-hint">${escapeHtml(item.availability.message)}</p>` : "")
      + block("Task", item.task_instruction || (item.threat_model === "direct" ? "No separate benign task: the generated attack prompt is delivered as the user instruction." : "Not specified in the task configuration."))
      + block("Attack goal", item.attack_goal)
      + block("Attack scope", item.constraints)
      + (item.policies?.length ? block("Task policy categories", item.policies.join(", ")) : "")
      + `<div class="case-detail-block"><h3>Available carriers</h3>${(item.carriers || []).map((carrier) => `<details class="carrier"><summary>${escapeHtml(carrier.id)} <span class="muted">${escapeHtml((carrier.modes || []).join(", "))}</span></summary><pre>${escapeHtml(JSON.stringify(carrier, null, 2))}</pre></details>`).join("") || "No enabled carriers."}</div>`
      + `<details class="case-detail-block"><summary>Target tools (${(item.target_tools || []).length})</summary><pre>${escapeHtml(JSON.stringify(item.target_tools || [], null, 2))}</pre></details>`
      + `<details class="case-detail-block"><summary>Dataset agent instructions</summary><pre>${escapeHtml(item.agent_system_prompt || "Not specified.")}</pre></details>`
      + block("Success criterion", item.success_definition);
  } catch (error) {
    if (request === detailRequest) content.textContent = error.message;
  }
}

function duration(seconds) {
  if (seconds == null) return "—";
  const total = Math.max(0, Math.floor(Number(seconds)));
  return total >= 60 ? `${Math.floor(total / 60)}m ${total % 60}s` : `${total}s`;
}

let lastTrajectory = "";
function renderTrajectory(execution) {
  if (!execution) return;
  const rows = (execution.trajectory || []).filter((event) => ["target", "tool_call", "tool_result"].includes(event.kind));
  const signature = JSON.stringify(rows);
  if (signature === lastTrajectory) return;
  lastTrajectory = signature;
  const labels = {target: "Target response", tool_call: "Tool call", tool_result: "Tool result"};
  byId("job-trajectory").innerHTML = rows.length ? rows.map((event) => `<details class="trajectory-event" open><summary>${escapeHtml(labels[event.kind] || "Execution")}${event.iteration ? ` · iteration ${escapeHtml(event.iteration)}` : ""}</summary><pre>${escapeHtml(event.text || "")}</pre></details>`).join("") : "Preparing evaluation. Target activity appears after environment setup and the first target-model response.";
}

function selectionPayload() {
  if (state.selected.size) return { case_ids: [...state.selected], max_cases: 1 };
  throw new Error("Select one case in the Case browser before starting the test.");
}

function runPayload() {
  return {
    red_backend: {
      base_url: byId("backend-url").value.trim(),
      api_key: byId("backend-key").value,
      model: byId("red-model").value.trim(),
    },
    target_backend: {
      base_url: byId("backend-url").value.trim(),
      api_key: byId("backend-key").value,
      model: byId("target-model").value.trim(),
    },
    selection: selectionPayload(),
    budget: Number(byId("budget").value),
    max_concurrency: 1,
    judge_model: byId("judge-model").value.trim(),
    judge_backend: "red",
    token_profile: "optimized_v3",
  };
}

function rememberJob(jobId) {
  state.activeJobId = jobId;
  state.activeJobFinal = false;
  // The fragment stays in this tab's URL; it is not sent in HTTP requests.
  if (/^[a-f0-9]{32}$/.test(jobId)) window.history?.replaceState(null, "", `#job=${jobId}`);
}

function restoreJobFromUrl() {
  const match = /^#job=([a-f0-9]{32})$/.exec(window.location?.hash || "");
  if (match) {
    state.activeJobId = match[1];
    state.activeJobFinal = false;
    if (byId("resume-code")) byId("resume-code").value = match[1];
  }
}

async function submitRun(event) {
  event.preventDefault();
  const errorBox = byId("form-error");
  const submit = byId("submit-run");
  errorBox.classList.add("hidden");
  submit.disabled = true;
  submit.textContent = "Submitting...";
  try {
    const accepted = await api("/v1/jobs", { method: "POST", body: JSON.stringify(runPayload()) });
    rememberJob(accepted.job_id);

    byId("backend-key").value = "";
    if (state.reviewMode) byId("backend-url").value = "";
    showToast(`Job ${accepted.job_id.slice(0, 8)} submitted.`);
    await loadJob(state.activeJobId);
    startPolling();
    await loadHistory();
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("hidden");
  } finally {
    submit.disabled = false;
    submit.textContent = "Start evaluation";
  }
}

function stageTitle(stage) {
  return stage?.id === 'environment' ? 'Preparing environment / starting target' : stage?.title;
}

function renderStage(job) {
  const panel = byId('job-stage');
  if (!panel) return;
  const active = job.status === 'running';
  panel.classList.toggle('hidden', !active);
  if (!active) return;
  const stage = job.execution?.stage;
  byId('job-stage-title').textContent = stageTitle(stage) || 'Evaluation in progress';
  byId('job-stage-detail').textContent = stage?.id === 'environment'
    ? 'Checking cached images and preparing isolated tools. No target trace has been recorded yet: setup or the target’s first model response may still be pending.'
    : stage?.detail || 'Waiting for the next execution update. Target activity will appear when available.';
  byId('job-stage-time').textContent = stage
    ? `In this stage: ${duration(stage.elapsed_seconds)} · Last recorded progress: ${duration(stage.idle_seconds)} ago`
    : 'The job is running; detailed stage information is not available for this run.';
  const warning = byId('job-stage-warning');
  let message = '';
  if (Number(stage?.observer_age_seconds) >= 30) {
    message = 'Execution status updates are delayed. This does not confirm that the worker is still progressing. Keep this job code; you can return to check it.';
  } else if (Number(stage?.idle_seconds) >= 300) {
    message = 'No new progress has been recorded for 5 minutes or more. A model or tool may still be responding; a stall is also possible. You can keep waiting or cancel this job.';
  }
  warning.textContent = message;
  warning.classList.toggle('hidden', !message);
}

function renderJob(job) {
  byId("job-empty").classList.add("hidden");
  byId("job-content").classList.remove("hidden");
  setChip(byId("job-status"), job.status, job.status);
  byId("job-id").textContent = job.job_id;
  byId("job-cases").textContent = formatNumber((job.selected_cases || []).length);
  byId("job-budget").textContent = formatNumber(job.config?.budget);
  if (byId("job-started")) byId("job-started").textContent = formatTime(job.started_at || job.created_at);

  byId("job-elapsed").textContent = duration(job.elapsed_seconds);
  renderTrajectory(job.execution);
  renderStage(job);
  byId('job-connection')?.classList.add('hidden');
  const progress = job.progress;
  let percent = job.status === "completed" ? 100 : 0;
  let label = job.status;
  if (job.status === "queued") {
    label = job.queue_position ? `Queued · position ${job.queue_position}. Starts automatically when a slot is available.` : "Starting your task…";
    byId("job-trajectory").textContent = "Waiting in queue. Target activity will appear when execution starts.";
    lastTrajectory = "";
  }
  if (progress?.total && job.status !== 'queued') {
    const settled = Number(progress.completed || 0) + Number(progress.failed || 0);
    percent = Math.round((settled / Number(progress.total)) * 100);
    label = job.status === 'running' && job.execution?.stage
      ? stageTitle(job.execution.stage) : `${settled}/${progress.total} settled, ${progress.running || 0} running`;
  }
  byId("job-progress-bar").style.width = `${percent}%`;
  byId("job-progress-label").textContent = label;
  byId("cancel-job").classList.toggle("hidden", !["queued", "running"].includes(job.status));
  const errorBox = byId("job-error");
  if (job.error) {
    errorBox.textContent = job.error;
    errorBox.classList.remove("hidden");
  } else {
    errorBox.classList.add("hidden");
  }
}

async function loadJob(jobId) {
  if (!jobId || state.loadingJobs.has(jobId)) return;
  state.loadingJobs.add(jobId);
  if (byId("job-id").textContent !== jobId) {
    byId("results-panel").classList.add("hidden");
    state.rawResult = null;
    lastTrajectory = "";
    byId("job-trajectory").textContent = "Waiting for execution records…";
  }
  try {
    const job = await api(`/v1/jobs/${encodeURIComponent(jobId)}`);
    if (jobId !== state.activeJobId) return;
    state.pollingErrorShown = false;
    renderJob(job);
    if (["completed", "failed", "cancelled", "interrupted"].includes(job.status)) {
      state.activeJobFinal = true;
      stopPolling();
      try {
        const result = await api(`/v1/jobs/${encodeURIComponent(jobId)}/result`);
        if (jobId !== state.activeJobId) return;
        renderResults(result);
      } catch (error) {
        if (jobId !== state.activeJobId) return;
        renderResults({single_case: {...(job.execution || {}), outcome: "inconclusive", elapsed_seconds: job.elapsed_seconds}});
        if (!error.status || error.status >= 500) {
          state.activeJobFinal = false;
          startPolling();
        }
      }
      await loadHistory();
    } else {
      state.activeJobFinal = false;
      byId("results-panel").classList.add("hidden");
    }
  } catch (error) {
    if (jobId !== state.activeJobId) return;
    if (error.status === 401 || error.status === 404) {
      state.activeJobFinal = true;
      showToast(error.message);
      stopPolling();
    } else {
      state.activeJobFinal = false;
      const connection = byId('job-connection');
      if (connection) {
        connection.textContent = 'Connection interrupted — retrying automatically. The server may still be running your job; do not submit it again.';
        connection.classList.remove('hidden');
      }
      if (!state.pollingErrorShown) showToast("Connection interrupted. Retrying automatically…");
      state.pollingErrorShown = true;
      startPolling();
    }
  } finally {
    state.loadingJobs.delete(jobId);
  }
}

function renderResults(result) {
  const view = result.single_case || {outcome: "inconclusive", attack_instance: null};
  state.rawResult = view;
  byId("results-panel").classList.remove("hidden");
  const labels = {success: "Attack succeeded", failure: "Attack did not succeed", inconclusive: "No valid verdict — execution incomplete"};
  byId("attack-outcome").textContent = labels[view.outcome] || labels.inconclusive;
  byId("result-elapsed").textContent = duration(view.elapsed_seconds);
  byId("attack-instance").textContent = view.attack_instance ? JSON.stringify(view.attack_instance, null, 2) : "No evaluated final attack instance is available.";
  byId("attack-instance-note").textContent = [view.notice, view.selected_iteration ? `Selected from iteration ${view.selected_iteration}. Sensitive values are redacted.` : ""].filter(Boolean).join(" ");
  byId("raw-result").textContent = JSON.stringify(view, null, 2);
  renderTrajectory(view);
}

async function cancelJob() {
  if (!state.activeJobId) return;
  const button = byId("cancel-job");
  button.disabled = true;
  try {
    await api(`/v1/jobs/${encodeURIComponent(state.activeJobId)}/cancel`, { method: "POST" });
    showToast("Cancellation requested.");
    await loadJob(state.activeJobId);
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

async function loadHistory() {
  if (state.reviewMode) return;
  try {
    const payload = await api("/v1/jobs?limit=20");
    const jobs = payload.jobs || [];
    byId("history-rows").innerHTML = jobs.length
      ? jobs.map((job) => `
        <tr data-job-id="${escapeHtml(job.job_id)}" tabindex="0">
          <td>${escapeHtml(formatTime(job.created_at))}</td>
          <td><code>${escapeHtml(job.job_id.slice(0, 12))}</code></td>
          <td>${formatNumber(job.case_count)}</td>
          <td>${formatNumber(job.config?.budget)}</td>
          <td><span class="status-chip ${escapeHtml(job.status)}">${escapeHtml(job.status)}</span></td>
        </tr>`).join("")
      : '<tr><td colspan="5" class="empty-state">No jobs yet.</td></tr>';
    document.querySelectorAll("#history-rows tr[data-job-id]").forEach((row) => {
      const open = () => {
        rememberJob(row.dataset.jobId);

        loadJob(state.activeJobId);
        startPolling();
        byId("job-title").scrollIntoView({ behavior: "smooth", block: "start" });
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
    });
  } catch (error) {
    byId("history-rows").innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(error.message)}</td></tr>`;
  }
}

function startPolling() {
  stopPolling();
  if (!state.activeJobId || state.activeJobFinal) return;
  state.pollTimer = window.setInterval(() => loadJob(state.activeJobId), 2000);
}

function stopPolling() {
  if (state.pollTimer) window.clearInterval(state.pollTimer);
  state.pollTimer = null;
}

function resetForm() {
  byId("run-form").reset();
  state.selected.clear();
  state.casePage = 0;
  byId("budget").value = state.reviewMode ? "1" : "3";
  document.querySelectorAll("#threat-options input").forEach((input) => { input.checked = true; });
  byId("domain-filter").value = "";
  byId("case-search").value = "";
  renderCases();
}

function bindEvents() {
  // Keep the job recovery code in the fragment when navigating this page.
  document.querySelectorAll('.topbar nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = byId(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  window.addEventListener?.("hashchange", () => {
    const previous = state.activeJobId;
    restoreJobFromUrl();
    if (state.activeJobId && state.activeJobId !== previous) {
      loadJob(state.activeJobId);
      startPolling();
    }
  });
  byId("run-form").addEventListener("submit", submitRun);
  byId("reset-form").addEventListener("click", resetForm);
  byId("cancel-job").addEventListener("click", cancelJob);
  byId("refresh-history")?.addEventListener("click", loadHistory);
  byId("resume-job")?.addEventListener("click", () => {
    const code = byId("resume-code").value.trim();
    if (!/^[a-f0-9]{32}$/.test(code)) return showToast("Enter a valid 32-character job code.");
    rememberJob(code);
    loadJob(code);
    startPolling();
  });
  byId("download-result")?.addEventListener("click", () => {
    if (!state.rawResult) return;
    const blob = new Blob([JSON.stringify(state.rawResult, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "evaluation-result.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const filterChanged = () => { state.casePage = 0; renderCases(); };
  byId("case-search").addEventListener("input", filterChanged);
  byId("domain-filter").addEventListener("change", filterChanged);
  document.querySelectorAll("#threat-options input").forEach((input) => input.addEventListener("change", filterChanged));
  byId("cases-prev").addEventListener("click", () => { state.casePage = Math.max(0, state.casePage - 1); renderCases(); });
  byId("cases-next").addEventListener("click", () => { state.casePage += 1; renderCases(); });
  document.querySelectorAll(".secret-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = byId(button.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });
  byId("select-visible").addEventListener("click", () => {
    const offset = state.casePage * state.pageSize;
    const visible = visibleCases().slice(offset, offset + state.pageSize)
      .filter(item => item.availability?.runnable !== false);
    const capacity = state.maxCases - state.selected.size;
    visible.slice(0, Math.max(0, capacity)).forEach((item) => state.selected.add(item.case_id));
    if (visible.length > capacity) showToast(`Selected the first ${Math.max(0, capacity)} visible cases.`);
    renderCases();
    if (state.selected.size) showCaseDetails([...state.selected][0], false);
  });
  byId("clear-selection").addEventListener("click", () => { state.selected.clear(); renderCases(); });
  byId("toggle-json").addEventListener("click", () => {
    const raw = byId("raw-result");
    raw.classList.toggle("hidden");
    byId("toggle-json").textContent = raw.classList.contains("hidden") ? "Raw JSON" : "Hide JSON";
  });
}

async function init() {
  bindEvents();
  restoreJobFromUrl();
  // Remove the legacy convenience bookmark; never create a visitor identifier.
  try { localStorage.removeItem("saber:last-job"); } catch (_) {}
  await loadHealth();
  await Promise.allSettled([loadCatalog(), loadHistory()]);
  if (state.activeJobId) {
    await loadJob(state.activeJobId);
    startPolling();
  }
}

document.addEventListener("DOMContentLoaded", init);
