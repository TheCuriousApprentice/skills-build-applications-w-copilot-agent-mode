import { Activity, Team, User, Workout } from '../models/index.js';
import { isValidObjectId } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = input as Record<string, unknown>;

  // Validate required fields
  if (!data.userId || !data.teamId || !data.type || data.minutes === undefined) {
    const error = new Error('Missing required fields: userId, teamId, type, minutes');
    Object.assign(error, { status: 400 });
    throw error;
  }

  // Validate ObjectId format
  if (!isValidObjectId(data.userId) || !isValidObjectId(data.teamId)) {
    const error = new Error('userId and teamId must be valid MongoDB ObjectIds');
    Object.assign(error, { status: 400 });
    throw error;
  }

  // Validate user and team exist
  const [user, team] = await Promise.all([
    User.findById(data.userId),
    Team.findById(data.teamId),
  ]);

  if (!user) {
    const error = new Error('User not found');
    Object.assign(error, { status: 404 });
    throw error;
  }

  if (!team) {
    const error = new Error('Team not found');
    Object.assign(error, { status: 404 });
    throw error;
  }

  // Compute points (1 point per minute)
  const points = (data.minutes as number);

  // Create activity with current timestamp
  const activity = await Activity.create({
    user: data.userId,
    team: data.teamId,
    type: data.type,
    minutes: data.minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const data = input as Record<string, unknown>;

  // Validate required name field
  if (!data.name) {
    const error = new Error('Team name is required');
    Object.assign(error, { status: 400 });
    throw error;
  }

  // Create team with provided members or empty array
  const team = await Team.create({
    name: data.name,
    mascot: data.mascot || '',
    members: (Array.isArray(data.members) ? data.members : []) as string[],
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const results = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $sort: { totalPoints: -1 },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    {
      $unwind: '$team',
    },
    {
      $project: {
        teamName: '$team.name',
        totalPoints: 1,
        _id: 0,
      },
    },
  ]);

  return results.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  // Find user by email
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    const error = new Error('User not found');
    Object.assign(error, { status: 404 });
    throw error;
  }

  // Get user's recent activities to find common focus area
  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();

  // Try to find workout based on recent activities or fitness goal
  let workout = null;
  let reason = '';

  if (recentActivities.length > 0) {
    // Find most common activity type
    const typeCounts: Record<string, number> = {};
    for (const activity of recentActivities) {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
    }
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Try to find workout matching the activity type or user's goal
    workout = await Workout.findOne({ $or: [{ focus: mostCommonType }, { focus: user.fitnessGoal }] }).lean();
    
    if (workout) {
      reason = `Matches your recent ${mostCommonType} activity`;
    }
  }

  // If no workout found from activities, try user's fitness goal
  if (!workout && user.fitnessGoal) {
    workout = await Workout.findOne({ focus: user.fitnessGoal }).lean();
    if (workout) {
      reason = `Matches your ${user.fitnessGoal} goal`;
    }
  }

  if (!workout) {
    return [];
  }

  return [
    {
      ...workout,
      reason,
    },
  ];
}

export { User };
