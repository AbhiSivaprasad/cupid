export class PromptBuilder {
  static build(sections: PromptSection[]) {
    return sections
      .map(({ name, description, content }) => {
        let prompt = `## ${name.toUpperCase()}`;
        if (description) prompt += `\n${description}`;
        if (content) {
          if (Array.isArray(content)) {
            content = content
              .map((m, i) => `${i + 1}. ${m.replace(/\s+/g, ' ')}`)
              .join('\n');
          }

          prompt += `\n${content}`;
        }

        return prompt;
      })
      .join('\n\n');
  }
}

interface PromptSection {
  name: string;
  description?: string;
  content?: string | string[];
}
