import { GPT } from './GPT';
import { SYSTEM_PROMPT, constructPrompt } from './prompt';
import { Message, Profile } from './types';

export async function getMessage(
  selfProfile: Profile,
  otherProfile: Profile,
  messages: Message[],
  debug = false,
) {
  const vision = new GPT('gpt-4-vision-preview');
  const [selfProfileImageText, otherProfileImageText] = await Promise.all([
    vision.transcribeImages(selfProfile.images),
    vision.transcribeImages(otherProfile.images),
  ]);

  if (debug) {
    console.log('Self profile image text:', selfProfileImageText);
    console.log('Other profile image text:', otherProfileImageText);
  }

  if (selfProfileImageText && isValidGptResponse(selfProfileImageText)) {
    selfProfile.texts.push(selfProfileImageText);
  }

  if (otherProfileImageText && isValidGptResponse(otherProfileImageText)) {
    otherProfile.texts.push(otherProfileImageText);
  }

  const prompt = constructPrompt(selfProfile, otherProfile, messages);
  if (debug) {
    console.log('Prompt:', prompt);
  }

  const gpt = new GPT('gpt-4-1106-preview');
  return gpt.complete(prompt, SYSTEM_PROMPT, 300);
}

function isValidGptResponse(response: string) {
  return response.length > 0 && !response.toLowerCase().includes('sorry');
}
