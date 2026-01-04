export interface CharacterClass {
    name: string;
    attribute: 'Strength' | 'Dexterity' | 'Intelligence' | 'Str/Dex' | 'Str/Int' | 'Dex/Int';
    ascendancies: string[];
    description: string;
    signatureMechanic?: string;
}

export const POE2_CLASSES: CharacterClass[] = [
    // STRENGTH
    {
        name: 'Warrior',
        attribute: 'Strength',
        ascendancies: ['Titan', 'Warbringer'],
        description: 'A disciplined fighter mastering heavy weapons and ancestral calls.',
        signatureMechanic: 'Slam Skills & Totems'
    },
    // DEXTERITY
    {
        name: 'Ranger',
        attribute: 'Dexterity',
        ascendancies: ['Deadeye', 'Pathfinder'],
        description: 'Master of the bow and nature, striking from a distance.',
        signatureMechanic: 'Mark Skills & Flasks'
    },
    // INTELLIGENCE
    {
        name: 'Sorceress',
        attribute: 'Intelligence',
        ascendancies: ['Stormweaver', 'Chronomancer'],
        description: 'Wielder of pure elemental destruction and time manipulation.',
        signatureMechanic: 'Elemental Ailments & Cast Speed'
    },
    // HYBRID STR/DEX
    {
        name: 'Mercenary',
        attribute: 'Str/Dex',
        ascendancies: ['Witchhunter', 'Gemling Legionnaire'],
        description: 'A soldier of fortune using crossbows and innovative grenades.',
        signatureMechanic: 'Ammo Types & Reload Mechanics'
    },
    // HYBRID DEX/INT
    {
        name: 'Monk',
        attribute: 'Dex/Int',
        ascendancies: ['Invoker', 'Acolyte of Chayula'],
        description: 'A martial artist using quarterstaves and elemental fury.',
        signatureMechanic: 'Combo System & Triggered Spells'
    },
    // HYBRID STR/INT
    {
        name: 'Witch',
        attribute: 'Str/Int',
        ascendancies: ['Blood Mage', 'Infernalist'],
        description: 'Dark caster sacrificing life for power or summoning demons.',
        signatureMechanic: 'Life as Resource & Demon Summoning'
    }
];

// Additional ascendancies found in PoB (not yet mapped to classes)
export const UNMAPPED_ASCENDANCIES = [
    'Amazon',  // Likely future Ranger/Huntress
    'Disciple of Varashta',  // Unknown class
    'Lich',  // Likely Witch
    'Oracle',  // Unknown class
    'Ritualist',  // Unknown class
    'Shaman',  // Unknown class
    'Smith of Kitava',  // Likely Warrior
    'Tactician'  // Likely Mercenary
];

export const GAME_MECHANICS = [
    { name: 'Spirit', description: 'Separate resource pool (60-100 base) used for Auras, Minions, and certain buffs. NOT mana!' },
    { name: 'Dodge Roll', description: 'Universal mobility skill (Spacebar). Grants invulnerability frames. No Quicksilver Flask in PoE2.' },
    { name: 'Weapon Swapping', description: 'Instant weapon swap (X key). Both sets have full 6-link support. Critical for hybrid builds.' },
    { name: 'Combos', description: 'Some skills build combo points. Payoff skills consume them for massive damage.' },
    { name: 'Uncut Gems', description: 'Support gems drop "uncut". You cut them at vendors to choose a specific variant (I, II, III).' },
    { name: 'Bosses', description: 'All campaign bosses have stagger bars. Breaking stagger = massive damage window.' },
    { name: 'Items', description: 'Rune sockets on items provide powerful implicit mods. Charms exist as new item slot.' }
];

export const KEY_ITEMS = {
    "Weapons": ["Spear", "Crossbow", "Flail", "Quarterstaff", "Bows", "Swords", "Axes", "Maces", "Sceptres", "Wands", "Staves"],
    "Defenses": ["Armor (Phys reduction)", "Evasion (Chance to avoid)", "Energy Shield (Rechargeable barrier)"]
};
