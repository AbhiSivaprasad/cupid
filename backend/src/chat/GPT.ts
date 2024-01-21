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
    systemMessage: string,
    maxTokensToSample: number = 500,
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
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

  async transcribeImages(
    images: string[], // base64 encoded images
    maxTokensToSample: number = 300,
  ): Promise<string> {
    if (images.length === 0) {
      return '';
    }

    const completion = await this.client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Transcribe the following images. It is important to list the important objects and activities happening within each, as well as any commonalities between the photos.',
            },
            ...images.map(
              (image) =>
                ({
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${image}`,
                  },
                } as const),
            ),
          ],
        },
      ],
      max_tokens: maxTokensToSample,
      model: 'gpt-4-vision-preview',
      stream: false,
    });
    return completion.choices[0].message.content ?? '';
  }
}
