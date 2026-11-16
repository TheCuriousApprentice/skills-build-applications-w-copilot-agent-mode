import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Suggestion {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason: string;
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getJson<{ suggestions: Suggestion[] }>('/api/workouts/suggestions/mona@example.com');
        setSuggestions(data.suggestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout suggestions');
      }
    };

    fetchSuggestions();
  }, []);

  if (error) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Workout suggestions</h2>
          <div role="alert" className="alert alert-danger">
            Unable to load workout suggestions: {error}
          </div>
        </div>
      </section>
    );
  }

  if (suggestions === null) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Workout suggestions</h2>
          <p role="status">Loading workout suggestions...</p>
        </div>
      </section>
    );
  }

  if (suggestions.length === 0) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Workout suggestions</h2>
          <p>No workout suggestions available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <div className="list-group">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">{suggestion.title}</h5>
                  <p className="mb-1">{suggestion.reason}</p>
                  <div className="small text-muted">
                    {suggestion.focus && <span>Focus: {suggestion.focus}</span>}
                    {suggestion.minutes && <span className="ms-2">Duration: {suggestion.minutes} min</span>}
                    {suggestion.difficulty && <span className="ms-2">Difficulty: {suggestion.difficulty}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
