# Database models for our application
from datetime import datetime

class Exam:
    def __init__(self, title, duration, questions, created_by):
        self.title = title
        self.duration = duration  # in minutes
        self.questions = questions  # list of question objects
        self.created_by = created_by
        self.created_at = datetime.now()

class Question:
    def __init__(self, text, options, correct_answer, question_type="mcq"):
        self.text = text
        self.options = options  # list of choices
        self.correct_answer = correct_answer  # index of correct option
        self.question_type = question_type