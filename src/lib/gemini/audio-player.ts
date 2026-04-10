/**
 * Plays PCM16 audio received from Gemini Flash Live.
 * Handles autoplay restrictions gracefully.
 *
 * Pattern from BrowserBud: base64 PCM16 -> Float32 -> AudioBufferSourceNode
 */
export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  private ensureContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext({ sampleRate: 24000 });
    }
    return this.audioCtx;
  }

  /**
   * Play a base64-encoded PCM16 audio chunk from Gemini.
   * Chunks are queued sequentially for smooth playback.
   */
  play(base64Data: string): void {
    const ctx = this.ensureContext();

    // Decode base64 to PCM16 bytes
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert PCM16 to Float32
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    // Create audio buffer and schedule playback
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startTime = Math.max(now, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;

    this.activeSources.push(source);
    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source);
    };
  }

  /** Stop all current playback immediately */
  stop(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    }
  }

  /** Clean up the audio context */
  dispose(): void {
    this.stop();
    void this.audioCtx?.close();
    this.audioCtx = null;
  }
}
