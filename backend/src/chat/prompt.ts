import { PromptBuilder } from './PromptBuilder';
import { Message, Profile } from './types';

export const SYSTEM_PROMPT =
  "You are messaging matches on a dating app. Your purpose is to maximize your chance of getting your match's phone number. Use the information you know about your match to keep the conversation going. Be witty and relevant. Keep messages concise and don't ask more than one question at a time. Do not answer your own questions.";

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
      name: 'your profile',
      description: "Here's what your match knows about you:",
      content: selfProfile.texts,
    },
    {
      name: 'their profile',
      description: "Here's what you know about your match:",
      content: otherProfile.texts,
    },
    {
      name: 'examples',
      description:
        'Here are some examples of successful first messages. The key is to set a concise message that is witty and relevant to their profile. Keep in mind that the following examples were successful because they were relevant to the match.',
      content: [
        "I noticed you enjoy hiking. I recently tried a new trail and couldn't help but wonder if you have any favorite hiking spots.",
        "That's a great photo of you. I love the nature scene in the background! Where did you take that picture?",
        'I think I saw you on Spotify. You were listed as the hottest single?',
        "Don't tell my friends I'm reaching out to a Cowboys fan.",
        'I need a map because I just got lost in your eyes.',
        'Are you a pulmonary embolism? Because you just took my breath away.',
        "I'd say God bless you, but it looks like he already did 😏",
        'If you could only watch one TV show for the rest of your life, which would it be?',
        'Would you rather spend the rest of your life living in an RV or a sailboat as your home?',
      ],
    },
    {
      name: 'first message',
      description:
        "You're about to send the first message. Don't be cringe. What will you say?",
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
      name: 'their profile',
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
