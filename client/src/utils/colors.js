const colors = {
  blue: '#28db9b',
  purple: '#E0B9EF',
  red: '#f7bd2d'
};

function getRandomColor() {
  return Object.values(colors)[Math.floor(Math.random() * Object.entries(colors).length)];
}

function getColorGradients({ startColor = colors.blue, endColor = colors.red, steps } = {}) {
  // Parse hex color values to RGB
  function hexToRGB(hex) {
    const hexWithoutHash = hex.replace(/^#/, ''); // Remove '#' if present
    const bigint = parseInt(hexWithoutHash, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  // Convert RGB to hex
  function RGBToHex(rgb) {
    return (
      '#' +
      rgb
        .map((component) => {
          const hex = component.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  const startRGB = hexToRGB(startColor);
  const endRGB = hexToRGB(endColor);

  const colorList = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const color = startRGB.map((component, index) => {
      return Math.round(component + ratio * (endRGB[index] - component));
    });
    colorList.push(RGBToHex(color));
  }

  return colorList;
}

export { colors, getRandomColor, getColorGradients };
