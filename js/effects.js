import { applyAilment, removeAilment } from './utils.js';
import { battleState, addLog, renderBattleUI } from './battle.js';

export function applyCardEffect(card, source, context, extra = {}) {
  switch (card.name) {
    case "Dilophosaurus":
      // When an opponent's dino takes poison damage, this card gains half that damage as HP.
      if (context === "poisonDamage" && extra.damage) {
        const dilo = battleState[`p${source}`].dinoZones.find(d => d && d.name === "Dilophosaurus");
        if (dilo) {
          const heal = Math.floor(extra.damage / 2);
          dilo.hp += heal;
          addLog(`Dilophosaurus gains ${heal} HP from poison.`);
          if (dilo.hp > dilo.originalHp) dilo.originalHp = dilo.hp; // keep track
        }
      }
      break;
    case "Allosaurus":
      // Any bleed damage is doubled. This is handled in attack calculation by checking if Allosaurus is on field.
      break;
    case "Acrocanthosaurus":
      if (context === "attack" && extra.defender && extra.defender.damage > 0) {
        if (!card.acroCooldown || card.acroCooldown <= 0) {
          // Destroy defender
          const defender = extra.defender;
          const defenderPid = extra.defenderPid;
          const idx = battleState[`p${defenderPid}`].dinoZones.findIndex(d => d === defender);
          battleState[`p${defenderPid}`].graveyard.push(defender);
          battleState[`p${defenderPid}`].dinoZones[idx] = null;
          battleState[`p${source}`].points++;
          addLog(`Acrocanthosaurus destroys injured ${defender.name}!`);
          card.acroCooldown = 3;
          return true; // attack was resolved, skip normal damage
        }
      }
      break;
    case "Compsognathus":
      if (context === "play") {
        // Stacking logic is handled in battle.js
      }
      break;
    // Add more effects here
    default:
      break;
  }
  return false;
}

// Function to decrease cooldowns at start of turn
export function decreaseCooldowns(pid) {
  const dinos = battleState[`p${pid}`].dinoZones;
  dinos.forEach(d => {
    if (d && d.acroCooldown > 0) d.acroCooldown--;
  });
}
