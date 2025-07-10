import { pipeline } from '@huggingface/transformers';
import { EMOTION_ENUM } from './text.interface';

export const textToEmotion = async (text: string) => {
    const classifier = await pipeline('text-classification', 'Xenova/bert-base-multilingual-uncased-sentiment');
    const output = await classifier(text) as Array<{ label: string; score: number }>;
    const label = output[0].label
    console.log(output);
    return EMOTION_ENUM[label]
};
