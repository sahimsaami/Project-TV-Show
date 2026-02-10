// I added some comments to make it clearer (I hope you like it).
let allEpisodes = [];
let episodesSection;
let counter;
let episodeSelect;

function setup() {
  const root = document.getElementById("root");
  root.textContent = "Loading episodes...";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then(res => res.json())
    .then(data => {
      allEpisodes = data;
      root.textContent = "";
      makePageForEpisodes(allEpisodes);
    })
    .catch(() => {
      root.textContent = "Error loading episodes";
    });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // make the search box and dropdown only once
  if (!document.getElementById("controls-wrapper")) {
    const controlsWrapper = document.createElement("div");
    controlsWrapper.id = "controls-wrapper";

    // 1. the search box
    const search = document.createElement("input");
    search.id = "search";
    search.placeholder = "Search name or code...";

    // 2. the dropdown menu 
    episodeSelect = document.createElement("select");
    episodeSelect.id = "episode-select";
    
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "all";
    defaultOpt.textContent = "Select an episode...";
    episodeSelect.appendChild(defaultOpt);

    allEpisodes.forEach(ep => {
      const s = ep.season.toString().padStart(2, "0");
      const n = ep.number.toString().padStart(2, "0");
      const code = `S${s}E${n}`;
      const option = document.createElement("option");
      option.value = ep.id;
      option.textContent = `${code} - ${ep.name}`;
      episodeSelect.appendChild(option);
    });

    // 3. the counter text
    counter = document.createElement("span");
    counter.id = "search-count";

    controlsWrapper.append(search, episodeSelect, counter);
    rootElem.prepend(controlsWrapper);

    // listen to search typing
    search.addEventListener("input", () => {
      const term = search.value.toLowerCase();
      const filtered = allEpisodes.filter(ep => {
        const code = `s${ep.season.toString().padStart(2, "0")}e${ep.number.toString().padStart(2, "0")}`;
        return ep.name.toLowerCase().includes(term) || code.includes(term);
      });
      makePageForEpisodes(filtered);
    });

    // listen to dropdown pick 
    episodeSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "all") makePageForEpisodes(allEpisodes);
      else makePageForEpisodes(allEpisodes.filter(ep => ep.id == val));
    });
  }

  // create area for cards
  if (!episodesSection) {
    episodesSection = document.createElement("section");
    episodesSection.id = "episodes-section";
    rootElem.appendChild(episodesSection);
  }

  // show episodes in 3D fantasy cards
  episodesSection.innerHTML = episodeList
    .map(element => {
      const displayCode = `S${element.season.toString().padStart(2, "0")}E${element.number.toString().padStart(2, "0")}`;
      const cleanSummary = element.summary.replace(/<[^>]*>/g, ""); 

      return `
        <article class="episode-card">
          <div class="card-header">
            <h3>${displayCode} - ${element.name}</h3>
          </div>
          <img src="${element.image ? element.image.medium : ''}" alt="${element.name}"/>
          <div class="card-summary">${cleanSummary}</div>
        </article>
      `;
    })
    .join('');

  // add footer at the bottom
  let footer = document.querySelector("footer");
  if (!footer) {
    footer = document.createElement("footer");
    rootElem.appendChild(footer);
  }
  footer.innerHTML = `<p style="color: #666;">Data provided by <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a></p>`;

  counter.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;
}

window.onload = setup;