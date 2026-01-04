/**
 * Tag Extractor Service
 * Analyzes user build descriptions to extract relevant tags for data filtering
 */

export interface BuildTags {
    damageTypes: string[];      // fire, cold, lightning, chaos, physical
    skillTypes: string[];        // attack, spell, minion, totem, trap
    defenseTypes: string[];      // armor, evasion, es (energy shield), life, mana
    attributes: string[];        // strength, dexterity, intelligence
    mechanics: string[];         // crit, poison, bleed, ignite, freeze, shock, curse, aura
    archetypes: string[];        // melee, ranged, summoner, tank, caster
    itemClasses: string[];       // weapon, armor, jewelry, etc.
}

export class TagExtractor {
    /**
     * Extract tags from user's build description
     */
    extractTags(description: string): BuildTags {
        const lowerDesc = description.toLowerCase();

        const tags: BuildTags = {
            damageTypes: [],
            skillTypes: [],
            defenseTypes: [],
            attributes: [],
            mechanics: [],
            archetypes: [],
            itemClasses: []
        };

        // Damage types
        if (/\bfire\b|ignite|burning|incinerat/i.test(lowerDesc)) tags.damageTypes.push('fire');
        if (/\bcold\b|freeze|chill|frost/i.test(lowerDesc)) tags.damageTypes.push('cold');
        if (/lightning|shock|electr/i.test(lowerDesc)) tags.damageTypes.push('lightning');
        if (/\bchaos\b|poison|wither/i.test(lowerDesc)) tags.damageTypes.push('chaos');
        if (/physical|bleed|impale/i.test(lowerDesc)) tags.damageTypes.push('physical');

        // Skill types
        if (/attack|strike|slam|cleave|sweep/i.test(lowerDesc)) tags.skillTypes.push('attack');
        if (/spell|cast|nova|bolt/i.test(lowerDesc)) tags.skillTypes.push('spell');
        if (/minion|summon|zombie|skeleton|spectre/i.test(lowerDesc)) tags.skillTypes.push('minion');
        if (/totem/i.test(lowerDesc)) tags.skillTypes.push('totem');
        if (/trap|mine/i.test(lowerDesc)) tags.skillTypes.push('trap');

        // Defense types
        if (/\barmor\b/i.test(lowerDesc)) tags.defenseTypes.push('armor');
        if (/evasion|dodge/i.test(lowerDesc)) tags.defenseTypes.push('evasion');
        if (/energy shield|es\b/i.test(lowerDesc)) tags.defenseTypes.push('es');
        if (/\blife\b|hp|health/i.test(lowerDesc)) tags.defenseTypes.push('life');
        if (/\bmana\b/i.test(lowerDesc)) tags.defenseTypes.push('mana');

        // Attributes
        if (/strength|str\b|marauder|warrior|juggernaut/i.test(lowerDesc)) tags.attributes.push('strength');
        if (/dexterity|dex\b|ranger|huntress|deadeye/i.test(lowerDesc)) tags.attributes.push('dexterity');
        if (/intelligence|int\b|witch|sorceress|necromancer/i.test(lowerDesc)) tags.attributes.push('intelligence');

        // Mechanics
        if (/crit|critical/i.test(lowerDesc)) tags.mechanics.push('crit');
        if (/poison/i.test(lowerDesc)) tags.mechanics.push('poison');
        if (/bleed/i.test(lowerDesc)) tags.mechanics.push('bleed');
        if (/ignite/i.test(lowerDesc)) tags.mechanics.push('ignite');
        if (/freeze/i.test(lowerDesc)) tags.mechanics.push('freeze');
        if (/shock/i.test(lowerDesc)) tags.mechanics.push('shock');
        if (/curse|hex/i.test(lowerDesc)) tags.mechanics.push('curse');
        if (/aura/i.test(lowerDesc)) tags.mechanics.push('aura');
        if (/plant|nature|thorn|vine/i.test(lowerDesc)) {
            tags.mechanics.push('poison'); // Plant skills often poison
            tags.damageTypes.push('chaos');
            tags.damageTypes.push('physical'); // Thorns are phys
            tags.attributes.push('dexterity'); // Ranger theme
        }

        // Archetypes
        if (/melee|close range|up close/i.test(lowerDesc)) tags.archetypes.push('melee');
        if (/ranged|bow|crossbow|projectile/i.test(lowerDesc)) tags.archetypes.push('ranged');
        if (/summon|minion|necro/i.test(lowerDesc)) tags.archetypes.push('summoner');
        if (/tank|defensive|tanky/i.test(lowerDesc)) tags.archetypes.push('tank');
        if (/caster|spell/i.test(lowerDesc)) tags.archetypes.push('caster');

        // Item classes (for unique items filtering)
        if (/ring/i.test(lowerDesc)) tags.itemClasses.push('ring');
        if (/amulet/i.test(lowerDesc)) tags.itemClasses.push('amulet');
        if (/belt/i.test(lowerDesc)) tags.itemClasses.push('belt');
        if (/helmet|helm/i.test(lowerDesc)) tags.itemClasses.push('helmet');
        if (/body|chest|armor/i.test(lowerDesc)) tags.itemClasses.push('body');
        if (/gloves/i.test(lowerDesc)) tags.itemClasses.push('gloves');
        if (/boots/i.test(lowerDesc)) tags.itemClasses.push('boots');
        if (/weapon|sword|axe|mace|bow|wand|staff/i.test(lowerDesc)) {
            tags.itemClasses.push('weapon');
        }
        if (/shield/i.test(lowerDesc)) tags.itemClasses.push('shield');

        return tags;
    }

    /**
     * Get all unique tags combined
     */
    getAllTags(buildTags: BuildTags): string[] {
        return [
            ...buildTags.damageTypes,
            ...buildTags.skillTypes,
            ...buildTags.defenseTypes,
            ...buildTags.attributes,
            ...buildTags.mechanics,
            ...buildTags.archetypes
        ];
    }

    /**
     * Calculate relevance score for an item based on tags
     */
    calculateRelevance(itemTags: string[], buildTags: BuildTags): number {
        const allBuildTags = this.getAllTags(buildTags);
        if (allBuildTags.length === 0) return 0;

        let matchCount = 0;
        for (const tag of itemTags) {
            if (allBuildTags.includes(tag)) {
                matchCount++;
            }
        }

        return matchCount / allBuildTags.length;
    }
}

export const tagExtractor = new TagExtractor();
