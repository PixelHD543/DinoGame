import { initDeckEditor, getSavedDeck } from './deckEditor.js';
import { startMatch, drawBattleCard, selectEnergyFromPile, attachSelectedEnergyToDino, startAttackSelection, attemptEvolution, swapStarterWithField, moveStarterToField, playBattleCardFromHand, nextPhase, showGY, renderBattleUI, battleState } from './battle.js';
import { getImagePath } from './utils.js';

window.showZoom = function(card, source, handIdx = null) {
  document.getElementById("zoomImage").src = getImagePath(card.name);
  document.getElementById("zoomImage").onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23c09a6b'/%3E%3Ctext x='150' y='200' text-anchor='middle' fill='black' font-size='24'%3E" + encodeURIComponent(card.name) + "%3C/text%3E%3C/svg%3E"; };
  document.getElementById("zoomEffectText").innerHTML = `<strong>Effect:</strong> ${card.effect || "No special effect."}`;
  const playBtn = document.getElementById("playFromZoomBtn");
  if (source === "hand") {
    playBtn.style.display = "inline-block";
    playBtn.onclick = () => { window.closeZoom(); playBattleCardFromHand(battleState?.turn, handIdx); };
  } else {
    playBtn.style.display = "none";
  }
  document.getElementById("zoomModal").style.display = "flex";
};

window.closeZoom = function() { document.getElementById("zoomModal").style.display = "none"; };
window.closeSearchModal = function() { document.getElementById("searchModal").style.display = "none"; };
window.closeGYModal = function() { document.getElementById("gyModal").style.display = "none"; };

function showMainMenu() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("mainMenuPage").classList.add("active");
}

function showDeckEditor() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("deckEditorPage").classList.add("active");
  initDeckEditor(window.showZoom);
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

window.showMainMenu = showMainMenu;
window.showDeckEditor = showDeckEditor;
window.showBattlePage = showBattlePage;
window.showRulesPage = showRulesPage;

document.querySelectorAll(".menu-card").forEach(card => {
  card.addEventListener("click", () => {
    if(card.getAttribute("data-page") === "deckEditor") showDeckEditor();
    else if(card.getAttribute("data-page") === "battle") showBattlePage();
    else if(card.getAttribute("data-page") === "rules") showRulesPage();
  });
});

showMainMenu();
