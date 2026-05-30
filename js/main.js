import { initDeckEditor, getSavedDeck } from './deckEditor.js';
import { startMatch, drawBattleCard, selectEnergyFromPile, attachSelectedEnergyToDino, startAttackSelection, attemptEvolution, swapStarterWithField, moveStarterToField, playBattleCardFromHand, nextPhase, setRenderUI, showGY, battleState } from './battle.js';
import { getImagePath } from './utils.js';

let currentZoomCard = null;
let searchResolve = null;

window.showZoom = function(card, source, handIdx = null) {
  currentZoomCard = { card, source, handIdx };
  document.getElementById("zoomImage").src = getImagePath(card.name);
  document.getElementById("zoomImage").onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23c09a6b'/%3E%3Ctext x='150' y='200' text-anchor='middle' fill='black' font-size='24'%3E" + encodeURIComponent(card.name) + "%3C/text%3E%3C/svg%3E"; };
  document.getElementById("zoomEffectText").innerHTML = `<strong>Effect:</strong> ${card.effect || "No special effect."}`;
  const playBtn = document.getElementById("playFromZoomBtn");
  if (source === "hand") {
    playBtn.style.display = "inline-block";
    playBtn.onclick = () => { closeZoom(); playBattleCardFromHand(battleState.turn, handIdx); };
  } else {
    playBtn.style.display = "none";
  }
  document.getElementById("zoomModal").style.display = "flex";
};

window.closeZoom = function() {
  document.getElementById("zoomModal").style.display = "none";
};

window.closeSearchModal = function() {
  document.getElementById("searchModal").style.display = "none";
  if (searchResolve) searchResolve(null);
};

window.showGY = showGY;
window.closeGYModal = function() { document.getElementById("gyModal").style.display = "none"; };
window.showMainMenu = function() { /* handled below */ };
window.showDeckEditor = function() { /* handled below */ };
window.showBattlePage = function() { /* handled below */ };
window.showRulesPage = function() { /* handled below */ };

// Navigation
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
  initBattlePage();
}

function showRulesPage() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("rulesPage").classList.add("active");
}

window.showMainMenu = showMainMenu;
window.showDeckEditor = showDeckEditor;
window.showBattlePage = showBattlePage;
window.showRulesPage = showRulesPage;

function initBattlePage() {
  let p1Select = document.getElementById("p1DeckSelect");
  let p2Select = document.getElementById("p2DeckSelect");
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

// Attach menu card listeners
document.querySelectorAll(".menu-card").forEach(card => {
  card.addEventListener("click", () => {
    if(card.getAttribute("data-page") === "deckEditor") showDeckEditor();
    else if(card.getAttribute("data-page") === "battle") showBattlePage();
    else if(card.getAttribute("data-page") === "rules") showRulesPage();
  });
});

// Set render callback for battle
setRenderUI(() => {
  // renderBattleUI is defined in battle.js, but we need to call it externally?
  // Instead, we'll import renderBattleUI from battle.js – but it's not exported.
  // We'll keep the existing render function inside battle.js and call it via a global reference.
  // For simplicity, we'll attach a global update function.
  if (window.renderBattleUI) window.renderBattleUI();
});

// Inject the render function from battle into window – we need to re-export.
// Because of circular dependencies, we'll just call the one defined in battle.js later.
// To avoid complexity, I'll add a simple polling? No.
// Actually, we'll move the render function to main.js? But it's tied to battle state.
// Let's create a simple event system: after any action, we call a global refresh.
// In battle.js we already call renderBattleUI if set. We'll set it below.
// We'll define a placeholder function that will be overridden.

window.renderBattleUI = () => {}; // will be set by battle

import { renderBattleUI } from './battle.js'; // but battle.js hasn't exported it yet.
// To keep it clean, I'll add an export in battle.js: export function renderBattleUI() {...}
// I'll adjust battle.js accordingly.

showMainMenu();
