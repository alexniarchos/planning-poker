<template>
  <div v-if="isVisible" class="welcome-popup">
    <div class="blur"></div>
    <div class="welcome-popup__form">
      <div class="welcome-popup__title">Welcome to Planning Poker!</div>
      <input
        v-model="currentName"
        class="welcome-popup__input"
        placeholder="Type your full name"
        maxlength="20"
        @keyup.enter="onSubmit()"
      />
      <input
        v-model="currentRoomId"
        class="welcome-popup__input"
        placeholder="Type a room ID to join"
        maxlength="7"
        @keyup.enter="onSubmit()"
      />
      <button @click="onSubmit()">Go!</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { generateId, generateName } from '@/utils/random';

const currentRoomId = ref('');
const currentName = ref('');
const isVisible = ref(true);

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const name = localStorage.getItem('name');
if (name) {
  currentName.value = name;
  userStore.setName(name);
}

currentRoomId.value = route.params.roomId || localStorage.getItem('roomId') || '';

if (route.params.roomId && name) {
  userStore.socket.emit('joinRoom', {
    user: {
      name: currentName.value,
      roomId: currentRoomId.value
    }
  });
  isVisible.value = false;
}

function onSubmit() {
  if (!currentName.value) {
    currentName.value = generateName();
  }
  if (!currentRoomId.value) {
    currentRoomId.value = generateId();
  }

  currentName.value = currentName.value.trim();
  currentRoomId.value = currentRoomId.value.trim();

  userStore.setName(currentName.value);
  localStorage.setItem('name', currentName.value);

  userStore.setRoomId(currentRoomId.value);
  localStorage.setItem('roomId', currentRoomId.value);

  userStore.socket.emit('joinRoom', {
    user: {
      roomId: currentRoomId.value,
      name: currentName.value
    }
  });

  if (route.params.roomId !== currentRoomId.value) {
    router.push(`/${currentRoomId.value}`);
  }
  isVisible.value = false;
}
</script>
<style lang="scss">
.blur {
  display: block;
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  backdrop-filter: blur(15px);
  background-color: rgba(0, 0, 0, 0.5);
}

.welcome-popup {
  position: fixed;
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 200;

  &__form {
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  &__title {
    font-size: 40px;
    margin: 24px 0 48px 0;
    color: white;
    text-align: center;
  }

  &__input {
    width: 400px;
    padding: 16px;
    margin: 0 auto;
    box-sizing: border-box;
    border-radius: 48px;
    border: none;
    outline: none;
    font-size: 24px;
    color: white;
    background-color: black;
    opacity: 0.6;
    transition: opacity 0.3s ease;

    & + & {
      margin-top: 16px;
    }

    &:focus {
      opacity: 1;
    }
  }

  button {
    z-index: 1;
    width: 400px;
    margin: 16px auto 0 auto;
    padding: 12px;
    font-size: 24px;
    color: white;
    background-color: rgba(black, 0.6);
    border: 4px solid rgba(black, 0);
    border-radius: 48px;
    cursor: pointer;
    outline: none;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(black, 1);
    }

    &:focus {
      border-color: rgb(46, 46, 46);
    }
  }
}
</style>
