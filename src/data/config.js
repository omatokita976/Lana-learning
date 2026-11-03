// Plan d’une année universitaire. À adapter aux règles de votre faculté.
// Hypothèse : 2 semestres, chacun avec 1 contrôle continu (CC) + 1 session normale (SN).
export const CC_WEIGHT = 0.3      // poids du CC dans la moyenne du semestre (SN = 70 %)
export const PASS_MARK = 10       // moyenne annuelle minimale pour être admis
export const EXAM_PLAN = [
  { id: 's1-cc', label: 'Semestre 1 · Contrôle continu', kind: 'CC', questions: 20 },
  { id: 's1-sn', label: 'Semestre 1 · Session normale', kind: 'SN', questions: 40 },
  { id: 's2-cc', label: 'Semestre 2 · Contrôle continu', kind: 'CC', questions: 20 },
  { id: 's2-sn', label: 'Semestre 2 · Session normale', kind: 'SN', questions: 40 }
]
