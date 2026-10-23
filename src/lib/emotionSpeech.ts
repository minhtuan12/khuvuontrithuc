import { readAssistantMessage } from './assistantSpeech';
import { EMOTIONS, type EmotionId } from './wellbeing';

/** Selecting an emotion is an explicit request for a spoken response. */
export function readEmotionFeedback(emotion: EmotionId): Promise<void> {
  const selected = EMOTIONS.find(item => item.id === emotion)!;
  return readAssistantMessage(selected.feedback, true, 'vi');
}
