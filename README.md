# 🎓 Smart Online Examination System

A secure and scalable cloud-based online examination system developed using **Python Flask** and **Firebase**, enhanced with additional features for better performance and usability.

---

## 🚀 Key Features

- 👩‍🏫 **Teacher Dashboard**
  - Create, update, and manage exams
  - Add questions dynamically

- 👨‍🎓 **Student Dashboard**
  - Attend exams with real-time timer
  - Auto-submit when time expires

- ⚡ **Auto-Grading System**
  - Instant evaluation for objective questions

- 🔀 **Random Question Generation**
  - Questions are shuffled for each student

- ❌ **Negative Marking (New Feature)**
  - Marks deducted for wrong answers

- 📊 **Result Analytics (New Feature)**
  - Performance insights and score tracking

- ☁️ **Cloud Integration**
  - Firebase Firestore for real-time database
  - Scalable and secure architecture

---

## 🛠️ Tech Stack

- **Backend:** Python Flask, Firebase Admin SDK  
- **Frontend:** React.js  
- **Database:** Firebase Firestore  
- **Deployment:** Render + Firebase Hosting  

---

## ⚙️ Installation Guide

#Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Frontend 
cd frontend 
npm install
npm start