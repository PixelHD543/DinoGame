import { initDeckEditor, setShowZoomFunction } from './deckEditor.js';
import { startMatch, battleState, setRenderBattleUI } from './battle.js';
import { showZoom as showZoomUtil, closeZoom, showGY, closeGYModal, closeSearchModal } from './battle.js'; // battle exports these

function showMainMenu() {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("mainMenuPage").classList.add("active");
}

function showDeckEditor() {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("deckEditorPage").classList.add("active");
  initDeckEditor();
}

function showBattlePage() {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("battlePage").classList.add("active");
  initBattlePage();
}

function showRulesPage() {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("rulesPage").classList.add("active");
}

function initBattlePage() {
  let p1Select = document.getElementById("p1DeckSelect");
  let p2Select = document.getElementById("p2DeckSelect");
  p1Select.innerHTML = ""; p2Select.innerHTML = "";
  for(let i=1;i<=3;i++) {
    p1Select.innerHTML += `<option value="p1_deck${i}">Player 1 - Deck ${i}</option>`;
    p2Select.innerHTML += `<option value="p2_deck${i}">Player 2 - Deck ${i}</option>`;
  }
  document.getElementById("startMatchBtn").onclick = () => {
    import('./deckEditor.js').then(({ getSavedDeck }) => {
      startMatch(getSavedDeck(p1Select.value), getSavedDeck(p2Select.value));
    });
  };
  document.getElementById("backToMenuFromBattle").onclick = showMainMenu;
}

// Global functions for HTML onclick
window.showMainMenu = showMainMenu;
window.showDeckEditor = showDeckEditor;
window.showBattlePage = showBattlePage;
window.showRulesPage = showRulesPage;
window.closeZoom = closeZoom;
window.showGY = showGY;
window.closeGYModal = closeGYModal;
window.closeSearchModal = closeSearchModal;

// Set up zoom function for deck editor
setShowZoomFunction(showZoomUtil);

// Start
showMainMenu();
