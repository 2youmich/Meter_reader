<script setup>
import { readImageText } from '@/lib/tesseract-testing'
import imgSrc from '@/assets/images/1722397552068.jpg'

import { ref, watch } from 'vue'

const textRef = ref('')

const imgSrcRef = ref(imgSrc)

watch(imgSrcRef, async newVal => {
  textRef.value = 'Loading...'
  textRef.value = await readImageText(newVal)
})

readImageText().then(res => {
  textRef.value = res
})

async function replaceImage(imageData) {
  const file = imageData.target.files[0]

  if (file) {
    const reader = new FileReader()

    reader.onload = e => {
      imgSrcRef.value = e.target.result
    }

    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <header>
    <div class="wrapper">
      <pre
        >{{ textRef }}
      </pre>

      <img width="100px" :src="imgSrcRef" alt="" />

      <input
        type="file"
        name="image"
        id="image"
        accept="image/*"
        @change="replaceImage"
      />
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

/* sff */

nav a:first-of-type {
  border: 0;
}

/*
 */

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  /* test comment */

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;

    gap: 1.5rem;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
