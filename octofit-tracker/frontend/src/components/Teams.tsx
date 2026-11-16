import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  name: string;
  mascot?: string;
  members?: string[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getJson<{ teams: Team[] }>('/api/teams');
        setTeams(data.teams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teams');
      }
    };

    fetchTeams();
  }, []);

  if (error) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Teams</h2>
          <div role="alert" className="alert alert-danger">
            Unable to load teams: {error}
          </div>
        </div>
      </section>
    );
  }

  if (teams === null) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Teams</h2>
          <p role="status">Loading teams...</p>
        </div>
      </section>
    );
  }

  if (teams.length === 0) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Teams</h2>
          <p>No teams yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <div className="list-group">
          {teams.map((team, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">{team.name}</h5>
                  {team.mascot && <p className="mb-1 small">Mascot: {team.mascot}</p>}
                  {team.members && team.members.length > 0 && (
                    <p className="mb-0 small text-muted">{team.members.length} member(s)</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
