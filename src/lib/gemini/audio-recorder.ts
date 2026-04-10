import { registerPcmWorklet } from "./audio-worklet";

/**
 * Captures microphone audio, converts to PCM16 base64 chunks
 * for streaming to Gemini Flash Live.
 *
 * Pattern from BrowserBud: MediaStream -> AudioWorkletNode -> PCM16 -> base64
 */
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: AudioWorkletNode | null = null;
  private sink: GainNode | null = null;
  private _isMuted = false;

  /** Called with base64-encoded PCM16 audio chunks */
  onData: ((base64Pcm: string) => void) | null = null;

  /** Called if the user denies microphone permission */
  onPermissionDenied: (() => void) | null = null;

  get isMuted() {
    return this._isMuted;
  }

  set isMuted(value: boolean) {
    this._isMuted = value;
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch {
      this.onPermissionDenied?.();
      return;
    }

    this.audioCtx = new AudioContext({ sampleRate: 16000 });
    await registerPcmWorklet(this.audioCtx);

    this.source = this.audioCtx.createMediaStreamSource(this.stream);
    this.processor = new AudioWorkletNode(
      this.audioCtx,
      "pcm-recorder-processor",
      {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        channelCount: 1,
        processorOptions: { chunkSize: 2048 },
      }
    );

    // Silent sink so audio flows through the worklet
    this.sink = this.audioCtx.createGain();
    this.sink.gain.value = 0;

    this.source.connect(this.processor);
    this.processor.connect(this.sink);
    this.sink.connect(this.audioCtx.destination);

    this.processor.port.onmessage = (event) => {
      if (this._isMuted || !this.onData) return;

      const inputData = event.data;
      if (!(inputData instanceof Float32Array)) return;

      // Convert Float32 -> PCM16 -> base64 (BrowserBud pattern)
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
      }

      const uint8 = new Uint8Array(pcm16.buffer);
      let binary = "";
      for (let i = 0; i < uint8.byteLength; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      this.onData(btoa(binary));
    };
  }

  stop() {
    this.processor?.port.close();
    this.processor?.disconnect();
    this.source?.disconnect();
    this.sink?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.audioCtx?.close();

    this.processor = null;
    this.source = null;
    this.sink = null;
    this.stream = null;
    this.audioCtx = null;
  }
}
