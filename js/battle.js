import { ALL_CARDS } from './constants.js';
import { shuffle, getImagePath, getTypeMultiplier, applyAilment, processAilments, createEnergyPile, getEvolutionStage } from './utils.js';
import { getSavedDeck } from './deckEditor.js';

export let battleState = null;
let pendingAttacker = null;
let gameLog = [];
let addLog = (msg) => { gameLog.unshift(msg); if(gameLog.length>20) gameLog.pop(); updateLogUI(); };
let updateLogUI = () => { let logDiv = document.getElementById("gameLog"); if(logDiv) logDiv.innerHTML = gameLog.map(l=>`🦖 ${l}`).join('<br>'); };
let renderBattleUI = null; // set from main

export function setRenderUI(renderFn) { renderBattleUI = renderFn; }

export async function startMatch(p1DeckRef, p2DeckRef) {
  function expandDeck(refs) {
    let full = [];
    for(let r of refs) {
      let c = ALL_CARDS.find(card => card.id === r.id && card.category === r.category);
      if(c) full.push(c.category === 'dino' ? {...c, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}} : {...c});
    }
    return full;
  }
  let p1Full = expandDeck(p1DeckRef), p2Full = expandDeck(p2DeckRef);
  shuffle(p1Full); shuffle(p2Full);
  battleState = {
    p1: { deck: p1Full, hand: [], dinoZones: new Array(4).fill(null), researchZones: new Array(4).fill(null), starterZone: null, graveyard: [], energyPile: createEnergyPile(), points: 0 },
    p2: { deck: p2Full, hand: [], dinoZones: new Array(4).fill(null), researchZones: new Array(4).fill(null), starterZone: null, graveyard: [], energyPile: createEnergyPile(), points: 0 },
    turn: 1, phase: 'main', drawnThisTurn: false, usedSwap: false, evolutionUsedThisTurn: false, starterMovedThisTurn: false
  };
  for(let pid of [1,2]){ let p = battleState[`p${pid}`]; for(let i=0;i<6 && p.deck.length;i++) p.hand.push(p.deck.pop()); }
  await selectStarterForPlayer(1);
  await selectStarterForPlayer(2);
  if(renderBattleUI) renderBattleUI();
  addLog("Match started. Player 1's turn. Click DECK to draw.");
}

async function selectStarterForPlayer(pid) {
  return new Promise((resolve) => {
    let p = battleState[`p${pid}`];
    let stage1s = p.hand.filter(c => c.category === 'dino' && c.stage === 1);
    if(stage1s.length === 0) {
      let starterCard = p.deck.find(c => c.category === 'dino');
      if(starterCard) {
        let idx = p.deck.findIndex(c => c === starterCard);
        let starter = {...starterCard, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
        let emptySlot = p.dinoZones.findIndex(z => z === null);
        if(emptySlot !== -1) p.dinoZones[emptySlot] = starter;
        else p.graveyard.push(starter);
        p.deck.splice(idx,1);
      }
      p.starterZone = null;
      resolve();
    } else if(pid === 2) {
      let chosen = stage1s[0];
      p.starterZone = {...chosen, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
      let idx = p.hand.findIndex(c => c === chosen);
      p.hand.splice(idx,1);
      resolve();
    } else {
      const modal = document.getElementById("starterModal");
      const container = document.getElementById("starterChoices");
      container.innerHTML = "";
      stage1s.forEach(card => {
        const cardDiv = document.createElement("div"); cardDiv.className = "search-card";
        const img = document.createElement("img"); img.src = getImagePath(card.name);
        img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 213'%3E%3Crect width='160' height='213' fill='%23c09a6b'/%3E%3Ctext x='80' y='110' text-anchor='middle' fill='black' font-size='30'%3E🥚%3C/text%3E%3C/svg%3E"; };
        cardDiv.appendChild(img);
        cardDiv.onclick = () => {
          p.starterZone = {...card, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
          let idx = p.hand.findIndex(c => c === card);
          p.hand.splice(idx,1);
          modal.style.display = "none";
          resolve();
        };
        container.appendChild(cardDiv);
      });
      modal.style.display = "flex";
    }
  });
}

export function drawBattleCard(pid) {
  if(battleState.turn !== pid) return false;
  if(battleState.drawnThisTurn) return false;
  let p = battleState[`p${pid}`];
  if(p.deck.length === 0) return false;
  p.hand.push(p.deck.pop());
  battleState.drawnThisTurn = true;
  if(renderBattleUI) renderBattleUI();
  return true;
}

export function selectEnergyFromPile(pid, energyIdx) {
  if(battleState.turn !== pid) return;
  battleState.selectedEnergy = { pid, energyIdx };
  addLog("Click on a dino to attach this energy.");
}

export function attachSelectedEnergyToDino(pid, zoneIdx) {
  if(!battleState.selectedEnergy || battleState.selectedEnergy.pid !== pid) return;
  let p = battleState[`p${pid}`];
  let dino = p.dinoZones[zoneIdx];
  if(!dino) return;
  let energyIdx = battleState.selectedEnergy.energyIdx;
  let energyCard = p.energyPile[energyIdx];
  if(!energyCard) return;
  p.energyPile.splice(energyIdx,1);
  if(!dino.energyAttached) dino.energyAttached = [];
  dino.energyAttached.push(energyCard);
  addLog(`Attached ${energyCard.name} to ${dino.name}.`);
  battleState.selectedEnergy = null;
  if(renderBattleUI) renderBattleUI();
}

export function startAttackSelection(pid, zoneIdx) {
  if(battleState.turn !== pid || battleState.phase !== 'battle') return;
  let attacker = battleState[`p${pid}`].dinoZones[zoneIdx];
  if(!attacker || (attacker.ailments && attacker.ailments.includes('paralyzed'))) return;
  pendingAttacker = { pid, zoneIdx, dino: attacker };
  let oppPid = pid === 1 ? 2 : 1;
  for(let i=0;i<4;i++) {
    let dino = battleState[`p${oppPid}`].dinoZones[i];
    if(dino) {
      let zoneElem = document.getElementById(`dinoZone_${oppPid}_${i}`);
      if(zoneElem) {
        zoneElem.classList.add("targetable-glow");
        zoneElem.style.cursor = "pointer";
        zoneElem.onclick = () => executeAttack(oppPid, i);
      }
    }
  }
  let hasDino = battleState[`p${oppPid}`].dinoZones.some(d => d !== null);
  if(!hasDino && confirm("No opponent dinos. Direct attack?")) executeDirectAttack(pid, attacker);
}

function executeAttack(defenderPid, defenderZoneIdx) {
  if(!pendingAttacker) return;
  let attacker = pendingAttacker.dino;
  let defender = battleState[`p${defenderPid}`].dinoZones[defenderZoneIdx];
  if(!defender) { clearAttackGlow(); pendingAttacker = null; return; }
  let maxDiscard = attacker.energyAttached ? attacker.energyAttached.length : 0;
  let discard = parseInt(prompt(`Attack with ${attacker.name}. Discard how many energies? (0-${maxDiscard})`)) || 0;
  discard = Math.min(discard, maxDiscard);
  for(let i=0;i<discard;i++) {
    let eng = attacker.energyAttached.pop();
    battleState[`p${pendingAttacker.pid}`].graveyard.push(eng);
  }
  let typeMult = getTypeMultiplier(attacker.type, defender.type);
  let attackPower = (attacker.power * typeMult) + (discard * 1000);
  if(defender.ailments && defender.ailments.includes('bleed')) attackPower *= 2;
  let defendPower = 0;
  let canDefend = (defender.energyAttached && defender.energyAttached.length > 0) || (defender.ailments && defender.ailments.includes('fortified'));
  if(canDefend && confirm(`Defender ${defender.name} uses 1 energy to block?`)) {
    if(defender.energyAttached && defender.energyAttached.length > 0) {
      let eng = defender.energyAttached.pop();
      battleState[`p${defenderPid}`].graveyard.push(eng);
      defendPower = defender.power;
    }
  }
  let damage = Math.max(0, attackPower - defendPower);
  defender.damage = (defender.damage||0) + damage;
  addLog(`${attacker.name} attacks: ${attackPower} vs ${defendPower} → ${damage} damage.`);
  if(defender.damage >= defender.hp) {
    let idx = battleState[`p${defenderPid}`].dinoZones.findIndex(d=>d===defender);
    battleState[`p${defenderPid}`].graveyard.push(defender);
    battleState[`p${defenderPid}`].dinoZones[idx] = null;
    battleState[`p${pendingAttacker.pid}`].points++;
    addLog(`${defender.name} destroyed! +1 point.`);
  }
  clearAttackGlow();
  pendingAttacker = null;
  if(renderBattleUI) renderBattleUI();
  if(battleState.p1.points>=6 || battleState.p2.points>=6) {
    alert(`Game Over! Player ${battleState.p1.points>=6 ? 1 : 2} wins.`);
    startMatch(getSavedDeck(document.getElementById("p1DeckSelect").value), getSavedDeck(document.getElementById("p2DeckSelect").value));
  }
}

function executeDirectAttack(pid, attacker) {
  let discard = parseInt(prompt(`Direct attack! Discard energies (0-${attacker.energyAttached?.length||0})`)) || 0;
  discard = Math.min(discard, attacker.energyAttached?.length||0);
  for(let i=0;i<discard;i++) attacker.energyAttached.pop();
  let damage = attacker.power + discard*1000;
  let oppPid = pid === 1 ? 2 : 1;
  battleState[`p${oppPid}`].points++;
  addLog(`Direct attack deals ${damage} damage! +1 point.`);
  clearAttackGlow();
  pendingAttacker = null;
  if(renderBattleUI) renderBattleUI();
}

function clearAttackGlow() {
  for(let pid of [1,2]) for(let i=0;i<4;i++) {
    let elem = document.getElementById(`dinoZone_${pid}_${i}`);
    if(elem) { elem.classList.remove("targetable-glow"); elem.style.cursor = "default"; elem.onclick = null; }
  }
}

export function attemptEvolution(pid, zoneIdx) {
  if(battleState.turn !== pid || battleState.phase !== 'main') {
    addLog("Can only evolve during your Main Phase.");
    return;
  }
  if(battleState.evolutionUsedThisTurn) {
    addLog("You can only evolve once per turn.");
    return;
  }
  let dino = battleState[`p${pid}`].dinoZones[zoneIdx];
  if(!dino) {
    addLog("No dino in that zone.");
    return;
  }
  let nextName = getEvolutionStage(dino.name);
  console.log(`Evolution check: ${dino.name} -> ${nextName}`);
  if(!nextName) {
    addLog(`${dino.name} cannot evolve further (no evolution defined).`);
    return;
  }
  let handIndex = battleState[`p${pid}`].hand.findIndex(c => c.name === nextName && c.category === 'dino');
  if(handIndex === -1) {
    addLog(`You need ${nextName} in your hand to evolve.`);
    return;
  }
  let nextCard = battleState[`p${pid}`].hand[handIndex];
  battleState[`p${pid}`].graveyard.push({...dino});
  battleState[`p${pid}`].dinoZones[zoneIdx] = {...nextCard, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
  battleState[`p${pid}`].hand.splice(handIndex,1);
  battleState.evolutionUsedThisTurn = true;
  addLog(`${dino.name} evolved into ${nextCard.name}!`);
  if(renderBattleUI) renderBattleUI();
}

export function swapStarterWithField(pid, zoneIdx) {
  if(battleState.turn !== pid || battleState.phase !== 'main' || battleState.usedSwap) return;
  let fieldDino = battleState[`p${pid}`].dinoZones[zoneIdx];
  let starter = battleState[`p${pid}`].starterZone;
  if(!fieldDino || !starter) return;
  battleState[`p${pid}`].dinoZones[zoneIdx] = {...starter, damage:0, energyAttached:[], ailments: starter.ailments || [], ailmentTurns: starter.ailmentTurns || {}};
  battleState[`p${pid}`].starterZone = {...fieldDino, damage:0, energyAttached:[], ailments: fieldDino.ailments || [], ailmentTurns: fieldDino.ailmentTurns || {}};
  battleState.usedSwap = true;
  addLog(`Swapped ${fieldDino.name} with starter.`);
  if(renderBattleUI) renderBattleUI();
}

export function moveStarterToField(pid) {
  if(battleState.turn !== pid) return;
  if(battleState.phase !== 'main') return;
  if(battleState.starterMovedThisTurn) { addLog("You already moved your starter this turn."); return; }
  let p = battleState[`p${pid}`];
  if(!p.starterZone) { addLog("No starter to move."); return; }
  let hasDino = p.dinoZones.some(d => d !== null);
  if(hasDino) { addLog("You already have dinos on field. Cannot move starter."); return; }
  let emptySlot = p.dinoZones.findIndex(z => z === null);
  if(emptySlot === -1) { addLog("No empty dino zone."); return; }
  p.dinoZones[emptySlot] = {...p.starterZone, damage:0, energyAttached:[], ailments: p.starterZone.ailments || [], ailmentTurns: p.starterZone.ailmentTurns || {}};
  p.starterZone = null;
  battleState.starterMovedThisTurn = true;
  addLog(`Moved ${p.dinoZones[emptySlot].name} from starter zone to field.`);
  if(renderBattleUI) renderBattleUI();
}

export function playBattleCardFromHand(pid, handIdx) {
  if(battleState.turn !== pid) return;
  if(battleState.phase !== 'main') { addLog("Only during Main Phase."); return; }
  let p = battleState[`p${pid}`];
  let card = p.hand[handIdx];
  if(!card) return;
  if(card.category === 'dino') {
    if(card.stage !== 1) { addLog("Only Stage 1 can be played directly."); return; }
    let empty = p.dinoZones.findIndex(z=>!z);
    if(empty !== -1) {
      p.dinoZones[empty] = {...card, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
      p.hand.splice(handIdx,1);
      addLog(`Played ${card.name}.`);
    } else alert("No free dino zone");
  } else if(card.category === 'research') {
    let emptyRes = p.researchZones.findIndex(z=>!z);
    if(emptyRes !== -1) {
      let newCard = {...card};
      p.researchZones[emptyRes] = newCard;
      p.hand.splice(handIdx,1);
      if(!card.isField) {
        if(card.name === "Dig site") {
          let dinosInDeck = p.deck.filter(c => c.category === "dino");
          if(dinosInDeck.length) { p.hand.push(dinosInDeck[0]); let idx = p.deck.findIndex(c=>c===dinosInDeck[0]); p.deck.splice(idx,1); addLog(`Added ${dinosInDeck[0].name} to hand.`); }
        } else if(card.name === "Palaeontology") {
          let movesInDeck = p.deck.filter(c => c.category === "move");
          if(movesInDeck.length) { p.hand.push(movesInDeck[0]); let idx = p.deck.findIndex(c=>c===movesInDeck[0]); p.deck.splice(idx,1); addLog(`Added ${movesInDeck[0].name} to hand.`); }
        }
        let idx = p.researchZones.findIndex(z => z === newCard);
        if(idx !== -1) p.researchZones[idx] = null;
        p.graveyard.push(newCard);
        if(renderBattleUI) renderBattleUI();
      } else { addLog(`${card.name} placed on field.`); if(renderBattleUI) renderBattleUI(); }
    } else alert("No free research zone");
  } else if(card.category === 'move') {
    if(battleState.phase !== 'battle') return;
    if(card.appliesAilment) {
      let targetIdx = prompt(`Target opponent dino (0-3) to apply ${card.appliesAilment}:`);
      let oppPid = pid === 1 ? 2 : 1;
      let target = battleState[`p${oppPid}`].dinoZones[parseInt(targetIdx)];
      if(target) { applyAilment(target, card.appliesAilment, 1); addLog(`${target.name} is now ${card.appliesAilment}!`); }
    } else { let targetIdx = prompt("Your dino zone (0-3) to give +500 power:"); let d = p.dinoZones[parseInt(targetIdx)]; if(d) d.power += 500; }
    p.hand.splice(handIdx,1);
    p.graveyard.push(card);
    if(renderBattleUI) renderBattleUI();
  }
  if(renderBattleUI) renderBattleUI();
}

export function nextPhase() {
  if(battleState.phase === 'main') battleState.phase = 'battle';
  else if(battleState.phase === 'battle') battleState.phase = 'end';
  else if(battleState.phase === 'end') endTurn();
  if(renderBattleUI) renderBattleUI();
}

function endTurn() {
  if(battleState.turn === 1) {
    battleState.turn = 2;
    battleState.drawnThisTurn = false;
    battleState.usedSwap = false;
    battleState.evolutionUsedThisTurn = false;
    battleState.starterMovedThisTurn = false;
    battleState.phase = 'main';
    battleState.selectedEnergy = null;
    if(renderBattleUI) renderBattleUI();
    addLog("AI's turn.");
    setTimeout(() => aiTurn(), 500);
  } else {
    battleState.turn = 1;
    battleState.drawnThisTurn = false;
    battleState.usedSwap = false;
    battleState.evolutionUsedThisTurn = false;
    battleState.starterMovedThisTurn = false;
    battleState.phase = 'main';
    battleState.selectedEnergy = null;
    if(renderBattleUI) renderBattleUI();
    addLog("Your turn. Click DECK to draw.");
  }
}

async function aiTurn() {
  if(battleState.turn !== 2) return;
  addLog("🤖 AI is thinking...");
  await new Promise(r => setTimeout(r, 800));
  if(!battleState.drawnThisTurn && battleState.p2.deck.length > 0) {
    battleState.p2.hand.push(battleState.p2.deck.pop());
    battleState.drawnThisTurn = true;
    addLog("AI draws a card.");
    if(renderBattleUI) renderBattleUI();
  }
  if(battleState.p2.energyPile.length > 0) {
    let targetDino = battleState.p2.dinoZones.find(d => d !== null);
    if(targetDino) {
      let energy = battleState.p2.energyPile.pop();
      if(!targetDino.energyAttached) targetDino.energyAttached = [];
      targetDino.energyAttached.push(energy);
      addLog(`AI attached ${energy.name} to ${targetDino.name}.`);
      if(renderBattleUI) renderBattleUI();
    }
  }
  let handDino = battleState.p2.hand.find(c => c.category === 'dino' && c.stage === 1);
  if(handDino) {
    let emptySlot = battleState.p2.dinoZones.findIndex(z => z === null);
    if(emptySlot !== -1) {
      battleState.p2.dinoZones[emptySlot] = {...handDino, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
      let idx = battleState.p2.hand.findIndex(c => c === handDino);
      battleState.p2.hand.splice(idx,1);
      addLog(`AI played ${handDino.name}.`);
      if(renderBattleUI) renderBattleUI();
    }
  }
  if(!battleState.evolutionUsedThisTurn) {
    for(let i=0;i<4;i++) {
      let d = battleState.p2.dinoZones[i];
      if(d) {
        let nextName = getEvolutionStage(d.name);
        if(nextName) {
          let nextCard = battleState.p2.hand.find(c => c.name === nextName && c.category === 'dino');
          if(nextCard) {
            battleState.p2.graveyard.push({...d});
            battleState.p2.dinoZones[i] = {...nextCard, damage:0, energyAttached:[], ailments: [], ailmentTurns: {}};
            let idx = battleState.p2.hand.findIndex(c => c === nextCard);
            battleState.p2.hand.splice(idx,1);
            battleState.evolutionUsedThisTurn = true;
            addLog(`AI evolved into ${nextCard.name}.`);
            if(renderBattleUI) renderBattleUI();
            break;
          }
        }
      }
    }
  }
  battleState.phase = 'battle';
  if(renderBattleUI) renderBattleUI();
  await new Promise(r => setTimeout(r, 500));
  for(let i=0;i<4;i++) {
    let attacker = battleState.p2.dinoZones[i];
    if(attacker && !(attacker.ailments && attacker.ailments.includes('paralyzed'))) {
      let targetIdx = battleState.p1.dinoZones.findIndex(d => d !== null);
      if(targetIdx !== -1) {
        let defender = battleState.p1.dinoZones[targetIdx];
        let discard = Math.min(attacker.energyAttached?.length || 0, 1);
        for(let j=0;j<discard;j++) {
          let eng = attacker.energyAttached.pop();
          battleState.p2.graveyard.push(eng);
        }
        let typeMult = getTypeMultiplier(attacker.type, defender.type);
        let attackPower = (attacker.power * typeMult) + (discard * 1000);
        if(defender.ailments && defender.ailments.includes('bleed')) attackPower *= 2;
        let defendPower = 0;
        if(defender.energyAttached && defender.energyAttached.length > 0 && Math.random() < 0.5) {
          let eng = defender.energyAttached.pop();
          battleState.p1.graveyard.push(eng);
          defendPower = defender.power;
        }
        let damage = Math.max(0, attackPower - defendPower);
        defender.damage = (defender.damage||0) + damage;
        addLog(`AI attacks ${defender.name}: ${attackPower} vs ${defendPower} → ${damage} damage.`);
        if(defender.damage >= defender.hp) {
          let idx = battleState.p1.dinoZones.findIndex(d=>d===defender);
          battleState.p1.graveyard.push(defender);
          battleState.p1.dinoZones[idx] = null;
          battleState.p2.points++;
          addLog(`${defender.name} destroyed! AI gains a point.`);
        }
        if(renderBattleUI) renderBattleUI();
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  endTurn();
}

export function showGY(pid) {
  let p = battleState[`p${pid}`];
  let container = document.getElementById("gyList");
  container.innerHTML = "";
  p.graveyard.forEach(card => {
    let cardDiv = document.createElement("div"); cardDiv.className = "gy-card";
    let img = document.createElement("img"); img.src = getImagePath(card.name);
    img.onerror = function() { this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 213'%3E%3Crect width='160' height='213' fill='%23c09a6b'/%3E%3Ctext x='80' y='110' text-anchor='middle' fill='black' font-size='30'%3E💀%3C/text%3E%3C/svg%3E"; };
    cardDiv.appendChild(img);
    cardDiv.onclick = () => window.showZoom(card, "gy");
    container.appendChild(cardDiv);
  });
  document.getElementById("gyModal").style.display = "flex";
}
