import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';

const ExamList = ({ onSelectExam }) => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    // 🔍 Filter exams
    const filtered = exams.filter(exam =>
      exam.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [search, exams]);

  const loadExams = async () => {
    try {
      const response = await studentAPI.getPublishedExams();
      setExams(response.data);
      setFilteredExams(response.data);
    } catch (error) {
      setError('Failed to load exams. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h3>⏳ Loading Exams...</h3>
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
      <h3>Error</h3>
      <p>{error}</p>
      <button onClick={loadExams}>Retry</button>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f1f5f9' }}>
      
      <h2 style={{ textAlign: 'center' }}>📝 Available Exams</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          margin: '15px 0',
          borderRadius: '6px',
          border: '1px solid #ccc'
        }}
      />

      {filteredExams.length === 0 ? (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '10px'
        }}>
          <h3>No Exams Found</h3>
        </div>
      ) : (
        filteredExams.map(exam => (
          <div key={exam.id} style={{
            padding: '20px',
            marginBottom: '15px',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2563eb' }}>{exam.title}</h3>
            <p style={{ color: '#555' }}>{exam.description}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p>⏱️ {exam.duration_minutes} mins</p>
                <p>❓ {exam.question_count || 'Multiple'} questions</p>
              </div>

              <button
                onClick={() => onSelectExam(exam.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Start Exam 🚀
              </button>
            </div>
          </div>
        ))
      )}

      {/* 🔄 Refresh */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={loadExams}
          style={{
            padding: '10px 20px',
            backgroundColor: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          Refresh 🔄
        </button>
      </div>
    </div>
  );
};

export default ExamList;