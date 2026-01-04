import axios, { AxiosError } from 'axios';
import { POE2_CLASSES, GAME_MECHANICS } from '../data/poe2/game_data';
import { POE2_SKILLS, getActiveSkills, getSupportGems } from '../data/poe2/skills';
import { tagExtractor } from './tagExtractor';
import { dataFilter } from './dataFilter';

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Model selection
const MODELS = {
    BUILD_STRUCTURE: 'xiaomi/mimo-v2-flash:free', // Reliable JSON structure
    EXPLANATIONS: 'xiaomi/mimo-v2-flash:free', // High quality explanations
    FALLBACK: 'xiaomi/mimo-v2-flash:free', // Good open model fallback
};

// Types
export interface BuildPreferences {
    playstyle_description: string;
    class?: string;
    allow_uniques?: boolean;
    allow_respec?: boolean;
    preferred_ascendancy?: string;
}

export interface Build {
    name: string;
    class: string;
    ascendancy: string;
    playstyle: string;
    mainSkill: {
        gem: string;
        description: string;
        scalingMechanic: string;
    };
    levelingGuide: {
        phases: LevelingPhase[];
        respecNeeded: boolean;
        respecPoints: string[];
    };
    gearProgression: {
        starter: any;
        mid: any;
        endgame: any;
        alternatives: any[];
    };
    passiveTreePath: {
        keystones: string[];
        byPhase: any;
    };
    analysis: {
        strengths: string[];
        weaknesses: string[];
        mappingRating: number;
        bossingRating: number;
        survivalRating: number;
        explanation: string;
    };
}

export interface LevelingPhase {
    levelRange: string;
    location: string;
    mainSkillSetup: {
        main: string;
        supports: string[];
        quality?: number;
    };
    secondarySkill?: any;
    passiveNodes: string[];
    gearTargets: any;
    gemSlotProgression: number;
    bossStrategy?: string;
    importantNotes: string[];
}

// OpenRouter API call with retry logic
async function callOpenRouter(
    prompt: string,
    systemPrompt: string,
    model: string = MODELS.BUILD_STRUCTURE,
    maxRetries: number = 3
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🤖 Calling OpenRouter (${model}) - Attempt ${attempt}/${maxRetries}`);

            const response = await axios.post(
                OPENROUTER_API_URL,
                {
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt,
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 4000,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'https://exileforge.app',
                        'X-Title': 'ExileForge Build Generator',
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000, // 60 second timeout
                }
            );

            const content = response.data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No content in OpenRouter response');
            }

            // Log cost info if available
            if (response.data.usage) {
                console.log('💰 Token usage:', response.data.usage);
            }

            return content;
        } catch (error) {
            lastError = error as Error;

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error(`❌ OpenRouter API error (attempt ${attempt}):`, {
                    status: axiosError.response?.status,
                    statusText: axiosError.response?.statusText,
                    data: axiosError.response?.data,
                });

                // Don't retry on 4xx errors (client errors)
                if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
                    throw error;
                }
            } else {
                console.error(`❌ Error calling OpenRouter (attempt ${attempt}):`, error);
            }

            // Exponential backoff
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('Failed to call OpenRouter after all retries');
}

// Helper to build skills context using tag-based filtering
function getSkillsContext(playstyleDescription: string, classAttr?: string): string {
    // Extract tags from user's description
    const buildTags = tagExtractor.extractTags(playstyleDescription);

    // Filter skills based on tags (reduces from 904 to ~20-50)
    const relevantSkills = dataFilter.filterSkills(buildTags, 40);

    // Further filter by class attribute if provided
    let classFilteredSkills = relevantSkills;
    if (classAttr) {
        // Handle hybrid attributes like "Dex/Int"
        const attrs = classAttr.toLowerCase().split('/').map(a => a.trim()) as ('str' | 'dex' | 'int')[];

        classFilteredSkills = relevantSkills.filter(s => {
            // Include skill if it requires ANY of the class's primary attributes
            // or if it has low requirements (generic skills)
            return attrs.some(attr => (s.requirements[attr] || 0) >= 1) ||
                (Object.values(s.requirements).every(v => v < 40));
        });
    }

    // Get top relevant support gems
    const relevantSupports = relevantSkills
        .filter(s => s.type === 'Support')
        .slice(0, 15);

    const relevantActives = classFilteredSkills.filter(s =>
        s.type === 'Attack' || s.type === 'Spell' || s.type === 'Minion'
    ).slice(0, 25);

    return `\n## RELEVANT SKILLS FOR YOUR BUILD\n\n**Matched Tags**: ${tagExtractor.getAllTags(buildTags).join(', ') || 'none detected'}\n\n**Available Active Skills (${relevantActives.length} matched)**:\n${relevantActives.map(s => `- **${s.name}** (${s.type}): ${s.tagString}`).join('\n')}\n\n**Compatible Support Gems (${relevantSupports.length})**:\n${relevantSupports.map(s => `- **${s.name}**: ${s.tagString}`).join('\n')}\n\n💡 **CRITICAL**: Only use skills from this list. Match support gems to active skill tags!\n`;
}

// Helper to build unique items context
function getUniquesContext(playstyleDescription: string): string {
    const buildTags = tagExtractor.extractTags(playstyleDescription);
    const relevantItems = dataFilter.filterUniqueItems(buildTags, 25);

    if (relevantItems.length === 0) {
        return '\n## RECOMMENDED UNIQUE ITEMS\nNo specific unique items matched. Use rare items with relevant stats.\n';
    }

    return `\n## RECOMMENDED UNIQUE ITEMS (${relevantItems.length} matched)\n\n${relevantItems.slice(0, 15).map(item => {
        const keyMods = item.explicits.slice(0, 2).join('; ');
        return `- **${item.name}** (${item.baseType}): ${keyMods}`;
    }).join('\n')}\n\n💡 These items synergize with your build tags.\n`;
}

// Helper to build passive tree context
function getPassivesContext(playstyleDescription: string): string {
    const buildTags = tagExtractor.extractTags(playstyleDescription);
    const relevantPassives = dataFilter.filterPassivesByTags(buildTags, 30);

    const keystones = relevantPassives.filter(n => n.isKeystone);
    const notables = relevantPassives.filter(n => n.isNotable);

    if (relevantPassives.length === 0) {
        return '\n## RELEVANT PASSIVE NODES\nNo specific notables matched. Focus on standard clusters for your tags.\n';
    }

    return `\n## RELEVANT PASSIVE NODES (${relevantPassives.length} matched)\n\n**Key Keystones**: ${keystones.map(n => n.name).join(', ') || 'None'}\n\n**Strong Notables**:\n${notables.slice(0, 15).map(n => `- **${n.name}**: ${n.stats[0]}`).join('\n')}\n\n💡 Match your pathing to these key nodes.\n`;
}

// Helper to build runes context
function getRunesContext(playstyleDescription: string): string {
    const buildTags = tagExtractor.extractTags(playstyleDescription);
    const relevantRunes = dataFilter.filterRunesByTags(buildTags, 15);

    if (relevantRunes.length === 0) {
        return '';
    }

    return `\n## RECOMMENDED RUNES FOR SOCKETS\n${relevantRunes.map(r => {
        const slots = Object.keys(r.slots).join('/');
        const firstStat = r.slots[Object.keys(r.slots)[0]].stats[0];
        return `- **${r.name}** (${slots}): ${firstStat}`;
    }).join('\n')}\n\n💡 Use these runes in your gear sockets for extra synergy.\n`;
}

// Helper to build ascendancy context
function getAscendancyContext(className: string, playstyleDescription: string): string {
    const classData = POE2_CLASSES.find(c => c.name === className);
    if (!classData || !classData.ascendancies || classData.ascendancies.length === 0) return '';

    const buildTags = tagExtractor.extractTags(playstyleDescription);
    let context = `\n## ASCENDANCY CHOICES FOR ${className.toUpperCase()}\n\n`;

    for (const ascName of classData.ascendancies) {
        const nodes = dataFilter.getAscendancyNodes(ascName, buildTags);
        if (nodes.length > 0) {
            context += `**${ascName}** (${nodes.length} relevant nodes):\n`;
            nodes.slice(0, 5).forEach(n => {
                context += `- ${n.name}: ${n.stats[0]}\n`;
            });
            context += '\n';
        } else {
            // Still show ascendancy even if no tags match
            const allNodes = dataFilter.getAscendancyNodes(ascName);
            if (allNodes.length > 0) {
                context += `**${ascName}** (available):\n`;
                allNodes.slice(0, 3).forEach(n => {
                    context += `- ${n.name}: ${n.stats[0]}\n`;
                });
                context += '\n';
            }
        }
    }

    return context + '💡 **CRITICAL**: Ascendancy nodes are build-defining. Choose the ascendancy that best enables your playstyle!\n';
}

// Helper to build context-aware system prompt
function buildSystemPrompt(preferences: BuildPreferences): string {
    // Get skills context for this class
    const classInfo = preferences.class ? POE2_CLASSES.find(c => c.name.toLowerCase() === preferences.class?.toLowerCase()) : null;
    const primaryAttr = classInfo?.attribute;

    // Use intelligent filtering based on playstyle description
    const skillsContext = getSkillsContext(preferences.playstyle_description, primaryAttr);
    const uniquesContext = getUniquesContext(preferences.playstyle_description);
    const passivesContext = getPassivesContext(preferences.playstyle_description);
    const runesContext = getRunesContext(preferences.playstyle_description);
    const ascendancyContext = preferences.class ? getAscendancyContext(preferences.class, preferences.playstyle_description) : '';

    // Build context-aware system prompt
    let systemPrompt = `You are an AI assistant specialized in creating detailed Path of Exile 2 builds.\n\n## CRITICAL GAME RULES\n${GAME_MECHANICS.map(m => `- **${m.name}**: ${m.description}`).join('\n')}\n\n## NEW POE 2 MECHANICS\nPath of Exile 2 has MAJOR changes:\n1. **Spirit Resource**: Each character has a Spirit pool (base: 60-80) used for reserving auras/minions\n2. **Dodge Roll**: Universal mobility (no Quicksilver Flask), creates I-frames\n3. **Weapon Swapping**: Two 6-link setups, can switch mid-combat\n4. **Combo System**: Attacks build combo points for powerful payoffs\n5. **Uncut Gems**: Support gems drop as "uncut" - you must cut them to choose a variant\n\n${skillsContext}\n\n${uniquesContext}\n\n${passivesContext}\n\n${ascendancyContext}\n\n${runesContext}\n`;

    // Inject Class Specific Data if selected
    if (preferences.class) {
        const classData = POE2_CLASSES.find(c => c.name === preferences.class);
        if (classData) {
            systemPrompt += `\nSELECTED CLASS: ${classData.name}
            - Attribute: ${classData.attribute}
            - Ascendancies: ${classData.ascendancies.join(', ')}
            - Theme: ${classData.description}
            - Mechanic: ${classData.signatureMechanic}
            
            Use this class's specific strengths and ascendancies.`;
        }
    }

    return systemPrompt + `\n\nCreate a VIABLE, PRACTICAL build that works from Act 1 to endgame. Return ONLY JSON.`;
}

// Generate build structure with AI
export async function generateBuild(preferences: BuildPreferences): Promise<Build> {
    const systemPrompt = buildSystemPrompt(preferences);

    const userPrompt = `
    USER REQUEST: ${preferences.playstyle_description}
    ${preferences.class ? `Class: ${preferences.class}` : 'Class: Choose the best fit from the 12 PoE2 classes.'}
    ${preferences.preferred_ascendancy ? `Preferred Ascendancy: ${preferences.preferred_ascendancy}` : ''}
    ${preferences.allow_uniques === false ? 'CONSTRAINT: No unique items, use only rares' : ''}
    
    Generate a JSON build plan following this STRICT schema:
    {
      "name": "Creative Build Name",
      "class": "Exact Class Name",
      "ascendancy": "Ascendancy Name",
      "playstyle": "Brief description",
      "mainSkill": {
        "gem": "Skill Name",
        "scalingMechanic": "e.g. Bleed, Ignite, Crit",
        "description": "Short usage info"
      },
      "gearProgression": {
        "starter": { "body": {"baseName": "Item Name", "keyAffixes": ["list"], "reasonWhy": "why"} },
        "mid": {},
        "endgame": {},
        "alternatives": []
      },
      "levelingGuide": {
        "phases": [
          {
            "levelRange": "1-24",
            "location": "Acts 1-3",
            "mainSkillSetup": { "main": "Skill", "supports": ["Support1"] },
            "passiveNodes": ["Cluster Name"],
            "gearTargets": { "weapon": "Type" },
            "importantNotes": ["Note"]
          }
        ],
        "respecNeeded": false,
        "respecPoints": []
      },
      "passiveTreePath": {
        "keystones": ["Keystone Name"],
        "byPhase": {}
      },
      "analysis": {
        "strengths": ["List"],
        "weaknesses": ["List"],
        "mappingRating": 1-10,
        "bossingRating": 1-10,
        "survivalRating": 1-10,
        "explanation": "Summary"
      }
    }`;

    try {
        const response = await callOpenRouter(userPrompt, systemPrompt, MODELS.BUILD_STRUCTURE);

        // Clean response (remove markdown code blocks if present)
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        }

        // Parse JSON
        const build = JSON.parse(cleanedResponse);

        console.log('✅ Build generated successfully:', build.name);
        return build;
    } catch (error) {
        console.error('❌ Failed to generate build:', error);

        if (error instanceof SyntaxError) {
            throw new Error('AI returned invalid JSON. Please try again.');
        }

        throw error;
    }
}

// Generate detailed explanation with Claude
export async function generateExplanation(build: Build): Promise<string> {
    const systemPrompt = `You are a master Path of Exile 2 build guide writer with 10+ years of community experience. Your guides are detailed, practical, and inspiring.`;

    const userPrompt = `
BUILD DATA:
${JSON.stringify(build, null, 2)}

Write a comprehensive BUILD EXPLANATION in Markdown format that covers:

## Core Concept
- What makes this build unique
- Main scaling mechanic
- Why it works

## Skill Breakdown
- Main skill: mechanics and why chosen
- Support gems: what each does and why they matter
- Gem progression: how to adapt as you level

## Gear Strategy
- Unique items: which ones matter, why
- Rare items: what affixes to prioritize
- Budget tiers: starter → mid → endgame path
- Craft recommendations: what to farm/craft

## Passive Tree
- Key clusters and why
- Life vs damage balance
- Keystones and synergies

## Playstyle Tips
- Positioning and movement patterns
- Defensive layers and when to use them
- DPS rotation or spam strategy
- Mapping vs bossing adjustments

## Endgame Content
- Mapping performance (clear speed, sustainability)
- Boss fights: which are easy, which need adjustment
- Hard content adjustments

## Common Problems & Solutions
- If mapping is slow: adjust X
- If you're dying: prioritize Y
- If gear is expensive: use alternative Z

Write in engaging, conversational tone. Include specific numbers where relevant. Be honest about weaknesses.`;

    try {
        const response = await callOpenRouter(userPrompt, systemPrompt, MODELS.EXPLANATIONS);
        console.log('✅ Explanation generated successfully');
        return response;
    } catch (error) {
        console.error('❌ Failed to generate explanation:', error);
        throw error;
    }
}

// Cost estimation
export function estimateCost(build: Build): { tokens: number; costUSD: number } {
    // Rough estimation based on typical build data
    const buildTokens = 1500; // Grok-3 for structure
    const explanationTokens = 2000; // Claude for explanation

    // OpenRouter pricing (approximate)
    const grokCostPer1k = 0.01;
    const claudeCostPer1k = 0.015;

    const totalCost =
        (buildTokens / 1000) * grokCostPer1k +
        (explanationTokens / 1000) * claudeCostPer1k;

    return {
        tokens: buildTokens + explanationTokens,
        costUSD: totalCost,
    };
}

// Full build generation (structure + explanation)
export async function generateFullBuild(preferences: BuildPreferences): Promise<{
    build: Build;
    explanation: string;
    cost: { tokens: number; costUSD: number };
}> {
    console.log('🚀 Starting full build generation...');

    // Generate build structure
    const build = await generateBuild(preferences);

    // Generate explanation
    const explanation = await generateExplanation(build);

    // Estimate cost
    const cost = estimateCost(build);

    console.log('✅ Full build generation complete!');
    console.log(`💰 Estimated cost: $${cost.costUSD.toFixed(4)}`);

    return { build, explanation, cost };
}
