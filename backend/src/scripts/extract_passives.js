const fs = require('fs');
const path = require('path');

const POB_TREE_JSON = path.join(__dirname, '../data/PoBPOE2/TreeData/0_4/tree.json');
const OUTPUT_TS = path.join(__dirname, '../data/poe2/passive_tree.ts');
const OUTPUT_JSON = path.join(__dirname, '../../../frontend/src/data/passive_tree.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_TS);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const frontendDataDir = path.dirname(OUTPUT_JSON);
if (!fs.existsSync(frontendDataDir)) {
    fs.mkdirSync(frontendDataDir, { recursive: true });
}

function extractPassives() {
    console.log("🔍 Reading tree.json...");
    const treeData = JSON.parse(fs.readFileSync(POB_TREE_JSON, 'utf8'));

    const nodes = treeData.nodes;
    const groups = treeData.groups;
    const constants = treeData.constants;

    const orbitRadii = treeData.orbitRadii || [0, 82, 162, 335, 493, 662, 846, 251, 1080, 1322];
    const orbitAngles = treeData.constants.orbitAnglesByOrbit;

    const extractedNodes = [];
    const statsTags = new Set();

    console.log(`📦 Processing ${Object.keys(nodes).length} nodes...`);

    for (const nodeId in nodes) {
        const node = nodes[nodeId];

        // Skip nodes without names or stats (often just internal/connector nodes)
        if (!node.name || !node.stats || node.stats.length === 0) continue;

        // Skip purely cosmetic nodes
        if (node.isOnlyImage) continue;

        // Calculate actual position
        let x = 0;
        let y = 0;
        const group = groups[node.group];
        if (group) {
            x = group.x;
            y = group.y;

            const orbit = node.orbit || 0;
            const orbitIndex = node.orbitIndex || 0;
            const radius = orbitRadii[orbit] || 0;
            const angles = orbitAngles[orbit] || [0];
            const angle = angles[orbitIndex] || 0;

            x += Math.round(radius * Math.sin(angle));
            y -= Math.round(radius * Math.cos(angle));
        }

        const tags = generateTags(node);
        tags.forEach(tag => statsTags.add(tag));

        extractedNodes.push({
            id: nodeId,
            name: node.name,
            icon: node.icon,
            stats: node.stats,
            isNotable: !!node.isNotable,
            isKeystone: !!node.isKeystone,
            isMastery: !!node.isMultipleChoice, // In PoE2 many masteries are multiple choice nodes
            isJewelSocket: !!node.isJewelSocket || !!node.containJewelSocket,
            ascendancyName: node.ascendancyName || undefined,
            x,
            y,
            tags: Array.from(tags)
        });
    }

    console.log(`✅ Extracted ${extractedNodes.length} relevant nodes.`);

    // Generate TypeScript file
    const tsContent = generateTypeScriptFile(extractedNodes);
    fs.writeFileSync(OUTPUT_TS, tsContent);
    console.log(`📝 Wrote TypeScript to: ${OUTPUT_TS}`);

    // Generate JSON file for frontend
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(extractedNodes, null, 2));
    console.log(`📝 Wrote JSON to: ${OUTPUT_JSON}`);

    // Print summary
    const summary = {
        total: extractedNodes.length,
        keystones: extractedNodes.filter(n => n.isKeystone).length,
        notables: extractedNodes.filter(n => n.isNotable).length,
        ascendancy: extractedNodes.filter(n => n.ascendancyName).length,
        masteries: extractedNodes.filter(n => n.isMastery).length
    };
    console.log("\n📊 Summary:", summary);
}

function generateTags(node) {
    const tags = new Set();
    const text = (node.name + " " + node.stats.join(" ")).toLowerCase();

    // Damage Types
    if (text.includes("physical")) tags.add("physical");
    if (text.includes("fire") || text.includes("burning") || text.includes("ignite")) tags.add("fire");
    if (text.includes("cold") || text.includes("freeze") || text.includes("chill")) tags.add("cold");
    if (text.includes("lightning") || text.includes("shock")) tags.add("lightning");
    if (text.includes("chaos") || text.includes("poison") || text.includes("wither")) tags.add("chaos");
    if (text.includes("elemental")) tags.add("elemental");

    // Skill Types
    if (text.includes("attack")) tags.add("attack");
    if (text.includes("spell")) tags.add("spell");
    if (text.includes("melee")) tags.add("melee");
    if (text.includes("projectile") || text.includes("bow")) tags.add("projectile");
    if (text.includes("minion") || text.includes("companion")) tags.add("minion");
    if (text.includes("totem")) tags.add("totem");
    if (text.includes("trap") || text.includes("mine")) tags.add("trap");

    // Defenses
    if (text.includes("life")) tags.add("life");
    if (text.includes("mana")) tags.add("mana");
    if (text.includes("energy shield") || /\bes\b/.test(text)) tags.add("es");
    if (text.includes("armour")) tags.add("armour");
    if (text.includes("evasion")) tags.add("evasion");
    if (text.includes("resistance")) tags.add("resistance");
    if (text.includes("block")) tags.add("block");
    if (text.includes("suppression") || text.includes("suppress")) tags.add("suppression");

    // Mechanics
    if (text.includes("critical strike") || text.includes("crit ")) tags.add("crit");
    if (text.includes("leech")) tags.add("leech");
    if (text.includes("regeneration") || text.includes("regen")) tags.add("regen");
    if (text.includes("accuracy")) tags.add("accuracy");
    if (text.includes("speed")) tags.add("speed");
    if (text.includes("area of effect") || text.includes("aoe")) tags.add("aoe");
    if (text.includes("pierce") || text.includes("fork") || text.includes("chain")) tags.add("projectile_mechanics");
    if (text.includes("curse") || text.includes("mark") || text.includes("hex")) tags.add("curse");
    if (text.includes("reservation") || text.includes("efficiency")) tags.add("reservation");

    // Attributes
    if (text.includes("strength") || /\bstr\b/.test(text)) tags.add("strength");
    if (text.includes("dexterity") || /\bdex\b/.test(text)) tags.add("dexterity");
    if (text.includes("intelligence") || /\bint\b/.test(text)) tags.add("intelligence");

    // Node Types
    if (node.isKeystone) tags.add("keystone");
    if (node.isNotable) tags.add("notable");
    if (node.ascendancyName) tags.add("ascendancy");

    return tags;
}

function generateTypeScriptFile(nodes) {
    return `/**
 * PoE2 Passive Tree Data
 * Auto-generated from PoB tree.json
 */

export interface PassiveNode {
  id: string;
  name: string;
  icon: string;
  stats: string[];
  isNotable: boolean;
  isKeystone: boolean;
  isMastery: boolean;
  isJewelSocket: boolean;
  ascendancyName?: string;
  x: number;
  y: number;
  tags: string[];
}

export const POE2_PASSIVE_NODES: PassiveNode[] = ${JSON.stringify(nodes, null, 2)};

export const getNodesByTag = (tag: string) => 
  POE2_PASSIVE_NODES.filter(n => n.tags.includes(tag));

export const getNodesByAscendancy = (ascendancy: string) =>
  POE2_PASSIVE_NODES.filter(n => n.ascendancyName === ascendancy);

export const getKeystones = () =>
  POE2_PASSIVE_NODES.filter(n => n.isKeystone);
`;
}

extractPassives();
