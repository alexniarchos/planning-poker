<script setup>
import { defineAsyncComponent, shallowRef, watch } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  fill: {
    type: String,
    default: ''
  }
});

const icon = shallowRef(null);

watch(
  () => props.name,
  (name) => {
    icon.value = defineAsyncComponent(() => import(`../assets/${name}.svg`));
  },
  { immediate: true }
);
</script>

<template>
  <component :is="icon" :fill="fill" />
</template>
