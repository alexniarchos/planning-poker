<template>
  <div :class="['card-deck__container', { 'card-deck__container--hidden': showVotes }]">
    <button
      v-for="(card, index) in cards"
      :key="index"
      :class="['card-deck__card', { 'card-deck__card--selected': selectedCardIndex === index }]"
      @click="selectCard(index)"
      @keypress="selectCard(index)"
    >
      <card-icon :fill="cardColors[index]" />
      <span class="card-deck__card-number">
        {{ card }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import CardIcon from '@/assets/CardIcon.vue';
import { getColorGradients } from '@/utils/colors';

const props = defineProps({
  socket: {
    type: Object,
    required: true
  },
  cards: {
    type: Array,
    required: true
  },
  selectedCardIndex: {
    type: Number,
    default: null
  },
  showVotes: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select-card']);

const cardColors = computed(() => {
  return getColorGradients({ steps: props.cards.length });
});

function selectCard(index) {
  if (props.selectedCardIndex === index) {
    emit('select-card', null);
    props.socket.emit('vote', { vote: null });
    return;
  }

  emit('select-card', index);
  props.socket.emit('vote', { vote: index });
}
</script>

<style lang="scss">
.card-deck {
  &__container {
    display: flex;
    padding: 40px 16px 0 10px;
    transition: transform 0.3s ease;
    overflow-x: auto;

    &--hidden {
      transform: translateY(105%);
    }
  }

  &__card {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease;
    color: #1c2b1e;
    background-color: transparent;
    border: none;
    padding: 0;

    &:not(.card-deck__card--selected):hover {
      transform: translateY(-8px) scale(1.1);
    }

    & + & {
      margin-left: 16px;
    }

    &-number {
      position: absolute;
      font-size: 32px;
      font-weight: 900;
    }

    &--selected {
      transform: translateY(-16px) scale(1.2);
      &:active {
        transform: translateY(-16px) scale(1.15);
      }
    }

    &:not(.card-deck__card--selected):active {
      transform: translateY(-8px) scale(1.05);
    }
  }
}
</style>
