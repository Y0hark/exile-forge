<template>
  <div class="markdown-content prose prose-invert max-w-none" v-html="renderedMarkdown"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const props = defineProps<{
  content: string;
}>();

// Configure markdown-it with syntax highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

const renderedMarkdown = computed(() => {
  return md.render(props.content || '');
});
</script>

<style scoped>
.markdown-content {
  color: var(--color-text-primary);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: var(--color-eternal-gold);
  font-family: var(--font-serif);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-md);
}

.markdown-content :deep(h1) {
  font-size: 2.5rem;
  border-bottom: 2px solid var(--color-border-primary);
  padding-bottom: var(--space-sm);
}

.markdown-content :deep(h2) {
  font-size: 2rem;
}

.markdown-content :deep(h3) {
  font-size: 1.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: var(--space-md);
  line-height: 1.7;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: var(--space-lg);
  margin-bottom: var(--space-md);
}

.markdown-content :deep(li) {
  margin-bottom: var(--space-sm);
}

.markdown-content :deep(code) {
  font-family: var(--font-mono);
  background-color: var(--color-bg-surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  padding: var(--space-md);
  overflow-x: auto;
  margin-bottom: var(--space-md);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(a) {
  color: var(--color-eternal-gold);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--color-eternal-gold);
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-eternal-gold);
  padding-left: var(--space-md);
  margin-left: 0;
  margin-bottom: var(--space-md);
  color: var(--color-text-secondary);
  font-style: italic;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-md);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--color-border-primary);
  padding: var(--space-sm);
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: var(--color-bg-surface);
  color: var(--color-eternal-gold);
  font-weight: 600;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--color-border-primary);
  margin: var(--space-xl) 0;
}
</style>
