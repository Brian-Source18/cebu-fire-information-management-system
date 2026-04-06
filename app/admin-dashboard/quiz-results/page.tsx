'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface QuizResult {
  id: number;
  user: number;
  username: string;
  score: number;
  total_questions: number;
  passed: boolean;
  completed_at: string;
}

export default function QuizResultsManagement() {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/admin/quiz-results/mark_all_read/', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/admin/quiz-results/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Quiz results data:', data);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this quiz result?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://localhost:8000/api/admin/quiz-results/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchResults();
    } catch (error) {
      console.error('Error deleting quiz result:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Quiz Results Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {results.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No quiz results found</div>
        ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total Questions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id}>
                <td className="px-6 py-4 text-gray-800">{result.username}</td>
                <td className="px-6 py-4 text-gray-600">{result.score}</td>
                <td className="px-6 py-4 text-gray-600">{result.total_questions}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.passed ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{new Date(result.completed_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(result.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
