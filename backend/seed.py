"""
Seed script for PostureTrek – a posture / fitness tracking app.
Populates movement_sessions and movement_rep_logs with realistic dummy data.
"""
from datetime import datetime, timedelta
import random
from app import app
from models import db, User, MovementSession, MovementRepLog

EXERCISES = ['squat', 'push_up', 'lunge', 'plank', 'bicep_curl', 'shoulder_press']

ERROR_LABELS = {
    'squat':          ['knees_caving', 'forward_lean', 'shallow_depth'],
    'push_up':        ['sagging_hips', 'flared_elbows', 'incomplete_range'],
    'lunge':          ['knee_past_toe', 'torso_lean', 'unstable_landing'],
    'plank':          ['hip_drop', 'shoulder_shrug', 'head_drop'],
    'bicep_curl':     ['swinging_back', 'incomplete_curl', 'wrist_bend'],
    'shoulder_press': ['arched_back', 'uneven_lift', 'incomplete_lockout'],
}


def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()

        print("Seeding users...")
        users_data = [
            {"name": "Arjun Mehta",   "email": "arjun@postretrek.io",  "role": "athlete"},
            {"name": "Priya Kapoor",  "email": "priya@postretrek.io",  "role": "athlete"},
            {"name": "Dev Sharma",    "email": "dev@postretrek.io",    "role": "athlete"},
            {"name": "Neha Singh",    "email": "neha@postretrek.io",   "role": "athlete"},
            {"name": "Rohan Verma",   "email": "rohan@postretrek.io",  "role": "athlete"},
        ]
        users = []
        for u in users_data:
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash="pbkdf2:sha256:dummy",
                role=u["role"],
            )
            db.session.add(user)
            users.append(user)
        db.session.commit()

        print("Seeding movement sessions and rep logs...")
        now = datetime.utcnow()

        for user in users:
            # Each user gets 8–14 sessions spread over the last 30 days
            num_sessions = random.randint(8, 14)
            for _ in range(num_sessions):
                exercise = random.choice(EXERCISES)
                days_ago  = random.randint(0, 30)
                started   = now - timedelta(days=days_ago,
                                            hours=random.randint(0, 20),
                                            minutes=random.randint(0, 59))
                duration_min = random.randint(5, 25)
                ended = started + timedelta(minutes=duration_min)

                total_reps   = random.randint(10, 40)
                correct_reps = random.randint(int(total_reps * 0.6), total_reps)
                incorrect    = total_reps - correct_reps
                accuracy     = round((correct_reps / total_reps) * 100, 1)

                session = MovementSession(
                    user_id=user.id,
                    exercise_type=exercise,
                    started_at=started,
                    ended_at=ended,
                    total_reps=total_reps,
                    correct_reps=correct_reps,
                    incorrect_reps=incorrect,
                    accuracy=accuracy,
                    ai_summary=(
                        f"Good session! {correct_reps}/{total_reps} reps were correct. "
                        f"Focus on reducing {random.choice(ERROR_LABELS[exercise])} next time."
                        if incorrect > 0 else
                        f"Perfect session! All {total_reps} reps were correct. Keep it up!"
                    ),
                )
                db.session.add(session)
                db.session.flush()

                # Rep-level logs
                possible_errors = ERROR_LABELS[exercise]
                for rep_num in range(1, total_reps + 1):
                    is_correct = rep_num <= correct_reps
                    rep_log = MovementRepLog(
                        session_id=session.id,
                        rep_number=rep_num,
                        correct=is_correct,
                        errors="" if is_correct else random.choice(possible_errors),
                        min_angle=round(random.uniform(60, 120), 1),
                        timestamp=started + timedelta(seconds=rep_num * random.randint(3, 8)),
                    )
                    db.session.add(rep_log)

        db.session.commit()
        print("Database successfully seeded with PostureTrek fitness data!")


if __name__ == "__main__":
    seed_database()