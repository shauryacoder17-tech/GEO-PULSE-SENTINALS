// Generate a military suspense intro sound as a WAV file using raw audio synthesis
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SAMPLE_RATE = 44100
const DURATION = 4.5
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION)
const NUM_CHANNELS = 1
const BITS_PER_SAMPLE = 16

const samples = new Float64Array(NUM_SAMPLES)

// Layer 1: Deep sub-bass rumble that builds (40-80Hz)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const env = Math.min(t / 1.5, 1) * Math.max(0, 1 - (t - 3.5) / 1.0)
  const freq = 40 + 30 * (t / DURATION)
  samples[i] += Math.sin(2 * Math.PI * freq * t) * 0.25 * env
  samples[i] += Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.15 * env
}

// Layer 2: Rising tension tone (200-600Hz sweep)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const env = Math.pow(Math.min(t / 2.5, 1), 2) * Math.max(0, 1 - (t - 3.8) / 0.7)
  const freq = 200 + 400 * Math.pow(t / DURATION, 1.5)
  samples[i] += Math.sin(2 * Math.PI * freq * t) * 0.08 * env
}

// Layer 3: Stinger hit at ~1.8s (impact moment when title appears)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const hitTime = t - 1.8
  if (hitTime > 0 && hitTime < 1.5) {
    const hitEnv = Math.exp(-hitTime * 3) * 0.35
    samples[i] += Math.sin(2 * Math.PI * 60 * hitTime) * hitEnv
    samples[i] += Math.sin(2 * Math.PI * 150 * hitTime) * hitEnv * 0.5
    samples[i] += Math.sin(2 * Math.PI * 800 * hitTime) * hitEnv * 0.15
  }
}

// Layer 4: Second stinger for subtitle at ~2.8s
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const hitTime = t - 2.8
  if (hitTime > 0 && hitTime < 1.2) {
    const hitEnv = Math.exp(-hitTime * 4) * 0.2
    samples[i] += Math.sin(2 * Math.PI * 80 * hitTime) * hitEnv
    samples[i] += Math.sin(2 * Math.PI * 200 * hitTime) * hitEnv * 0.4
  }
}

// Layer 5: High-frequency digital beeps/ticks (tactical feel)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const beepTimes = [0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7]
  for (const bt of beepTimes) {
    const dt = t - bt
    if (dt > 0 && dt < 0.03) {
      const beepEnv = Math.exp(-dt * 100)
      samples[i] += Math.sin(2 * Math.PI * 1200 * dt) * 0.06 * beepEnv
    }
  }
}

// Layer 6: Cinematic riser (noise sweep)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  if (t < 2.0) {
    const env = Math.pow(t / 2.0, 3) * 0.06
    const noise = (Math.random() * 2 - 1)
    samples[i] += noise * env
  }
}

// Layer 7: Resolving minor chord at end
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const startT = t - 3.2
  if (startT > 0) {
    const env = Math.min(startT / 0.3, 1) * Math.exp(-startT * 1.5) * 0.12
    samples[i] += Math.sin(2 * Math.PI * 130.81 * startT) * env
    samples[i] += Math.sin(2 * Math.PI * 155.56 * startT) * env * 0.7
    samples[i] += Math.sin(2 * Math.PI * 196.0 * startT) * env * 0.5
  }
}

// Normalize
let maxVal = 0
for (let i = 0; i < NUM_SAMPLES; i++) {
  maxVal = Math.max(maxVal, Math.abs(samples[i]))
}
const normFactor = 0.85 / maxVal

// Convert to 16-bit PCM
const pcmData = Buffer.alloc(NUM_SAMPLES * 2)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const val = Math.max(-1, Math.min(1, samples[i] * normFactor))
  const intVal = Math.round(val * 32767)
  pcmData.writeInt16LE(intVal, i * 2)
}

// Build WAV header
const dataSize = pcmData.length
const headerSize = 44
const fileSize = headerSize + dataSize
const wav = Buffer.alloc(fileSize)

wav.write('RIFF', 0)
wav.writeUInt32LE(fileSize - 8, 4)
wav.write('WAVE', 8)
wav.write('fmt ', 12)
wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20)
wav.writeUInt16LE(NUM_CHANNELS, 22)
wav.writeUInt32LE(SAMPLE_RATE, 24)
wav.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 28)
wav.writeUInt16LE(NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 32)
wav.writeUInt16LE(BITS_PER_SAMPLE, 34)
wav.write('data', 36)
wav.writeUInt32LE(dataSize, 40)
pcmData.copy(wav, 44)

const outDir = join(process.cwd(), 'public', 'sounds')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'intro-suspense.wav')
writeFileSync(outPath, wav)

console.log(`Generated intro sound: ${outPath} (${(fileSize / 1024).toFixed(1)} KB)`)
