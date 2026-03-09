const issuesContainer = document.getElementById("issues-container");
const issueCount = document.getElementById("issue-count");

const allFilterBtn = document.getElementById("all-filter-btn");
const openFilterBtn = document.getElementById("open-filter-btn");
const closedFilterBtn = document.getElementById("closed-filter-btn");

const searchInput = document.getElementById("input-search");
const btnSearch = document.getElementById("btn-search");

const spinner = document.getElementById("spinner");
const issueModal = document.getElementById("issue_modal");
const detailsContainer = document.getElementById("details-container");

let allIssues = [];
let displayedIssues = [];
let currentTab = "all";

function manageSpinner(status) {
  if (status) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}
function truncateText(text= "", limit = 80) {
  if (text.length <= limit) {
    return text;
  }
  return text.slice(0, limit) + "...";
}

function getPriorityClass(priority) {
  const value = priority.toLowerCase();

  if (value === "high") {
    return "bg-red-100 text-red-500";
  }
  if (value === "medium") {
    return "bg-amber-100 text-amber-500";
  }

  return "bg-slate-100 text-slate-500";
}
function getPriorityBadgeClass(priority) {
  const value = priority.toLowerCase();

  if (value === "high") {
    return "bg-red-500 text-white";
  }

  if (value === "medium") {
    return "bg-amber-400 text-white";
  }

  return "bg-slate-400 text-white";
}

function getBorderClass(status) {
  return status.toLowerCase() === "open"
    ? "border-t-[#00A96E]"
    : "border-t-[#A855F7]";
}

function getStatusIcon(status) {
  return status.toLowerCase() === "open"
    ? `
      <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
        <img src="assets/Open-Status.png" class="w-4 h-4">
      </div>
    `
    : `
      <div class="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
        <img src="assets/Closed-Status.png" class="w-4 h-4">
      </div>
    `;
}

function getLabelClass(label) {
  const value = label.toLowerCase();
  if (value === "bug") {
    return "bg-red-100 text-red-500";
  }
  if (value === "help wanted") {
    return "bg-amber-100 text-amber-500";
  }

  if (value === "enhancement") {
    return "bg-green-100 text-green-600";
  }

  if (value === "documentation") {
    return "bg-sky-100 text-sky-600";
  }

  if (value === "good first issue") {
    return "bg-purple-100 text-purple-600";
  }

  return "bg-slate-100 text-slate-500";
}

function setActiveTab(activeId) {
  const buttons = [allFilterBtn, openFilterBtn, closedFilterBtn];
  buttons.forEach(function (button) {
    button.className =
      "btn h-10 min-h-10 px-6 rounded-md bg-white text-slate-500 border border-slate-200 hover:bg-slate-50";
  });
  document.getElementById(activeId).className =
    "btn h-10 min-h-10 px-6 rounded-md border-0 bg-[#4f46e5] text-white hover:bg-[#4338ca]";
}

function displayIssues(issues) {
  issuesContainer.innerHTML = "";
  issueCount.innerText = issues.length;

  if (issues.length === 0) {
    issuesContainer.innerHTML = `
        <div class="col-span-full bg-white border border-slate-200 rounded-lg p-10 text-center">
        <h3 class="text-xl font-semibold text-slate-800">No Issues Found</h3>
        <p class="text-slate-500 mt-2">There are no issues available in this section.</p>
      </div>
      `;
    return;
  }
  issues.forEach(function (issue) {
    const card = document.createElement("div");

    card.className = `
      bg-white
      border
      border-slate-200
      rounded-lg
      p-4
      border-t-[3px]
      ${getBorderClass(issue.status)}
      shadow-[0px_3px_6px_rgba(0,0,0,0.08)]
      transition
      flex
      flex-col
      h-full
    `;

    card.innerHTML = `
  <div class="flex-1">
    <div class="flex items-center justify-between mb-3">
      ${getStatusIcon(issue.status)}

      <span class="text-xs px-3 py-1 rounded-full font-medium uppercase ${getPriorityClass(
        issue.priority,
      )}">
        ${issue.priority}
      </span>
    </div>

    <h3
      onclick="loadIssueDetails(${issue.id})"
      class="font-semibold text-sm text-slate-900 leading-5 cursor-pointer hover:underline capitalize min-h-10"
    >
      ${issue.title}
    </h3>

    <p class="text-xs text-slate-500 mt-3 leading-5 ">
      ${truncateText(issue.description, 70)}
    </p>
    

    <div class="flex flex-wrap gap-2 mt-3">
      ${issue.labels
        .map(function (label) {
          return `
            <span class="text-[10px] px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${getLabelClass(
              label,
            )}">
              ${label}
            </span>
          `;
        })
        .join("")}
    </div>
  </div>

  <div class="bg-white border-t border-slate-200 mt-3 pt-3 px-3 -mx-4 pb-2">
    <p class="text-xs text-slate-500">
      #${issue.id} by ${issue.author}
    </p>

    <p class="text-xs text-slate-400 mt-1">
      ${formatDate(issue.createdAt)}
    </p>
  </div>
`;

    issuesContainer.appendChild(card);
  });
}
function applyTabFilter(issues, tabName) {
  if (tabName === "all") {
    return issues;
  }
  return issues.filter(function (issue) {
    return issue.status.toLowerCase() === tabName;
  });
}
function renderCurrentView() {
  const filteredIssues = applyTabFilter(displayedIssues, currentTab);
  displayIssues(filteredIssues);
}

async function loadIssues() {
  try {
    manageSpinner(true);
    const response = await fetch(
      "https://phi-lab-server.vercel.app/api/v1/lab/issues",
    );
    const result = await response.json();
    allIssues = result.data;
    displayedIssues = [...allIssues];
    renderCurrentView();
  } catch (error) {
    issuesContainer.innerHTML = `
        <div class="col-span-full bg-white border border-red-200 rounded-lg p-10 text-center">
        <h3 class="text-xl font-semibold text-red-500">Failed to load issues</h3>
        <p class="text-slate-500 mt-2">Please try again later.</p>
      </div>
        `;
  } finally {
    manageSpinner(false);
  }
}
async function handleSearch() {
  const searchText = searchInput.value.trim();
  try {
    manageSpinner(true);
    if (searchText === "") {
      displayedIssues = [...allIssues];
      renderCurrentView();
      return;
    }
    const response = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(searchText)}`,
    );
    const result = await response.json();
    displayedIssues = result.data;
    renderCurrentView();
  } catch (error) {
    issuesContainer.innerHTML = `<div class="col-span-full bg-white border border-red-200 rounded-lg p-10 text-center">
        <h3 class="text-xl font-semibold text-red-500">Search failed</h3>
        <p class="text-slate-500 mt-2">Please try a different keyword.</p>
      </div>`;
  } finally {
    manageSpinner(false);
  }
}
async function loadIssueDetails(id) {
  try {
    const response = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    );

    const result = await response.json();
    const issue = result.data;

    detailsContainer.innerHTML = `
      <h3 class="text-2xl font-bold text-slate-900">
        ${issue.title}
      </h3>

      <div class="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-500">
        <span class="${
          issue.status.toLowerCase() === "open"
            ? "bg-green-500 text-white"
            : "bg-violet-500 text-white"
        } px-4 py-2 rounded-full font-medium text-xs capitalize">
          ${issue.status}
        </span>

        <span>•</span>

        <span>Opened by ${issue.author}</span>

        <span>•</span>

        <span>${formatDate(issue.createdAt)}</span>
      </div>

      <div class="flex flex-wrap gap-2 mt-6">
        ${issue.labels
          .map(function (label) {
            return `
              <span class="text-xs px-3 py-2 rounded-full uppercase ${getLabelClass(
                label,
              )}">
                ${label}
              </span>
            `;
          })
          .join("")}
      </div>

      <p class="mt-6 text-slate-500 leading-8">
        ${issue.description}
      </p>

      <div class="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-6">
        <div>
          <p class="text-slate-500">Assignee:</p>
          <p class="font-bold text-slate-900 mt-1">
            ${issue.assignee ? issue.assignee : "Not assigned"}
          </p>
        </div>

        <div>
          <p class="text-slate-500">Priority:</p>
          <span class="inline-block mt-1 px-4 py-1.5 text-xs rounded-full font-semibold uppercase ${getPriorityBadgeClass(
            issue.priority,
          )}">
            ${issue.priority}
          </span>
        </div>
      </div>
    `;

    issueModal.showModal();
  } catch (error) {
    alert("Failed to load issue details");
  }
}

function handleTabClick(tabName, activeId) {
  currentTab = tabName;
  setActiveTab(activeId);
  manageSpinner(true);
  setTimeout(function () {
    renderCurrentView();
    manageSpinner(false);
  }, 300);
}

allFilterBtn.addEventListener("click", function () {
  handleTabClick("all", "all-filter-btn");
});
openFilterBtn.addEventListener("click", function () {
  handleTabClick("open", "open-filter-btn");
});
closedFilterBtn.addEventListener("click", function () {
  handleTabClick("closed", "closed-filter-btn");
});

btnSearch.addEventListener("click", function () {
  handleSearch();
});

searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});

searchInput.addEventListener("input", function () {
  if (searchInput.value.trim() === "") {
    manageSpinner(true);

    setTimeout(function () {
      displayedIssues = [...allIssues];
      renderCurrentView();
      manageSpinner(false);
    }, 200);
  }
});
loadIssues();
