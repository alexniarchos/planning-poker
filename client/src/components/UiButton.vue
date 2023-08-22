<template>
  <button class="ui-button">
    <div class="ui-button__content">
      <slot></slot>
    </div>
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Button'
  }
});
</script>

<style lang="scss" scoped>
.ui-button {
  position: relative;
  width: 160px;
  height: 53px;
  padding: 12px 25px;
  border: none;
  color: white;
  background-color: green;
  border-radius: 12px;
  font-size: 20px;
  font-weight: normal;
  transition: filter 0.3s ease;
  cursor: pointer;
  box-shadow: 0 10px 30px -17px green;
  transition: box-shadow 0.3s, scale 0.1s;

  &:not(:disabled):hover {
    // box-shadow: 0px 0px 0px 8px rgba(0, 0, 0, 0.1);
    box-shadow: 0 10px 30px -6px green;
  }

  &:enabled:active {
    scale: 0.95;
  }

  &:disabled {
    opacity: 0.6;
  }

  &__content {
    // position: absolute;
    // top: 13px;
    // left: 0;
    // right: 0;
  }
}
</style>
