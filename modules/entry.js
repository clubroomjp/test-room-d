export const start = (room) => {
  room.text("init で作った部屋です。貢献は " + (room.modules().length - 1) + " 個。");
};
