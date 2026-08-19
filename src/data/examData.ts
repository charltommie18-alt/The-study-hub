import { MockExamPaper } from '../types';

export const INITIAL_MOCK_EXAMS: MockExamPaper[] = [
  {
    id: 'exam-bio-p1-gr12',
    title: 'Grade 12 Life Sciences: Paper 1 (Cellular & Genetics)',
    subjectId: 'subj-bio',
    subjectName: 'Life Sciences (Cellular Biology)',
    gradeLevel: 'grade-12',
    durationMinutes: 45,
    totalMarks: 50,
    questions: [
      {
        id: 'q1',
        section: 'Section A: Multiple Choice & Terminology',
        questionText: 'Which organelle is primarily responsible for generating ATP through oxidative phosphorylation during aerobic respiration?',
        afrikaansTranslation: 'Watter organel is hoofsaaklik verantwoordelik vir die opwekking van ATP deur oksidatiewe fosforilering tydens aërobiese respirasie?',
        marks: 2,
        type: 'multiple-choice',
        options: ['Ribosome', 'Mitochondria', 'Golgi apparatus', 'Endoplasmic reticulum'],
        correctOptionIndex: 1,
        modelAnswer: 'Mitochondria - The inner mitochondrial cristae host the electron transport chain where ATP synthesis occurs.',
        rubricCriteria: ['1 mark for identifying Mitochondria', '1 mark for correct respiration role'],
      },
      {
        id: 'q2',
        section: 'Section A: Multiple Choice & Terminology',
        questionText: 'Give the biological term for the semi-permeable phospholipid bilayer that regulates molecular transit into and out of the cell.',
        afrikaansTranslation: 'Gee die biologiese term vir die semi-deurlaatbare fosfolipied tweelaag wat molekulêre beweging in en uit die sel reguleer.',
        marks: 2,
        type: 'short-answer',
        modelAnswer: 'Cell Membrane / Plasma Membrane (Selmembraan)',
        rubricCriteria: ['2 marks for Plasma Membrane or Cell Membrane'],
      },
      {
        id: 'q3',
        section: 'Section B: Structured & Data Response',
        questionText: 'Explain why cyanide poisoning immediately halts ATP production in human cells and state which metabolic pathway is directly affected [4 marks].',
        afrikaansTranslation: 'Verduidelik waarom sianiedvergiftiging onmiddellik ATP-produksie in menslike selle staak en noem watter metaboliese roete direk geraak word [4 punte].',
        marks: 4,
        type: 'short-answer',
        modelAnswer: 'Cyanide binds to cytochrome c oxidase in the Electron Transport Chain (Complex IV) on the inner mitochondrial membrane. This blocks the transfer of electrons to oxygen, preventing the proton gradient needed for ATP Synthase, stopping aerobic ATP synthesis.',
        rubricCriteria: [
          '1 mark: Mentions Electron Transport Chain / Kompleks IV',
          '1 mark: Mentions blockage of electron flow to oxygen',
          '1 mark: Explains collapse of proton (H+) electrochemical gradient',
          '1 mark: Concludes failure of ATP Synthase phosphorylation'
        ],
      },
      {
        id: 'q4',
        section: 'Section B: Structured & Data Response',
        questionText: 'Differentiate between simple diffusion, facilitated diffusion, and active transport with respect to energy requirements and concentration gradients [6 marks].',
        afrikaansTranslation: 'Onderskei tussen eenvoudige diffusie, gefasiliteerde diffusie en aktiewe vervoer ten opsigte van energievereistes en konsentrasiegradiënte [6 punte].',
        marks: 6,
        type: 'essay',
        modelAnswer: '1. Simple diffusion: Passive (no ATP), moves solute down concentration gradient directly through lipid bilayer.\n2. Facilitated diffusion: Passive (no ATP), moves polar molecules down concentration gradient via channel/carrier proteins.\n3. Active transport: Active (requires ATP hydrolysis), pumps substances AGAINST concentration gradient (low to high) using carrier protein pumps.',
        rubricCriteria: [
          '2 marks: Simple diffusion down gradient + no ATP',
          '2 marks: Facilitated diffusion down gradient + transport proteins + no ATP',
          '2 marks: Active transport against gradient + requires ATP'
        ],
      },
    ],
  },
  {
    id: 'exam-phys-gr12',
    title: 'Grade 12 Physical Sciences: Paper 1 (Newtonian Mechanics & Work-Energy)',
    subjectId: 'subj-chem',
    subjectName: 'Physical Sciences (Chemistry & Physics)',
    gradeLevel: 'grade-12',
    durationMinutes: 45,
    totalMarks: 50,
    questions: [
      {
        id: 'qp1',
        section: 'Section A: Objective',
        questionText: 'State Newton’s Second Law of Motion in words [2 marks].',
        afrikaansTranslation: 'Stel Newton se Tweede Bewegingswet in woorde [2 punte].',
        marks: 2,
        type: 'short-answer',
        modelAnswer: 'When a net resultant force acts on an object, the object accelerates in the direction of the net force with an acceleration directly proportional to the net force and inversely proportional to the mass of the object (Fnet = m * a).',
        rubricCriteria: [
          '1 mark: Directly proportional to net force in direction of force',
          '1 mark: Inversely proportional to mass'
        ],
      },
      {
        id: 'qp2',
        section: 'Section B: Structured Problem Solving',
        questionText: 'A 5 kg block is pulled along a rough horizontal floor by a force of 30 N at an angle of 30° above the horizontal. The coefficient of kinetic friction is 0.2. Calculate the kinetic frictional force acting on the block [5 marks]. (Use g = 9.8 m/s²)',
        afrikaansTranslation: '\'n 5 kg blok word oor \'n rowwe horisontale vloer getrek deur \'n krag van 30 N teen \'n hoek van 30° bo die horisontaal. Die wrywingskoëffisiënt is 0.2. Bereken die kinetiese wrywingskrag [5 punte].',
        marks: 5,
        type: 'essay',
        modelAnswer: 'Vertical Equilibrium: F_N + F*sin(30°) = m*g => F_N = (5*9.8) - 30*sin(30°) = 49 - 15 = 34 N.\nFriction f_k = μ_k * F_N = 0.2 * 34 N = 6.8 N to the left.',
        rubricCriteria: [
          '1 mark: Free body vertical force balance formula',
          '2 marks: Correct normal force calculation (FN = 34 N)',
          '1 mark: Friction formula fk = μk * FN substitution',
          '1 mark: Correct final answer with units (6.8 N)'
        ],
      },
    ],
  },
  {
    id: 'exam-math-gr12',
    title: 'Grade 12 Mathematics: Paper 1 (Calculus & Functions)',
    subjectId: 'subj-math',
    subjectName: 'Mathematics (Calculus & Algebra)',
    gradeLevel: 'grade-12',
    durationMinutes: 45,
    totalMarks: 50,
    questions: [
      {
        id: 'qm1',
        section: 'Section A: Calculus Rules',
        questionText: 'Determine the derivative f\'(x) from first principles if f(x) = 2x² - 3x [5 marks].',
        afrikaansTranslation: 'Bepaal die afgeleide f\'(x) vanaf eerste beginsels as f(x) = 2x² - 3x [5 punte].',
        marks: 5,
        type: 'essay',
        modelAnswer: 'f\'(x) = lim(h->0) [f(x+h) - f(x)] / h\n= lim(h->0) [2(x+h)² - 3(x+h) - (2x² - 3x)] / h\n= lim(h->0) [2x² + 4xh + 2h² - 3x - 3h - 2x² + 3x] / h\n= lim(h->0) [h(4x + 2h - 3)] / h\n= 4x - 3',
        rubricCriteria: [
          '1 mark: First principles limit formula',
          '1 mark: Correct substitution of (x+h)',
          '1 mark: Expansion and cancellation of like terms',
          '1 mark: Factorising h out of numerator',
          '1 mark: Final simplified derivative 4x - 3'
        ],
      },
    ],
  },
];
