import { PodcastEpisode } from '../types';

export const INITIAL_PODCASTS: PodcastEpisode[] = [
  {
    id: 'pod-bio-atp',
    title: 'Cellular Respiration & ATP Synthesis in 3 Minutes',
    subjectId: 'subj-bio',
    subjectName: 'Life Sciences',
    topic: 'Mitochondria, Glycolysis & Electron Transport Chain',
    durationSeconds: 185,
    language: 'af-ZA',
    transcript: 'Welkom by StudyHub se 3-minuut klank-opsomming oor Selrespirasie en ATP-sintese! Vandag kyk ons na hoe selle glucose omskakel in bruikbare energie. Eerstens vind Glikolise plaas in die sitoplasma sonder suurstof. Daarna beweeg pirovaat na die mitochondriale matriks vir die Krebssiklus. Laastens, die elektronvervoerketting op die binneste membraan kristae produseer tot 34 ATP molekules per glukose met behulp van ATP-sintase. Onthou vir jou eksamen: suurstof is die finale elektron-akseptor!',
    afrikaansTranscript: 'Welkom by StudyHub se 3-minuut klank-opsomming oor Selrespirasie en ATP-sintese! Vandag kyk ons na hoe selle glucose omskakel in bruikbare energie. Eerstens vind Glikolise plaas in die sitoplasma sonder suurstof. Daarna beweeg pirovaat na die mitochondriale matriks vir die Krebssiklus. Laastens, die elektronvervoerketting op die binneste membraan kristae produseer tot 34 ATP molekules per glukose met behulp van ATP-sintase. Onthou vir jou eksamen: suurstof is die finale elektron-akseptor!',
    keyTakeaways: [
      'Glikolise vind plaas in die sitoplasma (anaërobies)',
      'Krebs-siklus produseer NADH en FADH2 in mitochondriale matriks',
      'Elektronvervoerketting (Oksidatiewe Fosforilering) wek 32-34 ATP op',
      'Suurstof is die finale elektron-akseptor'
    ],
    createdAt: '2026-08-14',
  },
  {
    id: 'pod-phys-newton',
    title: 'Newton se Wette & Kragte-diagramme (Eksamen-Geheime)',
    subjectId: 'subj-chem',
    subjectName: 'Physical Sciences',
    topic: 'Newton’s Laws of Motion & Free Body Diagrams',
    durationSeconds: 190,
    language: 'af-ZA',
    transcript: 'In hierdie klankles kyk ons na Newton se drie bewegingswette vir Graad 12 Fisiese Wetenskappe. Onthou: Newton 1 gaan oor traagheid - \'n voorwerp bly in sy toestand van rus tensy \'n netto krag daarop inwerk. Newton 2 gee ons die bekende formule F_net = m vermenigvuldig met a. Wanneer jy \'n kragtediagram teken, moet jy altyd die gravitasiekrag reguit afwaarts teken en die normaalkrag loodreg op die oppervlak!',
    afrikaansTranscript: 'In hierdie klankles kyk ons na Newton se drie bewegingswette vir Graad 12 Fisiese Wetenskappe. Onthou: Newton 1 gaan oor traagheid - \'n voorwerp bly in sy toestand van rus tensy \'n netto krag daarop inwerk. Newton 2 gee ons die bekende formule F_net = m vermenigvuldig met a. Wanneer jy \'n kragtediagram teken, moet jy altyd die gravitasiekrag reguit afwaarts teken en die normaalkrag loodreg op die oppervlak!',
    keyTakeaways: [
      'Newton 1: Traagheid (Inertia)',
      'Newton 2: F_net = m * a (Versnelling eweredig aan netto krag)',
      'Newton 3: Aksie-reaksie kragtepare (gelyk in grootte, teenoorgesteld in rigting)',
      'Teken altyd vrye-kragtediagramme (Free Body Diagrams)'
    ],
    createdAt: '2026-08-14',
  },
  {
    id: 'pod-math-calc',
    title: 'Differential Calculus & Stationary Points Masterclass',
    subjectId: 'subj-math',
    subjectName: 'Mathematics',
    topic: 'Derivatives, First Principles & Cubic Graphs',
    durationSeconds: 210,
    language: 'en-ZA',
    transcript: 'Welcome to the 3-minute Calculus podcast! In Paper 1, first principles differentiation is guaranteed 5 marks. Always write down the limit formula: limit as h approaches zero of f(x+h) minus f(x) over h. To find turning points or stationary points of a cubic function, set the first derivative f-prime of x equal to zero and solve for x. Then substitute back into original f(x) for the y-coordinates!',
    afrikaansTranscript: 'Welkom by die 3-minuut Differensiaalrekene klankles! In Vraestel 1 is eerste beginsels afleiding gewaarborgde 5 punte. Stel altyd f\'(x) = 0 om die draaipunte van \'n derdegraadse grafiek te vind!',
    keyTakeaways: [
      'First principles definition: lim(h->0) [f(x+h) - f(x)] / h',
      'Turning points occur where first derivative f\'(x) = 0',
      'Point of inflection occurs where second derivative f\'\'(x) = 0',
      'Always substitute x into original f(x) for y-coordinates'
    ],
    createdAt: '2026-08-14',
  },
];
