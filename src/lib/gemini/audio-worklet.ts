// PCM recorder AudioWorklet processor
// Registered via Blob URL to avoid separate file serving
export const PCM_RECORDER_WORKLET_CODE = `
class PcmRecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.chunkSize = options.processorOptions?.chunkSize || 2048;
    this.buffer = new Float32Array(0);
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    const newBuffer = new Float32Array(this.buffer.length + channelData.length);
    newBuffer.set(this.buffer);
    newBuffer.set(channelData, this.buffer.length);
    this.buffer = newBuffer;

    while (this.buffer.length >= this.chunkSize) {
      const chunk = this.buffer.slice(0, this.chunkSize);
      this.buffer = this.buffer.slice(this.chunkSize);
      this.port.postMessage(chunk);
    }

    return true;
  }
}

registerProcessor('pcm-recorder-processor', PcmRecorderProcessor);
`;

/**
 * Register the PCM recorder worklet on an AudioContext.
 * Uses a Blob URL so no separate file needs to be served.
 */
export async function registerPcmWorklet(ctx: AudioContext): Promise<void> {
  const blob = new Blob([PCM_RECORDER_WORKLET_CODE], {
    type: "application/javascript",
  });
  const url = URL.createObjectURL(blob);
  try {
    await ctx.audioWorklet.addModule(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}
