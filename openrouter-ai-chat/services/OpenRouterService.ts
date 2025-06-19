import { OpenRouterMessage } from '../types';
import { OPENROUTER_API_URL, APP_HTTP_REFERER, APP_X_TITLE } from '../constants';

interface OpenRouterResponseChoice {
  message: {
    role: 'assistant';
    content: string;
  };
}

interface OpenRouterApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterResponseChoice[];
  // error?: { message: string, type: string, code: string };
}

const makeApiCall = async (
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
  isTestCall: boolean = false
): Promise<OpenRouterApiResponse> => {
  if (!apiKey) {
    throw new Error('API Key is not provided.');
  }
  if (!model) {
    throw new Error('Model name is not provided.');
  }

  const payload: any = {
    model: model,
    messages: messages,
  };

  if (isTestCall) {
    payload.max_tokens = 5; // Keep test call very light
    payload.stream = false; // Ensure no streaming for test
  }
  // else { // For regular calls, you might want to enable streaming if desired
  //   payload.stream = false; // Example: Keep streaming off for now
  // }


  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': APP_HTTP_REFERER,
      'X-Title': APP_X_TITLE,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => ({})); // Try to parse, default to empty

  if (!response.ok) {
    // Attempt to get more detailed error from OpenRouter's response structure
    const errorDetail = responseData?.error?.message || responseData?.detail || response.statusText || 'Unknown API error';
    console.error('OpenRouter API Error Response:', responseData);
    throw new Error(`API Error (${response.status}): ${errorDetail}`);
  }
  
  // For non-streaming, check if choices exist (OpenRouter might return error structure differently for some errors even with 200 OK)
  if (!isTestCall && (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message)) {
      if(responseData.error) { // If error structure is present in a 200 OK
          throw new Error(`API Error: ${responseData.error.message || 'Invalid response structure despite OK status.'}`);
      }
      throw new Error('Invalid response structure from API.');
  }


  return responseData as OpenRouterApiResponse;
};


export const fetchChatCompletion = async (
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
): Promise<string> => {
  try {
    const data = await makeApiCall(apiKey, model, messages, false);
     if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      // This case should ideally be caught by makeApiCall, but as a fallback:
      throw new Error('Invalid response structure from API in fetchChatCompletion.');
    }
  } catch (error) {
    console.error('OpenRouter API request failed (fetchChatCompletion):', error);
    if (error instanceof Error) {
        throw error; // Re-throw the original error which might have more details
    }
    throw new Error('An unexpected error occurred while fetching chat completion.');
  }
};

export const testChatCompletion = async (
  apiKey: string,
  model: string
): Promise<boolean> => {
  const testMessages: OpenRouterMessage[] = [{ role: 'user', content: 'Hi' }]; // A very simple prompt
  try {
    // For a test, we don't necessarily need the content, just that the call succeeds.
    // However, makeApiCall is designed to throw on non-ok or malformed success.
    await makeApiCall(apiKey, model, testMessages, true);
    return true; // If makeApiCall doesn't throw, it's considered a success.
  } catch (error) {
    // Log the error for debugging but return false for the test outcome
    console.warn(`API Key/Model test failed for "${model}":`, error instanceof Error ? error.message : String(error));
    return false;
  }
};
