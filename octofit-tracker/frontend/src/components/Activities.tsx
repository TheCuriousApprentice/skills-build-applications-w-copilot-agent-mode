import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  type: string;
  minutes: number;
  points: number;
  user?: string;
  team?: string;
  occurredAt?: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getJson<{ activities: Activity[] }>('/api/activities');
        setActivities(data.activities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      }
    };

    fetchActivities();
  }, []);

  if (error) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <div role="alert" className="alert alert-danger">
            Unable to load activities: {error}
          </div>
        </div>
      </section>
    );
  }

  if (activities === null) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <p role="status">Loading activities...</p>
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="card">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <p>No activities yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Minutes</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={index}>
                <td>{activity.type}</td>
                <td>{activity.minutes}</td>
                <td>{activity.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
