export type AudioModes = "upload" | "record" 
export const AUDIO_MODES: Record<string, AudioModes> = {
    UPLOAD: 'upload',
    RECORD: 'record'
} as const


export const emotionGradients: Record<string, string> = {
  angry: 'from-red-200 via-red-300 to-red-100',
  disgust: 'from-lime-200 via-green-300 to-emerald-100',
  fear: 'from-indigo-200 via-purple-300 to-indigo-100',
  happy: 'from-yellow-100 via-amber-200 to-pink-100',
  neutral: 'from-gray-100 via-gray-200 to-gray-100',
  sad: 'from-blue-200 via-blue-300 to-blue-100',
  surprise: 'from-orange-200 via-yellow-300 to-pink-100',
};
