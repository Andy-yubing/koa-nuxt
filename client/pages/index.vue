<template>
  <section class="container">
    <div>
      <!-- <app-logo/> -->
      <!-- <h1 class="title">
        study-nuxt
      </h1>
      <h2 class="subtitle">
        Nuxt.js project
      </h2>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          class="button--green">Documentation</a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey">GitHub</a>
      </div> -->
        <li><nuxt-link :to="{name:'index'}">HOME</nuxt-link></li>
        <li><nuxt-link :to="{name:'about'}">about</nuxt-link></li>
        <li><nuxt-link :to="{name:'news'}">news</nuxt-link></li>
        <li><nuxt-link :to="{name:'news-message', params:{id:3306}}">message</nuxt-link></li>
        
    </div>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'

export default {
  components: {
    AppLogo
  }
}
</script>

<style>

</style>
