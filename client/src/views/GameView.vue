<template>
  <div class="container">
    <a href="/" class="brand">
      <logo-icon class="brand__logo" />
      <span class="brand__name">Planning Poker</span>
    </a>
    <div class="room">
      <div class="room__id">#{{ roomId }}</div>
      <cogwheel-icon class="room__settings" @click="showGameSettings = true" />
    </div>
    <game-table
      v-if="users"
      ref="tableRef"
      :socket="socket"
      :main-user-id="socket?.id"
      :users="users"
      :show-votes="showVotes"
      :deck="decks[activeDeck]"
    />
    <div class="card-deck">
      <card-deck
        v-if="activeDeck"
        :socket="socket"
        :cards="decks[activeDeck].cards"
        :selected-card-index="selectedCardIndex"
        :show-votes="showVotes"
        @select-card="onSelectCard"
      />
    </div>
    <welcome-popup />
    <game-settings-modal
      v-if="decks"
      v-model="showGameSettings"
      :decks="decks"
      :active-deck="activeDeck"
      @close="showGameSettings = false"
      @submit="onSubmitGameSettings"
    />
  </div>
</template>
<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import io from 'socket.io-client';
import WelcomePopup from '@/components/WelcomePopup.vue';
import CardDeck from '@/components/CardDeck.vue';
import GameTable from '@/components/GameTable.vue';
import GameSettingsModal from '@/components/GameSettingsModal.vue';
import { useUserStore } from '@/stores/user';
import LogoIcon from '@/assets/LogoIcon.vue';
import CogwheelIcon from '@/assets/CogwheelIcon.vue';

const userStore = useUserStore();

const socket = io(`${import.meta.env.VITE_SERVER_URL}:${import.meta.env.VITE_SOCKET_PORT}`, {
  secure: true
});
const users = ref();
const showVotes = ref(false);
const showGameSettings = ref(false);
const decks = ref();
const activeDeck = ref();
const selectedCardIndex = ref(null);

function onSelectCard(index) {
  selectedCardIndex.value = index;
}

userStore.setSocket(socket);
setSocketListeners();

const route = useRoute();
const roomId = computed(() => route.params.roomId || '');

userStore.setRoomId(roomId.value || '');
userStore.setName(localStorage.getItem('name') || '');

function setUserById(id, user) {
  users.value[id] = {
    ...users.value[id],
    ...user
  };
}

function setSocketListeners() {
  socket.on('connect_error', () => {
    console.log('connect_error');
  });

  socket.on('connect_timeout', () => {
    console.log('connect_timeout');
  });

  socket.on('connect', () => {
    console.log('connect');
  });

  socket.on('userConnect', (user) => {
    users.value[user.id] = user;
  });

  socket.on('userDisconnect', (userId) => {
    delete users.value[userId];
  });

  socket.on('initState', (state) => {
    users.value = state.users;
    decks.value = state.decks;
    activeDeck.value = state.activeDeck;
  });

  socket.on('userChangedSeat', ({ userId, seat }) => {
    users.value[userId].seat = seat;
  });

  socket.on('showVotes', (userVotes) => {
    userVotes.forEach((userVote) => {
      users.value[userVote.userId].vote = userVote.vote;
    });
    showVotes.value = true;
  });

  socket.on('clearVotes', () => {
    Object.values(users.value).forEach((user) => {
      setUserById(user.id, {
        vote: null,
        hasVoted: false
      });
    });
    onSelectCard(null);
    showVotes.value = false;
  });

  socket.on('userVoted', ({ userId, hasVoted }) => {
    users.value[userId].hasVoted = hasVoted;
  });

  socket.on('gameSettingsUpdated', ({ decks: newDecks, activeDeck: newActiveDeck }) => {
    decks.value = newDecks;
    activeDeck.value = newActiveDeck;
  });
}

function onSubmitGameSettings({ decks, activeDeck }) {
  socket.emit('gameSettingsUpdated', { decks, activeDeck });
  showGameSettings.value = false;
}

onUnmounted(() => {
  socket.disconnect();
});
</script>

<style lang="scss">
body {
  background: #1c2b1e;
  overflow: hidden;
  margin: 0;
}
.brand {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  font-size: 24px;
  color: white;
  text-decoration: none;
  z-index: 1;

  &__logo {
    width: 50px;
    height: 60px;
  }

  &__name {
    margin-top: 6px;
    margin-left: 8px;
    font-weight: 800;
    color: white;
  }
}

.room {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  top: 100px;
  left: 24px;
  right: 0;
  font-size: 24px;
  color: white;

  @media (min-width: 768px) {
    top: 18px;
    left: 0;
    justify-content: center;
  }

  &__label {
    margin-right: 8px;
  }

  &__id {
    font-size: 40px;
    font-weight: 900;
    letter-spacing: 6px;
  }

  &__settings {
    width: 24px;
    margin-left: 16px;
    cursor: pointer;

    svg {
      color: 'white';
    }
  }
}

.container {
  display: flex;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}

.header {
  display: flex;
}

.card-deck {
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  bottom: 16px;
}
</style>
