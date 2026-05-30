// All card data – dinosaurs, moves, research
export const CARD_CATALOG = {
  dinos: [
    { id:"Acrocanthosaurus", name:"Acrocanthosaurus", type:"fire", stage:2, power:2000, hp:3000, effect:"If this dino attacks an injured dino; destroy that dino. This effect can only happen once every third turn.", imageEmoji:"🔥", category:"dino" },
    { id:"Allosaurus", name:"Allosaurus", type:"fire", stage:2, power:3000, hp:3000, effect:"When this card is on field; any bleed damage is doubled.", imageEmoji:"🔥", category:"dino" },
    { id:"Baby Ichthyosaurus", name:"Baby Ichthyosaurus", type:"water", stage:1, power:100, hp:300, effect:"Once per turn you can add energy to this card.", imageEmoji:"💧", category:"dino", ability: { cost:0, effect:"add self energy" } },
    { id:"Baby Kronosaurus", name:"Baby Kronosaurus", type:"water", stage:1, power:800, hp:700, effect:"Once per turn you can remove one energy from this card and if you do you can add one energy to any of your dinos.", imageEmoji:"💧", category:"dino", ability: { cost:1, effect:"transfer energy" } },
    { id:"Baby Megalodon", name:"Baby Megalodon", type:"water", stage:1, power:200, hp:1000, effect:"If starter: add water dino end of turn. If dino zone: must remove energy or destroy.", imageEmoji:"💧", category:"dino" },
    { id:"Baby Mosaasur", name:"Baby Mosaasur", type:"water", stage:1, power:200, hp:1000, effect:"If submerged end of turn, add energy to any dino.", imageEmoji:"💧", category:"dino" },
    { id:"Baby Plesiosaur", name:"Baby Plesiosaur", type:"water", stage:1, power:250, hp:500, effect:"If starter: discard energy to search for research.", imageEmoji:"💧", category:"dino" },
    { id:"Chasmosaurus", name:"Chasmosaurus", type:"grass", stage:2, power:1500, hp:2000, effect:"Prevents bleed on your dinos. If starter, reflects bleed.", imageEmoji:"🌿", category:"dino" },
    { id:"Compsognathus", name:"Compsognathus", type:"electric", stage:1, power:250, hp:250, effect:"You can stack Compsognathus on top of other Compsognathus, adding HP and Power.", imageEmoji:"⚡", category:"dino", stacking: true },
    { id:"Concavenator", name:"Concavenator", type:"electric", stage:1, power:700, hp:500, effect:"When sent to GY, special summon a Pack token.", imageEmoji:"⚡", category:"dino" },
    { id:"Dilophosaurus", name:"Dilophosaurus", type:"electric", stage:1, power:1000, hp:500, effect:"When an opponent's dino takes poison damage, this card gains half that damage as HP.", imageEmoji:"⚡", category:"dino" },
    { id:"Dunkleosteus", name:"Dunkleosteus", type:"water", stage:2, power:1200, hp:4000, effect:"Once per turn remove 1 energy to add Whirlpool to hand.", imageEmoji:"💧", category:"dino", ability: { cost:1, effect:"add whirlpool" } },
    { id:"Giganotosaurus", name:"Giganotosaurus", type:"fire", stage:2, power:4000, hp:4000, effect:"Each time this card discards energy to attack, double the required cost.", imageEmoji:"🔥", category:"dino" },
    { id:"Herrerasaurus", name:"Herrerasaurus", type:"electric", stage:1, power:600, hp:800, effect:"When evolved from Baby Velociraptor, special a Pack token.", imageEmoji:"⚡", category:"dino" },
    { id:"Ichthyosaurus", name:"Ichthyosaurus", type:"water", stage:2, power:1500, hp:1500, effect:"Submerged: discard energy each turn or surface. End of turn if submerged, add Baby Ichthyosaurus.", imageEmoji:"💧", category:"dino" },
    { id:"Kronosaurus", name:"Kronosaurus", type:"water", stage:2, power:1200, hp:3500, effect:"Remove energy from opponent dino; if starter, destroy random opponent card.", imageEmoji:"💧", category:"dino", ability: { cost:1, effect:"remove opponent energy" } },
    { id:"Lokiceratops", name:"Lokiceratops", type:"grass", stage:2, power:1600, hp:1900, effect:"Gains power equal to HP loss.", imageEmoji:"🌿", category:"dino" },
    { id:"Megalodon", name:"Megalodon", type:"water", stage:2, power:3200, hp:2700, effect:"Remove energy from opponent dino; if starter, destroy random opponent card.", imageEmoji:"💧", category:"dino", ability: { cost:1, effect:"remove opponent energy" } },
    { id:"Mosasaur", name:"Mosasaur", type:"water", stage:2, power:3000, hp:3200, effect:"Gain counters while submerged; remove counters to deal damage.", imageEmoji:"💧", category:"dino" },
    { id:"Nasutoceratops", name:"Nasutoceratops", type:"grass", stage:2, power:1700, hp:2400, effect:"Dinos you control cannot be poisoned.", imageEmoji:"🌿", category:"dino" },
    { id:"Natures Revenge", name:"Natures Revenge", type:"grass", stage:3, power:4000, hp:4000, effect:"Immune to card effects and ailments.", imageEmoji:"🌿", category:"dino" },
    { id:"Plesiosaur", name:"Plesiosaur", type:"water", stage:2, power:2500, hp:1800, effect:"When attacking, send 2 opponent cards to GY without seeing.", imageEmoji:"💧", category:"dino" },
    { id:"Spinosaurus", name:"Spinosaurus", type:"water", stage:2, power:2500, hp:4000, effect:"If submerged at start of turn, submerge opponent dino; must stay submerged.", imageEmoji:"💧", category:"dino" },
    { id:"Styracosaurus", name:"Styracosaurus", type:"grass", stage:1, power:900, hp:1100, effect:"Prevents submerge on your dinos.", imageEmoji:"🌿", category:"dino" },
    { id:"Triceratops", name:"Triceratops", type:"grass", stage:2, power:2000, hp:4000, effect:"Immune to card effects and ailments.", imageEmoji:"🌿", category:"dino" },
    { id:"Tyrannosaurus Rex", name:"Tyrannosaurus Rex", type:"fire", stage:2, power:3000, hp:3000, effect:"This dino can attack up to twice per turn.", imageEmoji:"🔥", category:"dino" },
    { id:"Velociraptor", name:"Velociraptor", type:"electric", stage:1, power:500, hp:500, effect:"When evolved from Baby Velociraptor, special a Pack token.", imageEmoji:"⚡", category:"dino" },
    { id:"Wrath Of The Sea", name:"Wrath Of The Sea", type:"water", stage:3, power:3500, hp:7500, effect:"When evolved or placed in starter zone, all dinos submerged. Opponent can pay 2 energy per dino to surface.", imageEmoji:"💧", category:"dino" }
  ],
  moves: [
    { id:"Death Role", name:"Death Role", type:"water", cost:4, effect:"Destroy opponent dino ignoring defense.", imageEmoji:"💀", category:"move" },
    { id:"Drown", name:"Drown", type:"water", cost:2, effect:"If Predator X in GY, remove random card from opponent hand.", imageEmoji:"💧", category:"move" },
    { id:"Lightning Attack", name:"Lightning Attack", type:"electric", cost:1, effect:"Paralyze defender.", imageEmoji:"⚡", category:"move", appliesAilment: "paralyzed" },
    { id:"Lightning spear", name:"Lightning spear", type:"electric", cost:2, effect:"Attack twice this battle phase.", imageEmoji:"⚡", category:"move" },
    { id:"Overflow", name:"Overflow", type:"water", cost:5, effect:"Deal extra x1000 per card advantage.", imageEmoji:"💧", category:"move" },
    { id:"Quick bolt", name:"Quick bolt", type:"electric", cost:5, effect:"Dinos ≤1500 power attack 3 times.", imageEmoji:"⚡", category:"move" },
    { id:"Quick thunder", name:"Quick thunder", type:"electric", cost:3, effect:"Paralyze up to 3 dinos.", imageEmoji:"⚡", category:"move", appliesAilment: "paralyzed" },
    { id:"Thunder ball", name:"Thunder ball", type:"electric", cost:4, effect:"Sweep + paralyze adjacent.", imageEmoji:"⚡", category:"move", appliesAilment: "paralyzed" },
    { id:"Tsunami", name:"Tsunami", type:"water", cost:1, effect:"Submerge target.", imageEmoji:"🌊", category:"move", appliesAilment: "submerged" },
    { id:"Whirlpool", name:"Whirlpool", type:"water", cost:3, effect:"If Dunkleosteus, add 1 energy to any aqua dino.", imageEmoji:"🌊", category:"move" }
  ],
  research: [
    { id:"Abandoned laboratory", name:"Abandoned laboratory", effect:"Stays; store energy to revive dino.", imageEmoji:"🧪", category:"research", isField: true },
    { id:"Dig site", name:"Dig site", effect:"Add a dino from deck to hand.", imageEmoji:"⛏️", category:"research", isField: false },
    { id:"Extinction", name:"Extinction", effect:"Destroy dinos from hand/field, add support cards.", imageEmoji:"💀", category:"research", isField: false },
    { id:"Laboratory", name:"Laboratory", effect:"Stays; store energy to hybrid dinos.", imageEmoji:"🧪", category:"research", isField: true },
    { id:"Palaeontology", name:"Palaeontology", effect:"Search deck for a move card.", imageEmoji:"📜", category:"research", isField: false }
  ]
};

export const ALL_CARDS = [...CARD_CATALOG.dinos, ...CARD_CATALOG.moves, ...CARD_CATALOG.research];

export const ENERGY_TYPES = ["Fire", "Water", "Grass", "Ground", "Electric", "Normal", "Wind"];
export function createEnergyCard(type) {
  return { id:`${type}Energy`, name:`${type} Energy`, category:"energy", energyType:type, imageEmoji:"⚡" };
}
