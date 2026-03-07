const issuesContainer = document.getElementById("issues-container");
const issueCount = document.getElementById("issue-count");

const allFilterBtn = document.getElementById("all-filter-btn");
const openFilterBtn = document.getElementById("open-filter-btn");
const closedFilterBtn = document.getElementById("closed-filter-btn");

const searchInput = document.getElementById("input-search");
const btnSearch = document.getElementById("btn-search");

const spinner = document.getElementById("spinner");

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
function truncateText(text, limit = 80) {
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

function getBorderClass(status) {
  return status.toLowerCase() === "open"
    ? "border-green-500"
    : "border-violet-500";
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
      border-t-4
      ${getBorderClass(issue.status)}
      hover:shadow-md
      transition
    `;
    card.innerHTML = `
    <div class="flex items-center justify-between mb-3">
        ${getStatusIcon(issue.status)}

        <span class="text-xs px-2 py-1 rounded-full font-medium uppercase ${getPriorityClass(
          issue.priority,
        )}">
          ${issue.priority}
        </span>
      </div>

      <h3 class="font-semibold text-sm text-slate-900 leading-5">
        ${issue.title}
      </h3>

      <p class="text-xs text-slate-500 mt-1 leading-5">
        ${truncateText(issue.description, 80)}
      </p>

      <div class="mt-3 space-y-1 text-xs text-slate-500">
        <p><span class="font-medium text-slate-700">Status:</span> ${issue.status}</p>
        <p><span class="font-medium text-slate-700">Author:</span> ${issue.author}</p>
      </div>

      <div class="flex flex-wrap gap-1 mt-3">
        ${issue.labels
          .map(function (label) {
            return `
              <span class="text-[10px] px-2 py-1 rounded-full uppercase ${getLabelClass(
                label,
              )}">
                ${label}
              </span>
            `;
          })
          .join("")}
      </div>

      <div class="flex justify-between items-center text-xs text-slate-400 mt-4">
        <span>#${issue.id}</span>
        <span>${formatDate(issue.createdAt)}</span>
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

loadIssues();
