const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = [192, 512, 180, 152, 167];
  const sourceIcon = path.join(__dirname, 'public', 'icon.png');
  
  try {
    // Check if source icon exists
    await fs.access(sourceIcon);
    
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, 'public', `pwa-${size}x${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }
    
    // Generate apple-touch-icon.png
    await sharp(sourceIcon)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();