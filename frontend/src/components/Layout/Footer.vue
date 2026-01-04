<template>
  <footer class="bg-bg-secondary border-t-2 border-border-primary mt-auto py-8">
    <div class="container mx-auto px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <!-- Brand -->
        <div>
          <h3 class="font-serif text-xl font-bold text-eternal-gold mb-2">ExileForge</h3>
          <p class="text-text-secondary text-sm">
            AI-Powered Path of Exile 2 Build Generator
          </p>
        </div>
        
        <!-- Links -->
        <div>
          <h4 class="font-semibold text-text-primary mb-2">Quick Links</h4>
          <div class="flex flex-col gap-2">
            <router-link to="/" class="text-text-secondary hover:text-eternal-gold transition-fast text-sm">
              Home
            </router-link>
            <router-link to="/builder" class="text-text-secondary hover:text-eternal-gold transition-fast text-sm">
              Build Generator
            </router-link>
            <router-link to="/browse" class="text-text-secondary hover:text-eternal-gold transition-fast text-sm">
              Browse Builds
            </router-link>
          </div>
        </div>
        
        <!-- Info -->
        <div>
          <h4 class="font-semibold text-text-primary mb-2">About</h4>
          <p class="text-text-secondary text-sm">
            ExileForge uses AI to create optimized Path of Exile 2 builds with detailed leveling guides and gear progressions.
          </p>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-border-primary pt-4 text-center text-text-secondary text-sm">
        <p>&copy; {{ new Date().getFullYear() }} ExileForge. Built with ❤️ for the Exile community.</p>
        <p class="mt-1 text-xs">Not affiliated with Grinding Gear Games.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component - static, no logic needed
</script>
