import { Subject, Note, Flashcard, QuizQuestion, TutorMessage, GradeConfig, SubscriberRecord, DailyAnalyticsRecord, AchievementBadge, GamificationProfile } from '../types';

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge-focus-1',
    title: 'Focus Initiate',
    description: 'Complete at least 1 Hour (60 Mins) of active Pomodoro study time.',
    iconName: 'Timer',
    category: 'Focus',
    progress: 120, // 2 hours achieved
    maxProgress: 60,
    isUnlocked: true,
    unlockedAt: '2026-08-01',
    xpReward: 100,
  },
  {
    id: 'badge-focus-10',
    title: '10 Hours Focused',
    description: 'Accumulate 10 Hours (600 Mins) in the Focus Studio.',
    iconName: 'Flame',
    category: 'Focus',
    progress: 180, // 3 hours
    maxProgress: 600,
    isUnlocked: false,
    xpReward: 500,
  },
  {
    id: 'badge-card-50',
    title: '50 Flashcards Mastered',
    description: 'Review and mark 50 Smart Flashcards as Mastered.',
    iconName: 'Award',
    category: 'Mastery',
    progress: 32,
    maxProgress: 50,
    isUnlocked: false,
    xpReward: 400,
  },
  {
    id: 'badge-quiz-perfect',
    title: 'Quiz Champion',
    description: 'Score 100% on a Practice Exam quiz.',
    iconName: 'Trophy',
    category: 'Mastery',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: '2026-08-05',
    xpReward: 250,
  },
  {
    id: 'badge-upload-5',
    title: 'PDF Scholar',
    description: 'Upload and convert 5 study documents into AI notes & cards.',
    iconName: 'FileUp',
    category: 'Uploads',
    progress: 3,
    maxProgress: 5,
    isUnlocked: false,
    xpReward: 300,
  },
  {
    id: 'badge-[#streak-7]',
    title: '7-Day Streak Master',
    description: 'Study every single day for 7 consecutive days.',
    iconName: 'Zap',
    category: 'Consistency',
    progress: 5,
    maxProgress: 7,
    isUnlocked: false,
    xpReward: 350,
  },
  {
    id: 'badge-tutor-10',
    title: 'Socratic Scholar',
    description: 'Ask the AI Socratic Tutor 10 deep clarification questions.',
    iconName: 'MessageSquare',
    category: 'AI Tutor',
    progress: 8,
    maxProgress: 10,
    isUnlocked: false,
    xpReward: 200,
  },
];

export const INITIAL_GAMIFICATION: GamificationProfile = {
  xp: 1250,
  level: 4,
  streakDays: 5,
  totalFocusMinutes: 180,
  masteredCardsCount: 32,
  quizzesCompleted: 12,
  docsUploaded: 3,
  aiQueriesCount: 18,
};

export const GRADE_CONFIGS: GradeConfig[] = [
  { id: 'grade-7', name: 'Grade 7', category: 'Junior Secondary', description: 'Foundational STEM, Language Arts, Basic Algebra & Social Sciences.' },
  { id: 'grade-8', name: 'Grade 8', category: 'Junior Secondary', description: 'Pre-Algebra, Physical Science, Geography & World Civilizations.' },
  { id: 'grade-9', name: 'Grade 9', category: 'Junior Secondary', description: 'Algebra I, Biology Fundamentals, Literature & Introductory Civics.' },
  { id: 'grade-10', name: 'Grade 10 (IGCSE / CXC)', category: 'Senior Secondary', description: 'Geometry, Chemistry, World History & Secondary Core Syllabus.' },
  { id: 'grade-11', name: 'Grade 11 (Matric / CAPE 1)', category: 'Senior Secondary', description: 'Algebra II, Trigonometry, Physics & Advanced Humanities.' },
  { id: 'grade-12', name: 'Grade 12 (SAT / A-Levels / CAPE 2)', category: 'Senior Secondary', description: 'Calculus, Advanced Bio & Chemistry, Economics & Exam Mastery.' },
  { id: 'tertiary', name: 'University / Tertiary Degree', category: 'Tertiary / Advanced', description: 'Higher Education, Engineering, Computer Science, Medicine & Law.' },
];

export const INITIAL_SUBSCRIBERS: SubscriberRecord[] = [
  {
    id: 'sub-101',
    fullName: 'Sophia Martinez',
    email: 'sophia.m@student.edu',
    gradeLevel: 'grade-12',
    tier: 'Pro',
    currency: 'USD',
    amount: 4.99,
    status: 'Active',
    joinedDate: '2026-07-15',
    lastActiveDate: '2026-08-12',
    docsUploaded: 14,
  },
  {
    id: 'sub-102',
    fullName: 'Kagiso Dlamini',
    email: 'kagiso.d@school.za',
    gradeLevel: 'grade-11',
    tier: 'Pro',
    currency: 'ZAR',
    amount: 89.00,
    status: 'Active',
    joinedDate: '2026-06-20',
    lastActiveDate: '2026-08-12',
    docsUploaded: 22,
  },
  {
    id: 'sub-103',
    fullName: 'Liam O\'Connor',
    email: 'liam.oc@academy.uk',
    gradeLevel: 'grade-10',
    tier: 'Pro',
    currency: 'GBP',
    amount: 3.99,
    status: 'Active',
    joinedDate: '2026-08-01',
    lastActiveDate: '2026-08-11',
    docsUploaded: 9,
  },
  {
    id: 'sub-104',
    fullName: 'Tariq Al-Mansoor',
    email: 'tariq.a@college.org',
    gradeLevel: 'tertiary',
    tier: 'Institutional',
    currency: 'EUR',
    amount: 14.99,
    status: 'Active',
    joinedDate: '2026-05-10',
    lastActiveDate: '2026-08-12',
    docsUploaded: 45,
  },
  {
    id: 'sub-105',
    fullName: 'Chinedu Okeke',
    email: 'chinedu.o@edu.ng',
    gradeLevel: 'grade-9',
    tier: 'Free',
    currency: 'NGN',
    amount: 0.00,
    status: 'Active',
    joinedDate: '2026-08-05',
    lastActiveDate: '2026-08-10',
    docsUploaded: 3,
  },
  {
    id: 'sub-106',
    fullName: 'Gabrielle Campbell',
    email: 'gaby.c@cxc.jm',
    gradeLevel: 'grade-11',
    tier: 'Pro',
    currency: 'JMD',
    amount: 750.00,
    status: 'Active',
    joinedDate: '2026-07-28',
    lastActiveDate: '2026-08-12',
    docsUploaded: 18,
  },
];

export const INITIAL_DAILY_ANALYTICS: DailyAnalyticsRecord[] = [
  { date: '2026-08-06', activeUsers: 420, docUploads: 85, aiPromptsCount: 1240, quizzesTaken: 310, newSubscriptions: 12, revenueUsd: 89.50 },
  { date: '2026-08-07', activeUsers: 485, docUploads: 110, aiPromptsCount: 1450, quizzesTaken: 380, newSubscriptions: 15, revenueUsd: 112.00 },
  { date: '2026-08-08', activeUsers: 512, docUploads: 128, aiPromptsCount: 1620, quizzesTaken: 420, newSubscriptions: 18, revenueUsd: 134.50 },
  { date: '2026-08-09', activeUsers: 590, docUploads: 145, aiPromptsCount: 1890, quizzesTaken: 490, newSubscriptions: 22, revenueUsd: 168.00 },
  { date: '2026-08-10', activeUsers: 640, docUploads: 162, aiPromptsCount: 2100, quizzesTaken: 530, newSubscriptions: 25, revenueUsd: 195.00 },
  { date: '2026-08-11', activeUsers: 710, docUploads: 188, aiPromptsCount: 2350, quizzesTaken: 610, newSubscriptions: 31, revenueUsd: 242.00 },
  { date: '2026-08-12', activeUsers: 785, docUploads: 215, aiPromptsCount: 2680, quizzesTaken: 690, newSubscriptions: 36, revenueUsd: 284.00 },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-bio',
    name: 'Cellular Biology',
    icon: 'Dna',
    color: 'from-emerald-500 to-teal-600',
    description: 'Cell structure, organelle functions, photosynthesis, and DNA genetics.',
    progress: 78,
    notesCount: 3,
    flashcardsCount: 8,
    quizScore: 85,
  },
  {
    id: 'subj-cs',
    name: 'Computer Science & Algorithms',
    icon: 'Code2',
    color: 'from-blue-500 to-indigo-600',
    description: 'Data structures, algorithm complexity, dynamic programming, and system design.',
    progress: 62,
    notesCount: 4,
    flashcardsCount: 10,
    quizScore: 90,
  },
  {
    id: 'subj-hist',
    name: 'World History & Civilizations',
    icon: 'Landmark',
    color: 'from-amber-500 to-orange-600',
    description: 'Ancient empires, the Renaissance, Industrialization, and global conflicts.',
    progress: 45,
    notesCount: 2,
    flashcardsCount: 6,
    quizScore: 70,
  },
  {
    id: 'subj-calc',
    name: 'Calculus & Linear Algebra',
    icon: 'Calculator',
    color: 'from-purple-500 to-pink-600',
    description: 'Derivatives, integrals, matrix transformations, eigenvalues, and vectors.',
    progress: 88,
    notesCount: 3,
    flashcardsCount: 7,
    quizScore: 92,
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-bio-1',
    subjectId: 'subj-bio',
    title: 'Mitochondrial Energy Production & ATP Synthesis',
    content: `Mitochondria are double-membrane organelles responsible for cellular respiration and ATP synthesis. The outer membrane contains porins allowing free diffusion of small molecules, while the inner membrane is highly folded into cristae to maximize surface area for electron transport chain (ETC) complexes.

Aerobic respiration consists of four main stages:
1. Glycolysis (Cytosol): Breaks down 1 glucose molecule into 2 pyruvate molecules, yielding 2 net ATP and 2 NADH.
2. Pyruvate Oxidation (Mitochondrial Matrix): Converts pyruvate into Acetyl-CoA, producing CO2 and NADH.
3. Krebs Cycle (Citric Acid Cycle): Acetyl-CoA oxidizes to produce 2 ATP, 6 NADH, and 2 FADH2 per glucose.
4. Oxidative Phosphorylation & Chemiosmosis: High-energy electrons pass through ETC complexes I-IV, pumping protons (H+) into the intermembrane space. Protons flow back through ATP Synthase (rotary motor enzyme), generating approximately 28 to 32 ATP molecules.`,
    summary: 'Mitochondria generate cellular energy (ATP) via aerobic respiration. High-energy electrons from NADH/FADH2 power proton pumping across the inner mitochondrial membrane, driving ATP Synthase via chemiosmosis to produce ~30 ATP per glucose.',
    keyTakeaways: [
      'Outer membrane is permeable via porins; inner membrane forms cristae to increase ETC surface area.',
      'Glycolysis occurs in the cytosol (2 net ATP); Krebs cycle & ETC occur inside mitochondria.',
      'Proton gradient (intermembrane space -> matrix) powers ATP Synthase rotary motor.',
      'Oxygen acts as the final electron acceptor at Complex IV, forming water (H2O).',
    ],
    glossary: [
      { term: 'ATP Synthase', definition: 'Rotary enzyme complex that synthesizes ATP from ADP + Pi using a proton motive force.' },
      { term: 'Cristae', definition: 'Deep folds of the inner mitochondrial membrane containing the electron transport chain.' },
      { term: 'Chemiosmosis', definition: 'Movement of ions across a semipermeable membrane down their electrochemical gradient.' },
      { term: 'Pyruvate', definition: '3-carbon end product of glycolysis transported into mitochondrial matrix.' },
    ],
    studyTips: [
      'Remember electron flow: Complex I/II -> Coenzyme Q -> Complex III -> Cytochrome c -> Complex IV -> Oxygen.',
      'Uncoupling agents (e.g., thermogenin) dissipate the proton gradient to produce heat instead of ATP.',
    ],
    createdAt: '2026-08-10',
    tags: ['Biochemistry', 'Organelles', 'Respiration'],
  },
  {
    id: 'note-cs-1',
    subjectId: 'subj-cs',
    title: 'Binary Search Trees & Balancing (AVL / Red-Black)',
    content: `A Binary Search Tree (BST) is a hierarchical node structure where every node satisfies the BST property: left subtree values < node value < right subtree values. 

Inorder traversal (Left -> Node -> Right) produces a strictly sorted sequence of elements.
- Searching/Insertion average case: O(log N) time complexity.
- Worst case (skewed tree / degenerate line): O(N) time complexity.

To prevent degradation into linked lists, self-balancing trees keep height bounded by O(log N):
1. AVL Trees: Enforce height balance factor (|height(left) - height(right)| <= 1) using single and double rotations.
2. Red-Black Trees: Use node coloring rules (red/black) and black-height balance, allowing slightly looser balance than AVL with faster insertion/deletion overhead.`,
    summary: 'BSTs organize data for fast binary searching. Unbalanced BSTs can degenerate to O(N), but self-balancing trees like AVL and Red-Black guarantee logarithmic O(log N) lookup, insertion, and deletion times via tree rotations.',
    keyTakeaways: [
      'Inorder traversal of a BST yields elements in sorted ascending order.',
      'Worst-case search time in an unbalanced BST is O(N) when inserted in pre-sorted order.',
      'AVL trees are strictly balanced (|BF| <= 1), ideal for lookup-heavy workloads.',
      'Red-Black trees use 5 coloring invariants and offer faster rebalancing insertions.',
    ],
    glossary: [
      { term: 'Inorder Traversal', definition: 'Tree traversal order (Left, Root, Right) that visits BST nodes in sorted order.' },
      { term: 'Balance Factor', definition: 'Height of left subtree minus height of right subtree in an AVL tree.' },
      { term: 'Tree Rotation', definition: 'Operation modifying BST node links while preserving BST ordering invariants.' },
    ],
    studyTips: [
      'Practice drawing single LL/RR rotations vs double LR/RL rotations for AVL rebalancing.',
      'Remember that std::map in C++ and TreeMap in Java are typically implemented as Red-Black trees.',
    ],
    createdAt: '2026-08-11',
    tags: ['Data Structures', 'Algorithms', 'Trees'],
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'subj-bio',
    question: 'What molecule serves as the final electron acceptor in mitochondrial aerobic respiration?',
    answer: 'Oxygen (O2). It combines with electrons and H+ protons at Complex IV to form H2O.',
    category: 'Bioenergetics',
    difficulty: 'easy',
    hint: 'Think about why animals must breathe gas to survive.',
    status: 'mastered',
    timesReviewed: 5,
  },
  {
    id: 'fc-2',
    subjectId: 'subj-bio',
    question: 'Where in the cell does Glycolysis take place?',
    answer: 'In the Cytosol (cytoplasm), outside the mitochondria. It is anaerobic and requires no oxygen.',
    category: 'Cellular Respiration',
    difficulty: 'easy',
    hint: 'It occurs in the fluid region outside organelle membranes.',
    status: 'learning',
    timesReviewed: 3,
  },
  {
    id: 'fc-3',
    subjectId: 'subj-bio',
    question: 'What is the net gain of ATP molecules produced per glucose in Glycolysis alone?',
    answer: '2 Net ATP (4 ATP produced minus 2 ATP consumed in investment phase).',
    category: 'Biochemistry',
    difficulty: 'medium',
    hint: '2 ATP are invested initially.',
    status: 'new',
    timesReviewed: 1,
  },
  {
    id: 'fc-4',
    subjectId: 'subj-cs',
    question: 'What is the worst-case time complexity for searching an element in an unbalanced Binary Search Tree?',
    answer: 'O(N) - occurs when elements are inserted in sorted order, turning the BST into a linked list.',
    category: 'Data Structures',
    difficulty: 'medium',
    hint: 'Imagine a tree where every node only has a right child.',
    status: 'learning',
    timesReviewed: 4,
  },
  {
    id: 'fc-5',
    subjectId: 'subj-cs',
    question: 'Which traversal method on a Binary Search Tree outputs nodes in sorted ascending order?',
    answer: 'Inorder Traversal (Left subtree -> Current Node -> Right subtree).',
    category: 'Tree Algorithms',
    difficulty: 'easy',
    hint: 'In-order means in sorting order.',
    status: 'mastered',
    timesReviewed: 6,
  },
  {
    id: 'fc-6',
    subjectId: 'subj-cs',
    question: 'How do AVL trees maintain O(log N) worst-case height?',
    answer: 'By requiring that for every node, the height difference between left and right subtrees is at most 1, enforcing balance via rotations.',
    category: 'Balanced BSTs',
    difficulty: 'hard',
    hint: 'Balance factor calculation.',
    status: 'new',
    timesReviewed: 0,
  },
  {
    id: 'fc-7',
    subjectId: 'subj-hist',
    question: 'In what year did Gutenberg invent the movable type printing press in Mainz, Germany?',
    answer: 'Around 1440 AD. It revolutionized European literacy and accelerated the Reformation.',
    category: 'Renaissance History',
    difficulty: 'medium',
    hint: 'Middle of the 15th century.',
    status: 'learning',
    timesReviewed: 2,
  },
  {
    id: 'fc-8',
    subjectId: 'subj-calc',
    question: 'What is the derivative of f(x) = ln(x) with respect to x?',
    answer: 'f\'(x) = 1 / x, for x > 0.',
    category: 'Calculus',
    difficulty: 'easy',
    hint: 'Reciprocal function.',
    status: 'mastered',
    timesReviewed: 8,
  },
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-bio-1',
    question: 'Which mitochondrial region accumulates high concentration of H+ protons during active electron transport?',
    options: [
      'The Intermembrane Space',
      'The Mitochondrial Matrix',
      'The Cytosol',
      'Outer Membrane Porins',
    ],
    correctAnswerIndex: 0,
    explanation: 'Complexes I, III, and IV pump protons from the matrix into the intermembrane space, creating a steep electrochemical gradient.',
    hint: 'Protons are pumped outward across the inner membrane.',
    difficulty: 'medium',
  },
  {
    id: 'q-bio-2',
    question: 'Which enzyme directly generates ATP using the proton motive force during chemiosmosis?',
    options: [
      'Hexokinase',
      'ATP Synthase',
      'Pyruvate Dehydrogenase',
      'Cytochrome c Oxidase',
    ],
    correctAnswerIndex: 1,
    explanation: 'ATP Synthase acts as a rotary biological engine that harnesses proton flow back into the matrix to synthesize ATP from ADP and inorganic phosphate.',
    hint: 'Name includes the compound it synthesizes.',
    difficulty: 'easy',
  },
  {
    id: 'q-cs-1',
    question: 'When searching for an element in an AVL tree with 1,000,000 nodes, roughly how many node comparisons are needed in the worst case?',
    options: [
      'Around 20 comparisons',
      'Around 500,000 comparisons',
      'Around 1,000 comparisons',
      'Exactly 100 comparisons',
    ],
    correctAnswerIndex: 0,
    explanation: 'Log2(1,000,000) is approximately 20 comparisons because AVL trees guarantee O(log2 N) height.',
    hint: 'Calculate log2 of 1 million (2^10 = 1024 ~ 1000).',
    difficulty: 'hard',
  },
  {
    id: 'q-cs-2',
    question: 'What is the balance factor constraint for any node in a valid AVL tree?',
    options: [
      'Height(Left) - Height(Right) must be -1, 0, or 1',
      'Number of left children must equal right children',
      'Left subtree must always be colored red',
      'All leaf nodes must be at the exact same depth',
    ],
    correctAnswerIndex: 0,
    explanation: 'An AVL tree mandates that the balance factor (|height(left) - height(right)|) never exceeds 1.',
    hint: 'The height difference cannot be more than 1.',
    difficulty: 'medium',
  },
];

export const INITIAL_TUTOR_MESSAGES: TutorMessage[] = [
  {
    id: 'tm-1',
    role: 'assistant',
    text: `👋 Welcome to **The Study Hub AI Tutor**! I am your personal academic coach. 

I can help you:
- **Simplify complex concepts** with real-world analogies
- **Dissect exam-style practice problems** step-by-step
- **Generate custom study cards and memory mnemonics**
- **Test your understanding** with Socratic questioning

What topic are we mastering today? You can select a persona or ask a question directly!`,
    timestamp: 'Just now',
    suggestedFollowups: [
      'Explain Photosynthesis like I am 5',
      'How do I calculate Big-O for recursive functions?',
      'Give me 3 high-yield tips for my upcoming exam',
      'Help me build a 7-day study plan',
    ],
  },
];
