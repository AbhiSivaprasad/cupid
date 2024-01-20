import { GPT } from './GPT';
import { constructPrompt } from './prompt';
import { Message, Profile } from './types';

export function getMessage(
  selfProfile: Profile,
  otherProfile: Profile,
  messages: Message[],
) {
  const gpt = new GPT('gpt-4-1106-preview');
  return gpt.complete(
    constructPrompt(selfProfile, otherProfile, messages),
    300,
  );
}
