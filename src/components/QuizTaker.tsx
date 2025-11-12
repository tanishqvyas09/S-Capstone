
import { useState } from 'react';

// Inlined Question type to avoid module-resolution issues with ../types
interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Props {
  questions: Question[];
  onSubmit: (answers: Record<number, string>) => void;
}

const QuizTaker: React.FC<Props> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (qIdx: number, opt: string) => {
    setAnswers({ ...answers, [qIdx]: opt });
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} className="card" style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 600 }}>{q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {q.options.map((opt, j) => (
              <label key={j} style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`q${i}`}
                  checked={answers[i] === opt}
                  onChange={() => handleSelect(i, opt)}
                />{' '}
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%' }}>
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizTaker;