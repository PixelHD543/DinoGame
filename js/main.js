import { initDeckEditor, getSavedDeck } from './deckEditor.js';
import { startMatch, drawBattleCard, startAttackSelection, attemptEvolution, swapStarterWithField, moveStarterToField, playBattleCardFromHand, nextPhase, showGY, renderBattleUI, battleState } from './battle.js';
import { getImagePath } from './utils.js';
import { initCampaign, showCampaignMenu } from './campaign.js';

// Zoom panel (left side)
let currentZoomCard = null;
let currentZoomHandIdx = null;

export function showZoomPanel(card, source, handIdx = null) {
  currentZoomCard = card;
  currentZoomHandIdx = handIdx;
  const panel = document.getElementById("zoomPanel");
  const img = document.getElementById("zoomPanelImage");
  const textDiv = document.getElementById("zoomPanelText");
  const playBtn = document.getElementById("playFromZoomBtn");
  img.src = getImagePath(card.name);
  img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23c09a6b'/%3E%3Ctext x='150' y='200' text-anchor='middle' fill='black' font-size='24'%3E" + encodeURIComponent(card.name) + "%3C/text%3E%3C/svg%3E"; };
  textDiv.innerHTML = `<strong>${card.name}</strong><br>${card.effect || "No special effect."}<br>${card.power ? `⚡${card.power} ❤️${card.hp}` : ""}`;
  if (source === "hand" && battleState && battleState.turn === (card.player || 1)) {
    playBtn.style.display = "inline-block";
    playBtn.onclick = () => {
      closeZoomPanel();
      playBattleCardFromHand(battleState.turn, handIdx);
    };
  } else {
    playBtn.style.display = "none";
  }
  panel.classList.add("active");
}

export function closeZoomPanel() {
  document.getElementById("zoomPanel").classList.remove("active");
  currentZoomCard = null;
  currentZoomHandIdx = null;
}

// Global function for HTML buttons
window.showZoomPanel = showZoomPanel;
window.closeZoomPanel = closeZoomPanel;
window.closeSearchModal = function() { document.getElementById("searchModal").style.display = "none"; };
window.closeGYModal = function() { document.getElementById("gyModal").style.display = "none"; };

function showMainMenu() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("mainMenuPage").classList.add("active");
}

function showDeckEditor() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("deckEditorPage").classList.add("active");
  initDeckEditor(showZoomPanel);
}

function showBattlePage() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("battlePage").classList.add("active");
  const p1Select = document.getElementById("p1DeckSelect");
  const p2Select = document.getElementById("p2DeckSelect");
  p1Select.innerHTML = ""; p2Select.innerHTML = "";
  for(let i=1;i<=3;i++) {
    p1Select.innerHTML += `<option value="p1_deck${i}">Player 1 - Deck ${i}</option>`;
    p2Select.innerHTML += `<option value="p2_deck${i}">Player 2 - Deck ${i}</option>`;
  }
  document.getElementById("startMatchBtn").onclick = () => {
    startMatch(getSavedDeck(p1Select.value), getSavedDeck(p2Select.value));
  };
  document.getElementById("backToMenuFromBattle").onclick = showMainMenu;
}

function showRulesPage() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("rulesPage").classList.add("active");
}

function showSettingsPage() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("settingsPage").classList.add("active");
  loadZoneSettings();
}

// Zone customisation
function loadZoneSettings() {
  const saved = localStorage.getItem("zoneBackgrounds");
  if(saved) {
    const bgs = JSON.parse(saved);
    if(bgs.starter) document.getElementById("starterZoneImgPreview").style.backgroundImage = `url(${bgs.starter})`;
    if(bgs.dino) document.getElementById("dinoZoneImgPreview").style.backgroundImage = `url(${bgs.dino})`;
    // etc. – we'll handle file uploads later
  }
}

function saveZoneSettings() {
  const bgs = {};
  const starterFile = document.getElementById("starterZoneImg").files[0];
  const dinoFile = document.getElementById("dinoZoneImg").files[0];
  const researchFile = document.getElementById("researchZoneImg").files[0];
  const energyFile = document.getElementById("energyZoneImg").files[0];
  const fieldFile = document.getElementById("fieldZoneImg").files[0];
  // In a full version, you'd convert to dataURL and store. For simplicity, we store the file name.
  // Actually, we can store data URLs.
  const reader = (file, callback) => {
    if(file) {
      const r = new FileReader();
      r.onload = () => callback(r.result);
      r.readAsDataURL(file);
    } else callback(null);
  };
  let pending = 0;
  const results = {};
  const done = () => {
    localStorage.setItem("zoneBackgrounds", JSON.stringify(results));
    alert("Zone backgrounds saved. They will apply in the next battle.");
    showMainMenu();
  };
  reader(starterFile, (url) => { results.starter = url; pending--; if(pending===0) done(); });
  reader(dinoFile, (url) => { results.dino = url; pending--; if(pending===0) done(); });
  reader(researchFile, (url) => { results.research = url; pending--; if(pending===0) done(); });
  reader(energyFile, (url) => { results.energy = url; pending--; if(pending===0) done(); });
  reader(fieldFile, (url) => { results.field = url; pending--; if(pending===0) done(); });
  pending = 5;
}

function resetZoneImages() {
  localStorage.removeItem("zoneBackgrounds");
  alert("Zone backgrounds reset to default.");
  showMainMenu();
}

window.showMainMenu = showMainMenu;
window.showDeckEditor = showDeckEditor;
window.showBattlePage = showBattlePage;
window.showRulesPage = showRulesPage;
window.showSettingsPage = showSettingsPage;
window.saveZoneSettings = saveZoneSettings;
window.resetZoneImages = resetZoneImages;

document.querySelectorAll(".menu-card").forEach(card => {
  card.addEventListener("click", () => {
    if(card.getAttribute("data-page") === "deckEditor") showDeckEditor();
    else if(card.getAttribute("data-page") === "battle") showBattlePage();
    else if(card.getAttribute("data-page") === "campaign") showCampaignMenu();
    else if(card.getAttribute("data-page") === "settings") showSettingsPage();
    else if(card.getAttribute("data-page") === "rules") showRulesPage();
  });
});

initCampaign();
showMainMenu();
