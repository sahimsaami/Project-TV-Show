// Sahim Saami - TV Show and Episode Browser
let allEpisodes = [];
let allShows = [];
let showsCache = {};
let episodesSection;
let showsSection; // New section for the front page
let counter;
let episodeSelect;
let showSelect;
let searchInput; 

function setup() {
  const root = document.getElementById("root");
  root.textContent = "Loading...";
  
  //  Fetch all shows for the landing page
  fetch("https://api.tvmaze.com/shows")
    .then(res => res.json())
    .then(data => {
      // Step 2: Sort shows alphabetically
      allShows = data.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
      root.textContent = "";
      
      // Create global controls once
      createControls();
      
      //  Show the shows listing page by default
      makePageForShows(allShows);
    })
    .catch(() => {
      root.textContent = "Error loading shows";
    });
}

function createControls() {
  const rootElem = document.getElementById("root");
  const controlsWrapper = document.createElement("div");
  controlsWrapper.id = "controls-wrapper";

  // Navigation link to go back to shows listing
  const backLink = document.createElement("a");
  backLink.href = "#";
  backLink.id = "back-link";
  backLink.textContent = "⬅ Back to Shows List";
  backLink.style.display = "none"; 
  backLink.onclick = (e) => {
    e.preventDefault();
    makePageForShows(allShows);
  };

  showSelect = document.createElement("select");
  showSelect.id = "show-select";
  // Add a default option
  const defaultShow = document.createElement("option");
  defaultShow.textContent = "Select a show...";
  showSelect.appendChild(defaultShow);

  allShows.forEach(show => {
    const opt = document.createElement("option");
    opt.value = show.id;
    opt.textContent = show.name;
    showSelect.appendChild(opt);
  });
  
  showSelect.addEventListener("change", (e) => loadShow(e.target.value));

  searchInput = document.createElement("input");
  searchInput.id = "search";
  searchInput.placeholder = "Search shows...";

  episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.style.display = "none"; // Hidden on shows page

  counter = document.createElement("span");
  counter.id = "search-count";

  controlsWrapper.append(backLink, showSelect, episodeSelect, searchInput, counter);
  rootElem.prepend(controlsWrapper);

  // Search logic for both shows and episodes
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const isShowingEpisodes = episodesSection.style.display === "flex";

    if (isShowingEpisodes) {
      // Search episodes
      const filtered = allEpisodes.filter(ep => 
        ep.name.toLowerCase().includes(term) || (ep.summary && ep.summary.toLowerCase().includes(term))
      );
      displayEpisodes(filtered);
    } else {
      // Search shows (by name, genre, or summary)
      const filtered = allShows.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.genres.some(g => g.toLowerCase().includes(term)) ||
        (s.summary && s.summary.toLowerCase().includes(term))
      );
      makePageForShows(filtered);
    }
  });

  // Create containers for shows and episodes
  showsSection = document.createElement("section");
  showsSection.id = "shows-section";
  rootElem.appendChild(showsSection);

  episodesSection = document.createElement("section");
  episodesSection.id = "episodes-section";
  episodesSection.style.display = "none";
  rootElem.appendChild(episodesSection);
}

// Function to show all shows on the front page
function makePageForShows(showList) {
  // Toggle visibility
  showsSection.style.display = "flex";
  episodesSection.style.display = "none";
  document.getElementById("back-link").style.display = "none";
  episodeSelect.style.display = "none";
  searchInput.placeholder = "Search shows...";

  showsSection.innerHTML = showList.map(show => {
    const summary = show.summary ? show.summary.replace(/<[^>]*>/g, "") : "";
    return `
      <article class="show-card">
        <h2 onclick="loadShow(${show.id})" style="cursor:pointer; color:#ffd700;">${show.name}</h2>
        <div class="show-body">
          <img src="${show.image ? show.image.medium : ''}" alt="${show.name}">
          <div class="show-info">
            <p>${summary.substring(0, 300)}...</p>
            <div class="extra-info">
              <p><strong>Rating:</strong> ⭐${show.rating.average || "N/A"}</p>
              <p><strong>Genres:</strong> ${show.genres.join(" | ")}</p>
              <p><strong>Status:</strong> ${show.status}</p>
              <p><strong>Runtime:</strong> ${show.runtime} min</p>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  counter.textContent = `Found ${showList.length} shows`;
}

function loadShow(showId) {
  if (!showId) return;
  // Clear search when switching
  searchInput.value = "";

  if (showsCache[showId]) {
    allEpisodes = showsCache[showId];
    setupEpisodesView();
  } else {
    fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
      .then(res => res.json())
      .then(data => {
        allEpisodes = data;
        showsCache[showId] = data;
        setupEpisodesView();
      });
  }
}

function setupEpisodesView() {
  showsSection.style.display = "none";
  episodesSection.style.display = "flex";
  document.getElementById("back-link").style.display = "inline";
  episodeSelect.style.display = "inline-block";
  searchInput.placeholder = "Search episodes...";
  
  updateEpisodeDropdown();
  displayEpisodes(allEpisodes);
}

function displayEpisodes(episodeList) {
  episodesSection.innerHTML = episodeList.map(element => {
    const displayCode = `S${element.season.toString().padStart(2, "0")}E${element.number.toString().padStart(2, "0")}`;
    const summary = element.summary ? element.summary.replace(/<[^>]*>/g, "") : "No summary available"; 
    return `
      <article class="episode-card">
        <div class="card-header"><h3>${displayCode} - ${element.name}</h3></div>
        <img src="${element.image ? element.image.medium : ''}" alt="${element.name}"/>
        <div class="card-summary">${summary}</div>
      </article>
    `;
  }).join('');
  counter.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;
}

function updateEpisodeDropdown() {
  episodeSelect.innerHTML = '<option value="all">All Episodes</option>';
  allEpisodes.forEach(ep => {
    const code = `S${ep.season.toString().padStart(2, "0")}E${ep.number.toString().padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });
}

window.onload = setup;