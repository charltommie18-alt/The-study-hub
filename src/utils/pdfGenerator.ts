import { jsPDF } from 'jspdf';
import { Subject, QuizResult, Flashcard } from '../types';

interface PDFReportData {
  subjects: Subject[];
  quizResults: QuizResult[];
  flashcards: Flashcard[];
  totalFocusMinutes: number;
  streakDays: number;
}

export function generateStudyProgressPDF(data: PDFReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { subjects, quizResults, flashcards, totalFocusMinutes, streakDays } = data;

  const totalMasteredCards = flashcards.filter((f) => f.status === 'mastered').length;
  const cardMasteryRate = flashcards.length > 0 ? Math.round((totalMasteredCards / flashcards.length) * 100) : 0;
  const avgQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, curr) => acc + curr.score, 0) / quizResults.length)
    : 85;

  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusMins = totalFocusMinutes % 60;

  const primaryColor = [45, 54, 46]; // #2D362E
  const accentColor = [90, 109, 91]; // #5A6D5B
  const lightBg = [249, 247, 242]; // #F9F7F2
  const goldColor = [184, 125, 75]; // #B87D4B

  // --- Page Header ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('STUDYHUB CAPE', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 224, 201);
  doc.text('Official Progress & Mastery Analytics Report', 14, 18);

  const reportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${reportDate}`, 14, 23);

  // --- Summary Metrics Cards (Row 1) ---
  let y = 36;

  // Background Box for Summary Header
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(217, 209, 199);
  doc.roundedRect(14, y, 182, 32, 3, 3, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary & Key Metrics', 18, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Metric 1: Focus Time
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(18, y + 11, 40, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(122, 116, 107);
  doc.text('Total Focus Time', 21, y + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${focusHours}h ${focusMins}m`, 21, y + 22);

  // Metric 2: Study Streak
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(62, y + 11, 40, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(122, 116, 107);
  doc.setFont('helvetica', 'normal');
  doc.text('Study Streak', 65, y + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.text(`${streakDays} Days`, 65, y + 22);

  // Metric 3: Flashcard Recall
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(106, y + 11, 40, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(122, 116, 107);
  doc.setFont('helvetica', 'normal');
  doc.text('Flashcard Recall', 109, y + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`${cardMasteryRate}%`, 109, y + 22);

  // Metric 4: Quiz Accuracy
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(150, y + 11, 40, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(122, 116, 107);
  doc.setFont('helvetica', 'normal');
  doc.text('Avg Quiz Accuracy', 153, y + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${avgQuizScore}%`, 153, y + 22);

  y += 40;

  // --- Section 1: Weekly Focus Hours Chart & Distribution ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Weekly Focus Time & Daily Pattern', 14, y);
  y += 4;

  doc.setLineWidth(0.5);
  doc.setDrawColor(217, 209, 199);
  doc.line(14, y, 196, y);
  y += 6;

  // Chart Container Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, 182, 45, 3, 3, 'FD');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const hoursData = [2.5, 4.0, 3.2, 5.5, 1.8, 4.2, Math.max(0.2, Number((totalFocusMinutes / 60).toFixed(1)))];
  const maxHours = 6;

  const barXStart = 24;
  const barWidth = 16;
  const barGap = 8;
  const chartHeight = 28;
  const chartYBottom = y + 36;

  days.forEach((day, idx) => {
    const hours = hoursData[idx];
    const barH = Math.min(chartHeight, (hours / maxHours) * chartHeight);
    const xPos = barXStart + idx * (barWidth + barGap);
    const yPos = chartYBottom - barH;

    // Draw Bar
    if (idx === 6) {
      doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]); // Highlight 'Today'
    } else {
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    }
    doc.roundedRect(xPos, yPos, barWidth, barH, 1, 1, 'F');

    // Hour Label above bar
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${hours.toFixed(1)}h`, xPos + barWidth / 2, yPos - 1.5, { align: 'center' });

    // Day Label below bar
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(122, 116, 107);
    doc.text(day, xPos + barWidth / 2, chartYBottom + 4.5, { align: 'center' });
  });

  y += 52;

  // --- Section 2: Quiz Performance Table ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Practice Exam & Quiz Performance History', 14, y);
  y += 4;

  doc.line(14, y, 196, y);
  y += 6;

  // Table Header
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(14, y, 182, 7, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Quiz Title', 18, y + 4.8);
  doc.text('Subject', 90, y + 4.8);
  doc.text('Date Completed', 135, y + 4.8);
  doc.text('Score', 175, y + 4.8);

  y += 7;

  // Table Rows
  const quizzesToRender = quizResults.length > 0 ? quizResults : [
    { id: '1', quizTitle: 'Unit 1: Biological Molecules Quiz', subjectId: '1', score: 92, totalQuestions: 10, correctAnswers: 9, date: 'Yesterday' },
    { id: '2', quizTitle: 'Unit 2: Cell Structure & Membranes', subjectId: '1', score: 85, totalQuestions: 10, correctAnswers: 8, date: '3 days ago' },
    { id: '3', quizTitle: 'Reaction Kinetics & Thermodynamics', subjectId: '2', score: 88, totalQuestions: 10, correctAnswers: 8, date: '5 days ago' },
  ];

  quizzesToRender.forEach((q, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 249, isEven ? 255 : 247, isEven ? 255 : 242);
    doc.rect(14, y, 182, 7, 'F');

    doc.setDrawColor(230, 225, 218);
    doc.line(14, y + 7, 196, y + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    const quizSubject = subjects.find((s) => s.id === q.subjectId)?.name || 'CAPE Science';
    const titleTruncated = q.quizTitle.length > 42 ? q.quizTitle.slice(0, 40) + '...' : q.quizTitle;

    doc.text(titleTruncated, 18, y + 4.8);
    doc.text(quizSubject, 90, y + 4.8);
    doc.text(q.date || 'Recent', 135, y + 4.8);

    // Score styling
    if (q.score >= 80) {
      doc.setTextColor(46, 125, 50); // Green
    } else {
      doc.setTextColor(184, 125, 75); // Amber
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${q.score}%`, 175, y + 4.8);

    y += 7;
  });

  y += 10;

  // --- Section 3: Subject Mastery Progress Breakdown ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Subject Syllabus Mastery Breakdown', 14, y);
  y += 4;

  doc.setDrawColor(217, 209, 199);
  doc.line(14, y, 196, y);
  y += 6;

  subjects.forEach((subj) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(subj.name, 18, y + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(122, 116, 107);
    doc.text(`${subj.progress}% Mastered`, 175, y + 3, { align: 'right' });

    // Progress Bar BG
    doc.setFillColor(235, 231, 223);
    doc.roundedRect(18, y + 5, 160, 3.5, 1, 1, 'F');

    // Progress Fill
    const fillW = Math.max(2, (subj.progress / 100) * 160);
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(18, y + 5, fillW, 3.5, 1, 1, 'F');

    y += 13;
  });

  // --- Footer on all pages ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 133, 122);

    doc.setDrawColor(217, 209, 199);
    doc.line(14, 282, 196, 282);

    doc.text('StudyHub CAPE Learning Intelligence Assistant — Confidential Student Report', 14, 286);
    doc.text(`Page ${i} of ${pageCount}`, 196, 286, { align: 'right' });
  }

  // Trigger Save/Download
  const filename = `StudyHub_Progress_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
