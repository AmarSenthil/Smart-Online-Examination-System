from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()
routes = Blueprint('routes', __name__)

print("✅ Loading all exam routes...")

# ==================== TEACHER ROUTES ====================

# 1. Create a new exam
@routes.route('/exams', methods=['POST'])
def create_exam():
    try:
        data = request.get_json()
        print(f"📝 Creating exam: {data['title']}")
        
        exam_data = {
            'title': data['title'],
            'description': data.get('description', ''),
            'duration_minutes': data['duration_minutes'],
            'questions': data['questions'],
            'created_by': data['created_by'],
            'created_at': firestore.SERVER_TIMESTAMP,
            'is_published': data.get('is_published', True),
            'total_questions': len(data['questions'])
        }
        
        # Add to Firestore
        exam_ref = db.collection('exams').document()
        exam_ref.set(exam_data)
        
        return jsonify({
            "message": "Exam created successfully!",
            "exam_id": exam_ref.id,
            "total_questions": len(data['questions'])
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating exam: {e}")
        return jsonify({"error": str(e)}), 400

# 2. Get all exams for a teacher
@routes.route('/exams/teacher/<teacher_id>', methods=['GET'])
def get_teacher_exams(teacher_id):
    try:
        exams_ref = db.collection('exams').where('created_by', '==', teacher_id)
        docs = exams_ref.stream()
        
        exams = []
        for doc in docs:
            exam_data = doc.to_dict()
            exam_data['id'] = doc.id
            # Convert timestamp for JSON
            if 'created_at' in exam_data:
                exam_data['created_at'] = exam_data['created_at'].isoformat()
            exams.append(exam_data)
            
        print(f"📊 Found {len(exams)} exams for teacher {teacher_id}")
        return jsonify(exams), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. Publish/Unpublish exam
@routes.route('/exams/<exam_id>/publish', methods=['PUT'])
def toggle_publish_exam(exam_id):
    try:
        data = request.get_json()
        publish_status = data.get('is_published', True)
        
        exam_ref = db.collection('exams').document(exam_id)
        exam_ref.update({'is_published': publish_status})
        
        action = "published" if publish_status else "unpublished"
        return jsonify({"message": f"Exam {action} successfully!"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== STUDENT ROUTES ====================

# 4. Get all published exams (for students)
@routes.route('/exams', methods=['GET'])
def get_published_exams():
    try:
        exams_ref = db.collection('exams').where('is_published', '==', True)
        docs = exams_ref.stream()
        
        exams = []
        for doc in docs:
            exam_data = doc.to_dict()
            # Don't send questions to student in list view (for security)
            if 'questions' in exam_data:
                # Only send question count, not the actual questions
                exam_data['question_count'] = len(exam_data['questions'])
                del exam_data['questions']
            exam_data['id'] = doc.id
            exams.append(exam_data)
            
        print(f"🎓 Found {len(exams)} published exams for students")
        return jsonify(exams), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. Get specific exam for attempting (without answers)
@routes.route('/exams/<exam_id>', methods=['GET'])
def get_exam_for_student(exam_id):
    try:
        exam_ref = db.collection('exams').document(exam_id)
        exam_doc = exam_ref.get()
        
        if not exam_doc.exists:
            return jsonify({"error": "Exam not found"}), 404
            
        exam_data = exam_doc.to_dict()
        
        # Return questions WITHOUT correct answers (for security)
        questions_for_student = []
        for i, q in enumerate(exam_data.get('questions', [])):
            question_copy = {
                'number': i + 1,
                'text': q['text'],
                'options': q['options'],
                'type': q.get('type', 'mcq')
            }
            questions_for_student.append(question_copy)
        
        response_data = {
            'id': exam_id,
            'title': exam_data['title'],
            'description': exam_data.get('description', ''),
            'duration_minutes': exam_data['duration_minutes'],
            'total_questions': len(questions_for_student),
            'questions': questions_for_student
        }
        
        print(f"📝 Serving exam {exam_id} to student")
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6. Submit exam for grading (MAIN FEATURE)
@routes.route('/exams/<exam_id>/submit', methods=['POST'])
def submit_exam(exam_id):
    try:
        data = request.get_json()
        student_answers = data['answers']
        student_id = data['student_id']
        student_name = data.get('student_name', 'Anonymous')
        
        print(f"📥 Grading exam {exam_id} for student {student_name}")
        
        # Get exam with correct answers
        exam_ref = db.collection('exams').document(exam_id)
        exam_doc = exam_ref.get()
        
        if not exam_doc.exists:
            return jsonify({"error": "Exam not found"}), 404
            
        exam_data = exam_doc.to_dict()
        questions = exam_data.get('questions', [])
        
        # Auto-grade the exam
        score = 0
        total_questions = len(questions)
        grading_details = []
        
        for i, question in enumerate(questions):
            student_answer = student_answers.get(str(i))
            correct_answer = question.get('correct_answer')
            is_correct = student_answer == correct_answer
            
            if is_correct:
                score += 1
                
            grading_details.append({
                'question_number': i + 1,
                'student_answer': student_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct
            })
        
        percentage = (score / total_questions) * 100 if total_questions > 0 else 0
        
        # Save result to Firestore
        result_data = {
            'exam_id': exam_id,
            'exam_title': exam_data['title'],
            'student_id': student_id,
            'student_name': student_name,
            'score': score,
            'total_questions': total_questions,
            'percentage': round(percentage, 2),
            'grading_details': grading_details,
            'submitted_at': firestore.SERVER_TIMESTAMP,
            'time_taken': data.get('time_taken', 0)
        }
        
        result_ref = db.collection('results').document()
        result_ref.set(result_data)
        
        response = {
            "score": score,
            "total_questions": total_questions,
            "percentage": round(percentage, 2),
            "result_id": result_ref.id,
            "grade": get_grade(percentage),
            "message": "Exam submitted successfully!",
            "details": f"You scored {score}/{total_questions} ({round(percentage, 2)}%)"
        }
        
        print(f"🎯 Grading complete: {score}/{total_questions} ({percentage}%)")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Grading error: {e}")
        return jsonify({"error": str(e)}), 500

# 7. Get student results
@routes.route('/results/student/<student_id>', methods=['GET'])
def get_student_results(student_id):
    try:
        results_ref = db.collection('results').where('student_id', '==', student_id)
        docs = results_ref.stream()
        
        results = []
        for doc in docs:
            result_data = doc.to_dict()
            result_data['id'] = doc.id
            if 'submitted_at' in result_data:
                result_data['submitted_at'] = result_data['submitted_at'].isoformat()
            results.append(result_data)
            
        print(f"📈 Found {len(results)} results for student {student_id}")
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 8. Get all results for a specific exam (teacher view)
@routes.route('/results/exam/<exam_id>', methods=['GET'])
def get_exam_results(exam_id):
    try:
        results_ref = db.collection('results').where('exam_id', '==', exam_id)
        docs = results_ref.stream()
        
        results = []
        for doc in docs:
            result_data = doc.to_dict()
            result_data['id'] = doc.id
            if 'submitted_at' in result_data:
                result_data['submitted_at'] = result_data['submitted_at'].isoformat()
            results.append(result_data)
            
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper function to calculate grade
def get_grade(percentage):
    if percentage >= 90: return "A+"
    elif percentage >= 80: return "A"
    elif percentage >= 70: return "B"
    elif percentage >= 60: return "C"
    elif percentage >= 50: return "D"
    else: return "F"

print("✅ All exam routes loaded successfully!")