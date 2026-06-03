import { ALL_CARDS } from './cardData.js';
export function getImagePath(name) { return `images/${encodeURIComponent(name)}.png`; }
export function getTypeMultiplier(at, dt) { 
    const eff = { water:{strong:"fire",weak:"electric"}, fire:{strong:"grass",weak:"water"}, grass:{strong:"ground",weak:"fire"}, ground:{strong:"electric",weak:"grass"}, electric:{strong:"water",weak:"ground"} };
    if(!at || !dt) return 1;
    if(eff[at]?.strong===dt) return 2;
    if(eff[at]?.weak===dt) return 0.5;
    return 1;
}
export function applyAilment(dino,a,t=1){ if(!dino.ailments)dino.ailments=[]; if(!dino.ailments.includes(a)){ dino.ailments.push(a); dino.ailmentTurns={...dino.ailmentTurns, [a]:t}; } }
export function getEvolutionStages(dino) { if(dino.stage !== 1) return []; return ALL_CARDS.filter(c => c.category === 'dino' && c.stage === 2 && c.type === dino.type).map(s => s.name); }
