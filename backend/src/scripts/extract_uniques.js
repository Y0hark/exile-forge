#!/usr/bin/env node

/**
 * Script to extract unique items from PoB's Data/Uniques/ directory
 * Converts Lua table format to TypeScript/JSON with auto-generated tags
 */

const fs = require('fs');
const path = require('path');

// Paths
const UNIQUES_DIR = path.join(__dirname, '../data/PoBPOE2/Data/Uniques');
const OUTPUT_TS_PATH = path.join(__dirname, '../data/poe2/unique_items.ts');
const OUTPUT_JSON_PATH = path.join(__dirname, '../../frontend/src/data/unique_items.json');

console.log('🔍 Scanning Uniques directory...');

// Get all .lua files
const itemFiles = fs.readdirSync(UNIQUES_DIR)
    .filter(f => f.endsWith('.lua') && f !== 'Special')
    .map(f => ({
        file: f,
        itemClass: f.replace('.lua', '')
    }));

console.log(`📦 Found ${itemFiles.length} item class files`);

const allItems = [];
let totalEntries = 0;

// Process each item class file
for (const { file, itemClass } of itemFiles) {
    const filePath = path.join(UNIQUES_DIR, file);
    console.log(`\n📄 Processing ${file}...`);

    const luaContent = fs.readFileSync(filePath, 'utf8');

    // Split into individual item entries using [[ ]] delimiters
    const entries = luaContent.split(/\]\],\s*\[\[/).slice(1);

    for (let entry of entries) {
        totalEntries++;

        // Clean up entry
        entry = entry.replace(/^return\s*{\s*\[\[/, '').replace(/\]\]\s*,?\s*}\s*$/, '').trim();

        if (!entry) continue;

        // Parse item data
        const item = parseItemEntry(entry, itemClass);

        if (item && item.name) {
            allItems.push(item);
        }
    }

    console.log(`  ✅ Extracted ${allItems.filter(i => i.itemClass === itemClass).length} items`);
}

console.log(`\n✅ Total: ${allItems.length} unique items from ${totalEntries} entries`);

// Sort by item class, then name
allItems.sort((a, b) => {
    if (a.itemClass !== b.itemClass) return a.itemClass.localeCompare(b.itemClass);
    return a.name.localeCompare(b.name);
});

// Generate TypeScript file
const tsContent = generateTypeScriptFile(allItems);
fs.writeFileSync(OUTPUT_TS_PATH, tsContent, 'utf8');
console.log(`📝 Wrote TypeScript to: ${OUTPUT_TS_PATH}`);

// Write JSON for frontend
const jsonContent = JSON.stringify(allItems, null, 2);
fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_JSON_PATH, jsonContent, 'utf8');
console.log(`📝 Wrote JSON to: ${OUTPUT_JSON_PATH}`);

// Stats
const classStats = allItems.reduce((acc, item) => {
    acc[item.itemClass] = (acc[item.itemClass] || 0) + 1;
    return acc;
}, {});

console.log('\n📊 Items by class:');
console.log(JSON.stringify(classStats, null, 2));

// Tag stats
const tagStats = {};
allItems.forEach(item => {
    item.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
    });
});

const topTags = Object.entries(tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

console.log('\n🏷️  Top 20 tags:');
console.log(JSON.stringify(Object.fromEntries(topTags), null, 2));

/**
 * Parse a single item entry
 */
function parseItemEntry(entry, itemClass) {
    const lines = entry.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length < 2) return null;

    const name = lines[0];
    const baseType = lines[1];

    const item = {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name,
        baseType,
        itemClass,
        requiredLevel: undefined,
        league: undefined,
        source: undefined,
        variants: [],
        implicits: [],
        explicits: [],
        tags: new Set(),

        // NEW: Enhanced fields
        grantedSkills: [],
        skillLevelBoosts: [],
        conditionalMods: []
    };

    let currentVariant = null;
    let lineIdx = 2;
    let inImplicits = false;

    while (lineIdx < lines.length) {
        const line = lines[lineIdx];

        // Variant detection
        if (line.startsWith('Variant:')) {
            const variantName = line.replace('Variant:', '').trim();
            currentVariant = variantName;
            if (!item.variants.find(v => v.name === variantName)) {
                item.variants.push({ name: variantName, mods: [] });
            }
            lineIdx++;
            continue;
        }

        // Metadata
        if (line.startsWith('Requires Level')) {
            item.requiredLevel = parseInt(line.match(/\d+/)?.[0] || '0');
            lineIdx++;
            continue;
        }

        if (line.startsWith('League:')) {
            item.league = line.replace('League:', '').trim();
            lineIdx++;
            continue;
        }

        if (line.startsWith('Source:')) {
            item.source = line.replace('Source:', '').trim();
            lineIdx++;
            continue;
        }

        // Implicits marker
        if (line.startsWith('Implicits:')) {
            inImplicits = true;
            lineIdx++;
            continue;
        }

        // Mod line
        if (line && !line.startsWith('//')) {
            const mod = line;

            // Extract tags from mod text
            extractTagsFromMod(mod, item.tags);

            // NEW: Extract skill grants
            extractSkillGrants(mod, item);

            // NEW: Extract skill level boosts
            extractSkillLevelBoosts(mod, item);

            // NEW: Extract conditional mods
            extractConditionalMods(mod, item);

            // Check if variant-specific
            const variantMatch = mod.match(/\{variant:(\d+)\}/);
            if (variantMatch && currentVariant) {
                const variantIdx = parseInt(variantMatch[1]) - 1;
                if (item.variants[variantIdx]) {
                    item.variants[variantIdx].mods.push(cleanMod(mod));
                }
            } else {
                // Global mod
                if (inImplicits && item.implicits.length < 5) {
                    item.implicits.push(cleanMod(mod));
                } else {
                    item.explicits.push(cleanMod(mod));
                }
            }
        }

        lineIdx++;
    }

    // Convert tags Set to Array
    item.tags = Array.from(item.tags).sort();

    return item;
}

/**
 * Extract tags from mod text
 */
function extractTagsFromMod(mod, tagsSet) {
    // Extract {tags:...} syntax
    const tagMatches = mod.matchAll(/\{tags:([^}]+)\}/g);
    for (const match of tagMatches) {
        const tags = match[1].split(',').map(t => t.trim());
        tags.forEach(tag => tagsSet.add(tag));
    }

    // Keyword-based tag extraction
    const keywords = {
        // Damage types
        'fire': /\bfire\b/i,
        'cold': /\bcold\b/i,
        'lightning': /\blightning\b/i,
        'chaos': /\bchaos\b/i,
        'physical': /\bphysical\b/i,

        // Skill types
        'attack': /\battack/i,
        'spell': /\bspell/i,
        'minion': /\bminion/i,
        'totem': /\btotem/i,

        // Defenses
        'life': /\blife\b/i,
        'mana': /\bmana\b/i,
        'es': /energy shield/i,
        'armor': /\barmor\b/i,
        'evasion': /\bevasion\b/i,

        // Mechanics
        'crit': /\bcritical\b/i,
        'poison': /\bpoison/i,
        'bleed': /\bbleed/i,
        'ignite': /\bignite/i,
        'freeze': /\bfreeze\b/i,
        'shock': /\bshock/i,
        'chill': /\bchill/i,
        'curse': /\bcurse/i,
        'aura': /\baura/i,

        // Attributes
        'strength': /\bstrength\b/i,
        'dexterity': /\bdexterity\b/i,
        'intelligence': /\bintelligence\b/i,

        // Other
        'rarity': /\brarity\b/i,
        'quantity': /\bquantity\b/i,
        'resistance': /resistance/i,
        'speed': /\bspeed\b/i,
        'damage': /\bdamage\b/i
    };

    for (const [tag, regex] of Object.entries(keywords)) {
        if (regex.test(mod)) {
            tagsSet.add(tag);
        }
    }
}

/**
 * Clean mod text (remove variant/tag markers)
 */
function cleanMod(mod) {
    return mod
        .replace(/\{variant:\d+\}/g, '')
        .replace(/\{tags:[^}]+\}/g, '')
        .trim();
}

/**
 * Extract skill grants from mods like "Grants Skill: Level (1-20) Lightning Bolt"
 */
function extractSkillGrants(mod, item) {
    const grantMatch = mod.match(/Grants Skill:\s*(?:Level\s*\((\d+)-(\d+)\)\s*)?([A-Za-z'\s-]+)/i);
    if (grantMatch) {
        const minLevel = grantMatch[1] ? parseInt(grantMatch[1]) : 1;
        const maxLevel = grantMatch[2] ? parseInt(grantMatch[2]) : 20;
        const skillName = grantMatch[3].trim();

        item.grantedSkills.push({
            skillName,
            minLevel,
            maxLevel
        });

        // Add specific tag
        const skillTag = `grants_${skillName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        item.tags.add(skillTag);
        item.tags.add('grants_skill'); // Generic tag
    }
}

/**
 * Extract skill level boosts like "+1 to Level of all Fire Skills"
 */
function extractSkillLevelBoosts(mod, item) {
    // Pattern: +X to Level of all Y Skills
    const levelBoostMatch = mod.match(/\+(\d+)\s+to\s+Level\s+of\s+all\s+([A-Za-z]+)\s+Skills/i);
    if (levelBoostMatch) {
        const bonus = parseInt(levelBoostMatch[1]);
        const skillType = levelBoostMatch[2].toLowerCase();

        item.skillLevelBoosts.push({
            skillTypes: [skillType],
            bonus
        });

        // Add specific tag
        item.tags.add(`boosts_${skillType}_skills`);
        item.tags.add('boosts_skill_level');
    }

    // Pattern: +X to Level of all Skills (generic)
    const allSkillsMatch = mod.match(/\+(\d+)\s+to\s+Level\s+of\s+all\s+Skills/i);
    if (allSkillsMatch) {
        const bonus = parseInt(allSkillsMatch[1]);

        item.skillLevelBoosts.push({
            skillTypes: ['all'],
            bonus
        });

        item.tags.add('boosts_all_skills');
        item.tags.add('boosts_skill_level');
    }
}

/**
 * Extract conditional mods like "X% more damage when ignited"
 */
function extractConditionalMods(mod, item) {
    const conditions = {
        'when_ignited': /when\s+ignited/i,
        'while_ignited': /while\s+ignited/i,
        'when_chilled': /when\s+chilled/i,
        'while_chilled': /while\s+chilled/i,
        'when_frozen': /when\s+frozen/i,
        'while_frozen': /while\s+frozen/i,
        'when_shocked': /when\s+shocked/i,
        'while_shocked': /while\s+shocked/i,
        'on_kill': /on\s+kill/i,
        'on_hit': /on\s+hit/i,
        'on_crit': /on\s+critical\s+hit/i,
        'while_leeching': /while\s+leeching/i,
        'while_bleeding': /while\s+bleeding/i,
        'while_poisoned': /while\s+poisoned/i,
        'recently': /recently/i,
        'on_low_life': /on\s+low\s+life/i,
        'on_full_life': /on\s+full\s+life/i
    };

    for (const [condition, regex] of Object.entries(conditions)) {
        if (regex.test(mod)) {
            const condTags = extractConditionalTags(mod);

            item.conditionalMods.push({
                condition,
                effect: cleanMod(mod),
                tags: condTags
            });

            // Add condition tag
            item.tags.add(condition);
            item.tags.add('conditional');

            // Add effect tags
            condTags.forEach(tag => item.tags.add(tag));
        }
    }
}

/**
 * Extract tags from conditional mod text
 */
function extractConditionalTags(mod) {
    const tags = [];

    // Damage types
    if (/fire/i.test(mod)) tags.push('fire');
    if (/cold/i.test(mod)) tags.push('cold');
    if (/lightning/i.test(mod)) tags.push('lightning');
    if (/chaos/i.test(mod)) tags.push('chaos');
    if (/physical/i.test(mod)) tags.push('physical');

    // Damage modifiers
    if (/more\s+damage/i.test(mod)) tags.push('more_damage');
    if (/increased\s+damage/i.test(mod)) tags.push('increased_damage');

    return tags;
}

/**
 * Generate TypeScript file content
 */
function generateTypeScriptFile(items) {
    return `// Auto-generated from PoB Uniques data - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

export interface UniqueItemVariant {
  name: string;
  mods: string[];
}

export interface SkillGrant {
  skillName: string;
  minLevel: number;
  maxLevel: number;
}

export interface SkillLevelBoost {
  skillTypes: string[];  // e.g., ["fire"], ["lightning"], ["all"]
  bonus: number;         // e.g., +1, +2
}

export interface ConditionalMod {
  condition: string;     // e.g., "when_ignited", "while_chilled", "on_kill"
  effect: string;        // Full mod text
  tags: string[];        // Associated tags
}

export interface UniqueItem {
  id: string;
  name: string;
  baseType: string;
  itemClass: string;
  requiredLevel?: number;
  league?: string;
  source?: string;
  variants: UniqueItemVariant[];
  implicits: string[];
  explicits: string[];
  tags: string[];
  
  // NEW: Enhanced fields
  grantedSkills?: SkillGrant[];          // Skills this item grants
  skillLevelBoosts?: SkillLevelBoost[];  // +X to Level bonuses
  conditionalMods?: ConditionalMod[];    // Conditional effects
}

export const POE2_UNIQUE_ITEMS: UniqueItem[] = ${JSON.stringify(items, null, 2)};

// Helper functions
export const getUniquesByClass = (itemClass: string) => 
  POE2_UNIQUE_ITEMS.filter(i => i.itemClass === itemClass);

export const getUniquesByTag = (tag: string) => 
  POE2_UNIQUE_ITEMS.filter(i => i.tags.includes(tag));

export const getUniquesByTags = (tags: string[]) => 
  POE2_UNIQUE_ITEMS.filter(i => tags.some(tag => i.tags.includes(tag)));

export const getLeagueUniques = (league: string) => 
  POE2_UNIQUE_ITEMS.filter(i => i.league === league);

export const getUniquesGrantingSkill = (skillName: string) =>
  POE2_UNIQUE_ITEMS.filter(i => 
    i.grantedSkills?.some(s => s.skillName.toLowerCase().includes(skillName.toLowerCase()))
  );

export const getUniquesBoostingSkillType = (skillType: string) =>
  POE2_UNIQUE_ITEMS.filter(i => 
    i.skillLevelBoosts?.some(b => b.skillTypes.includes(skillType.toLowerCase()))
  );

export const searchUniques = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return POE2_UNIQUE_ITEMS.filter(i => 
    i.name.toLowerCase().includes(lowerQuery) ||
    i.baseType.toLowerCase().includes(lowerQuery) ||
    i.explicits.some(mod => mod.toLowerCase().includes(lowerQuery))
  );
};
`;
}
