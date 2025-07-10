import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaStop, FaTrash } from 'react-icons/fa';
import { MdAudioFile, MdErrorOutline } from 'react-icons/md';
import { useEmotionPredictor } from '../services/audio.service';
import { WaveFile } from 'wavefile';

/**
 * Records microphone input, encodes it to WAV, and predicts emotion using an API.
 * @param setEmotion - callback to update emotion state from parent
 */
export const AudioRecorder = ({ setEmotion }: { setEmotion: React.Dispatch<React.SetStateAction<string>> }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const chunksRef = useRef<Float32Array[]>([]);
  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);

  const { mutate: uploadAudio, data, isPending, isError } = useEmotionPredictor();

  /**
   * Starts audio recording using MediaStream and Web Audio API.
   */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);

    const chunks: Float32Array[] = [];
    processor.onaudioprocess = (e) => {
      chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };

    source.connect(processor);
    processor.connect(context.destination);

    contextRef.current = context;
    streamRef.current = stream;
    scriptNodeRef.current = processor;
    chunksRef.current = chunks;
    setIsRecording(true);
  };

  /**
   * Stops recording, processes and encodes audio, and prepares it for upload.
   */
  const stopRecording = async () => {
    scriptNodeRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    await contextRef.current?.close();

    const raw = flatten(chunksRef.current);
    const norm = normalizeRMS(raw);
    const wav = encodeWav(norm, 44100);

    const blob = new Blob([wav.toBuffer()], { type: 'audio/wav' });
    setAudioBlob(blob);
    setAudioURL(URL.createObjectURL(blob));
    setIsRecording(false);
  };

  /**
   * Flattens Float32 chunk arrays into one.
   */
  const flatten = (chunks: Float32Array[]) => {
    const len = chunks.reduce((acc, cur) => acc + cur.length, 0);
    const result = new Float32Array(len);
    let offset = 0;
    for (const c of chunks) {
      result.set(c, offset);
      offset += c.length;
    }
    return result;
  };

  /**
   * Normalizes audio buffer using RMS scaling.
   */
  const normalizeRMS = (buf: Float32Array) => {
    const rms = Math.sqrt(buf.reduce((sum, v) => sum + v * v, 0) / buf.length) || 1;
    return buf.map((v) => Math.max(-1, Math.min(1, v / rms * 0.1)));
  };

  /**

  /**
   * Encodes samples to a WAV file.
   */
  const encodeWav = (samples: Float32Array, rate: number) => {
    const wav = new WaveFile();
    const int16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      int16[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767)));
    }
    wav.fromScratch(1, rate, '16', int16);
    return wav;
  };

  /**
   * Toggles recording state.
   */
  const toggleRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isRecording ? stopRecording() : startRecording();
  };

  /**
   * Submits recorded blob to prediction API.
   */
  const handleSubmit = () => {
    if (audioBlob) {
      const file = new File([audioBlob], 'recorded.wav', { type: 'audio/wav' });
      uploadAudio(file);
    }
  };

  /**
   * Clears audio preview.
   */
  const clearRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
  };

  /**
   * Updates emotion once prediction response is available.
   */
  useEffect(() => {
    if (data?.emotion) {
      setEmotion(data.emotion);
    }
  }, [data]);

  return (
    <div className="w-full text-center">
      {isError && (
        <p className="text-red-600 mb-6 text-sm flex items-center justify-center gap-2">
          <MdErrorOutline /> Something went wrong
        </p>
      )}
      <p className="text-xs text-yellow-600  mb-3">
        ⚠️ Note: Predictions from live recording may vary due to factors like background noise and device quality. For best results, use clean audio.
      </p>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`text-white w-16 h-16 rounded-full shadow-lg mx-auto mb-6 flex items-center justify-center transition-all duration-300 ${
          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        onClick={toggleRecording}
      >
        {isRecording ? <FaStop size={28} /> : <FaMicrophone size={28} />}
      </motion.button>

      <AnimatePresence>
        {audioBlob && audioURL && (
          <motion.div
            className="mt-4 text-gray-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-4">
              <p className="flex items-center gap-2 font-medium">
                <MdAudioFile size={28} />
                Preview
              </p>
              <FaTrash size={20} className="text-red-500 cursor-pointer hover:opacity-70" onClick={clearRecording} />
            </div>
            <audio controls className="mt-2 w-full max-w-md mx-auto">
              <source src={audioURL} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleSubmit}
        disabled={!audioBlob || isPending}
        whileTap={{ scale: 0.97 }}
        className="mt-6 w-full bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all duration-300"
      >
        {isPending ? 'Analyzing...' : 'Predict Emotion'}
      </motion.button>
    </div>
  );
};
