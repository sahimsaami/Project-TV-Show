//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const selectOneOfEpisodes = document.createElement("section");
  selectOneOfEpisodes.style.cssText =  "display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding: 20px; background-color: #f3f3f3;";

  rootElem.append(selectOneOfEpisodes);

  const episodeListtodisplay = episodeList.map(element => { 
    const seasonCode = element.season.toString().padStart(2, '0');
    const episodeCode = element.number.toString().padStart(2, '0'); 
    const displayCode = `S${seasonCode}E${episodeCode}`;
    return `
    <article class="episode" style=" background-color: #ffffff; border-radius: 1px; width: 300px; height: 450px; padding: 1px; box-shadow: 0 3px 6px rgba(0,0,0,0.1);  max-width: 25%; justify-content: center; margin: 1px;">
      <h3 style="border: 1px solid #000; padding: 11px; border-radius: 5px; text-align: center;">${element.name} - ${displayCode}</h3>
      <img src="${element.image ? element.image.medium : ''}" alt="${element.name}" style="width: 70%; border-radius: 5px; margin-left: 50px;"/>
      <div style="text-align: left; font-size: 1em; color: #555; margin-left: 11px; margin-right: 40px; padding: 5px; line-height: 1.5;">${element.summary}</div>
    </article>
  `}).join('');
  selectOneOfEpisodes.innerHTML = episodeListtodisplay;  
const footer = document.createElement("footer");
  footer.innerHTML = `<p style="text-align:center; margin-top: 20px;">Data provided by <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a></p>`;
  rootElem.appendChild(footer);}



window.onload = setup;
