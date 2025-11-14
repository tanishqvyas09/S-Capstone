import { useState } from 'react';
import type { Quiz } from '../types/index';

interface EditorQuestion {
  question: string;
  options: string[];
  answer: string;
  type?: 'mcq' | 'tf' | 'fill';
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
          explanation: '',
          type: 'mcq'
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

      const type = q.type || 'mcq';
      if (type === 'mcq') {
        if (!q.options || q.options.length < 2) {
          alert(`Question ${i + 1}: MCQ must have at least 2 options`);
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          alert(`Question ${i + 1}: Please fill in all options for MCQ`);
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
      } else if (type === 'tf') {
        // True/False
        if (!q.answer.trim()) {
          alert(`Question ${i + 1}: Please select True or False as the correct answer`);
          return;
        }
        if (!['True', 'False'].includes(q.answer)) {
          alert(`Question ${i + 1}: Correct answer for True/False must be 'True' or 'False'`);
          return;
        }
      } else if (type === 'fill') {
        // Fill ups require an answer string
        if (!q.answer.trim()) {
          alert(`Question ${i + 1}: Please provide the correct answer for the fill-up`);
          return;
        }
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
      border: '1px solid rgba(20, 184, 166, 0.2)',
      borderRadius: '16px',
      padding: '2rem',
      background: 'rgba(30, 30, 30, 0.6)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      marginTop: '2rem'
    }}>
      <h2 style={{
        color: '#14B8A6',
        fontSize: '1.75rem',
        fontWeight: 600,
        marginBottom: '1.5rem'
      }}>✏️ Review & Edit Your Quiz</h2>

      {/* Quiz Title & Description */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(20, 20, 20, 0.4)', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.1)' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>Quiz Title</label>
        <input
          type="text"
          value={edited.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Enter quiz title"
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'rgba(10, 10, 10, 0.5)',
            color: 'white',
            outline: 'none'
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>Description</label>
        <textarea
          value={edited.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Optional: Enter a brief description of the quiz"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '8px',
            fontSize: '1rem',
            minHeight: '80px',
            fontFamily: 'inherit',
            background: 'rgba(10, 10, 10, 0.5)',
            color: 'white',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Questions */}
      <div>
        <h3 style={{
          color: '#F59E0B',
          fontSize: '1.4rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}>Questions ({edited.questions.length})</h3>
        {edited.questions.map((question, qIndex) => (
          <div
            key={qIndex}
            style={{
              marginBottom: '1.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              background: 'rgba(20, 20, 20, 0.4)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#F59E0B', fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Question {qIndex + 1}</h4>
              {edited.questions.length > 1 && (
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            {/* Question Text */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Question Text</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Enter question text"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'rgba(10, 10, 10, 0.5)',
                color: 'white',
                outline: 'none'
              }}
            />

            {/* Question Type */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Question Type</label>
            <select value={question.type || 'mcq'} onChange={(e) => {
              const newType = e.target.value as 'mcq' | 'tf' | 'fill';
              // Update question type and adjust options/answer accordingly
              if (newType === 'tf') {
                updateQuestion(qIndex, 'type', 'tf');
                updateQuestion(qIndex, 'options', ['True', 'False']);
                if (!['True', 'False'].includes(question.answer)) updateQuestion(qIndex, 'answer', '');
              } else if (newType === 'fill') {
                updateQuestion(qIndex, 'type', 'fill');
                updateQuestion(qIndex, 'options', []);
                // keep answer as text
              } else {
                updateQuestion(qIndex, 'type', 'mcq');
                updateQuestion(qIndex, 'options', question.options && question.options.length >= 2 ? question.options : ['', '', '', '']);
                if (!question.options.includes(question.answer)) updateQuestion(qIndex, 'answer', '');
              }
            }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.3)', marginBottom: '0.75rem', background: 'rgba(10, 10, 10, 0.5)', color: 'white', fontSize: '0.95rem', outline: 'none' }}>
              <option value="mcq">MCQ</option>
              <option value="tf">True / False</option>
              <option value="fill">Fill Up</option>
            </select>

            {/* Options area for MCQ and TF */}
            {(question.type === 'mcq' || !question.type) && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Options</label>
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
                          border: option === question.answer ? '2px solid #14B8A6' : '1px solid rgba(20, 184, 166, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          background: option === question.answer ? 'rgba(20, 184, 166, 0.15)' : 'rgba(10, 10, 10, 0.5)',
                          color: 'white',
                          outline: 'none',
                          boxShadow: option === question.answer ? '0 0 0 3px rgba(20, 184, 166, 0.1)' : 'none'
                        }}
                      />
                      <small style={{ color: option === question.answer ? '#14B8A6' : 'rgba(255, 255, 255, 0.5)', display: 'block', marginTop: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        {option === question.answer && '✓ Correct Answer'}
                      </small>
                    </div>
                  ))}
                </div>

                {/* Correct Answer Selection */}
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Mark Correct Answer</label>
                <select
                  value={question.answer}
                  onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'rgba(10, 10, 10, 0.5)',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Select Correct Answer --</option>
                  {question.options.map((option, optIndex) => (
                    <option key={optIndex} value={option}>
                      {option || `Option ${optIndex + 1}`}
                    </option>
                  ))}
                </select>
              </>
            )}

            {question.type === 'tf' && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Mark Correct Answer</label>
                <select value={question.answer} onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px', background: 'rgba(10, 10, 10, 0.5)', color: 'white', outline: 'none' }}>
                  <option value="">-- Select --</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </>
            )}

            {question.type === 'fill' && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Correct Answer</label>
                <input type="text" value={question.answer} onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)} placeholder="Correct answer text" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px', background: 'rgba(10, 10, 10, 0.5)', color: 'white', outline: 'none' }} />
              </>
            )}

            {/* Explanation */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Explanation (Optional)</label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
              placeholder="Optional: Explain why this is the correct answer"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                minHeight: '60px',
                fontFamily: 'inherit',
                background: 'rgba(10, 10, 10, 0.5)',
                color: 'white',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={addQuestion}
        style={{
          background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
          transition: 'all 0.3s ease'
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
              background: 'rgba(108, 117, 125, 0.2)',
              border: '1px solid rgba(108, 117, 125, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: saving || loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              opacity: saving || loading ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            background: (saving || loading) ? 'rgba(245, 158, 11, 0.3)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: saving || loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: (saving || loading) ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)',
            opacity: saving || loading ? 0.6 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {saving || loading ? '⏳ Saving...' : '💾 Save Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizEditor;