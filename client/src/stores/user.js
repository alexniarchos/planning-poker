import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      socket: null,
      name: '',
      roomId: ''
    };
  },
  actions: {
    setSocket(socket) {
      this.socket = socket;
    },
    setName(name) {
      this.name = name;
    },
    setRoomId(roomId) {
      this.roomId = roomId;
    }
  }
});
