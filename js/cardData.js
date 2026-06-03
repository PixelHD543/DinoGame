// Shared card database
export const CARD_CATALOG = {
    dinos: [
        { id:"Baby rex", name:"Baby rex", type:"fire", stage:1, power:1500, hp:2000, effect:"", category:"dino" },
        { id:"T-rex", name:"T-rex", type:"fire", stage:2, power:3000, hp:3500, effect:"", category:"dino" },
        { id:"Baby Triceratops", name:"Baby Triceratops", type:"grass", stage:1, power:2000, hp:2500, effect:"", category:"dino" },
        { id:"Triceratops", name:"Triceratops", type:"grass", stage:2, power:4000, hp:4000, effect:"Immune to effects", category:"dino" },
        { id:"Baby Velociraptor", name:"Baby Velociraptor", type:"electric", stage:1, power:1000, hp:800, effect:"", category:"dino" },
        { id:"Velociraptor", name:"Velociraptor", type:"electric", stage:1, power:500, hp:500, effect:"", category:"dino" },
        { id:"Dilophosaurus", name:"Dilophosaurus", type:"electric", stage:1, power:1000, hp:500, effect:"Poison on attack", category:"dino" }
    ],
    moves: [
        { id:"Lightning Attack", name:"Lightning Attack", type:"electric", cost:1, effect:"Paralyze", category:"move", appliesAilment:"paralyzed" },
        { id:"Tsunami", name:"Tsunami", type:"water", cost:1, effect:"Submerge", category:"move", appliesAilment:"submerged" }
    ],
    research: [
        { id:"Dig site", name:"Dig site", effect:"Add a dino from deck to hand", category:"research", isField: false }
    ]
};

export const ALL_CARDS = [...CARD_CATALOG.dinos, ...CARD_CATALOG.moves, ...CARD_CATALOG.research];
export const ENERGY_TYPES = ["Fire","Water","Grass","Ground","Electric","Normal","Wind"];

export function createEnergyCard(t) { 
    return { id:`${t}Energy`, name:`${t} Energy`, category:"energy", energyType:t }; 
}

export function shuffle(arr) { 
    for(let i=arr.length-1;i>0;i--){ 
        let j=Math.floor(Math.random()*(i+1)); 
        [arr[i],arr[j]]=[arr[j],arr[i]]; 
    } 
    return arr; 
}
