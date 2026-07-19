from extensions import db
from datetime import datetime
import json

class Dataset(db.Model):
    __tablename__ = 'datasets'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    records = db.Column(db.Integer, nullable=False, default=0)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to students
    students = db.relationship('Student', backref='dataset', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Dataset {self.filename}>"

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(100), nullable=True) # ID from the CSV, if any
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'), nullable=False)
    
    # Demographic / general data can be stored as JSON for flexibility, or we map known columns
    demographics = db.Column(db.Text, nullable=True) # JSON string
    
    # Core tracked metrics
    sleep_hours = db.Column(db.Float, nullable=True)
    study_hours = db.Column(db.Float, nullable=True)
    stress_level = db.Column(db.Float, nullable=True)
    burnout_score = db.Column(db.Float, nullable=True)
    sentiment_score = db.Column(db.Float, nullable=True)
    risk = db.Column(db.String(50), nullable=True)
    
    def __repr__(self):
        return f"<Student {self.student_id or self.id} (Dataset {self.dataset_id})>"
        
    def to_dict(self):
        d = {
            'id': self.id,
            'student_id': self.student_id,
            'dataset_id': self.dataset_id,
            'sleep_hours': self.sleep_hours,
            'study_hours': self.study_hours,
            'stress_level': self.stress_level,
            'burnout_score': self.burnout_score,
            'sentiment_score': self.sentiment_score,
            'risk': self.risk
        }
        if self.demographics:
            try:
                demo_dict = json.loads(self.demographics)
                d.update(demo_dict)
            except:
                pass
        return d

class SessionState(db.Model):
    __tablename__ = 'session_states'

    id = db.Column(db.Integer, primary_key=True)
    session_uid = db.Column(db.String(255), nullable=False, index=True)
    state_key = db.Column(db.String(100), nullable=False)
    state_value = db.Column(db.Text, nullable=True) # JSON or serialized data
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('session_uid', 'state_key', name='_session_key_uc'),
    )

    def __repr__(self):
        return f"<SessionState {self.session_uid}:{self.state_key}>"
