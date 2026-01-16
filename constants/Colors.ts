const tintColorLight = '#E8B4B8';
const tintColorDark = '#E8B4B8';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000000', // True black for OLED
    surface: '#1a1a1a', // Elevated surfaces
    cardSolid: '#1C1C1E', // iOS system gray 6
    border: '#38383A', // iOS separator color
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
