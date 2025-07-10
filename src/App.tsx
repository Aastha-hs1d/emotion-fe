import { useState } from "react";
import { AudioUploader } from "./audio/components/audio-uploader.component";
import { AudioRecorder } from "./audio/components/audio-recorder.component";
import {
  AUDIO_MODES,
  emotionGradients,
  type AudioModes,
} from "./audio/services/audio.interfaces";
import { motion, AnimatePresence } from "framer-motion";

const App = () => {
  const [mode, setMode] = useState<AudioModes>(AUDIO_MODES.UPLOAD);
  const [emotion, setEmotion] = useState<string>(""); // will trigger gradient changes

  return (
    <motion.div
      key={emotion}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`flex flex-col items-center justify-start min-h-screen w-full bg-gradient-to-br ${emotionGradients[emotion]}`}
    >
      <div className="flex flex-row justify-around gap-8 mt-6">
        <div className="flex flex-row justify-around gap-8 mt-6">
          <span
            className={`cursor-pointer font-bold duration-200 uppercase tracking-widest ${
              mode === AUDIO_MODES.UPLOAD ? "border-b-4 border-b-blue-500" : ""
            }`}
            onClick={() => setMode(AUDIO_MODES.UPLOAD)}
          >
            Upload
          </span>
          <span
            className={`cursor-pointer font-bold duration-200 uppercase tracking-widest ${
              mode === AUDIO_MODES.RECORD ? "border-b-4 border-b-blue-500" : ""
            }`}
            onClick={() => setMode(AUDIO_MODES.RECORD)}
          >
            Record
          </span>
        </div>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl mx-auto p-6 mt-10 bg-white shadow-xl rounded-md"
      >
        {mode === AUDIO_MODES.UPLOAD ? (
          <AudioUploader setEmotion={setEmotion} />
        ) : (
          <AudioRecorder setEmotion={setEmotion} />
        )}
      </motion.div>
      <AnimatePresence>
        {emotion && (
          <motion.span
            key={`emotion-${emotion}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 text-xl font-semibold text-white bg-black/30 px-6 py-2 rounded-lg backdrop-blur-sm tracking-widest"
          >
            {emotion.toUpperCase()}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;
