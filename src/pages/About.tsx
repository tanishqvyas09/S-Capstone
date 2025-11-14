import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>About EngageAI</h1>

        <p style={{ color: '#444', lineHeight: 1.6 }}>
          EngageAI helps teachers quickly generate quizzes from documents and media files using an AI-powered workflow. Teachers can upload files, choose the number of questions, difficulty, and question type, then review and save generated quizzes to share with students via access codes or QR codes.
        </p>

        <h2>Key features</h2>
        <ul>
          <li>Generate multiple-choice, true/false, and fill-in-the-blank questions from files (PDF, PPTX, DOCX, audio).</li>
          <li>Teacher controls for question count, difficulty, and question type.</li>
          <li>Share quizzes with students using 6-digit access codes and QR codes.</li>
          <li>Streamed generation progress so you can follow AI progress in real time.</li>
        </ul>

        <h2>Created By</h2>
        <ul>
          <li>Mohd Shabbar Khan</li>
          <li>Pushti Gandhe</li>
          <li>Arin Bhasin</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
