
export const SOUNDS = {
  bidSelect: '/sounds/bid-select.mp3',
  bidChange: '/sounds/bid-change.mp3',
  optionSelect: '/sounds/option-select.mp3',
  notification: '/sounds/notification.mp3',
};

export const playSound = (src: string, volume = 1) => {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch((err) => console.warn("Sound play error:", err));
};
