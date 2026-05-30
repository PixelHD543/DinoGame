import { ALL_CARDS } from './cardData.js';
import { getImagePath, shuffle } from './utils.js';

const DECK_KEYS = ["p1_deck1","p1_deck2","p1_deck3","p2_deck1","p2_deck2","p2_deck3"];

export function getSavedDeck(key) {
  let saved = localStorage.getItem(key);
  if(saved) return JSON.parse(saved);
  return ALL_CARDS.slice(0, 15).map(c => ({ id: c.id, category: c.category }));
}

export function saveDeck(key, deck) {
  localStorage.setItem(key, JSON.stringify(deck));
}

let currentDeckKey = "p1_deck1";
let currentDeckCards = [];
let cardSearchFilter = "";

export function initDeckEditor() {
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
    img.addEventListener("click", (e) => { e.stopPropagation(); showZoom(card, "pool"); if(currentDeckCards.length < 30) { currentDeckCards.push({ id: card.id, category: card.category }); renderCurrentDeck(); } else alert("Max 30 cards"); });
    div.appendChild(img);
    div.onclick = () => { if(currentDeckCards.length < 30) { currentDeckCards.push({ id: card.id, category: card.category }); renderCurrentDeck(); showZoom(card, "pool"); } else alert("Max 30 cards"); };
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
    img.addEventListener("click", (e) => { e.stopPropagation(); showZoom(full, "deck"); });
    let nameSpan = document.createElement("span"); nameSpan.innerText = full.name;
    let delBtn = document.createElement("button"); delBtn.innerText = "❌"; delBtn.onclick = () => { currentDeckCards.splice(idx,1); renderCurrentDeck(); };
    slot.append(img, nameSpan, delBtn);
    container.appendChild(slot);
  });
  document.getElementById("deckSizeDisplay").innerText = `${currentDeckCards.length}/30 cards`;
}

function loadDeck() {
  currentDeckCards = getSavedDeck(currentDeckKey);
  renderCurrentDeck();
}

function saveCurrentDeck() {
  saveDeck(currentDeckKey, currentDeckCards);
  alert("Deck saved!");
}

function clearCurrentDeck() {
  if(confirm("Clear deck?")) {
    currentDeckCards = [];
    renderCurrentDeck();
  }
}

// Placeholder for showZoom – will be set by main.js
let showZoom = () => {};
export function setShowZoomFunction(fn) { showZoom = fn; }
