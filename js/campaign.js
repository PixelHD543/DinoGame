import { ALL_CARDS } from './constants.js';
import { getImagePath } from './utils.js';
import { startMatch as startBattle } from './battle.js';

let campaignProgress = {
  unlockedLevels: 1,
  lowFossils: 0,
  mediumFossils: 0,
  highFossils: 0,
  craftedCards: []
};
let campaignDeck = [];
let currentLevel = null;
let battleInterval = null;

function loadCampaignProgress() {
  const saved = localStorage.getItem("campaignProgress");
  if(saved) campaignProgress = JSON.parse(saved);
  else {
    campaignProgress = { unlockedLevels: 1, lowFossils: 0, mediumFossils: 0, highFossils: 0, craftedCards: [] };
    localStorage.setItem("campaignProgress", JSON.stringify(campaignProgress));
  }
  const savedDeck = localStorage.getItem("campaignDeck");
  if(savedDeck) campaignDeck = JSON.parse(savedDeck);
  else campaignDeck = [];
  updateFossilUI();
  renderLevelList();
  renderCraftableCards();
}

function saveCampaignProgress() {
  localStorage.setItem("campaignProgress", JSON.stringify(campaignProgress));
  localStorage.setItem("campaignDeck", JSON.stringify(campaignDeck));
}

function updateFossilUI() {
  document.getElementById("lowFossils").innerText = campaignProgress.lowFossils;
  document.getElementById("mediumFossils").innerText = campaignProgress.mediumFossils;
  document.getElementById("highFossils").innerText = campaignProgress.highFossils;
}

const levels = [
  { id: 1, name: "Grassroots", description: "Beat the rookie trainer.", fossilReward: { low: 5, medium: 0, high: 0 } },
  { id: 2, name: "Swamp Dwellers", description: "Face the swamp guardian.", fossilReward: { low: 3, medium: 2, high: 0 } },
  { id: 3, name: "Volcanic Rumble", description: "Fight the fire master.", fossilReward: { low: 2, medium: 3, high: 0 } },
  { id: 4, name: "Ancient Depths", description: "Conquer the deep sea terror.", fossilReward: { low: 0, medium: 5, high: 1 } },
  { id: 5, name: "Apex Predator", description: "Defeat the legendary alpha.", fossilReward: { low: 0, medium: 0, high: 3 } }
];

function renderLevelList() {
  const container = document.getElementById("levelList");
  if(!container) return;
  container.innerHTML = "";
  levels.forEach(level => {
    const isUnlocked = level.id <= campaignProgress.unlockedLevels;
    const levelDiv = document.createElement("div");
    levelDiv.className = "level-card";
    if(!isUnlocked) levelDiv.classList.add("locked");
    levelDiv.innerHTML = `
      <h3>${level.name}</h3>
      <p>${level.description}</p>
      <div class="fossil-reward">🏆 +${level.fossilReward.low}🔸 +${level.fossilReward.medium}🔶 +${level.fossilReward.high}💎</div>
      ${isUnlocked ? `<button class="start-level-btn" data-level="${level.id}">FIGHT</button>` : '<span class="locked-label">🔒 Locked</span>'}
    `;
    container.appendChild(levelDiv);
  });
  document.querySelectorAll(".start-level-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const levelId = parseInt(btn.getAttribute("data-level"));
      startLevel(levelId);
    });
  });
}

function buildOpponentDeck(levelId) {
  const opponentCards = [];
  for(let i=0; i<15; i++) {
    const randomCard = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
    opponentCards.push({ id: randomCard.id, category: randomCard.category });
  }
  return opponentCards;
}

function startLevel(levelId) {
  if(levelId > campaignProgress.unlockedLevels) {
    alert("Level locked! Complete previous levels first.");
    return;
  }
  if(campaignDeck.length === 0) {
    alert("Please build a campaign deck first (Edit Campaign Deck).");
    return;
  }
  currentLevel = levels[levelId-1];
  const opponentDeck = buildOpponentDeck(levelId);
  
  document.querySelector(".level-selector").style.display = "none";
  document.querySelector(".crafting-section").style.display = "none";
  document.getElementById("campaignBattleContainer").style.display = "block";
  
  startBattle(campaignDeck, opponentDeck);
  
  if(battleInterval) clearInterval(battleInterval);
  battleInterval = setInterval(() => {
    if(window.battleState) {
      if(window.battleState.p1.points >= 6) {
        clearInterval(battleInterval);
        awardFossils(currentLevel.fossilReward);
        if(currentLevel.id === campaignProgress.unlockedLevels && currentLevel.id < levels.length) {
          campaignProgress.unlockedLevels++;
          saveCampaignProgress();
          alert(`Victory! Level ${currentLevel.id} complete. Next level unlocked! You earned fossils.`);
        } else {
          saveCampaignProgress();
          alert(`Victory! You earned fossils.`);
        }
        showCampaignMenu();
      } else if(window.battleState.p2.points >= 6) {
        clearInterval(battleInterval);
        alert("You lost. Try again!");
        showCampaignMenu();
      }
    }
  }, 500);
}

function awardFossils(reward) {
  campaignProgress.lowFossils += reward.low;
  campaignProgress.mediumFossils += reward.medium;
  campaignProgress.highFossils += reward.high;
  saveCampaignProgress();
  updateFossilUI();
}

function renderCraftableCards() {
  const container = document.getElementById("craftableCards");
  if(!container) return;
  container.innerHTML = "";
  const craftable = ALL_CARDS.filter(c => c.category === 'dino' && (c.stage === 2 || c.stage === 3) && !campaignProgress.craftedCards.includes(c.name));
  craftable.forEach(card => {
    let cost = { low: 0, medium: 0, high: 0 };
    if(card.stage === 2) cost = { low: 10, medium: 5, high: 0 };
    else cost = { low: 15, medium: 10, high: 2 };
    const canAfford = campaignProgress.lowFossils >= cost.low && campaignProgress.mediumFossils >= cost.medium && campaignProgress.highFossils >= cost.high;
    const div = document.createElement("div");
    div.className = "craft-card";
    div.innerHTML = `
      <img src="${getImagePath(card.name)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' fill='%23c09a6b'/%3E%3Ctext x='50' y='80' text-anchor='middle' fill='black' font-size='30'%3E🃏%3C/text%3E%3C/svg%3E'">
      <div>${card.name}</div>
      <div class="craft-cost">🔸${cost.low} 🔶${cost.medium} 💎${cost.high}</div>
      <button class="craft-btn" data-card="${card.name}" data-low="${cost.low}" data-med="${cost.medium}" data-high="${cost.high}" ${!canAfford ? 'disabled' : ''}>Craft</button>
    `;
    container.appendChild(div);
  });
  document.querySelectorAll(".craft-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const cardName = btn.getAttribute("data-card");
      const low = parseInt(btn.getAttribute("data-low"));
      const med = parseInt(btn.getAttribute("data-med"));
      const high = parseInt(btn.getAttribute("data-high"));
      if(campaignProgress.lowFossils >= low && campaignProgress.mediumFossils >= med && campaignProgress.highFossils >= high) {
        campaignProgress.lowFossils -= low;
        campaignProgress.mediumFossils -= med;
        campaignProgress.highFossils -= high;
        campaignProgress.craftedCards.push(cardName);
        saveCampaignProgress();
        updateFossilUI();
        renderCraftableCards();
        renderCampaignDeckEditor();
        alert(`Crafted ${cardName}! It's now available in your campaign deck.`);
      } else {
        alert("Not enough fossils!");
      }
    });
  });
}

function renderCampaignDeckEditor() {
  const poolContainer = document.getElementById("campaignCardPool");
  const deckContainer = document.getElementById("campaignDeckList");
  if(!poolContainer) return;
  const allowedCards = ALL_CARDS.filter(c => 
    c.category !== 'dino' || 
    (c.category === 'dino' && (c.stage === 1 || campaignProgress.craftedCards.includes(c.name)))
  );
  poolContainer.innerHTML = "";
  allowedCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "editable-card";
    const img = document.createElement("img");
    img.src = getImagePath(card.name);
    img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23c09a6b'/%3E%3Ctext x='100' y='150' text-anchor='middle' fill='black' font-size='30'%3E🃏%3C/text%3E%3C/svg%3E"; };
    cardDiv.appendChild(img);
    cardDiv.onclick = () => {
      if(campaignDeck.length < 30) {
        campaignDeck.push({ id: card.id, category: card.category });
        renderCampaignDeckEditor();
      } else alert("Max 30 cards");
    };
    poolContainer.appendChild(cardDiv);
  });
  deckContainer.innerHTML = "";
  campaignDeck.forEach((ref, idx) => {
    const full = ALL_CARDS.find(c => c.id === ref.id && c.category === ref.category);
    if(!full) return;
    const slot = document.createElement("div");
    slot.className = "deck-slot";
    const img = document.createElement("img");
    img.src = getImagePath(full.name);
    img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' fill='%23c09a6b'/%3E%3Ctext x='50' y='80' text-anchor='middle' fill='black' font-size='30'%3E🃏%3C/text%3E%3C/svg%3E"; };
    const nameSpan = document.createElement("span");
    nameSpan.innerText = full.name;
    const delBtn = document.createElement("button");
    delBtn.innerText = "❌";
    delBtn.onclick = () => {
      campaignDeck.splice(idx,1);
      renderCampaignDeckEditor();
    };
    slot.append(img, nameSpan, delBtn);
    deckContainer.appendChild(slot);
  });
  document.getElementById("campaignDeckSize").innerText = campaignDeck.length;
}

function saveCampaignDeck() {
  localStorage.setItem("campaignDeck", JSON.stringify(campaignDeck));
  alert("Campaign deck saved!");
  closeCampaignDeckModal();
}

function openCampaignDeckModal() {
  renderCampaignDeckEditor();
  document.getElementById("campaignDeckModal").style.display = "flex";
}

function closeCampaignDeckModal() {
  document.getElementById("campaignDeckModal").style.display = "none";
}

export function showCampaignMenu() {
  if(battleInterval) clearInterval(battleInterval);
  const levelSelector = document.querySelector(".level-selector");
  const craftingSection = document.querySelector(".crafting-section");
  if(levelSelector) levelSelector.style.display = "block";
  if(craftingSection) craftingSection.style.display = "block";
  const campaignBattleContainer = document.getElementById("campaignBattleContainer");
  if(campaignBattleContainer) campaignBattleContainer.style.display = "none";
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const campaignPage = document.getElementById("campaignPage");
  if(campaignPage) campaignPage.classList.add("active");
  loadCampaignProgress();
}

export function initCampaign() {
  loadCampaignProgress();
  const backBtn = document.getElementById("backToMainFromCampaign");
  if(backBtn) backBtn.onclick = () => {
    document.getElementById("campaignPage").classList.remove("active");
    window.showMainMenu();
  };
  const openEditorBtn = document.getElementById("openCampaignDeckEditorBtn");
  if(openEditorBtn) openEditorBtn.onclick = openCampaignDeckModal;
  const saveDeckBtn = document.getElementById("saveCampaignDeckBtn");
  if(saveDeckBtn) saveDeckBtn.onclick = saveCampaignDeck;
}
