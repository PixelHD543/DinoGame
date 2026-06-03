import { ALL_CARDS, createEnergyPile, shuffle } from './cardData.js';
import { getTypeMultiplier, applyAilment, getEvolutionStages } from './utils.js';

// Create fresh game state
export function createInitialState(p1Deck, p2Deck) {
    function expandDeck(refs) {
        let full = [];
        for(let r of refs) {
            let c = ALL_CARDS.find(card => card.id === r.id && card.category === r.category);
            if(c) full.push(c.category === 'dino' ? {...c, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}} : {...c});
        }
        return full;
    }
    let p1Full = expandDeck(p1Deck);
    let p2Full = expandDeck(p2Deck);
    shuffle(p1Full); shuffle(p2Full);
    
    return {
        p1: { deck: p1Full, hand: [], dinoZones: new Array(4).fill(null), researchZones: new Array(4).fill(null), starterZone: null, graveyard: [], energyPile: createEnergyPile(), points: 0 },
        p2: { deck: p2Full, hand: [], dinoZones: new Array(4).fill(null), researchZones: new Array(4).fill(null), starterZone: null, graveyard: [], energyPile: createEnergyPile(), points: 0 },
        turn: 1, phase: 'main', drawnThisTurn: false, usedSwap: false, evolutionUsedThisTurn: false, starterMovedThisTurn: false
    };
}

// Draw card
export function drawCard(state, pid) {
    if(state.turn !== pid || state.drawnThisTurn) return false;
    let p = state[`p${pid}`];
    if(p.deck.length === 0) return false;
    p.hand.push(p.deck.pop());
    state.drawnThisTurn = true;
    return true;
}

// Play dino
export function playDino(state, pid, handIdx) {
    if(state.turn !== pid || state.phase !== 'main') return false;
    let p = state[`p${pid}`];
    let card = p.hand[handIdx];
    if(!card || card.category !== 'dino' || card.stage !== 1) return false;
    let empty = p.dinoZones.findIndex(z=>!z);
    if(empty === -1) return false;
    p.dinoZones[empty] = {...card, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
    p.hand.splice(handIdx,1);
    return true;
}

// Play research
export function playResearch(state, pid, handIdx) {
    if(state.turn !== pid || state.phase !== 'main') return false;
    let p = state[`p${pid}`];
    let card = p.hand[handIdx];
    if(!card || card.category !== 'research') return false;
    let empty = p.researchZones.findIndex(z=>!z);
    if(empty === -1) return false;
    p.researchZones[empty] = {...card};
    p.hand.splice(handIdx,1);
    if(!card.isField && card.name === "Dig site") {
        let dinosInDeck = p.deck.filter(c => c.category === "dino");
        if(dinosInDeck.length) { 
            p.hand.push(dinosInDeck[0]); 
            let idx = p.deck.findIndex(c=>c===dinosInDeck[0]); 
            p.deck.splice(idx,1); 
        }
        let idx = p.researchZones.findIndex(z => z === card);
        if(idx !== -1) p.researchZones[idx] = null;
        p.graveyard.push(card);
    }
    return true;
}

// Play move
export function playMove(state, pid, handIdx, targetZone) {
    if(state.turn !== pid || state.phase !== 'battle') return false;
    let p = state[`p${pid}`];
    let card = p.hand[handIdx];
    if(!card || card.category !== 'move') return false;
    if(card.appliesAilment && targetZone !== undefined) {
        let oppPid = pid===1?2:1;
        let target = state[`p${oppPid}`].dinoZones[targetZone];
        if(target) applyAilment(target, card.appliesAilment, 1);
    }
    p.hand.splice(handIdx,1);
    p.graveyard.push(card);
    return true;
}

// Attach energy
export function attachEnergy(state, pid, zoneIdx, energyIdx) {
    if(state.turn !== pid) return false;
    let p = state[`p${pid}`];
    let dino = p.dinoZones[zoneIdx];
    let energy = p.energyPile[energyIdx];
    if(!dino || !energy) return false;
    p.energyPile.splice(energyIdx,1);
    if(!dino.energyAttached) dino.energyAttached = [];
    dino.energyAttached.push(energy);
    return true;
}

// Evolve
export function evolve(state, pid, zoneIdx, chosenName) {
    if(state.turn !== pid || state.phase !== 'main' || state.evolutionUsedThisTurn) return false;
    let dino = state[`p${pid}`].dinoZones[zoneIdx];
    if(!dino) return false;
    let possible = getEvolutionStages(dino);
    if(!chosenName) chosenName = possible[0];
    if(!possible.includes(chosenName)) return false;
    let handIdx = state[`p${pid}`].hand.findIndex(c => c.name === chosenName);
    if(handIdx === -1) return false;
    let nextCard = state[`p${pid}`].hand[handIdx];
    state[`p${pid}`].graveyard.push({...dino});
    state[`p${pid}`].dinoZones[zoneIdx] = {...nextCard, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
    state[`p${pid}`].hand.splice(handIdx,1);
    state.evolutionUsedThisTurn = true;
    return true;
}

// Attack
export function attack(state, attackerPid, attackerZone, defenderPid, defenderZone, discardCount, useDefend) {
    if(state.turn !== attackerPid || state.phase !== 'battle') return false;
    let attacker = state[`p${attackerPid}`].dinoZones[attackerZone];
    let defender = state[`p${defenderPid}`].dinoZones[defenderZone];
    if(!attacker || !defender) return false;
    
    discardCount = Math.min(discardCount || 0, attacker.energyAttached?.length||0);
    for(let i=0;i<discardCount;i++) attacker.energyAttached.pop();
    
    let typeMult = getTypeMultiplier(attacker.type, defender.type);
    let attackPower = (attacker.power * typeMult) + (discardCount * 1000);
    let defendPower = 0;
    let canDefend = (defender.energyAttached?.length>0) || (defender.ailments && defender.ailments.includes('fortified'));
    if(useDefend && canDefend && defender.energyAttached?.length>0) {
        defender.energyAttached.pop();
        defendPower = defender.power;
    }
    let damage = Math.max(0, attackPower - defendPower);
    defender.damage = (defender.damage||0) + damage;
    
    if(defender.damage >= defender.hp) {
        let idx = state[`p${defenderPid}`].dinoZones.findIndex(d=>d===defender);
        state[`p${defenderPid}`].graveyard.push(defender);
        state[`p${defenderPid}`].dinoZones[idx] = null;
        state[`p${attackerPid}`].points++;
    }
    return true;
}

// Swap starter
export function swapStarterWithField(state, pid, zoneIdx) {
    if(state.turn !== pid || state.phase !== 'main' || state.usedSwap) return false;
    let field = state[`p${pid}`].dinoZones[zoneIdx];
    let starter = state[`p${pid}`].starterZone;
    if(!field || !starter) return false;
    state[`p${pid}`].dinoZones[zoneIdx] = {...starter, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
    state[`p${pid}`].starterZone = {...field, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
    state.usedSwap = true;
    return true;
}

// Move starter to field
export function moveStarterToField(state, pid) {
    if(state.turn !== pid || state.phase !== 'main' || state.starterMovedThisTurn) return false;
    let p = state[`p${pid}`];
    if(!p.starterZone) return false;
    let hasDino = p.dinoZones.some(d=>d);
    if(hasDino) return false;
    let empty = p.dinoZones.findIndex(z=>!z);
    if(empty === -1) return false;
    p.dinoZones[empty] = {...p.starterZone, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
    p.starterZone = null;
    state.starterMovedThisTurn = true;
    return true;
}

// Next phase
export function nextPhase(state) {
    if(state.phase === 'main') state.phase = 'battle';
    else if(state.phase === 'battle') state.phase = 'end';
    else if(state.phase === 'end') endTurn(state);
    return true;
}

// End turn
export function endTurn(state) {
    state.turn = state.turn === 1 ? 2 : 1;
    state.drawnThisTurn = false;
    state.usedSwap = false;
    state.evolutionUsedThisTurn = false;
    state.starterMovedThisTurn = false;
    state.phase = 'main';
    return true;
}
