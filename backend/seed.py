import random
import sys
from faker import Faker
from app import app, db, User, Problem, Tag, Platform, Difficulty

# --- Configuration ---
NUM_PROBLEMS = 250  # Default number of problems to create
USER_EMAIL = 'test@gmail.com' # Default user to add problems to

# --- Sample Data ---
fake = Faker()

SAMPLE_TAGS = [
    "array", "hash table", "linked list", "math", "two pointers", "string",
    "binary search", "divide and conquer", "dynamic programming", "backtracking",
    "stack", "heap", "queue", "graph", "tree", "binary search tree", "trie",
    "bit manipulation", "matrix", "sorting", "greedy", "recursion", "brainteaser",
    "geometry", "combinatorics", "data structures", "constructive algorithms",
    "brute force", "number theory", "dfs", "bfs"
]

SAMPLE_PLATFORMS = [
    "LeetCode", "HackerRank", "Codeforces", "TopCoder", "AtCoder", "CodeChef"
]

def get_or_create(model, **kwargs):
    """Gets an object or creates it if it doesn't exist."""
    instance = db.session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    else:
        instance = model(**kwargs)
        db.session.add(instance)
        # Flush to get the ID for relationships, but don't commit yet
        db.session.flush()
        return instance

def seed_data(user_email, num_problems):
    """
    Seeds the database with sample problems for a specific user.
    """
    with app.app_context():
        print(f"Starting to seed data for user: {user_email}")

        user = db.session.query(User).filter_by(email=user_email).first()

        if not user:
            print(f"Error: User with email '{user_email}' not found.")
            print("Please register the user first before running the seed script.")
            return

        print(f"Found user: {user.username}. Proceeding to generate {num_problems} problems...")

        for i in range(num_problems):
            # --- Create Problem Details ---
            title = fake.bs().replace(' ', '-').capitalize() + " " + fake.bs().replace(' ', '-').capitalize()
            url = f"https://{random.choice(SAMPLE_PLATFORMS).lower()}.com/problems/{title.lower().replace(' ', '-')}"
            logic = fake.paragraph(nb_sentences=random.randint(3, 7))
            notes = fake.paragraph(nb_sentences=random.randint(2, 5))
            
            # --- Get or Create Platform ---
            platform_name = random.choice(SAMPLE_PLATFORMS)
            platform = get_or_create(Platform, name=platform_name)

            # --- Get or Create Difficulty ---
            difficulty_rating = random.randrange(800, 3500, 100)
            difficulty_str = f"{difficulty_rating}+"
            difficulty = get_or_create(Difficulty, level=difficulty_str)
            
            # --- Get or Create Tags ---
            num_tags = random.randint(1, 4)
            problem_tags = []
            for _ in range(num_tags):
                tag_name = random.choice(SAMPLE_TAGS)
                tag = get_or_create(Tag, name=tag_name)
                if tag not in problem_tags:
                    problem_tags.append(tag)

            # --- Create Problem ---
            new_problem = Problem(
                title=title,
                url=url,
                logic=logic,
                notes=notes,
                user_id=user.id,
                platform_id=platform.id,
                difficulty_id=difficulty.id
            )
            new_problem.tags.extend(problem_tags)
            db.session.add(new_problem)

            # Print progress
            if (i + 1) % 25 == 0:
                print(f"  Generated {i + 1}/{num_problems} problems...")

        # --- Commit all changes to the DB ---
        print("Committing all new problems to the database...")
        db.session.commit()
        print("Seeding complete!")


if __name__ == '__main__':
    # Allow overriding defaults from command line
    email = sys.argv[1] if len(sys.argv) > 1 else USER_EMAIL
    count = int(sys.argv[2]) if len(sys.argv) > 2 else NUM_PROBLEMS
    
    seed_data(email, count) 