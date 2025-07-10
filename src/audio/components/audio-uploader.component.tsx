import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useEmotionPredictor } from "../services/audio.service";
import { MdAudioFile } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { MdErrorOutline } from "react-icons/md";

export const AudioUploader = ({
  setEmotion,
}: {
  setEmotion: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const {
    mutate: uploadAudio,
    data,
    isPending,
    isError,
  } = useEmotionPredictor();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/wav": [".wav"] },
    multiple: false,
  });

  const handleUpload = () => {
    if (file) uploadAudio(file);
  };

  useEffect(() => {
    if (!data || !data.emotion) return;
    setEmotion(data.emotion);
  }, [data]);

  return (
    <>
      {isError && (
        <p className="text-red-600 my-2 text-sm flex flex-row items-center justify-center gap-2">
          {" "}
          <MdErrorOutline /> Something went wrong
        </p>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-8 cursor-pointer text-center transition-all duration-300
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "Release!"
            : "Drag & drop a .wav file here, or click to select"}
        </p>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 px-4 py-2 rounded text-blue-800 font-medium"
          >
            <div className="flex flex-row items-center justify-center">
              <p className=" text-lg text-slate-700 font-medium flex flex-row items-center justify-center mx-6 my-4 gap-1">
                <MdAudioFile size={40} /> {file.name}
              </p>
              <FaTrash
                onClick={() => setFile(null)}
                color="red"
                className="cursor-pointer hover:opacity-60 duration-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleUpload}
        disabled={isPending || !file}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 duration-300 cursor-pointer"
      >
        {isPending ? "Analyzing..." : "Predict Emotion"}
      </button>
    </>
  );
};
