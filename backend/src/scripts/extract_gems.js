#!/usr/bin/env node

/**
 * Script to extract skill/gem data from PoB's Gems.lua file
 * Converts Lua table format to TypeScript/JSON
 */

const fs = require('fs');
const path = require('path');

// Paths
const GEMS_LUA_PATH = path.join(__dirname, '../data/PoBPOE2/Data/Gems.lua');
const OUTPUT_TS_PATH = path.join(__dirname, '../data/poe2/skills.ts');
const OUTPUT_JSON_PATH = path.join(__dirname, '../../frontend/src/data/skills.json');

console.log('🔍 Reading Gems.lua...');
const luaContent = fs.readFileSync(GEMS_LUA_PATH, 'utf8');

// Parse Lua entries with improved multi-line handling
const skills = [];

// Split into individual gem entries
const entries = luaContent.split(/\n\t\["/g).slice(1); // Skip header

let count = 0;

for (const entry of entries) {
  if (!entry.trim()) continue;

  count++;

  // Extract game ID (first part before "] = {")
  const idMatch = entry.match(/^([^"]+)"/);
  if (!idMatch) continue;

  const gameId = idMatch[1];

  // Extract the body content between { and },
  // Handle nested brackets properly by finding matching closing brace
  let depth = 0;
  let startIdx = entry.indexOf('{');
  let endIdx = -1;

  for (let i = startIdx; i < entry.length; i++) {
    if (entry[i] === '{') depth++;
    if (entry[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (startIdx === -1 || endIdx === -1) continue;

  const body = entry.substring(startIdx + 1, endIdx);

  // Extract fields
  const name = extractField(body, 'name');
  const gemType = extractField(body, 'gemType');
  const tagString = extractField(body, 'tagString');
  const weaponReq = extractField(body, 'weaponRequirements');
  const tier = extractNumber(body, 'Tier');
  const reqStr = extractNumber(body, 'reqStr');
  const reqDex = extractNumber(body, 'reqDex');
  const reqInt = extractNumber(body, 'reqInt');
  const gemFamily = extractField(body, 'gemFamily');

  // Extract tags object
  const tags = extractTags(body);

  // Only include if it has a name
  if (name) {
    skills.push({
      id: gameId,
      name,
      type: gemType || 'Unknown',
      tags: tags,
      tagString: tagString || '',
      requirements: {
        str: reqStr,
        dex: reqDex,
        int: reqInt
      },
      weaponRequirements: weaponReq || undefined,
      tier: tier !== null ? tier : 0,
      gemFamily: gemFamily || undefined
    });
  }
}

console.log(`✅ Extracted ${skills.length} skills from ${count} entries`);

// Sort by type then name
skills.sort((a, b) => {
  if (a.type !== b.type) return a.type.localeCompare(b.type);
  return a.name.localeCompare(b.name);
});

// Generate TypeScript file
const tsContent = `// Auto-generated from PoB Gems.lua - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

export interface Skill {
  id: string;
  name: string;
  type: 'Attack' | 'Spell' | 'Support' | 'Minion' | 'Buff' | 'Banner' | 'Mark' | 'Warcry' | 'Totem' | 'Shapeshift' | 'Unknown';
  tags: string[];
  tagString: string;
  requirements: {
    str: number;
    dex: number;
    int: number;
  };
  weaponRequirements?: string;
  tier: number;
  gemFamily?: string;
}

export const POE2_SKILLS: Skill[] = ${JSON.stringify(skills, null, 2)};

// Helper functions
export const getSkillsByType = (type: string) => 
  POE2_SKILLS.filter(s => s.type === type);

export const getActiveSkills = () => 
  POE2_SKILLS.filter(s => s.type === 'Attack' || s.type === 'Spell');

export const getSupportGems = () => 
  POE2_SKILLS.filter(s => s.type === 'Support');

export const getSkillsByTag = (tag: string) => 
  POE2_SKILLS.filter(s => s.tags.includes(tag.toLowerCase()));

export const getSkillsForClass = (primaryAttr: 'str' | 'dex' | 'int') => {
  const attrMap = { str: 'requirements.str', dex: 'requirements.dex', int: 'requirements.int' };
  return POE2_SKILLS.filter(s => {
    const reqs = s.requirements;
    return reqs[primaryAttr] === 100 || 
           (reqs[primaryAttr] >= 50 && Object.values(reqs).filter(v => v > 0).length > 1);
  });
};
`;

// Write TypeScript file
fs.writeFileSync(OUTPUT_TS_PATH, tsContent, 'utf8');
console.log(`📝 Wrote TypeScript to: ${OUTPUT_TS_PATH}`);

// Write JSON for frontend
const jsonContent = JSON.stringify(skills, null, 2);
fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_JSON_PATH, jsonContent, 'utf8');
console.log(`📝 Wrote JSON to: ${OUTPUT_JSON_PATH}`);

// Stats
const typeStats = skills.reduce((acc, s) => {
  acc[s.type] = (acc[s.type] || 0) + 1;
  return acc;
}, {});

console.log('\n📊 Stats:');
console.log(JSON.stringify(typeStats, null, 2));

// Helper functions
function extractField(body, fieldName) {
  const regex = new RegExp(`${fieldName}\\s*=\\s*"([^"]*)"`, 'i');
  const match = body.match(regex);
  return match ? match[1] : null;
}

function extractNumber(body, fieldName) {
  const regex = new RegExp(`${fieldName}\\s*=\\s*(\\d+)`, 'i');
  const match = body.match(regex);
  return match ? parseInt(match[1], 10) : 0;
}

function extractTags(body) {
  const tagsMatch = body.match(/tags\s*=\s*\{([^}]+)\}/);
  if (!tagsMatch) return [];

  const tagsContent = tagsMatch[1];
  const tagMatches = tagsContent.match(/(\w+)\s*=\s*true/g);
  if (!tagMatches) return [];

  return tagMatches.map(t => t.replace(/\s*=\s*true/, '').trim());
}
