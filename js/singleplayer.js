import { createInitialState, drawCard, playDino, playResearch, playMove, attachEnergy, evolve, attack, swapStarterWithField, moveStarterToField, nextPhase, endTurn } from './battleLogic.js';
import { getImagePath } from './utils.js';

let battleState = null;
let gameLog = [];
let updateLogUI = () => {};
let renderBattleUI = () => {};

export function setRenderFunctions(renderFn, logFn) {
    renderBattleUI = renderFn;
    updateLogUI = logFn;
}

function addLog(msg) { gameLog.unshift(msg); if(gameLog.length>20) gameLog.pop(); updateLogUI(gameLog); }

export function startSinglePlayer(deck) {
    // AI gets a copy of the same deck but shuffled
    const aiDeck = [...deck];
    battleState = createInitialState(deck, aiDeck);
    // Draw starting hands
    for(let i=0;i<6;i++) {
        drawCard(battleState, 1);
        drawCard(battleState, 2);
    }
    // Select starters (simplified: first stage1 in hand)
    for(let pid of [1,2]) {
        let p = battleState[`p${pid}`];
        let stage1 = p.hand.find(c => c.category === 'dino' && c.stage === 1);
        if(stage1) {
            p.starterZone = {...stage1, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
            let idx = p.hand.findIndex(c => c === stage1);
            p.hand.splice(idx,1);
        } else {
            let anyDino = p.hand.find(c => c.category === 'dino');
            if(anyDino) {
                p.starterZone = {...anyDino, damage:0, energyAttached:[], ailments:[], ailmentTurns:{}};
                let idx = p.hand.findIndex(c => c === anyDino);
                p.hand.splice(idx,1);
            }
        }
    }
    renderBattleUI();
    addLog("Single player match started! Your turn.");
    return battleState;
}

export function getState() { return battleState; }

export function playerDraw() { 
    if(drawCard(battleState, 1)) { renderBattleUI(); return true; }
    return false;
}

export function playerPlayDino(handIdx) { 
    if(playDino(battleState, 1, handIdx)) { renderBattleUI(); return true; }
    return false;
}

export function playerPlayResearch(handIdx) { 
    if(playResearch(battleState, 1, handIdx)) { renderBattleUI(); return true; }
    return false;
}

export function playerPlayMove(handIdx, targetZone) { 
    if(playMove(battleState, 1, handIdx, targetZone)) { renderBattleUI(); return true; }
    return false;
}

export function playerAttachEnergy(zoneIdx, energyIdx) { 
    if(attachEnergy(battleState, 1, zoneIdx, energyIdx)) { renderBattleUI(); return true; }
    return false;
}

export function playerEvolve(zoneIdx, chosenName) { 
    if(evolve(battleState, 1, zoneIdx, chosenName)) { renderBattleUI(); return true; }
    return false;
}

export function playerAttack(attackerZone, defenderZone, discardCount, useDefend) { 
    if(attack(battleState, 1, attackerZone, 2, defenderZone, discardCount, useDefend)) { 
        renderBattleUI(); 
        if(battleState.p2.points >= 6) addLog("AI wins!");
        else if(battleState.p1.points >= 6) addLog("You win!");
        return true;
    }
    return false;
}

export function playerSwapStarter(zoneIdx) { 
    if(swapStarterWithField(battleState, 1, zoneIdx)) { renderBattleUI(); return true; }
    return false;
}

export function playerMoveStarter() { 
    if(moveStarterToField(battleState, 1)) { renderBattleUI(); return true; }
    return false;
}

export function playerNextPhase() { 
    nextPhase(battleState); 
    renderBattleUI(); 
    if(battleState.phase === 'end') {
        // After ending turn, let AI play
        setTimeout(() => aiTurn(), 500);
    }
}

async function aiTurn() {
    if(battleState.turn !== 2) return;
    addLog("🤖 AI thinking...");
    await new Promise(r=>setTimeout(r,600));
    
    // Draw
    if(!battleState.drawnThisTurn) drawCard(battleState, 2);
    
    // Play a dino if possible
    let handDino = battleState.p2.hand.find(c=>c.category==='dino' && c.stage===1);
    if(handDino) {
        let empty = battleState.p2.dinoZones.findIndex(z=>!z);
        if(empty !== -1) playDino(battleState, 2, battleState.p2.hand.findIndex(c=>c===handDino));
    }
    
    // Evolve
    if(!battleState.evolutionUsedThisTurn) {
        for(let i=0;i<4;i++) {
            let d = battleState.p2.dinoZones[i];
            if(d) {
                let stages = getEvolutionStages(d);
                if(stages.length && battleState.p2.hand.some(c=>c.name===stages[0])) {
                    evolve(battleState, 2, i, stages[0]);
                    break;
                }
            }
        }
    }
    
    // Attack
    battleState.phase = 'battle';
    renderBattleUI();
    await new Promise(r=>setTimeout(r,400));
    
    for(let i=0;i<4;i++) {
        let attacker = battleState.p2.dinoZones[i];
        if(attacker) {
            let targetIdx = battleState.p1.dinoZones.findIndex(d=>d);
            if(targetIdx !== -1) {
                let discard = Math.min(attacker.energyAttached?.length||0, 1);
                attack(battleState, 2, i, 1, targetIdx, discard, false);
                renderBattleUI();
                await new Promise(r=>setTimeout(r,400));
            }
        }
    }
    
    // End turn
    endTurn(battleState);
    renderBattleUI();
    addLog("Your turn. Click DECK to draw.");
}
