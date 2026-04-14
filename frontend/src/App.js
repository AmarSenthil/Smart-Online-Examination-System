import React, { useState } from 'react';
import CreateExam from './components/Teacher/CreateExam';
import ExamList from './components/Student/ExamList';
import ExamInterface from './components/Student/ExamInterface';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [examResult, setExamResult] = useState(null);

  // 🔥 UPDATED USER DATA
  const teacherId = "teacher_amarnath";
  const teacherName = "Amarnath";
  const studentId = "student_001"; 
  const studentName = "Student";

  const handleExamSelect = (examId) => {
    setSelectedExamId(examId);
    setCurrentView('takeExam');
  };

  const handleExamSubmit = (result) => {
    setExamResult(result);
    setCurrentView('examResult');
  };

  const handleBackToExams = () => {
    setSelectedExamId(null);
    setCurrentView('student');
  };

  const renderView = () => {
    switch (currentView) {

      case 'home':
        return (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
            
            <h1 style={{ color: '#03050a', fontSize: '2.5rem' }}>
              🎓 Online Examination System
            </h1>

            <p style={{ fontSize: '1.2rem', color: '#555' }}>
              Welcome {teacherName} 👋
            </p>

            <div style={{ marginTop: '40px' }}>
              <button 
                onClick={() => setCurrentView('teacher')}
                style={{ 
                  padding: '15px 30px', 
                  margin: '10px', 
                  backgroundColor: '#00143e', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                👨‍🏫 Teacher Dashboard
              </button>
              
              <button 
                onClick={() => setCurrentView('student')}
                style={{ 
                  padding: '15px 30px', 
                  margin: '10px', 
                  backgroundColor: '#76867c', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                👨‍🎓 Student Dashboard
              </button>
            </div>

            {/* Features */}
            <div style={{ 
              marginTop: '50px', 
              padding: '20px', 
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '50px auto'
            }}>
              <h3>🚀 System Features</h3>

              <ul style={{ textAlign: 'left' }}>
                <li>✔️ Create and manage exams</li>
                <li>✔️ Randomized questions</li>
                <li>✔️ Auto grading system</li>
                <li>✔️ Real-time exam timer</li>
              </ul>
            </div>
          </div>
        );

      case 'teacher':
        return (
          <div>
            <button onClick={() => setCurrentView('home')}>
              ← Back
            </button>

            <h3 style={{ textAlign: 'center' }}>
              Welcome {teacherName} 👨‍🏫
            </h3>

            <CreateExam teacherId={teacherId} />
          </div>
        );

      case 'student':
        return (
          <div>
            <button onClick={() => setCurrentView('home')}>
              ← Back
            </button>

            <ExamList onSelectExam={handleExamSelect} />
          </div>
        );

      case 'takeExam':
        return (
          <ExamInterface 
            examId={selectedExamId}
            studentId={studentId}
            studentName={studentName}
            onExamSubmit={handleExamSubmit}
            onBack={handleBackToExams}
          />
        );

      case 'examResult':
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            
            <h2 style={{ color: '#22c55e' }}>
              🎉 Exam Submitted!
            </h2>

            {examResult && (
              <div style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '10px',
                margin: '20px auto',
                maxWidth: '400px'
              }}>
                <p><strong>Score:</strong> {examResult.score}/{examResult.total_questions}</p>
                <p><strong>Percentage:</strong> {examResult.percentage}%</p>
                <p><strong>Grade:</strong> {examResult.grade}</p>
              </div>
            )}

            <button onClick={() => setCurrentView('student')}>
              Take Another Exam
            </button>

          </div>
        );

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;