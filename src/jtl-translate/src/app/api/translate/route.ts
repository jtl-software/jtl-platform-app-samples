import { withAuthorization } from "@/server/auth";
import { generateObject, jsonSchema } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const translateRequestSchema = z.object({
  sourceLanguage: z.string().nonempty(),
  targetLanguage: z.string().nonempty(),
  keys: z.record(z.string(), z.string())
});

export type TranslateResponse = {
  translations: Record<string, string>
};

/**
 * Translates the provided object
 */
export const POST = withAuthorization(async (req) => {

  try {

    // Extract translate options
    const body = await req.json();

    // Validate translate options
    const result = translateRequestSchema.safeParse(body);
    if (!result.success) {
      return Response.json({
        error: 'BadRequestError',
        error_description: 'The request had missing or malformed properties'
      }, { status: 400 });
    }
  
    // Get the api key
    const apiKey = process.env.OPENAI_API_KEY;
  
    // Mock implementation simply reverses the characters
    if (!apiKey) {
      const translations: Record<string, string> = {};
      for (const [key, value] of Object.entries(result.data.keys)) {
        translations[key] = value.split('').reverse().join('');
      }
      return Response.json(translations);
    }
  
    // Request translations from OpenAI
    const openai = createOpenAI({
      apiKey,
      compatibility: 'strict'
    })
    const { object, usage, warnings, finishReason } = await generateObject({
      model: openai('gpt-4.1-nano', {
        structuredOutputs: true
      }),
      mode: 'auto',
      temperature: 0,
      schema: jsonSchema<{ translations: Record<string, string> }>({
        type: 'object',
        properties: {
          translations: {
            type: 'object',
            properties: Object.fromEntries(Object.keys(result.data.keys).map((key) => [key, { type: 'string' }])),
            required: Object.keys(result.data.keys),
            additionalProperties: false
          }
        },
        required: ['translations'],
        additionalProperties: false
      }),
      messages: [
        {
          role: "system",
          content: [
            `You are a helpful assistant that translates product fields from one language to another.`,
            `The incoming data is a JSON object with the following shape:`,
            `{`,
            `  sourceLanguage: string;`,
            `  targetLanguage: string;`,
            `  keys: {`,
            `    [key: string]: string;`,
            `  }`,
            `}`,
            ``,
            `Your job is to translate the values of the keys object from sourceLanguage to targetLanguage.`,
            `Note that the value might contain HTML which needs to stay intact, only translate the pure text within the HTML tags.`,
            `You should output an object with a "translations" object that contains the translated keys in the target language.`,
          ].join('\n')
        },
        {
          role: "user",
          content: JSON.stringify(result.data, null, 2)
        }
      ]
    });

    console.info(`AI stats:`, { usage, warnings, finishReason });
    return Response.json(object);

  } catch (err) {
    return Response.json({
      error: 'BadRequestError',
      error_description: err instanceof Error ? err.message : JSON.stringify(err)
    }, { status: 400 });
  }

});
