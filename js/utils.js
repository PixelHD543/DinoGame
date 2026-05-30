import { ALL_CARDS } from './constants.js';

export function shuffle(arr) {
  for(let i=arr.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

export function getImagePath(cardName) {
  return `images/${encodeURIComponent(cardName)}.png`;
}

export function getTypeMultiplier(attackerType, defenderType) {
  const eff = {
    water: { strong: "fire", weak: "electric" },
    fire: { strong: "grass", weak: "water" },
    grass: { strong: "ground", weak: "fire" },
    ground: { strong: "electric", weak: "grass" },
    electric: { strong: "water", weak: "ground" }
  };
  if (!attackerType || !defenderType) return 1;
  if (eff[attackerType]?.strong === defenderType) return 2;
  if (eff[attackerType]?.weak === defenderType) return 0.5;
  return 1;
}

export function applyAilment(dino, ailment, turns = 1) {
  if (!dino.ailments) dino.ailments = [];
  if (!dino.ailments.includes(ailment)) {
    dino.ailments.push(ailment);
    dino.ailmentTurns = dino.ailmentTurns || {};
    dino.ailmentTurns[ailment] = turns;
  } else {
    dino.ailmentTurns[ailment] = Math.max(dino.ailmentTurns[ailment] || 0, turns);
  }
}

export function removeAilment(dino, ailment) {
  if (dino.ailments) {
    dino.ailments = dino.ailments.filter(a => a !== ailment);
    if (dino.ailmentTurns) delete dino.ailmentTurns[ailment];
  }
}

export function processAilments(dino, phase, addLog) {
  if (!dino.ailments) return;
  if (phase === 'startOfTurn') {
    if (dino.ailments.includes('poison')) {
      let d10 = Math.floor(Math.random() * 10) + 1;
      dino.damage = (dino.damage || 0) + d10;
      addLog(`${dino.name} loses ${d10} HP from poison.`);
    }
    if (dino.ailments.includes('submerged')) {
      removeAilment(dino, 'submerged');
      addLog(`${dino.name} surfaces.`);
    }
    for (let a of [...dino.ailments]) {
      if (dino.ailmentTurns && dino.ailmentTurns[a]) {
        dino.ailmentTurns[a]--;
        if (dino.ailmentTurns[a] <= 0) removeAilment(dino, a);
      }
    }
  }
}

export function createEnergyCard(type) {
  return { id:`${type}Energy`, name:`${type} Energy`, category:"energy", energyType:type };
}

export function createEnergyPile() {
  let pile = [];
  const ENERGY_TYPES = ["Fire", "Water", "Grass", "Ground", "Electric", "Normal", "Wind"];
  for(let i=0;i<2;i++) ENERGY_TYPES.forEach(t => pile.push(createEnergyCard(t)));
  return shuffle(pile);
}

// Returns array of possible Stage 2 names (same type)
export function getEvolutionStages(dino) {
  if (dino.stage !== 1) return [];
  const stages = ALL_CARDS.filter(c => c.category === 'dino' && c.stage === 2 && c.type === dino.type);
  return stages.map(s => s.name);
}
