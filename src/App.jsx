import { useState, useEffect, useMemo, useRef } from "react";
// Fallback storage that uses localStorage when window.storage isn't available
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(key);
      return v === null ? null : { key, value: v };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return { keys, prefix };
    },
  };
}
// ============================================================
// WARHAMMER 40K — 10th/11th EDITION DATA
// Comprehensive faction/sub-faction/detachment/enhancement set.
// Point values are approximations for fun list-generation,
// not tournament-legal.
// ============================================================

const SM_BASE = {
  hq: [
    { name: "Captain", points: 95, max: 1 },
    { name: "Captain in Terminator Armour", points: 105, max: 1 },
    { name: "Chaplain", points: 85, max: 1 },
    { name: "Librarian", points: 90, max: 1 },
    { name: "Lieutenant", points: 75, max: 2 },
    { name: "Apothecary", points: 70, max: 1 },
    { name: "Techmarine", points: 60, max: 2 },
    { name: "Ancient", points: 60, max: 1 },
  ],
  troops: [
    { name: "Tactical Squad (5)", points: 90, max: 6 },
    { name: "Intercessor Squad (5)", points: 100, max: 6 },
    { name: "Assault Intercessor Squad (5)", points: 95, max: 6 },
    { name: "Scout Squad (5)", points: 75, max: 6 },
    { name: "Infiltrator Squad (5)", points: 115, max: 3 },
    { name: "Heavy Intercessor Squad (5)", points: 125, max: 3 },
    { name: "Incursor Squad (5)", points: 100, max: 3 },
  ],
  elites: [
    { name: "Terminator Squad (5)", points: 185, max: 3 },
    { name: "Assault Terminator Squad (5)", points: 190, max: 3 },
    { name: "Sternguard Veterans (5)", points: 130, max: 2 },
    { name: "Bladeguard Veterans (3)", points: 115, max: 2 },
    { name: "Aggressor Squad (3)", points: 125, max: 2 },
    { name: "Eradicator Squad (3)", points: 95, max: 2 },
    { name: "Dreadnought", points: 135, max: 3 },
    { name: "Redemptor Dreadnought", points: 210, max: 2 },
    { name: "Brutalis Dreadnought", points: 160, max: 2 },
  ],
  fast: [
    { name: "Assault Squad (5)", points: 110, max: 3 },
    { name: "Assault Squad with Jump Packs (5)", points: 100, max: 3 },
    { name: "Inceptor Squad (3)", points: 130, max: 2 },
    { name: "Outrider Squad (3)", points: 115, max: 2 },
    { name: "Suppressor Squad (3)", points: 80, max: 2 },
    { name: "Invader ATV", points: 90, max: 2 },
  ],
  heavy: [
    { name: "Devastator Squad (5)", points: 130, max: 3 },
    { name: "Hellblaster Squad (5)", points: 175, max: 2 },
    { name: "Eliminator Squad (3)", points: 90, max: 2 },
    { name: "Predator Annihilator", points: 165, max: 2 },
    { name: "Predator Destructor", points: 135, max: 2 },
    { name: "Whirlwind", points: 130, max: 2 },
    { name: "Vindicator", points: 185, max: 2 },
    { name: "Land Raider", points: 250, max: 1 },
    { name: "Repulsor", points: 220, max: 2 },
    { name: "Gladiator Lancer", points: 160, max: 2 },
  ],
  transport: [
    { name: "Rhino", points: 80, max: 4 },
    { name: "Impulsor", points: 110, max: 4 },
    { name: "Razorback", points: 100, max: 3 },
    { name: "Drop Pod", points: 80, max: 3 },
  ],
};

const CSM_BASE = {
  hq: [
    { name: "Chaos Lord", points: 90, max: 1 },
    { name: "Chaos Lord in Terminator Armour", points: 105, max: 1 },
    { name: "Master of Possession", points: 110, max: 1 },
    { name: "Master of Executions", points: 85, max: 1 },
    { name: "Dark Apostle", points: 95, max: 1 },
    { name: "Sorcerer", points: 105, max: 2 },
    { name: "Sorcerer in Terminator Armour", points: 115, max: 1 },
    { name: "Warpsmith", points: 75, max: 1 },
  ],
  troops: [
    { name: "Chaos Space Marines (5)", points: 90, max: 6 },
    { name: "Cultists Mob (10)", points: 65, max: 6 },
    { name: "Legionaries (5)", points: 100, max: 6 },
  ],
  elites: [
    { name: "Chaos Terminators (5)", points: 195, max: 3 },
    { name: "Possessed (5)", points: 180, max: 2 },
    { name: "Chosen (5)", points: 150, max: 2 },
    { name: "Helbrute", points: 130, max: 3 },
  ],
  fast: [
    { name: "Raptors (5)", points: 110, max: 3 },
    { name: "Warp Talons (5)", points: 175, max: 2 },
    { name: "Bikers (3)", points: 105, max: 2 },
  ],
  heavy: [
    { name: "Havocs (5)", points: 135, max: 3 },
    { name: "Obliterators (3)", points: 230, max: 2 },
    { name: "Forgefiend", points: 175, max: 2 },
    { name: "Defiler", points: 200, max: 2 },
    { name: "Maulerfiend", points: 150, max: 2 },
    { name: "Vindicator", points: 185, max: 2 },
  ],
  transport: [
    { name: "Chaos Rhino", points: 80, max: 4 },
    { name: "Chaos Land Raider", points: 260, max: 1 },
  ],
};

const FACTIONS = {
  // ============================================================
  // IMPERIUM
  // ============================================================

  "Space Marines": {
    color: "#1e3a5f",
    accent: "#c9b037",
    motto: "For the Emperor",
    icon: "✠",
    subFactions: {
      "Codex Compliant": { units: SM_BASE, extra: {} },
      Ultramarines: {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Marneus Calgar", points: 185, max: 1 },
            { name: "Tigurius", points: 90, max: 1 },
            { name: "Sicarius", points: 95, max: 1 },
            { name: "Roboute Guilliman", points: 320, max: 1 },
            { name: "Uriel Ventris", points: 85, max: 1 },
          ],
        },
      },
      "Imperial Fists": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Tor Garadon", points: 90, max: 1 },
            { name: "Lysander", points: 130, max: 1 },
          ],
        },
      },
      "Crimson Fists": {
        units: SM_BASE,
        extra: { hq: [{ name: "Pedro Kantor", points: 110, max: 1 }] },
      },
      "Iron Hands": {
        units: SM_BASE,
        extra: { hq: [{ name: "Iron Father Feirros", points: 85, max: 1 }] },
      },
      Salamanders: {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Vulkan He'stan", points: 130, max: 1 },
            { name: "Adrax Agatone", points: 95, max: 1 },
          ],
        },
      },
      "Raven Guard": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Kayvaan Shrike", points: 110, max: 1 },
            { name: "Aethon Shaan", points: 95, max: 1 },
          ],
        },
      },
      "White Scars": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Kor'sarro Khan", points: 115, max: 1 },
            { name: "Suboden Khan", points: 105, max: 1 },
          ],
        },
      },
    },
    detachments: {
      "Gladius Strike Force": {
        rule: "Combat Doctrines — switch Devastator/Tactical/Assault stance each round",
        enhancements: [
          { name: "Bastion Plate", points: 15, type: "Defensive" },
          { name: "Artificer Armour", points: 10, type: "Defensive" },
          { name: "Adept of the Codex", points: 25, type: "Command" },
          { name: "The Honour Vehement", points: 20, type: "Offensive" },
        ],
      },
      "Anvil Siege Force": {
        rule: "Bolter Drill — re-roll 1s when stationary; +1 to wound on Heavy",
        enhancements: [
          { name: "Fire Discipline", points: 20, type: "Command" },
          { name: "Target Augury Web", points: 15, type: "Utility" },
          { name: "Master of the Forge", points: 30, type: "Command" },
          { name: "Architect of War", points: 25, type: "Defensive" },
        ],
      },
      "Stormlance Task Force": {
        rule: "Lightning Assault — Advance and Charge for Mounted/Bike units",
        enhancements: [
          { name: "Hunter's Instincts", points: 15, type: "Offensive" },
          { name: "Plume of the Plumeria", points: 10, type: "Utility" },
          { name: "Fury of the Storm", points: 25, type: "Offensive" },
          { name: "Hunter's Mark", points: 20, type: "Utility" },
        ],
      },
      "Vanguard Spearhead": {
        rule: "Shadow Masters — -1 to hit at long range; Phobos focus",
        enhancements: [
          { name: "Shadow Master", points: 30, type: "Stealth" },
          { name: "Ghostweave Cloak", points: 20, type: "Defensive" },
          { name: "Master of the Vanguard", points: 25, type: "Command" },
        ],
      },
      "Ironstorm Spearhead": {
        rule: "Armor Bonded — vehicle and Dreadnought re-rolls",
        enhancements: [
          { name: "Adept of the Omnissiah", points: 25, type: "Command" },
          { name: "Tempered Aggression", points: 15, type: "Offensive" },
          { name: "Iron Resolve", points: 30, type: "Defensive" },
        ],
      },
      "1st Company Task Force": {
        rule: "Veteran Strength — Terminator and Veteran focus",
        enhancements: [
          { name: "Champion of Humanity", points: 30, type: "Offensive" },
          { name: "Rites of War", points: 20, type: "Command" },
          { name: "The Imperium's Sword", points: 25, type: "Offensive" },
        ],
      },
      "Firestorm Assault Force": {
        rule: "Close-Range Fury — short-range bonuses to all weapons",
        enhancements: [
          { name: "Fire-Worn", points: 20, type: "Offensive" },
          { name: "Forged in Battle", points: 15, type: "Defensive" },
          { name: "Vox Espiritum", points: 25, type: "Command" },
        ],
      },
      "Librarius Conclave": {
        rule: "Empyric Channelling — boosted Psychic abilities for the army",
        enhancements: [
          { name: "Soul Link", points: 25, type: "Command" },
          { name: "Mantle of the Laughing God", points: 20, type: "Defensive" },
          { name: "Psychic Adept", points: 30, type: "Offensive" },
        ],
      },
      "Bastion Task Force": {
        rule: "Hold the Line — Battleline gains durability and OC bonuses",
        enhancements: [
          { name: "Stoic Defender", points: 20, type: "Defensive" },
          { name: "Tactical Acumen", points: 15, type: "Command" },
          { name: "Bulwark", points: 25, type: "Defensive" },
        ],
      },
      "Orbital Assault Force": {
        rule: "Strike From the Sky — Drop Pods and reserves dominate",
        enhancements: [
          { name: "Drop-Force Commander", points: 25, type: "Command" },
          { name: "Sentinel Beacon", points: 20, type: "Mobility" },
          { name: "Master of Insertion", points: 30, type: "Mobility" },
        ],
      },
      "Ceramite Sentinels": {
        rule: "Inviolate Watch — defensive auras around objectives",
        enhancements: [
          { name: "Vigilant Sentinel", points: 20, type: "Defensive" },
          { name: "Aegis Bearer", points: 25, type: "Defensive" },
          { name: "Watchman's Vow", points: 15, type: "Command" },
        ],
      },
      "Headhunter Task Force": {
        rule: "Tank Aces — up to three vehicles become Characters with Enhancements; Tank Aces gain bonus Advance and re-rolls",
        enhancements: [
          { name: "Tank Ace", points: 15, type: "Command" },
          { name: "Hunter Killer", points: 20, type: "Offensive" },
          { name: "Veteran Crew", points: 25, type: "Defensive" },
          { name: "Master Gunner", points: 30, type: "Offensive" },
        ],
      },
      "Armoured Speartip": {
        rule: "Heavy Transports — 14+ wound transports gain Heavy Transport keyword; disembarking units get a free move and bonus to hit",
        enhancements: [
          { name: "Reinforced Plate", points: 25, type: "Defensive" },
          { name: "Iron Resolve", points: 20, type: "Defensive" },
          { name: "Convoy Commander", points: 30, type: "Command" },
          { name: "Disembark Drill", points: 15, type: "Mobility" },
        ],
      },
    },
  },

  "Black Templars": {
    color: "#1a1a1a",
    accent: "#e8e8e8",
    motto: "No pity, no remorse, no fear",
    icon: "✚",
    subFactions: {
      "Black Templars Crusade": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "High Marshal Helbrecht", points: 130, max: 1 },
            { name: "Chaplain Grimaldus", points: 110, max: 1 },
            { name: "Marshal", points: 80, max: 1 },
            { name: "Emperor's Champion", points: 75, max: 1 },
            { name: "Castellan", points: 85, max: 1 },
          ],
          troops: [
            { name: "Crusader Squad (5)", points: 100, max: 6 },
            { name: "Primaris Crusader Squad (10)", points: 180, max: 4 },
          ],
          elites: [
            { name: "Sword Brethren (5)", points: 105, max: 2 },
            { name: "Vanguard Veterans (5)", points: 110, max: 2 },
          ],
        },
      },
    },
    detachments: {
      "Companions of Vehemence": {
        rule: "Crusader Vows — pick a vow each round (zeal, abhor witch, accept challenge, suffer not)",
        enhancements: [
          { name: "Sigismund's Seal", points: 25, type: "Offensive" },
          { name: "Witchseeker Bolts", points: 15, type: "Utility" },
          { name: "Tannhäuser's Bones", points: 30, type: "Defensive" },
          { name: "Champion's Oath", points: 20, type: "Offensive" },
        ],
      },
      "Vindication Task Force": {
        rule: "Templar Wrath — re-rolls vs Psykers and Chaos units",
        enhancements: [
          { name: "Crusader's Helm", points: 20, type: "Command" },
          { name: "Tome of Ectoclades", points: 15, type: "Utility" },
          { name: "Sword of Judgement", points: 25, type: "Offensive" },
        ],
      },
      "Godhammer Assault Force": {
        rule: "Hammer of the Faithful — heavy infantry and armor focus",
        enhancements: [
          { name: "Master Artisan", points: 20, type: "Offensive" },
          { name: "Sigismund's Bequest", points: 30, type: "Offensive" },
          { name: "Vindictor", points: 25, type: "Defensive" },
        ],
      },
      "Wrathful Procession": {
        rule: "Sworn Vengeance — zealous melee charges with extra attacks",
        enhancements: [
          { name: "Witchhunter", points: 20, type: "Offensive" },
          { name: "Litany of Hate", points: 15, type: "Command" },
          { name: "Steadfast Resolve", points: 25, type: "Defensive" },
        ],
      },
    },
  },

  "Blood Angels": {
    color: "#8b0000",
    accent: "#f5d76e",
    motto: "By the blood of Sanguinius",
    icon: "☩",
    subFactions: {
      "Blood Angels": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Commander Dante", points: 125, max: 1 },
            { name: "Mephiston", points: 130, max: 1 },
            { name: "Astorath", points: 110, max: 1 },
            { name: "Lemartes", points: 100, max: 1 },
            { name: "The Sanguinor", points: 130, max: 1 },
            { name: "Sanguinary Priest", points: 80, max: 1 },
            { name: "Death Company Captain", points: 95, max: 1 },
          ],
          elites: [
            { name: "Death Company Marines (5)", points: 100, max: 3 },
            { name: "Sanguinary Guard (5)", points: 175, max: 2 },
            { name: "Death Company Intercessors (5)", points: 105, max: 3 },
          ],
        },
      },
    },
    detachments: {
      "Liberator Assault Group": {
        rule: "Red Thirst — bonus to charges and melee attacks",
        enhancements: [
          { name: "Visage of Death", points: 15, type: "Defensive" },
          { name: "Icon of the Angel", points: 20, type: "Command" },
          { name: "Artisan of War", points: 25, type: "Offensive" },
          { name: "Archangel's Shard", points: 30, type: "Offensive" },
        ],
      },
      "The Lost Brethren": {
        rule: "Black Rage — Death Company-focused, fearless and furious",
        enhancements: [
          { name: "Wrath of Baal", points: 30, type: "Offensive" },
          { name: "Speaker of the Dead", points: 20, type: "Command" },
          { name: "Stricken With Rage", points: 25, type: "Offensive" },
        ],
      },
      "The Angelic Host": {
        rule: "Chapter of Heroes — Sanguinary Guard and Jump Pack focus",
        enhancements: [
          { name: "Heavenly Vengeance", points: 25, type: "Offensive" },
          { name: "Selfless Heroism", points: 20, type: "Defensive" },
          { name: "The Lord's Indignation", points: 30, type: "Offensive" },
        ],
      },
      "Angelic Inheritors": {
        rule: "Inheritance — codex flexibility with Blood Angels flavor",
        enhancements: [
          { name: "Mantle of Baal", points: 25, type: "Defensive" },
          { name: "Honour the Chapter", points: 15, type: "Command" },
          { name: "Veteran of the Long War", points: 20, type: "Offensive" },
        ],
      },
      "Rage-Cursed Onslaught": {
        rule: "Red Tide — accelerating frenzy as units fall",
        enhancements: [
          { name: "Bloody Lineage", points: 20, type: "Offensive" },
          { name: "Icon of Sanguinius", points: 25, type: "Command" },
          { name: "Death's Embrace", points: 30, type: "Offensive" },
        ],
      },
    },
  },

  "Dark Angels": {
    color: "#0d3d2f",
    accent: "#c9b037",
    motto: "Repent! For tomorrow you die",
    icon: "✜",
    subFactions: {
      "Dark Angels": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Lion El'Jonson", points: 320, max: 1 },
            { name: "Azrael", points: 125, max: 1 },
            { name: "Belial", points: 95, max: 1 },
            { name: "Sammael", points: 130, max: 1 },
            { name: "Asmodai", points: 80, max: 1 },
            { name: "Ezekiel", points: 100, max: 1 },
            { name: "Lazarus", points: 95, max: 1 },
          ],
          elites: [
            { name: "Deathwing Knights (5)", points: 235, max: 2 },
            { name: "Deathwing Terminators (5)", points: 195, max: 3 },
          ],
          fast: [
            { name: "Ravenwing Black Knights (3)", points: 150, max: 3 },
            { name: "Ravenwing Command Squad (3)", points: 120, max: 1 },
          ],
        },
      },
    },
    detachments: {
      "Unforgiven Task Force": {
        rule: "Grim Resolve — battle-shock immunity and OC bonuses",
        enhancements: [
          { name: "Pennant of Remembrance", points: 25, type: "Command" },
          { name: "Stubborn Tenacity", points: 20, type: "Defensive" },
          { name: "Weapons of the First Legion", points: 30, type: "Offensive" },
        ],
      },
      "Inner Circle Task Force": {
        rule: "Inner Circle — Deathwing Terminator focus, fights first",
        enhancements: [
          { name: "Deathwing Assault", points: 25, type: "Mobility" },
          { name: "Knight Master", points: 20, type: "Command" },
          { name: "Foe-Smiter", points: 30, type: "Offensive" },
        ],
      },
      "Company of Hunters": {
        rule: "The Hunt — Ravenwing speed and outflanking",
        enhancements: [
          { name: "Pennant of the Eternal Crusade", points: 25, type: "Mobility" },
          { name: "Master of Manoeuvre", points: 20, type: "Command" },
          { name: "Eye of the Unseen", points: 15, type: "Stealth" },
        ],
      },
      "Wrath of the Rock": {
        rule: "Vengeful Rebuke — punishing reaction strikes from Battleline",
        enhancements: [
          { name: "Tome of Malcador", points: 25, type: "Command" },
          { name: "Iron Halo of the Unforgiven", points: 30, type: "Defensive" },
          { name: "Lion's Justice", points: 20, type: "Offensive" },
        ],
      },
      "Lion's Blade Task Force": {
        rule: "Combined Assault — mixed Deathwing/Ravenwing/Greenwing synergy",
        enhancements: [
          { name: "Mantle of the Lion", points: 30, type: "Defensive" },
          { name: "Champion of the Unforgiven", points: 25, type: "Offensive" },
          { name: "Hunter's Resolve", points: 20, type: "Command" },
        ],
      },
    },
  },

  "Space Wolves": {
    color: "#3a5a7c",
    accent: "#d4d4d4",
    motto: "For Russ and the Allfather",
    icon: "ᛟ",
    subFactions: {
      "Space Wolves": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Logan Grimnar", points: 175, max: 1 },
            { name: "Ragnar Blackmane", points: 115, max: 1 },
            { name: "Njal Stormcaller", points: 130, max: 1 },
            { name: "Bjorn the Fell-Handed", points: 215, max: 1 },
            { name: "Ulrik the Slayer", points: 90, max: 1 },
            { name: "Wolf Lord on Thunderwolf", points: 110, max: 1 },
            { name: "Wolf Priest", points: 85, max: 1 },
          ],
          troops: [
            { name: "Grey Hunters (5)", points: 100, max: 6 },
            { name: "Blood Claws (10)", points: 120, max: 4 },
          ],
          elites: [
            { name: "Wolf Guard Terminators (5)", points: 200, max: 3 },
            { name: "Murderfang", points: 150, max: 1 },
            { name: "Arjac Rockfist", points: 95, max: 1 },
          ],
          fast: [
            { name: "Thunderwolf Cavalry (3)", points: 200, max: 3 },
            { name: "Fenrisian Wolves (5)", points: 60, max: 2 },
          ],
        },
      },
    },
    detachments: {
      "Champions of Fenris": {
        rule: "Hunter's Unyielding — Wolf Lord brings rage to the line",
        enhancements: [
          { name: "Foe-Render", points: 25, type: "Offensive" },
          { name: "Fangsword of the Ice Wolf", points: 30, type: "Offensive" },
          { name: "Wulfen Stone", points: 20, type: "Defensive" },
          { name: "Pelt of Balewolf", points: 15, type: "Offensive" },
        ],
      },
      "Saga of the Hunter": {
        rule: "Lone Hunters — bonuses for solo characters and stealth",
        enhancements: [
          { name: "Ghostmane Stalker", points: 25, type: "Stealth" },
          { name: "Stalking Predator", points: 20, type: "Mobility" },
          { name: "Mantle of the Hunter", points: 15, type: "Stealth" },
        ],
      },
      "Saga of the Bold": {
        rule: "Reckless Charge — Blood Claws and Skyclaws unleashed",
        enhancements: [
          { name: "Headtaker", points: 25, type: "Offensive" },
          { name: "Hammer of Wrath", points: 20, type: "Offensive" },
          { name: "Reckless Vow", points: 15, type: "Command" },
        ],
      },
      "Saga of the Beastslayer": {
        rule: "Anti-Monster — bonuses against Monsters and Vehicles",
        enhancements: [
          { name: "Beastslayer", points: 25, type: "Offensive" },
          { name: "Frost Claws", points: 20, type: "Offensive" },
          { name: "Wyrmscale Shield", points: 15, type: "Defensive" },
        ],
      },
      "Saga of the Great Wolf": {
        rule: "Lord of Wolves — command and aura buffs",
        enhancements: [
          { name: "Saga of the High King", points: 30, type: "Command" },
          { name: "Wolf-King's Wisdom", points: 25, type: "Command" },
          { name: "Storm Caller", points: 20, type: "Defensive" },
        ],
      },
    },
  },

  Deathwatch: {
    color: "#2a2a2a",
    accent: "#8b0000",
    motto: "Suffer not the alien to live",
    icon: "☠",
    subFactions: {
      "Deathwatch Kill Team": {
        units: SM_BASE,
        extra: {
          hq: [
            { name: "Watch Master", points: 110, max: 1 },
            { name: "Watch Captain Artemis", points: 90, max: 1 },
            { name: "Watch Captain", points: 95, max: 1 },
          ],
          troops: [
            { name: "Deathwatch Veterans (5)", points: 145, max: 3 },
            { name: "Decimus Kill Team (5)", points: 155, max: 2 },
          ],
        },
      },
    },
    detachments: {
      "Black Spear Task Force": {
        rule: "Mission Tactics — switch tactical doctrine each round vs different keywords",
        enhancements: [
          { name: "Beacon Angelis", points: 15, type: "Mobility" },
          { name: "Tome of Ectoclades", points: 20, type: "Utility" },
          { name: "Bane Bolts", points: 25, type: "Offensive" },
          { name: "Osseus Key", points: 10, type: "Utility" },
        ],
      },
    },
  },

  "Grey Knights": {
    color: "#7a8b9c",
    accent: "#c9b037",
    motto: "Knowledge is power, guard it well",
    icon: "ᛤ",
    subFactions: {
      "Grey Knights": {
        units: {
          hq: [
            { name: "Grand Master Voldus", points: 140, max: 1 },
            { name: "Brother-Captain Stern", points: 125, max: 1 },
            { name: "Grand Master in Nemesis Dreadknight", points: 220, max: 1 },
            { name: "Brother-Captain", points: 105, max: 1 },
            { name: "Brotherhood Champion", points: 85, max: 1 },
            { name: "Librarian", points: 105, max: 1 },
            { name: "Chaplain", points: 85, max: 1 },
            { name: "Techmarine", points: 75, max: 1 },
          ],
          troops: [
            { name: "Strike Squad (5)", points: 120, max: 6 },
            { name: "Interceptor Squad (5)", points: 140, max: 3 },
            { name: "Purgation Squad (5)", points: 150, max: 3 },
          ],
          elites: [
            { name: "Terminator Squad (5)", points: 220, max: 3 },
            { name: "Paladin Squad (3)", points: 200, max: 3 },
            { name: "Purifier Squad (5)", points: 130, max: 2 },
            { name: "Apothecary", points: 60, max: 1 },
          ],
          fast: [
            { name: "Nemesis Dreadknight", points: 165, max: 3 },
          ],
          heavy: [
            { name: "Nemesis Dreadknight (heavy psycannon)", points: 175, max: 3 },
            { name: "Land Raider Crusader", points: 270, max: 1 },
            { name: "Storm Raven Gunship", points: 235, max: 1 },
          ],
          transport: [
            { name: "Rhino", points: 80, max: 3 },
            { name: "Razorback", points: 100, max: 2 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Brotherhood Strike": {
        rule: "Fury of Titan — Deep Striking units re-roll Hit and Wound rolls of 1; flexible Teleport Assault redeployment",
        enhancements: [
          { name: "Augurium Scrolls", points: 15, type: "Utility" },
          { name: "Sigil of Exigence", points: 25, type: "Defensive" },
          { name: "Liber Daemonica", points: 20, type: "Offensive" },
          { name: "First to the Fray", points: 30, type: "Mobility" },
        ],
      },
      "Hallowed Conclave": {
        rule: "Knights of Titan — Terminator-focused detachment with bonuses to elite armored saves and re-rolls",
        enhancements: [
          { name: "Hammer of Right", points: 25, type: "Offensive" },
          { name: "Mantle of Castigation", points: 30, type: "Defensive" },
          { name: "Voice of Terra", points: 20, type: "Command" },
          { name: "Crucible of Malediction", points: 15, type: "Offensive" },
        ],
      },
      Banishers: {
        rule: "Daemon Hunters — high-pressure melee detachment; bonuses against Daemons and on the charge",
        enhancements: [
          { name: "Bringer of Doom", points: 25, type: "Offensive" },
          { name: "Sword of Sigismund's Foes", points: 30, type: "Offensive" },
          { name: "Sigil of the Inquisition", points: 20, type: "Utility" },
          { name: "Wrath of the Innocent", points: 15, type: "Offensive" },
        ],
      },
      "Sanctic Spearhead": {
        rule: "Dread Adversary — Dreadknight and vehicle focus; re-rolls and damage bonuses for big targets",
        enhancements: [
          { name: "Master of Battles", points: 25, type: "Command" },
          { name: "Tempering of the Anvil", points: 30, type: "Defensive" },
          { name: "Hidden Stalker", points: 20, type: "Stealth" },
        ],
      },
      "Augurium Task Force": {
        rule: "Premonition — finesse tools that thwart opponent plans; bonus to reactive movement and counter-strikes",
        enhancements: [
          { name: "Strands of Truth", points: 25, type: "Utility" },
          { name: "Foresight", points: 20, type: "Mobility" },
          { name: "Augurium Mantle", points: 30, type: "Defensive" },
        ],
      },
      "Warpbane Task Force": {
        rule: "Pure Souls — Purifiers and surrounding units empowered; anti-psyker bonuses (Grotmas)",
        enhancements: [
          { name: "Pyre of Faith", points: 25, type: "Offensive" },
          { name: "Bound by Oath", points: 20, type: "Command" },
          { name: "Soulbinder", points: 30, type: "Offensive" },
        ],
      },
    },
  },

  "Adepta Sororitas": {
    color: "#7a1f1f",
    accent: "#f5d76e",
    motto: "Faith is our shield",
    icon: "✟",
    subFactions: {
      "Sisters of Battle": {
        units: {
          hq: [
            { name: "Canoness", points: 65, max: 2 },
            { name: "Canoness with Jump Pack", points: 90, max: 1 },
            { name: "Palatine", points: 50, max: 2 },
            { name: "Morvenn Vahl", points: 220, max: 1 },
            { name: "Saint Celestine", points: 160, max: 1 },
            { name: "Junith Eruita", points: 135, max: 1 },
            { name: "Triumph of Saint Katherine", points: 200, max: 1 },
            { name: "Dialogus", points: 50, max: 1 },
            { name: "Hospitaller", points: 50, max: 1 },
            { name: "Imagifier", points: 60, max: 1 },
            { name: "Dogmata", points: 60, max: 1 },
          ],
          troops: [
            { name: "Battle Sisters Squad (10)", points: 115, max: 6 },
            { name: "Novitiate Squad (10)", points: 90, max: 4 },
          ],
          elites: [
            { name: "Celestian Sacresants (5)", points: 115, max: 3 },
            { name: "Repentia Squad (5)", points: 75, max: 3 },
            { name: "Mortifiers (2)", points: 110, max: 2 },
            { name: "Penitent Engines (2)", points: 90, max: 2 },
            { name: "Arco-Flagellants (3)", points: 50, max: 3 },
          ],
          fast: [
            { name: "Seraphim Squad (5)", points: 85, max: 3 },
            { name: "Zephyrim Squad (5)", points: 90, max: 3 },
            { name: "Paragon Warsuits (3)", points: 215, max: 2 },
          ],
          heavy: [
            { name: "Retributor Squad (5)", points: 115, max: 3 },
            { name: "Castigator", points: 160, max: 2 },
            { name: "Exorcist", points: 175, max: 2 },
            { name: "Immolator", points: 125, max: 3 },
          ],
          transport: [
            { name: "Rhino", points: 80, max: 3 },
            { name: "Sororitas Rhino", points: 80, max: 3 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Hallowed Martyrs": {
        rule: "Acts of Faith — gain Miracle dice as units die, spend to alter rolls",
        enhancements: [
          { name: "Litanies of Faith", points: 15, type: "Command" },
          { name: "Saintly Example", points: 20, type: "Command" },
          { name: "Blade of Saint Ellynor", points: 25, type: "Offensive" },
          { name: "Mantle of Ophelia", points: 30, type: "Defensive" },
        ],
      },
      "Bringers of Flame": {
        rule: "Holy Fire — Flame and Melta weapons gain bonus damage",
        enhancements: [
          { name: "Pure of Will", points: 20, type: "Defensive" },
          { name: "Sigil Ecclesiasticus", points: 15, type: "Command" },
          { name: "Imperial Pyre", points: 30, type: "Offensive" },
        ],
      },
      "Penitent Host": {
        rule: "Atonement Through Blood — Repentia and Penitent units empowered",
        enhancements: [
          { name: "Mark of the Penitent", points: 20, type: "Offensive" },
          { name: "Wrath of the Forsaken", points: 25, type: "Offensive" },
          { name: "Visions of the Saint", points: 15, type: "Command" },
        ],
      },
      "Army of Faith": {
        rule: "Pure Faith — Acts of Faith trigger easier across the army",
        enhancements: [
          { name: "Beacon of Faith", points: 25, type: "Command" },
          { name: "Saint's Guard", points: 20, type: "Defensive" },
          { name: "Inspired Devotion", points: 15, type: "Command" },
        ],
      },
      "Champions of the Faithful": {
        rule: "Champions Stand — character-focused buffs and Heroic Intervention",
        enhancements: [
          { name: "Champion's Blade", points: 25, type: "Offensive" },
          { name: "Sacred Banner", points: 20, type: "Command" },
          { name: "Faithful Bodyguard", points: 30, type: "Defensive" },
        ],
      },
    },
  },

  "Adeptus Custodes": {
    color: "#c9a227",
    accent: "#f5d76e",
    motto: "We are the Emperor's wardens",
    icon: "♛",
    subFactions: {
      "Custodian Guard": {
        units: {
          hq: [
            { name: "Trajann Valoris", points: 135, max: 1 },
            { name: "Captain-General Aetius", points: 120, max: 1 },
            { name: "Shield-Captain", points: 130, max: 2 },
            { name: "Shield-Captain on Dawneagle Jetbike", points: 155, max: 1 },
            { name: "Shield-Captain in Allarus Terminator Armour", points: 130, max: 1 },
            { name: "Blade Champion", points: 120, max: 1 },
            { name: "Knight-Centura", points: 75, max: 1 },
            { name: "Valerian", points: 130, max: 1 },
            { name: "Aleya", points: 70, max: 1 },
          ],
          troops: [
            { name: "Custodian Guard (4)", points: 215, max: 4 },
            { name: "Custodian Wardens (4)", points: 240, max: 3 },
            { name: "Prosecutors (4)", points: 40, max: 3 },
          ],
          elites: [
            { name: "Allarus Terminators (3)", points: 180, max: 3 },
            { name: "Aquilon Terminators (3)", points: 215, max: 2 },
            { name: "Sagittarum Custodians (4)", points: 245, max: 2 },
            { name: "Vigilators (4)", points: 95, max: 2 },
            { name: "Witchseekers (4)", points: 50, max: 2 },
          ],
          fast: [
            { name: "Vertus Praetors (3)", points: 220, max: 3 },
            { name: "Agamatus Custodians (3)", points: 230, max: 2 },
            { name: "Venatari Custodians (3)", points: 165, max: 3 },
          ],
          heavy: [
            { name: "Caladius Grav-Tank", points: 215, max: 2 },
            { name: "Telemon Heavy Dreadnought", points: 230, max: 2 },
            { name: "Contemptor-Achillus Dreadnought", points: 175, max: 2 },
            { name: "Contemptor-Galatus Dreadnought", points: 175, max: 2 },
          ],
          transport: [
            { name: "Land Raider", points: 240, max: 1 },
            { name: "Coronus Grav-Carrier", points: 215, max: 1 },
            { name: "Pallas Grav-Attack", points: 110, max: 2 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Shield Host": {
        rule: "Martial Ka'tah — switch combat stances to fit the foe",
        enhancements: [
          { name: "Veiled Blade", points: 25, type: "Stealth" },
          { name: "Auric Mantle", points: 20, type: "Defensive" },
          { name: "Inspirational Champion", points: 15, type: "Command" },
          { name: "Superior Creation", points: 30, type: "Offensive" },
        ],
      },
      "Talons of the Emperor": {
        rule: "Sisters Sworn — Custodes and Sisters of Silence synergy",
        enhancements: [
          { name: "Champion of the Throneworld", points: 25, type: "Offensive" },
          { name: "Castellan's Mark", points: 20, type: "Command" },
          { name: "Null-Maiden's Blade", points: 30, type: "Offensive" },
        ],
      },
      "Lions of the Emperor": {
        rule: "Heroic Stand — character-focused defensive auras and re-rolls",
        enhancements: [
          { name: "Eagle's Eye", points: 20, type: "Utility" },
          { name: "Praesidius", points: 25, type: "Defensive" },
          { name: "From Golden Light They Came", points: 30, type: "Mobility" },
        ],
      },
      "Solar Spearhead": {
        rule: "Vehicle Cohort — Caladius and Pallas-led armored advance",
        enhancements: [
          { name: "Aquilon's Decree", points: 20, type: "Command" },
          { name: "Master of Engines", points: 25, type: "Defensive" },
          { name: "Solar Inheritance", points: 30, type: "Offensive" },
        ],
      },
      "Auric Champions": {
        rule: "Singular Focus — peerless individual heroes",
        enhancements: [
          { name: "Peerless Warrior", points: 30, type: "Offensive" },
          { name: "Mark of the Companions", points: 20, type: "Command" },
          { name: "Untouchable", points: 25, type: "Defensive" },
        ],
      },
    },
  },

  "Astra Militarum": {
    color: "#3d4a2a",
    accent: "#8b6914",
    motto: "Only in death does duty end",
    icon: "⚜",
    subFactions: {
      "Cadian Shock Troops": {
        units: {
          hq: [
            { name: "Lord Solar Leontus", points: 135, max: 1 },
            { name: "Cadian Castellan", points: 60, max: 2 },
            { name: "Lord Castellan Creed", points: 75, max: 1 },
            { name: "Tank Commander", points: 175, max: 2 },
            { name: "Primaris Psyker", points: 60, max: 2 },
            { name: "Commissar", points: 30, max: 2 },
            { name: "Tempestor Prime", points: 50, max: 2 },
            { name: "Ursula Creed", points: 65, max: 1 },
          ],
          troops: [
            { name: "Cadian Shock Troops (10)", points: 70, max: 6 },
            { name: "Catachan Jungle Fighters (10)", points: 65, max: 6 },
            { name: "Death Korps of Krieg (10)", points: 80, max: 6 },
            { name: "Tempestus Scions (10)", points: 110, max: 6 },
            { name: "Krieg Combat Engineers (10)", points: 85, max: 4 },
            { name: "Conscripts (20)", points: 110, max: 4 },
          ],
          elites: [
            { name: "Cadian Command Squad", points: 30, max: 2 },
            { name: "Kasrkin (10)", points: 100, max: 4 },
            { name: "Bullgryns (3)", points: 105, max: 2 },
            { name: "Ogryns (3)", points: 75, max: 2 },
            { name: "Ratlings (5)", points: 40, max: 2 },
            { name: "Tempestus Command Squad", points: 50, max: 2 },
            { name: "Master of Ordnance", points: 35, max: 1 },
          ],
          fast: [
            { name: "Sentinel", points: 55, max: 3 },
            { name: "Armoured Sentinel", points: 60, max: 3 },
            { name: "Rough Riders (5)", points: 60, max: 2 },
            { name: "Hellhound", points: 115, max: 3 },
            { name: "Bane Wolf", points: 125, max: 2 },
            { name: "Tauros Venator", points: 70, max: 2 },
          ],
          heavy: [
            { name: "Leman Russ Battle Tank", points: 170, max: 3 },
            { name: "Leman Russ Demolisher", points: 180, max: 2 },
            { name: "Leman Russ Executioner", points: 195, max: 2 },
            { name: "Leman Russ Punisher", points: 175, max: 2 },
            { name: "Leman Russ Vanquisher", points: 165, max: 2 },
            { name: "Rogal Dorn Battle Tank", points: 220, max: 2 },
            { name: "Basilisk", points: 135, max: 3 },
            { name: "Manticore", points: 145, max: 2 },
            { name: "Wyvern", points: 90, max: 2 },
            { name: "Hydra", points: 90, max: 2 },
            { name: "Heavy Weapons Squad (3)", points: 65, max: 4 },
          ],
          transport: [
            { name: "Chimera", points: 85, max: 4 },
            { name: "Taurox", points: 75, max: 2 },
            { name: "Taurox Prime", points: 95, max: 2 },
            { name: "Trojan Support Vehicle", points: 70, max: 2 },
          ],
        },
        extra: {},
      },
      "Death Korps of Krieg": {
        units: {
          hq: [
            { name: "Death Korps Marshal", points: 60, max: 2 },
            { name: "Tank Commander", points: 175, max: 2 },
            { name: "Primaris Psyker", points: 60, max: 2 },
            { name: "Commissar", points: 30, max: 2 },
          ],
          troops: [
            { name: "Death Korps of Krieg (10)", points: 80, max: 6 },
            { name: "Krieg Combat Engineers (10)", points: 85, max: 4 },
          ],
          elites: [
            { name: "Krieg Command Squad", points: 35, max: 2 },
            { name: "Master of Ordnance", points: 35, max: 1 },
          ],
          fast: [
            { name: "Death Rider Squadron (5)", points: 80, max: 3 },
            { name: "Sentinel", points: 55, max: 3 },
            { name: "Hellhound", points: 115, max: 3 },
          ],
          heavy: [
            { name: "Leman Russ Battle Tank", points: 170, max: 3 },
            { name: "Leman Russ Demolisher", points: 180, max: 2 },
            { name: "Basilisk", points: 135, max: 3 },
            { name: "Manticore", points: 145, max: 2 },
            { name: "Heavy Weapons Squad (3)", points: 65, max: 4 },
          ],
          transport: [
            { name: "Chimera", points: 85, max: 4 },
            { name: "Trojan Support Vehicle", points: 70, max: 2 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Combined Regiment": {
        rule: "Born Soldiers — Lethal Hits on infantry shooting; orders matter",
        enhancements: [
          { name: "Kurov's Aquila", points: 20, type: "Command" },
          { name: "Grand Strategist", points: 25, type: "Command" },
          { name: "Bolstered Resolve", points: 15, type: "Defensive" },
          { name: "Drillmaster", points: 30, type: "Command" },
        ],
      },
      "Mechanised Assault": {
        rule: "Forward March — transports and mounted units gain mobility tools",
        enhancements: [
          { name: "Rapid Mobilisation", points: 15, type: "Mobility" },
          { name: "Veteran Pilot", points: 20, type: "Mobility" },
          { name: "Old Grudges", points: 25, type: "Offensive" },
        ],
      },
      "Bridgehead Strike": {
        rule: "Hold the Line — defensive bonuses on objectives, boosted Orders",
        enhancements: [
          { name: "Born Leader", points: 20, type: "Command" },
          { name: "Honoured Veteran", points: 15, type: "Defensive" },
          { name: "Tactica Imperialis", points: 25, type: "Command" },
        ],
      },
      "Hammer of the Emperor": {
        rule: "Armoured Might — Leman Russ and Rogal Dorn focus, anti-vehicle bonuses",
        enhancements: [
          { name: "Pyrrhic Victor", points: 25, type: "Offensive" },
          { name: "Tactical Genius", points: 20, type: "Command" },
          { name: "Field Commander", points: 15, type: "Command" },
        ],
      },
      "Grizzled Veterans": {
        rule: "Veteran Steel — Officers issue extra Orders; re-roll 1s under orders",
        enhancements: [
          { name: "Mordian Steel", points: 20, type: "Defensive" },
          { name: "Old Hand", points: 15, type: "Command" },
          { name: "Trench Warrior", points: 25, type: "Offensive" },
        ],
      },
      "Armoured Infantry": {
        rule: "Mechanised Push — Infantry inside transports gain Lethal Hits on first turn after disembarking; transports gain extra movement",
        enhancements: [
          { name: "Hippogriff Pilot", points: 20, type: "Mobility" },
          { name: "Master of Logistics", points: 25, type: "Command" },
          { name: "Reinforced Hull", points: 30, type: "Defensive" },
          { name: "Embark Discipline", points: 15, type: "Mobility" },
        ],
      },
      "Steel Hammer": {
        rule: "Squadron Command — Command Squads issue Orders to vehicle Squadrons; Leman Russ and lighter tanks get the new On My Signal Order",
        enhancements: [
          { name: "Squadron Marshal", points: 25, type: "Command" },
          { name: "Targeting Augur", points: 20, type: "Offensive" },
          { name: "Hammer Strike", points: 30, type: "Offensive" },
          { name: "Field Repair", points: 15, type: "Defensive" },
        ],
      },
    },
  },

  "Adeptus Mechanicus": {
    color: "#5a1010",
    accent: "#c9b037",
    motto: "From the moment I understood the weakness of my flesh",
    icon: "⚙",
    subFactions: {
      "Forge World": {
        units: {
          hq: [
            { name: "Belisarius Cawl", points: 195, max: 1 },
            { name: "Tech-Priest Dominus", points: 95, max: 2 },
            { name: "Tech-Priest Manipulus", points: 80, max: 2 },
            { name: "Tech-Priest Enginseer", points: 55, max: 2 },
            { name: "Skitarii Marshal", points: 50, max: 2 },
            { name: "Archmagos Terminus Thulia Ghuld", points: 165, max: 1 },
          ],
          troops: [
            { name: "Skitarii Vanguard (10)", points: 90, max: 6 },
            { name: "Skitarii Rangers (10)", points: 90, max: 6 },
          ],
          elites: [
            { name: "Sicarian Infiltrators (5)", points: 95, max: 3 },
            { name: "Sicarian Ruststalkers (5)", points: 95, max: 3 },
            { name: "Corpuscarii Electro-Priests (5)", points: 65, max: 3 },
            { name: "Fulgurite Electro-Priests (5)", points: 70, max: 3 },
            { name: "Kataphron Destroyers (3)", points: 130, max: 3 },
            { name: "Kataphron Breachers (3)", points: 140, max: 3 },
            { name: "Servitors (4)", points: 30, max: 2 },
          ],
          fast: [
            { name: "Ironstrider Ballistarii (3)", points: 195, max: 3 },
            { name: "Sydonian Dragoons (3)", points: 145, max: 3 },
            { name: "Pteraxii Skystalkers (5)", points: 80, max: 3 },
            { name: "Pteraxii Sterylizors (5)", points: 90, max: 3 },
            { name: "Serberys Raiders (3)", points: 65, max: 3 },
            { name: "Serberys Sulphurhounds (3)", points: 70, max: 3 },
          ],
          heavy: [
            { name: "Onager Dunecrawler", points: 135, max: 3 },
            { name: "Kastelan Robots (4)", points: 200, max: 2 },
            { name: "Skorpius Disintegrator", points: 140, max: 2 },
            { name: "Archaeopter Stratoraptor", points: 170, max: 2 },
            { name: "Archaeopter Fusilave", points: 160, max: 2 },
            { name: "Archaeopter Transvector", points: 150, max: 1 },
          ],
          transport: [
            { name: "Skorpius Dunerider", points: 90, max: 3 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Skitarii Hunter Cohort": {
        rule: "Hunter Cohort — Skitarii and Mounted units gain stealth and re-rolls",
        enhancements: [
          { name: "Mechanicus Locum", points: 20, type: "Command" },
          { name: "Necromechanic", points: 25, type: "Defensive" },
          { name: "Artisan Plasma Weapons", points: 15, type: "Offensive" },
          { name: "Programmed Retreat", points: 10, type: "Mobility" },
        ],
      },
      "Rad-Zone Corps": {
        rule: "Toxic Atmosphere — debuff enemy units across the table",
        enhancements: [
          { name: "Rad-Saturation", points: 25, type: "Offensive" },
          { name: "Cortex Controller", points: 20, type: "Command" },
          { name: "Lord of Rad-Wastes", points: 15, type: "Offensive" },
        ],
      },
      "Data-Psalm Conclave": {
        rule: "Benedictions of the Omnissiah — Cult Mechanicus units gain blessings",
        enhancements: [
          { name: "Eye of the Omnissiah", points: 20, type: "Command" },
          { name: "Mantra of Discipline", points: 15, type: "Command" },
          { name: "Omnissian Mantra", points: 25, type: "Defensive" },
        ],
      },
      "Explorator Maniple": {
        rule: "Acquisition — claim objective markers for army-wide bonuses",
        enhancements: [
          { name: "Cantic Thrallnet", points: 20, type: "Utility" },
          { name: "Omnissian Sanction", points: 25, type: "Offensive" },
          { name: "Prime Hermeticon", points: 30, type: "Defensive" },
        ],
      },
      "Cohort Cybernetica": {
        rule: "Doctrina Imperatives — Kastelan Robot focus, switching protocols",
        enhancements: [
          { name: "Magos Datasmith", points: 25, type: "Command" },
          { name: "Battle Programming", points: 20, type: "Offensive" },
          { name: "Iron Cradle", points: 15, type: "Defensive" },
        ],
      },
    },
  },

  "Imperial Knights": {
    color: "#2a4a6e",
    accent: "#c9b037",
    motto: "Honour, glory, vengeance",
    icon: "♞",
    subFactions: {
      "Questor Imperialis": {
        units: {
          hq: [
            { name: "Knight Preceptor Canis Rex", points: 460, max: 1 },
          ],
          troops: [
            { name: "Knight Errant", points: 425, max: 2 },
            { name: "Knight Paladin", points: 425, max: 2 },
            { name: "Knight Crusader", points: 460, max: 2 },
            { name: "Knight Gallant", points: 405, max: 2 },
            { name: "Knight Warden", points: 440, max: 2 },
            { name: "Knight Valiant", points: 470, max: 1 },
            { name: "Knight Castellan", points: 540, max: 1 },
          ],
          elites: [
            { name: "Armiger Helverin", points: 145, max: 6 },
            { name: "Armiger Warglaive", points: 150, max: 6 },
            { name: "Armiger Moirax", points: 165, max: 4 },
          ],
          fast: [],
          heavy: [
            { name: "Knight Acastus Porphyrion", points: 660, max: 1 },
            { name: "Knight Castigator", points: 470, max: 1 },
            { name: "Knight Lancer", points: 395, max: 1 },
            { name: "Knight Magaera", points: 460, max: 1 },
          ],
          transport: [],
        },
        extra: {},
      },
    },
    detachments: {
      "Noble Lance": {
        rule: "Oaths of Honour — declare a target each round for re-rolls",
        enhancements: [
          { name: "Banner of Macharius Triumphant", points: 25, type: "Command" },
          { name: "Mysterious Mentor", points: 15, type: "Defensive" },
          { name: "The Cawl Inferno", points: 20, type: "Offensive" },
          { name: "Ion Bulwark", points: 30, type: "Defensive" },
        ],
      },
      "Skyreaper Lance": {
        rule: "Skies of Death — anti-aircraft and anti-Fly bonuses",
        enhancements: [
          { name: "Aether-Conductor Mesh", points: 20, type: "Offensive" },
          { name: "Pinpoint Auspex", points: 15, type: "Utility" },
          { name: "Flak Coordinator", points: 25, type: "Command" },
        ],
      },
      "Lance Formidable": {
        rule: "Lance Formation — coordinated charging with Knights",
        enhancements: [
          { name: "Helm of the Nameless Warrior", points: 25, type: "Defensive" },
          { name: "Knight Seneschal", points: 20, type: "Command" },
          { name: "Sainted Ion Shield", points: 30, type: "Defensive" },
        ],
      },
      "Honoured Knight Houses": {
        rule: "Imperial Pageantry — bonuses scaling with House composition",
        enhancements: [
          { name: "Mentor of Battle", points: 20, type: "Command" },
          { name: "Honoured of the Clave", points: 25, type: "Offensive" },
          { name: "Paragon of the Omnissiah", points: 15, type: "Defensive" },
        ],
      },
      "Cogbound Alliance": {
        rule: "Mechanicus Allies — Knights and Armigers heal each turn near Tech-Priests; allied Mechanicus units re-roll 1s (Grotmas 2024)",
        enhancements: [
          { name: "Magos Questoris", points: 30, type: "Defensive" },
          { name: "Omnissian Champion", points: 25, type: "Defensive" },
          { name: "Vocifer Magnificat", points: 20, type: "Command" },
          { name: "Sacristan Pledge", points: 15, type: "Defensive" },
        ],
      },
    },
  },

  "Agents of the Imperium": {
    color: "#4a4a4a",
    accent: "#c9b037",
    motto: "By any means necessary",
    icon: "⊕",
    subFactions: {
      "Inquisitorial Cadre": {
        units: {
          hq: [
            { name: "Inquisitor Coteaz", points: 90, max: 1 },
            { name: "Inquisitor Karamazov", points: 130, max: 1 },
            { name: "Inquisitor Eisenhorn", points: 105, max: 1 },
            { name: "Inquisitor Greyfax", points: 95, max: 1 },
            { name: "Inquisitor Draxus", points: 100, max: 1 },
            { name: "Ordo Hereticus Inquisitor", points: 65, max: 2 },
            { name: "Ordo Malleus Inquisitor", points: 65, max: 2 },
            { name: "Ordo Xenos Inquisitor", points: 65, max: 2 },
            { name: "Inquisitor in Terminator Armour", points: 95, max: 1 },
          ],
          troops: [
            { name: "Imperial Navy Breachers (10)", points: 100, max: 3 },
            { name: "Astra Telepathica Squad (5)", points: 70, max: 3 },
            { name: "Sister Hospitaller (1)", points: 50, max: 1 },
          ],
          elites: [
            { name: "Vindicare Assassin", points: 110, max: 1 },
            { name: "Eversor Assassin", points: 110, max: 1 },
            { name: "Callidus Assassin", points: 100, max: 1 },
            { name: "Culexus Assassin", points: 100, max: 1 },
            { name: "Crusaders (5)", points: 65, max: 2 },
            { name: "Death Cult Assassins (5)", points: 50, max: 2 },
            { name: "Daemonhost (1)", points: 75, max: 1 },
          ],
          fast: [
            { name: "Subductor Squad (5)", points: 60, max: 2 },
            { name: "Vigilant Squad (5)", points: 60, max: 2 },
          ],
          heavy: [
            { name: "Land Raider", points: 240, max: 1 },
            { name: "Fortis Kill Team (5)", points: 110, max: 2 },
          ],
          transport: [
            { name: "Rhino", points: 80, max: 2 },
            { name: "Chimera", points: 85, max: 2 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Imperialis Fleet": {
        rule: "Priority Target — pick a target each Command phase for the army to gain re-rolls or extra hits against",
        enhancements: [
          { name: "Auspex of Vex", points: 20, type: "Utility" },
          { name: "Spy Network", points: 25, type: "Stealth" },
          { name: "Psyk-out Grenades", points: 15, type: "Offensive" },
          { name: "Power Mace of the Ordos", points: 20, type: "Offensive" },
        ],
      },
      "Ordo Xenos": {
        rule: "Xeno-Hunter — pick a hostile keyword each turn; gain Lethal Hits and bonus to wound against units with that keyword",
        enhancements: [
          { name: "Xenos Specialist", points: 25, type: "Offensive" },
          { name: "Stalking Predator", points: 20, type: "Mobility" },
          { name: "Watchful Eye", points: 15, type: "Utility" },
        ],
      },
      "Ordo Hereticus": {
        rule: "Hunter of Witches — bonus damage and Devastating Wounds against Psykers and Battle-shocked units",
        enhancements: [
          { name: "Witchhunter's Mark", points: 25, type: "Offensive" },
          { name: "Sanctified Reliquary", points: 20, type: "Defensive" },
          { name: "Pyre Sigil", points: 30, type: "Offensive" },
        ],
      },
      "Ordo Malleus": {
        rule: "Daemon-Slayer — anti-Daemon bonuses; Inquisitor and units gain Devastating Wounds vs Daemon units",
        enhancements: [
          { name: "Daemonbane Sword", points: 30, type: "Offensive" },
          { name: "Soul Sight", points: 20, type: "Utility" },
          { name: "Warding Talisman", points: 25, type: "Defensive" },
        ],
      },
      "Officio Assassinorum Strike Force": {
        rule: "Assassin Cabal — all four Assassins coordinate; Stratagems improve their Stealth and Lethality (Grotmas)",
        enhancements: [
          { name: "Master Assassin", points: 30, type: "Offensive" },
          { name: "Polymorphine Mastery", points: 25, type: "Stealth" },
          { name: "Lightning Reflexes", points: 20, type: "Mobility" },
        ],
      },
    },
  },

  // ============================================================
  // CHAOS
  // ============================================================

  "Chaos Space Marines": {
    color: "#6b1818",
    accent: "#c9b037",
    motto: "Death to the false Emperor",
    icon: "✦",
    subFactions: {
      "Black Legion": {
        units: CSM_BASE,
        extra: {
          hq: [
            { name: "Abaddon the Despoiler", points: 235, max: 1 },
            { name: "Haarken Worldclaimer", points: 100, max: 1 },
          ],
        },
      },
      "Iron Warriors": { units: CSM_BASE, extra: {} },
      "Night Lords": { units: CSM_BASE, extra: {} },
      "Word Bearers": {
        units: CSM_BASE,
        extra: { hq: [{ name: "Kravek Morne", points: 95, max: 1 }] },
      },
      "Alpha Legion": { units: CSM_BASE, extra: {} },
      "Red Corsairs": {
        units: CSM_BASE,
        extra: {
          hq: [
            { name: "Huron Blackheart", points: 95, max: 1 },
            { name: "Red Corsairs Reave-Captain", points: 85, max: 1 },
          ],
        },
      },
      "Creations of Bile": {
        units: CSM_BASE,
        extra: { hq: [{ name: "Fabius Bile", points: 100, max: 1 }] },
      },
      "Cult of the Arkifane": {
        units: CSM_BASE,
        extra: { hq: [{ name: "Vashtorr the Arkifane", points: 195, max: 1 }] },
      },
    },
    detachments: {
      "Veterans of the Long War": {
        rule: "Battle Hardened — re-rolls and Dark Pact bonuses",
        enhancements: [
          { name: "Mark of the Hound", points: 15, type: "Mobility" },
          { name: "Eye of Tzeentch", points: 25, type: "Defensive" },
          { name: "Talisman of Burning Blood", points: 20, type: "Offensive" },
          { name: "Arch-Blasphemer", points: 30, type: "Command" },
        ],
      },
      "Dread Talons": {
        rule: "Nightmare Hunters — aura of terror, bonus vs battle-shocked enemies",
        enhancements: [
          { name: "Helm of Horrors", points: 20, type: "Defensive" },
          { name: "Iron Standard", points: 15, type: "Command" },
          { name: "The Bloodied Arms", points: 25, type: "Offensive" },
        ],
      },
      "Renegade Raiders": {
        rule: "Raid and Pillage — Scout/Infiltrate/Outflank bonuses",
        enhancements: [
          { name: "Reaper of the Dread Lord", points: 20, type: "Offensive" },
          { name: "Mark of the Spider", points: 25, type: "Mobility" },
          { name: "Battle Tactics", points: 15, type: "Command" },
        ],
      },
      "Fellhammer Siege-host": {
        rule: "Siegebreaker — heavy weapons and tank focus",
        enhancements: [
          { name: "Master of Slaughter", points: 25, type: "Offensive" },
          { name: "Cycle of Carnage", points: 20, type: "Offensive" },
          { name: "Soul Reaver", points: 30, type: "Defensive" },
        ],
      },
      "Pactbound Zealots": {
        rule: "Marks Empower — Mark of god gives extra abilities through Dark Pacts",
        enhancements: [
          { name: "Bloodthirster's Rage", points: 25, type: "Offensive" },
          { name: "Tzeentchian Conduit", points: 20, type: "Offensive" },
          { name: "Plague-Wreathed Aura", points: 25, type: "Defensive" },
          { name: "Slaaneshi Resplendence", points: 20, type: "Mobility" },
        ],
      },
      "Soulforged Warpack": {
        rule: "Daemon Engine Cohort — Helbrutes/Forgefiends/Defilers empowered",
        enhancements: [
          { name: "Skull-Forged Hex", points: 25, type: "Offensive" },
          { name: "Daemonsmith", points: 20, type: "Command" },
          { name: "Master of Possession", points: 30, type: "Offensive" },
        ],
      },
      "Cabal of Sorcerers": {
        rule: "Empyric Cabal — Sorcerers and Daemon Princes empowered",
        enhancements: [
          { name: "Dark Obscuration", points: 20, type: "Defensive" },
          { name: "Eye of Night", points: 25, type: "Offensive" },
          { name: "Sorcerous Ascendancy", points: 30, type: "Offensive" },
        ],
      },
      "Chaos Cult": {
        rule: "Mortal Hordes — Cultists and Mutants gain mass-fire bonuses",
        enhancements: [
          { name: "Mark of the Apostle", points: 15, type: "Command" },
          { name: "Cult of the Hidden Truth", points: 20, type: "Offensive" },
          { name: "Heretical Idol", points: 25, type: "Defensive" },
        ],
      },
      "Creations of Bile": {
        rule: "Augmented Warriors — Legionaries gain enhanced statlines",
        enhancements: [
          { name: "Surgeon-Acolyte", points: 30, type: "Defensive" },
          { name: "Augmetic Brutality", points: 25, type: "Offensive" },
          { name: "Bloodscent", points: 20, type: "Offensive" },
        ],
      },
      "Nightmare Hunt": {
        rule: "Night Lords Terror — battle-shock and aura of fear",
        enhancements: [
          { name: "Vox-Caster Screams", points: 15, type: "Utility" },
          { name: "Trophies of Slaughter", points: 20, type: "Offensive" },
          { name: "Murderlord", points: 25, type: "Offensive" },
        ],
      },
      "Huron's Marauders": {
        rule: "Tyrant of Badab — Red Corsairs raiding tactics",
        enhancements: [
          { name: "Bound by Pact", points: 20, type: "Command" },
          { name: "Spoils of Glory", points: 15, type: "Utility" },
          { name: "Master Reaver", points: 25, type: "Offensive" },
        ],
      },
      "Renegade Warband": {
        rule: "Renegades — flexible all-comers warband rule",
        enhancements: [
          { name: "Renegade Standard", points: 20, type: "Command" },
          { name: "Heretical Scion", points: 25, type: "Offensive" },
          { name: "Master of Renegades", points: 30, type: "Command" },
        ],
      },
      "Warpstrike Champions": {
        rule: "Warp-Touched Few — Champions and Possessed empowered by Pacts",
        enhancements: [
          { name: "Champion's Mark", points: 25, type: "Offensive" },
          { name: "Possession Catalyst", points: 30, type: "Offensive" },
          { name: "Warpfire Aura", points: 20, type: "Defensive" },
        ],
      },
      "Cult of the Arkifane": {
        rule: "Vashtorr's Designs — Daemon engines and Arkifane synergy",
        enhancements: [
          { name: "Mark of the Arkifane", points: 25, type: "Offensive" },
          { name: "Forge-Bound Pact", points: 20, type: "Defensive" },
          { name: "Architect of Iron", points: 30, type: "Command" },
        ],
      },
    },
  },

  "Death Guard": {
    color: "#5a6e3a",
    accent: "#8b9e6e",
    motto: "Embrace the gift of decay",
    icon: "☣",
    subFactions: {
      "Plague Company": {
        units: {
          hq: [
            { name: "Mortarion", points: 320, max: 1 },
            { name: "Typhus", points: 130, max: 1 },
            { name: "Lord of Contagion", points: 105, max: 1 },
            { name: "Lord of Virulence", points: 110, max: 1 },
            { name: "Plague Surgeon", points: 70, max: 1 },
            { name: "Malignant Plaguecaster", points: 90, max: 2 },
            { name: "Foul Blightspawn", points: 75, max: 1 },
            { name: "Biologus Putrifier", points: 70, max: 1 },
            { name: "Tallyman", points: 60, max: 1 },
            { name: "Plague Champion", points: 55, max: 1 },
            { name: "Daemon Prince of Nurgle", points: 175, max: 1 },
            { name: "Daemon Prince of Nurgle with Wings", points: 185, max: 1 },
          ],
          troops: [
            { name: "Plague Marines (5)", points: 100, max: 6 },
            { name: "Poxwalkers (10)", points: 60, max: 4 },
            { name: "Cultists (10)", points: 60, max: 3 },
          ],
          elites: [
            { name: "Blightlord Terminators (5)", points: 215, max: 3 },
            { name: "Deathshroud Terminators (3)", points: 180, max: 2 },
            { name: "Possessed (5)", points: 180, max: 2 },
            { name: "Helbrute", points: 135, max: 2 },
          ],
          fast: [
            { name: "Foetid Bloat-Drone", points: 90, max: 3 },
            { name: "Myphitic Blight-Hauler", points: 110, max: 2 },
            { name: "Chaos Spawn (2)", points: 65, max: 3 },
          ],
          heavy: [
            { name: "Plagueburst Crawler", points: 175, max: 3 },
            { name: "Plague Hauler", points: 110, max: 2 },
            { name: "Chaos Land Raider", points: 260, max: 1 },
            { name: "Defiler", points: 200, max: 2 },
            { name: "Chaos Predator Annihilator", points: 165, max: 2 },
          ],
          transport: [
            { name: "Chaos Rhino", points: 80, max: 4 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Virulent Vectorium": {
        rule: "Sticky Contagion — units make objectives spread Nurgle's Gift",
        enhancements: [
          { name: "Befouled Reliquary", points: 20, type: "Defensive" },
          { name: "Plague Banner", points: 25, type: "Command" },
          { name: "Living Plague", points: 30, type: "Offensive" },
          { name: "Eater Plague", points: 15, type: "Offensive" },
        ],
      },
      "Mortarion's Hammer": {
        rule: "Miasmic Bombardment — afflict enemy units across the table; vehicle focus",
        enhancements: [
          { name: "Pestilent Fallout", points: 25, type: "Offensive" },
          { name: "Bilemaw Blight", points: 20, type: "Offensive" },
          { name: "Shriekworm Familiar", points: 15, type: "Defensive" },
          { name: "Mortarion's Sigil", points: 30, type: "Command" },
        ],
      },
      "Champions of Contagion": {
        rule: "Plague Champions — character mobility and contagion swap",
        enhancements: [
          { name: "Crawling Pox", points: 20, type: "Offensive" },
          { name: "Vectorium Banner", points: 25, type: "Command" },
          { name: "Poxripper Familiar", points: 20, type: "Offensive" },
        ],
      },
      "Tallyband Summoners": {
        rule: "Reverberant Rancidity — bring in Nurgle Daemons that share Gift",
        enhancements: [
          { name: "Beckoning Blight", points: 20, type: "Mobility" },
          { name: "Tome of Bounteous Blessings", points: 30, type: "Defensive" },
          { name: "Daemonic Conduit", points: 25, type: "Offensive" },
        ],
      },
      "Shamblerot Vectorium": {
        rule: "Endless Poxwalkers — Poxwalkers Battleline, free reinforcements",
        enhancements: [
          { name: "Plague Standard", points: 20, type: "Command" },
          { name: "Walking Pox", points: 25, type: "Offensive" },
          { name: "Master of the Pox", points: 30, type: "Command" },
        ],
      },
      "Death Lord's Chosen": {
        rule: "Terminator Cohort — Blightlords, Deathshroud and their leaders empowered",
        enhancements: [
          { name: "Living Plague", points: 25, type: "Offensive" },
          { name: "Lord's Authority", points: 20, type: "Command" },
          { name: "Walker of the Long Path", points: 30, type: "Defensive" },
        ],
      },
      "Flyblown Host": {
        rule: "Stealth Swarm — Stealth and Scout for the army",
        enhancements: [
          { name: "Master of the Swarm", points: 25, type: "Stealth" },
          { name: "Bloated Disciple", points: 20, type: "Defensive" },
          { name: "Plague-Wraith Cloak", points: 15, type: "Stealth" },
        ],
      },
    },
  },

  "Thousand Sons": {
    color: "#4a3370",
    accent: "#c9b037",
    motto: "All is dust",
    icon: "𓂀",
    subFactions: {
      "Cabal of Sorcerers": {
        units: {
          hq: [
            { name: "Magnus the Red", points: 425, max: 1 },
            { name: "Ahriman", points: 130, max: 1 },
            { name: "Exalted Sorcerer", points: 110, max: 1 },
            { name: "Exalted Sorcerer on Disc", points: 130, max: 1 },
            { name: "Infernal Master", points: 85, max: 1 },
            { name: "Sorcerer", points: 75, max: 2 },
            { name: "Sorcerer in Terminator Armour", points: 95, max: 1 },
            { name: "Daemon Prince of Tzeentch", points: 175, max: 1 },
            { name: "Daemon Prince of Tzeentch with Wings", points: 195, max: 1 },
            { name: "Lord of Change", points: 220, max: 1 },
            { name: "Kairos Fateweaver", points: 285, max: 1 },
          ],
          troops: [
            { name: "Rubric Marines (5)", points: 105, max: 6 },
            { name: "Tzaangors (10)", points: 70, max: 4 },
            { name: "Cultists Mob (10)", points: 60, max: 3 },
          ],
          elites: [
            { name: "Scarab Occult Terminators (5)", points: 230, max: 3 },
            { name: "Tzaangor Shaman", points: 70, max: 1 },
            { name: "Chaos Spawn (2)", points: 65, max: 2 },
          ],
          fast: [
            { name: "Tzaangor Enlightened (3)", points: 70, max: 3 },
            { name: "Screamers of Tzeentch (3)", points: 60, max: 2 },
            { name: "Flamers of Tzeentch (3)", points: 90, max: 2 },
            { name: "Mutalith Vortex Beast", points: 160, max: 1 },
          ],
          heavy: [
            { name: "Defiler", points: 200, max: 2 },
            { name: "Forgefiend", points: 175, max: 2 },
            { name: "Maulerfiend", points: 150, max: 2 },
            { name: "Helbrute", points: 130, max: 2 },
          ],
          transport: [
            { name: "Chaos Rhino", points: 80, max: 3 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Grand Coven": {
        rule: "Synchronised Ritual — pick a coven blessing each Command phase",
        enhancements: [
          { name: "Athenaean Scrolls", points: 20, type: "Utility" },
          { name: "Umbralefic Crystal", points: 25, type: "Defensive" },
          { name: "Arcane Vortex", points: 30, type: "Offensive" },
          { name: "Perfect Stratagems", points: 15, type: "Command" },
        ],
      },
      "Changehost of Deceit": {
        rule: "Daemonic Illusions — Tzeentch daemons and psyker units veil reality",
        enhancements: [
          { name: "Mantle of the Daemon", points: 30, type: "Defensive" },
          { name: "Trickster's Boon", points: 20, type: "Mobility" },
          { name: "Aura of Mutability", points: 25, type: "Offensive" },
        ],
      },
      "Warpmeld Pact": {
        rule: "Tzaangor and Mortal Cult — bonus to Tzaangors and Cultists",
        enhancements: [
          { name: "Curseling's Touch", points: 20, type: "Offensive" },
          { name: "Beastherd Lord", points: 25, type: "Command" },
          { name: "Bray-Beast Aura", points: 15, type: "Mobility" },
        ],
      },
      "Rubricae Phalanx": {
        rule: "Inexorable Advance — Rubric Marines hardened defensively, slow and lethal",
        enhancements: [
          { name: "Helm of the Third Eye", points: 25, type: "Utility" },
          { name: "Soul Reaper", points: 20, type: "Offensive" },
          { name: "Inferno Flame", points: 30, type: "Offensive" },
        ],
      },
      "Warpforged Cabal": {
        rule: "Daemon Engine Cabal — Forgefiends, Defilers and Helbrutes possessed and empowered",
        enhancements: [
          { name: "Daemonforge", points: 25, type: "Offensive" },
          { name: "Cycle of Slaughter", points: 20, type: "Defensive" },
          { name: "Sigil of the Engine", points: 15, type: "Command" },
        ],
      },
      "Hexwarp Thrallband": {
        rule: "Hex-Threaded Curse — debuff enemy units within range",
        enhancements: [
          { name: "Hexweaver's Mantle", points: 20, type: "Offensive" },
          { name: "Thrall-Lord", points: 25, type: "Command" },
          { name: "Warp-Touched Sigil", points: 30, type: "Offensive" },
        ],
      },
    },
  },

  "World Eaters": {
    color: "#7c1c1c",
    accent: "#d4a017",
    motto: "Blood for the Blood God",
    icon: "𖤐",
    subFactions: {
      "Khorne's Chosen": {
        units: {
          hq: [
            { name: "Angron", points: 415, max: 1 },
            { name: "Khârn the Betrayer", points: 100, max: 1 },
            { name: "Lord Invocatus", points: 145, max: 1 },
            { name: "Master of Executions", points: 75, max: 1 },
            { name: "Chaos Lord", points: 90, max: 2 },
            { name: "Chaos Lord on Juggernaut", points: 130, max: 1 },
            { name: "Daemon Prince of Khorne", points: 175, max: 1 },
            { name: "Daemon Prince of Khorne with Wings", points: 185, max: 1 },
          ],
          troops: [
            { name: "Khorne Berzerkers (10)", points: 180, max: 6 },
            { name: "Jakhals (10)", points: 65, max: 4 },
          ],
          elites: [
            { name: "Eightbound (3)", points: 165, max: 3 },
            { name: "Exalted Eightbound (3)", points: 215, max: 3 },
            { name: "Possessed (5)", points: 180, max: 2 },
            { name: "Helbrute", points: 135, max: 2 },
            { name: "Chaos Spawn (2)", points: 65, max: 2 },
          ],
          fast: [
            { name: "Goremongers (5)", points: 90, max: 3 },
            { name: "Bloodcrushers (3)", points: 145, max: 2 },
            { name: "Flesh Hounds (10)", points: 105, max: 2 },
          ],
          heavy: [
            { name: "Forgefiend", points: 140, max: 3 },
            { name: "Maulerfiend", points: 130, max: 2 },
            { name: "Defiler", points: 200, max: 2 },
            { name: "Lord of Skulls", points: 470, max: 1 },
            { name: "Chaos Land Raider", points: 260, max: 1 },
          ],
          transport: [
            { name: "Chaos Rhino", points: 80, max: 3 },
            { name: "Kharybdis Assault Claw", points: 220, max: 1 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Berzerker Warband": {
        rule: "Charge Frenzy — Berzerkers gain +2 Strength and +1 Attack on charge",
        enhancements: [
          { name: "Favoured of Khorne", points: 25, type: "Command" },
          { name: "Helm of Brazen Ire", points: 25, type: "Defensive" },
          { name: "Berzerker Glaive", points: 30, type: "Offensive" },
          { name: "Battle-Lust", points: 15, type: "Offensive" },
        ],
      },
      "Goretrack Onslaught": {
        rule: "Mounted Cohort — Bikes, Juggernauts and mounted units empowered",
        enhancements: [
          { name: "Cruel Hunter", points: 20, type: "Mobility" },
          { name: "Bloodied Charge", points: 25, type: "Offensive" },
          { name: "Reaper of Skulls", points: 30, type: "Offensive" },
        ],
      },
      "Khorne Daemonkin": {
        rule: "Daemonic Allies — Khorne Daemons fight alongside the Butcher Astartes",
        enhancements: [
          { name: "Daemonic Vigour", points: 25, type: "Defensive" },
          { name: "Slaughterborn", points: 30, type: "Offensive" },
          { name: "Soulbound Champion", points: 20, type: "Command" },
        ],
      },
      "Possessed Slaughterband": {
        rule: "Possessed Frenzy — Eightbound and Possessed unleashed",
        enhancements: [
          { name: "Talisman of Burning Blood", points: 25, type: "Offensive" },
          { name: "Khornate Possession", points: 30, type: "Offensive" },
          { name: "Mark of the Daemon", points: 20, type: "Defensive" },
        ],
      },
      "Vessels of Wrath": {
        rule: "Ferrous Wrath — Daemon engines and walkers empowered (Grotmas)",
        enhancements: [
          { name: "Daemonsmith", points: 25, type: "Offensive" },
          { name: "Iron Slaughterer", points: 30, type: "Offensive" },
          { name: "Master of Engines", points: 20, type: "Command" },
        ],
      },
      "Idols of Khorne": {
        rule: "Brass Idols — Monsters and Titanic units empower nearby Goremongers/Jakhals",
        enhancements: [
          { name: "Brazen Form", points: 25, type: "Defensive" },
          { name: "Butcher Lord", points: 30, type: "Command" },
          { name: "Strategic Slaughter", points: 20, type: "Mobility" },
        ],
      },
    },
  },

  "Emperor's Children": {
    color: "#5a1a4a",
    accent: "#d4a4d4",
    motto: "Perfection in all things",
    icon: "✶",
    subFactions: {
      "Children of Slaanesh": {
        units: {
          hq: [
            { name: "Lucius the Eternal", points: 95, max: 1 },
            { name: "Fulgrim", points: 365, max: 1 },
            { name: "Chaos Lord with Jump Pack", points: 100, max: 1 },
            { name: "Chaos Lord", points: 90, max: 2 },
            { name: "Lord Exultant", points: 85, max: 1 },
            { name: "Daemon Prince of Slaanesh", points: 175, max: 1 },
            { name: "Daemon Prince with Wings", points: 195, max: 1 },
            { name: "Keeper of Secrets", points: 245, max: 1 },
            { name: "Sorcerer", points: 105, max: 1 },
          ],
          troops: [
            { name: "Noise Marines (5)", points: 110, max: 6 },
            { name: "Infractors (5)", points: 100, max: 5 },
            { name: "Tormentors (5)", points: 95, max: 5 },
            { name: "Cultists Mob (10)", points: 60, max: 4 },
          ],
          elites: [
            { name: "Flawless Blades (5)", points: 130, max: 3 },
            { name: "Lord Kakophonist", points: 80, max: 1 },
            { name: "Possessed (5)", points: 180, max: 2 },
            { name: "Chaos Terminators (5)", points: 195, max: 3 },
            { name: "Helbrute", points: 130, max: 2 },
          ],
          fast: [
            { name: "Hellstriders (5)", points: 95, max: 3 },
            { name: "Daemonettes (10)", points: 90, max: 3 },
            { name: "Seekers of Slaanesh (5)", points: 90, max: 2 },
          ],
          heavy: [
            { name: "Chaos Vindicator", points: 175, max: 2 },
            { name: "Chaos Predator Annihilator", points: 165, max: 2 },
            { name: "Defiler", points: 200, max: 2 },
            { name: "Chaos Land Raider", points: 240, max: 1 },
          ],
          transport: [
            { name: "Chaos Rhino", points: 80, max: 3 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Peerless Bladesmen": {
        rule: "Master Duelists — Champion characters fight first, parry attacks",
        enhancements: [
          { name: "Aspiring Champion", points: 20, type: "Offensive" },
          { name: "Diadem of Excess", points: 25, type: "Defensive" },
          { name: "Mark of Excess", points: 30, type: "Offensive" },
          { name: "Slaanesh's Caress", points: 15, type: "Mobility" },
        ],
      },
      "Slaaneshi Excess": {
        rule: "Excessive Indulgence — bonuses scale with cumulative kills",
        enhancements: [
          { name: "Forbidden Knowledge", points: 25, type: "Command" },
          { name: "Refined Cruelty", points: 20, type: "Offensive" },
          { name: "Sublime Speed", points: 30, type: "Mobility" },
        ],
      },
      "The Flawless Host": {
        rule: "Endless Excess — perfection-driven re-rolls",
        enhancements: [
          { name: "Mark of the Connoisseur", points: 25, type: "Offensive" },
          { name: "Unsated Hunger", points: 20, type: "Offensive" },
          { name: "Mantle of Sorcery", points: 30, type: "Defensive" },
        ],
      },
      "Kakophoni Onslaught": {
        rule: "Sonic Storm — Noise Marines and sonic weapon focus",
        enhancements: [
          { name: "Symphonia Daemonika", points: 25, type: "Offensive" },
          { name: "Pinnacle of Excess", points: 30, type: "Offensive" },
          { name: "Lord of Sound", points: 20, type: "Command" },
        ],
      },
      "Daemonkin Coterie": {
        rule: "Slaaneshi Daemonkin — Daemon allies bring speed and frenzy",
        enhancements: [
          { name: "Bewitched Bracelet", points: 20, type: "Defensive" },
          { name: "Daemonic Charm", points: 25, type: "Offensive" },
          { name: "Pact of Excess", points: 30, type: "Offensive" },
        ],
      },
    },
  },

  "Chaos Daemons": {
    color: "#6b2a4a",
    accent: "#9b6e3a",
    motto: "Witness the warp",
    icon: "𓋹",
    subFactions: {
      "Daemonic Legion": {
        units: {
          hq: [
            { name: "Be'lakor", points: 275, max: 1 },
            { name: "Skarbrand", points: 325, max: 1 },
            { name: "Bloodthirster", points: 280, max: 1 },
            { name: "Great Unclean One", points: 245, max: 1 },
            { name: "Lord of Change", points: 220, max: 1 },
            { name: "Keeper of Secrets", points: 245, max: 1 },
            { name: "Bloodmaster", points: 70, max: 1 },
            { name: "Herald of Khorne", points: 75, max: 1 },
            { name: "Poxbringer", points: 75, max: 1 },
            { name: "Changecaster", points: 95, max: 1 },
            { name: "The Masque of Slaanesh", points: 100, max: 1 },
            { name: "Skulltaker", points: 95, max: 1 },
          ],
          troops: [
            { name: "Bloodletters (10)", points: 100, max: 4 },
            { name: "Plaguebearers (10)", points: 110, max: 4 },
            { name: "Pink Horrors (10)", points: 95, max: 4 },
            { name: "Daemonettes (10)", points: 95, max: 4 },
            { name: "Nurglings (3)", points: 50, max: 3 },
          ],
          elites: [
            { name: "Bloodcrushers (3)", points: 145, max: 3 },
            { name: "Plague Drones (3)", points: 175, max: 2 },
            { name: "Flamers of Tzeentch (3)", points: 90, max: 3 },
            { name: "Fiends of Slaanesh (3)", points: 85, max: 2 },
          ],
          fast: [
            { name: "Flesh Hounds (10)", points: 105, max: 3 },
            { name: "Beasts of Nurgle (3)", points: 110, max: 2 },
            { name: "Screamers of Tzeentch (3)", points: 60, max: 3 },
            { name: "Seekers of Slaanesh (5)", points: 90, max: 3 },
          ],
          heavy: [
            { name: "Soul Grinder", points: 200, max: 2 },
            { name: "Burning Chariot", points: 90, max: 2 },
            { name: "Skull Cannon", points: 75, max: 2 },
            { name: "Plague Tower", points: 200, max: 1 },
            { name: "Exalted Seeker Chariot", points: 135, max: 2 },
          ],
          transport: [],
        },
        extra: {},
      },
    },
    detachments: {
      "Legion of Excess": {
        rule: "Slaanesh Daemonic Pact — Slaaneshi units gain speed",
        enhancements: [
          { name: "Soulstealer", points: 25, type: "Offensive" },
          { name: "Aura of Acquiescence", points: 20, type: "Defensive" },
          { name: "Quicksilver Speed", points: 15, type: "Mobility" },
          { name: "Sliver of Carnage", points: 30, type: "Offensive" },
        ],
      },
      "Pact of the Plague God": {
        rule: "Nurgle Devotees — bonus to Toughness and Feel No Pain",
        enhancements: [
          { name: "Putrescent Vitality", points: 25, type: "Defensive" },
          { name: "Hideous Visage", points: 20, type: "Offensive" },
          { name: "Mark of the Plaguefather", points: 30, type: "Defensive" },
        ],
      },
      "Tzeentch Conclave": {
        rule: "Sorcerous Cabal — psychic and re-rolls",
        enhancements: [
          { name: "Master of Sorcery", points: 30, type: "Offensive" },
          { name: "Warpflame Sigil", points: 25, type: "Offensive" },
          { name: "Dark Master", points: 20, type: "Command" },
        ],
      },
      "Khornate Onslaught": {
        rule: "Blood Tithe — Khorne Daemons rage faster",
        enhancements: [
          { name: "Blood Pact", points: 25, type: "Offensive" },
          { name: "Crown of Skulls", points: 20, type: "Defensive" },
          { name: "Reaper Aura", points: 30, type: "Offensive" },
        ],
      },
      "Shadow Legion": {
        rule: "Be'lakor's Court — Daemons drawn from all four pantheons",
        enhancements: [
          { name: "Mantle of Eternal Shadow", points: 30, type: "Defensive" },
          { name: "Shadowking", points: 25, type: "Command" },
          { name: "Soul-Stealer", points: 20, type: "Offensive" },
        ],
      },
      "Daemonic Incursion": {
        rule: "Reality Tear — Daemons can deep strike from anywhere",
        enhancements: [
          { name: "Conduit of the Warp", points: 25, type: "Mobility" },
          { name: "Webway Walker", points: 30, type: "Mobility" },
          { name: "Warp Anchor", points: 20, type: "Utility" },
        ],
      },
    },
  },

  "Chaos Knights": {
    color: "#3d1a1a",
    accent: "#c9b037",
    motto: "Behold the dark champions",
    icon: "♚",
    subFactions: {
      "Iconoclast Houses": {
        units: {
          hq: [],
          troops: [
            { name: "Knight Despoiler", points: 410, max: 2 },
            { name: "Knight Rampager", points: 420, max: 2 },
            { name: "Knight Tyrant", points: 700, max: 1 },
            { name: "Knight Desecrator", points: 425, max: 2 },
            { name: "Knight Abominant", points: 460, max: 1 },
          ],
          elites: [
            { name: "War Dog Karnivore", points: 130, max: 6 },
            { name: "War Dog Brigand", points: 150, max: 6 },
            { name: "War Dog Stalker", points: 135, max: 6 },
            { name: "War Dog Huntsman", points: 140, max: 6 },
            { name: "War Dog Moirax", points: 155, max: 4 },
          ],
          fast: [],
          heavy: [
            { name: "Knight Acastus Asterius", points: 600, max: 1 },
            { name: "Knight Acastus Porphyrion", points: 660, max: 1 },
          ],
          transport: [],
        },
        extra: {},
      },
    },
    detachments: {
      "Traitoris Lance": {
        rule: "Harbingers of Dread — pick a Dread ability each round; force Battle-shock on damaged enemy units",
        enhancements: [
          { name: "The Helm Diabolus", points: 30, type: "Defensive" },
          { name: "Diabolic Bulwark", points: 20, type: "Defensive" },
          { name: "Veil of Medrengard", points: 25, type: "Stealth" },
          { name: "Aetheric Conduit", points: 30, type: "Offensive" },
        ],
      },
      "Iconoclast Fiefdom": {
        rule: "Cult of the Despot — combine Knights with Cultists/Accursed Cultists; sacrifice them for dark blessings (Grotmas 2024)",
        enhancements: [
          { name: "Mark of the Despot", points: 25, type: "Offensive" },
          { name: "Iron Fist", points: 30, type: "Offensive" },
          { name: "Tyrant's Claim", points: 20, type: "Command" },
        ],
      },
      "Houndpack Lance": {
        rule: "Pack Hunters — War Dog units gain Battleline; mobility bonuses and pack synergy",
        enhancements: [
          { name: "Pack Alpha", points: 25, type: "Command" },
          { name: "Hunter's Mark", points: 20, type: "Offensive" },
          { name: "Bestial Ferocity", points: 30, type: "Offensive" },
        ],
      },
      "Infernal Lance": {
        rule: "Pact with Damnation — pass Leadership tests for damage/speed/durability bonuses; failure causes mortal wounds",
        enhancements: [
          { name: "Diabolic Strength", points: 30, type: "Offensive" },
          { name: "Infernal Pact", points: 25, type: "Defensive" },
          { name: "Soulburn Engine", points: 20, type: "Offensive" },
        ],
      },
      "Lords of Dread": {
        rule: "Towering Tyrants — Titanic Knight focus; extra Enhancement slots; units gain OC 5 on objectives",
        enhancements: [
          { name: "Helm of Dominion", points: 30, type: "Command" },
          { name: "Crown of the Tyrant", points: 25, type: "Defensive" },
          { name: "Aetheric Lord", points: 30, type: "Offensive" },
          { name: "Eternal Standard", points: 20, type: "Defensive" },
        ],
      },
    },
  },

  // ============================================================
  // XENOS
  // ============================================================

  Aeldari: {
    color: "#1a4a6e",
    accent: "#c9b037",
    motto: "Faolchu Ar Diwedh",
    icon: "✦",
    subFactions: {
      Asuryani: {
        units: {
          hq: [
            { name: "Asurmen", points: 130, max: 1 },
            { name: "Eldrad Ulthran", points: 105, max: 1 },
            { name: "Avatar of Khaine", points: 285, max: 1 },
            { name: "Farseer", points: 80, max: 2 },
            { name: "Farseer Skyrunner", points: 100, max: 1 },
            { name: "Autarch", points: 70, max: 2 },
            { name: "Autarch Wayleaper", points: 85, max: 1 },
            { name: "Spiritseer", points: 65, max: 1 },
            { name: "Warlock", points: 50, max: 2 },
          ],
          troops: [
            { name: "Guardian Defenders (10)", points: 100, max: 4 },
            { name: "Storm Guardians (10)", points: 100, max: 4 },
            { name: "Dire Avengers (5)", points: 75, max: 4 },
            { name: "Rangers (5)", points: 55, max: 4 },
          ],
          elites: [
            { name: "Howling Banshees (5)", points: 90, max: 3 },
            { name: "Striking Scorpions (5)", points: 95, max: 3 },
            { name: "Fire Dragons (5)", points: 110, max: 3 },
            { name: "Wraithguard (5)", points: 170, max: 2 },
            { name: "Wraithblades (5)", points: 175, max: 2 },
            { name: "Wraithlord", points: 145, max: 2 },
            { name: "Maugan Ra", points: 120, max: 1 },
            { name: "Karandras", points: 130, max: 1 },
            { name: "Jain Zar", points: 130, max: 1 },
            { name: "Fuegan", points: 130, max: 1 },
            { name: "Baharroth", points: 110, max: 1 },
          ],
          fast: [
            { name: "Windriders (3)", points: 60, max: 3 },
            { name: "Shining Spears (3)", points: 105, max: 3 },
            { name: "Warp Spiders (5)", points: 95, max: 3 },
            { name: "Swooping Hawks (5)", points: 80, max: 3 },
            { name: "Vyper Squadron (1)", points: 75, max: 3 },
            { name: "Vaul's Wrath Support Battery (1)", points: 80, max: 2 },
          ],
          heavy: [
            { name: "Dark Reapers (5)", points: 110, max: 3 },
            { name: "War Walker Squadron (1)", points: 75, max: 3 },
            { name: "Wraithknight", points: 425, max: 1 },
            { name: "Skathach Wraithknight", points: 435, max: 1 },
            { name: "Fire Prism", points: 160, max: 3 },
            { name: "Night Spinner", points: 165, max: 2 },
          ],
          transport: [
            { name: "Wave Serpent", points: 130, max: 3 },
            { name: "Falcon", points: 145, max: 2 },
          ],
        },
        extra: {},
      },
      Harlequins: {
        units: {
          hq: [
            { name: "Troupe Master", points: 80, max: 1 },
            { name: "Shadowseer", points: 95, max: 1 },
            { name: "Death Jester", points: 65, max: 1 },
            { name: "Solitaire", points: 105, max: 1 },
          ],
          troops: [
            { name: "Troupe (5)", points: 80, max: 4 },
          ],
          elites: [
            { name: "Skyweavers (2)", points: 80, max: 3 },
          ],
          fast: [
            { name: "Starweavers (1)", points: 95, max: 3 },
          ],
          heavy: [
            { name: "Voidweaver", points: 125, max: 2 },
          ],
          transport: [
            { name: "Starweaver", points: 95, max: 3 },
          ],
        },
        extra: {},
      },
      Ynnari: {
        units: {
          hq: [
            { name: "The Yncarne", points: 285, max: 1 },
            { name: "Yvraine", points: 105, max: 1 },
            { name: "The Visarch", points: 100, max: 1 },
          ],
          troops: [
            { name: "Guardian Defenders (10)", points: 100, max: 3 },
            { name: "Kabalite Warriors (10)", points: 90, max: 3 },
          ],
          elites: [
            { name: "Incubi (5)", points: 95, max: 2 },
            { name: "Wraithguard (5)", points: 170, max: 2 },
          ],
          fast: [
            { name: "Reavers (3)", points: 60, max: 2 },
            { name: "Windriders (3)", points: 60, max: 2 },
          ],
          heavy: [
            { name: "Dark Reapers (5)", points: 110, max: 2 },
            { name: "Ravager", points: 145, max: 2 },
          ],
          transport: [
            { name: "Wave Serpent", points: 130, max: 2 },
            { name: "Raider", points: 105, max: 2 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      Warhost: {
        rule: "Battle Focus — gain tokens for Agile Manoeuvres each round",
        enhancements: [
          { name: "Mantle of the Phoenix Lord", points: 25, type: "Defensive" },
          { name: "Gift of Bel-Annath", points: 20, type: "Utility" },
          { name: "Fate's Messenger", points: 30, type: "Command" },
          { name: "Bladestorm Edict", points: 20, type: "Offensive" },
        ],
      },
      "Windrider Host": {
        rule: "Saim-Hann Cavalry — Windriders, Vypers and Mounted units accelerated",
        enhancements: [
          { name: "Wild Rider", points: 25, type: "Mobility" },
          { name: "Spirit Stone of Anath'lan", points: 20, type: "Defensive" },
          { name: "Falcon's Swiftness", points: 30, type: "Mobility" },
        ],
      },
      "Spirit Conclave": {
        rule: "Ghost Warriors — Wraith units empowered with re-rolls and Toughness",
        enhancements: [
          { name: "Spirit Mark", points: 25, type: "Defensive" },
          { name: "Bonded Spirit", points: 30, type: "Offensive" },
          { name: "Iyanden Sigil", points: 20, type: "Command" },
        ],
      },
      "Guardian Battlehost": {
        rule: "Citizens of the Craftworld — Guardians and Avengers in shuriken storm",
        enhancements: [
          { name: "Bladestorm Conduit", points: 30, type: "Offensive" },
          { name: "Vexspine", points: 20, type: "Offensive" },
          { name: "Stormrider", points: 25, type: "Mobility" },
        ],
      },
      "Seer Council": {
        rule: "Strands of Fate — Fate dice unlock free Stratagems",
        enhancements: [
          { name: "Lucid Eye", points: 20, type: "Utility" },
          { name: "Skein-Reader", points: 25, type: "Command" },
          { name: "Fate's Hand", points: 30, type: "Offensive" },
        ],
      },
      "Aspect Host": {
        rule: "Path of the Warrior — Aspect Warriors and Avatar pick re-rolls each phase",
        enhancements: [
          { name: "Aspect of Murder", points: 25, type: "Offensive" },
          { name: "Mantle of Wisdom", points: 30, type: "Command" },
          { name: "Shimmerstone", points: 15, type: "Defensive" },
        ],
      },
      "Ghosts of the Webway": {
        rule: "Harlequins of the Laughing God — Troupe focused, hit and run",
        enhancements: [
          { name: "The Twilight Pathway", points: 20, type: "Mobility" },
          { name: "Cegorach's Rose", points: 30, type: "Offensive" },
          { name: "Shadowseer's Blessing", points: 25, type: "Defensive" },
        ],
      },
      "Devoted of Ynnead": {
        rule: "Strength from Death — Drukhari and Asuryani fight side by side",
        enhancements: [
          { name: "Crown of Stars", points: 25, type: "Offensive" },
          { name: "Champion of Ynnead", points: 30, type: "Command" },
          { name: "Cup of the Phoenix", points: 20, type: "Defensive" },
        ],
      },
      "Armoured Warhost": {
        rule: "Engines of Vaul — vehicles and weapons platforms empowered (Grotmas)",
        enhancements: [
          { name: "Master of Skyships", points: 25, type: "Offensive" },
          { name: "Spirit-Linked", points: 30, type: "Defensive" },
          { name: "Tank Hunter", points: 20, type: "Offensive" },
        ],
      },
    },
  },

  Drukhari: {
    color: "#2a1a3a",
    accent: "#5a8b2a",
    motto: "Pain is currency",
    icon: "✸",
    subFactions: {
      "Realspace Raiders": {
        units: {
          hq: [
            { name: "Asdrubael Vect", points: 240, max: 1 },
            { name: "Drazhar", points: 140, max: 1 },
            { name: "Lelith Hesperax", points: 110, max: 1 },
            { name: "Lady Malys", points: 130, max: 1 },
            { name: "Urien Rakarth", points: 110, max: 1 },
            { name: "Archon", points: 80, max: 2 },
            { name: "Succubus", points: 80, max: 2 },
            { name: "Haemonculus", points: 75, max: 2 },
            { name: "Court of the Archon", points: 95, max: 1 },
          ],
          troops: [
            { name: "Kabalite Warriors (10)", points: 90, max: 6 },
            { name: "Wyches (10)", points: 100, max: 6 },
            { name: "Wracks (5)", points: 65, max: 4 },
          ],
          elites: [
            { name: "Incubi (5)", points: 95, max: 3 },
            { name: "Mandrakes (5)", points: 85, max: 3 },
            { name: "Grotesques (3)", points: 105, max: 2 },
            { name: "Hand of the Archon", points: 75, max: 1 },
          ],
          fast: [
            { name: "Reavers (3)", points: 60, max: 3 },
            { name: "Hellions (5)", points: 75, max: 3 },
            { name: "Scourges (5)", points: 110, max: 3 },
            { name: "Beastmaster", points: 50, max: 1 },
          ],
          heavy: [
            { name: "Talos (1)", points: 110, max: 3 },
            { name: "Cronos (1)", points: 60, max: 2 },
            { name: "Ravager", points: 145, max: 3 },
            { name: "Voidraven Bomber", points: 200, max: 1 },
            { name: "Razorwing Jetfighter", points: 160, max: 2 },
          ],
          transport: [
            { name: "Raider", points: 105, max: 4 },
            { name: "Venom", points: 70, max: 4 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Realspace Raiders": {
        rule: "Realspace Raid — start with extra Pain tokens for combined Kabalite/Wych/Wrack",
        enhancements: [
          { name: "Crucible of Malediction", points: 20, type: "Offensive" },
          { name: "Blood Dancer", points: 25, type: "Offensive" },
          { name: "Living Muse", points: 15, type: "Mobility" },
          { name: "Soul-Stealer", points: 30, type: "Defensive" },
        ],
      },
      "Skysplinter Assault": {
        rule: "Strike from Transports — disembarking units gain Lance and Ignores Cover",
        enhancements: [
          { name: "Hyper-Stimm Backpack", points: 20, type: "Offensive" },
          { name: "Phantasmal Smoke", points: 15, type: "Defensive" },
          { name: "Master of the Skies", points: 25, type: "Mobility" },
        ],
      },
      "Kabalite Cartel": {
        rule: "Contracts of Spite — pick a kill contract for Pain tokens",
        enhancements: [
          { name: "Sigil of the Archon", points: 25, type: "Command" },
          { name: "Splintered Genius", points: 20, type: "Offensive" },
          { name: "Whisper-Vane", points: 15, type: "Stealth" },
        ],
      },
      "Spectacle of Spite": {
        rule: "Combat Drugs — Wych Cult units gain stat bonuses each round",
        enhancements: [
          { name: "Triptych Whip", points: 25, type: "Offensive" },
          { name: "Adrenalight", points: 20, type: "Mobility" },
          { name: "Incubi Bone-armour", points: 15, type: "Defensive" },
        ],
      },
      "Covenite Coterie": {
        rule: "Stitchflesh Abominations — Coven units gain -1 to wound vs higher Strength",
        enhancements: [
          { name: "Master Regenesist", points: 30, type: "Defensive" },
          { name: "Master Nemesine", points: 25, type: "Offensive" },
          { name: "Master Artisan", points: 20, type: "Defensive" },
        ],
      },
      "Reaper's Wager": {
        rule: "Drukhari and Harlequin alliance — re-rolls based on which side is winning",
        enhancements: [
          { name: "Reaper's Mark", points: 25, type: "Offensive" },
          { name: "Crown of the Wager", points: 20, type: "Command" },
          { name: "Dancer's Grace", points: 15, type: "Mobility" },
        ],
      },
    },
  },

  Necrons: {
    color: "#1a3530",
    accent: "#3aa86a",
    motto: "We who once ruled the stars",
    icon: "☥",
    subFactions: {
      "Sautekh Dynasty": {
        units: {
          hq: [
            { name: "The Silent King", points: 415, max: 1 },
            { name: "Imotekh the Stormlord", points: 130, max: 1 },
            { name: "Trazyn the Infinite", points: 90, max: 1 },
            { name: "Anrakyr the Traveller", points: 95, max: 1 },
            { name: "Orikan the Diviner", points: 80, max: 1 },
            { name: "Illuminor Szeras", points: 165, max: 1 },
            { name: "Vargard Obyron", points: 75, max: 1 },
            { name: "Nemesor Zahndrekh", points: 100, max: 1 },
            { name: "Necron Overlord", points: 85, max: 2 },
            { name: "Catacomb Command Barge", points: 130, max: 1 },
            { name: "Lord", points: 60, max: 2 },
            { name: "Royal Warden", points: 65, max: 1 },
            { name: "Plasmancer", points: 65, max: 1 },
            { name: "Technomancer", points: 75, max: 1 },
            { name: "Cryptek", points: 70, max: 2 },
            { name: "Psychomancer", points: 65, max: 1 },
            { name: "Chronomancer", points: 70, max: 1 },
            { name: "Skorpekh Lord", points: 110, max: 1 },
            { name: "Phasal Subjugator", points: 35, max: 1 },
          ],
          troops: [
            { name: "Necron Warriors (10)", points: 100, max: 6 },
            { name: "Immortals (5)", points: 80, max: 6 },
          ],
          elites: [
            { name: "Lychguard (5)", points: 95, max: 3 },
            { name: "Triarch Praetorians (5)", points: 110, max: 3 },
            { name: "Triarch Stalker", points: 130, max: 2 },
            { name: "Deathmarks (5)", points: 70, max: 3 },
            { name: "Flayed Ones (5)", points: 75, max: 3 },
            { name: "C'tan Shard of the Nightbringer", points: 285, max: 1 },
            { name: "C'tan Shard of the Deceiver", points: 285, max: 1 },
            { name: "C'tan Shard of the Void Dragon", points: 290, max: 1 },
            { name: "Transcendent C'tan", points: 230, max: 1 },
          ],
          fast: [
            { name: "Canoptek Wraiths (3)", points: 110, max: 3 },
            { name: "Canoptek Scarabs (3)", points: 40, max: 3 },
            { name: "Tomb Blades (3)", points: 75, max: 3 },
            { name: "Skorpekh Destroyers (3)", points: 95, max: 3 },
            { name: "Lokhust Heavy Destroyers (3)", points: 130, max: 3 },
            { name: "Hexmark Destroyer", points: 75, max: 1 },
            { name: "Ophydian Destroyers (3)", points: 100, max: 2 },
          ],
          heavy: [
            { name: "Doomsday Ark", points: 200, max: 3 },
            { name: "Annihilation Barge", points: 110, max: 2 },
            { name: "Canoptek Doomstalker", points: 145, max: 3 },
            { name: "Canoptek Spyder", points: 75, max: 2 },
            { name: "Monolith", points: 400, max: 1 },
            { name: "Doom Scythe", points: 230, max: 1 },
            { name: "Tesseract Vault", points: 410, max: 1 },
            { name: "Obelisk", points: 350, max: 1 },
          ],
          transport: [
            { name: "Ghost Ark", points: 145, max: 3 },
            { name: "Night Scythe", points: 160, max: 1 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Awakened Dynasty": {
        rule: "Command Protocols — characters lead units to +1 to hit",
        enhancements: [
          { name: "Phasal Subjugator", points: 35, type: "Utility" },
          { name: "Enaegic Dermal Bond", points: 30, type: "Defensive" },
          { name: "Veil of Darkness", points: 20, type: "Mobility" },
          { name: "The Honoured", points: 25, type: "Command" },
        ],
      },
      "Annihilation Legion": {
        rule: "Annihilation Protocol — Destroyers and melee units gain extra wound damage",
        enhancements: [
          { name: "Dimensional Sanctum", points: 25, type: "Defensive" },
          { name: "Hyperphasic Fulcrum", points: 30, type: "Offensive" },
          { name: "Dread Cataphract", points: 20, type: "Offensive" },
        ],
      },
      "Canoptek Court": {
        rule: "Power Matrix — Cryptek units bring Canoptek warriors online for buffs",
        enhancements: [
          { name: "Adaptive Subroutines", points: 25, type: "Mobility" },
          { name: "Solar Staff", points: 30, type: "Offensive" },
          { name: "Voidscarred", points: 20, type: "Defensive" },
        ],
      },
      "Obeisance Phalanx": {
        rule: "Worthy Foes — Lychguard, Triarch and elite units gain re-roll wounds",
        enhancements: [
          { name: "Neuromechanic Mantle", points: 25, type: "Defensive" },
          { name: "Praetor's Will", points: 30, type: "Offensive" },
          { name: "Phaeron's Glaive", points: 20, type: "Offensive" },
        ],
      },
      "Hypercrypt Legion": {
        rule: "Hyperphasing — units phase out and back to redeploy across the table",
        enhancements: [
          { name: "Dimensional Overseer", points: 25, type: "Mobility" },
          { name: "Arisen Tyrant", points: 30, type: "Command" },
          { name: "Hyperspatial Transfer Node", points: 20, type: "Mobility" },
          { name: "Osteoclave Fulcrum", points: 25, type: "Mobility" },
        ],
      },
      "Starshatter Arsenal": {
        rule: "Relentless Onslaught — heavy artillery and ranged firepower amplified",
        enhancements: [
          { name: "Dimensional Subjugator", points: 25, type: "Offensive" },
          { name: "Hyperphasic Discharge", points: 30, type: "Offensive" },
          { name: "Targeting Resonator", points: 20, type: "Utility" },
        ],
      },
      "Cryptek Conclave": {
        rule: "Technosorcerous Augmentations — Cryptek auras stack across the army",
        enhancements: [
          { name: "Solar Staff", points: 30, type: "Offensive" },
          { name: "Mantle of Lightning", points: 25, type: "Offensive" },
          { name: "Cryptek's Conduit", points: 20, type: "Command" },
        ],
      },
      "Cursed Legion": {
        rule: "Cold Fervour — Flayed Ones and undying horror focus",
        enhancements: [
          { name: "Cursed Mantle", points: 25, type: "Defensive" },
          { name: "Hate-Eaten", points: 30, type: "Offensive" },
          { name: "Phaeron of the Damned", points: 20, type: "Command" },
        ],
      },
      "Pantheon of Woe": {
        rule: "Cosmic Distortion — C'tan shards and necrodermal bindings empowered",
        enhancements: [
          { name: "Necrodermal Anchor", points: 30, type: "Defensive" },
          { name: "Star-Shard", points: 25, type: "Offensive" },
          { name: "Cosmic Tide", points: 20, type: "Mobility" },
        ],
      },
    },
  },

  Orks: {
    color: "#2a4a1a",
    accent: "#c9b037",
    motto: "WAAAGH!",
    icon: "☠",
    subFactions: {
      "Goff Klan": {
        units: {
          hq: [
            { name: "Ghazghkull Thraka", points: 235, max: 1 },
            { name: "Makari", points: 35, max: 1 },
            { name: "Boss Snikrot", points: 75, max: 1 },
            { name: "Beastboss", points: 80, max: 1 },
            { name: "Beastboss on Squigosaur", points: 130, max: 1 },
            { name: "Warboss", points: 75, max: 2 },
            { name: "Warboss in Mega Armour", points: 110, max: 1 },
            { name: "Warboss on Warbike", points: 90, max: 1 },
            { name: "Big Mek", points: 99, max: 2 },
            { name: "Big Mek with Shokk Attack Gun", points: 100, max: 1 },
            { name: "Big Mek in Mega Armour", points: 105, max: 1 },
            { name: "Painboy", points: 60, max: 2 },
            { name: "Mek", points: 50, max: 1 },
            { name: "Weirdboy", points: 70, max: 1 },
            { name: "Wurrboy", points: 55, max: 1 },
            { name: "Zodgrod Wortsnagga", points: 70, max: 1 },
            { name: "Deffkilla Wartrike", points: 130, max: 1 },
            { name: "Wazdakka Gutsmek", points: 175, max: 1 },
          ],
          troops: [
            { name: "Boyz (10)", points: 85, max: 6 },
            { name: "Choppa Boyz (20)", points: 170, max: 4 },
            { name: "Beast Snagga Boyz (10)", points: 95, max: 4 },
            { name: "Gretchin (10)", points: 40, max: 4 },
          ],
          elites: [
            { name: "Nobz (5)", points: 80, max: 3 },
            { name: "Meganobz (5)", points: 175, max: 3 },
            { name: "Kommandos (10)", points: 100, max: 3 },
            { name: "Tankbustas (10)", points: 105, max: 2 },
            { name: "Stormboyz (10)", points: 95, max: 3 },
            { name: "Burna Boyz (10)", points: 100, max: 2 },
            { name: "Lootas (5)", points: 90, max: 3 },
            { name: "Flash Gitz (5)", points: 110, max: 2 },
            { name: "Painboss", points: 65, max: 1 },
            { name: "Mek Boss Buzzgob", points: 75, max: 1 },
          ],
          fast: [
            { name: "Warbikers (3)", points: 90, max: 3 },
            { name: "Squighog Boyz (3)", points: 95, max: 3 },
            { name: "Deffkoptas (3)", points: 90, max: 3 },
            { name: "Megatrakk Scrapjet", points: 95, max: 3 },
            { name: "Shokkjump Dragsta", points: 80, max: 2 },
            { name: "Boomdakka Snazzwagon", points: 90, max: 2 },
            { name: "Kustom Boosta-Blasta", points: 75, max: 2 },
            { name: "Rukkatrukk Squigbuggy", points: 90, max: 2 },
          ],
          heavy: [
            { name: "Battlewagon", points: 160, max: 3 },
            { name: "Deff Dread", points: 125, max: 3 },
            { name: "Killa Kans (3)", points: 145, max: 2 },
            { name: "Morkanaut", points: 270, max: 1 },
            { name: "Gorkanaut", points: 290, max: 1 },
            { name: "Mek Gunz (3)", points: 80, max: 3 },
            { name: "Stompa", points: 770, max: 1 },
            { name: "Deff Rolla Battle Fortress", points: 380, max: 1 },
          ],
          transport: [
            { name: "Trukk", points: 60, max: 4 },
            { name: "Battlewagon", points: 160, max: 2 },
          ],
        },
        extra: {},
      },
      "Bad Moons": {
        units: {
          hq: [],
          troops: [],
          elites: [],
          fast: [],
          heavy: [],
          transport: [],
        },
        extra: {
          hq: [{ name: "Big Mek with Shokk Attack Gun", points: 100, max: 1 }],
        },
      },
      "Speed Freeks": {
        units: {
          hq: [],
          troops: [],
          elites: [],
          fast: [],
          heavy: [],
          transport: [],
        },
        extra: {
          hq: [{ name: "Deffkilla Wartrike", points: 130, max: 1 }],
        },
      },
    },
    detachments: {
      "War Horde": {
        rule: "Get Stuck In — melee weapons gain Sustained Hits 1",
        enhancements: [
          { name: "Kunnin' But Brutal", points: 15, type: "Offensive" },
          { name: "Supa-Cybork Body", points: 15, type: "Defensive" },
          { name: "Headwoppa's Killchoppa", points: 20, type: "Offensive" },
          { name: "Follow Me Ladz", points: 25, type: "Command" },
        ],
      },
      "More Dakka": {
        rule: "Dakka Dakka Dakka — ranged weapons gain Assault and Sustained Hits",
        enhancements: [
          { name: "Gob Boomer", points: 10, type: "Offensive" },
          { name: "Mork's Kunnin'", points: 15, type: "Command" },
          { name: "Zog Off and Eat Dakka!", points: 10, type: "Defensive" },
          { name: "Da Gobshot Thunderbuss", points: 15, type: "Offensive" },
        ],
      },
      "Bully Boyz": {
        rule: "Da Boss Is Watchin' — Nobs and Meganobz lead the warband",
        enhancements: [
          { name: "Targetin' Squigs", points: 15, type: "Offensive" },
          { name: "Dead Shiny Shootas", points: 35, type: "Offensive" },
          { name: "Da Kaptin", points: 10, type: "Command" },
          { name: "Skwad Leader", points: 15, type: "Command" },
        ],
      },
      "Green Tide": {
        rule: "Boyz Mob — Boyz units gain 5+ invuln and re-roll saves of 1",
        enhancements: [
          { name: "Surly as a Squiggoth", points: 20, type: "Defensive" },
          { name: "Skrag Every Stash!", points: 25, type: "Offensive" },
          { name: "Glory Hog", points: 30, type: "Offensive" },
          { name: "Razgit's Magik Map", points: 25, type: "Mobility" },
        ],
      },
      "Taktikal Brigade": {
        rule: "Belligerent Boarders — Stratagem-heavy with mobility tricks",
        enhancements: [
          { name: "Git-spotter Squig", points: 20, type: "Utility" },
          { name: "Tuff Git", points: 5, type: "Defensive" },
          { name: "Proper Killy", points: 15, type: "Offensive" },
          { name: "Bloodthirsty Belligerence", points: 15, type: "Offensive" },
        ],
      },
      "Kult of Speed": {
        rule: "Speed Makes Right — Bikes, Buggies, Walkers and vehicles gain bonuses",
        enhancements: [
          { name: "Speed Makes Right", points: 25, type: "Mobility" },
          { name: "Fasta Than Yooz", points: 35, type: "Mobility" },
          { name: "Blitzkaptin", points: 25, type: "Command" },
          { name: "Runnin' Boots", points: 10, type: "Mobility" },
        ],
      },
      "Dread Mob": {
        rule: "Da Stompiest — Walkers, Killa Kans, and Naut focus",
        enhancements: [
          { name: "Mek's Tools", points: 15, type: "Utility" },
          { name: "Dead Reliable", points: 20, type: "Defensive" },
          { name: "Big Iron Gob", points: 25, type: "Offensive" },
        ],
      },
      "Da Big Hunt": {
        rule: "Da Hunt Is On — Beast Snaggas and Squig units gain monster-hunter bonuses",
        enhancements: [
          { name: "Squiggly Familiar", points: 15, type: "Utility" },
          { name: "Beasthunter's Hide", points: 20, type: "Defensive" },
          { name: "Trophy Rakk", points: 25, type: "Offensive" },
          { name: "Monster-Killa", points: 30, type: "Offensive" },
        ],
      },
      "Blitz Brigade": {
        rule: "Eager for the Fight — Orks disembarking from transports re-roll Advance and Charge; Battlewagons and bus units gain durability",
        enhancements: [
          { name: "Ferocious Show Off", points: 10, type: "Offensive" },
          { name: "Raucous Warcaller", points: 15, type: "Command" },
          { name: "Iron Gob Driver", points: 20, type: "Mobility" },
        ],
      },
      "Speedwaaagh!": {
        rule: "Turbo Boostas — Speed Freeks and Trukks Advance 24 inches in a straight line; Wazdakka makes Warbikers Battleline",
        enhancements: [
          { name: "Kustom Shokk Box", points: 25, type: "Mobility" },
          { name: "Master Meknologist", points: 20, type: "Defensive" },
          { name: "Supa-Burny Fuel", points: 15, type: "Offensive" },
          { name: "Da Bikeboss", points: 30, type: "Command" },
        ],
      },
    },
  },

  Tyranids: {
    color: "#4a2030",
    accent: "#7ab800",
    motto: "Devour all in our path",
    icon: "✦",
    subFactions: {
      "Hive Fleet Leviathan": {
        units: {
          hq: [
            { name: "Hive Tyrant", points: 220, max: 1 },
            { name: "Winged Hive Tyrant", points: 235, max: 1 },
            { name: "Swarmlord", points: 240, max: 1 },
            { name: "Old One Eye", points: 145, max: 1 },
            { name: "Deathleaper", points: 80, max: 1 },
            { name: "Parasite of Mortrex", points: 105, max: 1 },
            { name: "Tervigon", points: 175, max: 1 },
            { name: "Norn Emissary", points: 285, max: 1 },
            { name: "Norn Assimilator", points: 280, max: 1 },
            { name: "Broodlord", points: 80, max: 1 },
            { name: "Neurotyrant", points: 90, max: 1 },
            { name: "Winged Tyranid Prime", points: 75, max: 1 },
            { name: "Tyranid Prime with Lash Whip", points: 80, max: 1 },
          ],
          troops: [
            { name: "Termagants (10)", points: 60, max: 6 },
            { name: "Hormagaunts (10)", points: 65, max: 6 },
            { name: "Gargoyles (10)", points: 75, max: 4 },
            { name: "Tyranid Warriors with Melee Bio-Weapons (3)", points: 100, max: 4 },
            { name: "Tyranid Warriors with Ranged Bio-Weapons (3)", points: 110, max: 4 },
          ],
          elites: [
            { name: "Genestealers (5)", points: 75, max: 3 },
            { name: "Tyrant Guard (3)", points: 110, max: 2 },
            { name: "Lictor", points: 65, max: 2 },
            { name: "Zoanthropes (3)", points: 110, max: 3 },
            { name: "Pyrovore", points: 55, max: 2 },
            { name: "Maleceptor", points: 175, max: 2 },
            { name: "Venomthropes (3)", points: 75, max: 2 },
            { name: "Biovores (3)", points: 100, max: 2 },
            { name: "Hive Guard (3)", points: 105, max: 2 },
          ],
          fast: [
            { name: "Raveners (3)", points: 70, max: 3 },
            { name: "Mawloc", points: 125, max: 2 },
            { name: "Trygon", points: 200, max: 2 },
            { name: "Trygon Prime", points: 210, max: 1 },
            { name: "Tyrannocyte", points: 75, max: 3 },
            { name: "Sky-Slasher Swarm (3)", points: 60, max: 2 },
            { name: "Spore Mines (3)", points: 30, max: 3 },
          ],
          heavy: [
            { name: "Carnifex", points: 105, max: 3 },
            { name: "Screamer-Killer", points: 115, max: 3 },
            { name: "Thornback", points: 125, max: 2 },
            { name: "Haruspex", points: 145, max: 2 },
            { name: "Exocrine", points: 135, max: 2 },
            { name: "Tyrannofex", points: 200, max: 2 },
            { name: "Hierodule", points: 295, max: 1 },
            { name: "Hierophant Bio-Titan", points: 700, max: 1 },
            { name: "Psychophage", points: 95, max: 2 },
          ],
          transport: [],
        },
        extra: {},
      },
    },
    detachments: {
      "Invasion Fleet": {
        rule: "Hyper-Adaptations — pick Sustained Hits, Lethal Hits, or +1 to wound aspect",
        enhancements: [
          { name: "Synaptic Linchpin", points: 20, type: "Utility" },
          { name: "Adaptive Biology", points: 25, type: "Defensive" },
          { name: "Alien Cunning", points: 15, type: "Mobility" },
          { name: "Perfectly Adapted", points: 30, type: "Offensive" },
        ],
      },
      "Crusher Stampede": {
        rule: "Enraged Behemoths — Monsters get +1 to hit and wound as they take damage",
        enhancements: [
          { name: "Norn Crown", points: 25, type: "Command" },
          { name: "Monstrous Reagents", points: 20, type: "Defensive" },
          { name: "Ymgarl Factor", points: 30, type: "Offensive" },
        ],
      },
      "Unending Swarm": {
        rule: "Insurmountable Odds — Endless Multitudes return models, Battleline focus",
        enhancements: [
          { name: "Infesting Brood", points: 25, type: "Defensive" },
          { name: "Apex Strain", points: 20, type: "Offensive" },
          { name: "Unifying Synapse", points: 30, type: "Command" },
        ],
      },
      "Assimilation Swarm": {
        rule: "Feed the Swarm — Harvester units regenerate friendly broods",
        enhancements: [
          { name: "Harvester Adaptive", points: 20, type: "Defensive" },
          { name: "Encephalic Diffuser", points: 25, type: "Defensive" },
          { name: "Bio-Reactor", points: 30, type: "Offensive" },
        ],
      },
      "Vanguard Onslaught": {
        rule: "Questing Tendrils — Vanguard organisms scout and ambush",
        enhancements: [
          { name: "Chameleonic Mutation", points: 20, type: "Stealth" },
          { name: "Vicious Predator", points: 25, type: "Offensive" },
          { name: "Synaptic Triplicity", points: 30, type: "Mobility" },
        ],
      },
      "Synaptic Nexus": {
        rule: "Synaptic Imperatives — Synapse units emit potent army-wide buffs",
        enhancements: [
          { name: "Neurolictor", points: 20, type: "Utility" },
          { name: "Synaptic Channel", points: 25, type: "Command" },
          { name: "Apex Predator", points: 30, type: "Offensive" },
        ],
      },
      "Subterranean Assault": {
        rule: "Burrowing Strike — Trygons, Mawlocs and tunneling broods focus",
        enhancements: [
          { name: "Subterranean Tendril", points: 25, type: "Mobility" },
          { name: "Tremor Hunter", points: 20, type: "Offensive" },
          { name: "Brood-Mother", points: 30, type: "Command" },
        ],
      },
      "Warrior Bioform Onslaught": {
        rule: "Warrior Strain — Tyranid Warriors and Primes empowered",
        enhancements: [
          { name: "Alpha-Strain", points: 25, type: "Offensive" },
          { name: "Brood Prime", points: 20, type: "Command" },
          { name: "Synaptic Lash", points: 30, type: "Offensive" },
        ],
      },
    },
  },

  "T'au Empire": {
    color: "#7c4a2a",
    accent: "#3a8bb8",
    motto: "For the Greater Good",
    icon: "⚛",
    subFactions: {
      "T'au Sept": {
        units: {
          hq: [
            { name: "Commander Shadowsun", points: 130, max: 1 },
            { name: "Commander Farsight", points: 110, max: 1 },
            { name: "Aun'shi", points: 60, max: 1 },
            { name: "Aun'va", points: 80, max: 1 },
            { name: "Commander in Coldstar Battlesuit", points: 125, max: 1 },
            { name: "Commander in Enforcer Battlesuit", points: 100, max: 1 },
            { name: "Commander in Crisis Battlesuit", points: 95, max: 2 },
            { name: "Cadre Fireblade", points: 50, max: 1 },
            { name: "Ethereal", points: 60, max: 1 },
            { name: "Darkstrider", points: 65, max: 1 },
            { name: "Kroot Shaper", points: 50, max: 1 },
            { name: "Kroot War Shaper", points: 50, max: 1 },
            { name: "Kroot Trail Shaper", points: 60, max: 1 },
            { name: "Kroot Lone-Spear", points: 70, max: 1 },
          ],
          troops: [
            { name: "Strike Team (10)", points: 75, max: 6 },
            { name: "Breachee (10)", points: 100, max: 6 },
            { name: "Pathfinder Team (10)", points: 90, max: 4 },
            { name: "Kroot Carnivores (10)", points: 65, max: 6 },
          ],
          elites: [
            { name: "Crisis Battlesuits (3)", points: 130, max: 3 },
            { name: "Crisis Sunforge Battlesuits (3)", points: 145, max: 3 },
            { name: "Crisis Starscythe Battlesuits (3)", points: 135, max: 3 },
            { name: "Crisis Fireknife Battlesuits (3)", points: 130, max: 3 },
            { name: "Stealth Battlesuits (3)", points: 60, max: 3 },
            { name: "XV25 Stealth Battlesuits (6)", points: 110, max: 2 },
            { name: "Ghostkeel Battlesuit", points: 165, max: 2 },
            { name: "Riptide Battlesuit", points: 240, max: 2 },
            { name: "Krootox Rampagers (3)", points: 95, max: 3 },
            { name: "Vespid Stingwings (5)", points: 65, max: 2 },
          ],
          fast: [
            { name: "Tetras (3)", points: 60, max: 3 },
            { name: "Piranhas (3)", points: 70, max: 3 },
            { name: "Kroot Hounds (10)", points: 50, max: 3 },
            { name: "Krootox Riders (3)", points: 80, max: 2 },
          ],
          heavy: [
            { name: "Broadside Battlesuits (3)", points: 230, max: 2 },
            { name: "Hammerhead Gunship", points: 145, max: 3 },
            { name: "Sky Ray Gunship", points: 120, max: 2 },
            { name: "Stormsurge", points: 405, max: 1 },
            { name: "KX139 Ta'unar Supremacy Armour", points: 1050, max: 1 },
            { name: "Sun Shark Bomber", points: 175, max: 2 },
            { name: "Razorshark Strike Fighter", points: 165, max: 2 },
          ],
          transport: [
            { name: "Devilfish", points: 95, max: 3 },
            { name: "TY7 Devilfish APC", points: 95, max: 3 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      Kauyon: {
        rule: "Patient Hunter — from turn 3 onward, ranged weapons gain Sustained Hits",
        enhancements: [
          { name: "Exemplar of the Kauyon", points: 15, type: "Command" },
          { name: "Precision of the Patient Hunter", points: 25, type: "Offensive" },
          { name: "Solid-image Projection Unit", points: 20, type: "Mobility" },
          { name: "Through Unity, Devastation", points: 30, type: "Offensive" },
        ],
      },
      "Mont'ka": {
        rule: "Killing Blow — turns 1-3 grant Lethal Hits to ranged weapons; Assault when Guided",
        enhancements: [
          { name: "Exemplar of the Mont'ka", points: 10, type: "Command" },
          { name: "Strike Swiftly", points: 25, type: "Mobility" },
          { name: "Strategic Conqueror", points: 15, type: "Command" },
          { name: "Coordinated Exploitation", points: 20, type: "Offensive" },
        ],
      },
      "Retaliation Cadre": {
        rule: "Battlesuit Strike — Crisis suits gain Strength bonuses up close, AP near",
        enhancements: [
          { name: "Internal Grenade Racks", points: 15, type: "Offensive" },
          { name: "Strike and Fade", points: 20, type: "Mobility" },
          { name: "Starflare Ignition System", points: 25, type: "Mobility" },
          { name: "Puretide Engram Neurochip", points: 30, type: "Command" },
        ],
      },
      "Kroot Hunting Pack": {
        rule: "Kroot Mercenaries — Kroot units gain stealth, infiltrate and hunting bonuses",
        enhancements: [
          { name: "Master of Pheromones", points: 20, type: "Offensive" },
          { name: "Pheromone Trail", points: 15, type: "Stealth" },
          { name: "Kroothawk Familiar", points: 25, type: "Utility" },
        ],
      },
    },
  },

  "Genestealer Cults": {
    color: "#6e4a8b",
    accent: "#3aa86a",
    motto: "The Star Children come",
    icon: "✪",
    subFactions: {
      "The Hivecult": {
        units: {
          hq: [
            { name: "Magus", points: 85, max: 2 },
            { name: "Patriarch", points: 100, max: 1 },
            { name: "Abominant", points: 105, max: 1 },
            { name: "Primus", points: 80, max: 1 },
            { name: "Acolyte Iconward", points: 60, max: 1 },
            { name: "Clamavus", points: 65, max: 1 },
            { name: "Locus", points: 65, max: 1 },
            { name: "Nexos", points: 65, max: 1 },
            { name: "Reductus Saboteur", points: 60, max: 1 },
            { name: "Sanctus", points: 75, max: 1 },
            { name: "Kelermorph", points: 70, max: 1 },
            { name: "Biophagus", points: 60, max: 1 },
            { name: "Jackal Alphus", points: 75, max: 1 },
            { name: "Benefictus", points: 65, max: 1 },
          ],
          troops: [
            { name: "Neophyte Hybrids (10)", points: 80, max: 6 },
            { name: "Acolyte Hybrids (5)", points: 65, max: 6 },
            { name: "Hybrid Metamorphs (5)", points: 80, max: 4 },
            { name: "Brood Brothers Infantry Squad (10)", points: 70, max: 4 },
          ],
          elites: [
            { name: "Aberrants (5)", points: 130, max: 3 },
            { name: "Purestrain Genestealers (5)", points: 75, max: 3 },
            { name: "Hybrid Familiars", points: 30, max: 1 },
            { name: "Brood Brothers Heavy Weapons Squad (3)", points: 50, max: 2 },
          ],
          fast: [
            { name: "Atalan Jackals (5)", points: 80, max: 3 },
            { name: "Achilles Ridgerunners (3)", points: 75, max: 3 },
          ],
          heavy: [
            { name: "Goliath Rockgrinder", points: 135, max: 3 },
            { name: "Brood Brothers Leman Russ Battle Tank", points: 170, max: 2 },
            { name: "Brood Brothers Sentinel", points: 55, max: 2 },
          ],
          transport: [
            { name: "Goliath Truck", points: 105, max: 3 },
            { name: "Brood Brothers Chimera", points: 85, max: 3 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Brood Cycle": {
        rule: "Cult Ambush — units enter from underground and outflank",
        enhancements: [
          { name: "Cult Demagogue", points: 25, type: "Command" },
          { name: "Glistening Carapace", points: 20, type: "Defensive" },
          { name: "Alien Majesty", points: 30, type: "Offensive" },
          { name: "Enshrouding Mist", points: 15, type: "Stealth" },
        ],
      },
      "Final Day": {
        rule: "Day of Ascension — sacrifice units for game-changing buffs",
        enhancements: [
          { name: "Twisted Helix Conditioning", points: 25, type: "Offensive" },
          { name: "Reality Twister", points: 20, type: "Defensive" },
          { name: "Lord of Cunning", points: 30, type: "Command" },
        ],
      },
      "Host of Ascension": {
        rule: "Ascended Faithful — Aberrants and elite cultists empowered",
        enhancements: [
          { name: "Mark of the Patriarch", points: 25, type: "Defensive" },
          { name: "Brood Mother", points: 20, type: "Command" },
          { name: "Anointed of the Star Children", points: 30, type: "Offensive" },
        ],
      },
      "Outlander Claw": {
        rule: "Bikes and Ridgerunners ride hard — Mounted/Vehicle bonus",
        enhancements: [
          { name: "Trailblazer", points: 25, type: "Mobility" },
          { name: "Sniper's Perch", points: 20, type: "Offensive" },
          { name: "Pack Hunter", points: 30, type: "Offensive" },
        ],
      },
      "Biosanctic Broodsurge": {
        rule: "Bio-engineered — Aberrants and Purestrains unleash mutations",
        enhancements: [
          { name: "Genome-Splice", points: 25, type: "Offensive" },
          { name: "Mutagenic Catalyst", points: 30, type: "Defensive" },
          { name: "Phantom Sigil", points: 20, type: "Stealth" },
        ],
      },
    },
  },

  "Leagues of Votann": {
    color: "#4a6e7c",
    accent: "#c9b037",
    motto: "Strike fast, strike sure",
    icon: "♦",
    subFactions: {
      "Greater Thurian League": {
        units: {
          hq: [
            { name: "Ūthar the Destined", points: 110, max: 1 },
            { name: "Kâhl", points: 90, max: 2 },
            { name: "Brôkhyr Iron-master", points: 80, max: 1 },
            { name: "Einhyr Champion", points: 95, max: 1 },
            { name: "Grimnyr", points: 80, max: 1 },
          ],
          troops: [
            { name: "Hearthkyn Warriors (10)", points: 100, max: 6 },
          ],
          elites: [
            { name: "Einhyr Hearthguard (5)", points: 175, max: 3 },
            { name: "Cthonian Berserks (5)", points: 105, max: 3 },
            { name: "Brôkhyr Thunderkyn (3)", points: 85, max: 2 },
            { name: "Hernkyn Yaegirs (10)", points: 80, max: 3 },
            { name: "Ūthar Hold Guard", points: 130, max: 1 },
          ],
          fast: [
            { name: "Hernkyn Pioneers (3)", points: 95, max: 3 },
          ],
          heavy: [
            { name: "Hekaton Land Fortress", points: 250, max: 2 },
            { name: "Sagitaur (1)", points: 115, max: 3 },
            { name: "Brôkhyr Iron-Kin", points: 145, max: 2 },
          ],
          transport: [
            { name: "Sagitaur", points: 115, max: 2 },
          ],
        },
        extra: {},
      },
    },
    detachments: {
      "Needgaaaârd Oathband": {
        rule: "Judgement Tokens — mark enemy units for army-wide hit/wound bonuses; the all-rounder Votann detachment",
        enhancements: [
          { name: "A Long List", points: 15, type: "Offensive" },
          { name: "Wayfarer's Grace", points: 20, type: "Mobility" },
          { name: "Ancestral Sentence", points: 25, type: "Command" },
          { name: "Grim Demeanour", points: 20, type: "Defensive" },
        ],
      },
      "Persecution Prospect": {
        rule: "Relentless Pursuit — gain Yield Points by sticking to marked targets; harder-hitting Judgement effects",
        enhancements: [
          { name: "Master of Grudges", points: 25, type: "Offensive" },
          { name: "Hunter's Sigil", points: 20, type: "Utility" },
          { name: "Eternal Pursuit", points: 30, type: "Mobility" },
        ],
      },
      "Dêlve Assault Shift": {
        rule: "Berserk Cohort — Cthonian Berserks gain Battleline; bonus damage when paired with Earthshakers and demolition support",
        enhancements: [
          { name: "Brutal Foreman", points: 25, type: "Offensive" },
          { name: "Pickaxe Specialist", points: 20, type: "Offensive" },
          { name: "Mining Charge", points: 30, type: "Offensive" },
        ],
      },
      "Brandfast Oathband": {
        rule: "Mechanised Push — Infantry within 6 inches of a Transport gain Sustained Hits 1; vehicle-focused Stratagems and Overwatch tools",
        enhancements: [
          { name: "Master of the Hekaton", points: 25, type: "Defensive" },
          { name: "Mining Voider", points: 20, type: "Offensive" },
          { name: "Iron-Kin Conduit", points: 30, type: "Command" },
        ],
      },
      "Hearthfyre Arsenal": {
        rule: "Memnyr Cohort — Iron-Masters and Memnyr units generate extra Yield Points on objectives; Steeljacks and big guns shine",
        enhancements: [
          { name: "Master Iron-Master", points: 25, type: "Command" },
          { name: "Memnyr Strategist", points: 30, type: "Defensive" },
          { name: "Forge-Gift", points: 20, type: "Offensive" },
        ],
      },
      Hearthband: {
        rule: "Wall of Hearthguard — Einhyr Hearthguard and Champion focus; replace Judgement Tokens with elite armor support (Grotmas '25)",
        enhancements: [
          { name: "Champion's Resolve", points: 25, type: "Defensive" },
          { name: "Hearth Sentinel", points: 30, type: "Defensive" },
          { name: "Oathwarder", points: 20, type: "Command" },
        ],
      },
    },
  },
};


// ============================================================
// SYNERGIES & COMBO PACKAGES
// ============================================================
// SYNERGIES maps unit name -> array of unit names that pair well with it
// (used to show "Pairs well with..." hints in the unit picker)
//
// COMBOS maps faction name -> array of pre-built core packages
// Each combo has a name, description, and list of unit names to auto-pin.
// The generator fills the rest of the army around them.

const SYNERGIES = {
  // Space Marine leaders pair with their bodyguard squads
  "Captain": ["Tactical Squad (5)", "Intercessor Squad (5)", "Sternguard Veterans (5)"],
  "Captain in Terminator Armour": ["Terminator Squad (5)", "Assault Terminator Squad (5)"],
  "Chaplain": ["Assault Intercessor Squad (5)", "Sternguard Veterans (5)"],
  "Librarian": ["Intercessor Squad (5)", "Bladeguard Veterans (3)"],
  "Lieutenant": ["Intercessor Squad (5)", "Heavy Intercessor Squad (5)"],
  "Apothecary": ["Bladeguard Veterans (3)", "Sternguard Veterans (5)"],
  "Marneus Calgar": ["Victrix Honour Guard (3)", "Bladeguard Veterans (3)"],
  "Lysander": ["Terminator Squad (5)", "Assault Terminator Squad (5)"],
  "Tigurius": ["Intercessor Squad (5)", "Heavy Intercessor Squad (5)"],
  "Tor Garadon": ["Heavy Intercessor Squad (5)", "Eradicator Squad (3)"],
  "Vulkan He'stan": ["Aggressor Squad (3)", "Sternguard Veterans (5)"],
  "Adrax Agatone": ["Eradicator Squad (3)", "Aggressor Squad (3)"],
  "Kayvaan Shrike": ["Vanguard Veterans (5)", "Infiltrator Squad (5)"],
  "Pedro Kantor": ["Sternguard Veterans (5)", "Bladeguard Veterans (3)"],
  "Iron Father Feirros": ["Hellblaster Squad (5)", "Eradicator Squad (3)"],
  "Roboute Guilliman": ["Victrix Honour Guard (3)", "Bladeguard Veterans (3)"],

  // Black Templars
  "High Marshal Helbrecht": ["Crusader Squad (5)", "Sword Brethren (5)"],
  "Chaplain Grimaldus": ["Crusader Squad (5)", "Primaris Crusader Squad (10)"],
  "Marshal": ["Sword Brethren (5)", "Crusader Squad (5)"],
  "Emperor's Champion": ["Sword Brethren (5)", "Bladeguard Veterans (3)"],
  "Castellan": ["Primaris Crusader Squad (10)", "Crusader Squad (5)"],

  // Blood Angels
  "Commander Dante": ["Sanguinary Guard (5)", "Death Company Marines (5)"],
  "Mephiston": ["Death Company Intercessors (5)", "Bladeguard Veterans (3)"],
  "Astorath": ["Death Company Marines (5)", "Death Company Intercessors (5)"],
  "Lemartes": ["Death Company Marines (5)", "Sanguinary Guard (5)"],
  "The Sanguinor": ["Sanguinary Guard (5)", "Death Company Marines (5)"],
  "Sanguinary Priest": ["Bladeguard Veterans (3)", "Death Company Marines (5)"],
  "Death Company Captain": ["Death Company Marines (5)", "Death Company Intercessors (5)"],

  // Dark Angels
  "Lion El'Jonson": ["Bladeguard Veterans (3)", "Deathwing Knights (5)"],
  "Azrael": ["Bladeguard Veterans (3)", "Sternguard Veterans (5)"],
  "Belial": ["Deathwing Knights (5)", "Deathwing Terminators (5)"],
  "Sammael": ["Ravenwing Black Knights (3)", "Ravenwing Command Squad (3)"],
  "Asmodai": ["Death Company Marines (5)", "Bladeguard Veterans (3)"],
  "Ezekiel": ["Intercessor Squad (5)", "Bladeguard Veterans (3)"],
  "Lazarus": ["Bladeguard Veterans (3)", "Sternguard Veterans (5)"],

  // Space Wolves
  "Logan Grimnar": ["Wolf Guard Terminators (5)", "Grey Hunters (5)"],
  "Ragnar Blackmane": ["Blood Claws (10)", "Grey Hunters (5)"],
  "Njal Stormcaller": ["Grey Hunters (5)", "Wolf Guard Terminators (5)"],
  "Bjorn the Fell-Handed": ["Wolf Guard Terminators (5)", "Grey Hunters (5)"],
  "Ulrik the Slayer": ["Blood Claws (10)", "Grey Hunters (5)"],
  "Wolf Lord on Thunderwolf": ["Thunderwolf Cavalry (3)", "Fenrisian Wolves (5)"],
  "Wolf Priest": ["Blood Claws (10)", "Thunderwolf Cavalry (3)"],
  "Arjac Rockfist": ["Wolf Guard Terminators (5)"],
  "Murderfang": ["Thunderwolf Cavalry (3)"],

  // Deathwatch
  "Watch Master": ["Deathwatch Veterans (5)", "Decimus Kill Team (5)"],
  "Watch Captain Artemis": ["Deathwatch Veterans (5)"],
  "Watch Captain": ["Deathwatch Veterans (5)", "Decimus Kill Team (5)"],

  // Grey Knights
  "Grand Master Voldus": ["Terminator Squad (5)", "Paladin Squad (3)"],
  "Brother-Captain Stern": ["Terminator Squad (5)", "Paladin Squad (3)"],
  "Grand Master in Nemesis Dreadknight": ["Nemesis Dreadknight", "Strike Squad (5)"],
  "Brother-Captain": ["Strike Squad (5)", "Terminator Squad (5)"],
  "Brotherhood Champion": ["Strike Squad (5)", "Purifier Squad (5)"],

  // Sisters of Battle
  "Canoness": ["Battle Sisters Squad (10)", "Celestian Sacresants (5)"],
  "Canoness with Jump Pack": ["Seraphim Squad (5)", "Zephyrim Squad (5)"],
  "Palatine": ["Battle Sisters Squad (10)", "Celestian Sacresants (5)"],
  "Morvenn Vahl": ["Paragon Warsuits (3)", "Celestian Sacresants (5)"],
  "Saint Celestine": ["Seraphim Squad (5)", "Zephyrim Squad (5)"],
  "Junith Eruita": ["Battle Sisters Squad (10)", "Retributor Squad (5)"],
  "Triumph of Saint Katherine": ["Battle Sisters Squad (10)"],
  "Dialogus": ["Battle Sisters Squad (10)"],
  "Hospitaller": ["Celestian Sacresants (5)", "Paragon Warsuits (3)"],
  "Imagifier": ["Battle Sisters Squad (10)"],
  "Dogmata": ["Battle Sisters Squad (10)"],

  // Custodes
  "Trajann Valoris": ["Custodian Guard (4)", "Custodian Wardens (4)"],
  "Captain-General Aetius": ["Custodian Wardens (4)", "Allarus Terminators (3)"],
  "Shield-Captain": ["Custodian Guard (4)", "Custodian Wardens (4)"],
  "Shield-Captain on Dawneagle Jetbike": ["Vertus Praetors (3)", "Agamatus Custodians (3)"],
  "Shield-Captain in Allarus Terminator Armour": ["Allarus Terminators (3)"],
  "Blade Champion": ["Custodian Wardens (4)", "Sagittarum Custodians (4)"],
  "Knight---ennura": ["Prosecutors (4)", "Vigilators (4)"],
  "Valerian": ["Custodian Wardens (4)"],
  "Aleya": ["Vigilators (4)", "Witchseekers (4)"],

  // Astra Militarum
  "Lord Solar Leontus": ["Cadian Shock Troops (10)", "Cadian Command Squad"],
  "Cadian Castellan": ["Cadian Shock Troops (10)", "Cadian Command Squad"],
  "Lord Castellan Creed": ["Cadian Shock Troops (10)", "Kasrkin (10)"],
  "Tank Commander": ["Leman Russ Battle Tank", "Leman Russ Demolisher"],
  "Primaris Psyker": ["Cadian Shock Troops (10)"],
  "Commissar": ["Conscripts (20)", "Cadian Shock Troops (10)"],
  "Tempestor Prime": ["Tempestus Scions (10)", "Tempestus Command Squad"],
  "Ursula Creed": ["Cadian Shock Troops (10)", "Cadian Command Squad"],
  "Death Korps Marshal": ["Death Korps of Krieg (10)", "Krieg Command Squad"],

  // Adeptus Mechanicus
  "Belisarius Cawl": ["Kastelan Robots (4)", "Kataphron Destroyers (3)"],
  "Tech-Priest Dominus": ["Kataphron Destroyers (3)", "Kataphron Breachers (3)"],
  "Tech-Priest Manipulus": ["Skitarii Vanguard (10)", "Kataphron Breachers (3)"],
  "Tech-Priest Enginseer": ["Onager Dunecrawler", "Kastelan Robots (4)"],
  "Skitarii Marshal": ["Skitarii Vanguard (10)", "Skitarii Rangers (10)"],
  "Archmagos Terminus Thulia Ghuld": ["Kastelan Robots (4)", "Kataphron Destroyers (3)"],

  // CSM
  "Abaddon the Despoiler": ["Chaos Terminators (5)", "Chosen (5)"],
  "Chaos Lord": ["Chaos Space Marines (5)", "Chosen (5)"],
  "Chaos Lord in Terminator Armour": ["Chaos Terminators (5)"],
  "Master of Possession": ["Possessed (5)"],
  "Master of Executions": ["Chosen (5)", "Possessed (5)"],
  "Dark Apostle": ["Cultists Mob (10)", "Legionaries (5)"],
  "Sorcerer": ["Legionaries (5)", "Chaos Space Marines (5)"],
  "Sorcerer in Terminator Armour": ["Chaos Terminators (5)"],
  "Warpsmith": ["Helbrute", "Forgefiend"],
  "Haarken Worldclaimer": ["Raptors (5)", "Warp Talons (5)"],
  "Huron Blackheart": ["Chosen (5)", "Chaos Terminators (5)"],
  "Red Corsairs Reave-Captain": ["Chosen (5)", "Chaos Space Marines (5)"],
  "Fabius Bile": ["Chaos Space Marines (5)", "Legionaries (5)"],
  "Kravek Morne": ["Possessed (5)", "Chaos Terminators (5)"],
  "Vashtorr the Arkifane": ["Helbrute", "Forgefiend", "Defiler"],

  // Death Guard
  "Mortarion": ["Deathshroud Terminators (3)", "Blightlord Terminators (5)"],
  "Typhus": ["Plague Marines (5)", "Poxwalkers (10)"],
  "Lord of Contagion": ["Deathshroud Terminators (3)"],
  "Lord of Virulence": ["Plague Marines (5)", "Plagueburst Crawler"],
  "Plague Surgeon": ["Plague Marines (5)"],
  "Malignant Plaguecaster": ["Plague Marines (5)"],
  "Foul Blightspawn": ["Plague Marines (5)"],
  "Biologus Putrifier": ["Plague Marines (5)"],
  "Tallyman": ["Plague Marines (5)"],
  "Plague Champion": ["Plague Marines (5)"],
  "Daemon Prince of Nurgle": ["Plague Marines (5)", "Possessed (5)"],
  "Daemon Prince of Nurgle with Wings": ["Foetid Bloat-Drone"],

  // Thousand Sons
  "Magnus the Red": ["Scarab Occult Terminators (5)", "Rubric Marines (5)"],
  "Ahriman": ["Rubric Marines (5)", "Scarab Occult Terminators (5)"],
  "Exalted Sorcerer": ["Rubric Marines (5)"],
  "Exalted Sorcerer on Disc": ["Tzaangor Enlightened (3)"],
  "Infernal Master": ["Rubric Marines (5)"],
  "Daemon Prince of Tzeentch": ["Rubric Marines (5)", "Tzaangors (10)"],
  "Daemon Prince of Tzeentch with Wings": ["Screamers of Tzeentch (3)"],
  "Lord of Change": ["Flamers of Tzeentch (3)", "Screamers of Tzeentch (3)"],
  "Kairos Fateweaver": ["Flamers of Tzeentch (3)", "Screamers of Tzeentch (3)"],
  "Tzaangor Shaman": ["Tzaangors (10)", "Tzaangor Enlightened (3)"],

  // World Eaters
  "Angron": ["Khorne Berzerkers (10)", "Eightbound (3)"],
  "Khârn the Betrayer": ["Khorne Berzerkers (10)"],
  "Lord Invocatus": ["Bloodcrushers (3)", "Flesh Hounds (10)"],
  "Chaos Lord on Juggernaut": ["Khorne Berzerkers (10)", "Eightbound (3)"],
  "Daemon Prince of Khorne": ["Khorne Berzerkers (10)", "Possessed (5)"],
  "Daemon Prince of Khorne with Wings": ["Goremongers (5)"],

  // Emperor's Children
  "Lucius the Eternal": ["Flawless Blades (5)", "Noise Marines (5)"],
  "Fulgrim": ["Flawless Blades (5)", "Daemonettes (10)"],
  "Chaos Lord with Jump Pack": ["Hellstriders (5)"],
  "Lord Exultant": ["Flawless Blades (5)"],
  "Daemon Prince of Slaanesh": ["Flawless Blades (5)", "Possessed (5)"],
  "Keeper of Secrets": ["Daemonettes (10)", "Seekers of Slaanesh (5)"],
  "Lord Kakophonist": ["Noise Marines (5)"],

  // Chaos Daemons
  "Be'lakor": ["Bloodletters (10)", "Daemonettes (10)"],
  "Skarbrand": ["Bloodletters (10)", "Bloodcrushers (3)"],
  "Bloodthirster": ["Bloodletters (10)", "Flesh Hounds (10)"],
  "Great Unclean One": ["Plaguebearers (10)", "Plague Drones (3)"],
  "Lord of Change": ["Pink Horrors (10)", "Flamers of Tzeentch (3)"],
  "Bloodmaster": ["Bloodletters (10)"],
  "Herald of Khorne": ["Bloodletters (10)", "Bloodcrushers (3)"],
  "Poxbringer": ["Plaguebearers (10)"],
  "Changecaster": ["Pink Horrors (10)"],
  "The Masque of Slaanesh": ["Daemonettes (10)", "Seekers of Slaanesh (5)"],
  "Skulltaker": ["Bloodletters (10)"],

  // Aeldari
  "Asurmen": ["Dire Avengers (5)"],
  "Eldrad Ulthran": ["Guardian Defenders (10)", "Warlock"],
  "Avatar of Khaine": ["Guardian Defenders (10)", "Howling Banshees (5)"],
  "Farseer": ["Guardian Defenders (10)", "Warlock"],
  "Farseer Skyrunner": ["Windriders (3)", "Shining Spears (3)"],
  "Autarch": ["Howling Banshees (5)", "Striking Scorpions (5)"],
  "Autarch Wayleaper": ["Swooping Hawks (5)", "Warp Spiders (5)"],
  "Spiritseer": ["Wraithguard (5)", "Wraithblades (5)"],
  "Warlock": ["Guardian Defenders (10)", "Storm Guardians (10)"],
  "Maugan Ra": ["Dark Reapers (5)"],
  "Karandras": ["Striking Scorpions (5)"],
  "Jain Zar": ["Howling Banshees (5)"],
  "Fuegan": ["Fire Dragons (5)"],
  "Baharroth": ["Swooping Hawks (5)"],
  "Troupe Master": ["Troupe (5)", "Skyweavers (2)"],
  "Shadowseer": ["Troupe (5)", "Starweaver"],
  "Death Jester": ["Troupe (5)"],
  "Solitaire": ["Troupe (5)"],
  "The Yncarne": ["Wraithguard (5)", "Incubi (5)"],
  "Yvraine": ["Incubi (5)", "Wraithguard (5)"],
  "The Visarch": ["Incubi (5)"],

  // Drukhari
  "Asdrubael Vect": ["Kabalite Warriors (10)", "Incubi (5)"],
  "Drazhar": ["Incubi (5)"],
  "Lelith Hesperax": ["Wyches (10)"],
  "Lady Malys": ["Kabalite Warriors (10)", "Incubi (5)"],
  "Urien Rakarth": ["Wracks (5)", "Grotesques (3)"],
  "Archon": ["Kabalite Warriors (10)", "Incubi (5)"],
  "Succubus": ["Wyches (10)"],
  "Haemonculus": ["Wracks (5)", "Grotesques (3)"],
  "Court of the Archon": ["Kabalite Warriors (10)"],

  // Necrons
  "The Silent King": ["Triarch Praetorians (5)", "Lychguard (5)"],
  "Imotekh the Stormlord": ["Necron Warriors (10)", "Immortals (5)"],
  "Trazyn the Infinite": ["Lychguard (5)", "Necron Warriors (10)"],
  "Anrakyr the Traveller": ["Immortals (5)", "Lychguard (5)"],
  "Orikan the Diviner": ["Necron Warriors (10)"],
  "Illuminor Szeras": ["Necron Warriors (10)", "Immortals (5)"],
  "Vargard Obyron": ["Lychguard (5)"],
  "Nemesor Zahndrekh": ["Lychguard (5)", "Immortals (5)"],
  "Necron Overlord": ["Necron Warriors (10)", "Immortals (5)"],
  "Catacomb Command Barge": ["Lychguard (5)"],
  "Lord": ["Lychguard (5)", "Immortals (5)"],
  "Royal Warden": ["Immortals (5)"],
  "Plasmancer": ["Immortals (5)"],
  "Technomancer": ["Canoptek Wraiths (3)", "Lychguard (5)"],
  "Cryptek": ["Necron Warriors (10)"],
  "Psychomancer": ["Necron Warriors (10)"],
  "Chronomancer": ["Lychguard (5)"],
  "Skorpekh Lord": ["Skorpekh Destroyers (3)"],

  // Orks
  "Ghazghkull Thraka": ["Boyz (10)", "Choppa Boyz (20)", "Meganobz (5)"],
  "Makari": ["Boyz (10)"],
  "Boss Snikrot": ["Kommandos (10)"],
  "Beastboss": ["Beast Snagga Boyz (10)", "Squighog Boyz (3)"],
  "Beastboss on Squigosaur": ["Squighog Boyz (3)", "Beast Snagga Boyz (10)"],
  "Warboss": ["Boyz (10)", "Nobz (5)"],
  "Warboss in Mega Armour": ["Meganobz (5)"],
  "Warboss on Warbike": ["rbikers (3)"],
  "Big Mek": ["Lootas (5)", "Mek Gunz (3)"],
  "Big Mek with Shokk Attack Gun": ["Lootas (5)"],
  "Big Mek in Mega Armour": ["Meganobz (5)"],
  "Painboy": ["Nobz (5)", "Boyz (10)"],
  "Mek": ["Killa Kans (3)", "Deff Dread"],
  "Weirdboy": ["Boyz (10)"],
  "Wurrboy": ["Beast Snagga Boyz (10)"],
  "Zodgrod Wortsnagga": ["Gretchin (10)"],
  "Deffkilla Wartrike": ["Warbikers (3)"],
  "Wazdakka Gutsmek": ["Warbikers (3)", "Megatrakk Scrapjet", "Boomdakka Snazzwagon"],

  // Tyranids
  "Hive Tyrant": ["Tyrant Guard (3)", "Termagants (10)"],
  "Winged Hive Tyrant": ["Gargoyles (10)"],
  "Swarmlord": ["Tyrant Guard (3)", "Tyranid Warriors with Melee Bio-Weapons (3)"],
  "Old One Eye": ["Carnifex"],
  "Deathleaper": ["Lictor"],
  "Parasite of Mortrex": ["Gargoyles (10)"],
  "Tervigon": ["Termagants (10)"],
  "Norn Emissary": ["Tyranid Warriors with Melee Bio-Weapons (3)"],
  "Norn Assimilator": ["Haruspex", "Psychophage"],
  "Broodlord": ["Genestealers (5)"],
  "Neurotyrant": ["Zoanthropes (3)"],
  "Winged Tyranid Prime": ["Gargoyles (10)"],
  "Tyranid Prime with Lash Whip": ["Tyranid Warriors with Melee Bio-Weapons (3)"],

  // T'au
  "Commander Shadowsun": ["Stealth Battlesuits (3)", "Crisis Battlesuits (3)"],
  "Commander Farsight": ["Crisis Battlesuits (3)", "Crisis Sunforge Battlesuits (3)"],
  "Aun'shi": ["Strike Team (10)", "Breacher Team (10)"],
  "Aun'va": ["Strike Team (10)"],
  "Commander in Coldstar Battlesuit": ["Crisis Battlesuits (3)"],
  "Commander in Enforcer Battlesuit": ["Crisis Battlesuits (3)", "Broadside Battlesuits (3)"],
  "Commander in Crisis Battlesuit": ["Crisis Battlesuits (3)"],
  "Cadre Fireblade": ["Strike Team (10)", "Breacher Team (10)"],
  "Ethereal": ["Strike Team (10)"],
  "Darkstrider": ["Pathfinder Team (10)"],
  "Kroot Shaper": ["Kroot Carnivores (10)", "Kroot Hounds (10)"],
  "Kroot War Shaper": ["Kroot Carnivores (10)"],
  "Kroot Trail Shaper": ["Kroot Carnivores (10)", "Krootox Riders (3)"],
  "Kroot Lone-Spear": ["Krootox Rampagers (3)"],

  // Genestealer Cults
  "Magus": ["Neophyte Hybrids (10)", "Acolyte Hybrids (5)"],
  "Patriarch": ["Purestrain Genestealers (5)"],
  "Abominant": ["Aberrants (5)"],
  "Primus": ["Acolyte Hybrids (5)", "Hybrid Metamorphs (5)"],
  "Acolyte Iconward": ["Acolyte Hybrids (5)"],
  "Clamavus": ["Neophyte Hybrids (10)"],
  "Locus": ["Purestrain Genestealers (5)"],
  "Nexos": ["Neophyte Hybrids (10)"],
  "Reductus Saboteur": ["Neophyte Hybrids (10)"],
  "Sanctus": ["Acolyte Hybrids (5)"],
  "Kelermorph": ["Neophyte Hybrids (10)"],
  "Biophagus": ["Aberrants (5)"],
  "Jackal Alphus": ["Atalan Jackals (5)"],
  "Benefictus": ["Acolyte Hybrids (5)"],

  // Leagues of Votann
  "Ūthar the Destined": ["Hearthkyn Warriors (10)", "Einhyr Hearthguard (5)"],
  "Kâhl": ["Hearthkyn Warriors (10)", "Einhyr Hearthguard (5)"],
  "Brôkhyr Iron-master": ["Brôkhyr Thunderkyn (3)", "Brôkhyr Iron-Kin"],
  "Einhyr Champion": ["Einhyr Hearthguard (5)"],
  "Grimnyr": ["Hearthkyn Warriors (10)"],

  // Inquisition
  "Inquisitor Coteaz": ["Imperial Navy Breachers (10)", "Crusaders (5)"],
  "Inquisitor Karamazov": ["Crusaders (5)", "Death Cult Assassins (5)"],
  "Inquisitor Eisenhorn": ["Astra Telepathica Squad (5)"],
  "Inquisitor Greyfax": ["Crusaders (5)"],
  "Inquisitor Draxus": ["Death Cult Assassins (5)"],
  "Ordo Hereticus Inquisitor": ["Crusaders (5)"],
  "Ordo Malleus Inquisitor": ["Daemonhost (1)"],
  "Ordo Xenos Inquisitor": ["Death Cult Assassins (5)"],
  "Inquisitor in Terminator Armour": ["Crusaders (5)"],

  // Transports synergy with their typical passengers
  "Rhino": ["Tactical Squad (5)", "Intercessor Squad (5)", "Sternguard Veterans (5)"],
  "Impulsor": ["Bladeguard Veterans (3)", "Sternguard Veterans (5)"],
  "Razorback": ["Tactical Squad (5)"],
  "Drop Pod": ["Sternguard Veterans (5)", "Tactical Squad (5)"],
  "Chimera": ["Cadian Shock Troops (10)", "Krieg Combat Engineers (10)"],
  "Taurox": ["Tempestus Scions (10)"],
  "Taurox Prime": ["Tempestus Scions (10)"],
  "Wave Serpent": ["Dire Avengers (5)", "Howling Banshees (5)", "Fire Dragons (5)"],
  "Falcon": ["Striking Scorpions (5)", "Fire Dragons (5)"],
  "Raider": ["Kabalite Warriors (10)", "Wyches (10)", "Incubi (5)"],
  "Venom": ["Incubi (5)"],
  "Trukk": ["Boyz (10)", "Tankbustas (10)", "Kommandos (10)"],
  "Battlewagon": ["Choppa Boyz (20)", "Meganobz (5)", "Nobz (5)"],
  "Chaos Rhino": ["Chaos Space Marines (5)", "Plague Marines (5)", "Khorne Berzerkers (10)", "Noise Marines (5)"],
  "Devilfish": ["Strike Team (10)", "Breacher Team (10)"],
  "Goliath Truck": ["Acolyte Hybrids (5)", "Neophyte Hybrids (10)"],
  "Sagitaur": ["Hearthkyn Warriors (10)"],
  "Land Raider": ["Terminator Squad (5)", "Assault Terminator Squad (5)"],
  "Repulsor": ["Intercessor Squad (5)", "Heavy Intercessor Squad (5)"],
  "Storm Raven Gunship": ["Terminator Squad (5)", "Paladin Squad (3)"],
};

// COMBOS define curated "core packages" — sets of units that work well together.
// When a combo is selected, those units are auto-pinned and the generator fills around them.
const COMBOS = {
  "Space Marines": [
    {
      name: "Gladius Spearhead",
      description: "Captain leads Bladeguard, Hellblasters anchor the line",
      units: ["Captain", "Bladeguard Veterans (3)", "Intercessor Squad (5)", "Hellblaster Squad (5)", "Impulsor"],
    },
    {
      name: "Terminator Strike",
      description: "1st Company pure Terminator drop force",
      units: ["Captain in Terminator Armour", "Terminator Squad (5)", "Assault Terminator Squad (5)", "Land Raider"],
    },
    {
      name: "Armored Fist",
      description: "Tank-heavy Ironstorm centerpiece",
      units: ["Techmarine", "Redemptor Dreadnought", "Predator Annihilator", "Repulsor", "Eradicator Squad (3)"],
    },
    {
      name: "Vanguard Recon",
      description: "Phobos infiltrators, sniper support",
      units: ["Lieutenant in Phobos Armour" /* may not exist */, "Infiltrator Squad (5)", "Eliminator Squad (3)", "Incursor Squad (5)", "Suppressor Squad (3)"],
    },
    {
      name: "Tank Ace Headhunters",
      description: "Three Tank Aces ride out as Characters with their own Enhancements",
      units: ["Predator Annihilator", "Predator Annihilator", "Repulsor Executioner", "Hellblaster Squad (5)", "Eradicator Squad (3)"],
    },
    {
      name: "Land Raider Speartip",
      description: "Heavy Transport delivers Terminators into the heart of the foe",
      units: ["Captain in Terminator Armour", "Terminator Squad (5)", "Assault Terminator Squad (5)", "Land Raider", "Repulsor"],
    },
  ],
  "Black Templars": [
    {
      name: "Helbrecht's Crusade",
      description: "Helbrecht leads Sword Brethren and Crusaders into the fray",
      units: ["High Marshal Helbrecht", "Sword Brethren (5)", "Primaris Crusader Squad (10)", "Impulsor"],
    },
    {
      name: "Grimaldus Wall",
      description: "Grimaldus and infantry hold the line, Crusaders charge",
      units: ["Chaplain Grimaldus", "Crusader Squad (5)", "Crusader Squad (5)", "Emperor's Champion"],
    },
  ],
  "Blood Angels": [
    {
      name: "Dante's Host",
      description: "Sanguinary Guard descend with Dante",
      units: ["Commander Dante", "Sanguinary Guard (5)", "Death Company Marines (5)", "Sanguinary Priest"],
    },
    {
      name: "Black Rage",
      description: "Death Company spearhead with Lemartes",
      units: ["Lemartes", "Death Company Marines (5)", "Death Company Intercessors (5)", "Death Company Captain"],
    },
  ],
  "Dark Angels": [
    {
      name: "Inner Circle",
      description: "Belial leads Deathwing into close combat",
      units: ["Belial", "Deathwing Knights (5)", "Deathwing Terminators (5)", "Land Raider"],
    },
    {
      name: "Ravenwing Hunt",
      description: "Sammael leads Ravenwing across the board",
      units: ["Sammael", "Ravenwing Black Knights (3)", "RaveCommand Squad (3)", "Outrider Squad (3)"],
    },
    {
      name: "Lion's Wrath",
      description: "Azrael anchors a balanced Lion's Blade strike force",
      units: ["Azrael", "Bladeguard Veterans (3)", "Intercessor Squad (5)", "Deathwing Terminators (5)"],
    },
  ],
  "Space Wolves": [
    {
      name: "Great Wolf's Wrath",
      description: "Logan leads Wolf Guard Terminators into battle",
      units: ["Logan Grimnar", "Wolf Guard Terminators (5)", "Arjac Rockfist", "Land Raider"],
    },
    {
      name: "Thunderwolf Charge",
      description: "Wolf Lord on Thunderwolf with cavalry escort",
      units: ["Wolf Lord on Thunderwolf", "Thunderwolf Cavalry (3)", "Fenrisian Wolves (5)", "Murderfang"],
    },
  ],
  "Deathwatch": [
    {
      name: "Black Spear Kill Team",
      description: "Watch Master leads veteran kill teams against any threat",
      units: ["Watch Master", "Deathwatch Veterans (5)", "Deathwatch Veterans (5)", "Decimus Kill Team (5)"],
    },
  ],
  "Grey Knights": [
    {
      name: "Voldus's Strike",
      description: "Voldus teleports in with Terminators and a Dreadknight",
      units: ["Grand Master Voldus", "Terminator Squad (5)", "Paladin Squad (3)", "Nemesis Dreadknight"],
    },
    {
      name: "Strike Force",
      description: "Brother-Captain leads Strike Squads with Interceptor support",
      units: ["Brother-Captain", "Strike Squad (5)", "Strike Squad (5)", "Interceptor Squad (5)", "Purgation Squad (5)"],
    },
  ],
  "Adepta Sororitas": [
    {
      name: "Vahl's Triumph",
      description: "Morvenn Vahl leads Paragon Warsuits and Sacresants",
      units: ["Morvenn Vahl", "Paragon Warsuits (3)", "Celestian Sacresants (5)", "Battle Sisters Squad (10)"],
    },
    {
      name: "Celestine's Host",
      description: "Saint Celestine flies with the Seraphim and Zephyrim",
      units: ["Saint Celestine", "Seraphim Squad (5)", "Zephyrim Squad (5)", "Battle Sisters Squad (10)"],
    },
    {
      name: "Junith's Pyre",
      description: "Junith Eruita with flame and melta firepower",
      units: ["Junith Eruita", "Battle Sisters Squad (10)", "Retributor Squad (5)", "Immolator"],
    },
  ],
  "Adeptus Custodes": [
    {
      name: "Trajann's Vigil",
      description: "Trajann leads Custodian Guard with Allarus support",
      units: ["Trajann Valoris", "Custodian Guard (4)", "Custodian Wardens (4)", "Allarus Terminators (3)"],
    },
    {
      name: "Dawneagle Charge",
      description: "Jetbike Captain leads Vertus Praetors across the board",
      units: ["Shield-Captain on Dawneagle Jetbike", "Vertus Praetors (3)", "Agamatus Custodians (3)", "Venatari Custodians (3)"],
    },
  ],
  "Astra Militarum": [
    {
      name: "Cadian Combined Arms",
      description: "Castellan leads infantry, Tank Commander brings the armor",
      units: ["Cadian Castellan", "Cadian Shock Troops (10)", "Cadian Shock Troops (10)", "Tank Commander", "Leman Russ Battle Tank"],
    },
    {
      name: "Krieg Trench Force",
      description: "Korps regiment with engineers and basilisks",
      units: ["Death Korps Marshal", "Death Korps of Krieg (10)", "Death Korps of Krieg (10)", "Krieg Combat Engineers (10)", "Basilisk"],
    },
    {
      name: "Tempestus Strike",
      description: "Scions deep-strike with Tempestor Prime",
      units: ["Tempestor Prime", "Tempestus Scions (10)", "Tempestus Scions (10)", "Tempestus Command Squad", "Taurox Prime"],
    },
    {
      name: "Armoured Fist",
      description: "Tank-heavy column with Lord Solar leading",
      units: ["Lord Solar Leontus", "Leman Russ Battle Tank", "Leman Russ Demolisher", "Rogal Dorn Battle Tank", "Hellhound"],
    },
    {
      name: "Mechanised Infantry",
      description: "Cadians ride to the front in transports for the Armageddon style of warfare",
      units: ["Cadian Castellan", "Cadian Shock Troops (10)", "Cadian Shock Troops (10)", "Chimera", "Chimera"],
    },
    {
      name: "Tank Squadron",
      description: "Tank Commander coordinates a squadron of Leman Russes via the new Squadron Command",
      units: ["Tank Commander", "Leman Russ Battle Tank", "Leman Russ Battle Tank", "Leman Russ Demolisher", "Cadian Command Squad"],
    },
  ],
  "Adeptus Mechanicus": [
    {
      name: "Cawl's Cohort",
      description: "Cawl with Kastelan Robots and Kataphrons",
      units: ["Belisarius Cawl", "Kastelan Robots (4)", "Kataphron Destroyers (3)", "Skitarii Vanguard (10)"],
    },
    {
      name: "Skitarii Recon",
      description: "Marshal-led Skitarii with Ironstrider support",
      units: ["Skitarii Marshal", "Skitarii Vanguard (10)", "Skitarii Rangers (10)", "Ironstrider Ballistarii (3)", "Sicarian Infiltrators (5)"],
    },
  ],
  "Imperial Knights": [
    {
      name: "Noble Lance",
      description: "Crusader, Errant, and Armiger pack",
      units: ["Knight Crusader", "Knight Errant", "Armiger Helverin", "Armiger Warglaive"],
    },
    {
      name: "Dominus Spearhead",
      description: "Castellan leads heavy Knights",
      units: ["Knight Castellan", "Knight Paladin", "Armiger Warglaive", "Armiger Warglaive"],
    },
  ],
  "Agents of the Imperium": [
    {
      name: "Inquisitorial Strike",
      description: "Inquisitor with assassin support and battle sisters",
      units: ["Inquisitor Coteaz", "Imperial Navy Breachers (10)", "Vindicare Assassin", "Crusaders (5)"],
    },
  ],
  "Chaos Space Marines": [
    {
      name: "Black Legion Strike",
      description: "Abaddon leads Terminators and Chosen",
      units: ["Abaddon the Despoiler", "Chaos Terminators (5)", "Chosen (5)", "Helbrute"],
    },
    {
      name: "Daemon Engine Coven",
      description: "Warpsmith with daemon engines",
      units: ["Warpsmith", "Forgefiend", "Maulerfiend", "Helbrute", "Defiler"],
    },
    {
      name: "Cult Horde",
      description: "Dark Apostle with cultist masses",
      units: ["Dark Apostle", "Cultists Mob (10)", "Cultists Mob (10)", "Legionaries (5)", "Possessed (5)"],
    },
  ],
  "Death Guard": [
    {
      name: "Mortarion's Plague",
      description: "Mortarion with Deathshroud and Plague Marines",
      units: ["Mortarion", "Deathshroud Terminators (3)", "Plague Marines (5)", "Plague Marines (5)"],
    },
    {
      name: "Typhus Tide",
      description: "Typhus with Poxwalker swarm and Plague Marines",
      units: ["Typhus", "Poxwalkers (10)", "Poxwalkers (10)", "Plague Marines (5)", "Foul Blightspawn"],
    },
    {
      name: "Plague Tank Brigade",
      description: "Lord of Virulence with Plagueburst Crawlers",
      units: ["Lord of Virulence", "Plagueburst Crawler", "Plagueburst Crawler", "Foetid Bloat-Drone", "Plague Marines (5)"],
    },
  ],
  "Thousand Sons": [
    {
      name: "Magnus Triumphant",
      description: "Magnus leads Scarab Occult and Rubrics",
      units: ["Magnus the Red", "Scarab Occult Terminators (5)", "Rubric Marines (5)", "Rubric Marines (5)"],
    },
    {
      name: "Ahriman's Cabal",
      description: "Ahriman with Rubric Marines and daemonic support",
      units: ["Ahriman", "Rubric Marines (5)", "Rubric Marines (5)", "Tzaangors (10)", "Mutalith Vortex Beast"],
    },
  ],
  "World Eaters": [
    {
      name: "Angron's Wrath",
      description: "Angron leads Eightbound and Berzerkers",
      units: ["Angron", "Eightbound (3)", "Khorne Berzerkers (10)", "Khorne Berzerkers (10)"],
    },
    {
      name: "Khârn's Slaughter",
      description: "Khârn anchors a Berzerker swarm",
      units: ["Khârn the Betrayer", "Khorne Berzerkers (10)", "Khorne Berzerkers (10)", "Jakhals (10)", "Master of Executions"],
    },
    {
      name: "Goretrack Cavalry",
      description: "Lord Invocatus charges with bloodbeasts",
      units: ["Lord Invocatus", "Bloodcrushers (3)", "Flesh Hounds (10)", "Chaos Lord on Juggernaut"],
    },
  ],
  "Emperor's Children": [
    {
      name: "Lucius's Duelists",
      description: "Lucius leads the Flawless Blades",
      units: ["Lucius the Eternal", "Flawless Blades (5)", "Flawless Blades (5)", "Noise Marines (5)"],
    },
    {
      name: "Sonic Onslaught",
      description: "Lord Kakophonist leads Noise Marines",
      units: ["Lord Kakophonist", "Noise Marines (5)", "Noise Marines (5)", "Tormentors (5)"],
    },
  ],
  "Chaos Daemons": [
    {
      name: "Be'lakor's Court",
      description: "Be'lakor brings daemons of all four powers",
      units: ["Be'lakor", "Bloodletters (10)", "Daemonettes (10)", "Pink Horrors (10)", "Plaguebearers (10)"],
    },
    {
      name: "Khornate Slaughter",
      description: "Skarbrand leads Bloodletters and Bloodcrushers",
      units: ["Skarbrand", "Bloodletters (10)", "Bloodletters (10)", "Bloodcrushers (3)", "Flesh Hounds (10)"],
    },
    {
      name: "Plaguebearer Tide",
      description: "Great Unclean One with Nurgle daemons",
      units: ["Great Unclean One", "Plaguebearers (10)", "Plaguebearers (10)", "Nurglings (3)", "Plague Drones (3)"],
    },
  ],
  "Chaos Knights": [
    {
      name: "Iconoclast Fiefdom",
      description: "Despoiler and Rampager with War Dog pack",
      units: ["Knight Despoiler", "Knight Rampager", "War Dog Karnivore", "War Dog Karnivore", "War Dog Brigand"],
    },
    {
      name: "Tyrant's Court",
      description: "Knight Tyrant centerpiece with War Dog escort",
      units: ["Knight Tyrant", "War Dog Brigand", "War Dog Brigand", "War Dog Stalker"],
    },
  ],
  "Aeldari": [
    {
      name: "Avatar's Host",
      description: "Avatar of Khaine leads Aspect Warriors",
      units: ["Avatar of Khaine", "Howling Banshees (5)", "Striking Scorpions (5)", "Fire Dragons (5)"],
    },
    {
      name: "Wraith Conclave",
      description: "Spiritseer leads ghost warriors",
      units: ["Spiritseer", "Wraithguard (5)", "Wraithblades (5)", "Wraithlord", "Wave Serpent"],
    },
    {
      name: "Windrider Host",
      description: "Farseer Skyrunner leads jetbikes",
      units: ["Farseer Skyrunner", "Windriders (3)", "Windriders (3)", "Shining Spears (3)", "Vyper Squadron (1)"],
    },
    {
      name: "Harlequin Troupe",
      description: "Solitaire and Troupe Master with their dancers",
      units: ["Troupe Master", "Solitaire", "Troupe (5)", "Skyweavers (2)", "Starweaver"],
    },
  ],
  "Drukhari": [
    {
      name: "Realspace Raid",
      description: "Archon, Succubus and Haemonculus with their cohorts",
      units: ["Archon", "Kabalite Warriors (10)", "Wyches (10)", "Wracks (5)", "Raider"],
    },
    {
      name: "Incubi Strike",
      description: "Drazhar leads Incubi from the shadows",
      units: ["Drazhar", "Incubi (5)", "Incubi (5)", "Mandrakes (5)", "Venom"],
    },
    {
      name: "Coven of Pain",
      description: "Urien Rakarth with Wracks and Grotesques",
      units: ["Urien Rakarth", "Wracks (5)", "Grotesques (3)", "Talos (1)", "Cronos (1)"],
    },
  ],
  "Necrons": [
    {
      name: "Awakened Dynasty",
      description: "Imotekh leads Warriors and Lychguard",
      units: ["Imotekh the Stormlord", "Necron Warriors (10)", "Lychguard (5)", "Triarch Praetorians (5)"],
    },
    {
      name: "Canoptekkourt",
      description: "Technomancer leads Wraiths and Doomstalkers",
      units: ["Technomancer", "Canoptek Wraiths (3)", "Canoptek Wraiths (3)", "Canoptek Doomstalker", "Canoptek Spyder"],
    },
    {
      name: "Silent King's Host",
      description: "The Silent King with Triarch and elite escort",
      units: ["The Silent King", "Triarch Praetorians (5)", "Lychguard (5)", "Necron Warriors (10)"],
    },
    {
      name: "Hypercrypt Strike",
      description: "Phasing Monolith with teleporting Warriors",
      units: ["Necron Overlord", "Monolith", "Necron Warriors (10)", "Lychguard (5)"],
    },
  ],
  "Orks": [
    {
      name: "Ghazghkull's WAAAGH!",
      description: "Big boss with Meganobz and Boyz",
      units: ["Ghazghkull Thraka", "Makari", "Meganobz (5)", "Choppa Boyz (20)"],
    },
    {
      name: "Speed Freeks",
      description: "Wartrike leads bikes and buggies",
      units: ["Deffkilla Wartrike", "Warbikers (3)", "Megatrakk Scrapjet", "Boomdakka Snazzwagon"],
    },
    {
      name: "Dread Mob",
      description: "Big Mek with walkers and Killa Kans",
      units: ["Big Mek", "Deff Dread", "Killa Kans (3)", "Morkanaut", "Lootas (5)"],
    },
    {
      name: "Beast Hunt",
      description: "Beastboss with Squighog cavalry",
      units: ["Beastboss on Squigosaur", "Squighog Boyz (3)", "Beast Snagga Boyz (10)", "Wurrboy"],
    },
    {
      name: "Wazdakka's Speedwaaagh!",
      description: "Wazdakka leads bikes, buggies, and trikes in a roaring straight-line charge",
      units: ["Wazdakka Gutsmek", "Warbikers (3)", "Warbikers (3)", "Megatrakk Scrapjet", "Boomdakka Snazzwagon"],
    },
  ],
  "Tyranids": [
    {
      name: "Hive Tyrant Brood",
      description: "Hive Tyrant with Tyrant Guard and gaunts",
      units: ["Hive Tyrant", "Tyrant Guard (3)", "Termagants (10)", "Hormagaunts (10)"],
    },
    {
      name: "Crusher Stampede",
      description: "Old One Eye leads Carnifexes",
      units: ["Old One Eye", "Carnifex", "Carnifex", "Screamer-Killer", "Tyrannofex"],
    },
    {
      name: "Vanguard Onslaught",
      description: "Deathleaper with Lictors and Genestealers",
      units: ["Deathleaper", "Lictor", "Genestealers (5)", "Genestealers (5)", "Raveners (3)"],
    },
    {
      name: "Synaptic Nexus",
      description: "Neurotyrant with Zoanthropes and synapse beasts",
      units: ["Neurotyrant", "Zoanthropes (3)", "Maleceptor", "Tyranid Warriors with Melee Bio-Weapons (3)"],
    },
  ],
  "T'au Empire": [
    {
      name: "Shadowsun's Strike",
      description: "Shadowsun leads Stealth and Crisis suits",
      units: ["Commander Shadowsun", "Stealth Battlesuits (3)", "Crisis Battlesuits (3)", "Crisis Sunforge Battlesuits (3)"],
    },
    {
      name: "Farsight Enclave",
      description: "Farsight with Crisis suit bombers",
      units: ["Commander Farsight", "Crisis Battlesuits (3)", "Crisis Battlesuits (3)", "Riptide Battlesuit"],
    },
    {
      name: "Hammerhead Cohort",
      description: "Heavy armor with Broadside and Hammerhead support",
      units: ["Commander in Enforcer Battlesuit", "Hammerhead Gunship", "Hammerhead Gunship", "Broadside Battlesuits (3)", "Strike Team (10)"],
    },
    {
      name: "Kroot Hunting Pack",
      description: "Kroot Shaper leads carnivorous packs",
      units: ["Kroot Shaper", "Kroot Carnivores (10)", "Kroot Carnivores (10)", "Krootox Rampagers (3)", "Kroot Hounds (10)"],
    },
  ],
  "Genestealer Cults": [
    {
      name: "Brood Cycle",
      description: "Magus leads the cult uprising",
      units: ["Magus", "Neophyte Hybrids (10)", "Acolyte Hybrids (5)", "Hybrid Metamorphs (5)"],
    },
    {
      name: "Patriarch's Coven",
      description: "Patriarch with Purestrains and Aberrants",
      units: ["Patriarch", "Purestrain Genestealers (5)", "Aberrants (5)", "Abominant"],
    },
    {
      name: "Outlander Claw",
      description: "Jackal Alphus leads bikes and ridgerunners",
      units: ["Jackal Alphus", "Atalan Jackals (5)", "Achilles Ridgerunners (3)", "Achilles Ridgerunners (3)"],
    },
  ],
  "Leagues of Votann": [
    {
      name: "Oathband Strike",
      description: "Kâhl leads Hearthkyn and Hearthguard",
      units: ["Kâhl", "Hearthkyn Warriors (10)", "Hearthkyn Warriors (10)", "Einhyr Hearthguard (5)"],
    },
    {
      name: "Hekaton Brigade",
      description: "Iron-master with heavy armored support",
      units: ["Brôkhyr Iron-master", "Hekaton Land Fortress", "Sagitaur (1)", "Brôkhyr Thunderkyn (3)"],
    },
    {
      name: "Berserk Charge",
      description: "Champion leads Cthonian Berserks and Pioneers",
      units: ["Einhyr Champion", "Cthonian Berserks (5)", "Hernkyn Pioneers (3)", "Hernkyn Yaegirs (10)"],
    },
  ],
};

// ============================================================
// DOCTRINE PRESETS & ROLE LABELS
// ============================================================

const ARMY_TYPES = {
  balanced: {
    label: "Balanced",
    description: "Mixed force with reliable presence in every role",
    weights: { hq: 1, troops: 2.5, elites: 1.5, fast: 1, heavy: 1.2, transport: 0.8 },
  },
  infantry: {
    label: "Infantry Heavy",
    description: "Boots on the ground, swarming the field",
    weights: { hq: 1, troops: 4, elites: 1.5, fast: 0.5, heavy: 0.4, transport: 0.6 },
  },
  mechanized: {
    label: "Mechanized",
    description: "Tanks, transports, and armored fury",
    weights: { hq: 1, troops: 1, elites: 0.5, fast: 0.5, heavy: 2.5, transport: 2.5 },
  },
  elite: {
    label: "Elite Strike Force",
    description: "Few but deadly — veteran units only",
    weights: { hq: 1, troops: 0.8, elites: 3, fast: 1, heavy: 0.8, transport: 0.5 },
  },
  fast: {
    label: "Fast Attack",
    description: "Hit and run, speed over staying power",
    weights: { hq: 1, troops: 1, elites: 0.8, fast: 3.5, heavy: 0.5, transport: 1.2 },
  },
  artillery: {
    label: "Artillery / Heavy",
    description: "Long-range firepower and big guns",
    weights: { hq: 1, troops: 1, elites: 0.5, fast: 0.4, heavy: 4, transport: 0.4 },
  },
};

const ROLE_LABELS = {
  hq: "HQ",
  troops: "Troops",
  elites: "Elites",
  fast: "Fast Attack",
  heavy: "Heavy Support",
  transport: "Transport",
};

// Faction grouping for the picker UI: lets us group factions by allegiance
// instead of showing one long alphabetical list. Useful since players usually
// know "I want a Chaos army" before they've picked the specific Chaos faction.
const FACTION_GROUPS = {
  "IMPERIUM": [
    "Space Marines", "Blood Angels", "Dark Angels", "Black Templars", "Space Wolves",
    "Deathwatch", "Grey Knights", "Adeptus Custodes", "Adepta Sororitas",
    "Adeptus Mechanicus", "Astra Militarum", "Imperial Knights", "Imperial Agents",
  ],
  "CHAOS": [
    "Chaos Space Marines", "Death Guard", "Thousand Sons", "World Eaters",
    "Emperor's Children", "Chaos Knights", "Chaos Daemons",
  ],
  "XENOS": [
    "Aeldari", "Drukhari", "Necrons", "Tyranids", "Genestealer Cults",
    "Leagues of Votann", "T'au Empire", "Orks",
  ],
};

// ============================================================
// HELPERS
// ============================================================

function mergeUnitPools(base, extra) {
  const merged = {};
  for (const role of Object.keys(base)) {
    merged[role] = [...base[role]];
    if (extra && extra[role]) merged[role] = [...merged[role], ...extra[role]];
  }
  return merged;
}

function pickWeightedRole(weights, available) {
  const filtered = Object.entries(weights).filter(([role]) => available.includes(role));
  if (filtered.length === 0) return null;
  const total = filtered.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [role, w] of filtered) {
    r -= w;
    if (r <= 0) return role;
  }
  return filtered[0][0];
}

function pickUnit(units, maxPoints) {
  const affordable = units.filter((u) => u.points <= maxPoints);
  if (affordable.length === 0) return null;
  return affordable[Math.floor(Math.random() * affordable.length)];
}

// =====================================================================
// PERSISTENT STORAGE ADAPTER
// =====================================================================
// Saved armies need to survive a page reload. There are three environments
// this app runs in:
//   1. The Claude artifact host — provides a `window.storage` API with
//      list/get/set/delete that persists across sessions.
//   2. A browser (e.g. GitHub Pages, local Vite dev server) — has
//      `localStorage` but no `window.storage`. Saved armies must persist
//      across reloads in localStorage too, otherwise the user loses
//      everything on refresh.
//   3. SSR / no-window environment — neither is available; in-memory only.
//
// This adapter prefers window.storage when present, falls back to
// localStorage with a `armyforge:` key prefix, and is a no-op otherwise.
// All methods return promises with the same shape as window.storage so the
// caller doesn't need to know which backend is in use.
const STORAGE_PREFIX = "armyforge:";
const armyStorage = (() => {
  if (typeof window === "undefined") {
    return { available: false, kind: "none",
      async list() { return { keys: [] }; },
      async get() { return null; },
      async set() { return null; },
      async delete() { return null; },
    };
  }
  if (window.storage && typeof window.storage.list === "function") {
    return {
      available: true, kind: "claude",
      list: (prefix) => window.storage.list(prefix),
      get: (key) => window.storage.get(key),
      set: (key, value) => window.storage.set(key, value),
      delete: (key) => window.storage.delete(key),
    };
  }
  // localStorage fallback — keys are prefixed so we don't collide with
  // anything else the host page might be storing.
  if (typeof window.localStorage !== "undefined") {
    try {
      // sanity test — some browsers throw on localStorage access (private mode, etc.)
      const testKey = STORAGE_PREFIX + "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
    } catch (e) {
      return { available: false, kind: "none",
        async list() { return { keys: [] }; },
        async get() { return null; },
        async set() { return null; },
        async delete() { return null; },
      };
    }
    return {
      available: true, kind: "localStorage",
      async list(prefix) {
        // Return all localStorage keys that start with our prefix + the requested prefix
        const fullPrefix = STORAGE_PREFIX + (prefix || "");
        const keys = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(fullPrefix)) {
            // strip our internal prefix so callers see the same keys they wrote
            keys.push(k.slice(STORAGE_PREFIX.length));
          }
        }
        return { keys };
      },
      async get(key) {
        const v = window.localStorage.getItem(STORAGE_PREFIX + key);
        if (v == null) return null;
        return { key, value: v };
      },
      async set(key, value) {
        window.localStorage.setItem(STORAGE_PREFIX + key, value);
        return { key, value };
      },
      async delete(key) {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
        return { key, deleted: true };
      },
    };
  }
  return { available: false, kind: "none",
    async list() { return { keys: [] }; },
    async get() { return null; },
    async set() { return null; },
    async delete() { return null; },
  };
})();

function generateArmy({
                        faction,
                        subFaction,
                        points,
                        armyType,
                        requiredRoles,
                        detachment,
                        selectedEnhancements,
                        enhancementsEnabled,
                        pinnedUnits,
                        comboName,
                        pointOverrides,
                      }) {
  const factionData = FACTIONS[faction];
  const subData = factionData.subFactions[subFaction];
  let unitPool = mergeUnitPools(subData.units, subData.extra);
  // Apply point overrides to the unit pool if provided
  if (pointOverrides) {
    const out = {};
    for (const role of Object.keys(unitPool)) {
      out[role] = unitPool[role].map((u) => {
        const key = `${faction}|${u.name}`;
        const o = pointOverrides[key];
        if (o && typeof o.points === "number") return { ...u, points: o.points };
        return u;
      });
    }
    unitPool = out;
  }
  const weights = { ...ARMY_TYPES[armyType].weights };
  const army = [];
  let spent = 0;

  // Build a flat lookup of all units in this faction's pool, with their role
  const unitLookup = {};
  for (const role of Object.keys(unitPool)) {
    for (const unit of unitPool[role]) {
      if (!unitLookup[unit.name]) {
        unitLookup[unit.name] = { ...unit, role };
      }
    }
  }

  // Calculate enhancement spend
  let enhancementSpend = 0;
  if (enhancementsEnabled && selectedEnhancements && selectedEnhancements.length) {
    const detData = factionData.detachments[detachment];
    if (detData) {
      for (const enhName of selectedEnhancements) {
        const enh = detData.enhancements.find((e) => e.name === enhName);
        if (enh) enhancementSpend += enh.points;
      }
    }
  }
  const unitBudget = points - enhancementSpend;

  // Build the list of units to pin: combo + manual pins, deduplicated by name+count
  const pinnedNames = [];
  if (comboName && COMBOS[faction]) {
    const combo = COMBOS[faction].find((c) => c.name === comboName);
    if (combo) pinnedNames.push(...combo.units);
  }
  if (pinnedUnits && pinnedUnits.length) {
    pinnedNames.push(...pinnedUnits);
  }

  // Add pinned units to army (respecting max count and budget)
  for (const name of pinnedNames) {
    const unitDef = unitLookup[name];
    if (!unitDef) continue;
    const existingCount = army.filter((u) => u.name === name).length;
    if (existingCount >= unitDef.max) continue;
    if (spent + unitDef.points > unitBudget) continue;
    army.push({
      ...unitDef,
      id: Math.random(),
      pinned: true,
    });
    spent += unitDef.points;
  }

  // Make sure we have an HQ if pinned units don't include one
  if (!army.some((u) => u.role === "hq") && unitPool.hq && unitPool.hq.length) {
    const affordable = unitPool.hq.filter((u) => u.points <= unitBudget - spent);
    if (affordable.length) {
      const hq = affordable[Math.floor(Math.random() * affordable.length)];
      army.push({ ...hq, role: "hq", id: Math.random() });
      spent += hq.points;
    }
  }

  // Cover required roles
  for (const role of requiredRoles) {
    if (role === "hq") continue;
    if (army.some((u) => u.role === role)) continue;
    const pool = unitPool[role];
    if (!pool || !pool.length) continue;
    const unit = pickUnit(pool, unitBudget - spent);
    if (unit) {
      army.push({ ...unit, role, id: Math.random() });
      spent += unit.points;
    }
  }

  // Fill the rest of the army weighted by army type
  const allRoles = Object.keys(unitPool).filter((r) => unitPool[r].length > 0);
  let attempts = 0;
  const maxAttempts = 300;

  while (spent < unitBudget * 0.9 && attempts < maxAttempts) {
    attempts++;
    const remaining = unitBudget - spent;
    const affordableRoles = allRoles.filter((role) =>
        unitPool[role].some((u) => u.points <= remaining)
    );
    if (affordableRoles.length === 0) break;

    const role = pickWeightedRole(weights, affordableRoles);
    if (!role) break;

    const unit = pickUnit(unitPool[role], remaining);
    if (!unit) continue;

    const existingCount = army.filter((u) => u.name === unit.name).length;
    if (existingCount >= unit.max) continue;

    army.push({ ...unit, role, id: Math.random() });
    spent += unit.points;
  }

  return {
    units: army,
    spent,
    enhancementSpend,
    faction,
    subFaction,
    factionData,
    detachment,
    selectedEnhancements: enhancementsEnabled ? [...selectedEnhancements] : [],
    points,
    armyType,
    comboName: comboName || null,
    pinnedUnits: pinnedUnits ? [...pinnedUnits] : [],
  };
}



// ============================================================
// BATTLE SIMULATOR ENGINE
// ============================================================

const FORMATS = {
  "Combat Patrol": { points: 500, width: 30, height: 22, turns: 5, description: "Quick skirmish on a small board", cpStart: 0, deployZoneDepth: 6 },
  Incursion: { points: 1000, width: 44, height: 30, turns: 5, description: "Mid-size engagement", cpStart: 0, deployZoneDepth: 9 },
  "Strike Force": { points: 2000, width: 60, height: 44, turns: 5, description: "Standard tournament size", cpStart: 0, deployZoneDepth: 12 },
  Onslaught: { points: 3000, width: 72, height: 50, turns: 5, description: "Massive armored conflict", cpStart: 0, deployZoneDepth: 14 },
};

const TERRAIN_TYPES = [
  { name: "Ruins",    color: "#3a2a1a", border: "#5a4030", coverBonus: 1, blocksLOS: true,  description: "Ruined building — gives infantry +1 to save and blocks line of sight" },
  { name: "Crater",   color: "#2a1f15", border: "#4a3525", coverBonus: 1, blocksLOS: false, description: "Shell crater — provides cover but doesn't block sight lines" },
  { name: "Hill",     color: "#3d3220", border: "#5a4830", coverBonus: 0, blocksLOS: false, description: "Rolling rise — high ground for shooters, no cover save" },
  { name: "Forest",   color: "#1f3520", border: "#2a4a30", coverBonus: 1, blocksLOS: true,  description: "Dense woods — cover and blocks LoS for both sides" },
  { name: "Wreckage", color: "#3a2818", border: "#5a3a25", coverBonus: 1, blocksLOS: true,  description: "Battlefield wreckage — twisted metal grants cover and blocks sight" },
];

// Mission objectives: a primary mission (scored every turn) plus 2 secondary objectives per side.
// Drawn from the actual GW Pariah Nexus / Leviathan secondary deck.
const PRIMARY_MISSIONS = [
  { name: "Take and Hold",     desc: "Hold objectives in your half of the board (5 VP per held, max 15/turn)" },
  { name: "Tipping Point",     desc: "Hold the most central objectives (5 VP per held mid, max 15/turn)" },
  { name: "Scorched Earth",    desc: "Hold + raze enemy objectives (5 VP for held, +5 if razed, max 20/turn)" },
];

const SECONDARIES = [
  { name: "Engage on All Fronts",  desc: "Have units in 3+ table quarters at end of turn (3VP)", type: "fixed" },
  { name: "Bring It Down",          desc: "Score 2VP for each enemy MONSTER or VEHICLE destroyed", type: "fixed" },
  { name: "Assassinate",            desc: "Score 3VP for each enemy CHARACTER destroyed", type: "fixed" },
  { name: "Behind Enemy Lines",    desc: "Have a unit in enemy deployment zone (4VP/turn)", type: "tactical" },
  { name: "No Prisoners",           desc: "Destroy 1+ enemy unit this turn (2VP) / 2+ (4VP)", type: "tactical" },
  { name: "Cleanse",                desc: "Take action on objective in your half (3VP/turn)", type: "tactical" },
  { name: "Containment",            desc: "Have a unit within 6\" of an enemy edge (3VP/turn)", type: "tactical" },
  { name: "Extend Battle Lines",   desc: "Hold objectives in 2+ table quarters (4VP/turn)", type: "tactical" },
  { name: "Storm Hostile Objective", desc: "Hold an enemy-half objective at end of turn (5VP)", type: "tactical" },
  { name: "Marked for Death",       desc: "Destroy a chosen enemy unit (3VP per kill)", type: "fixed" },
];

// CP-spending stratagems the AI can use.  Each has a trigger (when it fires) and an effect.
const STRATAGEMS = [
  { name: "Re-roll",              cost: 1, effect: "Re-roll a single failed hit/wound roll — used by AI on key shots" },
  { name: "Smokescreen",          cost: 1, effect: "Target unit gains -1 to be hit until next turn — used defensively when key unit is targeted" },
  { name: "Counter-offensive",    cost: 2, effect: "After enemy fights, your unit fights immediately — used when threat is engaged" },
  { name: "Armour of Contempt",   cost: 1, effect: "Worsen enemy AP by 1 vs your unit — used when shielding key elites" },
  { name: "Tank Shock",           cost: 1, effect: "Vehicle ramming — D6 mortal wounds when charging vs infantry" },
  { name: "Heroic Intervention",  cost: 1, effect: "HQ moves 3\" to engage enemy that just charged — defensive trigger" },
  { name: "Overwatch",            cost: 1, effect: "Unit fires at half BS at charging enemies — pre-charge response" },
  { name: "Rapid Ingress",        cost: 1, effect: "Reserve unit arrives early at end of opponent's turn" },
  { name: "Fire Discipline",      cost: 1, effect: "Re-roll all 1s to hit for one shooting unit this phase" },
  { name: "Inspiring Leader",     cost: 1, effect: "Battle-shocked unit auto-recovers" },
];

// Detachment army rules — abstracted so we can apply faction flavor to combat
// without per-faction rules engines. Most just give a stat boost in certain phases.
const DETACHMENT_RULES = {
  // Imperium
  "Space Marines":       { name: "Oath of Moment",         desc: "+1 to wound vs the Oath target. Chosen in Command phase." },
  "Adeptus Custodes":    { name: "Aegis of the Emperor",   desc: "5+ FNP vs mortal wounds. Always in effect." },
  "Adepta Sororitas":    { name: "Acts of Faith",          desc: "Once per battle round, re-roll a hit/wound/save with a Miracle die." },
  "Adeptus Mechanicus":  { name: "Doctrina Imperatives",   desc: "Battleline units +1 BS or +1 WS depending on doctrine choice." },
  "Astra Militarum":     { name: "Born Soldiers",          desc: "Lethal Hits on natural 6 to hit when shooting." },
  "Imperial Knights":    { name: "Code Chivalric",         desc: "Knight units gain Sustained Hits 1 when at full HP." },
  "Grey Knights":        { name: "Brotherhood",            desc: "Re-roll hit rolls of 1 vs Daemons. Always-on bonus." },
  "Deathwatch":          { name: "Mission Tactics",        desc: "Choose mission type each Command phase — flavors all attacks." },
  "Imperial Agents":     { name: "Ministorum Authority",   desc: "Inquisitors grant Lethal Hits to unit they lead." },
  // Adeptus Astartes chapters (use SM rule)
  "Blood Angels":        { name: "Sons of Sanguinius",     desc: "Red Rampage — +1 attack on the charge in melee." },
  "Dark Angels":         { name: "Inner Circle",           desc: "Vow-driven — Dark Angels units gain Sustained Hits or +1 to wound depending on vow." },
  "Black Templars":      { name: "Vow of Faith",           desc: "Re-roll charges. Templar zeal — close combat is your home." },
  "Space Wolves":        { name: "Hunters Unleashed",      desc: "Counter-offensive bonus — when charged, fight first." },
  // Xenos
  "Aeldari":             { name: "Battle Focus",           desc: "After shooting, units may make a 6\" tactical move." },
  "Drukhari":            { name: "Power From Pain",        desc: "Stacking buffs each turn — re-rolls, Sustained, Lethals as game progresses." },
  "Necrons":             { name: "Reanimation Protocols",  desc: "Restore D3 wounds to a unit each turn — Necrons don't stay dead." },
  "Tyranids":            { name: "Synapse",                desc: "Synapse-led units ignore Battle-shock; +1 to attacks within 6\" of synapse." },
  "Genestealer Cults":   { name: "Cult Ambush",            desc: "After deployment, redeploy units. Ambush from anywhere." },
  "Leagues of Votann":   { name: "Judgement Tokens",       desc: "Stack tokens on enemy units — +1 to wound vs them at 1, +1 to hit at 2." },
  "T'au Empire":         { name: "For the Greater Good",   desc: "Unit fires Overwatch on 5+ instead of 6+. Coordinated focus fire." },
  "Orks":                { name: "Waaagh!",                desc: "Once per game (turn 2-3): +1 attack, +1 to charge, 5+ invuln for the turn." },
  // Chaos
  "Chaos Space Marines": { name: "Dark Pacts",             desc: "Once per turn each, units gain Lethal/Sustained at cost of 1 mortal wound." },
  "Death Guard":         { name: "Nurgle's Gift",          desc: "Aura of Disease — enemies within 3\" suffer -1 to hit." },
  "Thousand Sons":       { name: "Cabal of Sorcerers",     desc: "Generate Cabal Points — spend on psychic powers in Command phase." },
  "World Eaters":        { name: "Blessings of Khorne",    desc: "Random buff each Command phase — Strength/Attacks/Move/Charge." },
  "Emperor's Children":  { name: "Thrill Seekers",         desc: "Advance + charge. Move between melee combats freely." },
  "Chaos Knights":       { name: "Harbingers of Dread",    desc: "Battle-shock test enemies within 12\" — fail = -1 to hit on you." },
  "Chaos Daemons":       { name: "Shadow of Chaos",        desc: "In your half of the table, Daemons gain Sustained 1." },
};

// Simple seeded RNG so battles are reproducible from a seed
function makeRng(seed) {
  let s = seed | 0;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Compute simplified offensive/defensive stats from a unit's data
function computeUnitStats(unit) {
  const role = unit.role;
  // Determine base squad size from the unit's name, e.g. "Boyz (10)" -> 10
  const nameMatch = unit.name.match(/\((\d+)\)/);
  const baseSize = nameMatch ? parseInt(nameMatch[1]) : 1;
  // Use override squadSize if set (lets the user simulate a smaller squad)
  const effectiveSquadSize = unit.squadSize || baseSize;
  // Per-squad points scale linearly with squad size
  const perSquadPoints = baseSize > 0 ? Math.round(unit.points * (effectiveSquadSize / baseSize)) : unit.points;
  // Total points contributed by this army entry (qty = number of duplicate squads)
  const pts = perSquadPoints * (unit.qty || 1);

  // Heuristic: model count and durability scale with points + role
  let modelCount = 1;
  let woundsPerModel = 2;
  let attacks = 4;        // legacy abstract score (kept for back-compat)
  let shooting = 4;
  let melee = 4;
  let move = 6;
  let armor = 4;

  // ============================================================
  // FULL 40K STAT LINE (new in v10)
  // ============================================================
  // Each unit now has the actual 40k characteristics so we can do real
  // dice math during the battle sim:
  //   M  — movement in inches
  //   T  — toughness (1-12)
  //   Sv — armour save (2-6, lower is better)
  //   Iv — invulnerable save (0 = none, otherwise 4-6)
  //   W  — wounds per model
  //   Ld — leadership (5-10, lower is better; for Battle-shock tests)
  //   OC — objective control per model
  //   BS — ballistic skill (2-6, lower is better — BS3+ hits on 3+)
  //   WS — weapon skill (2-6, lower is better)
  //   AT — attacks per model in melee
  //   FNP — Feel No Pain (0 = none, 5/6 = on that roll)
  //   weapons — { rangedRange, rangedShots, rangedS, rangedAP, rangedDmg, meleeS, meleeAP, meleeDmg }
  let stats = {
    M: 6, T: 4, Sv: 4, Iv: 0, Ld: 7, OC: 1,
    BS: 4, WS: 4, AT: 1, FNP: 0,
    rangedRange: 24, rangedShots: 1, rangedS: 4, rangedAP: 0, rangedDmg: 1,
    meleeS: 4, meleeAP: 0, meleeDmg: 1,
  };

  // Use the effective squad size (post-resize) as the model count
  modelCount = effectiveSquadSize;

  if (role === "hq") {
    modelCount = 1;
    woundsPerModel = Math.max(4, Math.floor(pts / 25));
    attacks = 6; shooting = 5; melee = 7; move = 6; armor = 3;
    stats = {
      M: 6, T: 5, Sv: 3, Iv: 4, Ld: 6, OC: 1,
      BS: 3, WS: 2, AT: 5, FNP: 0,
      rangedRange: 24, rangedShots: 3, rangedS: 6, rangedAP: 1, rangedDmg: 2,
      meleeS: 6, meleeAP: 2, meleeDmg: 2,
    };
    // Big-character scaling — primarchs and named monsters
    if (pts > 200) { stats.W = 12; stats.T = 10; stats.AT = 8; stats.meleeS = 10; stats.meleeAP = 3; stats.meleeDmg = 3; stats.M = 8; }
    else if (pts > 120) { stats.AT = 6; stats.meleeS = 8; stats.meleeAP = 2; stats.meleeDmg = 2; }
  } else if (role === "troops") {
    woundsPerModel = 2;
    attacks = modelCount * 2;
    shooting = Math.floor(pts / 12);
    melee = Math.floor(pts / 14);
    move = 6; armor = 4;
    stats = {
      M: 6, T: 4, Sv: 4, Iv: 0, Ld: 7, OC: 2,
      BS: 4, WS: 4, AT: 1, FNP: 0,
      rangedRange: 24, rangedShots: 2, rangedS: 4, rangedAP: 0, rangedDmg: 1,
      meleeS: 4, meleeAP: 0, meleeDmg: 1,
    };
    // Scale weapon damage with squad value (better trooper = better gun)
    if (perSquadPoints / Math.max(1, modelCount) > 18) {
      stats.Sv = 3; stats.T = 4;  // Marines, Custodes-tier troops
      stats.rangedShots = 2; stats.rangedS = 4; stats.rangedAP = 1;
    }
    if (perSquadPoints / Math.max(1, modelCount) > 25) {
      stats.Sv = 3; stats.T = 5;  // gravis / heavier troops
      stats.rangedDmg = 2;
    }
  } else if (role === "elites") {
    woundsPerModel = 3;
    attacks = modelCount * 3;
    shooting = Math.floor(pts / 10);
    melee = Math.floor(pts / 8);
    move = 6; armor = 3;
    stats = {
      M: 6, T: 5, Sv: 3, Iv: 5, Ld: 6, OC: 1,
      BS: 3, WS: 3, AT: 3, FNP: 0,
      rangedRange: 18, rangedShots: 2, rangedS: 4, rangedAP: 1, rangedDmg: 1,
      meleeS: 5, meleeAP: 2, meleeDmg: 2,
    };
    // Terminator-tier
    if (perSquadPoints / Math.max(1, modelCount) > 35) {
      stats.W = 3; stats.T = 5; stats.Sv = 2; stats.Iv = 4; stats.AT = 4; stats.meleeAP = 2;
    }
  } else if (role === "fast") {
    woundsPerModel = 3;
    attacks = modelCount * 2;
    shooting = Math.floor(pts / 12);
    melee = Math.floor(pts / 12);
    move = 12; armor = 4;
    stats = {
      M: 12, T: 5, Sv: 3, Iv: 0, Ld: 7, OC: 2,
      BS: 4, WS: 4, AT: 2, FNP: 0,
      rangedRange: 18, rangedShots: 2, rangedS: 4, rangedAP: 1, rangedDmg: 1,
      meleeS: 5, meleeAP: 1, meleeDmg: 1,
    };
  } else if (role === "heavy") {
    modelCount = Math.max(1, modelCount);
    woundsPerModel = Math.max(8, Math.floor(pts / 18));
    attacks = 4;
    shooting = Math.floor(pts / 6);
    melee = Math.floor(pts / 16);
    move = 5; armor = 3;
    stats = {
      M: 6, T: 9, Sv: 3, Iv: 0, Ld: 6, OC: 3,
      BS: 3, WS: 4, AT: 4, FNP: 0,
      rangedRange: 36, rangedShots: 4, rangedS: 8, rangedAP: 2, rangedDmg: 3,
      meleeS: 8, meleeAP: 1, meleeDmg: 2,
    };
    // Knight / titan tier
    if (pts > 350) { stats.T = 12; stats.W = 22; stats.AT = 6; stats.rangedShots = 6; stats.rangedS = 12; stats.rangedAP = 3; stats.rangedDmg = 6; stats.Iv = 5; stats.meleeS = 14; stats.meleeAP = 4; stats.meleeDmg = 8; }
  } else if (role === "transport") {
    modelCount = 1;
    woundsPerModel = Math.max(8, Math.floor(pts / 12));
    attacks = 2; shooting = Math.floor(pts / 12); melee = 2;
    move = 10; armor = 3;
    stats = {
      M: 10, T: 9, Sv: 3, Iv: 0, Ld: 7, OC: 2,
      BS: 4, WS: 4, AT: 3, FNP: 0,
      rangedRange: 24, rangedShots: 3, rangedS: 5, rangedAP: 1, rangedDmg: 1,
      meleeS: 6, meleeAP: 0, meleeDmg: 1,
    };
  }

  // Tag keywords for game-rules interactions
  const nameLower = (unit.name || "").toLowerCase();
  const keywords = [];
  if (role === "hq") keywords.push("CHARACTER");
  if (role === "heavy" && (woundsPerModel >= 8)) keywords.push("VEHICLE");
  if (role === "transport") keywords.push("VEHICLE", "TRANSPORT");
  if (/\b(monster|tyrant|carnifex|exocrine|trygon|maleceptor|tervigon|haruspex|psychophage|tyrannofex|harpy|hive crone|norn|daemon prince|primarch|magnus|mortarion|angron|fulgrim|guilliman|knight|titan|c'tan|swarmlord|skarbrand|bloodthirster|great unclean|lord of change|keeper of secrets|be'lakor)\b/i.test(nameLower)) {
    keywords.push("MONSTER");
  }
  if (role === "fast" || /bike|cavalry|jetbike|outrider/i.test(nameLower)) keywords.push("FAST");
  if (/\bbattleline|troops|warriors|guardian|kabalite|boyz|guardsmen|cultist|neophyte\b/i.test(nameLower)) keywords.push("BATTLELINE");
  if (/terminator|allarus|deathshroud/i.test(nameLower)) keywords.push("TERMINATOR");
  if (/scout|infiltrator|reiver|incursor|jakhal|kommando|deathleaper|lictor/i.test(nameLower)) {
    keywords.push("SCOUT");
  }
  if (/reserves?|deep strike|drop pod/i.test(nameLower)) keywords.push("RESERVES");
  if (/sorcerer|librarian|psyker|farseer|warlock|magus|chief librarian|infernal master|tzaangor shaman|exalted sorcerer/i.test(nameLower)) keywords.push("PSYKER");
  // Synapse for Tyranids — synapse units bolster nearby tyranids vs Battle-shock
  if (/hive tyrant|swarmlord|tyranid prime|neurotyrant|neurothrope|broodlord|tervigon|maleceptor/i.test(nameLower)) keywords.push("SYNAPSE");

  return {
    modelCount,
    maxModels: modelCount,
    woundsPerModel: stats.W || woundsPerModel,
    currentWounds: modelCount * (stats.W || woundsPerModel),
    maxWounds: modelCount * (stats.W || woundsPerModel),
    // Legacy fields (still used by some helpers)
    attacks: Math.max(2, attacks),
    shooting: Math.max(2, shooting),
    melee: Math.max(2, melee),
    move: stats.M,
    armor: stats.Sv,
    range: stats.rangedRange,
    // Full 40k profile
    stats,
    keywords,
    // Per-unit state (mutated during battle)
    advanced: false,
    fellBack: false,
    inMelee: false,
    battleShocked: false,
    inReserve: false,
    cpEarned: 0,
    woundsThisTurn: 0,
    statusEffects: [],     // e.g. ["smokescreen", "armour-of-contempt", "judgment-1"]
    // MVP / per-unit performance tracking
    dmgDealt: 0,           // total damage this unit has caused this game
    killsScored: 0,        // # of enemy units this unit has destroyed
    woundsTaken: 0,        // total damage taken across the game
  };
}

// Generate random terrain inside the playing area
function generateTerrain(rng, width, height) {
  // Place terrain pieces in the central zone — leaves deployment edges open.
  // Real GW terrain rules: pieces of varying sizes, ruins block LoS, hills are open ground.
  const pieces = [];
  const desiredPieces = Math.floor(width * height / 110);
  for (let i = 0; i < desiredPieces; i++) {
    const t = TERRAIN_TYPES[Math.floor(rng() * TERRAIN_TYPES.length)];
    const w = 4 + Math.floor(rng() * 6);
    const h = 4 + Math.floor(rng() * 5);
    // Avoid the deployment zones (kept clear so units have room)
    const minX = width * 0.20;
    const maxX = width * 0.80 - w;
    const x = Math.max(6, minX + rng() * Math.max(1, maxX - minX));
    const y = 6 + rng() * (height - 12 - h);
    pieces.push({ ...t, x, y, w, h, id: `t${i}` });
  }
  return pieces;
}

// Place objectives using GW-standard 5-objective Pariah Nexus layout: center + 4 around.
// Each objective has a label and a "side" tag — side "left"/"right" objectives are in
// that player's deployment half (used for primary scoring & "Storm Hostile Objective").
function generateObjectives(rng, width, height) {
  const objs = [];
  objs.push({ id: "o1", x: width / 2,         y: height / 2,         label: "ALPHA",  side: "neutral" });
  objs.push({ id: "o2", x: width / 2,         y: height / 4,         label: "BETA",   side: "neutral" });
  objs.push({ id: "o3", x: width / 2,         y: (3 * height) / 4,   label: "GAMMA",  side: "neutral" });
  objs.push({ id: "o4", x: width / 4,         y: height / 2,         label: "HOME-L", side: "left" });
  objs.push({ id: "o5", x: (3 * width) / 4,   y: height / 2,         label: "HOME-R", side: "right" });
  // jitter slightly so each game feels different
  for (const o of objs) {
    o.x += (rng() - 0.5) * 4;
    o.y += (rng() - 0.5) * 4;
    o.holder = null;       // current controller ("left"|"right"|null)
    o.razed = false;        // for Scorched Earth missions
  }
  return objs;
}

// Place an army's units in their deployment zone using GW-standard rules:
// 1. Deployment zones are within ~12" of each player's table edge
// 2. Heavy units & artillery go in the back, holding fire lanes
// 3. Battleline (troops) form the front line
// 4. Scouts deploy AT the deployment line (forward 6")
// 5. Some units can be set in Reserves to deep-strike on later turns
function deployArmy(army, side, width, height, rng, fmt) {
  const isLeft = side === "left";
  const zoneDepth = (fmt && fmt.deployZoneDepth) || 8;
  // Deployment zone bounds
  const dzMinX = isLeft ? 1 : width - zoneDepth - 1;
  const dzMaxX = isLeft ? zoneDepth + 1 : width - 1;
  const placed = [];
  // Tactical placement order — heavies/transports back, HQs middle, troops/elites front, fast/scouts forward
  const order = { heavy: 0, transport: 1, hq: 2, elites: 3, troops: 4, fast: 5 };
  const sorted = [...army.units].sort((a, b) => (order[a.role] ?? 6) - (order[b.role] ?? 6));
  // Distribute Y across the full height, jittered
  const totalUnits = sorted.length;
  const lanes = Math.max(3, Math.ceil(Math.sqrt(totalUnits)));
  let i = 0;
  for (const u of sorted) {
    const stats = computeUnitStats(u);
    const lane = i % lanes;
    const row = Math.floor(i / lanes);
    // X position within deployment zone (heavies further back, fast forward)
    const roleDepth = (order[u.role] ?? 3) / 5;  // 0=heavy at edge, 1=fast at front
    const xWithin = roleDepth * (zoneDepth - 2);
    let x = isLeft ? (dzMinX + 0.5 + xWithin + rng() * 0.8) : (dzMaxX - 0.5 - xWithin - rng() * 0.8);
    // Add row offset to spread within depth
    x += (isLeft ? 1 : -1) * row * 0.7;
    const y = 3 + (lane / (lanes - 1 || 1)) * (height - 6) + (rng() - 0.5) * 1.2;
    // Determine if unit starts in Reserves (deep strikers, drop pods, etc.)
    const startsInReserve = stats.keywords && stats.keywords.includes("RESERVES");
    // Scout move — gives infiltrators/scouts a free 6" advance after deployment
    const isScout = stats.keywords && stats.keywords.includes("SCOUT");
    let finalX = Math.max(1, Math.min(width - 1, x));
    if (isScout && !startsInReserve) {
      // Scouts deploy 6" further forward
      finalX = isLeft ? Math.min(width / 2 - 4, finalX + 6) : Math.max(width / 2 + 4, finalX - 6);
    }
    placed.push({
      ...u,
      ...stats,
      x: finalX,
      y: Math.max(1, Math.min(height - 1, y)),
      side,
      destroyed: false,
      inReserve: startsInReserve,
      uid: `${side}-${i}`,
    });
    i++;
  }
  return placed;
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// =====================================================================
// PIXEL ART SPRITE SYSTEM (v2 — expanded)
// =====================================================================
// ~50 archetypes + ~30 named-character uniques. Each is a 12x12 pixel
// grid. Characters in each row:
//   "." = transparent
//   "1" = faction base color (army.color, may be overridden by FACTION_PALETTES)
//   "2" = faction accent color (army.accent, may be overridden)
//   "3" = dark outline (#0a0604)
//   "4" = light highlight / gold (#f5d76e)
//   "5" = blood / red (#a02020)
//   "6" = pale skin / bone (#d4c5a0)
//   "7" = green glow / chitin (#5a8b2a)
//   "8" = blue glow / psyker fire (#5470a0)
//   "9" = purple / warp / slaanesh (#6b3a6b)
//
// FACTION_PALETTES below remap "1" and "2" to faction-themed tones for
// xenos/chaos units (e.g. Tyranid carapace+flesh, Necron gunmetal+green).
// For factions without an entry, the default army.color/army.accent applies.

const SPRITE_GRID = 12;

const SPRITES = {
  // ============================================================
  // INFANTRY (single-figure) — basic marine variants
  // ============================================================
  "infantry-marine": [
    "............",
    "....333.....",
    "...32123....",
    "...31113....",
    "..3211123...",
    "..3111113...",
    "..3122213...",
    "..3122213...",
    "..3111113...",
    "...32223....",
    "....333.....",
    "............",
  ],
  // Gravis: chunkier, heavier shoulder-line
  "infantry-gravis": [
    "............",
    "...33333....",
    "..3322233...",
    "..3211123...",
    ".321111123..",
    ".321212123..",
    ".321111123..",
    ".322222223..",
    ".321111123..",
    "..3322233...",
    "...33333....",
    "............",
  ],
  // Phobos: stealthy, slimmer, with cloak
  "infantry-phobos": [
    "............",
    ".....33.....",
    "....3123....",
    "...321123...",
    "...311113...",
    "..32111123..",
    "..32111123..",
    "...3.....3..",
    "...3.....3..",
    "..3..2..3...",
    "............",
    "............",
  ],
  // Assault marine with jump pack (winged silhouette)
  "infantry-jump": [
    "............",
    "..2.....2...",
    "..22...22...",
    "..222.222...",
    "...32123....",
    "...31113....",
    "..3211123...",
    "..3111113...",
    "...32223....",
    "....333.....",
    "............",
    "............",
  ],
  // Centurion / heavy walker-armored marine
  "infantry-centurion": [
    "............",
    "..3333333...",
    ".322333223..",
    ".321222123..",
    ".321212123..",
    ".321111123..",
    ".321111123..",
    ".321212123..",
    ".321222123..",
    ".322333223..",
    "..3333333...",
    "............",
  ],

  // ============================================================
  // INFANTRY — horde / light / xenos variants
  // ============================================================
  "infantry-horde": [
    "............",
    ".333..333...",
    ".313..313...",
    ".333..333...",
    "............",
    ".333..333...",
    ".313..313...",
    ".333..333...",
    "............",
    "...333......",
    "...313......",
    "...333......",
  ],
  "infantry-light": [
    "............",
    "....33......",
    "...3163.....",
    "...3113.....",
    "..311113....",
    "..311113....",
    "..312213....",
    "..311113....",
    "...3113.....",
    "....33......",
    "............",
    "............",
  ],
  // Ork boy — broader, brutish, green-skin
  "infantry-ork-boy": [
    "............",
    "....333.....",
    "...37173....",
    "...37773....",
    "..3711173...",
    "..3717173...",
    "..3711173...",
    "..3122213...",
    "..3111113...",
    "...32.23....",
    "....3.3.....",
    "............",
  ],
  // Ork nob — bigger, with armor
  "infantry-ork-nob": [
    "............",
    "...33333....",
    "..3371733...",
    "..3777773...",
    ".337711733..",
    ".321711123..",
    ".321111123..",
    ".322222223..",
    ".321111123..",
    "..3322233...",
    "...3...3....",
    "............",
  ],
  // Eldar aspect warrior — slim, elegant
  "infantry-aspect": [
    "............",
    "....222.....",
    "...22122....",
    "..2211223...",
    "..2111113...",
    "..2111113...",
    "..2222223...",
    "..3111113...",
    "...31113....",
    "...3.3.3....",
    "............",
    "............",
  ],
  // Drukhari kabalite — sharper, more menacing
  "infantry-kabalite": [
    "............",
    "....2.2.....",
    "...92129....",
    "...91119....",
    "..3211123...",
    "..3111113...",
    "..3922293...",
    "..3911193...",
    "...39193....",
    "....3.3.....",
    "............",
    "............",
  ],
  // Tyranid warrior — chitin + claws
  "infantry-tyranid": [
    "............",
    ".3........3.",
    ".73......37.",
    "..771..177..",
    "...77117....",
    "...71117....",
    "..7111117...",
    "..7711177...",
    "...7.5.7....",
    "...3...3....",
    "............",
    "............",
  ],
  // Necron warrior — robotic, glowing eyes
  "infantry-necron": [
    "............",
    "....333.....",
    "...32723....",
    "...37773....",
    "..3211123...",
    "..3171713...",
    "..3111113...",
    "..3171713...",
    "..3111113...",
    "...32223....",
    "....333.....",
    "............",
  ],
  // T'au fire warrior — angular helmet, breastplate
  "infantry-tau": [
    "............",
    "....333.....",
    "...31113....",
    "...32123....",
    "..3211123...",
    "..3122213...",
    "..3111113...",
    "..3211123...",
    "..3221223...",
    "...32.23....",
    "....3.3.....",
    "............",
  ],
  // Sister of Battle / Sororitas — graceful armor with halo
  "infantry-sororitas": [
    "............",
    "...44444....",
    "..4421244...",
    "..4211124...",
    ".421111124..",
    ".421222124..",
    ".421111124..",
    ".421222124..",
    ".421111124..",
    "..4322234...",
    "....333.....",
    "............",
  ],
  // Cultist / chaos minion — ragged, irregular
  "infantry-cultist": [
    "............",
    ".....3......",
    "....353.....",
    "...35153....",
    "...31113....",
    "..3511153...",
    "..3111113...",
    "..3151513...",
    "...31113....",
    "....3.3.....",
    "............",
    "............",
  ],
  // Skitarii ranger — Mechanicus, tubes and tech
  "infantry-skitarii": [
    "............",
    "....3.3.....",
    "...32223....",
    "...32123....",
    "..3211123...",
    "..3122213...",
    "..3111113...",
    "..3122213...",
    "..3211123...",
    "...3...3....",
    "...3...3....",
    "............",
  ],
  // Genestealer — clawed predator
  "infantry-genestealer": [
    "............",
    ".3.......3..",
    ".73.....37..",
    "..7..1..7...",
    "...71117....",
    "...91519....",
    "..7111117...",
    "..7919197...",
    "...7.5.7....",
    "...3...3....",
    "............",
    "............",
  ],

  // ============================================================
  // ELITES — terminators / specialists
  // ============================================================
  "terminator": [
    "............",
    "...3333.....",
    "..341143....",
    "..311113....",
    ".321111123..",
    ".311212113..",
    ".311111113..",
    ".312121213..",
    ".311111113..",
    "..311113....",
    "...3333.....",
    "............",
  ],
  // Allarus / heavy gold terminator
  "terminator-allarus": [
    "............",
    "...44444....",
    "..4421244...",
    "..4211124...",
    ".421112124..",
    ".422121224..",
    ".421111124..",
    ".422121224..",
    ".421111124..",
    "..4421244...",
    "...44444....",
    "............",
  ],
  // Death Guard plague terminator
  "terminator-plague": [
    "............",
    "...77777....",
    "..7752577...",
    "..7711177...",
    ".775111577..",
    ".775151577..",
    ".771111177..",
    ".775151577..",
    ".771111177..",
    "..7755577...",
    "...77777....",
    "............",
  ],
  // Custodes wardens — golden elite, larger halo
  "elite-gold": [
    "............",
    "....444.....",
    "...44244....",
    "..4421244...",
    "..4211124...",
    ".321111123..",
    ".421222124..",
    ".321111123..",
    "..4211124...",
    "...44244....",
    "....444.....",
    "............",
  ],
  // Possessed / chaos warped — twisted limbs
  "elite-warped": [
    "............",
    "...5..5.....",
    "...515......",
    "..531135....",
    "..511115....",
    ".55111155...",
    "..511115....",
    "..555555....",
    "..511115....",
    "...5113.....",
    "....3.3.....",
    "............",
  ],
  // Bladeguard veterans / sword brethren — paired with shields
  "elite-bladeguard": [
    "............",
    "..3.....3...",
    ".343...343..",
    ".341...143..",
    ".34211123...",
    "..3211123...",
    "..3111113...",
    "..3122213...",
    ".34211123...",
    ".341...143..",
    ".343...343..",
    "............",
  ],
  // Sanguinary guard / blood angels golden veterans
  "elite-sanguinary": [
    "..2..2..2...",
    "..22...22...",
    "...44444....",
    "..4421244...",
    "..4211124...",
    "..421...42..",
    "..422...42..",
    "..4211124...",
    "...44244....",
    "....555.....",
    "............",
    "............",
  ],
  // Aberrants — bloated mutants
  "elite-aberrant": [
    "............",
    "...666......",
    "..67163.....",
    "..66663.....",
    ".6611116....",
    ".6112116....",
    ".6611116....",
    ".6611116....",
    ".6611116....",
    "..66663.....",
    "...3.3......",
    "............",
  ],
  // Eightbound / juggernaut khorne berserker
  "elite-eightbound": [
    "............",
    "....555.....",
    "...53353....",
    "...51153....",
    "..5511553...",
    "..5111153...",
    "..5511553...",
    "..5511553...",
    "..5111153...",
    "...51153....",
    "....555.....",
    "............",
  ],
  // Wraithguard — eldar spirit construct
  "elite-wraith": [
    "............",
    "...88888....",
    "..8821288...",
    "..8211128...",
    ".821111128..",
    ".821222128..",
    ".821111128..",
    ".821222128..",
    ".821111128..",
    "..8211128...",
    "...88888....",
    "............",
  ],

  // ============================================================
  // HQ / LEADERS
  // ============================================================
  "hq-leader": [
    "...44444....",
    "..4422244...",
    ".44211224...",
    ".42111124...",
    ".42112124...",
    ".421211124..",
    ".42121124...",
    ".42111124...",
    "..4211124...",
    "...42124....",
    "....222.....",
    ".....2......",
  ],
  "hq-psyker": [
    ".....2......",
    "....222.....",
    "...22322....",
    "..2231322...",
    "..2311132...",
    ".22111111...",
    "..2311132...",
    "..2231322...",
    "...22322....",
    "....222.....",
    "...2...2....",
    "............",
  ],
  "hq-monster": [
    "............",
    "..3......3..",
    ".333....333.",
    "..32....23..",
    "...322232...",
    "...211112...",
    "..32111123..",
    "..32222223..",
    "...32.23....",
    "...3...3....",
    "............",
    "............",
  ],
  // Chaplain / preacher — robed, with helm
  "hq-chaplain": [
    "............",
    "....333.....",
    "...36663....",
    "...31113....",
    "..3211123...",
    "..3122213...",
    "..3155513...",
    "..3155513...",
    "..3122213...",
    "...32223....",
    "....333.....",
    "............",
  ],
  // Inquisitor — robed and armed
  "hq-inquisitor": [
    "............",
    "....333.....",
    "...32623....",
    "...32123....",
    "..3211123...",
    "..3111113...",
    "..3122213...",
    "..3122213...",
    "..3111113...",
    "...32223....",
    "...3...3....",
    "............",
  ],
  // Ork warboss — big horns, cleaver
  "hq-warboss": [
    "............",
    "..3.....3...",
    ".373...373..",
    ".377777773..",
    "..3771773...",
    "..3717173...",
    ".377711773..",
    ".321111123..",
    "..3322233...",
    "...3...3....",
    "............",
    "............",
  ],
  // Necron Lord / Overlord — robed with sceptre
  "hq-necron-lord": [
    "............",
    "....333.....",
    "...32723....",
    "...37773....",
    "..3211123...",
    ".321172123..",
    ".321111123..",
    ".321777123..",
    "..3211123...",
    "...32223....",
    "....3.3.....",
    "............",
  ],
  // T'au commander / battlesuit — boxy
  "hq-tau-commander": [
    "............",
    "....3333....",
    "...322223...",
    "..32111123..",
    "..32122123..",
    "..32111123..",
    "..32222223..",
    "..32111123..",
    "..32212123..",
    "...32223....",
    "....3..3....",
    "............",
  ],

  // ============================================================
  // VEHICLES
  // ============================================================
  "vehicle-tank": [
    "............",
    ".3333333333.",
    ".3211111123.",
    ".3211222123.",
    ".3212222213.",
    ".3211222123.",
    ".3211222123.",
    ".3212222213.",
    ".3211222123.",
    ".3211111123.",
    ".3333333333.",
    "............",
  ],
  // Heavy artillery / siege tank
  "vehicle-heavy-tank": [
    "............",
    "33333333333.",
    "3221111223..",
    "3212111213..",
    "3211222213..",
    "3211222213..",
    "3211222123..",
    "3211222123..",
    "3211222213..",
    "3221111223..",
    "33333333333.",
    "............",
  ],
  "vehicle-walker": [
    "............",
    "....3333....",
    "..2331133...",
    "..2311132...",
    "..2311132...",
    "..3322233...",
    "..3211123...",
    "..3211123...",
    "..3322233...",
    "...32.23....",
    "...33.33....",
    "............",
  ],
  // Knight titan — bigger walker, more defined
  "vehicle-knight": [
    "............",
    "...44444....",
    "..43113344..",
    "..43223344..",
    ".4322222243.",
    ".4321222143.",
    ".4322222243.",
    ".4322222243.",
    "..4322234...",
    "..4322234...",
    "..43...34...",
    "..43...34...",
  ],
  // Dreadnought — angular walker with big arms
  "vehicle-dreadnought": [
    "............",
    "..3.....3...",
    ".343...343..",
    ".341...143..",
    "..3322233...",
    "..3211123...",
    "..3122213...",
    "..3211123...",
    "..3322233...",
    "...3...3....",
    "...3...3....",
    "............",
  ],
  // Crisis battlesuit / dreadknight — twin-armed walker
  "vehicle-suit": [
    "............",
    "...3333.....",
    "..3322233...",
    "..3211123...",
    "..3211123...",
    ".3322332333.",
    ".3211221213.",
    ".3211221213.",
    ".3322332323.",
    "...3...3....",
    "...3...3....",
    "............",
  ],
  "vehicle-bike": [
    "............",
    "....333.....",
    "...32223....",
    "..3322233...",
    "..3211123...",
    "..3211123...",
    "..3322233...",
    "..3.222.3...",
    "..3..2..3...",
    "............",
    "............",
    "............",
  ],
  // Outrider / heavy bike — bigger bike
  "vehicle-outrider": [
    "............",
    "...33.33....",
    "..3221223...",
    "..3211123...",
    ".3322332333.",
    ".3211221213.",
    ".3211221213.",
    ".3322332333.",
    "..3211123...",
    "..3221223...",
    "...33.33....",
    "............",
  ],
  // Jetbike — slimmer with wings
  "vehicle-jetbike": [
    "............",
    "...3..3.....",
    "..23..23....",
    ".223..223...",
    "223.22.223..",
    "23.2222.23..",
    "..2222222...",
    "..2.222.2...",
    ".2..222..2..",
    ".2..222..2..",
    "..3.....3...",
    "............",
  ],
  "vehicle-transport": [
    "............",
    "............",
    ".3333333333.",
    ".3111111113.",
    ".3122212213.",
    ".3122212213.",
    ".3111111113.",
    ".3333333333.",
    "............",
    "............",
    "............",
    "............",
  ],
  // Land Raider / heavy transport
  "vehicle-land-raider": [
    "............",
    "33.3333333.3",
    "3.32222223.3",
    "3.31222213.3",
    "33321222123.",
    "33322222223.",
    "33321222123.",
    "33321222123.",
    "33322222223.",
    "3.31222213.3",
    "3.32222223.3",
    "33.3333333.3",
  ],
  // Battlewagon / ork transport (improvised)
  "vehicle-battlewagon": [
    "............",
    "3333333333..",
    "3711111173..",
    "3712221173..",
    "3711777173..",
    "3711121173..",
    "3711221173..",
    "3711111173..",
    "3712221173..",
    "3711111173..",
    "3333333333..",
    "............",
  ],
  // Open-top / Drukhari raider
  "vehicle-raider": [
    "............",
    "....2.......",
    ".3...3..2...",
    ".321.123.2..",
    ".3221.223...",
    "..3...3.....",
    ".3221.223...",
    ".321.123.2..",
    ".3...3..2...",
    "....2.......",
    "............",
    "............",
  ],
  // Flyer / gunship — wings + long fuselage
  "vehicle-flyer": [
    "............",
    "..2.....2...",
    ".22.....22..",
    "222.333.222.",
    ".22321123...",
    "..23211132..",
    "..23222132..",
    "..23.....3..",
    "...3.....3..",
    "............",
    "............",
    "............",
  ],
  // Dropship / heavy aircraft (Stormraven-class)
  "vehicle-dropship": [
    "............",
    "...22.22....",
    "..2222222...",
    ".22.333.22..",
    "2..3111233..",
    "2..3122223..",
    "2..3111123..",
    "2..3122223..",
    ".22.333.22..",
    "..2222222...",
    "...22.22....",
    "............",
  ],

  // ============================================================
  // MONSTERS / CAVALRY
  // ============================================================
  "monster-big": [
    "............",
    "..3......3..",
    ".355....553.",
    "..3551155...",
    "...511115...",
    "..51111115..",
    "..51111115..",
    ".5511111155.",
    ".5511111155.",
    ".5311111135.",
    "...3...3....",
    "............",
  ],
  // Tyranid bio-titan / norn — chitinous mass
  "monster-tyranid": [
    "............",
    ".7........7.",
    "773......377",
    "773.5..5.377",
    "773771177377",
    "773711117377",
    "773711117377",
    "773771177377",
    "773.5..5.377",
    "773......377",
    ".7........7.",
    "............",
  ],
  // Daemon prince / greater daemon — winged horror
  "monster-daemon": [
    "....9..9....",
    "...99..99...",
    "..9999999...",
    ".95...59....",
    ".951...59...",
    ".9511.59....",
    ".951.159....",
    ".9511159....",
    ".9555559....",
    "..95.59.....",
    "..3...3.....",
    "............",
  ],
  // Cavalry / mounted (smaller)
  "cavalry": [
    "............",
    ".....3......",
    "....312.....",
    "..3322233...",
    "..3211123...",
    "..3211123...",
    "..3211123...",
    "..3322233...",
    "...3...3....",
    "............",
    "............",
    "............",
  ],
  // Thunderwolf cavalry — mounted on giant wolf
  "cavalry-thunderwolf": [
    "............",
    "...33.......",
    "..3163......",
    "..3113......",
    "..32223...3.",
    "..3322233333",
    "..3211111233",
    "..3322222233",
    "..3...3.3...",
    "..3...3.3...",
    "............",
    "............",
  ],

  // ============================================================
  // NAMED CHARACTER UNIQUES (~30)
  // ============================================================

  // Roboute Guilliman — Ultramarine primarch, golden cape, big shoulders
  "named-guilliman": [
    "..4..444..4.",
    "...44222244.",
    "..44222224..",
    "..42111124..",
    ".421222124..",
    ".421215124..",
    ".421222124..",
    ".421111124..",
    "..42121124..",
    "..44222244..",
    "...4....4...",
    "............",
  ],
  // Magnus the Red — winged Tzeentch primarch, single eye
  "named-magnus": [
    "..9.....9...",
    "..99...99...",
    ".9999.9999..",
    "..9.5.5.9...",
    "..9.585.9...",
    "..995859....",
    "..9558559...",
    "..9555559...",
    "..9.555.9...",
    "..9.....9...",
    "...3...3....",
    "............",
  ],
  // Mortarion — daemon prince of Nurgle, scythe, wings
  "named-mortarion": [
    "..7.....7...",
    "..77.5.77...",
    ".77777577...",
    "..77575.....",
    "..77555.....",
    "..7755573...",
    "..7715573...",
    "..7711573...",
    "..7755573...",
    "...3.3..5...",
    "...3.3..5...",
    "............",
  ],
  // Angron — World Eaters primarch, twin chain-axes
  "named-angron": [
    "............",
    "5..5...5..5.",
    "55..555..55.",
    "5..15.51..5.",
    "..3511153...",
    "..3511153...",
    "..3155513...",
    "..3151513...",
    "..3155513...",
    "...3...3....",
    "...3...3....",
    "............",
  ],
  // Fulgrim — Slaanesh primarch, serpentine
  "named-fulgrim": [
    "............",
    "....999.....",
    "...99299....",
    "..99211299..",
    "..92111129..",
    "..92121229..",
    "..92121129..",
    "..92211129..",
    ".9..2222..9.",
    "..9.....9...",
    "............",
    "............",
  ],
  // Lion El'Jonson — Dark Angels primarch, sword + shield
  "named-lion": [
    "..3.....3...",
    "..343..343..",
    "...44444....",
    "..4421244...",
    "..4211124...",
    "..421...42..",
    "..421...42..",
    "..4211124...",
    "..421222124.",
    "...44244....",
    "....3.3.....",
    "............",
  ],
  // Abaddon — Warmaster, topknot + Drach'nyen
  "named-abaddon": [
    "............",
    "....333.....",
    "...3553.....",
    "...51153.....",
    "..3511553...",
    "..3151153...",
    "..3551553...",
    "..3151153...",
    "..3511553...",
    "...51153....",
    "....333.....",
    "............",
  ],
  // Ghazghkull — biggest ork, klaw and banner
  "named-ghazghkull": [
    "............",
    "...37773....",
    "..3777773...",
    "..3717173...",
    ".37711117....",
    ".377111173..",
    ".377117773..",
    ".377777773..",
    "..3711173...",
    "..3322233...",
    "...3...3....",
    "............",
  ],
  // Trazyn — Necron lore-collector, ornate
  "named-trazyn": [
    "............",
    "....444.....",
    "...47274....",
    "...37773....",
    "..3211123...",
    ".421172124..",
    ".421777124..",
    ".421172124..",
    ".421111124..",
    "..43.4.34...",
    "....4.4.....",
    "............",
  ],
  // Silent King — Necron paragon
  "named-silent-king": [
    "...77777....",
    "..7821287...",
    "..7211127...",
    ".721777127..",
    ".721888127..",
    ".721787127..",
    ".721888127..",
    ".721777127..",
    ".721111127..",
    "..7211127...",
    "...77877....",
    "............",
  ],
  // Eldrad — eldar farseer, pointed helmet, staff
  "named-eldrad": [
    "............",
    "...33833....",
    "..3382838...",
    "..3811183...",
    ".381111183..",
    ".381222183..",
    ".381215183..",
    ".381222183..",
    ".381111183..",
    "..38111383..",
    "....388.....",
    "............",
  ],
  // Avatar of Khaine — burning eldar god
  "named-avatar": [
    "....555.....",
    "...55155....",
    "..5511155...",
    ".551111155..",
    ".511555115..",
    ".512525215..",
    ".511555115..",
    ".511555115..",
    ".551111155..",
    "..5511155...",
    "...55555....",
    "............",
  ],
  // Drazhar — incubi master, paired blades
  "named-drazhar": [
    "............",
    "...3...3....",
    "..323.323...",
    "..323.323...",
    "..323.323...",
    "..3211123...",
    ".321555123..",
    "..3155513...",
    "..3211123...",
    "..3322233...",
    "...3...3....",
    "............",
  ],
  // Vect — Drukhari overlord, throne
  "named-vect": [
    "............",
    "..9.....9...",
    "..999.999...",
    "..991.199...",
    ".9921.1299..",
    ".9911.1199..",
    ".9911.1199..",
    ".9911.1199..",
    "..9911199...",
    "...99999....",
    "....999.....",
    "............",
  ],
  // Lelith — succubus, dual blades
  "named-lelith": [
    "............",
    "...9...9....",
    "...9.5.9....",
    "...95159....",
    "...95159....",
    "..9551559...",
    ".9.51115.9..",
    ".9.51115.9..",
    "..9911199...",
    "...91519....",
    "....939.....",
    "............",
  ],
  // Belisarius Cawl — robotic Mechanicus archmagos
  "named-cawl": [
    "............",
    "...33.33....",
    "..343.343...",
    "..3.....3...",
    "..3322233...",
    "..3211123...",
    "..3122213...",
    "..3211123...",
    "..3322233...",
    "..3.....3...",
    "..3.3.3.3...",
    "..3.3.3.3...",
  ],
  // Trajann Valoris — Custodes captain-general
  "named-trajann": [
    "............",
    "....444.....",
    "...44444....",
    "..4422244...",
    "..4211124...",
    ".42121214...",
    ".42111124...",
    ".42122124...",
    ".42111124...",
    "..4422244...",
    "...44444....",
    "............",
  ],
  // Morvenn Vahl — Sororitas paragon warsuit
  "named-vahl": [
    "............",
    "...44444....",
    "..4444444...",
    "..4421244...",
    ".4421112144.",
    ".4421112144.",
    ".4422222144.",
    ".4421112144.",
    "..4421244...",
    "..4...4..4..",
    "..4...4..4..",
    "............",
  ],
  // Saint Celestine — winged saint
  "named-celestine": [
    "..4.....4...",
    "..44...44...",
    "..444.444...",
    "...44444....",
    "..4421244...",
    "..4211124...",
    "..421555124.",
    "..4211124...",
    "...44244....",
    "....555.....",
    "............",
    "............",
  ],
  // Logan Grimnar — riding Stormrider chariot
  "named-logan": [
    "..............".substring(0, 12),
    "....3.3.....",
    "...3163.....",
    "...3113.....",
    "..3211123...",
    "..3322233333",
    "..3211111233",
    "..3322222333",
    "..3.....3...",
    "..3.3.3.3...",
    "............",
    "............",
  ],
  // Ragnar Blackmane — Space Wolves hero
  "named-ragnar": [
    "............",
    "...3.3.3....",
    "..313163....",
    "..311113....",
    "..3211523...",
    "..3151523...",
    "..3215523...",
    "..3151123...",
    "..3211123...",
    "...3...3....",
    "............",
    "............",
  ],
  // Hive Tyrant — winged Tyranid leader
  "named-hive-tyrant": [
    "..7.....7...",
    "..77...77...",
    "..7777777...",
    "..7711177...",
    "..7717177...",
    "..7717177...",
    "..7711177...",
    "..7515157...",
    "..7715177...",
    "..3.5.5.3...",
    "..3.....3...",
    "............",
  ],
  // Swarmlord — Tyranid HQ with bonewords
  "named-swarmlord": [
    "..3.....3...",
    "..73...37...",
    "..7777777...",
    "..7711177...",
    "..7715177...",
    "..7717177...",
    "..7717177...",
    "..7715177...",
    "..7717177...",
    "..7715177...",
    "..3.....3...",
    "............",
  ],
  // Be'lakor — first daemon prince
  "named-belakor": [
    "..9.....9...",
    "..99...99...",
    ".9999.9999..",
    "..9.535.9...",
    "..9555559...",
    "..9551559...",
    "..9555559...",
    "..9551559...",
    "..9555559...",
    "..9.5.5.9...",
    "..3.....3...",
    "............",
  ],
  // Skarbrand — exiled bloodthirster
  "named-skarbrand": [
    "..5.....5...",
    "..55...55...",
    ".55555555...",
    ".55..555....",
    ".551.51.5...",
    ".555555555..",
    ".551555155..",
    ".555515555..",
    ".555555555..",
    "..55555.....",
    "..3...3.....",
    "............",
  ],
  // Lord of Change — greater daemon of tzeentch
  "named-lord-of-change": [
    "..8..8..8...",
    "..88.8.88...",
    ".888.8.888..",
    "..8.888.8...",
    "..889889....",
    "..8.989.8...",
    "..889989....",
    "..8.99..8...",
    "..8.99..8...",
    ".88.....88..",
    "..3.....3...",
    "............",
  ],
  // Great Unclean One — Nurgle greater daemon
  "named-guo": [
    "............",
    "...77777....",
    "..7752577...",
    ".775515577..",
    ".775151577..",
    ".771515177..",
    ".775151577..",
    ".771155177..",
    ".771115177..",
    "..7755577...",
    "...77777....",
    "............",
  ],
  // Keeper of Secrets — Slaanesh daemon
  "named-keeper": [
    "............",
    "...9...9....",
    "..99...99...",
    ".999.5.999..",
    "..9.555.9...",
    "..9.555.9...",
    "..99555599..",
    "..9.555.9...",
    "..99555599..",
    "..9.....9...",
    "..3.....3...",
    "............",
  ],
  // Canis Rex — Imperial Knight
  "named-canis-rex": [
    "............",
    "...44444....",
    "..43113344..",
    "..43223344..",
    ".4322222243.",
    ".4321555143.",
    ".4322555243.",
    ".4322222243.",
    "..4322234...",
    "..4322234...",
    "..43...34...",
    "..43...34...",
  ],
  // Lucius the Eternal — Slaanesh duelist
  "named-lucius": [
    "............",
    "....939.....",
    "...39193....",
    "..3911193...",
    ".39111193...",
    ".39222193...",
    ".39111193...",
    ".39222193...",
    "..39111193..",
    "...39193....",
    "....3.3.....",
    "............",
  ],
};

// Faction palette overrides — for "1" and "2" colors. If a faction has
// an entry, its sprites use these colors instead of army.color/army.accent.
// Lets us give Tyranids a chitin-and-flesh look, Necrons gunmetal-and-green, etc.
const FACTION_PALETTES = {
  "Tyranids":         { "1": "#7a3a4a", "2": "#a06030" },        // chitin purple + flesh tan
  "Genestealer Cults":{ "1": "#5a3a5a", "2": "#7a4a3a" },        // purple chitin, ragged tan
  "Necrons":          { "1": "#2a2a2e", "2": "#5a8b2a" },        // gunmetal + green glow
  "Aeldari":          { "1": "#2a4a6a", "2": "#d4c5a0" },        // dusk blue + bone
  "Drukhari":         { "1": "#2a1a2a", "2": "#7a1a3a" },        // dark + crimson
  "Death Guard":      { "1": "#5a6a3a", "2": "#7a8550" },        // putrid green
  "Thousand Sons":    { "1": "#1a3a5a", "2": "#c9b037" },        // blue + gold
  "Emperor's Children":{"1": "#6b3a6b", "2": "#d4a0c0" },        // royal purple + pink
  "World Eaters":     { "1": "#7a1a1a", "2": "#c98b37" },        // blood red + brass
  "Adeptus Custodes": { "1": "#7a5a1a", "2": "#f5d76e" },        // bronze + gold
  "Adepta Sororitas": { "1": "#1a1a1e", "2": "#a01a1a" },        // black + crimson
  "Adeptus Mechanicus":{"1": "#5a1a1a", "2": "#a05a2a" },        // dark red + rust
  "Imperial Knights": { "1": "#2a2a4a", "2": "#c9b037" },        // navy + gold
  "Chaos Knights":    { "1": "#2a1a2a", "2": "#a02020" },        // dark + crimson
  "Chaos Daemons":    { "1": "#3a1a3a", "2": "#a02020" },        // warp purple + blood
  "Leagues of Votann":{ "1": "#3a4a5a", "2": "#c9b037" },        // ironclad blue + gold
  "T'au Empire":      { "1": "#a07030", "2": "#5a8ba0" },        // tan + cyan
  "Astra Militarum":  { "1": "#3a4a3a", "2": "#a08550" },        // olive + tan
  "Orks":             { "1": "#3a4a3a", "2": "#a04020" },        // dirty green + rust
  "Grey Knights":     { "1": "#5a6070", "2": "#c9b037" },        // silver + gold
  "Deathwatch":       { "1": "#1a1a1e", "2": "#a01a1a" },        // black + chapter red
};

// Named character lookup — these unit names get unique sprites that override
// the archetype-based selection. Keys are case-insensitive substring matches.
const NAMED_SPRITES = [
  // Imperial primarchs / characters
  { match: /\bguilliman\b/i,                sprite: "named-guilliman" },
  { match: /\blion el|lion'?s sword|the lion\b/i, sprite: "named-lion" },
  { match: /\bdante|sanguinor|mephiston\b/i, sprite: "elite-sanguinary" },
  { match: /\btrajann\b/i,                  sprite: "named-trajann" },
  { match: /\bmorvenn vahl\b/i,             sprite: "named-vahl" },
  { match: /\bsaint celestine|^celestine$/i, sprite: "named-celestine" },
  { match: /\blogan grimnar\b/i,            sprite: "named-logan" },
  { match: /\bragnar blackmane\b/i,         sprite: "named-ragnar" },
  { match: /\bbelisarius cawl|^cawl\b/i,    sprite: "named-cawl" },
  { match: /\bcanis rex\b/i,                sprite: "named-canis-rex" },
  // Chaos primarchs / characters
  { match: /\bmagnus the red|^magnus\b/i,   sprite: "named-magnus" },
  { match: /\bmortarion\b/i,                sprite: "named-mortarion" },
  { match: /\bangron\b/i,                   sprite: "named-angron" },
  { match: /\bfulgrim\b/i,                  sprite: "named-fulgrim" },
  { match: /\babaddon\b/i,                  sprite: "named-abaddon" },
  { match: /\blucius the eternal|^lucius\b/i, sprite: "named-lucius" },
  // Daemons
  { match: /\bbe'?lakor\b/i,                sprite: "named-belakor" },
  { match: /\bskarbrand\b/i,                sprite: "named-skarbrand" },
  { match: /\blord of change|kairos|fateweaver\b/i, sprite: "named-lord-of-change" },
  { match: /\bgreat unclean one|rotigus\b/i, sprite: "named-guo" },
  { match: /\bkeeper of secrets\b/i,        sprite: "named-keeper" },
  // Xenos
  { match: /\beldrad ulthran|^eldrad\b/i,   sprite: "named-eldrad" },
  { match: /\bavatar of khaine\b/i,         sprite: "named-avatar" },
  { match: /\bdrazhar\b/i,                  sprite: "named-drazhar" },
  { match: /\basdrubael vect|^vect\b/i,     sprite: "named-vect" },
  { match: /\blelith hesperax|^lelith\b/i,  sprite: "named-lelith" },
  { match: /\bhive tyrant|^the swarmlord$/i, sprite: "named-hive-tyrant" },
  { match: /\bswarmlord\b/i,                sprite: "named-swarmlord" },
  // Necrons
  { match: /\btrazyn\b/i,                   sprite: "named-trazyn" },
  { match: /\bsilent king|szarekh\b/i,      sprite: "named-silent-king" },
  // Orks
  { match: /\bghazghkull\b/i,               sprite: "named-ghazghkull" },
];

// Map a unit to a sprite archetype based on role + name keywords.
// Named-character lookup runs first; falls through to archetype heuristics.
function getSpriteArchetype(unit) {
  const name = (unit.name || "").toLowerCase();
  const role = unit.role || "";
  const sizeMatch = name.match(/\((\d+)\)/);
  const squadSize = sizeMatch ? parseInt(sizeMatch[1]) : 1;

  // 0. NAMED CHARACTER LOOKUP — these get unique sprites
  for (const entry of NAMED_SPRITES) {
    if (entry.match.test(name)) return entry.sprite;
  }

  // 1. CAVALRY (mounted units — should ride before they walk)
  if (/thunderwolf cavalry|wolf lord on thunder|wolf guard battle leader on thunder|harald deathwolf|canis wolfborn|logan grimnar on stormrider/i.test(name)) {
    return "cavalry-thunderwolf";
  }
  if (/nob on smasha|nob on warbike|warhog|squighog|seekers of slaanesh|skyweavers|reavers \(|hellions|stormboyz|invocatus/i.test(name)) {
    return "cavalry";
  }

  // 2. JETBIKE / FAST FLYING
  if (/jetbike|skyweavers|shining spear|dawneagle/i.test(name)) {
    return "vehicle-jetbike";
  }
  // 3. Bike-style ground units
  if (/\bbike\b|outrider|warbike|jakhal\b|wazdakka|deathwing knight bike/i.test(name)) {
    if (/outrider|invader/i.test(name)) return "vehicle-outrider";
    return "vehicle-bike";
  }

  // 4. FLYERS / AIRCRAFT
  if (/stormraven|stormhawk|stormtalon|valkyrie|thunderhawk|harpy|hive crone|razorwing|voidraven|heldrake/i.test(name)) {
    if (/stormraven|thunderhawk|valkyrie/i.test(name)) return "vehicle-dropship";
    return "vehicle-flyer";
  }
  if (/flyer|gunship|bomber|interceptor|storm speeder/i.test(name)) {
    return "vehicle-flyer";
  }

  // 5. KNIGHTS / TITANIC
  if (/\bknight (errant|paladin|crusader|gallant|warden|valiant|castellan|magaera|styrix|despoiler|rampager|tyrant|desecrator|abominant|preceptor)\b|cerastus|atrapos|war dog|armiger/i.test(name)) {
    return "vehicle-knight";
  }
  // 6. Big monsters / primarchs / titanic characters
  if (/titan|primarch|c'tan/i.test(name)) {
    return "monster-big";
  }
  if (/daemon prince/i.test(name)) {
    return "monster-daemon";
  }

  // 7. Walker-form heavy units
  if (/dreadnought|sentinel|wraith ?(lord|knight)|ironclad|brutalis|redemptor|ballistus|venerable|nemesis dreadknight|hellbrute|war walker/i.test(name)) {
    return "vehicle-dreadnought";
  }
  if (/kataphron|riptide|ghostkeel|stompa|crisis battlesuit|paragon warsuit|sydonian dragoon|ironstrider|stormsurge/i.test(name)) {
    return "vehicle-suit";
  }

  // 8. Big monstrous creatures (tyranid heavies, beasts, big xenos)
  if (/screamer-killer|mawloc|exocrine|trygon|haruspex|carnifex|psychophage|maleceptor|tervigon|norn (emissary|assimilator)|tyrannofex|tyrant guard/i.test(name)) {
    return "monster-tyranid";
  }
  if (/talos|cronos|mutalith|forgefiend|maulerfiend|defiler|kytan|soul grinder|spawn/i.test(name)) {
    return "monster-big";
  }

  // 9. Transports
  if (/land raider/i.test(name)) {
    return "vehicle-land-raider";
  }
  if (/battlewagon|trukk\b/i.test(name)) {
    return "vehicle-battlewagon";
  }
  if (/drukhari raider|^raider$|drukhari venom|^venom$|wave serpent|falcon|ghost ark/i.test(name)) {
    return "vehicle-raider";
  }
  if (/\b(rhino|razorback|repulsor|impulsor|chimera|skorpius dunerider|sagitaur|hekaton|goliath truck|sororitas rhino|chaos rhino|drop pod)\b/i.test(name)) {
    return "vehicle-transport";
  }

  // 10. Tanks
  if (/leman russ|tank commander|rogal dorn|hammerhead|sky ray|devilfish|piranha|vindicator|whirlwind|land speeder|skorpius disintegrator|onager|caladius|grav-tank|brokhyr land fortress|hekaton land/i.test(name)) {
    if (/leman russ|rogal dorn/i.test(name)) return "vehicle-heavy-tank";
    return "vehicle-tank";
  }
  if (/exorcist|castigator|immolator|predator|doomsday ark/i.test(name)) {
    return "vehicle-tank";
  }

  // 11. Terminator-style heavy elites
  if (/allarus/i.test(name)) {
    return "terminator-allarus";
  }
  if (/deathshroud|plague terminator/i.test(name)) {
    return "terminator-plague";
  }
  if (/terminator|wolf guard\b|paladin|aggressor|lychguard|deathwing knight|mega ?nob|tyrant guard|grey knight terminator/i.test(name)) {
    return "terminator";
  }
  // 12. Centurions
  if (/centurion/i.test(name)) {
    return "infantry-centurion";
  }
  // 13. Bladeguard, Sword Brethren, Sanguinary Guard
  if (/bladeguard|sword brethren/i.test(name)) {
    return "elite-bladeguard";
  }
  if (/sanguinary guard/i.test(name)) {
    return "elite-sanguinary";
  }
  if (/vanguard veteran|sternguard veteran|breachers \(|kataphron breach|paragon warsuit|hearthguard|einhyr/i.test(name)) {
    return "terminator";
  }
  // 14. Custodes / golden / saintly elites
  if (/custodian|custodes|wardens|aleya|valerian|triumph of saint/i.test(name)) {
    return "elite-gold";
  }
  // 15. Wraithguard / spirit constructs
  if (/wraithguard|wraithblade/i.test(name)) {
    return "elite-wraith";
  }
  // 16. Possessed / chaos warped
  if (/possessed|warpsmith|warp talon|obliterator|mutilator|repentia|lictor|deathleaper|raveners|tzaangor/i.test(name)) {
    return "elite-warped";
  }
  // 17. Eightbound / juggernauts
  if (/eightbound/i.test(name)) {
    return "elite-eightbound";
  }
  // 18. Aberrants
  if (/aberrant|abominant/i.test(name)) {
    return "elite-aberrant";
  }
  // 19. Incubi
  if (/incubi/i.test(name)) {
    return "elite-warped";
  }

  // 20. HQ — psyker variants
  if (role === "hq") {
    if (/sorcerer|librarian|psyker|farseer|warlock|magus|chief librarian|primaris psyker|primaris librarian|exalted sorcerer|technomancer|spiritseer|weirdboy|wurrboy|infernal master|tzaangor shaman/i.test(name)) {
      return "hq-psyker";
    }
    if (/chaplain|preacher|interrogator-chaplain|judiciar/i.test(name)) {
      return "hq-chaplain";
    }
    if (/inquisitor|coteaz|greyfax|draxus|tech-priest|technoarcheologist|biophagus|kelermorph|locus|nexos|reductus saboteur|primus|patriarch/i.test(name)) {
      return "hq-inquisitor";
    }
    if (/warboss|big mek|deffkilla|beastboss\b/i.test(name)) {
      return "hq-warboss";
    }
    if (/^necron lord|overlord|destroyer lord|catacomb command|chronomancer|technomancer|psychomancer|plasmancer|skorpekh lord/i.test(name)) {
      return "hq-necron-lord";
    }
    if (/commander|crisis commander|farsight|shadowsun|ethereal/i.test(name) && /\btau\b|battlesuit/i.test(name)) {
      return "hq-tau-commander";
    }
    return "hq-leader";
  }

  // 21. Faction-specific infantry recognition
  if (/\beldar\b|aeldari|guardian defenders|guardians \(|banshee|warp spider|swooping hawk|fire dragon|dark reaper|aspect|harlequin|striking scorpion|dire avenger/i.test(name)) {
    return "infantry-aspect";
  }
  if (/wracks|wyches|kabalite|scourges|mandrake|corsair/i.test(name)) {
    return "infantry-kabalite";
  }
  if (/genestealer|purestrain/i.test(name)) {
    return "infantry-genestealer";
  }
  if (/tyranid warriors|hormagaunt|termagant|gargoyle|neurogaunt|barbgaunt|ripper/i.test(name)) {
    if (squadSize >= 10) return "infantry-horde";
    return "infantry-tyranid";
  }
  if (/necron warrior|immortal|deathmark|flayed one|skorpekh|lychguard|triarch/i.test(name)) {
    return "infantry-necron";
  }
  if (/fire warrior|breacher team|pathfinder|kroot|stealth team/i.test(name) && !/battlesuit|crisis/i.test(name)) {
    return "infantry-tau";
  }
  if (/battle sister|seraphim|zephyrim|celestian|repentia|dominion|retributor|paragon warsuit/i.test(name)) {
    return "infantry-sororitas";
  }
  if (/skitarii|vanguard \(|rangers \(/i.test(name) && /skitarii|admech|adeptus mechanicus/i.test(name)) {
    return "infantry-skitarii";
  }
  // Standalone Skitarii vanguard/rangers
  if (/skitarii (vanguard|ranger)|^skitarii/i.test(name)) {
    return "infantry-skitarii";
  }
  if (/cultist|jakhal|gretchin|grot|neophyte hybrid|acolyte hybrid|brood brothers/i.test(name)) {
    if (squadSize >= 10) return "infantry-horde";
    return "infantry-cultist";
  }
  if (/\bboyz\b|^ork |\bork [a-z]|nobz \(|burna boy|stormboy|tankbusta|loota/i.test(name)) {
    if (/nobz\b|nob\b|mega/i.test(name)) return "infantry-ork-nob";
    return "infantry-ork-boy";
  }
  if (/ratlings|conscript|catachan|cadian|krieg|infantry squad|guardsmen/i.test(name)) {
    if (squadSize >= 10) return "infantry-horde";
    return "infantry-light";
  }
  if (/bloodletters|daemonettes|plaguebearers|pink horror|nurglings|fenrisian wolves|cyberwolves/i.test(name)) {
    return "infantry-cultist";
  }

  // 22. Marine variants by armor
  if (/intercessor|tactical squad|infiltrator|reiver|incursor|scout squad/i.test(name)) {
    if (/infiltrator|reiver|incursor|scout/i.test(name)) return "infantry-phobos";
    return "infantry-marine";
  }
  if (/heavy intercessor|gravis|inceptor|eradicator|hellblaster|aggressor|desolation squad/i.test(name)) {
    return "infantry-gravis";
  }
  if (/assault intercessor|jump pack|assault squad|inner circle|deathwing/i.test(name) && /jump|assault/i.test(name)) {
    return "infantry-jump";
  }

  // 23. Hordes for any big squad
  if (squadSize >= 10 && (role === "troops" || role === "fast")) {
    return "infantry-horde";
  }

  // 24. Defaults by role
  if (role === "heavy") return "vehicle-tank";
  if (role === "transport") return "vehicle-transport";
  if (role === "fast") return "vehicle-bike";
  return "infantry-marine";
}

// Render a sprite as SVG <rect> elements. cx,cy = center, size = total side length.
// baseColor = army.color (faction primary), accentColor = army.accent (faction trim).
// faction = optional faction name; if present, FACTION_PALETTES may override 1/2.
function renderSprite(archetype, cx, cy, size, baseColor, accentColor, faction) {
  const grid = SPRITES[archetype] || SPRITES["infantry-marine"];
  const pxSize = size / SPRITE_GRID;
  const startX = cx - size / 2;
  const startY = cy - size / 2;
  const elements = [];
  // Faction palette override (if present)
  const palette = FACTION_PALETTES[faction] || {};
  const colorMap = {
    "1": palette["1"] || baseColor,
    "2": palette["2"] || accentColor,
    "3": "#0a0604",
    "4": "#f5d76e",
    "5": "#a02020",
    "6": "#d4c5a0",
    "7": "#5a8b2a",
    "8": "#5470a0",
    "9": "#6b3a6b",
  };
  for (let row = 0; row < SPRITE_GRID; row++) {
    const line = grid[row] || ".".repeat(SPRITE_GRID);
    for (let col = 0; col < SPRITE_GRID; col++) {
      const ch = line[col];
      if (ch === "." || !ch) continue;
      const fill = colorMap[ch] || baseColor;
      elements.push({
        x: startX + col * pxSize,
        y: startY + row * pxSize,
        w: pxSize,
        h: pxSize,
        fill,
      });
    }
  }
  return elements;
}


// AI: pick best target — closest visible enemy, weighted by threat
// =====================================================================
// COMPETITIVE BATTLE SIM AI — heuristics from tournament-level play
// =====================================================================
//
// These are simplified versions of decisions that real competitive players make.
// They're not "AI playing like a pro" — they're heuristics inspired by what pros do.
//
// 1. OATH OF MOMENT (focus fire): Each side picks ONE high-priority enemy at the
//    start of its turn. Friendly units shooting that target get a priority bonus.
//    Concentrates damage instead of spreading it across many targets.
// 2. THREAT-WEIGHTED PRIORITY: Score targets by damage potential ÷ remaining wounds.
//    Wounded high-threat units score highest (we can finish them and remove their threat).
// 3. LATE-GAME SCORING: Turns 4-5, weight objective control much higher than killing.
//    Pros know that mathematical kill trades don't matter if you're losing primary score.
// 4. DURABILITY-AWARE BODY-BLOCKING: Tougher units (heavy/transport/elite) lead the
//    advance. Squishy HQs hang back to avoid being sniped.
// 5. STAY-IN-RANGE: Don't move out of optimal weapon range to chase objectives we
//    don't need.

// Pick the "Oath target" for this side's turn — a single high-value enemy unit
// to focus fire on. Picks the target that gives best value-per-effort:
// (its threat × remaining wounds fraction) ÷ (our nearest reach to it).
// =====================================================================
// AI PERSONALITIES
// =====================================================================
// Each side can run with one of three combat doctrines that subtly bias
// targeting and movement. The same dice math applies; only target/move
// preference shifts.
//
// AGGRESSIVE: rush forward, prioritize melee threats, ignore objectives early
// DEFENSIVE: hold ground, shoot from range, prioritize survival, score steadily
// BALANCED:  the current behavior — mix of engage + score
//
// In the React component a user can pick a personality per side; default
// is "balanced" for both.
const AI_PERSONALITIES = {
  balanced: {
    label: "Balanced",
    description: "Mixed doctrine — engages threats while securing objectives.",
    aggressionMod: 1.0,    // multiplier on "go fight stuff" instinct
    objectiveMod: 1.0,     // multiplier on "go score" instinct
    finishBonusMod: 1.0,   // multiplier on bonus for killing a wounded target
    rangePref: 1.0,        // 1.0 = no preference, >1 = prefer long range, <1 = close
  },
  aggressive: {
    label: "Aggressive",
    description: "Lunatic-warrior doctrine — closes distance and dismantles enemies first, scores second.",
    aggressionMod: 1.7,
    objectiveMod: 0.6,
    finishBonusMod: 1.4,
    rangePref: 0.7,
  },
  defensive: {
    label: "Defensive",
    description: "Castled-up doctrine — holds objectives, shoots from range, avoids melee whenever possible.",
    aggressionMod: 0.5,
    objectiveMod: 1.6,
    finishBonusMod: 0.9,
    rangePref: 1.4,
  },
};

function pickOathTarget(myUnits, enemyUnits, personality) {
  const live = enemyUnits.filter((e) => !e.destroyed);
  if (live.length === 0) return null;
  const p = AI_PERSONALITIES[personality] || AI_PERSONALITIES.balanced;
  let best = null;
  let bestScore = -Infinity;
  for (const e of live) {
    // Threat = combined damage output
    const threat = (e.shooting || 0) + (e.melee || 0) + (e.attacks || 0);
    // Value = points cost (higher value = bigger payoff for killing)
    const value = e.points || 50;
    // Wounded scaling: a unit at 30% HP is much easier to kill than at 100%
    const woundFrac = e.maxWounds > 0 ? e.currentWounds / e.maxWounds : 1;
    // Aggressive players love wounded high-threat targets;
    // defensive players prefer killing the safe-to-engage stuff
    const baseScore = (threat * 2 * p.aggressionMod) + (value / 20) - (woundFrac * 30 * p.finishBonusMod);
    const closest = myUnits
        .filter((u) => !u.destroyed)
        .reduce((min, u) => Math.min(min, distance(u, e)), 999);
    const reachPenalty = closest > 24 ? (closest - 24) / 4 : 0;
    const score = baseScore - reachPenalty;
    if (score > bestScore) { bestScore = score; best = e; }
  }
  return best;
}

// Smarter target selection: threat-weighted, with Oath-of-Moment focus-fire bonus
function pickShootTarget(unit, enemies, oathTarget, turn, totalTurns, personality) {
  const live = enemies.filter((e) => !e.destroyed);
  if (live.length === 0) return null;
  const p = AI_PERSONALITIES[personality] || AI_PERSONALITIES.balanced;
  let best = null;
  let bestScore = -Infinity;
  const inLateGame = turn >= Math.max(4, totalTurns - 1);
  for (const e of live) {
    const d = distance(unit, e);
    if (d > unit.range) continue;
    // Base value: enemy points + threat output
    const threat = (e.shooting || 0) + (e.melee || 0);
    const valueScore = (e.points || 50) / 20 + threat * 0.8 * p.aggressionMod;
    // Finish bonus: heavy bonus if our shots can plausibly kill it this turn
    const expectedDamage = unit.shooting * 2;
    const finishBonus = (expectedDamage >= e.currentWounds ? 12 : 0) * p.finishBonusMod;
    // Oath of moment: huge bonus for shooting the focused target
    const oathBonus = (oathTarget && e === oathTarget) ? 8 : 0;
    // Don't dribble damage onto already-low targets if we have other options
    const overkillPenalty = expectedDamage > e.currentWounds * 3 ? 4 : 0;
    // Distance: defensive AI prefers far targets (snipe), aggressive prefers close
    const distancePenalty = (d / 12) * p.rangePref;
    // Late-game: stop chasing wounded weak stuff, just pick highest-value
    const lateBoost = inLateGame ? valueScore * 0.5 : 0;
    const score = valueScore + finishBonus + oathBonus + lateBoost - distancePenalty - overkillPenalty;
    if (score > bestScore) { bestScore = score; best = e; }
  }
  return best;
}

// Smarter movement: durability-aware, late-game scoring switch
function pickMoveTarget(unit, objectives, allUnits, turn, totalTurns, personality) {
  let best = null;
  let bestScore = -Infinity;
  const p = AI_PERSONALITIES[personality] || AI_PERSONALITIES.balanced;
  const inLateGame = turn >= Math.max(4, totalTurns - 1);
  // Soft characters (HQs at low durability) should hang back
  const isSoft = unit.role === "hq" && unit.maxWounds < 8;
  for (const o of objectives) {
    const d = distance(unit, o);
    const friends = allUnits.filter((u) => !u.destroyed && u.side === unit.side && distance(u, o) < 4).length;
    const enemies = allUnits.filter((u) => !u.destroyed && u.side !== unit.side && distance(u, o) < 4).length;
    // Prefer uncontested or contested-by-enemy objectives
    // Defensive AI weights friend-count negatively less (likes to clump up safely);
    // aggressive AI loves enemy presence (combat opportunity)
    let score = (-d / 5) * (1 / p.objectiveMod) + (enemies * 3 * p.aggressionMod) - (friends * 2 * (p.objectiveMod / 1.5));
    if (inLateGame) score += (6 - friends) * p.objectiveMod;
    if (isSoft) score -= enemies * 4;
    if (unit.role === "heavy" || unit.role === "transport") score += enemies * 2 * p.aggressionMod;
    if (score > bestScore) { bestScore = score; best = o; }
  }
  return best;
}

// =====================================================================
// PROPER 40K DICE MATHS
// =====================================================================
// In real 40k, each attack goes through five steps:
//   1. Hit roll: 1d6, hit on >= BS (shooting) or WS (melee). 1 always misses.
//   2. Wound roll: based on Strength vs Toughness.
//      S = 2T → 6+. S < T → 5+. S = T → 4+. S > T → 3+. S >= 2T → 2+.
//   3. Save: 1d6, target saves on >= (Sv + AP). Invuln save replaces if better.
//   4. Damage: weapon deals D damage per failed save.
//   5. Feel No Pain (if any): 1d6 per damage point; on FNP+ ignore that point.
// We simulate this as expected values rather than per-die rolls, but we keep
// the granularity high enough for "real" results: when an HQ shoots a tank, the
// actual S vs T matters; AP vs Sv matters; Invuln matters; FNP matters.

// rolling 1d6 -> probability of >= n
function probGTE(n) {
  if (n <= 1) return 6 / 6;       // 1+ -> always passes (but 1 always fails to hit)
  if (n >= 7) return 0;
  return (7 - n) / 6;
}

// Standard wound roll: S vs T -> probability of wounding
function woundProbability(S, T) {
  if (S >= 2 * T) return probGTE(2);   // 2+
  if (S > T)      return probGTE(3);   // 3+
  if (S === T)    return probGTE(4);   // 4+
  if (S * 2 <= T) return probGTE(6);   // 6+
  return probGTE(5);                   // 5+
}

// Save: best of (armor + AP) and invuln. Save passes -> attack ignored.
function saveProbability(Sv, AP, Iv) {
  // Modified save = Sv - AP (worse). If invuln is better, use that.
  const modifiedSv = Sv + AP;       // higher is worse to make
  const armorPass = probGTE(modifiedSv);
  const invulnPass = Iv > 0 ? probGTE(Iv) : 0;
  return Math.max(armorPass, invulnPass);
}

// Roll 1d6 (returns 1..6) using rng
function d6(rng) { return Math.floor(rng() * 6) + 1; }
// Roll 2d6
function twoD6(rng) { return d6(rng) + d6(rng); }
// Roll 3d6 take highest 2 (charge re-roll mechanic)
function chargeRoll(rng, rerollAvailable) {
  let r = twoD6(rng);
  if (rerollAvailable && r < 7) r = twoD6(rng);
  return r;
}

// =====================================================================
// LINE OF SIGHT — ray-cast vs terrain pieces
// =====================================================================
// Two units have LoS if no LoS-blocking terrain piece's bounding box
// intersects the line between them. Units inside cover terrain still see
// out and are seen, but with cover save bonus.
function hasLineOfSight(a, b, terrain) {
  for (const t of terrain) {
    if (!t.blocksLOS) continue;
    // Skip terrain pieces that contain either endpoint (can shoot from inside)
    const aIn = a.x >= t.x && a.x <= t.x + t.w && a.y >= t.y && a.y <= t.y + t.h;
    const bIn = b.x >= t.x && b.x <= t.x + t.w && b.y >= t.y && b.y <= t.y + t.h;
    if (aIn || bIn) continue;
    // Line-rectangle intersection: check if segment from a to b crosses bbox
    if (segmentIntersectsRect(a.x, a.y, b.x, b.y, t.x, t.y, t.x + t.w, t.y + t.h)) {
      return false;
    }
  }
  return true;
}

// Liang-Barsky line-clip-style rect intersection
function segmentIntersectsRect(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
  // If both endpoints are on the same side outside, no intersection
  if ((x1 < rx1 && x2 < rx1) || (x1 > rx2 && x2 > rx2)) return false;
  if ((y1 < ry1 && y2 < ry1) || (y1 > ry2 && y2 > ry2)) return false;
  // Otherwise, do parametric clip
  const dx = x2 - x1, dy = y2 - y1;
  let tmin = 0, tmax = 1;
  const checks = [
    { p: -dx, q: x1 - rx1 },
    { p:  dx, q: rx2 - x1 },
    { p: -dy, q: y1 - ry1 },
    { p:  dy, q: ry2 - y1 },
  ];
  for (const c of checks) {
    if (c.p === 0 && c.q < 0) return false;
    if (c.p !== 0) {
      const t = c.q / c.p;
      if (c.p < 0) { if (t > tmax) return false; if (t > tmin) tmin = t; }
      else        { if (t < tmin) return false; if (t < tmax) tmax = t; }
    }
  }
  return tmin <= tmax;
}

// Whether a unit is inside any terrain piece (gets cover bonus)
function unitInCover(unit, terrain) {
  for (const t of terrain) {
    if (t.coverBonus > 0 &&
        unit.x >= t.x && unit.x <= t.x + t.w &&
        unit.y >= t.y && unit.y <= t.y + t.h) {
      return t;
    }
  }
  return null;
}

// =====================================================================
// SHOOTING: full 40k attack sequence
// =====================================================================
// Returns { hits, wounds, dmg, saves, fnp, narrate }: each step's results
// for use in the battle log.
function resolveShooting(rng, attacker, target, terrain, modifiers = {}) {
  const A = attacker.stats;
  const D = target.stats;
  if (!A || !D) {
    // Fallback to legacy abstract resolution
    const hitRoll = attacker.shooting * (0.5 + rng() * 0.5);
    const w = Math.max(0, Math.floor(hitRoll * (1 - (target.armor - 2) * 0.15)));
    return { hits: 0, wounds: 0, dmg: Math.min(w, target.currentWounds), saves: 0, fnp: 0, narrate: `legacy ${w} dmg` };
  }
  // Total shots = (rangedShots per model) × (current model count)
  // Simulate "rapid fire" — at half range, troop weapons get +1 shot
  const dist = distance(attacker, target);
  const isRapidFireRange = dist <= A.rangedRange / 2;
  const shotsPerModel = A.rangedShots + (isRapidFireRange && /troops|hq/.test(attacker.role) ? 1 : 0);
  const totalShots = Math.max(1, shotsPerModel * Math.max(1, attacker.modelCount));
  // BS, modified by status
  let BS = A.BS;
  if (modifiers.smokescreen) BS += 1;          // -1 to hit (worse roll needed)
  if (attacker.advanced)     BS += 1;          // moved-and-fired penalty for heavy weapons
  if (attacker.battleShocked) BS += 1;         // battle-shocked = worse hits
  // Hit roll: # of shots that hit
  const hitProb = probGTE(BS);
  let expectedHits = totalShots * hitProb;
  // Re-roll modifier: re-roll all 1s = (1/6) of misses become hits
  // Approximation: re-rolling failed hits roughly squares the hit rate
  if (modifiers.rerollHits) {
    const failProb = 1 - hitProb;
    const recoveredHits = totalShots * failProb * hitProb;   // re-roll misses, hit at hitProb again
    expectedHits += recoveredHits;
  }
  // Use stochastic — distribute around expected, with small jitter
  const hits = Math.max(0, Math.round(expectedHits + (rng() - 0.5) * Math.sqrt(expectedHits)));
  if (hits === 0) {
    return { hits: 0, wounds: 0, saves: 0, dmg: 0, fnp: 0, totalShots, narrate: `${totalShots} shots, all missed (BS${BS}+)` };
  }
  // Wound roll
  const wp = woundProbability(A.rangedS, D.T);
  const expectedWounds = hits * wp;
  const wounds = Math.max(0, Math.round(expectedWounds + (rng() - 0.5) * Math.sqrt(expectedWounds)));
  if (wounds === 0) {
    return { hits, wounds: 0, saves: 0, dmg: 0, fnp: 0, totalShots, narrate: `${hits}/${totalShots} hit, none wounded (S${A.rangedS} vs T${D.T})` };
  }
  // Save roll — apply cover and Armour of Contempt
  const cover = unitInCover(target, terrain);
  let coverMod = cover ? 1 : 0;
  if (modifiers.armourOfContempt) coverMod += 1;
  let modAP = Math.max(0, A.rangedAP - coverMod);
  const sp = saveProbability(D.Sv, modAP, D.Iv);
  const expectedFails = wounds * (1 - sp);
  const fails = Math.max(0, Math.round(expectedFails + (rng() - 0.5) * Math.sqrt(expectedFails)));
  const saves = wounds - fails;
  // Damage: each failed save deals rangedDmg, modified by FNP
  let totalDmg = fails * A.rangedDmg;
  let fnpIgnored = 0;
  if (D.FNP > 0 && totalDmg > 0) {
    const fnpProb = probGTE(D.FNP);
    fnpIgnored = Math.round(totalDmg * fnpProb);
    totalDmg = Math.max(0, totalDmg - fnpIgnored);
  }
  totalDmg = Math.min(totalDmg, target.currentWounds);
  const narrate = `${hits}/${totalShots} hit · ${wounds} wounds (S${A.rangedS}vT${D.T}) · ${saves} saved (Sv${D.Sv}+${modAP > 0 ? `−AP${modAP}` : ""})${cover ? " [cover]" : ""}${fnpIgnored ? ` · ${fnpIgnored} FNP'd` : ""} · ${totalDmg} dmg`;
  return { hits, wounds, saves, dmg: totalDmg, fnp: fnpIgnored, totalShots, narrate };
}

// =====================================================================
// MELEE: full 40k attack sequence including counter-attack
// =====================================================================
function resolveMelee(rng, attacker, target, modifiers = {}) {
  const A = attacker.stats;
  const D = target.stats;
  if (!A || !D) {
    // Fallback
    const hits = attacker.melee * (0.5 + rng() * 0.5);
    const w = Math.max(0, Math.floor(hits * (1 - (target.armor - 2) * 0.1)));
    const counterHits = target.melee * (0.4 + rng() * 0.5);
    const counterWounds = Math.max(0, Math.floor(counterHits * (1 - (attacker.armor - 2) * 0.1)));
    return { dealt: Math.min(w, target.currentWounds), taken: Math.min(counterWounds, attacker.currentWounds), narrate: "legacy melee" };
  }
  // Each model swings AT attacks
  const totalAttacks = Math.max(1, A.AT * Math.max(1, attacker.modelCount));
  let WS = A.WS;
  if (modifiers.chargeBonus) WS = Math.max(2, WS - 1);    // not really WS reduction in 10e but stand-in
  if (attacker.battleShocked) WS += 1;
  const hp = probGTE(WS);
  const hits = Math.max(0, Math.round(totalAttacks * hp + (rng() - 0.5) * Math.sqrt(totalAttacks * hp)));
  // Wound
  let meleeS = A.meleeS;
  if (modifiers.chargeBonus) meleeS += 1;       // sons of sanguinius / charging bonus
  if (modifiers.lethalHits)  /* approximation: nat-6 hits auto-wound = +bonus */ {}
  const wp = woundProbability(meleeS, D.T);
  const wounds = Math.max(0, Math.round(hits * wp + (rng() - 0.5) * Math.sqrt(hits * wp)));
  // Save (no cover in melee unless wall fortification)
  let modAP = A.meleeAP;
  if (modifiers.armourOfContempt) modAP = Math.max(0, modAP - 1);
  const sp = saveProbability(D.Sv, modAP, D.Iv);
  const fails = Math.max(0, Math.round(wounds * (1 - sp) + (rng() - 0.5) * Math.sqrt(wounds * (1 - sp))));
  let dealt = fails * A.meleeDmg;
  let dealtFNP = 0;
  if (D.FNP > 0 && dealt > 0) {
    dealtFNP = Math.round(dealt * probGTE(D.FNP));
    dealt = Math.max(0, dealt - dealtFNP);
  }
  dealt = Math.min(dealt, target.currentWounds);

  // Counter-attack: target swings back (unless it Strikes Last from being charged)
  const targetAttacks = Math.max(1, D.AT * Math.max(1, target.modelCount));
  const counterHP = probGTE(D.WS);
  const counterHits = Math.max(0, Math.round(targetAttacks * counterHP + (rng() - 0.5) * Math.sqrt(targetAttacks * counterHP)));
  const counterWP = woundProbability(D.meleeS, A.T);
  const counterWounds = Math.max(0, Math.round(counterHits * counterWP + (rng() - 0.5) * Math.sqrt(counterHits * counterWP)));
  const counterSP = saveProbability(A.Sv, D.meleeAP, A.Iv);
  const counterFails = Math.max(0, Math.round(counterWounds * (1 - counterSP) + (rng() - 0.5) * Math.sqrt(counterWounds * (1 - counterSP))));
  let taken = counterFails * D.meleeDmg;
  if (A.FNP > 0 && taken > 0) taken = Math.max(0, Math.round(taken * (1 - probGTE(A.FNP))));
  taken = Math.min(taken, attacker.currentWounds);

  const narrate = `${attacker.modelCount} models × ${A.AT} attacks: ${hits} hits, ${wounds} wounds (S${meleeS}vT${D.T}), ${fails} unsaved → ${dealt} dmg | counter ${counterHits}h/${counterFails}w → ${taken} dmg`;
  return { dealt, taken, narrate };
}

function applyDamage(unit, dmg) {
  unit.currentWounds = Math.max(0, unit.currentWounds - dmg);
  // Recompute model count proportionally
  unit.modelCount = Math.max(0, Math.ceil((unit.currentWounds / unit.maxWounds) * unit.maxModels));
  unit.woundsThisTurn = (unit.woundsThisTurn || 0) + dmg;
  if (unit.currentWounds === 0) {
    unit.destroyed = true;
    unit.modelCount = 0;
  }
}

// =====================================================================
// OBJECTIVE SCORING — proper "Take and Hold" primary mechanic
// =====================================================================
// Each turn (for a single side), score based on objectives held.
// "Held" = your unit's combined OC > enemy's combined OC within 3" of objective.
// Cap at 15 VP per turn (45 max from primary across game).
function scoreObjectives(units, objectives, side) {
  let score = 0;
  let held = 0;
  for (const o of objectives) {
    const friends = units.filter((u) => !u.destroyed && u.side === side && distance(u, o) < 3.5);
    const enemies = units.filter((u) => !u.destroyed && u.side !== side && distance(u, o) < 3.5);
    const friendOC = friends.reduce((s, u) => s + (u.stats?.OC || 1) * u.modelCount, 0);
    const enemyOC = enemies.reduce((s, u) => s + (u.stats?.OC || 1) * u.modelCount, 0);
    if (friendOC > enemyOC) {
      score += 5;
      held++;
      o.holder = side;
    }
  }
  return { score: Math.min(15, score), held };
}

// =====================================================================
// MOVEMENT — toward target, with cover/terrain-aware micro-adjustments
// =====================================================================
function moveToward(unit, target, terrain, allUnits) {
  if (!target) return;
  const d = distance(unit, target);
  if (d < 0.1) return;
  const moveDist = Math.min(unit.move || unit.stats?.M || 6, d);
  const dx = ((target.x - unit.x) / d) * moveDist;
  const dy = ((target.y - unit.y) / d) * moveDist;
  const newX = unit.x + dx;
  const newY = unit.y + dy;
  // Avoid stacking on top of other units (simple repulsion)
  const collision = allUnits.find((u) => u !== unit && !u.destroyed && Math.abs(u.x - newX) < 1 && Math.abs(u.y - newY) < 1);
  if (collision) {
    unit.x = newX + (Math.random() - 0.5) * 1.5;
    unit.y = newY + (Math.random() - 0.5) * 1.5;
  } else {
    unit.x = newX;
    unit.y = newY;
  }
}

// =====================================================================
// BATTLE-SHOCK: morale check when squad drops below half strength.
// Failed test = unit loses OC (counts as 0) and can't use stratagems.
// =====================================================================
function checkBattleShock(rng, unit, allUnits) {
  if (!unit.stats || unit.battleShocked) return false;
  // Trigger: < 50% wounds remaining
  if (unit.currentWounds <= unit.maxWounds * 0.5) {
    // Synapse-led tyranids ignore battle shock
    if (unit.keywords && unit.keywords.includes("SYNAPSE")) return false;
    const synapseAlly = allUnits.find((u) => !u.destroyed && u.side === unit.side &&
        u.keywords && u.keywords.includes("SYNAPSE") && distance(u, unit) <= 6);
    if (synapseAlly) return false;
    // Roll 2d6 vs Ld
    const r = twoD6(rng);
    if (r > unit.stats.Ld) {
      unit.battleShocked = true;
      return true;
    }
  }
  return false;
}

// =====================================================================
// MAIN BATTLE SIMULATION (v10 — full 40k phase structure)
// =====================================================================
// Each turn follows the proper Warhammer 40k phase order:
//   1. COMMAND — gain CP, recover battle-shock, declare Oath/army-rule choices
//   2. MOVEMENT — units move (Normal, Advance, Fall Back) and reserves arrive
//   3. SHOOTING — units shoot (cannot if Advanced w/o Assault, cannot if Fell Back)
//   4. CHARGE — declare charges, 2d6 vs distance, Heroic Intervention reactions
//   5. FIGHT — engaged units fight in initiative order (charge bonus + counter)
// At end of each turn: scoring (primary + secondary), kill bookkeeping.
// CP refresh: +1 per turn, max 6 stored.
function simulateBattle(armyLeft, armyRight, formatName, seed, options = {}) {
  const fmt = FORMATS[formatName] || FORMATS["Strike Force"];
  const rng = makeRng(seed);

  // AI personality per side (defaults to "balanced")
  const leftPersonality  = options.leftPersonality  || "balanced";
  const rightPersonality = options.rightPersonality || "balanced";

  // ============== SETUP ==============
  const terrain = generateTerrain(rng, fmt.width, fmt.height);
  const objectives = generateObjectives(rng, fmt.width, fmt.height);

  // Pick mission + secondaries from the proper deck
  const primary = PRIMARY_MISSIONS[Math.floor(rng() * PRIMARY_MISSIONS.length)];
  // Each side rolls 2 unique secondaries
  const sec = [...SECONDARIES];
  const drawSec = () => sec.splice(Math.floor(rng() * sec.length), 1)[0];
  const leftSecondaries = [drawSec(), drawSec()];
  const rightSecondaries = [drawSec(), drawSec()];

  // Deploy with proper deployment zones (forwarding fmt for zone depth)
  let leftUnits  = deployArmy(armyLeft,  "left",  fmt.width, fmt.height, rng, fmt);
  let rightUnits = deployArmy(armyRight, "right", fmt.width, fmt.height, rng, fmt);
  const allUnits = [...leftUnits, ...rightUnits];

  // Detachment army rules (looked up by faction)
  const leftRule  = DETACHMENT_RULES[armyLeft.faction]  || { name: "Standard Doctrine", desc: "Generic Imperial/Xenos rules" };
  const rightRule = DETACHMENT_RULES[armyRight.faction] || { name: "Standard Doctrine", desc: "Generic Imperial/Xenos rules" };

  // CP pools (start at fmt.cpStart, gain +1 per Command phase, max 6 stored)
  const cp = { left: fmt.cpStart, right: fmt.cpStart };

  // Per-side bookkeeping for secondaries / kill counts
  const sideState = {
    left:  { kills: 0, vehicleKills: 0, monsterKills: 0, characterKills: 0, secondaryVP: 0, primaryVP: 0, oathTarget: null, killsThisTurn: 0, totalKills: 0 },
    right: { kills: 0, vehicleKills: 0, monsterKills: 0, characterKills: 0, secondaryVP: 0, primaryVP: 0, oathTarget: null, killsThisTurn: 0, totalKills: 0 },
  };

  const frames = [];
  const log = [];

  // ============== DEPLOYMENT FRAME ==============
  log.push({ turn: 0, type: "header", text: `═══════ ${formatName.toUpperCase()} · ${fmt.points}pts ═══════` });
  log.push({ turn: 0, type: "info",   text: `Battlefield: ${fmt.width}″ × ${fmt.height}″ · ${fmt.turns} battle rounds · ${terrain.length} terrain pieces, ${objectives.length} objectives` });
  log.push({ turn: 0, type: "info",   text: `▣ Primary mission: ${primary.name} — ${primary.desc}` });
  log.push({ turn: 0, type: "header", text: `── DEPLOYMENT ──` });
  log.push({ turn: 0, type: "info",   text: `LEFT: ${armyLeft.faction} · ${leftUnits.filter(u => !u.inReserve).length} units on the table${leftUnits.filter(u => u.inReserve).length ? `, ${leftUnits.filter(u => u.inReserve).length} in Reserves` : ""}` });
  log.push({ turn: 0, type: "info",   text: `▶ Detachment rule (LEFT): ${leftRule.name} — ${leftRule.desc}` });
  log.push({ turn: 0, type: "info",   text: `▶ Secondaries (LEFT): ${leftSecondaries.map(s => s.name).join(" · ")}` });
  log.push({ turn: 0, type: "info",   text: `RIGHT: ${armyRight.faction} · ${rightUnits.filter(u => !u.inReserve).length} units on the table${rightUnits.filter(u => u.inReserve).length ? `, ${rightUnits.filter(u => u.inReserve).length} in Reserves` : ""}` });
  log.push({ turn: 0, type: "info",   text: `▶ Detachment rule (RIGHT): ${rightRule.name} — ${rightRule.desc}` });
  log.push({ turn: 0, type: "info",   text: `▶ Secondaries (RIGHT): ${rightSecondaries.map(s => s.name).join(" · ")}` });
  // Mention scouts deployed forward
  const leftScouts  = leftUnits.filter(u => u.keywords?.includes("SCOUT") && !u.inReserve);
  const rightScouts = rightUnits.filter(u => u.keywords?.includes("SCOUT") && !u.inReserve);
  if (leftScouts.length)  log.push({ turn: 0, type: "info", text: `   ↳ Scout move: ${leftScouts.map(u => u.name).join(", ")} deploy forward` });
  if (rightScouts.length) log.push({ turn: 0, type: "info", text: `   ↳ Scout move: ${rightScouts.map(u => u.name).join(", ")} deploy forward` });
  frames.push({
    turn: 0, phase: "Deployment",
    units: allUnits.filter(u => !u.inReserve).map(u => ({ ...u })),
    objectives: objectives.map(o => ({ ...o })),
    leftScore: 0, rightScore: 0,
    annotations: [],
  });

  // ============== TURN LOOP ==============
  for (let turn = 1; turn <= fmt.turns; turn++) {
    log.push({ turn, type: "header", text: `═══════════════ BATTLE ROUND ${turn} ═══════════════` });

    for (const side of ["left", "right"]) {
      const otherSide = side === "left" ? "right" : "left";
      const myUnits    = allUnits.filter(u => u.side === side && !u.destroyed && !u.inReserve);
      const enemyUnits = allUnits.filter(u => u.side !== side && !u.destroyed && !u.inReserve);
      const sideName = side === "left" ? "LEFT" : "RIGHT";
      const armyData = side === "left" ? armyLeft : armyRight;
      const ruleData = side === "left" ? leftRule : rightRule;
      const annotations = [];   // per-frame visual annotations (oath markers, charge lines, etc.)

      // ============== COMMAND PHASE ==============
      log.push({ turn, type: "phase", text: `▼ ${sideName} · COMMAND PHASE — gain Command Points, declare army-rule effects` });
      // 1. Gain CP
      cp[side] = Math.min(6, cp[side] + 1);
      log.push({ turn, type: "info", text: `   CP: +1 → ${cp[side]}/6 (${ruleData.name} active)` });

      // 2. Battle-shock recovery — shocked units roll Ld, recover on success
      for (const u of myUnits) {
        if (u.battleShocked) {
          const r = twoD6(rng);
          if (r <= (u.stats?.Ld || 7)) {
            u.battleShocked = false;
            log.push({ turn, type: "info", text: `   ${u.name} rallies (Ld test ${r} vs ${u.stats.Ld}) — battle-shock cleared` });
          }
        }
      }

      // 3. Pick Oath of Moment / equivalent focus-fire target (army-rule abstraction)
      const personality = side === "left" ? leftPersonality : rightPersonality;
      const oathTarget = pickOathTarget(myUnits, enemyUnits, personality);
      sideState[side].oathTarget = oathTarget?.uid || null;
      if (oathTarget) {
        log.push({ turn, type: "oath", text: `   ✦ Oath of Moment: ${sideName} swears to destroy ${oathTarget.name} this turn` });
        annotations.push({ type: "oath", x: oathTarget.x, y: oathTarget.y, side, label: "OATH" });
      }

      // Reset per-turn bookkeeping
      sideState[side].killsThisTurn = 0;
      myUnits.forEach(u => { u.advanced = false; u.fellBack = false; u.woundsThisTurn = 0; });

      frames.push({ turn, phase: `${side === "left" ? "L" : "R"} Command`, units: allUnits.filter(u => !u.destroyed && !u.inReserve).map(u => ({ ...u })), objectives: objectives.map(o => ({ ...o })), leftScore: sideState.left.primaryVP + sideState.left.secondaryVP, rightScore: sideState.right.primaryVP + sideState.right.secondaryVP, annotations: [...annotations] });

      // ============== RESERVES ARRIVAL ==============
      // From turn 2 onward, reserve units may arrive (50% chance for tactical timing)
      if (turn >= 2) {
        const reserveUnits = allUnits.filter(u => u.side === side && u.inReserve && !u.destroyed);
        for (const ru of reserveUnits) {
          // 50% chance per turn after T2; guaranteed T3
          if (turn >= 3 || rng() > 0.5) {
            ru.inReserve = false;
            // Drop in 9" from any enemy edge (real GW deep strike rule)
            // For sim purposes, drop near a contested objective
            const target = objectives[Math.floor(rng() * objectives.length)];
            ru.x = target.x + (rng() - 0.5) * 4;
            ru.y = target.y + (rng() - 0.5) * 4;
            log.push({ turn, type: "info", text: `   ↡ Deep Strike: ${ru.name} arrives from reserves at ${target.label}` });
            annotations.push({ type: "deepstrike", x: ru.x, y: ru.y, side, label: "↡" });
          }
        }
      }

      // ============== MOVEMENT PHASE ==============
      log.push({ turn, type: "phase", text: `▼ ${sideName} · MOVEMENT PHASE — units reposition (Normal, Advance, Fall Back)` });
      for (const unit of myUnits) {
        // If engaged in melee, must Fall Back to move (no shooting/charging this turn)
        const inEngagement = enemyUnits.some(e => distance(unit, e) < 1.5);
        if (inEngagement) {
          // Fall back? AI choice — only if low health or low-melee unit
          if (unit.currentWounds < unit.maxWounds * 0.4 || (unit.stats?.AT || 1) <= 2) {
            unit.fellBack = true;
            // Move directly away from nearest enemy
            const nearestEnemy = enemyUnits.reduce((closest, e) => distance(unit, e) < distance(unit, closest) ? e : closest, enemyUnits[0]);
            const dx = unit.x - nearestEnemy.x, dy = unit.y - nearestEnemy.y;
            const d = Math.sqrt(dx*dx + dy*dy) || 1;
            unit.x += (dx / d) * (unit.stats?.M || 6);
            unit.y += (dy / d) * (unit.stats?.M || 6);
            log.push({ turn, type: "move", text: `   ${unit.name} Falls Back from melee — cannot shoot/charge this turn` });
            continue;
          }
          // Otherwise, stay engaged (will fight in Fight phase)
          continue;
        }
        const target = pickMoveTarget(unit, objectives, allUnits, turn, fmt.turns, personality);
        const distBefore = target ? distance(unit, target) : 0;
        moveToward(unit, target, terrain, allUnits);
        // Track Advance (used full move + extra)
        if (target && distance(unit, target) > distBefore - (unit.stats?.M || 6) - 1) {
          // didn't quite reach — could attempt advance roll
          if (distBefore > (unit.stats?.M || 6) && rng() > 0.6) {
            const advRoll = d6(rng);
            unit.x += (target.x - unit.x) * (advRoll / 12);
            unit.y += (target.y - unit.y) * (advRoll / 12);
            unit.advanced = true;
            log.push({ turn, type: "move", text: `   ${unit.name} Advances (+${advRoll}″) — heavy weapons take −1 to hit this turn` });
          }
        }
      }
      frames.push({ turn, phase: `${side === "left" ? "L" : "R"} Movement`, units: allUnits.filter(u => !u.destroyed && !u.inReserve).map(u => ({ ...u })), objectives: objectives.map(o => ({ ...o })), leftScore: sideState.left.primaryVP + sideState.left.secondaryVP, rightScore: sideState.right.primaryVP + sideState.right.secondaryVP, annotations: [...annotations] });

      // ============== SHOOTING PHASE ==============
      log.push({ turn, type: "phase", text: `▼ ${sideName} · SHOOTING PHASE — eligible units fire (engaged units cannot shoot enemies they're not in melee with)` });
      // CP spending budget for this phase — reserve at least 1 CP for charge/fight if possible
      const phaseStartCP = cp[side];
      for (const unit of myUnits) {
        if (unit.destroyed || unit.fellBack) continue;
        // Engaged units can only shoot units they're in engagement with (rare; skip for sim)
        const inEngagement = enemyUnits.some(e => distance(unit, e) < 1.5);
        if (inEngagement) continue;
        const tgt = pickShootTarget(unit, enemyUnits, oathTarget, turn, fmt.turns, personality);
        if (!tgt) continue;
        // Check LoS
        if (!hasLineOfSight(unit, tgt, terrain)) {
          // Indirect fire (rare) — assume 50% of heavy units have it (Whirlwind, Manticore, etc.)
          if (unit.role !== "heavy" || rng() > 0.5) continue;
          log.push({ turn, type: "info", text: `   ↳ ${unit.name} fires Indirect at ${tgt.name} (no LoS, −1 BS)` });
        }
        // Apply Oath of Moment bonus (re-roll wounds vs oath target)
        const isOathTarget = oathTarget && tgt.uid === oathTarget.uid;
        // STRATAGEM AI: spend CP on Re-roll if attacker is high-value, target is key, or both
        const stratModifiers = {};
        const targetIsHighValue = isOathTarget || tgt.keywords?.includes("CHARACTER") || tgt.keywords?.includes("MONSTER") || (tgt.keywords?.includes("VEHICLE") && tgt.points > 150);
        const attackerIsKey = unit.stats?.rangedDmg >= 2 || unit.role === "heavy" || unit.role === "hq";
        // Spend CP if (high-value target AND key attacker) OR (oath shot AND any attacker), 30-60% chance
        const shouldStrat = (targetIsHighValue && attackerIsKey && rng() > 0.55) || (isOathTarget && rng() > 0.55);
        if (cp[side] >= 1 && shouldStrat) {
          cp[side] -= 1;
          stratModifiers.rerollHits = true;
          log.push({ turn, type: "info", text: `   ☆ Stratagem [Fire Discipline, 1CP]: ${unit.name} re-rolls hits vs ${tgt.name} (CP ${cp[side]}/6)` });
        }
        // Modifiers: smokescreen on target may apply (rare); cover handled in resolve
        const result = resolveShooting(rng, unit, tgt, terrain, stratModifiers);
        if (result.dmg > 0) {
          const beforeModels = tgt.modelCount;
          // Apply Oath bonus as bonus damage approximation
          let finalDmg = result.dmg;
          if (isOathTarget) {
            const oathBonus = Math.ceil(result.dmg * 0.15);
            finalDmg += oathBonus;
            if (oathBonus > 0) log.push({ turn, type: "info", text: `      ✦ Oath: +${oathBonus} bonus damage vs ${tgt.name}` });
          }
          finalDmg = Math.min(finalDmg, tgt.currentWounds);
          applyDamage(tgt, finalDmg);
          // MVP tracking: credit the attacker
          unit.dmgDealt = (unit.dmgDealt || 0) + finalDmg;
          tgt.woundsTaken = (tgt.woundsTaken || 0) + finalDmg;
          const lostModels = beforeModels - tgt.modelCount;
          if (tgt.destroyed) {
            unit.killsScored = (unit.killsScored || 0) + 1;
            log.push({ turn, type: "kill",  text: `   ☠ ${unit.name} ⤇ ${tgt.name}: ${result.narrate} — DESTROYED` });
            sideState[side].kills++;
            sideState[side].killsThisTurn++;
            sideState[side].totalKills++;
            if (tgt.keywords?.includes("VEHICLE")) sideState[side].vehicleKills++;
            if (tgt.keywords?.includes("MONSTER")) sideState[side].monsterKills++;
            if (tgt.keywords?.includes("CHARACTER")) sideState[side].characterKills++;
          } else {
            log.push({ turn, type: "shoot", text: `   ► ${unit.name} ⤇ ${tgt.name}: ${result.narrate}${lostModels > 0 ? ` · −${lostModels} model${lostModels > 1 ? "s" : ""}` : ""}` });
          }
          // Annotation: damage shown on map
          annotations.push({ type: "damage", x: tgt.x, y: tgt.y, value: finalDmg, side });
        } else {
          log.push({ turn, type: "shoot", text: `   ► ${unit.name} ⤇ ${tgt.name}: ${result.narrate}` });
        }
        // Battle-shock check on the target if hurt enough
        if (!tgt.destroyed) {
          const wasShocked = checkBattleShock(rng, tgt, allUnits);
          if (wasShocked) {
            log.push({ turn, type: "info", text: `      ✕ ${tgt.name} fails Battle-shock (Ld${tgt.stats.Ld}+) — loses OC, no stratagems` });
          }
        }
      }
      frames.push({ turn, phase: `${side === "left" ? "L" : "R"} Shooting`, units: allUnits.filter(u => !u.destroyed && !u.inReserve).map(u => ({ ...u })), objectives: objectives.map(o => ({ ...o })), leftScore: sideState.left.primaryVP + sideState.left.secondaryVP, rightScore: sideState.right.primaryVP + sideState.right.secondaryVP, annotations: [...annotations] });

      // ============== CHARGE PHASE ==============
      log.push({ turn, type: "phase", text: `▼ ${sideName} · CHARGE PHASE — units within 12″ may attempt 2D6″ charge` });
      const chargers = [];   // { unit, target } pairs that successfully charged
      for (const unit of myUnits) {
        if (unit.destroyed || unit.fellBack || unit.advanced) continue;   // can't charge after Advance
        // Find best charge target
        const candidates = enemyUnits
            .filter(e => !e.destroyed)
            .map(e => ({ e, d: distance(unit, e) }))
            .filter(c => c.d <= 12 && c.d >= 1.5)
            .sort((a, b) => a.d - b.d);
        if (candidates.length === 0) continue;
        const target = candidates[0].e;
        const dist = candidates[0].d;
        // 2D6 charge roll
        const rerollAvail = cp[side] >= 1 && unit.role === "elites";   // CP for re-roll
        const roll = chargeRoll(rng, false);
        if (roll >= dist) {
          // Successful charge — close engagement range
          const dx = target.x - unit.x, dy = target.y - unit.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          unit.x = target.x - (dx / len) * 1.0;
          unit.y = target.y - (dy / len) * 1.0;
          chargers.push({ unit, target });
          log.push({ turn, type: "charge", text: `   ⚔ ${unit.name} ⤇ ${target.name}: 2D6=${roll} ≥ ${dist.toFixed(1)}″ — CHARGE!` });
          annotations.push({ type: "charge", x1: unit.x, y1: unit.y, x2: target.x, y2: target.y, side });
        } else if (rerollAvail && roll < 8 && cp[side] >= 1) {
          // Spend CP for re-roll
          cp[side] -= 1;
          const reroll = chargeRoll(rng, false);
          if (reroll >= dist) {
            const dx = target.x - unit.x, dy = target.y - unit.y;
            const len = Math.sqrt(dx*dx + dy*dy) || 1;
            unit.x = target.x - (dx / len) * 1.0;
            unit.y = target.y - (dy / len) * 1.0;
            chargers.push({ unit, target });
            log.push({ turn, type: "charge", text: `   ⚔ ${unit.name} ⤇ ${target.name}: re-rolled 2D6=${reroll} (1CP spent) — CHARGE!` });
            annotations.push({ type: "charge", x1: unit.x, y1: unit.y, x2: target.x, y2: target.y, side });
          } else {
            log.push({ turn, type: "info", text: `   ✕ ${unit.name} fails charge: ${roll}, re-roll ${reroll} (need ${dist.toFixed(1)}″) — wasted` });
          }
        } else {
          log.push({ turn, type: "info", text: `   ✕ ${unit.name} fails charge: 2D6=${roll} (need ${dist.toFixed(1)}″)` });
        }
      }
      frames.push({ turn, phase: `${side === "left" ? "L" : "R"} Charge`, units: allUnits.filter(u => !u.destroyed && !u.inReserve).map(u => ({ ...u })), objectives: objectives.map(o => ({ ...o })), leftScore: sideState.left.primaryVP + sideState.left.secondaryVP, rightScore: sideState.right.primaryVP + sideState.right.secondaryVP, annotations: [...annotations] });

      // ============== FIGHT PHASE ==============
      log.push({ turn, type: "phase", text: `▼ ${sideName} · FIGHT PHASE — chargers strike first, then alternating` });
      // Chargers fight first (strike first bonus)
      for (const { unit, target } of chargers) {
        if (unit.destroyed || target.destroyed) continue;
        const result = resolveMelee(rng, unit, target, { chargeBonus: true });
        applyDamage(target, result.dealt);
        applyDamage(unit, result.taken);
        // MVP tracking
        unit.dmgDealt = (unit.dmgDealt || 0) + result.dealt;
        target.woundsTaken = (target.woundsTaken || 0) + result.dealt;
        target.dmgDealt = (target.dmgDealt || 0) + result.taken;   // counter-attack credit
        unit.woundsTaken = (unit.woundsTaken || 0) + result.taken;
        log.push({ turn, type: "melee", text: `   ⚒ ${unit.name} ⤇ ${target.name}: ${result.narrate}${target.destroyed ? " — TARGET DESTROYED" : ""}${unit.destroyed ? " — ATTACKER DESTROYED" : ""}` });
        if (target.destroyed) {
          unit.killsScored = (unit.killsScored || 0) + 1;
          sideState[side].kills++;
          sideState[side].killsThisTurn++;
          sideState[side].totalKills++;
          if (target.keywords?.includes("VEHICLE")) sideState[side].vehicleKills++;
          if (target.keywords?.includes("MONSTER")) sideState[side].monsterKills++;
          if (target.keywords?.includes("CHARACTER")) sideState[side].characterKills++;
        }
        if (unit.destroyed) {
          target.killsScored = (target.killsScored || 0) + 1;
          sideState[otherSide].kills++;
          sideState[otherSide].killsThisTurn++;
          sideState[otherSide].totalKills++;
        }
      }
      // Other engagements (already-engaged from previous turn)
      for (const unit of myUnits) {
        if (unit.destroyed) continue;
        if (chargers.find(c => c.unit === unit)) continue;
        const engagedEnemy = enemyUnits.find(e => !e.destroyed && distance(unit, e) < 2);
        if (engagedEnemy) {
          const result = resolveMelee(rng, unit, engagedEnemy, {});
          applyDamage(engagedEnemy, result.dealt);
          applyDamage(unit, result.taken);
          // MVP tracking
          unit.dmgDealt = (unit.dmgDealt || 0) + result.dealt;
          engagedEnemy.woundsTaken = (engagedEnemy.woundsTaken || 0) + result.dealt;
          engagedEnemy.dmgDealt = (engagedEnemy.dmgDealt || 0) + result.taken;
          unit.woundsTaken = (unit.woundsTaken || 0) + result.taken;
          log.push({ turn, type: "melee", text: `   ⚒ ${unit.name} ⚔ ${engagedEnemy.name}: ${result.narrate}${engagedEnemy.destroyed ? " — DESTROYED" : ""}` });
          if (engagedEnemy.destroyed) {
            unit.killsScored = (unit.killsScored || 0) + 1;
            sideState[side].kills++;
            sideState[side].killsThisTurn++;
            sideState[side].totalKills++;
            if (engagedEnemy.keywords?.includes("VEHICLE")) sideState[side].vehicleKills++;
            if (engagedEnemy.keywords?.includes("MONSTER")) sideState[side].monsterKills++;
            if (engagedEnemy.keywords?.includes("CHARACTER")) sideState[side].characterKills++;
          }
        }
      }
      frames.push({ turn, phase: `${side === "left" ? "L" : "R"} Fight`, units: allUnits.filter(u => !u.destroyed && !u.inReserve).map(u => ({ ...u })), objectives: objectives.map(o => ({ ...o })), leftScore: sideState.left.primaryVP + sideState.left.secondaryVP, rightScore: sideState.right.primaryVP + sideState.right.secondaryVP, annotations: [...annotations] });

    } // end side loop

    // ============== END OF TURN: SCORING ==============
    log.push({ turn, type: "phase", text: `▼ END OF BATTLE ROUND ${turn} — score primary mission + secondaries` });
    // Primary scoring per side (if turn >= 1 — first turn often gives nothing in real 40k for Take-and-Hold)
    if (turn >= 1) {
      const leftScore  = scoreObjectives(allUnits.filter(u => !u.inReserve), objectives, "left");
      const rightScore = scoreObjectives(allUnits.filter(u => !u.inReserve), objectives, "right");
      sideState.left.primaryVP  += leftScore.score;
      sideState.right.primaryVP += rightScore.score;
      log.push({ turn, type: "score", text: `   ▣ Primary "${primary.name}": LEFT holds ${leftScore.held} → +${leftScore.score} VP · RIGHT holds ${rightScore.held} → +${rightScore.score} VP` });
    }
    // Secondaries
    for (const side of ["left", "right"]) {
      const otherSide = side === "left" ? "right" : "left";
      const mySecs = side === "left" ? leftSecondaries : rightSecondaries;
      const myUnitsAll = allUnits.filter(u => u.side === side && !u.destroyed && !u.inReserve);
      const enemyUnitsAll = allUnits.filter(u => u.side !== side && !u.destroyed && !u.inReserve);
      for (const sec of mySecs) {
        let secVP = 0;
        if (sec.name === "Engage on All Fronts") {
          // Have units in 3+ table quarters
          const quarters = new Set();
          for (const u of myUnitsAll) {
            const qx = u.x < fmt.width / 2 ? 0 : 1;
            const qy = u.y < fmt.height / 2 ? 0 : 1;
            quarters.add(`${qx},${qy}`);
          }
          if (quarters.size >= 3) secVP = 3;
          else if (quarters.size === 2) secVP = 2;
        } else if (sec.name === "Bring It Down") {
          secVP = sideState[side].vehicleKills * 2 + sideState[side].monsterKills * 2;
          // This is a fixed objective so only count NEW kills this turn
          // (simplified — real 40k caps it differently)
          secVP = Math.min(8, secVP);
          // Reset so it doesn't accumulate
          sideState[side].vehicleKills = 0;
          sideState[side].monsterKills = 0;
        } else if (sec.name === "Assassinate") {
          secVP = sideState[side].characterKills * 3;
          secVP = Math.min(6, secVP);
          sideState[side].characterKills = 0;
        } else if (sec.name === "Behind Enemy Lines") {
          // Have a unit in enemy deployment zone (last 12" of board on enemy side)
          const inEnemyZone = myUnitsAll.some(u => side === "left" ? u.x > fmt.width - 12 : u.x < 12);
          if (inEnemyZone) secVP = 4;
        } else if (sec.name === "No Prisoners") {
          if (sideState[side].killsThisTurn >= 2) secVP = 4;
          else if (sideState[side].killsThisTurn >= 1) secVP = 2;
        } else if (sec.name === "Cleanse") {
          // Have a unit in your half on an objective (action)
          const ownObj = objectives.filter(o => side === "left" ? o.x < fmt.width / 2 : o.x > fmt.width / 2);
          const claimed = ownObj.some(o => myUnitsAll.some(u => distance(u, o) < 3));
          if (claimed) secVP = 3;
        } else if (sec.name === "Containment") {
          // Have a unit within 6" of enemy edge
          const nearEdge = myUnitsAll.some(u => side === "left" ? u.x > fmt.width - 6 : u.x < 6);
          if (nearEdge) secVP = 3;
        } else if (sec.name === "Extend Battle Lines") {
          const quarters = new Set();
          for (const o of objectives) {
            if (myUnitsAll.some(u => distance(u, o) < 3.5)) {
              const qx = o.x < fmt.width / 2 ? 0 : 1;
              const qy = o.y < fmt.height / 2 ? 0 : 1;
              quarters.add(`${qx},${qy}`);
            }
          }
          if (quarters.size >= 2) secVP = 4;
        } else if (sec.name === "Storm Hostile Objective") {
          const enemyObj = objectives.filter(o => o.side === otherSide);
          if (enemyObj.some(o => myUnitsAll.some(u => distance(u, o) < 3.5))) secVP = 5;
        } else if (sec.name === "Marked for Death") {
          // Score per turn for kill of any unit (simplified)
          secVP = Math.min(3, sideState[side].killsThisTurn);
        }
        if (secVP > 0) {
          sideState[side].secondaryVP += secVP;
          log.push({ turn, type: "score", text: `   ✦ ${side === "left" ? "LEFT" : "RIGHT"} "${sec.name}": +${secVP} VP` });
        }
      }
    }

    log.push({ turn, type: "info", text: `   ─── Round ${turn} totals: LEFT ${sideState.left.primaryVP + sideState.left.secondaryVP} VP · RIGHT ${sideState.right.primaryVP + sideState.right.secondaryVP} VP ───` });
    frames.push({
      turn, phase: "End of Turn",
      units: allUnits.filter(u => !u.destroyed && !u.inReserve).map(u => ({ ...u })),
      objectives: objectives.map(o => ({ ...o })),
      leftScore: sideState.left.primaryVP + sideState.left.secondaryVP,
      rightScore: sideState.right.primaryVP + sideState.right.secondaryVP,
      annotations: [],
    });
  } // end turn loop

  // ============== FINAL RECKONING ==============
  const leftScore = sideState.left.primaryVP + sideState.left.secondaryVP;
  const rightScore = sideState.right.primaryVP + sideState.right.secondaryVP;

  // Per-unit performance stats — sort each side's units by damage dealt,
  // identify MVP (most damage), and aggregate per-unit kill counts
  const computePerUnitStats = (units) => units
      .map(u => ({
        uid: u.uid,
        name: u.name,
        role: u.role,
        points: u.points,
        dmgDealt: u.dmgDealt || 0,
        killsScored: u.killsScored || 0,
        woundsTaken: u.woundsTaken || 0,
        destroyed: u.destroyed,
        survived: !u.destroyed,
      }))
      .sort((a, b) => b.dmgDealt - a.dmgDealt);
  const leftUnitStats  = computePerUnitStats(leftUnits);
  const rightUnitStats = computePerUnitStats(rightUnits);
  const leftMVP  = leftUnitStats.find(u => u.dmgDealt > 0 || u.killsScored > 0) || leftUnitStats[0] || null;
  const rightMVP = rightUnitStats.find(u => u.dmgDealt > 0 || u.killsScored > 0) || rightUnitStats[0] || null;

  log.push({ turn: fmt.turns, type: "header", text: `═══════════════ FINAL RECKONING ═══════════════` });
  log.push({ turn: fmt.turns, type: "info",   text: `LEFT  (${armyLeft.faction}): primary ${sideState.left.primaryVP} + secondary ${sideState.left.secondaryVP} = ${leftScore} VP · ${sideState.left.totalKills} kills` });
  if (leftMVP && (leftMVP.dmgDealt > 0 || leftMVP.killsScored > 0)) {
    log.push({ turn: fmt.turns, type: "info", text: `   ★ LEFT MVP: ${leftMVP.name} — ${leftMVP.dmgDealt} dmg dealt, ${leftMVP.killsScored} kill${leftMVP.killsScored !== 1 ? "s" : ""}` });
  }
  log.push({ turn: fmt.turns, type: "info",   text: `RIGHT (${armyRight.faction}): primary ${sideState.right.primaryVP} + secondary ${sideState.right.secondaryVP} = ${rightScore} VP · ${sideState.right.totalKills} kills` });
  if (rightMVP && (rightMVP.dmgDealt > 0 || rightMVP.killsScored > 0)) {
    log.push({ turn: fmt.turns, type: "info", text: `   ★ RIGHT MVP: ${rightMVP.name} — ${rightMVP.dmgDealt} dmg dealt, ${rightMVP.killsScored} kill${rightMVP.killsScored !== 1 ? "s" : ""}` });
  }
  let winner = leftScore > rightScore ? "left" : (rightScore > leftScore ? "right" : "draw");
  if (winner === "draw") log.push({ turn: fmt.turns, type: "winner", text: `⚖ DRAWN BATTLE — both armies retreat with honor (or what remains of it)` });
  else log.push({ turn: fmt.turns, type: "winner", text: `★ ${winner === "left" ? armyLeft.faction.toUpperCase() : armyRight.faction.toUpperCase()} CLAIMS THE FIELD with ${winner === "left" ? leftScore : rightScore} VP!` });

  return {
    format: fmt,
    formatName,
    primary,
    leftSecondaries,
    rightSecondaries,
    leftRule,
    rightRule,
    terrain,
    objectives,
    armyLeft:  { faction: armyLeft.faction,  color: armyLeft.color,  accent: armyLeft.accent,  icon: armyLeft.icon  },
    armyRight: { faction: armyRight.faction, color: armyRight.color, accent: armyRight.accent, icon: armyRight.icon },
    frames,
    log,
    leftScore,
    rightScore,
    leftPrimary:   sideState.left.primaryVP,
    leftSecondary: sideState.left.secondaryVP,
    rightPrimary:  sideState.right.primaryVP,
    rightSecondary:sideState.right.secondaryVP,
    leftKills:  sideState.left.totalKills,
    rightKills: sideState.right.totalKills,
    leftUnitStats,
    rightUnitStats,
    leftMVP,
    rightMVP,
    winner,
    seed,
    leftPersonality,
    rightPersonality,
  };
}

// ============================================================
// REACT COMPONENT
// ============================================================

export default function App() {
  const [faction, setFaction] = useState("Space Marines");
  const [subFaction, setSubFaction] = useState("Codex Compliant");
  const [points, setPoints] = useState(2000);
  const [armyType, setArmyType] = useState("balanced");
  // Build mode: "generate" creates a random army from doctrine/combos;
  // "manual" starts with an empty army and lets the user add every unit by hand.
  // Both modes share the same editor, save/load, export, battle sim, etc.
  const [buildMode, setBuildMode] = useState("generate");
  const [requiredRoles, setRequiredRoles] = useState(["troops"]);
  const [detachment, setDetachment] = useState("Gladius Strike Force");
  const [enhancementsEnabled, setEnhancementsEnabled] = useState(true);
  const [selectedEnhancements, setSelectedEnhancements] = useState([]);
  const [army, setArmy] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [factionPickerOpen, setFactionPickerOpen] = useState(false);

  // NEW: combo + pinned units + edit state
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [pinnedUnits, setPinnedUnits] = useState([]);
  const [pinPanelOpen, setPinPanelOpen] = useState(false);
  const [pinSearchRole, setPinSearchRole] = useState("hq");
  const [swapTarget, setSwapTarget] = useState(null); // { unitId, role } when swap UI is open
  // Custom-unit form: which role's form is open, and the field values
  const [customUnitOpenRole, setCustomUnitOpenRole] = useState(null);
  const [customUnitDraft, setCustomUnitDraft] = useState({ name: "", points: "", squadSize: "" });
  // Unit picker: which role's picker is open (for manual build, lets user choose specific units)
  const [pickerOpenRole, setPickerOpenRole] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  // Stat card: which unit's full statline popup is open
  const [statCardUnitId, setStatCardUnitId] = useState(null);

  // NEW: saved armies state
  const [savedArmies, setSavedArmies] = useState([]); // [{key, name, savedAt, snapshot}]
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [savedStatus, setSavedStatus] = useState(""); // transient "saved!" / "loaded!" message
  const [renamingKey, setRenamingKey] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");
  // Search & sort for the saved armies list — useful once you have many saved
  const [savedSearch, setSavedSearch] = useState("");
  const [savedSortBy, setSavedSortBy] = useState("recent"); // recent | name | faction | points
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [battleSimOpen, setBattleSimOpen] = useState(false);
  // Battle history — last N battle results, persisted to storage.
  // Each entry: {when, format, leftFaction, rightFaction, leftScore, rightScore,
  //              leftKills, rightKills, winner, leftMVP, rightMVP, primary, seed}
  const [battleHistory, setBattleHistory] = useState([]);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);

  // Points override system: { "Faction|UnitName": { points: number, updatedAt: number } }
  const [pointOverrides, setPointOverrides] = useState({});
  const [overridesPanelOpen, setOverridesPanelOpen] = useState(false);
  const [overrideFaction, setOverrideFaction] = useState("Space Marines");
  const [overrideEditDrafts, setOverrideEditDrafts] = useState({}); // unitKey -> string draft
  const [overrideExportMode, setOverrideExportMode] = useState(false);
  const [overrideImportMode, setOverrideImportMode] = useState(false);
  const [overrideExportText, setOverrideExportText] = useState("");
  const [overrideImportText, setOverrideImportText] = useState("");

  // When loading a saved army, we set faction/subFaction/detachment all at once;
  // the [faction] useEffect would normally wipe sub-faction/enhancements/pins on
  // a faction change. This ref lets the load handler suppress that reset for
  // exactly one effect cycle, so loaded armies come through intact.
  const isLoadingArmyRef = useRef(false);

  const factionData = FACTIONS[faction];

  // Helper: get effective points for a unit (override if set, else base)
  const getUnitPoints = (unitName, factionName, basePoints) => {
    const key = `${factionName}|${unitName}`;
    const override = pointOverrides[key];
    if (override && typeof override.points === "number") return override.points;
    return basePoints;
  };

  // Apply overrides to a faction's unit pool (returns deep-copied pool with overridden points)
  const applyOverridesToPool = (pool, factionName) => {
    const out = {};
    for (const role of Object.keys(pool)) {
      out[role] = pool[role].map((u) => {
        const key = `${factionName}|${u.name}`;
        const override = pointOverrides[key];
        if (override && typeof override.points === "number") {
          return { ...u, points: override.points, _baseCost: u.points, _overridden: true };
        }
        return u;
      });
    }
    return out;
  };

  // Squad-size system: parse "(N)" from a unit name to get the base squad size.
  // E.g. "Ironstrider Ballistarii (3)" → 3, "Captain" → 1
  const getBaseSquadSize = (unitName) => {
    const m = unitName && unitName.match(/\((\d+)\)/);
    return m ? parseInt(m[1]) : 1;
  };

  // Returns the effective display name and points for an army unit, accounting for
  // squadSize (per-squad model count) and qty (number of duplicate squads).
  // - unit.points is the cost for a single squad at the BASE size shown in the name.
  // - unit.squadSize, if set, replaces that base size; points scale linearly per model.
  // - unit.qty multiplies the whole thing (number of duplicate squads).
  const getEffectiveUnit = (unit) => {
    const baseSize = getBaseSquadSize(unit.name);
    const squadSize = unit.squadSize || baseSize;
    const qty = unit.qty || 1;
    const perSquadPoints = baseSize > 0 ? Math.round(unit.points * (squadSize / baseSize)) : unit.points;
    const effectivePoints = perSquadPoints * qty;
    const displayName = baseSize > 1 && squadSize !== baseSize
        ? unit.name.replace(/\(\d+\)/, `(${squadSize})`)
        : unit.name;
    return { baseSize, squadSize, qty, perSquadPoints, effectivePoints, displayName, isResizable: baseSize > 1 };
  };

  // Load saved armies from storage on mount. Uses armyStorage adapter which
  // works on Claude artifact host AND on plain browsers (via localStorage).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!armyStorage.available) {
        setStorageAvailable(false);
        return;
      }
      try {
        const result = await armyStorage.list("army:");
        if (cancelled) return;
        if (result && Array.isArray(result.keys)) {
          const loaded = [];
          for (const key of result.keys) {
            try {
              const r = await armyStorage.get(key);
              if (r && r.value) {
                const data = JSON.parse(r.value);
                loaded.push({ key, ...data });
              }
            } catch (e) {
              // skip corrupt entries
            }
          }
          loaded.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
          if (!cancelled) setSavedArmies(loaded);
        }
      } catch (e) {
        if (!cancelled) setStorageAvailable(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load point overrides from storage on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!armyStorage.available) return;
      try {
        const r = await armyStorage.get("pointOverrides:all");
        if (cancelled) return;
        if (r && r.value) {
          const data = JSON.parse(r.value);
          if (data && typeof data === "object") setPointOverrides(data);
        }
      } catch (e) {
        // no overrides yet, fine
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load battle history on mount — single key holding an array of recent results
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!armyStorage.available) return;
      try {
        const r = await armyStorage.get("battleHistory:all");
        if (cancelled) return;
        if (r && r.value) {
          const data = JSON.parse(r.value);
          if (Array.isArray(data)) setBattleHistory(data);
        }
      } catch (e) {
        // first run, no history yet
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Add a battle result to history; persists to storage. Caps at 50 entries.
  const addBattleToHistory = async (entry) => {
    setBattleHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      // fire-and-forget persist
      if (armyStorage.available) {
        armyStorage.set("battleHistory:all", JSON.stringify(next)).catch(() => {});
      }
      return next;
    });
  };

  // Clear all battle history (with confirmation)
  const clearBattleHistory = async () => {
    if (!confirm(`Clear all ${battleHistory.length} battle records? This cannot be undone.`)) return;
    setBattleHistory([]);
    if (armyStorage.available) {
      try { await armyStorage.delete("battleHistory:all"); } catch (e) {}
    }
  };

  // Persist overrides whenever they change
  const persistOverrides = async (next) => {
    if (!armyStorage.available) return;
    try {
      await armyStorage.set("pointOverrides:all", JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  // Auto-clear status message after 2.5 seconds
  useEffect(() => {
    if (!savedStatus) return;
    const t = setTimeout(() => setSavedStatus(""), 2500);
    return () => clearTimeout(t);
  }, [savedStatus]);

  // Keyboard shortcuts in the main builder. We deliberately don't add too many —
  // shortcuts compete for attention with discoverability, and most users will
  // never know they exist. The chosen set covers the most-frequent actions:
  //   G        — generate army (in generate mode) or start manual (in manual mode)
  //   S        — save current army
  //   B        — open the battle simulator
  //   Shift+/  — show shortcut hints (handled in UI as a hint badge)
  // Shortcuts are skipped while the user is typing in inputs/textareas/selects
  // so they don't conflict with text entry.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT" || e.target.isContentEditable) return;
      // Skip if a modal is open — battle sim, overrides, etc. — they have their own handlers
      if (battleSimOpen || overridesPanelOpen) return;
      // Skip if any modifier is pressed (we want bare keystrokes)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "g") {
        e.preventDefault();
        if (buildMode === "generate") handleGenerate();
        else handleStartManual();
      } else if (k === "s") {
        e.preventDefault();
        if (army) handleSaveArmy();
      } else if (k === "b") {
        e.preventDefault();
        if (savedArmies.length > 0) setBattleSimOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buildMode, army, savedArmies, battleSimOpen]);


  useEffect(() => {
    // If we're in the middle of loading a saved army, all the values being set
    // by the load are already valid for the new faction — skip the reset and
    // clear the flag so subsequent user-driven faction changes work normally.
    if (isLoadingArmyRef.current) {
      isLoadingArmyRef.current = false;
      return;
    }
    const subKeys = Object.keys(factionData.subFactions);
    if (!subKeys.includes(subFaction)) setSubFaction(subKeys[0]);
    const detKeys = Object.keys(factionData.detachments);
    if (!detKeys.includes(detachment)) setDetachment(detKeys[0]);
    setSelectedEnhancements([]);
    setSelectedCombo(null);
    setPinnedUnits([]);
    // eslint-disable-next-line
  }, [faction]);

  useEffect(() => {
    // Skip the enhancement-reset during a load (load sets enhancements explicitly)
    if (isLoadingArmyRef.current) return;
    setSelectedEnhancements([]);
  }, [detachment]);

  useEffect(() => {
    // Skip pin-pruning during a load (load sets pins explicitly)
    if (isLoadingArmyRef.current) return;
    // When sub-faction changes, clear pins that no longer exist in pool
    if (!factionData.subFactions[subFaction]) return;
    const subData = factionData.subFactions[subFaction];
    const merged = mergeUnitPools(subData.units, subData.extra);
    const allNames = new Set();
    for (const role of Object.keys(merged)) {
      for (const u of merged[role]) allNames.add(u.name);
    }
    setPinnedUnits((prev) => prev.filter((n) => allNames.has(n)));
    // eslint-disable-next-line
  }, [subFaction]);

  const detachmentData = factionData.detachments[detachment];
  const combos = COMBOS[faction] || [];

  // Build the merged unit pool for the current faction/sub-faction (with overrides applied)
  const currentUnitPool = useMemo(() => {
    const subData = factionData.subFactions[subFaction];
    if (!subData) return {};
    const merged = mergeUnitPools(subData.units, subData.extra);
    return applyOverridesToPool(merged, faction);
  }, [faction, subFaction, factionData, pointOverrides]);

  // Flat lookup of all units in current pool by name
  const unitLookup = useMemo(() => {
    const lookup = {};
    for (const role of Object.keys(currentUnitPool)) {
      for (const u of currentUnitPool[role]) {
        if (!lookup[u.name]) lookup[u.name] = { ...u, role };
      }
    }
    return lookup;
  }, [currentUnitPool]);

  const handleGenerate = () => {
    setGenerating(true);
    setSwapTarget(null);
    setTimeout(() => {
      const result = generateArmy({
        faction,
        subFaction,
        points,
        armyType,
        requiredRoles,
        detachment,
        selectedEnhancements,
        enhancementsEnabled,
        pinnedUnits,
        comboName: selectedCombo,
        pointOverrides,
      });
      setArmy(result);
      setGenerating(false);
      setTimeout(
          () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
          100
      );
    }, 500);
  };

  // Start a fresh empty army for manual building. The user fills it themselves
  // using the same editor (+ ADD, + CUSTOM, swap, qty, squadSize) that already exists.
  // We give it the same shape as a generated army so save/export/battle all work.
  const handleStartManual = () => {
    setSwapTarget(null);
    const detachmentData = factionData?.detachments?.[detachment] || {};
    const emptyArmy = {
      units: [],
      enhancements: enhancementsEnabled ? [...selectedEnhancements] : [],
      enhancementSpend: 0,
      spent: 0,
      total: 0,
      faction,
      subFaction,
      factionData,
      detachment,
      detachmentData,
      selectedEnhancements: enhancementsEnabled ? [...selectedEnhancements] : [],
      points,
      armyType: "balanced", // doctrine is irrelevant in manual mode but keep field
      comboName: null,
      pinnedUnits: [],
      _manual: true, // flag so we know this army was hand-built
    };
    setArmy(emptyArmy);
    // Auto-open the HQ picker so the user immediately sees what to add first
    setPickerOpenRole("hq");
    setPickerSearch("");
    setTimeout(
        () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
        100
    );
  };

  const toggleRole = (role) => {
    setRequiredRoles((prev) =>
        prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleEnhancement = (name) => {
    setSelectedEnhancements((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const togglePinnedUnit = (name) => {
    setPinnedUnits((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const selectCombo = (name) => {
    setSelectedCombo((prev) => (prev === name ? null : name));
  };

  const groupedUnits = useMemo(() => {
    if (!army) return null;
    const groups = {};
    for (const unit of army.units) {
      if (!groups[unit.role]) groups[unit.role] = [];
      groups[unit.role].push(unit);
    }
    return groups;
  }, [army]);

  const enhancementTotalCost = useMemo(() => {
    if (!detachmentData) return 0;
    return selectedEnhancements.reduce((sum, name) => {
      const enh = detachmentData.enhancements.find((e) => e.name === name);
      return sum + (enh?.points || 0);
    }, 0);
  }, [selectedEnhancements, detachmentData]);

  // ==========================================
  // ARMY EDITOR FUNCTIONS
  // ==========================================
  const recalcSpent = (units) =>
      units.reduce((s, u) => s + getEffectiveUnit(u).effectivePoints, 0);

  const editorRemoveUnit = (unitId) => {
    if (!army) return;
    const newUnits = army.units.filter((u) => u.id !== unitId);
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
  };

  const editorDuplicateUnit = (unitId) => {
    if (!army) return;
    const idx = army.units.findIndex((u) => u.id === unitId);
    if (idx < 0) return;
    const orig = army.units[idx];
    // Check max copy limit
    const existingCount = army.units.filter((u) => u.name === orig.name).length;
    if (existingCount >= orig.max) return;
    const dup = { ...orig, id: Math.random(), pinned: false };
    const newUnits = [...army.units.slice(0, idx + 1), dup, ...army.units.slice(idx + 1)];
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
  };

  const editorChangeQty = (unitId, delta) => {
    if (!army) return;
    const newUnits = army.units.map((u) => {
      if (u.id !== unitId) return u;
      const currentQty = u.qty || 1;
      const newQty = Math.max(1, Math.min(u.max, currentQty + delta));
      return { ...u, qty: newQty };
    });
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
  };

  // Resize a single squad — change the number of models in the squad itself
  // (separate from qty, which is the number of duplicate squads).
  // Points scale linearly per model. Minimum 1 model, maximum the unit's base size.
  const editorChangeSquadSize = (unitId, delta) => {
    if (!army) return;
    const newUnits = army.units.map((u) => {
      if (u.id !== unitId) return u;
      const baseSize = getBaseSquadSize(u.name);
      if (baseSize <= 1) return u; // not resizable
      const currentSize = u.squadSize || baseSize;
      const newSize = Math.max(1, Math.min(baseSize, currentSize + delta));
      // Clear squadSize back to undefined when at base, to keep saves clean
      const next = { ...u };
      if (newSize === baseSize) delete next.squadSize;
      else next.squadSize = newSize;
      return next;
    });
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
  };

  const editorAddUnit = (unitName) => {
    if (!army) return;
    const def = unitLookup[unitName];
    if (!def) return;
    const existingCount = army.units.filter((u) => u.name === unitName).length;
    if (existingCount >= def.max) return;
    const newUnit = { ...def, id: Math.random(), pinned: false };
    const newUnits = [...army.units, newUnit];
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
  };

  // Add a user-defined custom unit. Used when GW publishes a unit we don't have data for.
  // The name can include "(N)" to specify a base squad size (works with squadSize resize controls).
  const editorAddCustomUnit = (role, rawName, rawPoints, rawSquadSize) => {
    if (!army) return;
    const name = String(rawName || "").trim();
    const points = parseInt(rawPoints);
    const squadSize = parseInt(rawSquadSize);
    if (!name || !Number.isFinite(points) || points < 0) return;
    // If user gave a squad size, append it to the name as "(N)" if not already there
    let finalName = name;
    if (Number.isFinite(squadSize) && squadSize > 1 && !/\(\d+\)/.test(finalName)) {
      finalName = `${finalName} (${squadSize})`;
    }
    const newUnit = {
      name: finalName,
      points,
      max: 6, // generous default; user can take multiple via qty
      role,
      pinned: false,
      _custom: true,
      id: Math.random(),
    };
    const newUnits = [...army.units, newUnit];
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
    setCustomUnitOpenRole(null);
    setCustomUnitDraft({ name: "", points: "", squadSize: "" });
  };

  const editorSwapUnit = (unitId, newName) => {
    if (!army) return;
    const def = unitLookup[newName];
    if (!def) return;
    const newUnits = army.units.map((u) => {
      if (u.id !== unitId) return u;
      return { ...def, id: u.id, pinned: u.pinned, qty: u.qty };
    });
    setArmy({ ...army, units: newUnits, spent: recalcSpent(newUnits) });
    setSwapTarget(null);
  };

  // Get synergy hints for a given unit name (units that pair well)
  const getSynergyHints = (unitName) => {
    const hints = SYNERGIES[unitName];
    if (!hints || !hints.length) return [];
    // Filter to units that exist in the current pool
    return hints.filter((h) => unitLookup[h]);
  };

  // ==========================================
  // SAVE / LOAD / EXPORT / IMPORT
  // ==========================================
  const buildSnapshot = (customName) => {
    if (!army) return null;
    return {
      name: customName || `${faction} · ${points}pts · ${new Date().toLocaleString()}`,
      savedAt: Date.now(),
      snapshot: {
        faction,
        subFaction,
        points,
        armyType,
        requiredRoles: [...requiredRoles],
        detachment,
        enhancementsEnabled,
        selectedEnhancements: [...selectedEnhancements],
        selectedCombo,
        pinnedUnits: [...pinnedUnits],
        // Strip internal-only id values; keep everything else including pinned/qty
        units: army.units.map((u) => ({
          name: u.name,
          points: u.points,
          max: u.max,
          role: u.role,
          pinned: !!u.pinned,
          qty: u.qty || 1,
          ...(u.squadSize ? { squadSize: u.squadSize } : {}),
          ...(u._custom ? { _custom: true } : {}),
        })),
        spent: army.spent,
        enhancementSpend: army.enhancementSpend,
        ...(army._manual ? { _manual: true } : {}),
      },
    };
  };

  const handleSaveArmy = async () => {
    if (!army) {
      setSavedStatus("Generate an army first");
      return;
    }
    const defaultName = `${faction} · ${points}pts`;
    const name = window.prompt("Name this army list:", defaultName);
    if (!name) return;
    const data = buildSnapshot(name);
    if (!data) return;
    const key = `army:${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      if (armyStorage.available) {
        await armyStorage.set(key, JSON.stringify(data));
      }
      setSavedArmies((prev) => [{ key, ...data }, ...prev]);
      const where = armyStorage.kind === "localStorage" ? " (browser storage)" : (armyStorage.kind === "claude" ? "" : " — in memory only, no persistence");
      setSavedStatus(`Saved "${name}"${where}`);
      setSavedPanelOpen(true);
    } catch (e) {
      // localStorage can throw QuotaExceededError if the browser is full
      setSavedStatus("Save failed: " + (e.message || "storage error"));
    }
  };

  const handleLoadArmy = (entry) => {
    if (!entry || !entry.snapshot) {
      setSavedStatus("Cannot load — invalid army data");
      return;
    }
    const s = entry.snapshot;
    // Validate faction / sub-faction / detachment exist in the current codex.
    // Codex updates can rename or remove these — fall back gracefully so a
    // partial restore is still useful (units may need re-adding from picker).
    const fData = FACTIONS[s.faction];
    if (!fData) {
      setSavedStatus(`Load failed — faction "${s.faction}" no longer exists`);
      return;
    }
    const subKeys = Object.keys(fData.subFactions);
    const detKeys = Object.keys(fData.detachments);
    const validSub = subKeys.includes(s.subFaction) ? s.subFaction : subKeys[0];
    const validDet = detKeys.includes(s.detachment) ? s.detachment : detKeys[0];
    let warning = "";
    if (validSub !== s.subFaction) warning += ` Sub-faction "${s.subFaction}" missing → reset to "${validSub}".`;
    if (validDet !== s.detachment) warning += ` Detachment "${s.detachment}" missing → reset to "${validDet}".`;

    // Set the loading flag so the [faction], [detachment], [subFaction]
    // useEffects don't wipe the values we're about to set.
    isLoadingArmyRef.current = true;

    // Set all the controls. React 18 batches these into a single re-render,
    // and the [faction] useEffect runs after the batch — sees the flag,
    // skips its reset, and clears the flag.
    setFaction(s.faction);
    setSubFaction(validSub);
    setDetachment(validDet);
    setPoints(s.points);
    setArmyType(s.armyType || "balanced");
    setRequiredRoles(s.requiredRoles || []);
    setEnhancementsEnabled(!!s.enhancementsEnabled);
    setSelectedEnhancements(s.selectedEnhancements || []);
    setSelectedCombo(s.selectedCombo || null);
    setPinnedUnits(s.pinnedUnits || []);
    if (s._manual) {
      setBuildMode("manual");
    } else {
      setBuildMode("generate");
    }

    // Rebuild army with fresh ids
    const restoredUnits = (s.units || []).map((u) => ({
      ...u,
      id: Math.random(),
    }));
    // Recompute spent in case saved value is stale (older save without squadSize, or override changed)
    const recomputedSpent = restoredUnits.reduce((sum, u) => {
      const baseSize = getBaseSquadSize(u.name);
      const squadSize = u.squadSize || baseSize;
      const qty = u.qty || 1;
      const perSquadPoints = baseSize > 0 ? Math.round(u.points * (squadSize / baseSize)) : u.points;
      return sum + perSquadPoints * qty;
    }, 0);

    setArmy({
      units: restoredUnits,
      spent: recomputedSpent,
      enhancementSpend: s.enhancementSpend || 0,
      faction: s.faction,
      subFaction: validSub,
      factionData: fData,
      detachment: validDet,
      selectedEnhancements: s.selectedEnhancements || [],
      comboName: s.selectedCombo || null,
      pinnedUnits: s.pinnedUnits || [],
      points: s.points,
      armyType: s.armyType || "balanced",
      ...(s._manual ? { _manual: true } : {}),
    });
    setSavedStatus(`Loaded "${entry.name}"${warning ? " ·" + warning : ""}`);
    setSavedPanelOpen(false);
    setTimeout(
        () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
        150
    );
  };

  const handleDeleteArmy = async (entry) => {
    if (!window.confirm(`Delete "${entry.name}"? This cannot be undone.`)) return;
    try {
      if (armyStorage.available) await armyStorage.delete(entry.key);
      setSavedArmies((prev) => prev.filter((e) => e.key !== entry.key));
      setSavedStatus(`Deleted "${entry.name}"`);
    } catch (e) {
      setSavedStatus("Delete failed: " + e.message);
    }
  };

  const handleRenameArmy = async (entry) => {
    const newName = renameDraft.trim();
    if (!newName) {
      setRenamingKey(null);
      return;
    }
    try {
      const updated = { ...entry, name: newName };
      if (armyStorage.available) {
        const stored = { name: updated.name, savedAt: updated.savedAt, snapshot: updated.snapshot };
        await armyStorage.set(entry.key, JSON.stringify(stored));
      }
      setSavedArmies((prev) =>
          prev.map((e) => (e.key === entry.key ? updated : e))
      );
      setRenamingKey(null);
      setRenameDraft("");
      setSavedStatus(`Renamed to "${newName}"`);
    } catch (e) {
      setSavedStatus("Rename failed: " + e.message);
    }
  };

  const handleExportArmy = () => {
    if (!army) {
      setSavedStatus("Generate an army first");
      return;
    }
    const data = buildSnapshot();
    // Build human-readable header + JSON payload
    const lines = [];
    lines.push(`╔════════════════════════════════════════════╗`);
    lines.push(`║ ${army.faction.toUpperCase()}`);
    lines.push(`║ ${army.subFaction} · ${army.detachment}`);
    lines.push(`║ ${army.spent + army.enhancementSpend} / ${points} pts · ${ARMY_TYPES[armyType].label}`);
    if (army.comboName) lines.push(`║ Combo: ${army.comboName}`);
    lines.push(`╚════════════════════════════════════════════╝`);
    lines.push(``);
    if (army.selectedEnhancements && army.selectedEnhancements.length) {
      lines.push(`ENHANCEMENTS (+${army.enhancementSpend}pts)`);
      for (const eName of army.selectedEnhancements) {
        const enh = army.factionData.detachments[army.detachment].enhancements.find((x) => x.name === eName);
        lines.push(`  ✦ ${eName} (+${enh?.points || 0}pts)`);
      }
      lines.push(``);
    }
    // Group units by role for the readout
    const groups = {};
    for (const u of army.units) {
      if (!groups[u.role]) groups[u.role] = [];
      groups[u.role].push(u);
    }
    for (const [role, label] of Object.entries(ROLE_LABELS)) {
      if (!groups[role]) continue;
      lines.push(`${label.toUpperCase()}`);
      for (const u of groups[role]) {
        const eff = getEffectiveUnit(u);
        const qtyStr = eff.qty > 1 ? ` ×${eff.qty}` : "";
        const pinStr = u.pinned ? " [PINNED]" : "";
        lines.push(`  • ${eff.displayName}${qtyStr} — ${eff.effectivePoints}pts${pinStr}`);
      }
      lines.push(``);
    }
    lines.push(`══════════════════════════════════════════════`);
    lines.push(`-- BEGIN ARMY-FORGE-DATA (paste this entire block to re-import) --`);
    lines.push(JSON.stringify(data));
    lines.push(`-- END ARMY-FORGE-DATA --`);
    setExportText(lines.join("\n"));
    setExportMode(true);
  };

  // Generate a clean tournament-list-style text view (no JSON), suitable for
  // pasting into a forum, Discord, or chat. Lighter than the full export.
  // Uses navigator.clipboard if available; falls back to inserting into the
  // export box for manual copy.
  const handleCopyTextList = async () => {
    if (!army) {
      setSavedStatus("Generate an army first");
      return;
    }
    const lines = [];
    const totalPts = army.spent + army.enhancementSpend;
    lines.push(`# ${army.faction.toUpperCase()}`);
    lines.push(`# ${army.subFaction} · ${army.detachment}`);
    lines.push(`# ${totalPts} / ${points} pts`);
    if (army.comboName) lines.push(`# Theme: ${army.comboName}`);
    lines.push(``);
    if (army.selectedEnhancements && army.selectedEnhancements.length) {
      lines.push(`## Enhancements (+${army.enhancementSpend}pts)`);
      for (const eName of army.selectedEnhancements) {
        const enh = army.factionData.detachments[army.detachment].enhancements.find((x) => x.name === eName);
        lines.push(`- ${eName} (+${enh?.points || 0}pts)`);
      }
      lines.push(``);
    }
    // Group units by role
    const groups = {};
    for (const u of army.units) {
      if (!groups[u.role]) groups[u.role] = [];
      groups[u.role].push(u);
    }
    for (const [role, label] of Object.entries(ROLE_LABELS)) {
      if (!groups[role]) continue;
      lines.push(`## ${label}`);
      for (const u of groups[role]) {
        const eff = getEffectiveUnit(u);
        const qtyStr = eff.qty > 1 ? ` ×${eff.qty}` : "";
        lines.push(`- ${eff.displayName}${qtyStr} — ${eff.effectivePoints}pts`);
      }
      lines.push(``);
    }
    lines.push(`---`);
    lines.push(`Generated by Army Forge · ${totalPts}/${points}pts`);
    const text = lines.join("\n");
    // Try modern clipboard API first
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setSavedStatus("✓ Copied as text list to clipboard");
        setTimeout(() => setSavedStatus(""), 3000);
        return;
      }
    } catch (e) {
      // fall through to fallback
    }
    // Fallback: drop into the export box so user can manually copy
    setExportText(text);
    setExportMode(true);
    setSavedStatus("⚠ Clipboard unavailable — copy the text below manually");
    setTimeout(() => setSavedStatus(""), 5000);
  };

  const handleImportArmy = () => {
    const text = importText.trim();
    if (!text) {
      setSavedStatus("Paste something first");
      return;
    }
    // Try to find JSON between markers, else assume the whole thing is JSON
    let jsonStr = text;
    const beginMarker = "BEGIN ARMY-FORGE-DATA";
    const endMarker = "END ARMY-FORGE-DATA";
    const beginIdx = text.indexOf(beginMarker);
    const endIdx = text.indexOf(endMarker);
    if (beginIdx >= 0 && endIdx > beginIdx) {
      jsonStr = text.slice(beginIdx + beginMarker.length, endIdx);
      // Trim leading/trailing decoration like "--"
      jsonStr = jsonStr.replace(/^[\s\-]+|[\s\-]+$/g, "");
    } else {
      // Look for first '{' and last '}'
      const firstBrace = jsonStr.indexOf("{");
      const lastBrace = jsonStr.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }
    }
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.snapshot || !parsed.snapshot.faction) {
        setSavedStatus("Import failed: missing snapshot data");
        return;
      }
      // Validate faction exists
      if (!FACTIONS[parsed.snapshot.faction]) {
        setSavedStatus(`Import failed: unknown faction "${parsed.snapshot.faction}"`);
        return;
      }
      handleLoadArmy(parsed);
      setImportMode(false);
      setImportText("");
      setSavedStatus(`Imported "${parsed.name || 'army'}"`);
    } catch (e) {
      setSavedStatus("Import failed: invalid format");
    }
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setSavedStatus("Copied to clipboard");
    } catch (e) {
      setSavedStatus("Copy failed — select the text manually");
    }
  };

  return (
      <div
          className="min-h-screen w-full"
          style={{
            background:
                "radial-gradient(ellipse at top, #1a0f08 0%, #0a0604 50%, #000 100%)",
            color: "#d4c5a0",
          }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
        .display-font { font-family: 'Cinzel', serif; }
        .body-font { font-family: 'Cormorant Garamond', serif; }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeup { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes flicker { 0%,98%,100% { opacity: 1; } 99% { opacity: 0.4; } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 14px currentColor; } 50% { box-shadow: 0 0 28px currentColor; } }
        .unit-card { animation: fadeup 0.4s ease-out backwards; }
        .glow-button:hover { animation: pulse-glow 1.4s infinite; }
        select.gothic { background: rgba(0,0,0,0.6); color: #d4c5a0; border: 1px solid #2a1f15; padding: 8px 12px; font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.05em; width: 100%; }
        select.gothic:focus { outline: 1px solid var(--accent, #c9b037); }
        input[type="range"] { -webkit-appearance: none; height: 4px; background: #2a1f15; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: var(--accent, #c9b037); border-radius: 50%; cursor: pointer; }
        input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; background: var(--accent, #c9b037); border-radius: 50%; cursor: pointer; border: none; }
        .grain { background-image: radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 3px 3px; }
        .scan { background: repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px); }
      `}</style>

        <div className="max-w-6xl mx-auto p-4 md:p-8 grain">
          {/* HEADER */}
          <div className="mb-8 text-center pb-6 border-b border-stone-900 relative scan">
            <div className="mono-font text-[10px] tracking-[0.4em] text-stone-700 mb-3">
              ⊕ ADEPTUS ADMINISTRATUM ⊕ ORDO TACTICUS ⊕ FORM 666-Δ
            </div>
            <h1 className="display-font text-5xl md:text-7xl font-bold tracking-wider mb-2"
                style={{
                  background: "linear-gradient(180deg, #f5d76e 0%, #c9b037 50%, #8b6914 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
            >
              ARMY FORGE
            </h1>
            <div className="display-font text-sm tracking-[0.3em] text-stone-500 italic">
              ⸺ M41 · TACTICAL DEPLOYMENT GENERATOR ⸺
            </div>
          </div>

          {/* CONTROL PANEL */}
          <div className="mb-8 p-6 md:p-8 border" style={{ background: "rgba(20,12,6,0.6)", borderColor: "#2a1f15" }}>
            {/* FACTION */}
            <div className="mb-8">
              <div className="display-font text-xs tracking-[0.3em] mb-3" style={{ color: factionData.accent }}>
                ◆ FACTION
              </div>
              <button
                  onClick={() => setFactionPickerOpen((o) => !o)}
                  className="w-full p-4 border flex items-center justify-between"
                  style={{ background: `${factionData.color}33`, borderColor: factionData.accent }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl" style={{ color: factionData.accent }}>{factionData.icon}</span>
                  <div className="text-left">
                    <div className="display-font text-lg font-bold tracking-wider" style={{ color: factionData.accent }}>
                      {faction.toUpperCase()}
                    </div>
                    <div className="display-font text-xs italic text-stone-500">"{factionData.motto}"</div>
                  </div>
                </div>
                <span className="mono-font text-xs tracking-widest" style={{ color: factionData.accent }}>
                {factionPickerOpen ? "▲ CLOSE" : "▼ CHANGE"}
              </span>
              </button>
              {factionPickerOpen && (
                  <div className="mt-3 space-y-3">
                    {Object.entries(FACTION_GROUPS).map(([groupName, factionList]) => {
                      // Filter to only factions that actually exist in our data
                      const groupFactions = factionList.filter((name) => FACTIONS[name]);
                      if (groupFactions.length === 0) return null;
                      // Group color hint
                      const groupColor = groupName === "IMPERIUM" ? "#c9b037"
                          : groupName === "CHAOS" ? "#a02020"
                              : "#5a8b8a";
                      return (
                          <div key={groupName}>
                            <div className="display-font text-[10px] tracking-[0.3em] mb-2 pb-1 border-b" style={{ color: groupColor, borderColor: groupColor + "44" }}>
                              ⸺ {groupName} ⸺
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {groupFactions.map((name) => {
                                const data = FACTIONS[name];
                                const active = name === faction;
                                return (
                                    <button
                                        key={name}
                                        onClick={() => { setFaction(name); setFactionPickerOpen(false); }}
                                        className="p-3 border flex items-center gap-2 text-left"
                                        style={{
                                          background: active ? `${data.color}55` : "rgba(0,0,0,0.4)",
                                          borderColor: active ? data.accent : "#2a1f15",
                                        }}
                                    >
                                      <span className="text-xl flex-shrink-0" style={{ color: data.accent }}>{data.icon}</span>
                                      <div className="min-w-0 flex-1">
                                        <div className="display-font text-[11px] font-bold tracking-wider truncate"
                                             style={{ color: active ? data.accent : "#8a7a5a" }}>
                                          {name.toUpperCase()}
                                        </div>
                                      </div>
                                    </button>
                                );
                              })}
                            </div>
                          </div>
                      );
                    })}
                    {/* Show any factions not in any group (defensive — shouldn't happen) */}
                    {(() => {
                      const grouped = new Set(Object.values(FACTION_GROUPS).flat());
                      const ungrouped = Object.entries(FACTIONS).filter(([name]) => !grouped.has(name));
                      if (ungrouped.length === 0) return null;
                      return (
                          <div>
                            <div className="display-font text-[10px] tracking-[0.3em] mb-2 pb-1 border-b" style={{ color: "#7a7a7a", borderColor: "#3a3a3a" }}>
                              ⸺ OTHER ⸺
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {ungrouped.map(([name, data]) => {
                                const active = name === faction;
                                return (
                                    <button key={name} onClick={() => { setFaction(name); setFactionPickerOpen(false); }}
                                            className="p-3 border flex items-center gap-2 text-left"
                                            style={{
                                              background: active ? `${data.color}55` : "rgba(0,0,0,0.4)",
                                              borderColor: active ? data.accent : "#2a1f15",
                                            }}>
                                      <span className="text-xl flex-shrink-0" style={{ color: data.accent }}>{data.icon}</span>
                                      <div className="min-w-0 flex-1">
                                        <div className="display-font text-[11px] font-bold tracking-wider truncate"
                                             style={{ color: active ? data.accent : "#8a7a5a" }}>
                                          {name.toUpperCase()}
                                        </div>
                                      </div>
                                    </button>
                                );
                              })}
                            </div>
                          </div>
                      );
                    })()}
                  </div>
              )}
            </div>

            {/* SAVED ARMIES */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="display-font text-xs tracking-[0.3em]" style={{ color: factionData.accent }}>
                  ⚔ SAVED ARMY LISTS {savedArmies.length > 0 && `(${savedArmies.length})`}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={handleSaveArmy}
                          disabled={!army}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            background: army ? factionData.accent : "transparent",
                            color: army ? "#0a0806" : "#3a2818",
                            borderColor: army ? factionData.accent : "#2a1f15",
                            cursor: army ? "pointer" : "not-allowed",
                          }}>
                    ✚ SAVE CURRENT
                  </button>
                  <button onClick={handleExportArmy}
                          disabled={!army}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            color: army ? "#d4c5a0" : "#3a2818",
                            borderColor: "#2a1f15",
                            cursor: army ? "pointer" : "not-allowed",
                          }}>
                    ↗ EXPORT
                  </button>
                  <button onClick={handleCopyTextList}
                          disabled={!army}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            color: army ? "#d4c5a0" : "#3a2818",
                            borderColor: "#2a1f15",
                            cursor: army ? "pointer" : "not-allowed",
                          }}
                          title="Copy a clean shareable text list (no JSON) to your clipboard">
                    📋 COPY LIST
                  </button>
                  <button onClick={() => { setImportMode((m) => !m); setExportMode(false); }}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            background: importMode ? factionData.accent : "transparent",
                            color: importMode ? "#0a0806" : "#d4c5a0",
                            borderColor: "#2a1f15",
                          }}>
                    ↙ IMPORT
                  </button>
                  <button onClick={() => setSavedPanelOpen((o) => !o)}
                          disabled={savedArmies.length === 0}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            background: savedPanelOpen ? factionData.accent : "transparent",
                            color: savedPanelOpen ? "#0a0806" : (savedArmies.length === 0 ? "#3a2818" : "#d4c5a0"),
                            borderColor: "#2a1f15",
                            cursor: savedArmies.length === 0 ? "not-allowed" : "pointer",
                          }}>
                    {savedPanelOpen ? "▲ HIDE" : `▼ LIST ${savedArmies.length > 0 ? `(${savedArmies.length})` : ""}`}
                  </button>
                  <button onClick={() => setBattleSimOpen(true)}
                          disabled={savedArmies.length === 0}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            background: savedArmies.length > 0 ? "linear-gradient(180deg, #5a1a1a, #2a0808)" : "transparent",
                            color: savedArmies.length > 0 ? "#f5d76e" : "#3a2818",
                            borderColor: savedArmies.length > 0 ? "#c9b037" : "#2a1f15",
                            cursor: savedArmies.length === 0 ? "not-allowed" : "pointer",
                          }}>
                    ⚔ BATTLE SIM
                  </button>
                  <button onClick={() => setOverridesPanelOpen(true)}
                          className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                          style={{
                            background: Object.keys(pointOverrides).length > 0 ? "rgba(201,176,55,0.15)" : "transparent",
                            color: "#d4c5a0",
                            borderColor: Object.keys(pointOverrides).length > 0 ? "#c9b037" : "#2a1f15",
                          }}
                          title="Edit point values to match the latest Munitorum Field Manual">
                    ⚒ POINTS{Object.keys(pointOverrides).length > 0 ? ` (${Object.keys(pointOverrides).length})` : ""}
                  </button>
                </div>
              </div>

              {savedStatus && (
                  <div className="mono-font text-[11px] mb-2 italic tracking-wider" style={{ color: factionData.accent }}>
                    ◆ {savedStatus}
                  </div>
              )}

              {!storageAvailable && (
                  <div className="mono-font text-[10px] mb-2 italic" style={{ color: "#a05050" }}>
                    ⚠ Persistent storage is unavailable in this environment (browser may be in private mode). Saved armies will not survive a reload — use Export/Import to keep lists.
                  </div>
              )}
              {storageAvailable && armyStorage.kind === "localStorage" && savedArmies.length === 0 && (
                  <div className="mono-font text-[9px] mb-2 italic" style={{ color: "#5a8b2a" }}>
                    ✓ Saving to browser storage — armies persist across reloads on this device.
                  </div>
              )}

              {/* EXPORT BLOCK */}
              {exportMode && exportText && (
                  <div className="border p-4 mb-3" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.4)" }}>
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <div className="mono-font text-[10px] tracking-widest" style={{ color: factionData.accent }}>
                        ◆ EXPORT TEXT — COPY AND SHARE
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={handleCopyExport}
                                className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                style={{ background: factionData.accent, color: "#0a0806", borderColor: factionData.accent }}>
                          ❐ COPY
                        </button>
                        <button onClick={() => setExportMode(false)}
                                className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                style={{ color: "#8a7a5a", borderColor: "#2a1f15" }}>
                          ✕ CLOSE
                        </button>
                      </div>
                    </div>
                    <textarea value={exportText} readOnly
                              className="w-full mono-font text-[11px] p-3"
                              style={{
                                background: "rgba(0,0,0,0.6)",
                                color: "#d4c5a0",
                                border: "1px solid #2a1f15",
                                minHeight: "180px",
                                resize: "vertical",
                              }}
                    />
                  </div>
              )}

              {/* IMPORT BLOCK */}
              {importMode && (
                  <div className="border p-4 mb-3" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.4)" }}>
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <div className="mono-font text-[10px] tracking-widest" style={{ color: factionData.accent }}>
                        ◆ PASTE EXPORTED ARMY LIST
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={handleImportArmy}
                                className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                style={{ background: factionData.accent, color: "#0a0806", borderColor: factionData.accent }}>
                          ✓ LOAD
                        </button>
                        <button onClick={() => { setImportMode(false); setImportText(""); }}
                                className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                style={{ color: "#8a7a5a", borderColor: "#2a1f15" }}>
                          ✕ CANCEL
                        </button>
                      </div>
                    </div>
                    <textarea value={importText}
                              onChange={(e) => setImportText(e.target.value)}
                              placeholder="Paste the entire export block (or just the JSON)..."
                              className="w-full mono-font text-[11px] p-3"
                              style={{
                                background: "rgba(0,0,0,0.6)",
                                color: "#d4c5a0",
                                border: "1px solid #2a1f15",
                                minHeight: "120px",
                                resize: "vertical",
                              }}
                    />
                  </div>
              )}

              {/* SAVED LIST */}
              {savedPanelOpen && savedArmies.length > 0 && (
                  <div className="border p-3" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.3)" }}>
                    {/* Search + sort controls — only show if you have enough armies for it to matter */}
                    {savedArmies.length >= 4 && (
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <input
                              type="text"
                              value={savedSearch}
                              onChange={(e) => setSavedSearch(e.target.value)}
                              placeholder="🔍 Filter by name or faction..."
                              className="gothic text-xs"
                              style={{ flex: 1, minWidth: "150px" }}
                          />
                          <div className="flex items-center gap-1">
                            <span className="mono-font text-[10px] text-stone-600 tracking-wider">SORT:</span>
                            {[
                              { key: "recent",  label: "RECENT" },
                              { key: "name",    label: "NAME" },
                              { key: "faction", label: "FACTION" },
                              { key: "points",  label: "POINTS" },
                            ].map((opt) => (
                                <button key={opt.key} onClick={() => setSavedSortBy(opt.key)}
                                        className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                        style={{
                                          background: savedSortBy === opt.key ? factionData.accent : "transparent",
                                          color: savedSortBy === opt.key ? "#0a0806" : "#8a7a5a",
                                          borderColor: "#2a1f15",
                                        }}>
                                  {opt.label}
                                </button>
                            ))}
                          </div>
                        </div>
                    )}
                    <div className="space-y-2">
                      {(() => {
                        let list = [...savedArmies];
                        if (savedSearch && savedSearch.trim()) {
                          const q = savedSearch.toLowerCase();
                          list = list.filter((a) =>
                              (a.name || "").toLowerCase().includes(q) ||
                              (a.snapshot?.faction || "").toLowerCase().includes(q) ||
                              (a.snapshot?.detachment || "").toLowerCase().includes(q)
                          );
                        }
                        if (savedSortBy === "name") {
                          list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                        } else if (savedSortBy === "faction") {
                          list.sort((a, b) => (a.snapshot?.faction || "").localeCompare(b.snapshot?.faction || ""));
                        } else if (savedSortBy === "points") {
                          list.sort((a, b) => {
                            const aPts = (a.snapshot?.spent || 0) + (a.snapshot?.enhancementSpend || 0);
                            const bPts = (b.snapshot?.spent || 0) + (b.snapshot?.enhancementSpend || 0);
                            return bPts - aPts;
                          });
                        } else {
                          list.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
                        }
                        if (list.length === 0 && savedSearch) {
                          return (
                              <div key="no-match" className="py-6 text-center mono-font text-xs text-stone-600 italic">
                                No armies match "{savedSearch}"
                              </div>
                          );
                        }
                        return list.map((entry) => {
                          const fdata = FACTIONS[entry.snapshot.faction];
                          const isRenaming = renamingKey === entry.key;
                          const totalPts = (entry.snapshot.spent || 0) + (entry.snapshot.enhancementSpend || 0);
                          return (
                              <div key={entry.key} className="border p-3"
                                   style={{
                                     background: "rgba(0,0,0,0.4)",
                                     borderColor: fdata?.accent || "#2a1f15",
                                     borderLeftWidth: "3px",
                                   }}>
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-xl flex-shrink-0" style={{ color: fdata?.accent }}>
                              {fdata?.icon}
                            </span>
                                    <div className="min-w-0 flex-1">
                                      {isRenaming ? (
                                          <input value={renameDraft}
                                                 onChange={(e) => setRenameDraft(e.target.value)}
                                                 onKeyDown={(e) => {
                                                   if (e.key === "Enter") handleRenameArmy(entry);
                                                   if (e.key === "Escape") { setRenamingKey(null); setRenameDraft(""); }
                                                 }}
                                                 autoFocus
                                                 className="mono-font text-sm w-full px-2 py-1"
                                                 style={{ background: "rgba(0,0,0,0.6)", color: fdata?.accent, border: `1px solid ${fdata?.accent}` }}
                                          />
                                      ) : (
                                          <div className="display-font text-sm font-semibold truncate" style={{ color: fdata?.accent }}>
                                            {entry.name}
                                          </div>
                                      )}
                                      <div className="mono-font text-[10px] text-stone-500 mt-0.5 tracking-wider">
                                        {entry.snapshot.subFaction} · {entry.snapshot.detachment} · {totalPts}pts · {(entry.snapshot.units || []).length} units
                                        {entry.savedAt && (
                                            <span className="ml-2 text-stone-600">{new Date(entry.savedAt).toLocaleDateString()}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {isRenaming ? (
                                        <>
                                          <button onClick={() => handleRenameArmy(entry)}
                                                  className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                                  style={{ background: fdata?.accent, color: "#0a0806", borderColor: fdata?.accent }}>
                                            ✓ SAVE
                                          </button>
                                          <button onClick={() => { setRenamingKey(null); setRenameDraft(""); }}
                                                  className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                                  style={{ color: "#8a7a5a", borderColor: "#2a1f15" }}>
                                            ✕
                                          </button>
                                        </>
                                    ) : (
                                        <>
                                          <button onClick={() => handleLoadArmy(entry)}
                                                  className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                                  style={{ background: fdata?.accent, color: "#0a0806", borderColor: fdata?.accent }}>
                                            ▶ LOAD
                                          </button>
                                          <button onClick={() => { setRenamingKey(entry.key); setRenameDraft(entry.name); }}
                                                  className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                                  style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>
                                            ✎ RENAME
                                          </button>
                                          <button onClick={() => handleDeleteArmy(entry)}
                                                  className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                                  style={{ color: "#a05050", borderColor: "#3a1818" }}>
                                            ✕ DELETE
                                          </button>
                                        </>
                                    )}
                                  </div>
                                </div>
                              </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
              )}

              {savedPanelOpen && savedArmies.length === 0 && (
                  <div className="border border-dashed p-4 text-center mono-font text-[11px] tracking-wider"
                       style={{ borderColor: "#2a1f15", color: "#8a7a5a" }}>
                    NO SAVED LISTS · GENERATE AND SAVE AN ARMY TO BEGIN
                  </div>
              )}
            </div>

            {/* SUB-FACTION & DETACHMENT */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="display-font text-xs tracking-[0.3em] mb-3" style={{ color: factionData.accent }}>
                  ◆ SUB-FACTION / CHAPTER
                </div>
                <select className="gothic" value={subFaction} onChange={(e) => setSubFaction(e.target.value)}
                        style={{ "--accent": factionData.accent }}>
                  {Object.keys(factionData.subFactions).map((sf) => (
                      <option key={sf} value={sf}>{sf}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="display-font text-xs tracking-[0.3em] mb-3" style={{ color: factionData.accent }}>
                  ◆ DETACHMENT
                </div>
                <select className="gothic" value={detachment} onChange={(e) => setDetachment(e.target.value)}
                        style={{ "--accent": factionData.accent }}>
                  {Object.keys(factionData.detachments).map((d) => (
                      <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {detachmentData && (
                    <div className="mono-font text-[10px] italic mt-2 leading-relaxed" style={{ color: "#8a7a5a" }}>
                      ↳ {detachmentData.rule}
                    </div>
                )}
              </div>
            </div>

            {/* MODE TOGGLE — choose between generate (random army) and manual (build from scratch) */}
            <div className="mb-8">
              <div className="display-font text-xs tracking-[0.3em] mb-4" style={{ color: factionData.accent }}>
                ⸺ BUILD MODE
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setBuildMode("generate")}
                    className="p-4 text-left border-2 transition-all"
                    style={{
                      background: buildMode === "generate" ? `${factionData.accent}1a` : "transparent",
                      borderColor: buildMode === "generate" ? factionData.accent : "#2a1f15",
                    }}
                >
                  <div className="display-font text-sm font-bold tracking-wider mb-1"
                       style={{ color: buildMode === "generate" ? factionData.accent : "#8a7a5a" }}>
                    ⚔ GENERATE
                  </div>
                  <div className="text-[10px] text-stone-500 italic leading-tight">
                    Auto-generate a random list using doctrine, combos, and pinned units. Edit afterwards.
                  </div>
                </button>
                <button
                    onClick={() => setBuildMode("manual")}
                    className="p-4 text-left border-2 transition-all"
                    style={{
                      background: buildMode === "manual" ? `${factionData.accent}1a` : "transparent",
                      borderColor: buildMode === "manual" ? factionData.accent : "#2a1f15",
                    }}
                >
                  <div className="display-font text-sm font-bold tracking-wider mb-1"
                       style={{ color: buildMode === "manual" ? factionData.accent : "#8a7a5a" }}>
                    ⚒ BUILD MANUALLY
                  </div>
                  <div className="text-[10px] text-stone-500 italic leading-tight">
                    Start with an empty army and add every unit by hand. Full control, no random generation.
                  </div>
                </button>
              </div>
            </div>

            {/* POINTS & DOCTRINE */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="display-font text-xs tracking-[0.3em] mb-4" style={{ color: factionData.accent }}>
                  ⸺ POINT LIMIT
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                <span className="display-font text-5xl font-bold" style={{ color: "#e8d77a" }}>
                  {points}
                </span>
                  <span className="mono-font text-xs tracking-widest text-stone-600">PTS</span>
                </div>
                <input type="range" min="500" max="3000" step="50" value={points}
                       onChange={(e) => setPoints(parseInt(e.target.value))}
                       className="w-full" style={{ "--accent": factionData.accent }}
                />
                <div className="flex justify-between mono-font text-[10px] text-stone-700 mt-2 tracking-wider">
                  <span>500 · COMBAT PATROL</span>
                  <span>2000 · STRIKE FORCE</span>
                  <span>3000 · ONSLAUGHT</span>
                </div>
              </div>
              {buildMode === "generate" && (
                  <div>
                    <div className="display-font text-xs tracking-[0.3em] mb-4" style={{ color: factionData.accent }}>
                      ⸺ DOCTRINE
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ARMY_TYPES).map(([key, type]) => {
                        const active = key === armyType;
                        return (
                            <button key={key} onClick={() => setArmyType(key)} className="p-2 text-left border"
                                    style={{
                                      background: active ? `${factionData.accent}1a` : "transparent",
                                      borderColor: active ? factionData.accent : "#2a1f15",
                                    }}
                            >
                              <div className="display-font text-xs font-semibold tracking-wider"
                                   style={{ color: active ? factionData.accent : "#8a7a5a" }}>
                                {type.label.toUpperCase()}
                              </div>
                              <div className="text-[10px] text-stone-600 italic mt-0.5 leading-tight">
                                {type.description}
                              </div>
                            </button>
                        );
                      })}
                    </div>
                  </div>
              )}
            </div>
            {/* REQUIRED ROLES — only relevant when generating */}
            {buildMode === "generate" && (
                <div className="mb-8">
                  <div className="display-font text-xs tracking-[0.3em] mb-4" style={{ color: factionData.accent }}>
                    ⸺ REQUIRED BATTLEFIELD ROLES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ROLE_LABELS).map(([key, label]) => {
                      const active = requiredRoles.includes(key);
                      return (
                          <button key={key} onClick={() => toggleRole(key)}
                                  className="px-4 py-2 mono-font text-xs tracking-widest border"
                                  style={{
                                    background: active ? factionData.accent : "transparent",
                                    color: active ? "#0a0806" : "#8a7a5a",
                                    borderColor: active ? factionData.accent : "#2a1f15",
                                  }}
                          >
                            {active ? "▣" : "▢"} {label.toUpperCase()}
                          </button>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-stone-600 italic mt-2">
                    HQ is always included. Selected roles are guaranteed at least one unit.
                  </div>
                </div>
            )}

            {/* COMBO PACKAGES — generation-only feature */}
            {buildMode === "generate" && combos.length > 0 && (
                <div className="mb-8">
                  <div className="display-font text-xs tracking-[0.3em] mb-4" style={{ color: factionData.accent }}>
                    ⚜ CORE COMBOS · CURATED UNIT PACKAGES
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {combos.map((combo) => {
                      const active = selectedCombo === combo.name;
                      return (
                          <button
                              key={combo.name}
                              onClick={() => selectCombo(combo.name)}
                              className="p-3 text-left border"
                              style={{
                                background: active ? `${factionData.accent}1a` : "rgba(0,0,0,0.4)",
                                borderColor: active ? factionData.accent : "#2a1f15",
                              }}
                          >
                            <div className="display-font text-sm font-semibold tracking-wide flex items-center gap-2"
                                 style={{ color: active ? factionData.accent : "#d4c5a0" }}>
                              {active ? "▣" : "▢"} {combo.name}
                            </div>
                            <div className="text-[11px] text-stone-500 italic mt-1 leading-tight">
                              {combo.description}
                            </div>
                            <div className="mono-font text-[10px] text-stone-600 mt-2 leading-relaxed">
                              ↳ {combo.units.join(" · ")}
                            </div>
                          </button>
                      );
                    })}
                  </div>
                  {selectedCombo && (
                      <div className="mono-font text-[11px] mt-3 text-right tracking-wider" style={{ color: factionData.accent }}>
                        ✦ COMBO LOCKED IN — UNITS WILL BE PINNED
                      </div>
                  )}
                </div>
            )}

            {/* PIN INDIVIDUAL UNITS — generation-only feature (manual mode adds units directly) */}
            {buildMode === "generate" && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="display-font text-xs tracking-[0.3em]" style={{ color: factionData.accent }}>
                      ⚒ PIN UNITS · MUST-INCLUDE LIST {pinnedUnits.length > 0 && `(${pinnedUnits.length})`}
                    </div>
                    <button onClick={() => setPinPanelOpen((o) => !o)}
                            className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                            style={{
                              background: pinPanelOpen ? factionData.accent : "transparent",
                              color: pinPanelOpen ? "#0a0806" : "#8a7a5a",
                              borderColor: factionData.accent,
                            }}
                    >
                      {pinPanelOpen ? "▲ COLLAPSE" : "▼ EXPAND"}
                    </button>
                  </div>

                  {pinnedUnits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pinnedUnits.map((name) => {
                          const def = unitLookup[name];
                          return (
                              <button
                                  key={name}
                                  onClick={() => togglePinnedUnit(name)}
                                  className="mono-font text-[11px] tracking-wider px-3 py-1 border flex items-center gap-2"
                                  style={{ background: `${factionData.accent}22`, borderColor: factionData.accent, color: factionData.accent }}
                              >
                                ✦ {name} {def && <span className="text-stone-500">({def.points}pts)</span>} <span className="text-stone-500">✕</span>
                              </button>
                          );
                        })}
                      </div>
                  )}

                  {pinPanelOpen && (
                      <div className="border p-4" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.3)" }}>
                        {/* Role tabs */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {Object.entries(ROLE_LABELS).map(([key, label]) => {
                            const active = pinSearchRole === key;
                            const count = (currentUnitPool[key] || []).length;
                            if (count === 0) return null;
                            return (
                                <button key={key} onClick={() => setPinSearchRole(key)}
                                        className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                        style={{
                                          background: active ? factionData.accent : "transparent",
                                          color: active ? "#0a0806" : "#8a7a5a",
                                          borderColor: active ? factionData.accent : "#2a1f15",
                                        }}
                                >
                                  {label.toUpperCase()} · {count}
                                </button>
                            );
                          })}
                        </div>

                        {/* Unit list for selected role */}
                        <div className="grid md:grid-cols-2 gap-1.5 max-h-96 overflow-y-auto">
                          {(currentUnitPool[pinSearchRole] || []).map((u) => {
                            const isPinned = pinnedUnits.includes(u.name);
                            const synergies = getSynergyHints(u.name);
                            return (
                                <button
                                    key={u.name}
                                    onClick={() => togglePinnedUnit(u.name)}
                                    className="p-2 text-left border"
                                    style={{
                                      background: isPinned ? `${factionData.accent}22` : "rgba(0,0,0,0.4)",
                                      borderColor: isPinned ? factionData.accent : "#2a1f15",
                                    }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                          <span className="display-font text-[13px]"
                                style={{ color: isPinned ? factionData.accent : "#d4c5a0" }}>
                            {isPinned ? "▣" : "▢"} {u.name}
                          </span>
                                    <span className="mono-font text-[11px]" style={{ color: factionData.accent }}>
                            {u.points}<span className="text-stone-600 text-[9px] ml-0.5">pts</span>
                          </span>
                                  </div>
                                  {synergies.length > 0 && (
                                      <div className="mono-font text-[9px] text-stone-500 mt-1 italic leading-tight">
                                        ↳ pairs well with: {synergies.slice(0, 3).join(", ")}
                                      </div>
                                  )}
                                </button>
                            );
                          })}
                        </div>
                        <div className="text-[10px] text-stone-600 italic mt-2">
                          Tip: pinning a leader will hint at units that synergize with them. The generator will fill the rest of the army around your pinned units.
                        </div>
                      </div>
                  )}
                </div>
            )}

            {/* ENHANCEMENTS */}
            {detachmentData && detachmentData.enhancements.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="display-font text-xs tracking-[0.3em]" style={{ color: factionData.accent }}>
                      ⸺ ENHANCEMENTS · {detachment}
                    </div>
                    <button onClick={() => setEnhancementsEnabled((e) => !e)}
                            className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                            style={{
                              background: enhancementsEnabled ? factionData.accent : "transparent",
                              color: enhancementsEnabled ? "#0a0806" : "#8a7a5a",
                              borderColor: factionData.accent,
                            }}
                    >
                      {enhancementsEnabled ? "▣ ENABLED" : "▢ DISABLED"}
                    </button>
                  </div>
                  <div className={`grid md:grid-cols-2 gap-2 transition-opacity ${
                      enhancementsEnabled ? "opacity-100" : "opacity-40 pointer-events-none"
                  }`}>
                    {detachmentData.enhancements.map((enh) => {
                      const active = selectedEnhancements.includes(enh.name);
                      return (
                          <button key={enh.name} onClick={() => toggleEnhancement(enh.name)}
                                  className="p-3 text-left border flex items-start justify-between gap-2"
                                  style={{
                                    background: active ? `${factionData.accent}1a` : "rgba(0,0,0,0.4)",
                                    borderColor: active ? factionData.accent : "#2a1f15",
                                  }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="display-font text-sm font-semibold tracking-wide"
                                   style={{ color: active ? factionData.accent : "#d4c5a0" }}>
                                {active ? "▣" : "▢"} {enh.name}
                              </div>
                              <div className="mono-font text-[10px] text-stone-600 mt-1 tracking-wider uppercase">
                                {enh.type}
                              </div>
                            </div>
                            <div className="mono-font text-sm font-bold" style={{ color: factionData.accent }}>
                              +{enh.points}<span className="text-stone-600 text-[10px] ml-0.5">pts</span>
                            </div>
                          </button>
                      );
                    })}
                  </div>
                  {enhancementsEnabled && enhancementTotalCost > 0 && (
                      <div className="mono-font text-xs mt-3 text-right tracking-wider" style={{ color: factionData.accent }}>
                        ENHANCEMENT BUDGET: {enhancementTotalCost} PTS
                      </div>
                  )}
                </div>
            )}

            {/* GENERATE / BUILD BUTTON */}
            <div className="flex flex-col items-center gap-2">
              <button
                  onClick={buildMode === "generate" ? handleGenerate : handleStartManual}
                  disabled={generating}
                  className="glow-button display-font px-12 py-4 text-sm tracking-[0.3em] font-bold border-2 transition-all"
                  style={{
                    background: `linear-gradient(180deg, ${factionData.color} 0%, #000 100%)`,
                    color: factionData.accent,
                    borderColor: factionData.accent,
                    cursor: generating ? "wait" : "pointer",
                  }}
              >
                {buildMode === "generate"
                    ? (generating ? "✦ INVOKING THE MACHINE SPIRIT ✦" : "⚔ FORGE ARMY ⚔")
                    : "⚒ START MANUAL BUILD ⚒"}
              </button>
              {/* Tiny keyboard hint */}
              <div className="mono-font text-[10px] tracking-widest text-stone-700 mt-1">
                <kbd style={{ padding: "1px 4px", border: "1px solid #2a1f15", background: "rgba(0,0,0,0.4)" }}>G</kbd>
                <span className="mx-1">generate</span>
                <span className="text-stone-800">·</span>
                <kbd style={{ padding: "1px 4px", border: "1px solid #2a1f15", background: "rgba(0,0,0,0.4)", marginLeft: "4px" }}>S</kbd>
                <span className="mx-1">save</span>
                <span className="text-stone-800">·</span>
                <kbd style={{ padding: "1px 4px", border: "1px solid #2a1f15", background: "rgba(0,0,0,0.4)", marginLeft: "4px" }}>B</kbd>
                <span className="mx-1">battle</span>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          {army && (
              <div id="results" className="border p-6 md:p-10"
                   style={{
                     background: `linear-gradient(180deg, ${army.factionData.color}22 0%, rgba(10,8,6,0.95) 50%)`,
                     borderColor: army.factionData.accent,
                     boxShadow: `0 0 40px ${army.factionData.accent}22`,
                   }}
              >
                <div className="text-center mb-8 pb-6 border-b" style={{ borderColor: "#3a2818" }}>
                  <div className="mono-font text-[10px] tracking-[0.4em] text-stone-600 mb-2">
                    ◆ ORDO TACTICUS · DOSSIER #{Math.floor(Math.random() * 9000 + 1000)} {army._manual ? "· HAND-FORGED" : ""} ◆
                  </div>
                  <div className="display-font text-5xl mb-2" style={{ color: army.factionData.accent }}>
                    {army.factionData.icon}
                  </div>
                  <h2 className="display-font text-3xl md:text-4xl font-bold mb-1" style={{ color: army.factionData.accent }}>
                    {army.faction.toUpperCase()}
                  </h2>
                  <div className="display-font text-sm tracking-widest text-stone-400 mb-1">
                    {army.subFaction.toUpperCase()}
                  </div>
                  <div className="display-font text-sm italic text-stone-500 mb-1">
                    "{army.factionData.motto}"
                  </div>
                  <div className="mono-font text-xs tracking-widest mt-3" style={{ color: army.factionData.accent }}>
                    ⟨ {army.detachment.toUpperCase()} ⟩
                  </div>
                  {army.comboName && (
                      <div className="mono-font text-[11px] tracking-widest mt-1 text-stone-500">
                        ⚜ COMBO: {army.comboName.toUpperCase()}
                      </div>
                  )}
                  <div className="flex justify-center gap-6 md:gap-8 mt-4 flex-wrap">
                    <Stat label="Total" value={`${army.spent + army.enhancementSpend} / ${points}`} accent={army.factionData.accent} />
                    <Stat label="Units" value={army.units.length} accent={army.factionData.accent} />
                    <Stat label="Doctrine" value={ARMY_TYPES[armyType].label} accent={army.factionData.accent} />
                    {army.enhancementSpend > 0 && (
                        <Stat label="Enhancements" value={`+${army.enhancementSpend}pts`} accent={army.factionData.accent} />
                    )}
                  </div>
                  {/* BUDGET BAR — visual indicator of points usage with over/under tinting */}
                  {(() => {
                    const used = army.spent + army.enhancementSpend;
                    const ratio = points > 0 ? used / points : 0;
                    const over = used > points;
                    const under = used < points * 0.95;   // > 5% under is worth flagging
                    // Color: green when nearly-full, amber when under, red when over
                    const barColor = over ? "#a05050" : (under ? "#7a6840" : "#5a8b2a");
                    return (
                        <div className="max-w-md mx-auto mt-3">
                          <div className="relative h-1.5 border" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.4)" }}>
                            <div
                                className="absolute top-0 left-0 h-full transition-all"
                                style={{
                                  width: `${Math.min(100, ratio * 100)}%`,
                                  background: barColor,
                                  opacity: 0.85,
                                }}
                            />
                            {/* Over-budget marker beyond the 100% line */}
                            {over && (
                                <div
                                    className="absolute top-0 h-full"
                                    style={{
                                      left: "100%",
                                      width: `${Math.min(50, (ratio - 1) * 100)}%`,
                                      background: "#a05050",
                                      opacity: 0.4,
                                      borderLeft: "2px solid #a05050",
                                    }}
                                />
                            )}
                          </div>
                          <div className="mono-font text-[10px] text-center mt-1 tracking-wider" style={{ color: barColor }}>
                            {over
                                ? `⚠ OVER BUDGET BY ${used - points}pts — list will fail at tournament check-in`
                                : under
                                    ? `↓ ${points - used}pts unspent — could fit another unit or enhancement`
                                    : `✓ within tournament-legal range (${points - used}pts headroom)`
                            }
                          </div>
                        </div>
                    );
                  })()}
                </div>

                {/* SELECTED ENHANCEMENTS */}
                {army.selectedEnhancements && army.selectedEnhancements.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-grow" style={{ background: `${army.factionData.accent}44` }} />
                        <div className="display-font text-xs tracking-[0.3em] font-bold" style={{ color: army.factionData.accent }}>
                          SELECTED ENHANCEMENTS · {army.selectedEnhancements.length}
                        </div>
                        <div className="h-px flex-grow" style={{ background: `${army.factionData.accent}44` }} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {army.selectedEnhancements.map((enhName, idx) => {
                          const enh = army.factionData.detachments[army.detachment].enhancements.find((e) => e.name === enhName);
                          return (
                              <div key={enhName} className="unit-card flex justify-between items-center px-4 py-3 border"
                                   style={{
                                     background: `${army.factionData.accent}11`,
                                     borderColor: army.factionData.accent,
                                     animationDelay: `${idx * 0.06}s`,
                                   }}
                              >
                                <div>
                                  <div className="display-font text-sm font-semibold" style={{ color: army.factionData.accent }}>
                                    ✦ {enhName}
                                  </div>
                                  <div className="mono-font text-[10px] text-stone-600 mt-0.5 tracking-wider uppercase">
                                    {enh?.type}
                                  </div>
                                </div>
                                <div className="mono-font text-sm" style={{ color: "#d4c5a0" }}>
                                  {enh?.points}<span className="text-stone-600 text-xs ml-1">pts</span>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                    </div>
                )}

                {/* EDITOR HEADER */}
                <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="display-font text-xs tracking-[0.3em]" style={{ color: army.factionData.accent }}>
                    ⚒ ARMY ROSTER · CLICK ANY UNIT TO EDIT
                  </div>
                  <div className="mono-font text-[11px] tracking-wider text-stone-500">
                    ◆ ◆ ◆
                  </div>
                </div>

                {/* UNITS BY ROLE — EDITABLE */}
                {Object.entries(ROLE_LABELS).map(([role, label]) =>
                    groupedUnits && groupedUnits[role] ? (
                        <div key={role} className="mb-7">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-grow" style={{ background: `${army.factionData.accent}44` }} />
                            <div className="display-font text-xs tracking-[0.3em] font-bold" style={{ color: army.factionData.accent }}>
                              {label.toUpperCase()} · {groupedUnits[role].length}
                            </div>
                            <div className="h-px flex-grow" style={{ background: `${army.factionData.accent}44` }} />
                            <button
                                onClick={() => {
                                  // Toggle the picker for this role; closes any other open picker
                                  if (pickerOpenRole === role) {
                                    setPickerOpenRole(null);
                                    setPickerSearch("");
                                  } else {
                                    setPickerOpenRole(role);
                                    setPickerSearch("");
                                    // Close custom-unit form if open
                                    if (customUnitOpenRole) setCustomUnitOpenRole(null);
                                  }
                                }}
                                className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                style={{
                                  borderColor: pickerOpenRole === role ? army.factionData.accent : army.factionData.accent,
                                  color: pickerOpenRole === role ? "#0a0806" : army.factionData.accent,
                                  background: pickerOpenRole === role ? army.factionData.accent : "transparent",
                                }}
                            >
                              {pickerOpenRole === role ? "✕ CLOSE" : "+ ADD"}
                            </button>
                            <button
                                onClick={() => {
                                  // Add a random unit from this role (quick mode)
                                  const pool = currentUnitPool[role];
                                  if (!pool || pool.length === 0) return;
                                  const available = pool.filter((u) => {
                                    const count = army.units.filter((existing) => existing.name === u.name).length;
                                    return count < u.max;
                                  });
                                  if (available.length === 0) return;
                                  const pick = available[Math.floor(Math.random() * available.length)];
                                  editorAddUnit(pick.name);
                                }}
                                className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                style={{
                                  borderColor: "#3a2818",
                                  color: "#8a7a5a",
                                  background: "transparent",
                                }}
                                title="Add a random unit from this role"
                            >
                              🎲
                            </button>
                            <button
                                onClick={() => {
                                  if (customUnitOpenRole === role) {
                                    setCustomUnitOpenRole(null);
                                  } else {
                                    setCustomUnitOpenRole(role);
                                    setCustomUnitDraft({ name: "", points: "", squadSize: "" });
                                    // Close picker if open
                                    if (pickerOpenRole) setPickerOpenRole(null);
                                  }
                                }}
                                className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                style={{
                                  borderColor: customUnitOpenRole === role ? "#c9b037" : "#3a2818",
                                  color: customUnitOpenRole === role ? "#c9b037" : "#8a7a5a",
                                  background: customUnitOpenRole === role ? "rgba(201,176,55,0.08)" : "transparent",
                                }}
                                title="Add a unit not in the codex (e.g. brand-new release)"
                            >
                              + CUSTOM
                            </button>
                          </div>
                          {/* UNIT PICKER — shows all available units in this role with points + max */}
                          {pickerOpenRole === role && (
                              <div className="mb-3 p-3 border" style={{ borderColor: army.factionData.accent, background: `${army.factionData.color}11` }}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="mono-font text-[10px] tracking-widest" style={{ color: army.factionData.accent }}>
                                    ⚒ CHOOSE {label.toUpperCase()} UNIT
                                  </div>
                                  <input
                                      type="text"
                                      value={pickerSearch}
                                      onChange={(e) => setPickerSearch(e.target.value)}
                                      placeholder="search..."
                                      className="gothic text-xs"
                                      style={{ width: 160 }}
                                      autoFocus
                                  />
                                </div>
                                <div className="grid md:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                                  {(currentUnitPool[role] || [])
                                      .filter((u) => !pickerSearch || u.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                                      .sort((a, b) => a.name.localeCompare(b.name))
                                      .map((u) => {
                                        const count = army.units.filter((ex) => ex.name === u.name).length;
                                        const atMax = count >= u.max;
                                        return (
                                            <button
                                                key={u.name}
                                                onClick={() => {
                                                  if (atMax) return;
                                                  editorAddUnit(u.name);
                                                }}
                                                disabled={atMax}
                                                className="text-left p-2 border transition-all"
                                                style={{
                                                  borderColor: atMax ? "#2a1f15" : "#3a2818",
                                                  background: atMax ? "transparent" : "rgba(0,0,0,0.3)",
                                                  opacity: atMax ? 0.4 : 1,
                                                  cursor: atMax ? "not-allowed" : "pointer",
                                                }}
                                            >
                                              <div className="display-font text-xs flex items-center justify-between gap-2">
                                                <span className="text-stone-200 truncate">{u.name}</span>
                                                <span className="mono-font text-[10px] flex-shrink-0" style={{ color: army.factionData.accent }}>
                                    {u.points}p
                                  </span>
                                              </div>
                                              {/* Stat preview line — quick read of M/T/Sv/W/A */}
                                              {(() => {
                                                const previewStats = computeUnitStats({ name: u.name, role, points: u.points, qty: 1 });
                                                const ps = previewStats.stats || {};
                                                return (
                                                    <div className="mono-font text-[9px] mt-0.5 flex justify-between" style={{ color: "#7a8aa0" }} title="Heuristic statline preview (Move · Toughness · Save · Wounds · Attacks)">
                                                      <span>M{ps.M ?? 6} T{ps.T ?? 4} Sv{ps.Sv ?? 4}+ W{ps.W ?? previewStats.woundsPerModel} A{ps.AT ?? 1}</span>
                                                      <span className="text-stone-600">{previewStats.modelCount > 1 ? `×${previewStats.modelCount}` : ""}</span>
                                                    </div>
                                                );
                                              })()}
                                              <div className="mono-font text-[9px] text-stone-600 mt-0.5">
                                                max {u.max} · {count > 0 ? `${count} taken` : "none yet"}
                                              </div>
                                            </button>
                                        );
                                      })}
                                </div>
                                {(currentUnitPool[role] || []).filter((u) => !pickerSearch || u.name.toLowerCase().includes(pickerSearch.toLowerCase())).length === 0 && (
                                    <div className="text-center py-3 mono-font text-[10px] text-stone-600 italic">
                                      No units match "{pickerSearch}"
                                    </div>
                                )}
                              </div>
                          )}
                          {/* CUSTOM UNIT INLINE FORM */}
                          {customUnitOpenRole === role && (
                              <div className="mb-3 p-3 border" style={{ borderColor: "#c9b037", background: "rgba(201,176,55,0.05)" }}>
                                <div className="mono-font text-[10px] tracking-widest mb-2" style={{ color: "#c9b037" }}>
                                  ⚒ ADD CUSTOM {label.toUpperCase()}
                                </div>
                                <div className="flex flex-wrap gap-2 items-end">
                                  <div className="flex-1 min-w-[180px]">
                                    <div className="mono-font text-[9px] tracking-widest text-stone-600 mb-1">UNIT NAME</div>
                                    <input
                                        type="text"
                                        value={customUnitDraft.name}
                                        onChange={(e) => setCustomUnitDraft({ ...customUnitDraft, name: e.target.value })}
                                        placeholder="e.g. Inquisitor Kroyle"
                                        className="gothic w-full"
                                        autoFocus
                                    />
                                  </div>
                                  <div style={{ width: "90px" }}>
                                    <div className="mono-font text-[9px] tracking-widest text-stone-600 mb-1">POINTS</div>
                                    <input
                                        type="number"
                                        min="0"
                                        max="9999"
                                        value={customUnitDraft.points}
                                        onChange={(e) => setCustomUnitDraft({ ...customUnitDraft, points: e.target.value })}
                                        placeholder="100"
                                        className="gothic w-full"
                                        style={{ textAlign: "center" }}
                                    />
                                  </div>
                                  <div style={{ width: "90px" }}>
                                    <div className="mono-font text-[9px] tracking-widest text-stone-600 mb-1">SQUAD SIZE</div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={customUnitDraft.squadSize}
                                        onChange={(e) => setCustomUnitDraft({ ...customUnitDraft, squadSize: e.target.value })}
                                        placeholder="1"
                                        className="gothic w-full"
                                        style={{ textAlign: "center" }}
                                        title="Models in the base squad. Leave blank or 1 for single-model units."
                                    />
                                  </div>
                                  <button
                                      onClick={() => editorAddCustomUnit(role, customUnitDraft.name, customUnitDraft.points, customUnitDraft.squadSize)}
                                      disabled={!customUnitDraft.name.trim() || !customUnitDraft.points}
                                      className="mono-font text-[10px] tracking-widest px-3 py-2 border"
                                      style={{
                                        background: (customUnitDraft.name.trim() && customUnitDraft.points) ? "#c9b037" : "transparent",
                                        color: (customUnitDraft.name.trim() && customUnitDraft.points) ? "#0a0806" : "#3a2818",
                                        borderColor: "#c9b037",
                                        cursor: (customUnitDraft.name.trim() && customUnitDraft.points) ? "pointer" : "not-allowed",
                                      }}
                                  >
                                    ✚ ADD
                                  </button>
                                  <button
                                      onClick={() => {
                                        setCustomUnitOpenRole(null);
                                        setCustomUnitDraft({ name: "", points: "", squadSize: "" });
                                      }}
                                      className="mono-font text-[10px] tracking-widest px-3 py-2 border"
                                      style={{ color: "#a05050", borderColor: "#3a1818" }}
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="mono-font text-[9px] text-stone-600 mt-2 italic">
                                  Custom units save with your army and persist on reload. Squad size enables the resize control.
                                </div>
                              </div>
                          )}
                          <div className="space-y-2">
                            {groupedUnits[role].map((unit, idx) => {
                              const isSwapping = swapTarget && swapTarget.unitId === unit.id;
                              const eff = getEffectiveUnit(unit);
                              const qty = eff.qty;
                              const synergies = getSynergyHints(unit.name);
                              return (
                                  <div key={unit.id} className="unit-card border"
                                       style={{
                                         background: unit.pinned ? `${army.factionData.accent}11` : "rgba(0,0,0,0.4)",
                                         borderColor: unit.pinned ? army.factionData.accent : "#2a1f15",
                                         animationDelay: `${idx * 0.04}s`,
                                       }}
                                  >
                                    <div className="flex justify-between items-center px-4 py-3 gap-3 flex-wrap">
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="mono-font text-[10px] tracking-wider flex-shrink-0" style={{ color: army.factionData.accent }}>
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                                        {unit.pinned && (
                                            <span className="mono-font text-[9px] px-1.5 py-0.5 border tracking-wider"
                                                  style={{ color: army.factionData.accent, borderColor: army.factionData.accent }}>
                                  PINNED
                                </span>
                                        )}
                                        {unit._custom && (
                                            <span className="mono-font text-[9px] px-1.5 py-0.5 border tracking-wider"
                                                  style={{ color: "#c9b037", borderColor: "#c9b037" }}
                                                  title="User-defined unit (not from the codex data)">
                                  CUSTOM
                                </span>
                                        )}
                                        <span className="display-font text-base text-stone-200 truncate">
                                {eff.displayName}
                                          {qty > 1 && <span className="text-stone-500 ml-2">×{qty}</span>}
                                          {eff.isResizable && eff.squadSize !== eff.baseSize && (
                                              <span className="mono-font text-[9px] ml-2" style={{ color: army.factionData.accent }}>
                                    (resized from {eff.baseSize})
                                  </span>
                                          )}
                              </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {/* SQUAD SIZE +/- (only for multi-model units) */}
                                        {eff.isResizable && (
                                            <div className="flex items-center border" style={{ borderColor: "#2a1f15" }} title="Models in this squad">
                                              <button onClick={() => editorChangeSquadSize(unit.id, -1)}
                                                      disabled={eff.squadSize <= 1}
                                                      className="mono-font text-sm px-2 py-1 leading-none"
                                                      style={{
                                                        color: eff.squadSize <= 1 ? "#3a2818" : "#8aa8c8",
                                                        cursor: eff.squadSize <= 1 ? "not-allowed" : "pointer",
                                                      }}>−</button>
                                              <span className="mono-font text-[10px] px-2 py-1" style={{ color: "#8aa8c8", minWidth: "16px", textAlign: "center" }} title="Squad size">
                                    👥{eff.squadSize}
                                  </span>
                                              <button onClick={() => editorChangeSquadSize(unit.id, 1)}
                                                      disabled={eff.squadSize >= eff.baseSize}
                                                      className="mono-font text-sm px-2 py-1 leading-none"
                                                      style={{
                                                        color: eff.squadSize >= eff.baseSize ? "#3a2818" : "#8aa8c8",
                                                        cursor: eff.squadSize >= eff.baseSize ? "not-allowed" : "pointer",
                                                      }}>+</button>
                                            </div>
                                        )}
                                        {/* QTY +/- */}
                                        <div className="flex items-center border" style={{ borderColor: "#2a1f15" }} title="Number of duplicate squads">
                                          <button onClick={() => editorChangeQty(unit.id, -1)}
                                                  disabled={qty <= 1}
                                                  className="mono-font text-sm px-2 py-1 leading-none"
                                                  style={{
                                                    color: qty <= 1 ? "#3a2818" : army.factionData.accent,
                                                    cursor: qty <= 1 ? "not-allowed" : "pointer",
                                                  }}>−</button>
                                          <span className="mono-font text-xs px-2 py-1" style={{ color: "#d4c5a0", minWidth: "20px", textAlign: "center" }}>
                                  ×{qty}
                                </span>
                                          <button onClick={() => editorChangeQty(unit.id, 1)}
                                                  disabled={qty >= unit.max}
                                                  className="mono-font text-sm px-2 py-1 leading-none"
                                                  style={{
                                                    color: qty >= unit.max ? "#3a2818" : army.factionData.accent,
                                                    cursor: qty >= unit.max ? "not-allowed" : "pointer",
                                                  }}>+</button>
                                        </div>
                                        {/* STATS — toggle the full 40k statline card */}
                                        <button onClick={() => setStatCardUnitId(statCardUnitId === unit.id ? null : unit.id)}
                                                className="mono-font text-[10px] px-2 py-1 border tracking-wider"
                                                style={{
                                                  background: statCardUnitId === unit.id ? "#5470a0" : "transparent",
                                                  color: statCardUnitId === unit.id ? "#0a0806" : "#7a8aa0",
                                                  borderColor: "#2a3548",
                                                }}
                                                title="Show full battle statline (M/T/Sv/W/Ld/OC/BS/WS/AT)">
                                          ⌗ STATS
                                        </button>
                                        {/* SWAP */}
                                        <button onClick={() => setSwapTarget(isSwapping ? null : { unitId: unit.id, role })}
                                                className="mono-font text-[10px] px-2 py-1 border tracking-wider"
                                                style={{
                                                  background: isSwapping ? army.factionData.accent : "transparent",
                                                  color: isSwapping ? "#0a0806" : "#8a7a5a",
                                                  borderColor: "#2a1f15",
                                                }}>
                                          ⇄ SWAP
                                        </button>
                                        {/* DUPLICATE */}
                                        <button onClick={() => editorDuplicateUnit(unit.id)}
                                                className="mono-font text-[10px] px-2 py-1 border tracking-wider"
                                                style={{ color: "#8a7a5a", borderColor: "#2a1f15" }}>
                                          ❏ DUP
                                        </button>
                                        {/* REMOVE */}
                                        <button onClick={() => editorRemoveUnit(unit.id)}
                                                className="mono-font text-[10px] px-2 py-1 border tracking-wider"
                                                style={{ color: "#a05050", borderColor: "#3a1818" }}>
                                          ✕
                                        </button>
                                        <div className="mono-font text-sm ml-2" style={{ color: "#d4c5a0", minWidth: "60px", textAlign: "right" }}>
                                          {eff.effectivePoints}<span className="text-stone-600 text-xs ml-1">pts</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* SWAP DROPDOWN */}
                                    {isSwapping && (
                                        <div className="px-4 pb-3 border-t" style={{ borderColor: "#2a1f15" }}>
                                          <div className="mono-font text-[10px] text-stone-600 mb-2 mt-2 tracking-wider">
                                            SWAP TO ANOTHER {ROLE_LABELS[role].toUpperCase()}:
                                          </div>
                                          <div className="grid md:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                                            {(currentUnitPool[role] || [])
                                                .filter((u) => u.name !== unit.name)
                                                .map((u) => (
                                                    <button key={u.name} onClick={() => editorSwapUnit(unit.id, u.name)}
                                                            className="text-left p-2 border flex justify-between items-center text-xs"
                                                            style={{ background: "rgba(0,0,0,0.4)", borderColor: "#2a1f15", color: "#d4c5a0" }}>
                                                      <span className="display-font truncate">{u.name}</span>
                                                      <span className="mono-font" style={{ color: army.factionData.accent }}>
                                        {u.points}<span className="text-stone-600 text-[9px] ml-0.5">pts</span>
                                      </span>
                                                    </button>
                                                ))}
                                          </div>
                                        </div>
                                    )}

                                    {/* SYNERGY HINTS */}
                                    {synergies.length > 0 && (
                                        <div className="px-4 pb-2 mono-font text-[10px] text-stone-600 italic leading-tight">
                                          ↳ synergizes with: {synergies.slice(0, 4).join(", ")}
                                        </div>
                                    )}

                                    {/* STAT CARD — full 40k statline derived from computeUnitStats */}
                                    {statCardUnitId === unit.id && (() => {
                                      const computed = computeUnitStats(unit);
                                      const s = computed.stats || {};
                                      return (
                                          <div className="px-4 pb-3 border-t" style={{ borderColor: "#2a3548", background: "rgba(20,30,50,0.25)" }}>
                                            <div className="mono-font text-[10px] text-stone-500 mt-2 mb-2 tracking-wider">
                                              ⌗ BATTLE STATLINE — used by the simulator's dice math
                                            </div>
                                            {/* Core characteristics row — 4 cols on small screens, 7 on wider */}
                                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center mb-2">
                                              {[
                                                { l: "M", v: `${s.M ?? 6}″`,  t: "Movement (inches)" },
                                                { l: "T", v: s.T ?? 4,         t: "Toughness" },
                                                { l: "Sv", v: `${s.Sv ?? 4}+`, t: "Armor Save" },
                                                { l: "W", v: s.W || computed.woundsPerModel, t: "Wounds per model" },
                                                { l: "Ld", v: `${s.Ld ?? 7}+`, t: "Leadership (Battle-shock)" },
                                                { l: "OC", v: s.OC ?? 1,        t: "Objective Control" },
                                                { l: "Iv", v: s.Iv ? `${s.Iv}+` : "—", t: "Invulnerable Save" },
                                              ].map(c => (
                                                  <div key={c.l} className="border p-1" style={{ borderColor: "#2a3548", background: "rgba(0,0,0,0.4)" }} title={c.t}>
                                                    <div className="mono-font text-[8px] text-stone-600 tracking-wider">{c.l}</div>
                                                    <div className="display-font text-sm" style={{ color: "#7a8aa0" }}>{c.v}</div>
                                                  </div>
                                              ))}
                                            </div>
                                            {/* Combat skill row */}
                                            <div className="grid grid-cols-3 gap-1 text-center mb-2">
                                              <div className="border p-1" style={{ borderColor: "#2a3548", background: "rgba(0,0,0,0.4)" }} title="Ballistic Skill (shooting hit roll)">
                                                <div className="mono-font text-[8px] text-stone-600">BS</div>
                                                <div className="display-font text-sm" style={{ color: "#7a8aa0" }}>{s.BS ?? 4}+</div>
                                              </div>
                                              <div className="border p-1" style={{ borderColor: "#2a3548", background: "rgba(0,0,0,0.4)" }} title="Weapon Skill (melee hit roll)">
                                                <div className="mono-font text-[8px] text-stone-600">WS</div>
                                                <div className="display-font text-sm" style={{ color: "#7a8aa0" }}>{s.WS ?? 4}+</div>
                                              </div>
                                              <div className="border p-1" style={{ borderColor: "#2a3548", background: "rgba(0,0,0,0.4)" }} title="Attacks per model in melee">
                                                <div className="mono-font text-[8px] text-stone-600">A</div>
                                                <div className="display-font text-sm" style={{ color: "#7a8aa0" }}>{s.AT ?? 1}</div>
                                              </div>
                                            </div>
                                            {/* Weapon profiles */}
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                              <div className="border p-2" style={{ borderColor: "#2a3548", background: "rgba(0,0,0,0.3)" }}>
                                                <div className="mono-font text-[9px] tracking-widest text-stone-500 mb-1">⤴ RANGED</div>
                                                <div className="text-[10px] text-stone-400 leading-snug">
                                                  <div>Range: <span style={{ color: "#7a8aa0" }}>{s.rangedRange ?? 24}″</span> · Shots: <span style={{ color: "#7a8aa0" }}>{s.rangedShots ?? 1}</span></div>
                                                  <div>S: <span style={{ color: "#7a8aa0" }}>{s.rangedS ?? 4}</span> · AP: <span style={{ color: "#7a8aa0" }}>−{s.rangedAP ?? 0}</span> · D: <span style={{ color: "#7a8aa0" }}>{s.rangedDmg ?? 1}</span></div>
                                                </div>
                                              </div>
                                              <div className="border p-2" style={{ borderColor: "#2a3548", background: "rgba(0,0,0,0.3)" }}>
                                                <div className="mono-font text-[9px] tracking-widest text-stone-500 mb-1">⚔ MELEE</div>
                                                <div className="text-[10px] text-stone-400 leading-snug">
                                                  <div>S: <span style={{ color: "#7a8aa0" }}>{s.meleeS ?? 4}</span> · AP: <span style={{ color: "#7a8aa0" }}>−{s.meleeAP ?? 0}</span> · D: <span style={{ color: "#7a8aa0" }}>{s.meleeDmg ?? 1}</span></div>
                                                  <div>Total atks: <span style={{ color: "#7a8aa0" }}>{(s.AT ?? 1) * computed.modelCount}</span> ({computed.modelCount} model{computed.modelCount > 1 ? "s" : ""} × {s.AT ?? 1})</div>
                                                </div>
                                              </div>
                                            </div>
                                            {/* Keywords */}
                                            {computed.keywords && computed.keywords.length > 0 && (
                                                <div className="mt-2 mono-font text-[9px] text-stone-500">
                                                  Keywords: {computed.keywords.map(k => (
                                                    <span key={k} className="inline-block ml-1 px-1 border" style={{ borderColor: "#2a3548", color: "#7a8aa0" }}>{k}</span>
                                                ))}
                                                </div>
                                            )}
                                            {/* Disclaimer */}
                                            <div className="mt-2 mono-font text-[9px] text-stone-600 italic leading-tight">
                                              Statlines are heuristic-derived from points + role + name keywords. Actual codex values may differ;
                                              for exact 40k stats consult Wahapedia or your codex.
                                            </div>
                                          </div>
                                      );
                                    })()}
                                  </div>
                              );
                            })}
                          </div>
                        </div>
                    ) : null
                )}

                {/* ADD MISSING ROLE — for roles not yet represented in the army */}
                {Object.entries(ROLE_LABELS).map(([role, label]) => {
                  if (groupedUnits && groupedUnits[role]) return null;
                  const pool = currentUnitPool[role];
                  if (!pool || pool.length === 0) return null;
                  const pickerOpen = pickerOpenRole === role;
                  return (
                      <div key={role} className="mb-3">
                        <div className="flex items-center justify-between gap-3 p-3 border border-dashed" style={{ borderColor: "#2a1f15" }}>
                    <span className="mono-font text-xs tracking-widest text-stone-600">
                      NO {label.toUpperCase()} IN ARMY
                    </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {
                              if (pickerOpen) {
                                setPickerOpenRole(null);
                                setPickerSearch("");
                              } else {
                                setPickerOpenRole(role);
                                setPickerSearch("");
                              }
                            }}
                                    className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                    style={{
                                      color: pickerOpen ? "#0a0806" : army.factionData.accent,
                                      background: pickerOpen ? army.factionData.accent : "transparent",
                                      borderColor: army.factionData.accent,
                                    }}>
                              {pickerOpen ? "✕ CLOSE" : `+ ADD ${label.toUpperCase()}`}
                            </button>
                            <button onClick={() => {
                              // Random add (legacy quick-mode)
                              const available = pool.filter((u) => {
                                const count = army.units.filter((existing) => existing.name === u.name).length;
                                return count < u.max;
                              });
                              if (available.length === 0) return;
                              const pick = available[Math.floor(Math.random() * available.length)];
                              editorAddUnit(pick.name);
                            }}
                                    className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                    style={{ color: "#8a7a5a", borderColor: "#3a2818" }}
                                    title="Add a random unit from this role">
                              🎲
                            </button>
                          </div>
                        </div>
                        {/* PICKER for this empty role */}
                        {pickerOpen && (
                            <div className="mt-2 p-3 border" style={{ borderColor: army.factionData.accent, background: `${army.factionData.color}11` }}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="mono-font text-[10px] tracking-widest" style={{ color: army.factionData.accent }}>
                                  ⚒ CHOOSE {label.toUpperCase()} UNIT
                                </div>
                                <input
                                    type="text"
                                    value={pickerSearch}
                                    onChange={(e) => setPickerSearch(e.target.value)}
                                    placeholder="search..."
                                    className="gothic text-xs"
                                    style={{ width: 160 }}
                                    autoFocus
                                />
                              </div>
                              <div className="grid md:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                                {pool
                                    .filter((u) => !pickerSearch || u.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((u) => {
                                      const count = army.units.filter((ex) => ex.name === u.name).length;
                                      const atMax = count >= u.max;
                                      return (
                                          <button
                                              key={u.name}
                                              onClick={() => {
                                                if (atMax) return;
                                                editorAddUnit(u.name);
                                              }}
                                              disabled={atMax}
                                              className="text-left p-2 border transition-all"
                                              style={{
                                                borderColor: atMax ? "#2a1f15" : "#3a2818",
                                                background: atMax ? "transparent" : "rgba(0,0,0,0.3)",
                                                opacity: atMax ? 0.4 : 1,
                                                cursor: atMax ? "not-allowed" : "pointer",
                                              }}
                                          >
                                            <div className="display-font text-xs flex items-center justify-between gap-2">
                                              <span className="text-stone-200 truncate">{u.name}</span>
                                              <span className="mono-font text-[10px] flex-shrink-0" style={{ color: army.factionData.accent }}>
                                    {u.points}p
                                  </span>
                                            </div>
                                            {/* Stat preview line — quick read of M/T/Sv/W/A */}
                                            {(() => {
                                              const previewStats = computeUnitStats({ name: u.name, role, points: u.points, qty: 1 });
                                              const ps = previewStats.stats || {};
                                              return (
                                                  <div className="mono-font text-[9px] mt-0.5 flex justify-between" style={{ color: "#7a8aa0" }} title="Heuristic statline preview (Move · Toughness · Save · Wounds · Attacks)">
                                                    <span>M{ps.M ?? 6} T{ps.T ?? 4} Sv{ps.Sv ?? 4}+ W{ps.W ?? previewStats.woundsPerModel} A{ps.AT ?? 1}</span>
                                                    <span className="text-stone-600">{previewStats.modelCount > 1 ? `×${previewStats.modelCount}` : ""}</span>
                                                  </div>
                                              );
                                            })()}
                                            <div className="mono-font text-[9px] text-stone-600 mt-0.5">
                                              max {u.max} · {count > 0 ? `${count} taken` : "none yet"}
                                            </div>
                                          </button>
                                      );
                                    })}
                              </div>
                            </div>
                        )}
                      </div>
                  );
                })}

                <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "#3a2818" }}>
                  <div className="mono-font text-[10px] tracking-[0.3em] text-stone-600">
                    ✠ SEALED BY THE ADEPTUS ADMINISTRATUM ✠
                  </div>
                </div>
              </div>
          )}

          {!army && (
              <div className="text-center py-16">
                <div className="display-font text-xl tracking-[0.3em] text-stone-700 italic"
                     style={{ animation: "flicker 3s infinite" }}>
                  ⸻ AWAITING ORDERS, COMMANDER ⸻
                </div>
              </div>
          )}

          <div className="mt-10 text-center mono-font text-[10px] tracking-widest text-stone-700">
            POINT VALUES ARE APPROXIMATIONS FOR LIST INSPIRATION · NOT TOURNAMENT-LEGAL
          </div>
        </div>

        {battleSimOpen && (
            <BattleSim
                savedArmies={savedArmies}
                onClose={() => setBattleSimOpen(false)}
                onBattleComplete={addBattleToHistory}
                battleHistory={battleHistory}
                onClearHistory={clearBattleHistory}
            />
        )}

        {overridesPanelOpen && (
            <OverridesPanel
                pointOverrides={pointOverrides}
                setPointOverrides={setPointOverrides}
                persistOverrides={persistOverrides}
                overrideFaction={overrideFaction}
                setOverrideFaction={setOverrideFaction}
                overrideEditDrafts={overrideEditDrafts}
                setOverrideEditDrafts={setOverrideEditDrafts}
                overrideExportMode={overrideExportMode}
                setOverrideExportMode={setOverrideExportMode}
                overrideImportMode={overrideImportMode}
                setOverrideImportMode={setOverrideImportMode}
                overrideExportText={overrideExportText}
                setOverrideExportText={setOverrideExportText}
                overrideImportText={overrideImportText}
                setOverrideImportText={setOverrideImportText}
                onClose={() => setOverridesPanelOpen(false)}
            />
        )}
      </div>
  );
}



function Stat({ label, value, accent }) {
  return (
      <div className="text-center">
        <div className="mono-font text-[10px] tracking-[0.2em] text-stone-600 mb-1">
          {label.toUpperCase()}
        </div>
        <div className="display-font text-base md:text-lg font-semibold" style={{ color: accent }}>
          {value}
        </div>
      </div>
  );
}

// ============================================================
// BATTLE SIM REACT COMPONENT
// ============================================================

function BattleSim({ savedArmies, onClose, generateArmyFn, onBattleComplete, battleHistory, onClearHistory }) {
  const [leftArmyKey, setLeftArmyKey] = useState(savedArmies[0]?.key || null);
  const [rightArmyKey, setRightArmyKey] = useState(savedArmies[1]?.key || savedArmies[0]?.key || null);
  const [format, setFormat] = useState("Strike Force");
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000));
  const [battleData, setBattleData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(800);
  const [generating, setGenerating] = useState(false);
  // AI personality per side — biases targeting/movement (see AI_PERSONALITIES)
  const [leftPersonality, setLeftPersonality] = useState("balanced");
  const [rightPersonality, setRightPersonality] = useState("balanced");
  // Tournament mode — round-robin between selected armies
  const [tournamentMode, setTournamentMode] = useState(false);
  const [tournamentArmyKeys, setTournamentArmyKeys] = useState([]);  // 4-8 keys
  const [tournamentResults, setTournamentResults] = useState(null);
  const [tournamentRunning, setTournamentRunning] = useState(false);
  // History panel: toggles a view of past battles
  const [showHistory, setShowHistory] = useState(false);

  const leftArmy = useMemo(() => {
    if (!leftArmyKey) return null;
    const entry = savedArmies.find((a) => a.key === leftArmyKey);
    if (!entry) return null;
    const fdata = FACTIONS[entry.snapshot.faction];
    return {
      faction: entry.snapshot.faction,
      units: entry.snapshot.units || [],
      color: fdata?.color,
      accent: fdata?.accent,
      icon: fdata?.icon,
    };
  }, [leftArmyKey, savedArmies]);

  const rightArmy = useMemo(() => {
    if (!rightArmyKey) return null;
    const entry = savedArmies.find((a) => a.key === rightArmyKey);
    if (!entry) return null;
    const fdata = FACTIONS[entry.snapshot.faction];
    return {
      faction: entry.snapshot.faction,
      units: entry.snapshot.units || [],
      color: fdata?.color,
      accent: fdata?.accent,
      icon: fdata?.icon,
    };
  }, [rightArmyKey, savedArmies]);

  const runSimulation = () => {
    if (!leftArmy || !rightArmy) return;
    setGenerating(true);
    setTimeout(() => {
      const result = simulateBattle(leftArmy, rightArmy, format, seed, {
        leftPersonality,
        rightPersonality,
      });
      setBattleData(result);
      setCurrentFrame(0);
      setGenerating(false);
      // Record to history (if hook provided)
      if (onBattleComplete) {
        const leftEntry = savedArmies.find((a) => a.key === leftArmyKey);
        const rightEntry = savedArmies.find((a) => a.key === rightArmyKey);
        onBattleComplete({
          when: Date.now(),
          format,
          mode: "1v1",
          leftName: leftEntry?.name || leftArmy.faction,
          rightName: rightEntry?.name || rightArmy.faction,
          leftFaction: leftArmy.faction,
          rightFaction: rightArmy.faction,
          leftIcon: leftArmy.icon,
          rightIcon: rightArmy.icon,
          leftAccent: leftArmy.accent,
          rightAccent: rightArmy.accent,
          leftScore: result.leftScore,
          rightScore: result.rightScore,
          leftKills: result.leftKills,
          rightKills: result.rightKills,
          winner: result.winner,
          leftMVP: result.leftMVP ? { name: result.leftMVP.name, dmg: result.leftMVP.dmgDealt, kills: result.leftMVP.killsScored } : null,
          rightMVP: result.rightMVP ? { name: result.rightMVP.name, dmg: result.rightMVP.dmgDealt, kills: result.rightMVP.killsScored } : null,
          leftPersonality, rightPersonality,
          primary: result.primary?.name,
          seed,
        });
      }
    }, 200);
  };

  // ============== TOURNAMENT MODE ==============
  // Run a round-robin between all selected armies. Each army fights every other
  // army once. Final standings show W-L-D, total VP for/against, biggest margin.
  const runTournament = () => {
    if (tournamentArmyKeys.length < 2) return;
    setTournamentRunning(true);
    setTimeout(() => {
      const armies = tournamentArmyKeys.map((key) => {
        const entry = savedArmies.find((a) => a.key === key);
        if (!entry) return null;
        const fdata = FACTIONS[entry.snapshot.faction];
        return {
          key,
          name: entry.name,
          faction: entry.snapshot.faction,
          units: entry.snapshot.units || [],
          color: fdata?.color,
          accent: fdata?.accent,
          icon: fdata?.icon,
        };
      }).filter(Boolean);

      const standings = armies.map((a) => ({
        key: a.key,
        name: a.name,
        faction: a.faction,
        icon: a.icon,
        accent: a.accent,
        color: a.color,
        wins: 0, losses: 0, draws: 0,
        vpFor: 0, vpAgainst: 0,
        biggestWin: 0,    // largest VP margin victory
        worstLoss: 0,     // largest VP margin defeat
        totalKills: 0,
      }));

      const matches = [];
      // Each army plays every other army once (round-robin)
      // Use a deterministic seed per match (based on armies + tournament time) so results are repeatable
      const tournSeedBase = Math.floor(Math.random() * 1000000);
      for (let i = 0; i < armies.length; i++) {
        for (let j = i + 1; j < armies.length; j++) {
          const seedFor = tournSeedBase + i * 100 + j;
          const r = simulateBattle(armies[i], armies[j], format, seedFor, {
            leftPersonality: "balanced",
            rightPersonality: "balanced",
          });
          const margin = Math.abs(r.leftScore - r.rightScore);
          matches.push({
            leftKey: armies[i].key,
            rightKey: armies[j].key,
            leftName: armies[i].name,
            rightName: armies[j].name,
            leftFaction: armies[i].faction,
            rightFaction: armies[j].faction,
            leftScore: r.leftScore,
            rightScore: r.rightScore,
            leftKills: r.leftKills,
            rightKills: r.rightKills,
            winner: r.winner,
            margin,
            seed: seedFor,
          });
          // Update standings
          const sL = standings.find((s) => s.key === armies[i].key);
          const sR = standings.find((s) => s.key === armies[j].key);
          sL.vpFor += r.leftScore; sL.vpAgainst += r.rightScore;
          sR.vpFor += r.rightScore; sR.vpAgainst += r.leftScore;
          sL.totalKills += r.leftKills; sR.totalKills += r.rightKills;
          if (r.winner === "left") {
            sL.wins++; sR.losses++;
            sL.biggestWin = Math.max(sL.biggestWin, margin);
            sR.worstLoss = Math.max(sR.worstLoss, margin);
          } else if (r.winner === "right") {
            sR.wins++; sL.losses++;
            sR.biggestWin = Math.max(sR.biggestWin, margin);
            sL.worstLoss = Math.max(sL.worstLoss, margin);
          } else {
            sL.draws++; sR.draws++;
          }
        }
      }
      // Sort standings: wins > VP for - VP against > biggestWin
      standings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        const aDiff = a.vpFor - a.vpAgainst;
        const bDiff = b.vpFor - b.vpAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.biggestWin - a.biggestWin;
      });
      setTournamentResults({ standings, matches, format, totalArmies: armies.length });
      setTournamentRunning(false);
      // Record tournament summary to history as a single entry (champion + runner-up)
      if (onBattleComplete && standings.length >= 1) {
        const champ = standings[0];
        const runner = standings[1];
        onBattleComplete({
          when: Date.now(),
          format,
          mode: "tournament",
          leftName: champ.name,
          rightName: runner ? runner.name : "—",
          leftFaction: champ.faction,
          rightFaction: runner ? runner.faction : "—",
          leftIcon: champ.icon,
          rightIcon: runner ? runner.icon : "",
          leftAccent: champ.accent,
          rightAccent: runner ? runner.accent : "#5a4030",
          leftScore: champ.wins,
          rightScore: runner ? runner.wins : 0,
          leftKills: champ.totalKills,
          rightKills: runner ? runner.totalKills : 0,
          winner: "left",
          leftMVP: null,
          rightMVP: null,
          leftPersonality: "—",
          rightPersonality: "—",
          primary: `Round-robin · ${armies.length} armies`,
          seed: 0,
          // Extra tournament-specific data
          tournament: {
            armies: armies.length,
            matches: matches.length,
            standings: standings.map((s) => ({ name: s.name, faction: s.faction, icon: s.icon, accent: s.accent, wins: s.wins, losses: s.losses, draws: s.draws, vpDiff: s.vpFor - s.vpAgainst })),
          },
        });
      }
    }, 300);
  };

  const toggleTournamentArmy = (key) => {
    setTournamentArmyKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 8) return prev; // cap at 8 armies
      return [...prev, key];
    });
  };

  const reroll = () => {
    setSeed(Math.floor(Math.random() * 100000));
    setBattleData(null);
    setCurrentFrame(0);
    setPlaying(false);
  };

  // Auto-play logic
  useEffect(() => {
    if (!playing || !battleData) return;
    if (currentFrame >= battleData.frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setCurrentFrame((f) => f + 1), playSpeed);
    return () => clearTimeout(t);
  }, [playing, currentFrame, battleData, playSpeed]);

  // After battle is generated, auto-start playback
  useEffect(() => {
    if (battleData && !playing) {
      const t = setTimeout(() => setPlaying(true), 400);
      return () => clearTimeout(t);
    }
  }, [battleData]);

  // Keyboard shortcuts during battle playback
  // Space: play/pause · ← →: prev/next frame · Home/End: jump to start/end
  useEffect(() => {
    if (!battleData) return;
    const onKey = (e) => {
      // Don't interfere with typing in inputs/textareas/selects
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentFrame((f) => Math.max(0, f - 1));
        setPlaying(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentFrame((f) => Math.min(battleData.frames.length - 1, f + 1));
        setPlaying(false);
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentFrame(0);
        setPlaying(false);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentFrame(battleData.frames.length - 1);
        setPlaying(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [battleData]);

  const frame = battleData?.frames[currentFrame];
  const fmt = battleData?.format || FORMATS[format];

  // Log entries up to and including current frame's turn/phase
  const visibleLog = useMemo(() => {
    if (!battleData || !frame) return [];
    return battleData.log.filter((entry) => {
      if (entry.turn < frame.turn) return true;
      if (entry.turn === frame.turn && frame.turn === 0) return true;
      if (entry.turn === frame.turn) {
        // Show entries up to current phase by index in turn
        return battleData.frames
            .slice(0, currentFrame + 1)
            .some((f) => f.turn === entry.turn);
      }
      return false;
    });
  }, [battleData, frame, currentFrame]);

  // Compute unit display position with smooth lerp from previous frame
  const prevFrame = battleData?.frames[Math.max(0, currentFrame - 1)];

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
           style={{ background: "rgba(0,0,0,0.92)" }}>
        <div className="border w-full h-full max-w-7xl flex flex-col"
             style={{ background: "rgba(15,8,5,0.98)", borderColor: "#5a4030", boxShadow: "0 0 80px rgba(201,176,55,0.15)" }}>
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b" style={{ borderColor: "#3a2818" }}>
            <div>
              <div className="display-font text-xl md:text-2xl tracking-widest font-bold"
                   style={{ background: "linear-gradient(180deg, #f5d76e, #c9b037)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ⚔ BATTLE SIMULATOR ⚔
              </div>
              <div className="mono-font text-[10px] tracking-widest text-stone-600 mt-0.5">
                ORDO TACTICUS · WAR-GAMES DIVISION
              </div>
            </div>
            <div className="flex items-center gap-2">
              {battleHistory && battleHistory.length > 0 && (
                  <button onClick={() => setShowHistory(!showHistory)}
                          className="mono-font text-xs tracking-widest px-3 py-1.5 border"
                          style={{
                            background: showHistory ? "#c9b037" : "transparent",
                            color: showHistory ? "#0a0806" : "#d4c5a0",
                            borderColor: "#3a2818",
                          }}
                          title="Show recent battle history">
                    ⌛ HISTORY ({battleHistory.length})
                  </button>
              )}
              <button onClick={onClose} className="mono-font text-xs tracking-widest px-3 py-1.5 border"
                      style={{ color: "#a05050", borderColor: "#3a1818" }}>
                ✕ CLOSE
              </button>
            </div>
          </div>

          {/* HISTORY PANEL — slides over the setup when toggled */}
          {showHistory && (
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <div className="display-font text-lg tracking-widest" style={{ color: "#c9b037" }}>
                      ⌛ BATTLE CHRONICLE
                    </div>
                    <div className="mono-font text-[11px] text-stone-500 mt-0.5">
                      {battleHistory.length} record{battleHistory.length !== 1 ? "s" : ""} · last 50 battles persist across sessions
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Faction win-rate aggregate */}
                    {battleHistory.length >= 3 && (() => {
                      const factionStats = {};
                      for (const b of battleHistory) {
                        if (b.mode === "tournament") continue;
                        for (const side of ["left", "right"]) {
                          const fac = side === "left" ? b.leftFaction : b.rightFaction;
                          if (!factionStats[fac]) factionStats[fac] = { wins: 0, losses: 0, draws: 0 };
                          const sideWon = b.winner === side;
                          const drew = b.winner === "draw";
                          if (drew) factionStats[fac].draws++;
                          else if (sideWon) factionStats[fac].wins++;
                          else factionStats[fac].losses++;
                        }
                      }
                      const sorted = Object.entries(factionStats).sort((a, b) => b[1].wins - a[1].wins).slice(0, 3);
                      if (sorted.length === 0) return null;
                      return (
                          <div className="mono-font text-[10px] tracking-wider text-stone-500 italic mr-2">
                            Top: {sorted.map(([f, s]) => `${f.split(" ")[0]} ${s.wins}W`).join(" · ")}
                          </div>
                      );
                    })()}
                    <button onClick={onClearHistory} className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                            style={{ color: "#a05050", borderColor: "#3a1818" }}>
                      🗑 CLEAR ALL
                    </button>
                  </div>
                </div>
                {/* History list */}
                <div className="space-y-2">
                  {battleHistory.map((b, i) => {
                    const date = new Date(b.when);
                    const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
                        " · " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                    const isTourn = b.mode === "tournament";
                    return (
                        <div key={i} className="p-3 border" style={{ background: "rgba(0,0,0,0.4)", borderColor: "#2a1f15" }}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
                              {isTourn ? (
                                  <span className="mono-font text-[10px] px-2 py-0.5 border tracking-widest" style={{ color: "#c9b037", borderColor: "#c9b037" }}>
                            ⚜ TOURNEY
                          </span>
                              ) : (
                                  <span className="mono-font text-[10px] px-2 py-0.5 border tracking-widest" style={{ color: "#7a8aa0", borderColor: "#2a3548" }}>
                            ⚔ 1v1
                          </span>
                              )}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-base flex-shrink-0" style={{ color: b.leftAccent }}>{b.leftIcon}</span>
                                <span className={"display-font text-xs truncate " + (b.winner === "left" ? "font-bold" : "")} style={{ color: b.winner === "left" ? b.leftAccent : "#7a6a4a" }}>
                            {b.leftName}
                          </span>
                                <span className="mono-font text-xs font-bold flex-shrink-0" style={{ color: "#d4c5a0" }}>
                            {b.leftScore}–{b.rightScore}
                          </span>
                                <span className={"display-font text-xs truncate " + (b.winner === "right" ? "font-bold" : "")} style={{ color: b.winner === "right" ? b.rightAccent : "#7a6a4a" }}>
                            {b.rightName}
                          </span>
                                <span className="text-base flex-shrink-0" style={{ color: b.rightAccent }}>{b.rightIcon}</span>
                              </div>
                            </div>
                            <div className="mono-font text-[10px] text-stone-500 flex-shrink-0">
                              {dateStr}
                            </div>
                          </div>
                          <div className="mt-1 mono-font text-[10px] text-stone-600 flex flex-wrap gap-x-3">
                            <span>{b.format}</span>
                            {b.primary && <span>· {b.primary}</span>}
                            {!isTourn && <span>· K:{b.leftKills}-{b.rightKills}</span>}
                            {!isTourn && b.leftPersonality && b.leftPersonality !== "balanced" && (
                                <span>· L:{b.leftPersonality}</span>
                            )}
                            {!isTourn && b.rightPersonality && b.rightPersonality !== "balanced" && (
                                <span>· R:{b.rightPersonality}</span>
                            )}
                            {b.winner === "draw" && <span style={{ color: "#8a7a5a" }}>· ⚖ DRAW</span>}
                          </div>
                          {/* MVPs */}
                          {!isTourn && (b.leftMVP || b.rightMVP) && (
                              <div className="mt-1 mono-font text-[9px] text-stone-500 flex flex-wrap gap-x-4">
                                {b.leftMVP && (b.leftMVP.dmg > 0 || b.leftMVP.kills > 0) && (
                                    <span>★ {b.leftMVP.name} ({b.leftMVP.dmg}d, {b.leftMVP.kills}k)</span>
                                )}
                                {b.rightMVP && (b.rightMVP.dmg > 0 || b.rightMVP.kills > 0) && (
                                    <span>★ {b.rightMVP.name} ({b.rightMVP.dmg}d, {b.rightMVP.kills}k)</span>
                                )}
                              </div>
                          )}
                          {/* Tournament expanded standings */}
                          {isTourn && b.tournament && (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {b.tournament.standings.slice(0, 4).map((s, j) => (
                                    <div key={j} className="mono-font text-[10px] flex items-center gap-2">
                                      <span className="text-stone-500">{j + 1}.</span>
                                      <span style={{ color: s.accent }}>{s.icon}</span>
                                      <span className="truncate" style={{ color: s.accent }}>{s.name}</span>
                                      <span className="text-stone-500 ml-auto">{s.wins}W-{s.losses}L · Δ{s.vpDiff > 0 ? "+" : ""}{s.vpDiff}</span>
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                    );
                  })}
                  {battleHistory.length === 0 && (
                      <div className="text-center py-12 mono-font text-sm text-stone-600 italic">
                        No battles fought yet — your chronicle awaits.
                      </div>
                  )}
                </div>
              </div>
          )}

          {/* SETUP CONTROLS - shown only before battle and not in history view */}
          {!battleData && !tournamentResults && !showHistory && (
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {savedArmies.length < 1 ? (
                    <div className="text-center py-12">
                      <div className="display-font text-xl text-stone-500 italic mb-3">
                        ⸻ SAVE AT LEAST ONE ARMY TO BEGIN ⸻
                      </div>
                      <div className="mono-font text-xs text-stone-600 max-w-md mx-auto">
                        Generate an army and click ✚ SAVE CURRENT in the saved armies panel. You can battle a saved army against itself, or save two different armies for a proper matchup.
                      </div>
                    </div>
                ) : (
                    <>
                      {/* MODE TOGGLE */}
                      <div className="mb-6">
                        <div className="display-font text-xs tracking-[0.3em] mb-3" style={{ color: "#c9b037" }}>
                          ◆ BATTLE MODE
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setTournamentMode(false)}
                                  className="p-3 text-left border-2 transition-all"
                                  style={{
                                    background: !tournamentMode ? "#c9b03722" : "rgba(0,0,0,0.4)",
                                    borderColor: !tournamentMode ? "#c9b037" : "#2a1f15",
                                  }}>
                            <div className="display-font text-sm font-bold tracking-wider" style={{ color: !tournamentMode ? "#c9b037" : "#d4c5a0" }}>
                              ⚔ 1v1 BATTLE
                            </div>
                            <div className="text-[11px] text-stone-500 italic mt-1 leading-tight">
                              Two armies clash on a single battlefield with full visual playback.
                            </div>
                          </button>
                          <button onClick={() => setTournamentMode(true)} disabled={savedArmies.length < 2}
                                  className="p-3 text-left border-2 transition-all"
                                  style={{
                                    background: tournamentMode ? "#c9b03722" : "rgba(0,0,0,0.4)",
                                    borderColor: tournamentMode ? "#c9b037" : "#2a1f15",
                                    opacity: savedArmies.length < 2 ? 0.4 : 1,
                                    cursor: savedArmies.length < 2 ? "not-allowed" : "pointer",
                                  }}
                                  title={savedArmies.length < 2 ? "Save at least 2 armies for tournament mode" : ""}>
                            <div className="display-font text-sm font-bold tracking-wider" style={{ color: tournamentMode ? "#c9b037" : "#d4c5a0" }}>
                              ⚜ TOURNAMENT
                            </div>
                            <div className="text-[11px] text-stone-500 italic mt-1 leading-tight">
                              Round-robin between 2-8 saved armies. Compute final standings.
                            </div>
                          </button>
                        </div>
                      </div>

                      {!tournamentMode ? (
                          <>
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
                              {/* LEFT ARMY */}
                              <div>
                                <div className="display-font text-xs tracking-[0.3em] mb-2" style={{ color: "#c9b037" }}>
                                  ◆ LEFT ARMY (Attacker)
                                </div>
                                <select className="gothic" value={leftArmyKey || ""} onChange={(e) => setLeftArmyKey(e.target.value)}>
                                  {savedArmies.map((a) => (
                                      <option key={a.key} value={a.key}>
                                        {a.name} · {a.snapshot.faction}
                                      </option>
                                  ))}
                                </select>
                                {leftArmy && (
                                    <div className="mt-2 p-3 border" style={{ background: `${leftArmy.color}22`, borderColor: leftArmy.accent }}>
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl" style={{ color: leftArmy.accent }}>{leftArmy.icon}</span>
                                        <div>
                                          <div className="display-font text-sm font-bold tracking-wider" style={{ color: leftArmy.accent }}>
                                            {leftArmy.faction.toUpperCase()}
                                          </div>
                                          <div className="mono-font text-[10px] text-stone-500">
                                            {leftArmy.units.length} units
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                )}
                                {/* AI Personality */}
                                <div className="mt-3">
                                  <div className="mono-font text-[10px] tracking-widest text-stone-500 mb-1">⚙ AI DOCTRINE</div>
                                  <div className="grid grid-cols-3 gap-1">
                                    {Object.entries(AI_PERSONALITIES).map(([key, p]) => (
                                        <button key={key} onClick={() => setLeftPersonality(key)}
                                                className="p-1.5 text-center border text-[10px]"
                                                style={{
                                                  background: leftPersonality === key ? `${leftArmy?.accent || "#c9b037"}22` : "rgba(0,0,0,0.4)",
                                                  borderColor: leftPersonality === key ? (leftArmy?.accent || "#c9b037") : "#2a1f15",
                                                  color: leftPersonality === key ? (leftArmy?.accent || "#c9b037") : "#8a7a5a",
                                                }}
                                                title={p.description}>
                                          <div className="mono-font tracking-wider">{p.label}</div>
                                        </button>
                                    ))}
                                  </div>
                                  {leftArmy && (
                                      <div className="text-[9px] text-stone-600 italic mt-1 leading-tight">
                                        {AI_PERSONALITIES[leftPersonality].description}
                                      </div>
                                  )}
                                </div>
                              </div>
                              {/* RIGHT ARMY */}
                              <div>
                                <div className="display-font text-xs tracking-[0.3em] mb-2" style={{ color: "#c9b037" }}>
                                  ◆ RIGHT ARMY (Defender)
                                </div>
                                <select className="gothic" value={rightArmyKey || ""} onChange={(e) => setRightArmyKey(e.target.value)}>
                                  {savedArmies.map((a) => (
                                      <option key={a.key} value={a.key}>
                                        {a.name} · {a.snapshot.faction}
                                      </option>
                                  ))}
                                </select>
                                {rightArmy && (
                                    <div className="mt-2 p-3 border" style={{ background: `${rightArmy.color}22`, borderColor: rightArmy.accent }}>
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl" style={{ color: rightArmy.accent }}>{rightArmy.icon}</span>
                                        <div>
                                          <div className="display-font text-sm font-bold tracking-wider" style={{ color: rightArmy.accent }}>
                                            {rightArmy.faction.toUpperCase()}
                                          </div>
                                          <div className="mono-font text-[10px] text-stone-500">
                                            {rightArmy.units.length} units
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                )}
                                {/* AI Personality */}
                                <div className="mt-3">
                                  <div className="mono-font text-[10px] tracking-widest text-stone-500 mb-1">⚙ AI DOCTRINE</div>
                                  <div className="grid grid-cols-3 gap-1">
                                    {Object.entries(AI_PERSONALITIES).map(([key, p]) => (
                                        <button key={key} onClick={() => setRightPersonality(key)}
                                                className="p-1.5 text-center border text-[10px]"
                                                style={{
                                                  background: rightPersonality === key ? `${rightArmy?.accent || "#c9b037"}22` : "rgba(0,0,0,0.4)",
                                                  borderColor: rightPersonality === key ? (rightArmy?.accent || "#c9b037") : "#2a1f15",
                                                  color: rightPersonality === key ? (rightArmy?.accent || "#c9b037") : "#8a7a5a",
                                                }}
                                                title={p.description}>
                                          <div className="mono-font tracking-wider">{p.label}</div>
                                        </button>
                                    ))}
                                  </div>
                                  {rightArmy && (
                                      <div className="text-[9px] text-stone-600 italic mt-1 leading-tight">
                                        {AI_PERSONALITIES[rightPersonality].description}
                                      </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* SCOUTING REPORT — side-by-side army profile when both armies are picked */}
                            {leftArmy && rightArmy && (() => {
                              // Compute a profile for each army: composition, total durability, threat metrics
                              const profileArmy = (a) => {
                                const profile = {
                                  totalPoints: 0,
                                  unitCount: a.units.length,
                                  roleCounts: { hq: 0, troops: 0, elites: 0, fast: 0, heavy: 0, transport: 0 },
                                  totalWounds: 0,
                                  totalModels: 0,
                                  characterCount: 0,
                                  vehicleCount: 0,
                                  monsterCount: 0,
                                  terminatorCount: 0,
                                  psykerCount: 0,
                                  // Threat: weighted sum of attack output across the army
                                  shootingThreat: 0,
                                  meleeThreat: 0,
                                  // Durability: weighted average toughness, average save (lower is better)
                                  avgToughness: 0,
                                  avgSave: 0,
                                  avgMove: 0,
                                };
                                let toughnessSum = 0, saveSum = 0, moveSum = 0, statSamples = 0;
                                for (const u of a.units) {
                                  const cs = computeUnitStats(u);
                                  const s = cs.stats || {};
                                  profile.totalPoints += (u.points || 0) * (u.qty || 1);
                                  profile.roleCounts[u.role] = (profile.roleCounts[u.role] || 0) + (u.qty || 1);
                                  profile.totalWounds += cs.maxWounds * (u.qty || 1);
                                  profile.totalModels += cs.modelCount * (u.qty || 1);
                                  if (cs.keywords) {
                                    if (cs.keywords.includes("CHARACTER"))   profile.characterCount += (u.qty || 1);
                                    if (cs.keywords.includes("VEHICLE"))     profile.vehicleCount += (u.qty || 1);
                                    if (cs.keywords.includes("MONSTER"))     profile.monsterCount += (u.qty || 1);
                                    if (cs.keywords.includes("TERMINATOR"))  profile.terminatorCount += (u.qty || 1);
                                    if (cs.keywords.includes("PSYKER"))      profile.psykerCount += (u.qty || 1);
                                  }
                                  // Threat: ranged shots × S × Dmg, melee similar
                                  profile.shootingThreat += (s.rangedShots || 1) * (s.rangedS || 4) * (s.rangedDmg || 1) * cs.modelCount;
                                  profile.meleeThreat    += (s.AT || 1) * (s.meleeS || 4) * (s.meleeDmg || 1) * cs.modelCount;
                                  toughnessSum += (s.T || 4); saveSum += (s.Sv || 4); moveSum += (s.M || 6);
                                  statSamples++;
                                }
                                profile.avgToughness = statSamples > 0 ? (toughnessSum / statSamples) : 0;
                                profile.avgSave = statSamples > 0 ? (saveSum / statSamples) : 0;
                                profile.avgMove = statSamples > 0 ? (moveSum / statSamples) : 0;
                                return profile;
                              };
                              const lp = profileArmy(leftArmy);
                              const rp = profileArmy(rightArmy);
                              // Cell helper — highlight which side has the higher value (green) vs lower (dim)
                              const Comp = ({ label, l, r, lower = false, fmt }) => {
                                const lWins = lower ? l < r : l > r;
                                const rWins = lower ? r < l : r > l;
                                const fmtVal = fmt || ((v) => v);
                                return (
                                    <tr className="border-b" style={{ borderColor: "#2a1f15" }}>
                                      <td className="px-2 py-1 text-right" style={{ color: lWins ? leftArmy.accent : "#5a4a30", fontWeight: lWins ? "bold" : "normal" }}>{fmtVal(l)}</td>
                                      <td className="px-3 py-1 text-center mono-font text-[10px] tracking-widest text-stone-500">{label}</td>
                                      <td className="px-2 py-1 text-left" style={{ color: rWins ? rightArmy.accent : "#5a4a30", fontWeight: rWins ? "bold" : "normal" }}>{fmtVal(r)}</td>
                                    </tr>
                                );
                              };
                              return (
                                  <div className="mb-6 p-3 border" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.4)" }}>
                                    <div className="display-font text-xs tracking-[0.3em] mb-3 text-center" style={{ color: "#c9b037" }}>
                                      ⸺ SCOUTING REPORT ⸺
                                    </div>
                                    <table className="w-full mono-font text-[11px]">
                                      <thead>
                                      <tr>
                                        <th className="px-2 py-1 text-right display-font tracking-widest" style={{ color: leftArmy.accent }}>{leftArmy.icon} {leftArmy.faction.toUpperCase()}</th>
                                        <th></th>
                                        <th className="px-2 py-1 text-left display-font tracking-widest" style={{ color: rightArmy.accent }}>{rightArmy.faction.toUpperCase()} {rightArmy.icon}</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      <Comp label="POINTS"    l={lp.totalPoints} r={rp.totalPoints} />
                                      <Comp label="UNITS"     l={lp.unitCount}  r={rp.unitCount} />
                                      <Comp label="MODELS"    l={lp.totalModels} r={rp.totalModels} />
                                      <Comp label="WOUNDS"    l={lp.totalWounds} r={rp.totalWounds} />
                                      <Comp label="HQ"        l={lp.roleCounts.hq || 0}    r={rp.roleCounts.hq || 0} />
                                      <Comp label="TROOPS"    l={lp.roleCounts.troops || 0} r={rp.roleCounts.troops || 0} />
                                      <Comp label="ELITES"    l={lp.roleCounts.elites || 0} r={rp.roleCounts.elites || 0} />
                                      <Comp label="FAST"      l={lp.roleCounts.fast || 0}   r={rp.roleCounts.fast || 0} />
                                      <Comp label="HEAVY"     l={lp.roleCounts.heavy || 0}  r={rp.roleCounts.heavy || 0} />
                                      <Comp label="TRANSPORT" l={lp.roleCounts.transport || 0} r={rp.roleCounts.transport || 0} />
                                      <Comp label="VEHICLES"  l={lp.vehicleCount} r={rp.vehicleCount} />
                                      <Comp label="MONSTERS"  l={lp.monsterCount} r={rp.monsterCount} />
                                      <Comp label="CHARACTERS" l={lp.characterCount} r={rp.characterCount} />
                                      {(lp.psykerCount > 0 || rp.psykerCount > 0) && (
                                          <Comp label="PSYKERS" l={lp.psykerCount} r={rp.psykerCount} />
                                      )}
                                      {(lp.terminatorCount > 0 || rp.terminatorCount > 0) && (
                                          <Comp label="TERMINATORS" l={lp.terminatorCount} r={rp.terminatorCount} />
                                      )}
                                      <Comp label="AVG MOVE″" l={lp.avgMove} r={rp.avgMove} fmt={(v) => v.toFixed(1)} />
                                      <Comp label="AVG T"     l={lp.avgToughness} r={rp.avgToughness} fmt={(v) => v.toFixed(1)} />
                                      <Comp label="AVG Sv+"   l={lp.avgSave} r={rp.avgSave} lower fmt={(v) => v.toFixed(1) + "+"} />
                                      <Comp label="SHOOTING"  l={Math.round(lp.shootingThreat)} r={Math.round(rp.shootingThreat)} />
                                      <Comp label="MELEE"     l={Math.round(lp.meleeThreat)} r={Math.round(rp.meleeThreat)} />
                                      </tbody>
                                    </table>
                                    <div className="mt-2 text-[10px] text-stone-600 italic text-center">
                                      Bold side has the advantage in that metric. Threat scores are heuristic
                                      (shots × Strength × Damage × models) — they predict raw output, not match outcome.
                                    </div>
                                  </div>
                              );
                            })()}
                          </>
                      ) : (
                          /* TOURNAMENT MODE: pick 2-8 armies */
                          <div className="mb-6">
                            <div className="display-font text-xs tracking-[0.3em] mb-3" style={{ color: "#c9b037" }}>
                              ◆ TOURNAMENT ROSTER ({tournamentArmyKeys.length}/8 SELECTED)
                            </div>
                            <div className="text-[11px] text-stone-500 italic mb-3 leading-tight">
                              Pick 2 to 8 saved armies. Each army will fight every other once (round-robin). All matches use balanced AI doctrine.
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                              {savedArmies.map((a) => {
                                const selected = tournamentArmyKeys.includes(a.key);
                                const fdata = FACTIONS[a.snapshot.faction];
                                const atCap = !selected && tournamentArmyKeys.length >= 8;
                                return (
                                    <button key={a.key} onClick={() => toggleTournamentArmy(a.key)} disabled={atCap}
                                            className="p-2 text-left border-2 transition-all"
                                            style={{
                                              background: selected ? `${fdata?.color}33` : "rgba(0,0,0,0.4)",
                                              borderColor: selected ? fdata?.accent : "#2a1f15",
                                              opacity: atCap ? 0.4 : 1,
                                              cursor: atCap ? "not-allowed" : "pointer",
                                            }}>
                                      <div className="flex items-center gap-2">
                              <span className="mono-font text-xs" style={{ color: selected ? fdata?.accent : "#3a2818" }}>
                                {selected ? "▣" : "▢"}
                              </span>
                                        <span className="text-xl">{fdata?.icon}</span>
                                        <div className="flex-1 min-w-0">
                                          <div className="display-font text-xs font-bold truncate" style={{ color: selected ? fdata?.accent : "#d4c5a0" }}>
                                            {a.name}
                                          </div>
                                          <div className="mono-font text-[9px] text-stone-500">
                                            {a.snapshot.faction} · {a.snapshot.units.length} units
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                );
                              })}
                            </div>
                            {tournamentArmyKeys.length >= 2 && (
                                <div className="mt-3 mono-font text-[10px] tracking-wider" style={{ color: "#c9b037" }}>
                                  ✦ {tournamentArmyKeys.length} armies → {(tournamentArmyKeys.length * (tournamentArmyKeys.length - 1)) / 2} total matches
                                </div>
                            )}
                          </div>
                      )}

                      {/* FORMAT */}
                      <div className="mb-6">
                        <div className="display-font text-xs tracking-[0.3em] mb-3" style={{ color: "#c9b037" }}>
                          ◆ GAME FORMAT
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(FORMATS).map(([name, f]) => {
                            const active = format === name;
                            return (
                                <button key={name} onClick={() => setFormat(name)}
                                        className="p-3 text-left border"
                                        style={{
                                          background: active ? "#c9b03722" : "rgba(0,0,0,0.4)",
                                          borderColor: active ? "#c9b037" : "#2a1f15",
                                        }}>
                                  <div className="display-font text-sm font-bold tracking-wider" style={{ color: active ? "#c9b037" : "#d4c5a0" }}>
                                    {name.toUpperCase()}
                                  </div>
                                  <div className="mono-font text-[10px] text-stone-500 mt-1">
                                    {f.points}pts · {f.width}×{f.height}"
                                  </div>
                                  <div className="text-[11px] text-stone-600 italic mt-1 leading-tight">
                                    {f.description}
                                  </div>
                                </button>
                            );
                          })}
                        </div>
                      </div>

                      {!tournamentMode && (
                          <>
                            {/* SEED */}
                            <div className="mb-6 flex items-center gap-3 flex-wrap">
                              <div className="display-font text-xs tracking-[0.3em]" style={{ color: "#c9b037" }}>
                                ◆ BATTLE SEED:
                              </div>
                              <span className="mono-font text-sm" style={{ color: "#d4c5a0" }}>{seed}</span>
                              <button onClick={() => setSeed(Math.floor(Math.random() * 100000))}
                                      className="mono-font text-[10px] tracking-widest px-3 py-1 border"
                                      style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>
                                🎲 NEW SEED
                              </button>
                              <span className="mono-font text-[10px] text-stone-600">(same seed = same battle)</span>
                            </div>

                            {/* GO BUTTON */}
                            <div className="flex justify-center">
                              <button onClick={runSimulation} disabled={!leftArmy || !rightArmy || generating}
                                      className="display-font px-12 py-4 text-sm tracking-[0.3em] font-bold border-2"
                                      style={{
                                        background: "linear-gradient(180deg, #5a1a1a 0%, #1a0808 100%)",
                                        color: "#f5d76e",
                                        borderColor: "#c9b037",
                                        cursor: generating ? "wait" : "pointer",
                                      }}>
                                {generating ? "✦ DEPLOYING ARMIES ✦" : "⚔ BEGIN BATTLE ⚔"}
                              </button>
                            </div>
                          </>
                      )}
                      {tournamentMode && (
                          <div className="flex justify-center">
                            <button onClick={runTournament} disabled={tournamentArmyKeys.length < 2 || tournamentRunning}
                                    className="display-font px-12 py-4 text-sm tracking-[0.3em] font-bold border-2"
                                    style={{
                                      background: "linear-gradient(180deg, #4a3a1a 0%, #1a0f08 100%)",
                                      color: "#f5d76e",
                                      borderColor: "#c9b037",
                                      cursor: tournamentRunning ? "wait" : "pointer",
                                      opacity: tournamentArmyKeys.length < 2 ? 0.5 : 1,
                                    }}>
                              {tournamentRunning ? "✦ COMPUTING ALL MATCHES ✦" : `⚜ RUN TOURNAMENT (${(tournamentArmyKeys.length * (tournamentArmyKeys.length - 1)) / 2} MATCHES) ⚜`}
                            </button>
                          </div>
                      )}
                    </>
                )}
              </div>
          )}

          {/* TOURNAMENT RESULTS */}
          {tournamentResults && (
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="display-font text-xl tracking-widest mb-2 text-center" style={{ color: "#c9b037" }}>
                  ⚜ TOURNAMENT STANDINGS ⚜
                </div>
                <div className="mono-font text-[11px] tracking-widest text-center text-stone-500 mb-6">
                  {tournamentResults.totalArmies} armies · {tournamentResults.matches.length} matches · {tournamentResults.format}
                </div>
                {/* Standings table */}
                <div className="mb-8 overflow-x-auto">
                  <table className="w-full mono-font text-xs">
                    <thead>
                    <tr style={{ background: "rgba(0,0,0,0.6)", borderBottom: "2px solid #c9b037" }}>
                      <th className="px-2 py-2 text-left tracking-widest" style={{ color: "#c9b037" }}>RANK</th>
                      <th className="px-2 py-2 text-left tracking-widest" style={{ color: "#c9b037" }}>ARMY</th>
                      <th className="px-2 py-2 text-center tracking-widest" style={{ color: "#c9b037" }}>W</th>
                      <th className="px-2 py-2 text-center tracking-widest" style={{ color: "#c9b037" }}>L</th>
                      <th className="px-2 py-2 text-center tracking-widest" style={{ color: "#c9b037" }}>D</th>
                      <th className="px-2 py-2 text-right tracking-widest" style={{ color: "#c9b037" }}>VP±</th>
                      <th className="px-2 py-2 text-right tracking-widest" style={{ color: "#c9b037" }}>BIG WIN</th>
                      <th className="px-2 py-2 text-right tracking-widest" style={{ color: "#c9b037" }}>KILLS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tournamentResults.standings.map((s, i) => (
                        <tr key={s.key} className="border-b" style={{ borderColor: "#2a1f15", background: i === 0 ? "#c9b03715" : (i % 2 === 0 ? "rgba(0,0,0,0.3)" : "transparent") }}>
                          <td className="px-2 py-2">
                        <span className="display-font text-base" style={{ color: i === 0 ? "#f5d76e" : i === 1 ? "#c9b037" : i === 2 ? "#a08550" : "#5a4a30" }}>
                          {i === 0 ? "★ 1" : `  ${i + 1}`}
                        </span>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base" style={{ color: s.accent }}>{s.icon}</span>
                              <div>
                                <div className="display-font text-xs font-bold" style={{ color: s.accent }}>{s.name}</div>
                                <div className="text-[9px] text-stone-500">{s.faction}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center"><span style={{ color: "#5a8b2a" }}>{s.wins}</span></td>
                          <td className="px-2 py-2 text-center"><span style={{ color: "#a05050" }}>{s.losses}</span></td>
                          <td className="px-2 py-2 text-center"><span style={{ color: "#8a7a5a" }}>{s.draws}</span></td>
                          <td className="px-2 py-2 text-right">
                        <span style={{ color: (s.vpFor - s.vpAgainst) > 0 ? "#5a8b2a" : (s.vpFor - s.vpAgainst) < 0 ? "#a05050" : "#8a7a5a" }}>
                          {s.vpFor - s.vpAgainst > 0 ? "+" : ""}{s.vpFor - s.vpAgainst}
                        </span>
                            <span className="text-stone-600 ml-1">({s.vpFor}/{s.vpAgainst})</span>
                          </td>
                          <td className="px-2 py-2 text-right" style={{ color: s.biggestWin > 0 ? "#c9b037" : "#3a2818" }}>{s.biggestWin > 0 ? `+${s.biggestWin}` : "—"}</td>
                          <td className="px-2 py-2 text-right" style={{ color: "#a05050" }}>{s.totalKills}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
                {/* Match log */}
                <div className="mb-8">
                  <div className="display-font text-sm tracking-[0.3em] mb-3" style={{ color: "#c9b037" }}>
                    ⸺ MATCH RESULTS
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {tournamentResults.matches.map((m, i) => (
                        <div key={i} className="p-2 border mono-font text-[11px]" style={{ background: "rgba(0,0,0,0.4)", borderColor: "#2a1f15" }}>
                          <div className="flex justify-between items-center">
                      <span style={{ color: m.winner === "left" ? "#5a8b2a" : (m.winner === "right" ? "#a05050" : "#8a7a5a"), fontWeight: m.winner === "left" ? "bold" : "normal" }}>
                        {m.leftName}
                      </span>
                            <span className="text-stone-400 font-bold">
                        {m.leftScore}–{m.rightScore}
                      </span>
                            <span style={{ color: m.winner === "right" ? "#5a8b2a" : (m.winner === "left" ? "#a05050" : "#8a7a5a"), fontWeight: m.winner === "right" ? "bold" : "normal" }}>
                        {m.rightName}
                      </span>
                          </div>
                          <div className="text-[9px] text-stone-600 mt-1 flex justify-between">
                            <span>{m.leftFaction} vs {m.rightFaction}</span>
                            <span>K:{m.leftKills}-{m.rightKills} · margin {m.margin}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
                {/* Reset button */}
                <div className="text-center">
                  <button onClick={() => { setTournamentResults(null); setTournamentArmyKeys([]); }}
                          className="mono-font text-xs tracking-widest px-6 py-2 border"
                          style={{ color: "#d4c5a0", borderColor: "#3a2818" }}>
                    ↶ NEW TOURNAMENT
                  </button>
                </div>
              </div>
          )}

          {/* BATTLE DISPLAY */}
          {battleData && frame && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* LEFT: BATTLE BOARD */}
                <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
                  {/* MISSION BANNER — primary mission + detachment rules + secondaries */}
                  {battleData.primary && (
                      <div className="mb-2 p-2 border mono-font text-[10px] leading-snug" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.55)" }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {/* LEFT detachment + secondaries */}
                          <div className="border-l-2 pl-2" style={{ borderColor: battleData.armyLeft.accent }}>
                            <div className="display-font text-[10px] tracking-widest" style={{ color: battleData.armyLeft.accent }}>
                              {battleData.leftRule?.name || "Standard Doctrine"}
                            </div>
                            <div className="text-stone-500 italic mt-0.5 text-[9px]">
                              {battleData.leftRule?.desc || ""}
                            </div>
                            {battleData.leftSecondaries && battleData.leftSecondaries.length > 0 && (
                                <div className="mt-1 text-stone-400 text-[9px]">
                                  ✦ {battleData.leftSecondaries.map((s) => s.name).join(" · ")}
                                </div>
                            )}
                          </div>
                          {/* PRIMARY MISSION */}
                          <div className="text-center border-x px-2" style={{ borderColor: "#3a2818" }}>
                            <div className="display-font text-[11px] tracking-[0.3em]" style={{ color: "#c9b037" }}>
                              ▣ {battleData.primary.name}
                            </div>
                            <div className="text-stone-500 italic mt-0.5 text-[9px]">
                              {battleData.primary.desc}
                            </div>
                          </div>
                          {/* RIGHT detachment + secondaries */}
                          <div className="border-r-2 pr-2 text-right" style={{ borderColor: battleData.armyRight.accent }}>
                            <div className="display-font text-[10px] tracking-widest" style={{ color: battleData.armyRight.accent }}>
                              {battleData.rightRule?.name || "Standard Doctrine"}
                            </div>
                            <div className="text-stone-500 italic mt-0.5 text-[9px]">
                              {battleData.rightRule?.desc || ""}
                            </div>
                            {battleData.rightSecondaries && battleData.rightSecondaries.length > 0 && (
                                <div className="mt-1 text-stone-400 text-[9px]">
                                  ✦ {battleData.rightSecondaries.map((s) => s.name).join(" · ")}
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Score header */}
                  <div className="grid grid-cols-3 gap-2 mb-2 mono-font text-xs tracking-wider">
                    <div className="text-center p-2 border" style={{ background: `${battleData.armyLeft.color}33`, borderColor: battleData.armyLeft.accent, color: battleData.armyLeft.accent }}>
                      <div className="display-font text-lg">{battleData.armyLeft.icon} {battleData.armyLeft.faction}</div>
                      <div className="text-2xl font-bold">{frame.leftScore} VP</div>
                      {/* Live primary + secondary breakdown using current sideState if available, else calc from frame */}
                      <div className="text-[9px] text-stone-400 mt-0.5 tracking-wider">
                        P: {battleData.leftPrimary ?? "—"} · S: {battleData.leftSecondary ?? "—"} · K: {battleData.leftKills ?? 0}
                      </div>
                      {battleData.leftPersonality && battleData.leftPersonality !== "balanced" && (
                          <div className="text-[9px] mt-0.5 tracking-wider" style={{ color: battleData.armyLeft.accent + "aa" }}>
                            ⚙ {AI_PERSONALITIES[battleData.leftPersonality]?.label || battleData.leftPersonality}
                          </div>
                      )}
                    </div>
                    <div className="text-center p-2 border" style={{ background: "rgba(0,0,0,0.5)", borderColor: "#3a2818" }}>
                      <div className="display-font text-base text-stone-400">{frame.phase}</div>
                      <div className="text-stone-500">Turn {frame.turn} / {fmt.turns}</div>
                      <div className="text-[9px] text-stone-600 italic mt-0.5">
                        {(() => {
                          // Mini phase explainer
                          const ph = frame.phase || "";
                          if (ph.includes("Command"))  return "↳ Gain CP, recover battle-shock, declare oaths";
                          if (ph.includes("Movement")) return "↳ Move, Advance, or Fall Back from melee";
                          if (ph.includes("Shooting")) return "↳ Roll BS to hit · S vs T to wound · Sv−AP";
                          if (ph.includes("Charge"))   return "↳ Roll 2D6 vs distance · success → engage";
                          if (ph.includes("Fight"))    return "↳ Chargers strike first · then alternating";
                          if (ph.includes("End"))      return "↳ Score primary objectives + secondaries";
                          if (ph.includes("Deploy"))   return "↳ Set up units · scouts move forward";
                          return "";
                        })()}
                      </div>
                    </div>
                    <div className="text-center p-2 border" style={{ background: `${battleData.armyRight.color}33`, borderColor: battleData.armyRight.accent, color: battleData.armyRight.accent }}>
                      <div className="display-font text-lg">{battleData.armyRight.icon} {battleData.armyRight.faction}</div>
                      <div className="text-2xl font-bold">{frame.rightScore} VP</div>
                      <div className="text-[9px] text-stone-400 mt-0.5 tracking-wider">
                        P: {battleData.rightPrimary ?? "—"} · S: {battleData.rightSecondary ?? "—"} · K: {battleData.rightKills ?? 0}
                      </div>
                      {battleData.rightPersonality && battleData.rightPersonality !== "balanced" && (
                          <div className="text-[9px] mt-0.5 tracking-wider" style={{ color: battleData.armyRight.accent + "aa" }}>
                            ⚙ {AI_PERSONALITIES[battleData.rightPersonality]?.label || battleData.rightPersonality}
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Board */}
                  <div className="flex-1 border relative overflow-hidden" style={{ borderColor: "#3a2818", background: "#0a0604" }}>
                    <svg viewBox={`0 0 ${fmt.width} ${fmt.height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      {/* Battlefield base */}
                      <defs>
                        <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
                          <path d="M 2 0 L 0 0 0 2" fill="none" stroke="#1a0f08" strokeWidth="0.05" />
                        </pattern>
                      </defs>
                      <rect width={fmt.width} height={fmt.height} fill="url(#grid)" />

                      {/* Deployment zones (proper width using fmt.deployZoneDepth) */}
                      <rect x="0" y="0" width={fmt.deployZoneDepth || 8} height={fmt.height} fill={battleData.armyLeft.color} opacity="0.08" />
                      <rect x={fmt.width - (fmt.deployZoneDepth || 8)} y="0" width={fmt.deployZoneDepth || 8} height={fmt.height} fill={battleData.armyRight.color} opacity="0.08" />
                      {/* Deployment zone labels (faint corners) */}
                      <text x="2" y="2" fontSize="0.9" fill={battleData.armyLeft.accent} opacity="0.4" fontFamily="monospace">
                        L · DZ
                      </text>
                      <text x={fmt.width - 6} y="2" fontSize="0.9" fill={battleData.armyRight.accent} opacity="0.4" fontFamily="monospace">
                        R · DZ
                      </text>
                      {/* Center line (no man's land marker) */}
                      <line x1={fmt.width / 2} y1="0" x2={fmt.width / 2} y2={fmt.height} stroke="#3a2818" strokeWidth="0.1" strokeDasharray="0.5,0.8" opacity="0.4" />

                      {/* Terrain */}
                      {battleData.terrain.map((t) => (
                          <g key={t.id}>
                            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill={t.color} stroke={t.border} strokeWidth="0.15" opacity="0.85" />
                            <text x={t.x + t.w / 2} y={t.y + t.h / 2} fontSize="0.9" fill="#5a4030" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
                              {t.name === "Ruins" ? "⌂" : t.name === "Crater" ? "○" : t.name === "Forest" ? "♣" : t.name === "Hill" ? "▲" : "✕"}
                            </text>
                            {/* Tiny LOS-block indicator */}
                            {t.blocksLOS && (
                                <text x={t.x + 0.4} y={t.y + 1.2} fontSize="0.5" fill="#7a5a3a" fontFamily="monospace" opacity="0.7">
                                  LoS
                                </text>
                            )}
                          </g>
                      ))}

                      {/* Objectives — with labels, holder ownership tint, and home-side flags */}
                      {(frame.objectives || battleData.objectives).map((o) => {
                        // Calculate live OC-weighted holder for this frame
                        const leftOC = frame.units.filter((u) => !u.destroyed && u.side === "left" && Math.sqrt((u.x - o.x) ** 2 + (u.y - o.y) ** 2) < 3.5)
                            .reduce((s, u) => s + (u.stats?.OC || 1) * u.modelCount, 0);
                        const rightOC = frame.units.filter((u) => !u.destroyed && u.side === "right" && Math.sqrt((u.x - o.x) ** 2 + (u.y - o.y) ** 2) < 3.5)
                            .reduce((s, u) => s + (u.stats?.OC || 1) * u.modelCount, 0);
                        const controller = leftOC > rightOC ? battleData.armyLeft : (rightOC > leftOC ? battleData.armyRight : null);
                        return (
                            <g key={o.id}>
                              {/* Control radius (3" objective control distance) */}
                              <circle cx={o.x} cy={o.y} r="3.5" fill="none" stroke={controller?.accent || "#5a4030"} strokeWidth="0.15" strokeDasharray="0.5,0.3" opacity="0.6" />
                              {/* Objective marker — tint by holder */}
                              <circle cx={o.x} cy={o.y} r="1.4" fill={controller?.accent || "#5a4030"} opacity="0.85" stroke="#0a0604" strokeWidth="0.1" />
                              <text x={o.x} y={o.y + 0.4} fontSize="1" fill="#0a0604" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace" fontWeight="bold">
                                ⊕
                              </text>
                              {/* Label below objective */}
                              <text x={o.x} y={o.y + 2.6} fontSize="0.8" fill={controller?.accent || "#7a6840"} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                                {o.label || ""}
                              </text>
                              {/* OC ratio (small, debug-style) */}
                              {(leftOC > 0 || rightOC > 0) && (
                                  <text x={o.x} y={o.y - 2.2} fontSize="0.6" fill="#a08a5a" textAnchor="middle" fontFamily="monospace" opacity="0.7">
                                    {leftOC}:{rightOC}
                                  </text>
                              )}
                              {/* Home-side flag */}
                              {o.side === "left" && (
                                  <text x={o.x + 1.8} y={o.y - 1.4} fontSize="0.65" fill={battleData.armyLeft.accent} fontFamily="monospace" opacity="0.6">⚐</text>
                              )}
                              {o.side === "right" && (
                                  <text x={o.x - 1.8} y={o.y - 1.4} fontSize="0.65" fill={battleData.armyRight.accent} fontFamily="monospace" opacity="0.6">⚐</text>
                              )}
                            </g>
                        );
                      })}

                      {/* ANNOTATIONS — visual cues from the engine (oath, charges, deepstrike, damage popups) */}
                      {(frame.annotations || []).map((ann, i) => {
                        if (ann.type === "oath") {
                          const armyData = ann.side === "left" ? battleData.armyLeft : battleData.armyRight;
                          return (
                              <g key={`ann-${i}`}>
                                <circle cx={ann.x} cy={ann.y} r="2.5" fill="none" stroke={armyData.accent} strokeWidth="0.2" strokeDasharray="0.3,0.3" opacity="0.85">
                                  <animate attributeName="r" from="2" to="3.2" dur="1.5s" repeatCount="indefinite" />
                                  <animate attributeName="opacity" from="0.85" to="0.3" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                                <text x={ann.x} y={ann.y - 3.2} fontSize="0.8" fill={armyData.accent} textAnchor="middle" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                                  ✦ OATH
                                </text>
                              </g>
                          );
                        }
                        if (ann.type === "charge") {
                          const armyData = ann.side === "left" ? battleData.armyLeft : battleData.armyRight;
                          return (
                              <g key={`ann-${i}`}>
                                <line x1={ann.x1} y1={ann.y1} x2={ann.x2} y2={ann.y2}
                                      stroke={armyData.accent} strokeWidth="0.25" strokeDasharray="0.6,0.3" opacity="0.7" />
                                <text x={(ann.x1 + ann.x2) / 2} y={(ann.y1 + ann.y2) / 2} fontSize="0.8" fill={armyData.accent} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                                  ⚔
                                </text>
                              </g>
                          );
                        }
                        if (ann.type === "deepstrike") {
                          const armyData = ann.side === "left" ? battleData.armyLeft : battleData.armyRight;
                          return (
                              <g key={`ann-${i}`}>
                                <circle cx={ann.x} cy={ann.y} r="2" fill="none" stroke={armyData.accent} strokeWidth="0.2" opacity="0.85">
                                  <animate attributeName="r" from="0.5" to="3" dur="0.8s" />
                                </circle>
                                <text x={ann.x} y={ann.y - 2.2} fontSize="0.9" fill={armyData.accent} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                                  ↡ DEEP STRIKE
                                </text>
                              </g>
                          );
                        }
                        if (ann.type === "damage") {
                          const armyData = ann.side === "left" ? battleData.armyLeft : battleData.armyRight;
                          return (
                              <g key={`ann-${i}`}>
                                <text x={ann.x} y={ann.y - 2.5} fontSize="1.1" fill="#a05050" textAnchor="middle" fontFamily="monospace" fontWeight="bold" stroke="#0a0604" strokeWidth="0.15">
                                  −{ann.value}
                                </text>
                              </g>
                          );
                        }
                        return null;
                      })}

                      {/* Units */}
                      {frame.units.filter((u) => !u.destroyed).map((u) => {
                        const isLeft = u.side === "left";
                        const army = isLeft ? battleData.armyLeft : battleData.armyRight;
                        const radius = 0.9 + Math.min(1.5, Math.sqrt(u.maxModels) * 0.4);
                        const healthPct = u.currentWounds / u.maxWounds;
                        // Find prev position for smooth animation indicator
                        const prevUnit = prevFrame?.units.find((pu) => pu.uid === u.uid);
                        const moved = prevUnit && (Math.abs(prevUnit.x - u.x) > 0.3 || Math.abs(prevUnit.y - u.y) > 0.3);
                        return (
                            <g key={u.uid}>
                              {/* Movement trail */}
                              {moved && prevUnit && !prevUnit.destroyed && (
                                  <line x1={prevUnit.x} y1={prevUnit.y} x2={u.x} y2={u.y} stroke={army.accent} strokeWidth="0.15" strokeDasharray="0.4,0.3" opacity="0.4" />
                              )}
                              {/* Unit base ring */}
                              <circle cx={u.x} cy={u.y} r={radius} fill={army.color} stroke={army.accent} strokeWidth="0.2" opacity={healthPct > 0.5 ? 0.6 : 0.4} />
                              {/* Health ring */}
                              <circle cx={u.x} cy={u.y} r={radius * 1.15} fill="none" stroke={healthPct > 0.6 ? "#5a8b2a" : healthPct > 0.3 ? "#c9b037" : "#a05050"} strokeWidth="0.15" strokeDasharray={`${healthPct * Math.PI * 2 * radius * 1.15} ${(1 - healthPct) * Math.PI * 2 * radius * 1.15}`} transform={`rotate(-90 ${u.x} ${u.y})`} opacity="0.8" />
                              {/* PIXEL ART SPRITE — replaces the role-icon glyph */}
                              {(() => {
                                const archetype = getSpriteArchetype(u);
                                const spriteSize = radius * 2.0;
                                const pixels = renderSprite(archetype, u.x, u.y, spriteSize, army.color, army.accent, army.faction);
                                return pixels.map((p, i) => (
                                    <rect
                                        key={i}
                                        x={p.x}
                                        y={p.y}
                                        width={p.w}
                                        height={p.h}
                                        fill={p.fill}
                                        shapeRendering="crispEdges"
                                    />
                                ));
                              })()}
                              {/* Model count badge */}
                              {u.modelCount > 1 && (
                                  <text x={u.x + radius * 0.7} y={u.y - radius * 0.7} fontSize="0.8" fill="#f5d76e" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace" fontWeight="bold" stroke="#0a0604" strokeWidth="0.1">
                                    {u.modelCount}
                                  </text>
                              )}
                              {/* STATUS ICONS — battle-shocked, advanced, fell back */}
                              {u.battleShocked && (
                                  <text x={u.x - radius * 0.7} y={u.y + radius * 0.95} fontSize="0.85" fill="#a05050" textAnchor="middle" fontFamily="monospace" fontWeight="bold" stroke="#0a0604" strokeWidth="0.08">
                                    ⚠
                                  </text>
                              )}
                              {u.advanced && (
                                  <text x={u.x + radius * 0.85} y={u.y + radius * 0.95} fontSize="0.7" fill="#5a8b2a" textAnchor="middle" fontFamily="monospace" fontWeight="bold" stroke="#0a0604" strokeWidth="0.08">
                                    »
                                  </text>
                              )}
                              {u.fellBack && (
                                  <text x={u.x + radius * 0.85} y={u.y + radius * 0.95} fontSize="0.7" fill="#c9b037" textAnchor="middle" fontFamily="monospace" fontWeight="bold" stroke="#0a0604" strokeWidth="0.08">
                                    ↩
                                  </text>
                              )}
                            </g>
                        );
                      })}

                      {/* Destroyed unit X markers */}
                      {frame.units.filter((u) => u.destroyed).map((u) => (
                          <g key={u.uid + "-dead"} opacity="0.4">
                            <text x={u.x} y={u.y + 0.5} fontSize="2" fill="#a05050" textAnchor="middle" dominantBaseline="middle" fontFamily="serif">
                              ✕
                            </text>
                          </g>
                      ))}
                    </svg>
                  </div>

                  {/* Playback controls */}
                  <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                    <div className="flex gap-1 items-center">
                      <button onClick={() => { setCurrentFrame(0); setPlaying(false); }}
                              className="mono-font text-[11px] tracking-wider px-2 py-1 border"
                              style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>⏮</button>
                      <button onClick={() => { setCurrentFrame((f) => Math.max(0, f - 1)); setPlaying(false); }}
                              className="mono-font text-[11px] tracking-wider px-2 py-1 border"
                              style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>◀</button>
                      <button onClick={() => setPlaying((p) => !p)}
                              className="mono-font text-[11px] tracking-widest px-3 py-1 border"
                              style={{ background: playing ? "#c9b037" : "transparent", color: playing ? "#0a0604" : "#c9b037", borderColor: "#c9b037" }}>
                        {playing ? "❚❚ PAUSE" : "▶ PLAY"}
                      </button>
                      <button onClick={() => { setCurrentFrame((f) => Math.min(battleData.frames.length - 1, f + 1)); setPlaying(false); }}
                              className="mono-font text-[11px] tracking-wider px-2 py-1 border"
                              style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>▶</button>
                      <button onClick={() => { setCurrentFrame(battleData.frames.length - 1); setPlaying(false); }}
                              className="mono-font text-[11px] tracking-wider px-2 py-1 border"
                              style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>⏭</button>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="mono-font text-[10px] text-stone-500">SPEED</span>
                      <button onClick={() => setPlaySpeed(2000)} className="mono-font text-[10px] px-2 py-1 border"
                              style={{ background: playSpeed === 2000 ? "#c9b037" : "transparent", color: playSpeed === 2000 ? "#0a0604" : "#d4c5a0", borderColor: "#2a1f15" }}>0.5x</button>
                      <button onClick={() => setPlaySpeed(800)} className="mono-font text-[10px] px-2 py-1 border"
                              style={{ background: playSpeed === 800 ? "#c9b037" : "transparent", color: playSpeed === 800 ? "#0a0604" : "#d4c5a0", borderColor: "#2a1f15" }}>1x</button>
                      <button onClick={() => setPlaySpeed(300)} className="mono-font text-[10px] px-2 py-1 border"
                              style={{ background: playSpeed === 300 ? "#c9b037" : "transparent", color: playSpeed === 300 ? "#0a0604" : "#d4c5a0", borderColor: "#2a1f15" }}>2x</button>
                    </div>
                    <div className="mono-font text-[10px] text-stone-500">
                      Frame {currentFrame + 1} / {battleData.frames.length}
                    </div>
                    <button onClick={reroll} className="mono-font text-[11px] tracking-widest px-3 py-1 border"
                            style={{ color: "#f5d76e", borderColor: "#c9b037" }}>
                      🎲 REROLL
                    </button>
                    <button onClick={() => { setBattleData(null); setCurrentFrame(0); setPlaying(false); }} className="mono-font text-[11px] tracking-widest px-3 py-1 border"
                            style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}
                            title="Return to setup to change armies, format, or AI doctrines">
                      ↶ SETUP
                    </button>
                  </div>
                </div>

                {/* RIGHT: BATTLE LOG */}
                <div className="md:w-80 lg:w-96 border-t md:border-t-0 md:border-l overflow-y-auto p-3" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.5)" }}>
                  {/* Visual key — explains map symbols */}
                  <details className="mb-3 mono-font text-[10px]" style={{ color: "#8a7a5a" }}>
                    <summary className="cursor-pointer display-font text-xs tracking-[0.3em] py-1" style={{ color: "#c9b037" }}>
                      ⸺ MAP LEGEND ⸺
                    </summary>
                    <div className="mt-2 p-2 border space-y-1" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.4)" }}>
                      <div><span style={{ color: "#c9b037" }}>⊕</span> Objective marker · 3" control radius · OC contest</div>
                      <div><span style={{ color: "#c9b037" }}>⚐</span> Home-side objective (primary scoring)</div>
                      <div><span style={{ color: "#5a8b2a" }}>health ring</span> · green/yellow/red = current wounds</div>
                      <div><span style={{ color: "#a05050" }}>⚠</span> Battle-shocked (failed Ld test)</div>
                      <div><span style={{ color: "#5a8b2a" }}>»</span> Advanced (no shoot/charge this turn)</div>
                      <div><span style={{ color: "#c9b037" }}>↩</span> Fell back from melee</div>
                      <div><span style={{ color: "#f5d76e" }}>✦ OATH</span> · pulsing ring on this turn's focus target</div>
                      <div><span style={{ color: "#e8a87c" }}>⚔</span> Charge connection — strike-first bonus</div>
                      <div><span style={{ color: "#a05050" }}>−N</span> Damage popup · failed saves became wounds</div>
                      <div><span style={{ color: "#7a5a3a" }}>LoS</span> · this terrain blocks line of sight</div>
                      <div className="border-t mt-2 pt-2" style={{ borderColor: "#3a2818" }}>
                        <div className="mono-font text-[9px] tracking-wider text-stone-600 mb-1">⌨ KEYBOARD</div>
                        <div><kbd style={{ padding: "1px 4px", border: "1px solid #3a2818", background: "rgba(0,0,0,0.4)" }}>Space</kbd> play/pause</div>
                        <div><kbd style={{ padding: "1px 4px", border: "1px solid #3a2818", background: "rgba(0,0,0,0.4)" }}>← →</kbd> prev/next frame</div>
                        <div><kbd style={{ padding: "1px 4px", border: "1px solid #3a2818", background: "rgba(0,0,0,0.4)" }}>Home / End</kbd> jump to start/end</div>
                      </div>
                    </div>
                  </details>
                  <div className="display-font text-xs tracking-[0.3em] mb-3 sticky top-0 py-2" style={{ color: "#c9b037", background: "rgba(0,0,0,0.85)" }}>
                    ⸺ BATTLE LOG
                  </div>
                  <div className="mono-font text-[11px] space-y-1 leading-relaxed">
                    {visibleLog.map((entry, i) => {
                      // Color palette covers every log entry type emitted by the engine.
                      // Header rows are gold; phase markers are bronze; combat = warm tones;
                      // info/score/oath each get their own subtle accent for skim-readability.
                      const colors = {
                        header: "#c9b037",   // major dividers (battle round, deployment, final)
                        phase:  "#a08550",   // phase headers (Command/Movement/Shooting/...)
                        info:   "#8a7a5a",   // generic info / sub-bullets
                        oath:   "#f5d76e",   // oath of moment declarations
                        move:   "#7a8a8a",   // movement actions (advance, fall back)
                        shoot:  "#d4c5a0",   // shooting attacks (with dice narration)
                        melee:  "#e8a87c",   // melee combat
                        charge: "#e8a87c",   // charge declarations
                        kill:   "#a05050",   // unit destroyed
                        score:  "#5a8b2a",   // VP scoring
                        winner: "#f5d76e",   // final result
                      };
                      // Style by type — phase rows get a subtle left border for visual rhythm
                      const isPhase = entry.type === "phase";
                      return (
                          <div key={i} style={{
                            color: colors[entry.type] || "#d4c5a0",
                            fontWeight: entry.type === "header" || entry.type === "winner" ? "bold" : (isPhase ? 600 : "normal"),
                            borderLeft: isPhase ? `2px solid ${colors.phase}55` : "none",
                            paddingLeft: isPhase ? 6 : 0,
                            marginTop: entry.type === "header" ? 6 : 0,
                            opacity: 0,
                            animation: "fadeup 0.4s ease-out forwards",
                            animationDelay: `${Math.min(i * 0.02, 0.5)}s`,
                          }}>
                            {entry.text}
                          </div>
                      );
                    })}
                  </div>

                  {/* Final result panel — full scoring breakdown */}
                  {currentFrame === battleData.frames.length - 1 && (
                      <div className="mt-4 p-4 border text-center"
                           style={{
                             background: battleData.winner === "left"
                                 ? `${battleData.armyLeft.color}33`
                                 : (battleData.winner === "right" ? `${battleData.armyRight.color}33` : "rgba(0,0,0,0.5)"),
                             borderColor: battleData.winner === "left" ? battleData.armyLeft.accent : (battleData.winner === "right" ? battleData.armyRight.accent : "#5a4030"),
                           }}>
                        <div className="display-font text-xs tracking-[0.3em] text-stone-500 mb-2">
                          ⸺ FINAL RECKONING ⸺
                        </div>
                        {battleData.winner === "draw" ? (
                            <div className="display-font text-2xl tracking-widest text-stone-300">
                              ⚖ DRAWN BATTLE
                            </div>
                        ) : (
                            <div>
                              <div className="text-3xl mb-1" style={{ color: battleData.winner === "left" ? battleData.armyLeft.accent : battleData.armyRight.accent }}>
                                {battleData.winner === "left" ? battleData.armyLeft.icon : battleData.armyRight.icon}
                              </div>
                              <div className="display-font text-lg tracking-widest font-bold" style={{ color: battleData.winner === "left" ? battleData.armyLeft.accent : battleData.armyRight.accent }}>
                                ★ {battleData.winner === "left" ? battleData.armyLeft.faction : battleData.armyRight.faction} ★
                              </div>
                              <div className="text-[10px] mono-font tracking-widest text-stone-500 mt-1">
                                CLAIMS THE FIELD
                              </div>
                            </div>
                        )}
                        {/* Full breakdown — primary + secondary + kills per side */}
                        <div className="mt-4 pt-3 border-t mono-font text-[10px] tracking-wider" style={{ borderColor: "#3a2818" }}>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="text-left p-2 border" style={{ borderColor: battleData.armyLeft.accent + "55", background: `${battleData.armyLeft.color}22` }}>
                              <div className="display-font text-[10px]" style={{ color: battleData.armyLeft.accent }}>
                                {battleData.armyLeft.icon} {battleData.armyLeft.faction.toUpperCase()}
                              </div>
                              <div className="text-stone-300 mt-1 text-base font-bold">{battleData.leftScore} VP</div>
                              <div className="text-stone-500 mt-1 text-[9px]">
                                ▣ Primary: {battleData.leftPrimary ?? "—"}<br />
                                ✦ Secondary: {battleData.leftSecondary ?? "—"}<br />
                                ☠ Kills: {battleData.leftKills ?? 0}
                              </div>
                            </div>
                            <div className="text-left p-2 border" style={{ borderColor: battleData.armyRight.accent + "55", background: `${battleData.armyRight.color}22` }}>
                              <div className="display-font text-[10px]" style={{ color: battleData.armyRight.accent }}>
                                {battleData.armyRight.icon} {battleData.armyRight.faction.toUpperCase()}
                              </div>
                              <div className="text-stone-300 mt-1 text-base font-bold">{battleData.rightScore} VP</div>
                              <div className="text-stone-500 mt-1 text-[9px]">
                                ▣ Primary: {battleData.rightPrimary ?? "—"}<br />
                                ✦ Secondary: {battleData.rightSecondary ?? "—"}<br />
                                ☠ Kills: {battleData.rightKills ?? 0}
                              </div>
                            </div>
                          </div>
                          <div className="text-stone-600 italic text-[9px] mt-1">
                            Mission: {battleData.primary?.name || "—"} · Seed: {battleData.seed}
                          </div>

                          {/* MVP CARDS */}
                          {(battleData.leftMVP || battleData.rightMVP) && (
                              <div className="mt-3 pt-3 border-t" style={{ borderColor: "#3a2818" }}>
                                <div className="display-font text-[10px] tracking-[0.3em] mb-2" style={{ color: "#c9b037" }}>
                                  ★ MVPs ★
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {battleData.leftMVP && (battleData.leftMVP.dmgDealt > 0 || battleData.leftMVP.killsScored > 0) ? (
                                      <div className="text-left p-2 border" style={{ borderColor: battleData.armyLeft.accent + "55", background: "rgba(0,0,0,0.4)" }}>
                                        <div className="display-font text-[10px] truncate" style={{ color: battleData.armyLeft.accent }}>
                                          ★ {battleData.leftMVP.name}
                                        </div>
                                        <div className="text-stone-400 text-[9px] mt-1">
                                          {battleData.leftMVP.dmgDealt} dmg · {battleData.leftMVP.killsScored} kill{battleData.leftMVP.killsScored !== 1 ? "s" : ""}
                                          {battleData.leftMVP.survived ? " · ✓ survived" : " · ☠ KIA"}
                                        </div>
                                      </div>
                                  ) : (
                                      <div className="text-left p-2 border italic text-stone-600 text-[9px]" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.4)" }}>
                                        No notable performance
                                      </div>
                                  )}
                                  {battleData.rightMVP && (battleData.rightMVP.dmgDealt > 0 || battleData.rightMVP.killsScored > 0) ? (
                                      <div className="text-left p-2 border" style={{ borderColor: battleData.armyRight.accent + "55", background: "rgba(0,0,0,0.4)" }}>
                                        <div className="display-font text-[10px] truncate" style={{ color: battleData.armyRight.accent }}>
                                          ★ {battleData.rightMVP.name}
                                        </div>
                                        <div className="text-stone-400 text-[9px] mt-1">
                                          {battleData.rightMVP.dmgDealt} dmg · {battleData.rightMVP.killsScored} kill{battleData.rightMVP.killsScored !== 1 ? "s" : ""}
                                          {battleData.rightMVP.survived ? " · ✓ survived" : " · ☠ KIA"}
                                        </div>
                                      </div>
                                  ) : (
                                      <div className="text-left p-2 border italic text-stone-600 text-[9px]" style={{ borderColor: "#2a1f15", background: "rgba(0,0,0,0.4)" }}>
                                        No notable performance
                                      </div>
                                  )}
                                </div>
                                {/* Top 3 performers per side */}
                                <details className="mt-2 mono-font text-[9px]">
                                  <summary className="cursor-pointer text-stone-500 hover:text-stone-300 tracking-wider">▾ Show all unit performance</summary>
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    <div>
                                      {(battleData.leftUnitStats || []).slice(0, 8).map((u, i) => (
                                          <div key={i} className="flex justify-between py-0.5" style={{ color: u.destroyed ? "#7a4040" : "#8a7a5a" }}>
                                  <span className="truncate" style={{ maxWidth: "70%" }}>
                                    {u.destroyed ? "☠ " : "  "}{u.name}
                                  </span>
                                            <span style={{ color: u.dmgDealt > 0 ? "#d4c5a0" : "#5a4030" }}>
                                    {u.dmgDealt}d · {u.killsScored}k
                                  </span>
                                          </div>
                                      ))}
                                    </div>
                                    <div>
                                      {(battleData.rightUnitStats || []).slice(0, 8).map((u, i) => (
                                          <div key={i} className="flex justify-between py-0.5" style={{ color: u.destroyed ? "#7a4040" : "#8a7a5a" }}>
                                  <span className="truncate" style={{ maxWidth: "70%" }}>
                                    {u.destroyed ? "☠ " : "  "}{u.name}
                                  </span>
                                            <span style={{ color: u.dmgDealt > 0 ? "#d4c5a0" : "#5a4030" }}>
                                    {u.dmgDealt}d · {u.killsScored}k
                                  </span>
                                          </div>
                                      ))}
                                    </div>
                                  </div>
                                </details>
                              </div>
                          )}
                        </div>
                      </div>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

function OverridesPanel({
                          pointOverrides,
                          setPointOverrides,
                          persistOverrides,
                          overrideFaction,
                          setOverrideFaction,
                          overrideEditDrafts,
                          setOverrideEditDrafts,
                          overrideExportMode,
                          setOverrideExportMode,
                          overrideImportMode,
                          setOverrideImportMode,
                          overrideExportText,
                          setOverrideExportText,
                          overrideImportText,
                          setOverrideImportText,
                          onClose,
                        }) {
  const [filter, setFilter] = useState("");
  const [importStatus, setImportStatus] = useState("");

  // Build the deduped list of all units in the chosen faction
  const factionUnits = useMemo(() => {
    const f = FACTIONS[overrideFaction];
    if (!f) return [];
    const seen = {};
    for (const sfName of Object.keys(f.subFactions)) {
      const sf = f.subFactions[sfName];
      const merged = mergeUnitPools(sf.units, sf.extra);
      for (const role of Object.keys(merged)) {
        for (const u of merged[role]) {
          if (!seen[u.name]) seen[u.name] = { ...u, role };
        }
      }
    }
    return Object.values(seen).sort((a, b) => a.name.localeCompare(b.name));
  }, [overrideFaction]);

  const filteredUnits = useMemo(() => {
    if (!filter.trim()) return factionUnits;
    const lower = filter.toLowerCase();
    return factionUnits.filter((u) => u.name.toLowerCase().includes(lower));
  }, [factionUnits, filter]);

  // Count of overrides per faction
  const overrideCountByFaction = useMemo(() => {
    const counts = {};
    for (const key of Object.keys(pointOverrides)) {
      const fName = key.split("|")[0];
      counts[fName] = (counts[fName] || 0) + 1;
    }
    return counts;
  }, [pointOverrides]);

  const totalOverrides = Object.keys(pointOverrides).length;

  const setOverride = (unitName, points) => {
    const key = `${overrideFaction}|${unitName}`;
    const next = { ...pointOverrides };
    if (points === null || points === undefined || points === "") {
      delete next[key];
    } else {
      next[key] = { points: parseInt(points), updatedAt: Date.now() };
    }
    setPointOverrides(next);
    persistOverrides(next);
  };

  const handleSaveOverride = (unitName) => {
    const draft = overrideEditDrafts[unitName];
    if (draft === undefined || draft === "") return;
    const num = parseInt(draft);
    if (Number.isFinite(num) && num >= 0 && num <= 9999) {
      setOverride(unitName, num);
      const nextDrafts = { ...overrideEditDrafts };
      delete nextDrafts[unitName];
      setOverrideEditDrafts(nextDrafts);
    }
  };

  const handleResetUnit = (unitName) => {
    setOverride(unitName, null);
    const nextDrafts = { ...overrideEditDrafts };
    delete nextDrafts[unitName];
    setOverrideEditDrafts(nextDrafts);
  };

  const handleResetFaction = () => {
    if (!confirm(`Remove all ${overrideCountByFaction[overrideFaction] || 0} overrides for ${overrideFaction}?`)) return;
    const next = {};
    for (const key of Object.keys(pointOverrides)) {
      if (!key.startsWith(`${overrideFaction}|`)) next[key] = pointOverrides[key];
    }
    setPointOverrides(next);
    persistOverrides(next);
    setOverrideEditDrafts({});
  };

  const handleResetAll = () => {
    if (!confirm(`Remove ALL ${totalOverrides} point overrides across every faction?`)) return;
    setPointOverrides({});
    persistOverrides({});
    setOverrideEditDrafts({});
  };

  const handleExport = () => {
    const text = JSON.stringify(pointOverrides, null, 2);
    setOverrideExportText(text);
    setOverrideExportMode(true);
    setOverrideImportMode(false);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(overrideImportText);
      if (!data || typeof data !== "object") throw new Error("Not an object");
      // Basic validation: keys should be "Faction|Unit" and values should have .points
      let imported = 0;
      const next = { ...pointOverrides };
      for (const key of Object.keys(data)) {
        const v = data[key];
        if (v && typeof v === "object" && typeof v.points === "number" && key.includes("|")) {
          next[key] = { points: v.points, updatedAt: v.updatedAt || Date.now() };
          imported++;
        }
      }
      setPointOverrides(next);
      persistOverrides(next);
      setImportStatus(`✓ Imported ${imported} override${imported !== 1 ? "s" : ""}`);
      setTimeout(() => setImportStatus(""), 3000);
      setOverrideImportText("");
      setOverrideImportMode(false);
    } catch (e) {
      setImportStatus("✗ Invalid format — must be JSON with {Faction|Unit: {points: number}}");
      setTimeout(() => setImportStatus(""), 4000);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
           style={{ background: "rgba(0,0,0,0.92)" }}>
        <div className="border w-full max-w-5xl max-h-full flex flex-col"
             style={{ background: "rgba(15,8,5,0.98)", borderColor: "#5a4030", boxShadow: "0 0 80px rgba(201,176,55,0.15)" }}>

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b" style={{ borderColor: "#3a2818" }}>
            <div>
              <div className="display-font text-xl md:text-2xl tracking-widest font-bold"
                   style={{ background: "linear-gradient(180deg, #f5d76e, #c9b037)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ⚒ POINTS OVERRIDES ⚒
              </div>
              <div className="mono-font text-[10px] tracking-widest text-stone-600 mt-0.5">
                MUNITORUM ADJUSTMENTS · {totalOverrides} TOTAL OVERRIDE{totalOverrides !== 1 ? "S" : ""}
              </div>
            </div>
            <button onClick={onClose} className="mono-font text-xs tracking-widest px-3 py-1.5 border"
                    style={{ color: "#a05050", borderColor: "#3a1818" }}>
              ✕ CLOSE
            </button>
          </div>

          {/* CONTROLS */}
          <div className="px-4 md:px-6 py-3 border-b flex flex-wrap items-center gap-2" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.3)" }}>
            <select className="gothic" value={overrideFaction} onChange={(e) => setOverrideFaction(e.target.value)} style={{ minWidth: "180px" }}>
              {Object.entries(FACTION_GROUPS).map(([groupName, factionList]) => {
                const groupFactions = factionList.filter((name) => FACTIONS[name]);
                if (groupFactions.length === 0) return null;
                return (
                    <optgroup key={groupName} label={groupName}>
                      {groupFactions.map((f) => (
                          <option key={f} value={f}>
                            {f}{overrideCountByFaction[f] ? ` (${overrideCountByFaction[f]} edited)` : ""}
                          </option>
                      ))}
                    </optgroup>
                );
              })}
              {(() => {
                const grouped = new Set(Object.values(FACTION_GROUPS).flat());
                const ungrouped = Object.keys(FACTIONS).filter((f) => !grouped.has(f));
                if (ungrouped.length === 0) return null;
                return (
                    <optgroup label="OTHER">
                      {ungrouped.map((f) => (
                          <option key={f} value={f}>
                            {f}{overrideCountByFaction[f] ? ` (${overrideCountByFaction[f]} edited)` : ""}
                          </option>
                      ))}
                    </optgroup>
                );
              })()}
            </select>
            <input type="text" placeholder="Filter units..." value={filter} onChange={(e) => setFilter(e.target.value)}
                   className="gothic" style={{ flex: 1, minWidth: "160px" }} />
            {overrideCountByFaction[overrideFaction] > 0 && (
                <button onClick={handleResetFaction}
                        className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                        style={{ color: "#e8a87c", borderColor: "#5a3a25" }}>
                  ↺ RESET FACTION
                </button>
            )}
            <button onClick={handleExport}
                    disabled={totalOverrides === 0}
                    className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                    style={{ color: totalOverrides === 0 ? "#3a2818" : "#d4c5a0", borderColor: "#2a1f15", cursor: totalOverrides === 0 ? "not-allowed" : "pointer" }}>
              ↗ EXPORT
            </button>
            <button onClick={() => { setOverrideImportMode((m) => !m); setOverrideExportMode(false); }}
                    className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                    style={{ background: overrideImportMode ? "#c9b037" : "transparent", color: overrideImportMode ? "#0a0806" : "#d4c5a0", borderColor: "#2a1f15" }}>
              ↙ IMPORT
            </button>
            {totalOverrides > 0 && (
                <button onClick={handleResetAll}
                        className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                        style={{ color: "#a05050", borderColor: "#3a1818" }}>
                  ✕ RESET ALL
                </button>
            )}
          </div>

          {/* IMPORT/EXPORT BOX */}
          {(overrideExportMode || overrideImportMode) && (
              <div className="px-4 md:px-6 py-3 border-b" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.4)" }}>
                {overrideExportMode && (
                    <div>
                      <div className="mono-font text-[10px] tracking-widest text-stone-500 mb-2">
                        ↗ EXPORT — copy this JSON to share or back up your overrides
                      </div>
                      <textarea readOnly value={overrideExportText} className="gothic w-full"
                                style={{ height: "140px", fontFamily: "monospace", fontSize: "11px" }}
                                onFocus={(e) => e.target.select()} />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { navigator.clipboard?.writeText(overrideExportText); setImportStatus("✓ Copied to clipboard"); setTimeout(() => setImportStatus(""), 2000); }}
                                className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                                style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>
                          📋 COPY
                        </button>
                        <button onClick={() => setOverrideExportMode(false)}
                                className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                                style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>
                          ✕ CLOSE EXPORT
                        </button>
                      </div>
                    </div>
                )}
                {overrideImportMode && (
                    <div>
                      <div className="mono-font text-[10px] tracking-widest text-stone-500 mb-2">
                        ↙ IMPORT — paste a JSON override sheet below
                      </div>
                      <textarea value={overrideImportText} onChange={(e) => setOverrideImportText(e.target.value)}
                                className="gothic w-full" placeholder='{"Space Marines|Captain": {"points": 80}, ...}'
                                style={{ height: "140px", fontFamily: "monospace", fontSize: "11px" }} />
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleImport}
                                disabled={!overrideImportText.trim()}
                                className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                                style={{
                                  background: overrideImportText.trim() ? "#c9b037" : "transparent",
                                  color: overrideImportText.trim() ? "#0a0806" : "#3a2818",
                                  borderColor: "#2a1f15",
                                  cursor: overrideImportText.trim() ? "pointer" : "not-allowed",
                                }}>
                          ↙ APPLY IMPORT
                        </button>
                        <button onClick={() => { setOverrideImportMode(false); setOverrideImportText(""); }}
                                className="mono-font text-[10px] tracking-widest px-3 py-1.5 border"
                                style={{ color: "#d4c5a0", borderColor: "#2a1f15" }}>
                          ✕ CANCEL
                        </button>
                      </div>
                    </div>
                )}
                {importStatus && (
                    <div className="mono-font text-[11px] mt-2" style={{ color: importStatus.startsWith("✓") ? "#5a8b2a" : "#a05050" }}>
                      {importStatus}
                    </div>
                )}
              </div>
          )}

          {/* UNIT LIST */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
            <div className="mono-font text-[10px] tracking-widest text-stone-600 mb-2">
              {filteredUnits.length} unit{filteredUnits.length !== 1 ? "s" : ""} in {overrideFaction}
              {filter && ` matching "${filter}"`}
            </div>
            <div className="space-y-1">
              {filteredUnits.map((u) => {
                const key = `${overrideFaction}|${u.name}`;
                const override = pointOverrides[key];
                const draft = overrideEditDrafts[u.name];
                const hasDraft = draft !== undefined && draft !== "" && parseInt(draft) !== (override?.points ?? u.points);
                const effective = override?.points ?? u.points;
                return (
                    <div key={u.name} className="flex items-center gap-2 py-1.5 px-2 border" style={{
                      borderColor: override ? "#c9b037" : "#2a1f15",
                      background: override ? "rgba(201,176,55,0.06)" : "transparent",
                    }}>
                      <div className="flex-1 min-w-0">
                        <div className="display-font text-sm" style={{ color: "#d4c5a0" }}>
                          {u.name}
                        </div>
                        <div className="mono-font text-[10px] text-stone-600 mt-0.5">
                          {ROLE_LABELS[u.role] || u.role}
                          {override && (
                              <span className="ml-2" style={{ color: "#c9b037" }}>
                          BASE: {u.name && (FACTIONS[overrideFaction] && (() => {
                                // Find original base points by re-looking it up
                                for (const sfName of Object.keys(FACTIONS[overrideFaction].subFactions)) {
                                  const sf = FACTIONS[overrideFaction].subFactions[sfName];
                                  const merged = mergeUnitPools(sf.units, sf.extra);
                                  for (const role of Object.keys(merged)) {
                                    const found = merged[role].find((x) => x.name === u.name);
                                    if (found) return found.points;
                                  }
                                }
                                return u.points;
                              })())}pts
                        </span>
                          )}
                        </div>
                      </div>
                      <input type="number" min="0" max="9999" placeholder={String(u.points)}
                             value={draft !== undefined ? draft : (override ? String(override.points) : "")}
                             onChange={(e) => setOverrideEditDrafts({ ...overrideEditDrafts, [u.name]: e.target.value })}
                             onBlur={() => hasDraft && handleSaveOverride(u.name)}
                             onKeyDown={(e) => { if (e.key === "Enter") handleSaveOverride(u.name); }}
                             className="gothic"
                             style={{ width: "70px", textAlign: "center" }} />
                      <span className="mono-font text-[10px] text-stone-600 w-8">pts</span>
                      {(override || hasDraft) && (
                          <button onClick={() => handleResetUnit(u.name)}
                                  className="mono-font text-[10px] tracking-widest px-2 py-1 border"
                                  style={{ color: "#a05050", borderColor: "#3a1818" }}
                                  title="Reset to base value">
                            ↺
                          </button>
                      )}
                    </div>
                );
              })}
            </div>
            {filteredUnits.length === 0 && (
                <div className="text-center py-8 mono-font text-xs text-stone-500">
                  No units match your filter.
                </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-4 md:px-6 py-2 border-t mono-font text-[9px] tracking-widest text-stone-600" style={{ borderColor: "#3a2818", background: "rgba(0,0,0,0.4)" }}>
            OVERRIDES ARE USER-MAINTAINED · APPLIED TO GENERATOR, EDITOR & BATTLE SIM · STORED LOCALLY
          </div>
        </div>
      </div>
  );
}

    
