import { deflateSync } from 'node:zlib'
import { writeFile } from 'node:fs/promises'

const outputDirectory = new URL('../public/', import.meta.url)
const crcTable = new Uint32Array(256)

for (let index = 0; index < 256; index += 1) {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  crcTable[index] = value >>> 0
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, checksum])
}

function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const scale = size / 512
  const strokeWidth = 40 * scale

  function paint(x, y, color) {
    const offset = (y * size + x) * 4
    pixels[offset] = color[0]
    pixels[offset + 1] = color[1]
    pixels[offset + 2] = color[2]
    pixels[offset + 3] = 255
  }

  function distanceToSegment(x, y, start, end) {
    const dx = end[0] - start[0]
    const dy = end[1] - start[1]
    const lengthSquared = dx * dx + dy * dy
    const projection = Math.max(
      0,
      Math.min(1, ((x - start[0]) * dx + (y - start[1]) * dy) / lengthSquared),
    )
    return Math.hypot(x - (start[0] + projection * dx), y - (start[1] + projection * dy))
  }

  const blue = [37, 99, 235]
  const white = [255, 255, 255]
  const lines = [
    [[150, 360], [150, 158]],
    [[150, 158], [256, 270]],
    [[256, 270], [362, 158]],
    [[362, 158], [362, 360]],
  ]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const logicalX = (x + 0.5) / scale
      const logicalY = (y + 0.5) / scale
      const isMark = lines.some(([start, end]) =>
        distanceToSegment(logicalX, logicalY, start, end) <= strokeWidth / (2 * scale),
      )
      paint(x, y, isMark ? white : blue)
    }
  }

  const rows = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1)
    rows[rowStart] = 0
    pixels.copy(rows, rowStart + 1, y * size * 4, (y + 1) * size * 4)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return png
}

for (const [filename, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['maskable-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  await writeFile(new URL(filename, outputDirectory), drawIcon(size))
}
