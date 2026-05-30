import { ALL_CARDS } from './constants.js';
import { getImagePath } from './utils.js';

let currentDeckKey = "p1_deck1";
let currentDeckCards = [];
let cardSearchFilter = "";
let showZoomCallback = null;

export function initDeckEditor(showZoomFn) {
  showZoomCallback = showZoomFn;
  renderCardPool();
  document.getElementById("deckSelect").onchange = (e) => { currentDeckKey = e.target.value; loadDeck(); };
  document.getElementById("loadDeckBtn").onclick = loadDeck;
  document.getElementById("saveDeckBtn").onclick = saveCurrentDeck;
  document.getElementById("clearDeckBtn").onclick = clearCurrentDeck;
  document.getElementById("cardSearch").oninput = (e) => { cardSearchFilter = e.target.value; renderCardPool(); };
  loadDeck();
}

function renderCardPool() {
  let container = document.getElementById("cardPoolContainer");
  container.innerHTML = "";
  let filtered = ALL_CARDS.filter(c => c.name.toLowerCase().includes(cardSearchFilter.toLowerCase()));
  filtered.forEach(card => {
    let div = document.createElement("div"); div.className = "editable-card";
    let img = document.createElement("img"); img.src = getImagePath(card.name);
    img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23c09a6b'/%3E%3Ctext x='100' y='150' text-anchor='middle' fill='black' font-size='30'%3E🃏%3C/text%3E%3C/svg%3E"; };
    img.addEventListener("click", (e) => { e.stopPropagation(); if(showZoomCallback) showZoomCallback(card, "pool"); if(currentDeckCards.length < 30) { currentDeckCards.push({ id: card.id, category: card.category }); renderCurrentDeck(); } else alert("Max 30 cards"); });
    div.appendChild(img);
    div.onclick = () => { if(currentDeckCards.length < 30) { currentDeckCards.push({ id: card.id, category: card.category }); renderCurrentDeck(); if(showZoomCallback) showZoomCallback(card, "pool"); } else alert("Max 30 cards"); };
    container.appendChild(div);
  });
}

function renderCurrentDeck() {
  let container = document.getElementById("currentDeckList");
  container.innerHTML = "";
  currentDeckCards.forEach((ref, idx) => {
    let full = ALL_CARDS.find(c => c.id === ref.id && c.category === ref.category);
    if(!full) return;
    let slot = document.createElement("div"); slot.className = "deck-slot";
    let img = document.createElement("img"); img.src = getImagePath(full.name);
    img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' fill='%23c09a6b'/%3E%3Ctext x='50' y='80' text-anchor='middle' fill='black' font-size='30'%3E🃏%3C/text%3E%3C/svg%3E"; };
    img.addEventListener("click", (e) => { e.stopPropagation(); if(showZoomCallback) showZoomCallback(full, "deck"); });
    let nameSpan = document.createElement("span"); nameSpan.innerText = full.name;
    let delBtn = document.createElement("button"); delBtn.innerText = "❌"; delBtn.onclick = () => { currentDeckCards.splice(idx,1); renderCurrentDeck(); };
    slot.append(img, nameSpan, delBtn);
    container.appendChild(slot);
  });
  document.getElementById("deckSizeDisplay").innerText = `${currentDeckCards.length}/30 cards`;
}

function loadDeck() {
  const saved = localStorage.getItem(currentDeckKey);
  currentDeckCards = saved ? JSON.parse(saved) : ALL_CARDS.slice(0, 15).map(c => ({ id: c.id, category: c.category }));
  renderCurrentDeck();
}

function saveCurrentDeck() {
  localStorage.setItem(currentDeckKey, JSON.stringify(currentDeckCards));
  alert("Deck saved!");
}

function clearCurrentDeck() {
  if(confirm("Clear deck?")) {
    currentDeckCards = [];
    renderCurrentDeck();
  }
}

export function getSavedDeck(key) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : ALL_CARDS.slice(0, 15).map(c => ({ id: c.id, category: c.category }));
}
