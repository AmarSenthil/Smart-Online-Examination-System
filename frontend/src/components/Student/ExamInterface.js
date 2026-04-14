import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';

const ExamInterface = ({ examId, studentId, studentName, onExamSubmit, onBack }) => {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 🔥 Shuffle function (NEW)
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    loadExam();
  }, [examId]);

  useEffect(() => {
    if (exam && exam.duration_minutes) {
      setTimeLeft(exam.duration_minutes * 60);
    }
  }, [exam]);

  // 🔥 Improved Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && exam) {
      autoSubmitExam();
    }
  }, [timeLeft]);

  const loadExam = async () => {
    try {
      const response = await studentAPI.getExam(examId);

      // 🔥 Shuffle questions (NEW FEATURE)
      const shuffledQuestions = shuffleArray(response.data.questions);

      setExam({
        ...response.data,
        questions: shuffledQuestions
      });

    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Error loading exam: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    });
  };

  const autoSubmitExam = async () => {
    alert('⏱️ Time is up! Submitting your exam automatically.');
    await submitExam();
  };

  const submitExam = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const startTime = exam.duration_minutes * 60;
      const timeTaken = startTime - timeLeft;

      const submissionData = {
        student_id: studentId,
        student_name: studentName,
        answers: answers,
        time_taken: Math.floor(timeTaken / 60)
      };

      const response = await studentAPI.submitExam(examId, submissionData);
      onExamSubmit(response.data);

    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error submitting exam: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateProgress = () => {
    if (!exam) return 0;
    return (Object.keys(answers).length / exam.questions.length) * 100;
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h3>Loading Exam...</h3>
      <p>Please wait while we load your exam.</p>
    </div>
  );

  if (!exam) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h3>Exam Not Found</h3>
      <p>The requested exam could not be loaded.</p>
      <button onClick={onBack}>Back to Exam List</button>
    </div>
  );

  const isWarning = timeLeft < 300; // 🔥 last 5 mins warning

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f1f5f9' }}>
      
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        padding: '15px',
        borderBottom: '2px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#007bff' }}>{exam.title}</h2>
          <p style={{ margin: 0, color: '#666' }}>{exam.description}</p>
        </div>

        {/* 🔥 Timer */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: isWarning ? 'red' : '#28a745',
          padding: '10px 15px',
          border: `2px solid ${isWarning ? 'red' : '#28a745'}`,
          borderRadius: '5px'
        }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div style={{
        margin: '15px 0',
        padding: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '5px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Answered: {Object.keys(answers).length}/{exam.questions.length}</span>
          <span>{Math.round(calculateProgress())}%</span>
        </div>
      </div>

      {/* Questions */}
      <div>
        {exam.questions.map((question, qIndex) => (
          <div key={qIndex} style={{
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <h4>Q{qIndex + 1}. {question.text}</h4>

            {question.options.map((option, oIndex) => (
              <div key={oIndex}
                onClick={() => handleAnswerSelect(qIndex, oIndex)}
                style={{
                  padding: '10px',
                  margin: '8px 0',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: answers[qIndex] === oIndex ? '#dbeafe' : 'white',
                  cursor: 'pointer'
                }}>
                <input
                  type="radio"
                  checked={answers[qIndex] === oIndex}
                  onChange={() => handleAnswerSelect(qIndex, oIndex)}
                />
                {' '}{option}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={submitExam}
          disabled={submitting}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: submitting ? '#6c757d' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}>
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

    </div>
  );
};

export default ExamInterface;