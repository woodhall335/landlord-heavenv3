const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const sourceRoot =
  'C:/Users/t_moh/.codex/generated_images/01a07c5b-714b-7383-b0a2-91a2c2fe5b1c';
const outputRoot = path.join(
  process.cwd(),
  'public/images/illustrations/tenancy-standard',
);

const jobs = [
  {
    source: 'exec-d9197e54-f9ba-455c-b3ea-23b1f1952067.png',
    output: 'proportionate-standard-agreement-v1.webp',
    extractBackdrop: true,
    width: 1200,
    height: 500,
  },
  {
    source: 'exec-bd307241-d4a5-49cc-8331-7bff10677772.png',
    output: 'guided-standard-setup-v1.webp',
    extractBackdrop: true,
    width: 1200,
    height: 500,
  },
  {
    source: 'exec-09e1b11a-1d88-44bf-8134-8bc9505647ab.png',
    output: 'standard-agreement-selector-v1.webp',
    extractBackdrop: true,
    width: 1200,
    height: 500,
  },
  {
    source: 'exec-5dd95114-5321-492d-9803-66d5e0b4107f.png',
    output: 'standard-how-it-works-v1.webp',
    extractBackdrop: false,
    width: 1200,
    height: 900,
  },
];

function extractNeutralBackdrop(data, width, height, channels) {
  const pixelCount = width * height;
  const eligible = new Uint8Array(pixelCount);
  const background = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const luminance = (red + green + blue) / 3;

    eligible[index] = maximum - minimum <= 28 && luminance >= 35 ? 1 : 0;
  }

  const enqueue = (index) => {
    if (!eligible[index] || background[index]) return;
    background[index] = 1;
    queue[tail] = index;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % width;
    const y = Math.floor(index / width);

    for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
      for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
        if (deltaX === 0 && deltaY === 0) continue;
        const nextX = x + deltaX;
        const nextY = y + deltaY;
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
        enqueue(nextY * width + nextX);
      }
    }
  }

  // Connector lines can enclose pockets of the generated checkerboard. Remove only
  // sizeable, mid-tone neutral components; retain the brighter paper interiors.
  const visited = new Uint8Array(pixelCount);
  for (let start = 0; start < pixelCount; start += 1) {
    if (!eligible[start] || background[start] || visited[start]) continue;

    head = 0;
    tail = 0;
    queue[tail] = start;
    tail += 1;
    visited[start] = 1;
    let luminanceTotal = 0;

    while (head < tail) {
      const index = queue[head];
      head += 1;
      const offset = index * channels;
      luminanceTotal += (data[offset] + data[offset + 1] + data[offset + 2]) / 3;
      const x = index % width;
      const y = Math.floor(index / width);

      for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
        for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
          if (deltaX === 0 && deltaY === 0) continue;
          const nextX = x + deltaX;
          const nextY = y + deltaY;
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
          const next = nextY * width + nextX;
          if (!eligible[next] || background[next] || visited[next]) continue;
          visited[next] = 1;
          queue[tail] = next;
          tail += 1;
        }
      }
    }

    if (tail >= 100 && luminanceTotal / tail < 215) {
      for (let index = 0; index < tail; index += 1) background[queue[index]] = 1;
    }
  }

  const rgba = Buffer.alloc(pixelCount * 4);
  for (let index = 0; index < pixelCount; index += 1) {
    const sourceOffset = index * channels;
    const targetOffset = index * 4;
    const isBackground = background[index] === 1;

    rgba[targetOffset] = isBackground ? 113 : data[sourceOffset];
    rgba[targetOffset + 1] = isBackground ? 65 : data[sourceOffset + 1];
    rgba[targetOffset + 2] = isBackground ? 216 : data[sourceOffset + 2];
    rgba[targetOffset + 3] = isBackground ? 0 : 255;
  }

  return rgba;
}

async function prepare(job) {
  const sourcePath = path.join(sourceRoot, job.source);
  const outputPath = path.join(outputRoot, job.output);
  let pipeline;

  if (job.extractBackdrop) {
    const { data, info } = await sharp(sourcePath).raw().toBuffer({ resolveWithObject: true });
    const rgba = extractNeutralBackdrop(data, info.width, info.height, info.channels);
    pipeline = sharp(rgba, {
      raw: { width: info.width, height: info.height, channels: 4 },
    });
  } else {
    pipeline = sharp(sourcePath).ensureAlpha();
  }

  await pipeline
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({
      width: job.width - 48,
      height: job.height - 36,
      fit: 'contain',
      withoutEnlargement: true,
    })
    .extend({
      top: 18,
      bottom: 18,
      left: 24,
      right: 24,
      background: { r: 113, g: 65, b: 216, alpha: 0 },
    })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  for (const job of jobs) await prepare(job);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
