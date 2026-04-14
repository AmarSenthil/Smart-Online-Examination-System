import React, { useState } from 'react';
import { teacherAPI } from '../../services/api';

const CreateExam = ({ teacherId }) => {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    created_by: teacherId,
    is_published: true,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correct_answer: 0
  });

  // ✅ Add Question
  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      alert('Enter question text!');
      return;
    }

    if (currentQuestion.options.some(opt => opt.trim() === '')) {
      alert('Fill all options!');
      return;
    }

    setExamData({
      ...examData,
      questions: [...examData.questions, { ...currentQuestion }]
    });

    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correct_answer: 0
    });
  };

  // ❌ Delete Question (NEW)
  const deleteQuestion = (index) => {
    const updated = examData.questions.filter((_, i) => i !== index);
    setExamData({ ...examData, questions: updated });
  };

  // 🚀 Create Exam
  const createExam = async () => {
    if (!examData.title.trim()) {
      alert('Enter exam title!');
      return;
    }

    if (examData.questions.length === 0) {
      alert('Add at least one question!');
      return;
    }

    try {
      const response = await teacherAPI.createExam(examData);
      alert(`✅ Exam Created! ID: ${response.data.exam_id}`);

      // Reset
      setExamData({
        title: '',
        description: '',
        duration_minutes: 30,
        created_by: teacherId,
        is_published: true,
        questions: []
      });

    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f1f5f9' }}>
      
      <h2 style={{ textAlign: 'center' }}>🎓 Create New Exam</h2>

      {/* Exam Details */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Exam Title"
          value={examData.title}
          onChange={(e) => setExamData({ ...examData, title: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px' }}
        />

        <textarea
          placeholder="Exam Description"
          value={examData.description}
          onChange={(e) => setExamData({ ...examData, description: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px' }}
        />

        <input
          type="number"
          value={examData.duration_minutes}
          onChange={(e) => setExamData({ ...examData, duration_minutes: parseInt(e.target.value) })}
          style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
        />
      </div>

      {/* Add Question */}
      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Add Question</h3>

        <textarea
          placeholder="Question Text"
          value={currentQuestion.text}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        {currentQuestion.options.map((option, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="radio"
              checked={currentQuestion.correct_answer === index}
              onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: index })}
            />

            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...currentQuestion.options];
                newOptions[index] = e.target.value;
                setCurrentQuestion({ ...currentQuestion, options: newOptions });
              }}
              style={{ marginLeft: '10px', padding: '8px', width: '80%' }}
            />
          </div>
        ))}

        <button
          onClick={addQuestion}
          style={{
            padding: '10px 20px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          Add Question ➕
        </button>
      </div>

      {/* Question List */}
      <div>
        <h3>Questions ({examData.questions.length})</h3>

        {examData.questions.map((q, index) => (
          <div key={index} style={{
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            <p><strong>Q{index + 1}:</strong> {q.text}</p>
            <p>Correct: Option {q.correct_answer + 1}</p>

            <button
              onClick={() => deleteQuestion(index)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px'
              }}
            >
              Delete ❌
            </button>
          </div>
        ))}
      </div>

      {/* Create Exam */}
      <button
        onClick={createExam}
        disabled={examData.questions.length === 0}
        style={{
          width: '100%',
          padding: '15px',
          marginTop: '20px',
          backgroundColor: examData.questions.length === 0 ? '#ccc' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px'
        }}
      >
        Create Exam 🚀
      </button>

    </div>
  );
};

export default CreateExam;