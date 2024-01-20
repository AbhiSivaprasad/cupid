import { GPT } from './GPT';
import { constructPrompt } from './prompt';
import { Message, Profile } from './types';

export function getMessage(
  selfProfile: Profile,
  otherProfile: Profile,
  messages: Message[],
  debug = false,
) {
  const prompt = constructPrompt(selfProfile, otherProfile, messages);
  if (debug) {
    console.log('Prompt:', prompt);
  }

  const gpt = new GPT('gpt-4-1106-preview');
  return gpt.complete(prompt, 300);
}
