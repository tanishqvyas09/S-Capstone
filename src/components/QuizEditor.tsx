import { useState } from 'react';
import type { Quiz } from '../types/index';

interface EditorQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface EditorQuiz {
  title: string;
  description?: string;
  questions: EditorQuestion[];
}

interface QuizEditorProps {
  quiz: EditorQuiz;
  onSave: (quiz: EditorQuiz) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const QuizEditor = ({ quiz, onSave, onCancel, loading = false }: QuizEditorProps) => {
  const [edited, setEdited] = useState<EditorQuiz>(quiz);
  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof EditorQuiz, value: any) => {
    setEdited({ ...edited, [field]: value });
  };

  const updateQuestion = (index: number, field: keyof EditorQuestion, value: any) => {
    const questions = [...edited.questions];
    questions[index] = { ...questions[index], [field]: value };
    setEdited({ ...edited, questions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const questions = [...edited.questions];
    const options = [...questions[questionIndex].options];
    options[optionIndex] = value;
    questions[questionIndex] = { ...questions[questionIndex], options };
    setEdited({ ...edited, questions });
  };

  const deleteQuestion = (index: number) => {
    const questions = edited.questions.filter((_, i) => i !== index);
    setEdited({ ...edited, questions });
  };

  const addQuestion = () => {
    setEdited({
      ...edited,
      questions: [
        ...edited.questions,
        {
          question: '',
          options: ['', '', '', ''],
          answer: '',
          explanation: ''
        }
      ]
    });
  };

  const handleSave = async () => {
    // Validate quiz
    if (!edited.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (edited.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < edited.questions.length; i++) {
      const q = edited.questions[i];
      if (!q.question.trim()) {
        alert(`Question ${i + 1}: Please enter a question`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question ${i + 1}: Please fill in all options`);
        return;
      }
      if (!q.answer.trim()) {
        alert(`Question ${i + 1}: Please select a correct answer`);
        return;
      }
      if (!q.options.includes(q.answer)) {
        alert(`Question ${i + 1}: Correct answer must be one of the options`);
        return;
      }
    }

    try {
      setSaving(true);
      console.log('[QuizEditor] Saving quiz:', edited);
      await onSave(edited);
    } catch (error) {
      console.error('[QuizEditor] Error saving quiz:', error);
      alert('Error saving quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '2rem',
      backgroundColor: '#fff',
      marginTop: '2rem'
    }}>
      <h2>✏️ Review & Edit Your Quiz</h2>

      {/* Quiz Title & Description */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Quiz Title</label>
        <input
          type="text"
          value={edited.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Enter quiz title"
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
        <textarea
          value={edited.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Optional: Enter a brief description of the quiz"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            minHeight: '80px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Questions */}
      <div>
        <h3>Questions ({edited.questions.length})</h3>
        {edited.questions.map((question, qIndex) => (
          <div
            key={qIndex}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Question {qIndex + 1}</h4>
              {edited.questions.length > 1 && (
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            {/* Question Text */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Question Text</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Enter question text"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />

            {/* Options */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Options</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {question.options.map((option, optIndex) => (
                <div key={optIndex}>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: option === question.answer ? '2px solid #28a745' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      backgroundColor: option === question.answer ? '#d4edda' : 'white'
                    }}
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                    {option === question.answer && '✓ Correct Answer'}
                  </small>
                </div>
              ))}
            </div>

            {/* Correct Answer Selection */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mark Correct Answer</label>
            <select
              value={question.answer}
              onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Select Correct Answer --</option>
              {question.options.map((option, optIndex) => (
                <option key={optIndex} value={option}>
                  {option || `Option ${optIndex + 1}`}
                </option>
              ))}
            </select>

            {/* Explanation */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Explanation (Optional)</label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
              placeholder="Optional: Explain why this is the correct answer"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.95rem',
                minHeight: '60px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={addQuestion}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '2rem'
        }}
      >
        ➕ Add Another Question
      </button>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={saving || loading}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: saving || loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: saving || loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '4px',
            cursor: saving || loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            opacity: saving || loading ? 0.6 : 1
          }}
        >
          {saving || loading ? '⏳ Saving...' : '💾 Save Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizEditor;