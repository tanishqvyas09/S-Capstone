/**
 * QuizGenerator Service
 * Generates quiz questions from extracted PDF text
 * 
 * In production, this would call an AI API (OpenAI, Claude, Cohere, etc.)
 * For now, we'll use a mock generator that creates smart questions from the text
 */

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

/**
 * Extract key sentences from text that can be quiz questions
 */
const extractKeySentences = (text: string, count: number = 5): string[] => {
  // Split by sentences and filter empty ones
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 300);

  // Sort by length and relevance (longer sentences tend to have more info)
  const filtered = sentences
    .sort((a, b) => b.length - a.length)
    .slice(0, count);

  return filtered;
};

/**
 * Generate multiple choice options from text
 */
const generateOptions = (correctAnswer: string, text: string): string[] => {
  // Extract other potential answers from the text
  const words = text.toLowerCase().split(/\s+/);
  const potentialAnswers = new Set<string>();

  // Add the correct answer
  potentialAnswers.add(correctAnswer);

  // Try to find 3 plausible wrong answers
  // This is a simple mock - in production, use AI to generate semantically similar but wrong answers
  const wrongAnswers = [
    `Incorrect option 1 related to ${correctAnswer.split(' ')[0]}`,
    `Incorrect option 2 about the topic`,
    `Incorrect option 3 (common misconception)`,
  ];

  wrongAnswers.forEach(ans => potentialAnswers.add(ans));

  return Array.from(potentialAnswers).slice(0, 4).sort(() => Math.random() - 0.5);
};

/**
 * Generate quiz questions from extracted text
 * In production, this would call an LLM API
 */
export const generateQuizQuestions = async (
  extractedText: string,
  questionCount: number = 5
): Promise<GeneratedQuestion[]> => {
  console.log('[QuizGenerator] Generating questions from text, length:', extractedText.length);

  if (!extractedText || extractedText.trim().length < 100) {
    throw new Error('Text is too short to generate meaningful questions. Please upload a longer PDF.');
  }

  try {
    // Extract key sentences
    const keySentences = extractKeySentences(extractedText, questionCount);

    if (keySentences.length === 0) {
      throw new Error('Could not extract meaningful sentences from the PDF');
    }

    // Convert sentences to questions
    const questions: GeneratedQuestion[] = keySentences.map((sentence, index) => {
      // Extract first 5-7 words as the answer
      const words = sentence.split(' ');
      const answerLength = Math.min(5, Math.max(2, Math.floor(words.length / 3)));
      const correctAnswer = words.slice(0, answerLength).join(' ');

      // Create a question by replacing the answer with "____"
      const question = sentence.replace(correctAnswer, '____').slice(0, 120) + '?';

      return {
        question: `Q${index + 1}: Fill in the blank: ${question}`,
        options: generateOptions(correctAnswer, extractedText),
        answer: correctAnswer,
        explanation: `The correct answer is "${correctAnswer}" based on the content.`,
      };
    });

    console.log('[QuizGenerator] Generated questions:', questions.length);
    return questions;
  } catch (error) {
    console.error('[QuizGenerator] Error generating questions:', error);
    throw error;
  }
};

/**
 * Generate quiz metadata from text
 */
export const generateQuizMetadata = (fileName: string, extractedText: string) => {
  // Extract title from filename or use a default
  const fileNameWithoutExt = fileName.replace('.pdf', '');
  const title = fileNameWithoutExt.charAt(0).toUpperCase() + fileNameWithoutExt.slice(1);

  // Extract a short description from the first 200 characters
  const description = extractedText.slice(0, 150).replace(/\n/g, ' ').trim() + '...';

  return { title, description };
};

/**
 * Full quiz generation pipeline
 */
export const generateQuiz = async (
  fileName: string,
  extractedText: string,
  questionCount: number = 5
): Promise<GeneratedQuiz> => {
  console.log('[QuizGenerator] Starting full quiz generation');

  const metadata = generateQuizMetadata(fileName, extractedText);
  const questions = await generateQuizQuestions(extractedText, questionCount);

  const quiz: GeneratedQuiz = {
    title: metadata.title,
    description: metadata.description,
    questions,
  };

  console.log('[QuizGenerator] Quiz generation complete:', quiz);
  return quiz;
};
