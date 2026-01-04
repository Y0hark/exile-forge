<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <section class="py-20 px-8 text-center bg-gradient-to-b from-bg-primary to-bg-secondary">
      <div class="container mx-auto max-w-4xl">
        <h1 class="font-serif text-6xl font-bold mb-6 text-eternal-gold fade-in">
          Forge Your Path
        </h1>
        <p class="text-xl text-text-secondary mb-8 slide-in-up">
          Generate optimized Path of Exile 2 builds with AI-powered recommendations,
          detailed leveling guides, and comprehensive gear progressions.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center slide-in-up">
          <router-link to="/builder" class="btn btn-primary text-lg px-8 py-4">
            Generate Build
          </router-link>
          <router-link to="/browse" class="btn btn-secondary text-lg px-8 py-4">
            Browse Builds
          </router-link>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16 px-8">
      <div class="container mx-auto max-w-6xl">
        <h2 class="font-serif text-4xl font-bold text-center mb-12 text-eternal-gold">
          What ExileForge Offers
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="card card-accent text-center">
            <div class="text-5xl mb-4">🤖</div>
            <h3 class="font-serif text-2xl font-bold mb-3 text-eternal-gold">AI-Powered</h3>
            <p class="text-text-secondary">
              Advanced AI analyzes game mechanics to create viable builds tailored to your playstyle.
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="card card-accent text-center">
            <div class="text-5xl mb-4">📈</div>
            <h3 class="font-serif text-2xl font-bold mb-3 text-eternal-gold">Leveling Guides</h3>
            <p class="text-text-secondary">
              Step-by-step progression from level 1 to endgame with gem and passive tree recommendations.
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="card card-accent text-center">
            <div class="text-5xl mb-4">⚔️</div>
            <h3 class="font-serif text-2xl font-bold mb-3 text-eternal-gold">Gear Strategy</h3>
            <p class="text-secondary">
              Budget-aware gear recommendations with alternatives at every stage of progression.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- How It Works -->
    <section class="py-16 px-8 bg-bg-secondary">
      <div class="container mx-auto max-w-4xl">
        <h2 class="font-serif text-4xl font-bold text-center mb-12 text-eternal-gold">
          How It Works
        </h2>
        
        <div class="space-y-8">
          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-eternal-gold flex items-center justify-center font-bold text-eternal-black">
              1
            </div>
            <div>
              <h4 class="text-xl font-semibold mb-2">Describe Your Build</h4>
              <p class="text-text-secondary">
                Tell us what kind of build you want - class, damage type, playstyle, and any specific requirements.
              </p>
            </div>
          </div>
          
          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-eternal-gold flex items-center justify-center font-bold text-eternal-black">
              2
            </div>
            <div>
              <h4 class="text-xl font-semibold mb-2">AI Generates Build</h4>
              <p class="text-text-secondary">
                Our AI analyzes the game data and creates a complete build with skills, passives, and gear.
              </p>
            </div>
          </div>
          
          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-eternal-gold flex items-center justify-center font-bold text-eternal-black">
              3
            </div>
            <div>
              <h4 class="text-xl font-semibold mb-2">Follow the Guide</h4>
              <p class="text-text-secondary">
                Get detailed leveling instructions, gear progressions, and build explanations to guide you from Act 1 to endgame.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Home page - static content, no logic needed
</script>
