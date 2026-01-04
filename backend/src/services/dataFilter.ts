/**
 * Data Filter Service
 * Filters game data (skills, items, passives, runes) based on extracted tags
 */

import { POE2_SKILLS, Skill } from '../data/poe2/skills';
import { POE2_UNIQUE_ITEMS, UniqueItem } from '../data/poe2/unique_items';
import { POE2_PASSIVE_NODES, PassiveNode } from '../data/poe2/passive_tree';
import { POE2_RUNES, Rune } from '../data/poe2/runes';
import { BuildTags } from './tagExtractor';

export class DataFilter {
    /**
     * Filter skills based on build tags
     */
    filterSkills(tags: BuildTags, maxResults: number = 50): Skill[] {
        const allTags = [
            ...tags.damageTypes,
            ...tags.skillTypes,
            ...tags.mechanics
        ];

        if (allTags.length === 0) {
            return POE2_SKILLS.filter(s => s.type === 'Attack' || s.type === 'Spell').slice(0, maxResults);
        }

        const scoredSkills = POE2_SKILLS.map(skill => {
            let score = 0;
            for (const tag of skill.tags) {
                if (allTags.includes(tag.toLowerCase())) score += 3;
            }
            if (tags.skillTypes.includes(skill.type.toLowerCase())) score += 5;
            if (skill.type === 'Attack' || skill.type === 'Spell') score += 1;
            return { skill, score };
        });

        return scoredSkills
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(s => s.skill);
    }

    /**
     * Get support gems compatible with a main skill
     */
    getSupportGems(mainSkill: Skill, maxResults: number = 10): Skill[] {
        const supports = POE2_SKILLS.filter(s => s.type === 'Support');
        const scoredSupports = supports.map(support => {
            let score = 0;
            for (const tag of support.tags) {
                if (mainSkill.tags.includes(tag)) score += 2;
            }
            return { support, score };
        });

        return scoredSupports
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(s => s.support);
    }

    /**
     * Filter unique items based on build tags
     */
    filterUniqueItems(tags: BuildTags, maxResults: number = 30): UniqueItem[] {
        const allTags = [
            ...tags.damageTypes,
            ...tags.skillTypes,
            ...tags.defenseTypes,
            ...tags.attributes,
            ...tags.mechanics
        ];

        if (allTags.length === 0) return POE2_UNIQUE_ITEMS.slice(0, maxResults);

        const scoredItems = POE2_UNIQUE_ITEMS.map(item => {
            let score = 0;
            for (const tag of item.tags) {
                if (allTags.includes(tag)) score += 2;
            }
            if (tags.itemClasses.includes(item.itemClass)) score += 3;
            return { item, score };
        });

        return scoredItems
            .filter(i => i.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(i => i.item);
    }

    /**
     * Filter passive nodes by tags (Notables and Keystones only)
     */
    filterPassivesByTags(tags: BuildTags, maxResults: number = 30): PassiveNode[] {
        const allTags = [
            ...tags.damageTypes,
            ...tags.skillTypes,
            ...tags.mechanics,
            ...tags.defenseTypes,
            ...tags.attributes
        ];

        if (allTags.length === 0) return [];

        const scoredNodes = POE2_PASSIVE_NODES.map(node => {
            if (!node.isNotable && !node.isKeystone) return { node, score: 0 };
            let score = 0;
            for (const tag of node.tags) {
                if (allTags.includes(tag)) {
                    // Ascendancy nodes get highest priority (build-defining)
                    if (node.ascendancyName) score += 10;
                    else if (node.isKeystone) score += 5;
                    else score += 2;
                }
            }
            return { node, score };
        });

        return scoredNodes
            .filter(n => n.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(n => n.node);
    }

    /**
     * Get ascendancy nodes for a specific ascendancy
     */
    getAscendancyNodes(ascendancy: string, tags?: BuildTags): PassiveNode[] {
        const ascNodes = POE2_PASSIVE_NODES.filter(n => n.ascendancyName === ascendancy);

        if (!tags) return ascNodes.filter(n => n.isNotable || n.isKeystone);

        // Score by tag relevance
        const allTags = [...tags.damageTypes, ...tags.skillTypes, ...tags.mechanics];
        return ascNodes
            .filter(n => n.isNotable || n.isKeystone)
            .map(node => {
                let score = 0;
                for (const tag of node.tags) {
                    if (allTags.includes(tag)) score += 3;
                }
                return { node, score };
            })
            .sort((a, b) => b.score - a.score)
            .map(n => n.node);
    }

    /**
     * Filter runes by tags
     */
    filterRunesByTags(tags: BuildTags, maxResults: number = 10): Rune[] {
        const allTags = [
            ...tags.damageTypes,
            ...tags.skillTypes,
            ...tags.mechanics
        ];
        if (allTags.length === 0) return [];

        return POE2_RUNES.filter(rune => {
            return rune.tags.some(tag => allTags.includes(tag));
        }).slice(0, maxResults);
    }

    /**
     * Get items by specific slot
     */
    getItemsBySlot(slot: string, tags?: BuildTags, maxResults: number = 5): UniqueItem[] {
        let items = POE2_UNIQUE_ITEMS.filter(i => i.itemClass === slot);
        if (tags) {
            const allTags = [...tags.damageTypes, ...tags.skillTypes];
            const scoredItems = items.map(item => {
                let score = 0;
                for (const tag of item.tags) if (allTags.includes(tag)) score++;
                return { item, score };
            });
            items = scoredItems.sort((a, b) => b.score - a.score).map(i => i.item);
        }
        return items.slice(0, maxResults);
    }
}

export const dataFilter = new DataFilter();
