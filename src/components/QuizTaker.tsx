
import { useState } from 'react';

// Inlined Question type to avoid module-resolution issues with ../types
interface Question {
  question: string;
  options?: string[];
  answer?: string;
  type?: 'mcq' | 'tf' | 'fill' | string;
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

  const handleChangeText = (qIdx: number, value: string) => {
    setAnswers({ ...answers, [qIdx]: value });
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
            {(!q.type || q.type === 'mcq') && (q.options || []).map((opt, j) => (
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

            {q.type === 'tf' && (
              <>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === 'True'}
                    onChange={() => handleSelect(i, 'True')}
                  />{' '}
                  True
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === 'False'}
                    onChange={() => handleSelect(i, 'False')}
                  />{' '}
                  False
                </label>
              </>
            )}

            {q.type === 'fill' && (
              <input
                type="text"
                value={answers[i] || ''}
                onChange={(e) => handleChangeText(i, e.target.value)}
                placeholder="Type your answer"
                style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ddd' }}
              />
            )}
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