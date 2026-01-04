const fs = require('fs');
const path = require('path');

const POB_RUNES_LUA = path.join(__dirname, '../data/PoBPOE2/Data/ModRunes.lua');
const OUTPUT_TS = path.join(__dirname, '../data/poe2/runes.ts');
const OUTPUT_JSON = path.join(__dirname, '../../../frontend/src/data/runes.json');

function extractRunes() {
    console.log("🔍 Reading ModRunes.lua...");
    const content = fs.readFileSync(POB_RUNES_LUA, 'utf8');

    const runes = [];
    const lines = content.split('\n');
    let currentRune = null;
    let currentSlot = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match Rune Name (Level 1: 1 tab)
        const nameMatch = line.match(/^\t\["(.*)"\] = \{/);
        if (nameMatch) {
            currentRune = { name: nameMatch[1], slots: {} };
            continue;
        }

        if (currentRune) {
            // Match Slot Name (Level 2: 2 tabs)
            const slotMatch = line.match(/^\t\t\["(.*)"\] = \{/);
            if (slotMatch) {
                currentSlot = slotMatch[1];
                currentRune.slots[currentSlot] = { stats: [] };
                continue;
            }

            // Match Stats (Level 3: 4 tabs)
            const statMatch = line.match(/^\t\t\t\t"(.*)",?$/);
            if (statMatch && currentSlot) {
                // Skip non-stat lines
                if (!statMatch[1].startsWith('type =') && !statMatch[1].startsWith('statOrder =') && !statMatch[1].startsWith('rank =')) {
                    currentRune.slots[currentSlot].stats.push(statMatch[1]);
                }
                continue;
            }

            // Closing Rune definition (Level 1 closing)
            if (line === '\t},') {
                runes.push(currentRune);
                currentRune = null;
                currentSlot = null;
            }
        }
    }

    // Filter out entries with no slots/stats
    const validRunes = runes.filter(r => Object.keys(r.slots).length > 0);
    console.log(`📦 Processed ${validRunes.length} valid runes.`);

    // Generate tags
    const extractedRunes = validRunes.map(rune => {
        const allStats = [];
        for (const slot in rune.slots) {
            allStats.push(...rune.slots[slot].stats);
        }
        return {
            ...rune,
            tags: generateTags(rune.name, allStats)
        };
    });

    const tsContent = `/**
 * PoE2 Runes Data
 * Auto-generated from PoB ModRunes.lua
 */

export interface RuneSlotData {
  stats: string[];
}

export interface Rune {
  name: string;
  slots: Record<string, RuneSlotData>;
  tags: string[];
}

export const POE2_RUNES: Rune[] = ${JSON.stringify(extractedRunes, null, 2)};

export const getRunesByTag = (tag: string) => 
  POE2_RUNES.filter(r => r.tags.includes(tag));

export const getRunesBySlot = (slot: string) =>
  POE2_RUNES.filter(r => !!r.slots[slot]);
`;

    fs.writeFileSync(OUTPUT_TS, tsContent);
    console.log(`📝 Wrote TypeScript to: ${OUTPUT_TS}`);
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(extractedRunes, null, 2));
    console.log(`📝 Wrote JSON to: ${OUTPUT_JSON}`);
}

function generateTags(name, stats) {
    const tags = new Set();
    const text = (name + " " + stats.join(" ")).toLowerCase();

    if (text.includes("physical")) tags.add("physical");
    if (text.includes("fire") || text.includes("ignite")) tags.add("fire");
    if (text.includes("cold") || text.includes("freeze")) tags.add("cold");
    if (text.includes("lightning") || text.includes("shock")) tags.add("lightning");
    if (text.includes("chaos") || text.includes("poison")) tags.add("chaos");
    if (text.includes("life")) tags.add("life");
    if (text.includes("mana")) tags.add("mana");
    if (text.includes("energy shield") || /\bes\b/.test(text)) tags.add("es");
    if (text.includes("armour")) tags.add("armour");
    if (text.includes("evasion")) tags.add("evasion");
    if (text.includes("resistance")) tags.add("resistance");
    if (text.includes("critical")) tags.add("crit");
    if (text.includes("spirit")) tags.add("spirit");
    if (text.includes("minion") || text.includes("command")) tags.add("minion");

    return Array.from(tags);
}

extractRunes();
