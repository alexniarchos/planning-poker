<template>
  <VueFinalModal
    class="game-settings-modal"
    content-class="game-settings-modal__content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    @closed="onClose"
  >
    <div class="game-settings-modal__header">
      <span>Settings</span>
      <button class="game-settings-modal__close" @click="onClose">
        <x-mark-icon></x-mark-icon>
      </button>
    </div>
    <div class="game-settings-modal__body">
      <div class="game-settings-modal__decks-container">
        <button
          v-for="deck in modifiedDecks"
          :key="deck.key"
          :class="[
            'game-settings-modal__deck-container',
            { 'game-settings-modal__deck-container--selected': selectedDeck === deck.key }
          ]"
          :disabled="editingDeck && editingDeck !== deck.key"
          @click="onDeckClick(deck.key)"
        >
          <div v-if="deck.key === editingDeck" class="game-settings-modal__deck-name">
            <input :ref="setDeckLabelInputRef" v-model="editableDeckName" type="text" />
            <button class="game-settings-modal__save-cancel-button" @click="onEditSave">
              <check-icon />
            </button>
            <button class="game-settings-modal__save-cancel-button" @click="onEditCancel">
              <x-icon />
            </button>
          </div>
          <div v-else class="game-settings-modal__deck-name">
            {{ deck.label }}
            <button class="game-settings-modal__edit-button" @click="onEditClick(deck.key)">
              <edit-icon />
            </button>
          </div>
          <div v-if="editingDeck !== deck.key" class="game-settings-modal__card-deck">
            <div v-for="(item, i) in deck.cards" :key="item" class="game-settings-modal__card">
              <card-icon :fill="cardColors[deck.key][i]" class="game-settings-modal__card-icon" />
              <span class="game-settings-modal__card-number">
                {{ item }}
              </span>
            </div>
          </div>
          <SlickList
            v-else
            v-model:list="editableCards"
            axis="x"
            class="game-settings-modal__card-deck"
          >
            <SlickItem
              v-for="(item, i) in editableCards"
              :key="item"
              class="game-settings-modal__card"
              :index="i"
            >
              <card-icon :fill="editableCardsColors[i]" class="game-settings-modal__card-icon" />
              <span class="game-settings-modal__card-number">
                {{ item }}
              </span>
              <button
                v-if="editingDeck === deck.key"
                class="game-settings-modal__card-delete"
                @mousedown="onCardDelete(i)"
              >
                <x-circle-icon />
              </button>
            </SlickItem>
            <div
              v-if="editingDeck === deck.key"
              class="game-settings-modal__card"
              :index="editableCards.length"
              @click="onAddNewCardClick"
            >
              <card-icon
                :fill="editableCardsColors[editableCards.length - 1]"
                class="game-settings-modal__card-icon"
              />
              <plus-icon v-if="showAddNewCard" class="game-settings-modal__add-card" />
              <input
                v-else
                ref="newCardInputRef"
                v-model="newCardValue"
                type="text"
                class="game-settings-modal__new-card-input"
                maxlength="3"
                @blur="addNewCard"
                @keydown.enter="addNewCard"
              />
              <!-- <span class="game-settings-modal__card-number"> 0 </span> -->
            </div>
          </SlickList>
        </button>
      </div>
    </div>
    <div class="game-settings-modal__footer">
      <ui-button :disabled="editingDeck" @click="onSubmit">Save</ui-button>
    </div>
  </VueFinalModal>
</template>

<script setup>
import { cloneDeep } from 'lodash';
import { ref, computed, watch, nextTick } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { SlickList, SlickItem } from 'vue-slicksort';
import { getColorGradients } from '@/utils/colors';
import UiButton from './UiButton.vue';
import EditIcon from '@/assets/EditIcon.vue';
import CheckIcon from '@/assets/CheckIcon.vue';
import XIcon from '@/assets/XIcon.vue';
import { XCircleIcon, PlusIcon } from '@heroicons/vue/24/solid';
import CardIcon from '@/assets/CardIcon.vue';

const props = defineProps({
  decks: {
    type: Object,
    required: true
  },
  activeDeck: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'submit']);

function resetForm() {
  selectedDeck.value = props.activeDeck;
  modifiedDecks.value = cloneDeep(props.decks);
  editingDeck.value = null;
}

function onClose() {
  emit('close');
  resetForm();
}

function onSubmit() {
  emit('submit', { decks: modifiedDecks.value, activeDeck: selectedDeck.value });
  resetForm();
}

const selectedDeck = ref();

function onDeckClick(deckKey) {
  selectedDeck.value = deckKey;
}

watch(
  () => props.activeDeck,
  (newVal) => {
    selectedDeck.value = newVal;
  },
  { immediate: true }
);

const modifiedDecks = ref();

watch(
  () => props.decks,
  (newVal) => {
    modifiedDecks.value = cloneDeep(newVal);
  },
  { immediate: true }
);

const editableCardsColors = computed(() => {
  return getColorGradients({ steps: editableCards.value.length });
});

const cardColors = computed(() => {
  return Object.values(modifiedDecks.value).reduce((acc, { key, cards }) => {
    return {
      ...acc,
      [key]: getColorGradients({ steps: cards.length })
    };
  }, {});
});

const editingDeck = ref();
const editableDeckName = ref();
const deckLabelInput = ref();

function setDeckLabelInputRef(el) {
  deckLabelInput.value = el;
}

const editableCards = ref();

function onEditClick(deckKey) {
  editingDeck.value = deckKey;
  editableDeckName.value = modifiedDecks.value[deckKey].label;
  editableCards.value = [...modifiedDecks.value[deckKey].cards];
  nextTick(() => {
    deckLabelInput.value.focus();
  });
}

function onEditSave() {
  modifiedDecks.value[editingDeck.value].label = editableDeckName.value;
  modifiedDecks.value[editingDeck.value].cards = [...editableCards.value];
  editingDeck.value = null;
}

function onEditCancel() {
  editingDeck.value = null;
}

function onCardDelete(cardIndex) {
  editableCards.value.splice(cardIndex, 1);
}

const newCardValue = ref();

function addNewCard() {
  if (newCardValue.value && !editableCards.value.includes(newCardValue.value)) {
    editableCards.value.push(newCardValue.value);
    newCardValue.value = '';
  }
  showAddNewCard.value = true;
}

const showAddNewCard = ref(true);
const newCardInputRef = ref();

function onAddNewCardClick() {
  showAddNewCard.value = false;
  nextTick(() => {
    newCardInputRef.value[0].focus();
  });
}
</script>

<style lang="scss">
.game-settings-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;

  &__content {
    width: 900px;
    max-width: 90%;
    padding: 16px 32px;
    box-sizing: border-box;
    border-radius: 16px;

    /* From https://css.glass */
    background: rgba(28, 43, 30, 0.68);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(7.2px);
    -webkit-backdrop-filter: blur(7.2px);
    border: 1px solid rgba(28, 43, 30, 0.99);
  }

  &__header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 32px;
    font-weight: bolder;
  }

  &__body {
  }

  &__decks-container {
    display: flex;
    flex-direction: column;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px;
    margin-top: 24px;
  }

  &__close {
    display: flex;
    padding: 8px;
    margin-top: 4px;
    margin-left: 16px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.3s;
    color: white;

    &:hover,
    &:focus {
      background-color: #424242ad;
    }

    &:active {
      scale: 0.95;
      background-color: #2a2a2aad;
    }

    svg {
      width: 40px;
      height: 40px;
    }
  }

  &__deck-container {
    & + & {
      margin-top: 16px;
    }

    display: flex;
    flex-direction: column;
    padding: 16px;
    transition: background-color 0.3s, opacity 0.3s;
    cursor: pointer;
    border-radius: 16px;
    color: white;
    transition: scale 0.1s, opacity 0.3s;

    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:not(.game-settings-modal__deck-container--selected):hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &:hover {
      .game-settings-modal__edit-button {
        visibility: visible;
        opacity: 1;
      }
    }

    &--selected {
      background: rgba(255, 255, 255, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      pointer-events: none;
      user-select: none;
    }

    &:active {
      // scale: 0.99;
    }
  }

  &__deck-name {
    height: 40px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    margin-left: 12px;
    font-size: 20px;
    font-weight: 600;

    input {
      width: 200px;
      padding: 8px;
      margin-right: 8px;
      background-color: #0000004f;
      border: none;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }
  }

  &__edit-button {
    padding: 8px;
    border-radius: 8px;
    margin-left: 8px;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0.3s, opacity 0.3s;
    &:hover {
      background-color: #424242ad;
    }

    svg {
      width: 16px;
      height: 16px;
      color: white;
    }
  }

  &__save-cancel-button {
    display: flex;
    padding: 8px;
    border-radius: 8px;

    &:hover {
      background-color: #424242ad;
    }

    svg {
      width: 16px;
      height: 16px;
      color: white;
    }
  }

  &__card-deck {
    display: flex;
    max-width: 100%;
    padding-top: 4px;
    padding-right: 8px;
    overflow: auto;

    &:disabled {
      pointer-events: none;
    }
  }

  &__card {
    z-index: 1001;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #1c2b1e;
    margin: 0 4px;

    &-icon {
      width: 48px;
      height: 66px;
    }

    &-number {
      position: absolute;
      font-size: 24px;
      font-weight: 900;
    }

    &-delete {
      position: absolute;
      color: rgb(213, 1, 1);
      top: -5px;
      right: -7px;

      &:hover {
        color: rgb(255, 1, 1);
      }

      svg {
        width: 28px;
        height: 28px;
      }
    }
  }

  &__new-card-input {
    position: absolute;
    width: 44px;
    padding: 0;
    border: none;
    background-color: transparent;
    font-size: 24px;
    font-weight: 900;
    text-align: center;
  }

  &__add-card {
    position: absolute;
    width: 24px;
    height: 24px;
  }
}
</style>
