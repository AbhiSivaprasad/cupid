import OpenAI from 'openai';

export type GptModel =
  | 'gpt-4'
  | 'gpt-4-32k'
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-3.5-turbo-instruct';

export class GPT {
  private client: OpenAI;
  model: GptModel;

  constructor(model: GptModel) {
    this.client = new OpenAI();
    this.model = model;
  }

  async complete(
    message: string,
    maxTokensToSample: number = 550,
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: maxTokensToSample,
      model: this.model,
      stream: false,
    });
    return completion.choices[0].message.content ?? '';
  }
}
