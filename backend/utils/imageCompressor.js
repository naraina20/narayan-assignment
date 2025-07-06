const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function compressImage(inputPath, filenamePrefix = 'profile', outputDir = 'public/images') {
  const compressedFilename = `${filenamePrefix}-${Date.now()}.jpeg`;
  const outputPath = path.join(__dirname, '..', outputDir, compressedFilename);
  console.log('image compressor ', inputPath,filenamePrefix)

  try {
    await sharp(inputPath)
      .resize({ width: 300 }) 
      .jpeg({ quality: 70 })
      .toFile(outputPath);

    return compressedFilename;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Image processing failed');
  }
}

module.exports = compressImage;
