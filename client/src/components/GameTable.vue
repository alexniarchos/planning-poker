<template>
  <div class="table">
    <table-icon class="table__image" />
    <button v-if="showRevealButton" class="table__button" type="button" @click="onRevealClick()">
      <img class="table__button-image" src="../assets/button.svg" alt="" />
      <span class="table__button-text">{{ revealText }}</span>
    </button>
    <div v-for="seatSide in seatSideOrder" :key="seatSide" :class="[`table__seats--${seatSide}`]">
      <div
        v-for="seat in seats[seatSide]"
        :key="seat.id"
        :class="[
          'table__seat',
          { 'table__seat--main': isMainUser(seat.userId) },
          { 'table__seat--taken': isSeatTaken(seat.userId) }
        ]"
      >
        <div v-if="seatSide === 'top'" class="table__username">{{ users[seat.userId]?.name }}</div>
        <button
          class="table__card"
          :disabled="seat.userId"
          @click="onSeatClick(seat.id, seat.userId)"
        >
          <icon :name="getCardIcon(seat.userId)" :fill="getCardColor(seat.userId)" />
          <span class="table__card-vote">{{ deck.cards[users[seat.userId]?.vote] }}</span>
        </button>
        <div v-if="seatSide !== 'top'" class="table__username">{{ users[seat.userId]?.name }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { getColorGradients } from '@/utils/colors';
import Icon from '@/components/Icon.vue';
import TableIcon from '@/assets/TableIcon.vue';

const props = defineProps({
  socket: {
    type: Object,
    required: true
  },
  mainUserId: {
    type: String,
    default: ''
  },
  users: {
    type: Object,
    required: true
  },
  showVotes: {
    type: Boolean,
    default: false
  },
  deck: {
    type: Object,
    required: true
  }
});

const seatsPerSide = ref({ top: 4, right: 1, bottom: 4, left: 1 });
const seatSideOrder = ref(['top', 'right', 'bottom', 'left']);

const cardColors = computed(() => {
  return getColorGradients({ steps: props.deck.cards.length });
});

const showRevealButton = computed(() => {
  return Object.values(props.users).some((user) => user.hasVoted);
});

const revealText = computed(() => {
  return props.showVotes ? 'Clear votes' : 'Show cards';
});

const maxSeats = computed(() => {
  return Object.values(seatsPerSide.value).reduce((acc, cur) => {
    return acc + cur;
  });
});

const seats = computed(() => {
  if (!props.users) {
    return { top: [], right: [], bottom: [], left: [] };
  }

  const newSeats = [...Array(maxSeats.value).keys()].map((id) => ({
    id,
    userId: null
  }));

  Object.values(props.users).forEach((user) => {
    newSeats[user.seat].userId = user.id;
  });

  const res = {};

  res.top = newSeats.slice(0, seatsPerSide.value.top);

  res.right = newSeats.slice(
    seatsPerSide.value.top,
    seatsPerSide.value.top + seatsPerSide.value.right
  );

  res.bottom = newSeats.slice(
    seatsPerSide.value.top + seatsPerSide.value.right,
    seatsPerSide.value.top + seatsPerSide.value.right + seatsPerSide.value.bottom
  );

  res.left = newSeats.slice(
    seatsPerSide.value.top + seatsPerSide.value.right + seatsPerSide.value.bottom,
    seatsPerSide.value.top +
      seatsPerSide.value.right +
      seatsPerSide.value.bottom +
      +seatsPerSide.value.left
  );
  return res;
});

function onRevealClick() {
  if (!props.showVotes) {
    props.socket.emit('showVotes');
    return;
  }
  props.socket.emit('clearVotes');
}

function onSeatClick(seatId, userId) {
  if (userId) {
    return;
  }

  props.socket.emit('seatChanged', seatId);
}

function isMainUser(userId) {
  return props.mainUserId === userId;
}

function isSeatTaken(userId) {
  return !!userId;
}

function hasUserVoted(userId) {
  return props.users[userId]?.hasVoted;
}

function getCardIcon(userId) {
  let icon;

  if (hasUserVoted(userId)) {
    icon = 'card';
  } else if (isSeatTaken(userId)) {
    icon = 'seat-solid';
  } else {
    icon = 'seat';
  }

  return icon;
}

function getCardColor(userId) {
  let color;

  if (hasUserVoted(userId) && props.showVotes) {
    color = cardColors.value[props.users[userId].vote];
  } else if (hasUserVoted(userId)) {
    color = '#b3e5c4';
  } else {
    color = 'transparent';
  }

  return color;
}
</script>
<style lang="scss">
.table {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: auto;
  scale: 0.4;

  @media screen and (min-width: 768px) {
    scale: 1;
  }

  &__image {
    width: 515px;
    height: 294px;
  }

  &__button {
    position: absolute;
    width: 161px;
    height: 53px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    border: none;
    color: white;
    background-color: transparent;
    font-size: 20px;
    font-weight: bold;
    transition: filter 0.3s ease, scale 0.1s;
    cursor: pointer;

    &:hover {
      filter: brightness(107%);
    }

    &:active {
      filter: brightness(100%);
      scale: 0.95;
    }

    &-image {
    }
  }

  &__button-text {
    position: absolute;
  }

  &__seats {
    &--top {
      position: absolute;
      bottom: 320px;
      display: flex;
      align-items: flex-end;

      .table__username {
        margin-top: 0;
        margin-bottom: 12px;
      }
    }

    &--bottom {
      position: absolute;
      display: flex;
      top: 320px;
    }

    &--right {
      position: absolute;
      display: flex;
      flex-direction: column;
      top: 105px;
      right: -107px;

      .table__seat + .table__seat {
        margin-left: 0;
        margin-top: 24px;
      }
    }

    &--left {
      position: absolute;
      display: flex;
      flex-direction: column;
      top: 105px;
      left: -107px;

      .table__seat + .table__seat {
        margin-left: 0;
        margin-top: 24px;
      }
    }
  }

  &__seat {
    opacity: 0.3;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }

    &--main {
      .table__username {
        font-size: 16px;
        font-weight: 800;
      }
    }

    &--taken {
      opacity: 1;
      .table__card {
        cursor: default;
      }
    }

    &--voted {
    }

    & + & {
      margin-left: 24px;
    }
  }

  &__username {
    max-width: 75px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 8px;
    text-align: center;
    color: white;
  }

  &__card {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 75px;
    height: 98px;
    cursor: pointer;
    transition: scale 0.1s;

    &-vote {
      position: absolute;
      font-size: 32px;
      font-weight: 900;
      color: #1c2b1e;
    }

    &:enabled:active {
      scale: 0.95;
    }
  }
}
</style>
