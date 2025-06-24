import os
import csv
import io
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)

# --- CORS Configuration ---
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)

# --- Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions ---
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Models ---
# Association table for the many-to-many relationship between problems and tags
problem_tags = db.Table('problem_tags',
    db.Column('problem_id', db.Integer, db.ForeignKey('problem.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Platform(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Difficulty(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.String(50), unique=True, nullable=False)

class CodingProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    platform_name = db.Column(db.String(50), nullable=False)
    profile_url = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Problem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    logic = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    revisit = db.Column(db.Boolean, default=False, nullable=False)
    
    platform_id = db.Column(db.Integer, db.ForeignKey('platform.id'), nullable=False)
    platform = db.relationship('Platform', backref='problems')

    difficulty_id = db.Column(db.Integer, db.ForeignKey('difficulty.id'), nullable=False)
    difficulty = db.relationship('Difficulty', backref='problems')

    tags = db.relationship('Tag', secondary=problem_tags, lazy='subquery',
                           backref=db.backref('problems', lazy=True))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    problems = db.relationship('Problem', backref='user', lazy=True)
    coding_profiles = db.relationship('CodingProfile', backref='user', lazy=True)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# --- Database Initialization ---
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({"msg": "Missing username, email, or password"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"msg": "Username or email already exists"}), 400

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.email)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad email or password"}), 401

@app.route('/api/tags', methods=['GET'])
@jwt_required()
def get_tags():
    tags = Tag.query.all()
    return jsonify([tag.name for tag in tags]), 200

@app.route('/api/platforms', methods=['GET'])
@jwt_required()
def get_platforms():
    platforms = Platform.query.all()
    return jsonify([p.name for p in platforms]), 200

@app.route('/api/difficulties', methods=['GET'])
@jwt_required()
def get_difficulties():
    difficulties = Difficulty.query.all()
    return jsonify([d.level for d in difficulties]), 200

@app.route('/api/problems', methods=['GET', 'POST'])
@jwt_required()
def handle_problems():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    if request.method == 'POST':
        data = request.get_json()

        # Find or create Platform
        platform_name = data.get('platform')
        platform = Platform.query.filter_by(name=platform_name).first()
        if not platform:
            platform = Platform(name=platform_name)
            db.session.add(platform)

        # Find or create Difficulty
        difficulty_level = data.get('difficulty')
        difficulty = Difficulty.query.filter_by(level=difficulty_level).first()
        if not difficulty:
            difficulty = Difficulty(level=difficulty_level)
            db.session.add(difficulty)

        # Find or create tags
        tag_objects = []
        for tag_name in data.get('tags', []):
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            tag_objects.append(tag)
        
        db.session.commit()

        new_problem = Problem(
            title=data['title'],
            url=data['url'],
            logic=data.get('logic'),
            notes=data.get('notes'),
            user_id=user.id,
            platform_id=platform.id,
            difficulty_id=difficulty.id,
            tags=tag_objects
        )

        db.session.add(new_problem)
        db.session.commit()

        return jsonify({"msg": "Problem added successfully"}), 201

    if request.method == 'GET':
        problems = Problem.query.filter_by(user_id=user.id).order_by(Problem.id.desc()).all()
        
        problems_data = []
        for p in problems:
            problems_data.append({
                'id': p.id,
                'title': p.title,
                'url': p.url,
                'platform': p.platform.name,
                'difficulty': p.difficulty.level,
                'logic': p.logic,
                'notes': p.notes,
                'tags': [tag.name for tag in p.tags],
                'revisit': p.revisit
            })

        return jsonify(problems_data), 200

@app.route('/api/problems/export', methods=['GET'])
@jwt_required()
def export_problems():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    problems = Problem.query.filter_by(user_id=user.id).order_by(Problem.id.desc()).all()

    # Create a string buffer to hold CSV data
    output = io.StringIO()
    writer = csv.writer(output)

    # Write the header
    writer.writerow(['Title', 'URL', 'Platform', 'Difficulty', 'Tags', 'Logic', 'Notes', 'Revisit'])

    # Write the data
    for p in problems:
        tags_str = ", ".join([tag.name for tag in p.tags])
        writer.writerow([p.title, p.url, p.platform.name, p.difficulty.level, tags_str, p.logic, p.notes, p.revisit])

    # Get the CSV data from the buffer
    csv_data = output.getvalue()
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=problems.csv"}
    )

@app.route('/api/problems/<int:problem_id>/toggle_revisit', methods=['PUT'])
@jwt_required()
def toggle_revisit(problem_id):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    problem = Problem.query.get(problem_id)

    if not problem:
        return jsonify({"msg": "Problem not found"}), 404

    if problem.user_id != user.id:
        return jsonify({"msg": "Unauthorized"}), 403

    problem.revisit = not problem.revisit
    db.session.commit()
    
    return jsonify({"msg": "Revisit status toggled", "revisit_status": problem.revisit}), 200

@app.route('/api/problems/<int:problem_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def handle_single_problem(problem_id):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    problem = Problem.query.get(problem_id)

    if not problem:
        return jsonify({"msg": "Problem not found"}), 404

    if problem.user_id != user.id:
        return jsonify({"msg": "Unauthorized"}), 403

    if request.method == 'PUT':
        data = request.get_json()
        problem.logic = data.get('logic', problem.logic)
        problem.notes = data.get('notes', problem.notes)
        db.session.commit()
        return jsonify({"msg": "Problem updated successfully"}), 200

    if request.method == 'DELETE':
        db.session.delete(problem)
        db.session.commit()
        return jsonify({"msg": "Problem deleted successfully"}), 200

@app.route('/api/profile', methods=['GET', 'POST'])
@jwt_required()
def handle_profile():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    if request.method == 'GET':
        profiles = CodingProfile.query.filter_by(user_id=user.id).all()
        profiles_data = [
            {'platform_name': p.platform_name, 'profile_url': p.profile_url}
            for p in profiles
        ]
        return jsonify({
            'username': user.username,
            'email': user.email,
            'profiles': profiles_data
        }), 200
    
    if request.method == 'POST':
        data = request.get_json()
        profiles_data = data.get('profiles', [])

        # Delete existing profiles for simplicity
        CodingProfile.query.filter_by(user_id=user.id).delete()

        for p_data in profiles_data:
            if 'platform_name' in p_data and 'profile_url' in p_data:
                new_profile = CodingProfile(
                    platform_name=p_data['platform_name'],
                    profile_url=p_data['profile_url'],
                    user_id=user.id
                )
                db.session.add(new_profile)
        
        db.session.commit()
        return jsonify({'msg': 'Profile updated successfully'}), 200

@app.route('/api/hello')
def hello_world():
    return {'message': 'Hello from Flask!'}

if __name__ == '__main__':
    app.run(debug=True, port=5001) 