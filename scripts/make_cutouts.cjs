const sharp = require('sharp');
const path = require('path');

async function processImage(inputPath, outputPath, options = {}) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Sample corner background color
  const sampleIndices = [
    (0 * width + 0) * 4,
    (0 * width + (width - 1)) * 4,
    (2 * width + 2) * 4,
    (2 * width + (width - 3)) * 4
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const idx of sampleIndices) {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR /= sampleIndices.length;
  bgG /= sampleIndices.length;
  bgB /= sampleIndices.length;

  const outputData = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed boundary
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x);
    queue.push((height - 1) * width + x);
    visited[0 * width + x] = 1;
    visited[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width + 0);
    queue.push(y * width + (width - 1));
    visited[y * width + 0] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  let head = 0;
  const threshold = options.threshold || 28;
  const feather = options.feather || 12;

  while (head < queue.length) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    const idx = p * 4;

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

    if (dist <= threshold + feather) {
      if (dist <= threshold) {
        outputData[idx + 3] = 0;
      } else {
        const factor = (dist - threshold) / feather;
        outputData[idx + 3] = Math.round(255 * factor);
      }

      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const np = ny * width + nx;
          if (!visited[np]) {
            visited[np] = 1;
            const nidx = np * 4;
            const nr = data[nidx];
            const ng = data[nidx + 1];
            const nb = data[nidx + 2];
            const ndist = Math.sqrt((nr - bgR) ** 2 + (ng - bgG) ** 2 + (nb - bgB) ** 2);
            if (ndist <= threshold + feather + 10) {
              queue.push(np);
            }
          }
        }
      }
    }
  }

  // If cleanDecorations is true (for Ruby: remove floating stars/clouds outside her core silhouette)
  if (options.cleanDecorations) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Floating cloud on top right (x > 720, y < 450)
        if (x > 720 && y < 450) {
          outputData[idx + 3] = 0;
        }
        // Floating cloud on left (x < 300, y > 400 && y < 580)
        if (x < 305 && y > 420 && y < 580) {
          outputData[idx + 3] = 0;
        }
        // Floating stars on far left (x < 240, y < 420)
        if (x < 215 && y < 420) {
          outputData[idx + 3] = 0;
        }
        // Small hearts around bottom
        if (x < 350 && y > 540 && y < 700) {
          outputData[idx + 3] = 0;
        }
        if (x > 740 && y > 430 && y < 650) {
          outputData[idx + 3] = 0;
        }
        // Shadow underneath Ruby's shoes at the very bottom
        if (y > 935) {
          outputData[idx + 3] = 0;
        }
      }
    }
  }

  // For girl: clean grass at bottom if needed or keep neat feet
  if (options.cleanBottomShadow) {
    for (let y = Math.floor(height * 0.94); y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const distFromBottom = (height - 1 - y) / (height * 0.06);
        outputData[idx + 3] = Math.round(outputData[idx + 3] * (1 - distFromBottom));
      }
    }
  }

  // For boy: clean shadow under shoes
  if (options.cleanBoyShadow) {
    for (let y = 945; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        outputData[idx + 3] = 0;
      }
    }
  }

  await sharp(outputData, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent cutout to ${outputPath}`);
}

async function main() {
  const imagesDir = path.join(__dirname, '../src/assets/images');
  
  await processImage(
    path.join(imagesDir, 'school_ruby_classmate_1793266348488.jpg'),
    path.join(imagesDir, 'ruby_standing_cutout.png'),
    { threshold: 30, feather: 15, cleanDecorations: true }
  );

  await processImage(
    path.join(imagesDir, 'storybook_base_boy_1793279720750.jpg'),
    path.join(imagesDir, 'boy_standing_cutout.png'),
    { threshold: 32, feather: 15, cleanBoyShadow: true }
  );

  await processImage(
    path.join(imagesDir, 'storybook_base_girl_1793279720298.jpg'),
    path.join(imagesDir, 'girl_standing_cutout.png'),
    { threshold: 30, feather: 15, cleanBottomShadow: true }
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
