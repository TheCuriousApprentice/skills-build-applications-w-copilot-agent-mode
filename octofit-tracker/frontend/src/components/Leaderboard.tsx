import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardEntry {
  teamName: string;
  totalPoints: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
        setLeaderboard(data.leaderboard);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      }
    };

    fetchLeaderboard();
  }, []);

  if (error) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Leaderboard</h2>
          <div role="alert" className="alert alert-danger">
            Unable to load leaderboard: {error}
          </div>
        </div>
      </section>
    );
  }

  if (leaderboard === null) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Leaderboard</h2>
          <p role="status">Loading leaderboard...</p>
        </div>
      </section>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Leaderboard</h2>
          <p>No leaderboard rankings available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.rank}>
                <td>{entry.rank}</td>
                <td>{entry.teamName}</td>
                <td>{entry.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
