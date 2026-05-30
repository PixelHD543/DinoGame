export function applyCardEffect(card, source, context, extra = {}, addLog) {
  switch (card?.name) {
    case "Dilophosaurus":
      if (context === "poisonDamage" && extra.damage) {
        const battleState = extra.battleState;
        const dilo = battleState[`p${source}`].dinoZones.find(d => d && d.name === "Dilophosaurus");
        if (dilo) {
          const heal = Math.floor(extra.damage / 2);
          dilo.hp += heal;
          if (addLog) addLog(`Dilophosaurus gains ${heal} HP from poison damage.`);
          if (dilo.hp > dilo.originalHp) dilo.originalHp = dilo.hp;
        }
      }
      break;
    case "Acrocanthosaurus":
      if (context === "attack" && extra.defender && extra.defender.damage > 0) {
        const battleState = extra.battleState;
        if (!card.acroCooldown || card.acroCooldown <= 0) {
          const defender = extra.defender;
          const defenderPid = extra.defenderPid;
          const idx = battleState[`p${defenderPid}`].dinoZones.findIndex(d => d === defender);
          battleState[`p${defenderPid}`].graveyard.push(defender);
          battleState[`p${defenderPid}`].dinoZones[idx] = null;
          battleState[`p${source}`].points++;
          if (addLog) addLog(`Acrocanthosaurus destroys injured ${defender.name}!`);
          card.acroCooldown = 3;
          return true;
        }
      }
      break;
    default:
      break;
  }
  return false;
}

export function decreaseCooldowns(pid, battleState) {
  const dinos = battleState[`p${pid}`].dinoZones;
  dinos.forEach(d => {
    if (d && d.acroCooldown > 0) d.acroCooldown--;
  });
}
