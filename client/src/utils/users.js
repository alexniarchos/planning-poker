function getUserById(users, id) {
  return users.find((user) => user.id === id);
}

function getUserIndexById(users, id) {
  return users.findIndex((user) => user.id === id);
}

function getUserInitials(name) {
  if (!name) {
    return '';
  }
  const nameSplit = name.toUpperCase().split(' ');
  const firstInitial = (nameSplit[0] && nameSplit[0].charAt(0)) || '';
  const secondInitial = (nameSplit[1] && nameSplit[1].charAt(0)) || '';
  return `${firstInitial}${secondInitial}`;
}

export { getUserById, getUserIndexById, getUserInitials };
