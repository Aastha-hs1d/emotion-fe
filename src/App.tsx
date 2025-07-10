import { useState } from "react";
import { AudioUploader } from "./audio/components/audio-uploader.component";
import { AudioRecorder } from "./audio/components/audio-recorder.component";
import {
  AUDIO_MODES,
  emotionGradients,
  type AudioModes,
} from "./audio/services/audio.interfaces";
import { motion, AnimatePresence } from "framer-motion";
import { textToEmotion } from "./text/text.service";

const App = () => {
  const [mode, setMode] = useState<AudioModes>(AUDIO_MODES.UPLOAD);
  const [emotion, setEmotion] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const detected = await textToEmotion(inputText);
      setEmotion(detected);
    } catch (e) {
      console.error("Emotion detection failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key={emotion}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`flex flex-col items-center justify-start min-h-screen w-full bg-gradient-to-br ${emotionGradients[emotion]}`}
    >
      {/* Mode Selector */}
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

      {/* Audio Section */}
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

      <p className="flex flex-row my-8 justify-center tracking-widest font-extrabold"> OR </p>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl mx-auto p-6  bg-white shadow-xl rounded-md"
      >
        {/* Text Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full h-full"
        >
          <textarea
            placeholder="Share your thoughts..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            className="w-full p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTextSubmit}
            disabled={loading || !inputText}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 duration-300 cursor-pointer"
          >
            {loading ? "Analyzing..." : "Predict Emotion"}
          </button>
        </motion.div>

      </motion.div>
      
      {/* Emotion Output */}
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
