import sharp from 'sharp';

const covers = [
    ['public/Project1.gif', 'public/Project1_cover.webp'],
    ['public/Project2.png', 'public/Project2_cover.webp'],
    ['public/Project3.gif', 'public/Project3_cover.webp'],
    ['public/Project4.png', 'public/Project4_cover.webp'],
    ['public/Project5.png', 'public/Project5_cover.webp'],
];

const width = 240;
const height = 150;
const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
];

for (const [source, destination] of covers) {
    const { data } = await sharp(source, { page: 0 })
        .toColourspace('srgb')
        .resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const output = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const outputIndex = (y * width + x) * 3;
            const threshold = (bayer[y % 4][x % 4] + 0.5) / 16 - 0.5;
            const shift = threshold * 30;
            const channels = [
                [0.72, 18],
                [0.76, 34],
                [0.9, 46],
            ];

            for (let channel = 0; channel < 3; channel++) {
                const [scale, bias] = channels[channel];
                const value = Math.round((data[sourceIndex + channel] * scale + bias) / 28) * 28 + shift;
                output[outputIndex + channel] = Math.max(0, Math.min(255, Math.round(value)));
            }
        }
    }

    await sharp(output, { raw: { width, height, channels: 3 } })
        .webp({ quality: 94, effort: 5 })
        .toFile(destination);
    console.log(`${source} -> ${destination}`);
}
