import { ChevronDownIcon } from '@heroicons/vue/24/solid';
import { getUserInitials } from '@/utils/users';

const components = {
  ChevronDownIcon,
};

const props = {
  user: null,
};

export default {
  components,
  props,
  methods: {
    getUserInitials,
  },
};
