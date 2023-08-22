const DECKS = {
  fib: {
    key: 'fib',
    label: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  },
  modFib: {
    key: 'modFib',
    label: 'Modified Fibonacci',
    cards: ['0',
      '½',
      '1',
      '2',
      '3',
      '5',
      '8',
      '13',
      '20',
      '40',
      '100',
      '?',
      '☕'],
  },
  tshirts: {
    key: 'tshirts',
    label: 'T-shirt sizes',
    cards: ['xs', 's', 'm', 'l', 'xl', 'xxl', '?', '☕'],
  },
};

const MAX_SEATS = 10;

export { DECKS, MAX_SEATS };
