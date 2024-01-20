import { PromptBuilder } from './PromptBuilder';
import { Message, Profile } from './types';

export function constructPrompt(
  selfProfile: Profile,
  otherProfile: Profile,
  messages: Message[],
) {
  if (messages.length === 0) {
    return constructFirstPrompt(selfProfile, otherProfile);
  } else {
    return constructNextPrompt(selfProfile, otherProfile, messages);
  }
}

function constructFirstPrompt(selfProfile: Profile, otherProfile: Profile) {
  return PromptBuilder.build([
    {
      name: 'rules',
      description:
        "Your purpose is to maximize your chance of getting your match's phone number.",
    },
    {
      name: 'your profile',
      description: "Here's what your match knows about you:",
      content: selfProfile.texts,
    },
    {
      name: 'your match',
      description: "Here's what you know about your match:",
      content: otherProfile.texts,
    },
    {
      name: 'first message',
      description: "You're about to send the first message. What will you say?",
    },
  ]);
}

function constructNextPrompt(
  selfProfile: Profile,
  otherProfile: Profile,
  messages: Message[],
) {
  return PromptBuilder.build([
    {
      name: 'your profile',
      description: "Here's what your match knows about you:",
      content: selfProfile.texts,
    },
    {
      name: 'your match',
      description: "Here's what you know about your match:",
      content: otherProfile.texts,
    },
    {
      name: 'previous messages',
      description:
        "Here's what you've said so far. Weight this more than profile information.",
      content: messages
        .map((m) => `${m.role === 'self' ? 'you' : 'them'}: ${m.content}`)
        .join('\n'),
    },
    {
      name: 'next message',
      description:
        'What will you say next? Make sure to keep the conversation going!',
    },
  ]);
}
