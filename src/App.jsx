import { useEffect, useState } from 'react'
import { GraduationCap, HeartPulse, Play, BarChart3, Moon, Sun, Clock, Check, X, RotateCcw, Home, SkipForward, ChevronLeft, Award, Flag } from 'lucide-react'
import { QUESTIONS, LEVELS, SUBJECTS } from './data/questions'
import { EXAM_PLAN, CC_WEIGHT, PASS_MARK } from './data/config'

const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const ok = (q, a = []) => a.length === q.answers.length && q.answers.every(x => a.includes(x))
const byId = id => QUESTIONS.find(q => q.id === id)
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const LEVEL_NAMES = { 'Niveau 4': '4e année', 'Niveau 5': '5e année', 'Niveau 6': '6e année', Doctorat: 'Doctorat' }

export default function App() {
  const [view, setView] = useState('home')
  const [dark, setDark] = useState(() => ld('ll_dark', false))
  const [hist, setHist] = useState(() => ld('ll_hist', []))
  const [quiz, setQuiz] = useState(() => { const s = ld('ll_session', null); return s && s.ids.every(byId) ? s : null })
  const [res, setRes] = useState(null)
  const [year, setYear] = useState(() => ld('ll_year', {}))
  const [flags, setFlags] = useState(() => ld('ll_flags', []))
  const toggleFlag = id => { const f = flags.includes(id) ? flags.filter(x => x !== id) : [...flags, id]; setFlags(f); sv('ll_flags', f) }
  const [cfg, setCfg] = useState({ level: 'Niveau 4', subject: 'Toutes', count: 5, timer: false })

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); sv('ll_dark', dark) }, [dark])
  useEffect(() => { quiz ? sv('ll_session', quiz) : localStorage.removeItem('ll_session') }, [quiz])
  useEffect(() => {
    if (view !== 'quiz' || !quiz?.timer) return
    const t = setInterval(() => setQuiz(s => s && { ...s, sec: s.sec + 1 }), 1000)
    return () => clearInterval(t)
  }, [view, quiz?.timer])

  const pool = QUESTIONS.filter(q => q.level === cfg.level && (cfg.subject === 'Toutes' || q.subject === cfg.subject))
  const stats = {
    n: hist.length,
    avg: hist.length ? (hist.reduce((a, h) => a + h.score, 0) / hist.length).toFixed(1) : '–',
    good: hist.reduce((a, h) => a + h.good, 0),
    prog: hist.length ? Math.round(hist.reduce((a, h) => a + h.good / h.total, 0) / hist.length * 100) : 0
  }

  const start = () => {
    const ids = [...pool].sort(() => Math.random() - 0.5).slice(0, cfg.count).map(q => q.id)
    setQuiz({ ids, ans: {}, i: 0, sec: 0, timer: cfg.timer, level: cfg.level, subject: cfg.subject })
    setView('quiz')
  }
  const startExam = plan => {
    const p = QUESTIONS.filter(q => q.level === cfg.level)
    const ids = [...p].sort(() => Math.random() - 0.5).slice(0, Math.min(plan.questions, p.length)).map(q => q.id)
    setQuiz({ ids, ans: {}, i: 0, sec: 0, timer: true, level: cfg.level, subject: plan.label, exam: plan.id })
    setView('quiz')
  }
  const finish = () => {
    const qs = quiz.ids.map(byId)
    const good = qs.filter(q => ok(q, quiz.ans[q.id])).length
    const e = { date: new Date().toISOString(), level: quiz.level, subject: quiz.subject, total: qs.length, good, score: +(good / qs.length * 20).toFixed(1), sec: quiz.sec, timer: quiz.timer }
    const h = [e, ...hist].slice(0, 50)
    setHist(h); sv('ll_hist', h)
    if (quiz.exam) { const y = { ...year, [quiz.level]: { ...(year[quiz.level] || {}), [quiz.exam]: { score: e.score, good, total: e.total } } }; setYear(y); sv('ll_year', y) }
    setRes({ ...e, ids: quiz.ids, ans: quiz.ans, exam: quiz.exam }); setQuiz(null); setView('results')
  }

  const Nav = () => (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-rose/40">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
        <button onClick={() => setView('home')} className="flex items-center gap-2 font-bold text-brand dark:text-lilac text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand rounded">
          <GraduationCap /> Lana Learning
        </button>
        <nav className="flex items-center gap-2">
          <button className="btn-s !py-2" onClick={() => setView('year')}><Award size={18} /><span className="hidden sm:inline">Mon année</span></button>
          <button className="btn-s !py-2" onClick={() => setView('dashboard')}><BarChart3 size={18} /><span className="hidden sm:inline">Tableau de bord</span></button>
          <button className="btn-s !py-2" aria-label="Basculer le mode sombre" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </nav>
      </div>
    </header>
  )

  const Stat = ({ label, v }) => <div className="card text-center"><div className="text-3xl font-extrabold text-brand dark:text-lilac">{v}</div><div className="text-sm opacity-70">{label}</div></div>
  const Resume = () => quiz && view !== 'quiz' ? <button className="btn-s w-full mt-3" onClick={() => setView('quiz')}><Play size={18} /> Reprendre ma session ({Object.keys(quiz.ans).length}/{quiz.ids.length})</button> : null

  let body
  if (view === 'home') body = (
    <>
      <section className="rounded-3xl bg-gradient-to-br from-brand via-lilac to-rose text-white p-8 text-center shadow-xl">
        <HeartPulse className="mx-auto mb-3" size={44} />
        <h1 className="text-3xl sm:text-4xl font-extrabold">Lana Learning</h1>
        <p className="mt-3 max-w-xl mx-auto opacity-95">Révise tes cours de santé avec des quiz inspirés des contrôles continus. Chaque question est corrigée et expliquée : progresse pas à pas, tu en es capable ! 💜</p>
        <button className="btn bg-white text-brand mt-5" onClick={() => setView('setup')}><Play size={18} /> Commencer à réviser</button>
        <button className="btn bg-white/20 text-white mt-5 ml-2" onClick={() => setView('year')}><Award size={18} /> Mon année</button>
      </section>
      <div className="grid grid-cols-3 gap-3 mt-5">
        <Stat label="Quiz effectués" v={stats.n} /><Stat label="Moyenne /20" v={stats.avg} /><Stat label="Progression" v={`${stats.prog}%`} />
      </div>
      <h2 className="font-bold mt-6 mb-2">Niveaux disponibles</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LEVELS.map(l => <div key={l} className="card !p-4"><div className="font-bold text-brand dark:text-lilac">{l}</div><div className="text-sm opacity-70">{LEVEL_NAMES[l]}</div><div className="text-xs mt-1">{QUESTIONS.filter(q => q.level === l).length} questions</div></div>)}
      </div>
      <Resume />
    </>
  )
  else if (view === 'dashboard') body = (
    <>
      <h1 className="text-2xl font-extrabold mb-4">Tableau de bord</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Quiz effectués" v={stats.n} /><Stat label="Score moyen /20" v={stats.avg} /><Stat label="Bonnes réponses" v={stats.good} /><Stat label="Questions disponibles" v={QUESTIONS.length} />
      </div>
      <div className="card mt-4">
        <div className="flex justify-between text-sm mb-1"><span>Progression moyenne</span><span>{stats.prog}%</span></div>
        <div className="h-3 rounded-full bg-blush dark:bg-slate-700 overflow-hidden"><div className="h-full bg-gradient-to-r from-brand to-rose transition-all" style={{ width: `${stats.prog}%` }} /></div>
      </div>
      <h2 className="font-bold mt-6 mb-2">Derniers quiz</h2>
      {hist.length === 0 && <p className="opacity-70">Aucun quiz pour l’instant. Lance ta première révision !</p>}
      <ul className="space-y-2">{hist.slice(0, 8).map((h, i) => (
        <li key={i} className="card !p-3 flex justify-between items-center">
          <span><b>{h.level}</b> · {h.subject}<br /><span className="text-xs opacity-70">{new Date(h.date).toLocaleString('fr-FR')}{h.timer ? ` · ${fmt(h.sec)}` : ''}</span></span>
          <span className="font-extrabold text-brand dark:text-lilac">{h.score}/20</span>
        </li>))}</ul>
      <button className="btn-p w-full mt-4" onClick={() => setView('setup')}><Play size={18} /> Nouvelle révision</button>
      <button className="btn-s w-full mt-3" onClick={() => setView('flags')}><Flag size={18} /> Questions douteuses ({flags.filter(byId).length})</button>
      <Resume />
    </>
  )
  else if (view === 'year') {
    const yr = year[cfg.level] || {}
    const sem = k => { const cc = yr[`s${k}-cc`], sn = yr[`s${k}-sn`]; return cc && sn ? +(cc.score * CC_WEIGHT + sn.score * (1 - CC_WEIGHT)).toFixed(2) : null }
    const s1 = sem(1), s2 = sem(2), done = s1 !== null && s2 !== null
    const moy = done ? +((s1 + s2) / 2).toFixed(2) : 0
    const admis = done && moy >= PASS_MARK
    const mention = moy >= 16 ? 'Très bien' : moy >= 14 ? 'Bien' : moy >= 12 ? 'Assez bien' : 'Passable'
    body = (
      <>
        <h1 className="text-2xl font-extrabold mb-1">Mon année universitaire</h1>
        <p className="text-sm opacity-80 mb-3">Passe les 2 contrôles continus et les 2 sessions normales. Moyenne de chaque semestre : CC {Math.round(CC_WEIGHT * 100)} % + SN {Math.round((1 - CC_WEIGHT) * 100)} %. Admission à partir de {PASS_MARK}/20.</p>
        <div className="flex flex-wrap gap-2 mb-4">{LEVELS.map(l => <button key={l} className={`chip ${cfg.level === l ? 'chip-on' : ''}`} aria-pressed={cfg.level === l} onClick={() => setCfg({ ...cfg, level: l })}>{l}</button>)}</div>
        <div className="space-y-2">{EXAM_PLAN.map(p => {
          const r = yr[p.id]
          return (
            <div key={p.id} className="card !p-4 flex items-center justify-between gap-3">
              <div><div className="font-bold">{p.label}</div><div className="text-xs opacity-70">{p.kind === 'CC' ? 'Contrôle continu' : 'Session normale'} · {Math.min(p.questions, QUESTIONS.filter(q => q.level === cfg.level).length)} questions · chronomètre</div></div>
              <div className="text-right shrink-0">{r && <div className="font-extrabold text-brand dark:text-lilac mb-1">{r.score}/20</div>}<button className="btn-p !py-2 !px-4 text-sm" onClick={() => startExam(p)}><Play size={16} /> {r ? 'Repasser' : 'Passer'}</button></div>
            </div>)
        })}</div>
        <Resume />
        {!done && <p className="text-center text-sm mt-4 opacity-80">Épreuves passées : {EXAM_PLAN.filter(p => yr[p.id]).length}/{EXAM_PLAN.length}. Termine-les toutes pour découvrir ton résultat ! ✨</p>}
        {done && (admis ? (
          <div className="mt-5 rounded-3xl p-1 bg-gradient-to-br from-amber-300 via-rose to-brand shadow-2xl">
            <div className="rounded-[1.4rem] bg-white dark:bg-slate-900 p-6 text-center">
              <div className="text-4xl animate-bounce">🎉🎓🎉</div>
              <p className="tracking-[0.3em] text-xs font-bold text-brand dark:text-lilac mt-2">CERTIFICAT DE RÉUSSITE</p>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-brand to-rose bg-clip-text text-transparent my-2">ADMIS(E) !</h2>
              <p>Tu as validé ton année de <b>{cfg.level}</b></p>
              <div className="text-5xl font-extrabold text-brand dark:text-lilac my-2">{moy}/20</div>
              <p className="font-semibold">Mention : {mention} 🌟</p>
              <p className="text-sm opacity-80 mt-1">S1 : {s1}/20 · S2 : {s2}/20</p>
              <p className="mt-3">Bravo, futur(e) professionnel(le) de santé ! Tu peux être fier(e) de toi 💜🥳</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl p-1 bg-gradient-to-br from-orange-300 via-rose to-lilac shadow-2xl">
            <div className="rounded-[1.4rem] bg-white dark:bg-slate-900 p-6 text-center">
              <div className="text-4xl animate-pulse">🌈💪🌱</div>
              <p className="tracking-[0.3em] text-xs font-bold text-rose-600 mt-2">RÉSULTAT DE L’ANNÉE</p>
              <h2 className="text-4xl font-extrabold text-rose-600 my-2">REFUSÉ(E)… pour l’instant</h2>
              <div className="text-5xl font-extrabold text-brand dark:text-lilac my-2">{moy}/20</div>
              <p className="text-sm opacity-80">S1 : {s1}/20 · S2 : {s2}/20 · il fallait {PASS_MARK}/20</p>
              <p className="mt-3">Ce n’est pas une fin, juste une étape ! Relis les corrections, recommence l’année et tu vas y arriver. Tu es plus proche que tu ne le crois 💜</p>
            </div>
          </div>
        ))}
        {done && <button className="btn-s w-full mt-3" onClick={() => { const y = { ...year }; delete y[cfg.level]; setYear(y); sv('ll_year', y) }}><RotateCcw size={18} /> Recommencer l’année</button>}
      </>
    )
  }
  else if (view === 'flags') body = (
    <>
      <h1 className="text-2xl font-extrabold mb-1">Questions douteuses</h1>
      <p className="text-sm opacity-80 mb-3">Vérifie ces questions avec ton cours, un camarade plus avancé ou les références de ta faculté. En cas de désaccord, ton cours fait foi.</p>
      {flags.filter(byId).length === 0 && <p className="opacity-70">Aucune question signalée pour l’instant. Utilise le bouton « Question douteuse » dans les corrections.</p>}
      <div className="space-y-3">{flags.map(byId).filter(Boolean).map(q => (
        <div key={q.id} className="card">
          <div className="text-xs font-semibold text-brand dark:text-lilac mb-1">{q.level} · {q.subject}</div>
          <p className="font-semibold">{q.q}</p>
          <p className="text-sm mt-2"><b>Réponse proposée :</b> {q.answers.map(i => q.options[i]).join(' · ')}</p>
          <p className="text-sm mt-1 opacity-80">💡 {q.explanation}</p>
          <button className="btn-s !py-1.5 !px-3 text-xs mt-2" onClick={() => toggleFlag(q.id)}><Check size={14} /> Vérifiée, retirer de la liste</button>
        </div>))}</div>
    </>
  )
  else if (view === 'setup') body = (
    <>
      <h1 className="text-2xl font-extrabold mb-4">Préparer mon quiz</h1>
      <div className="card space-y-5">
        <div><h2 className="font-bold mb-2">Niveau</h2><div className="flex flex-wrap gap-2">{LEVELS.map(l => <button key={l} className={`chip ${cfg.level === l ? 'chip-on' : ''}`} aria-pressed={cfg.level === l} onClick={() => setCfg({ ...cfg, level: l })}>{l}</button>)}</div></div>
        <div><h2 className="font-bold mb-2">Matière</h2><div className="flex flex-wrap gap-2">{['Toutes', ...SUBJECTS].map(s => <button key={s} className={`chip ${cfg.subject === s ? 'chip-on' : ''}`} aria-pressed={cfg.subject === s} onClick={() => setCfg({ ...cfg, subject: s })}>{s}</button>)}</div></div>
        <div><h2 className="font-bold mb-2">Nombre de questions : {Math.min(cfg.count, pool.length)} <span className="font-normal opacity-60">(max {pool.length})</span></h2>
          <input type="range" aria-label="Nombre de questions" className="w-full accent-brand" min="1" max={Math.max(pool.length, 1)} value={Math.min(cfg.count, Math.max(pool.length, 1))} onChange={e => setCfg({ ...cfg, count: +e.target.value })} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-brand w-5 h-5" checked={cfg.timer} onChange={e => setCfg({ ...cfg, timer: e.target.checked })} /> <Clock size={18} /> Activer le chronomètre</label>
        {pool.length === 0 && <p className="text-sm text-rose-600 dark:text-rose">Aucune question pour cette combinaison pour l’instant : choisis une autre matière ou ajoute des questions.</p>}
        <button className="btn-p w-full" disabled={!pool.length} onClick={start}><Play size={18} /> Lancer le quiz</button>
      </div>
    </>
  )
  else if (view === 'quiz' && quiz) {
    const q = byId(quiz.ids[quiz.i]); const a = quiz.ans[q.id] || []
    const pick = idx => setQuiz({ ...quiz, ans: { ...quiz.ans, [q.id]: q.type === 'QRM' ? (a.includes(idx) ? a.filter(x => x !== idx) : [...a, idx]) : [idx] } })
    const go = i => setQuiz({ ...quiz, i: Math.max(0, Math.min(quiz.ids.length - 1, i)) })
    const done = Object.keys(quiz.ans).filter(k => quiz.ans[k].length).length
    body = (
      <>
        <div className="flex justify-between text-sm mb-1"><span>Question {quiz.i + 1}/{quiz.ids.length}</span>{quiz.timer && <span className="flex items-center gap-1"><Clock size={14} />{fmt(quiz.sec)}</span>}</div>
        <div className="h-2 rounded-full bg-blush dark:bg-slate-700 overflow-hidden mb-4" role="progressbar" aria-valuenow={done} aria-valuemax={quiz.ids.length}><div className="h-full bg-gradient-to-r from-brand to-rose transition-all" style={{ width: `${done / quiz.ids.length * 100}%` }} /></div>
        <div className="card">
          <div className="text-xs font-semibold text-brand dark:text-lilac mb-2">{q.subject} · {q.type === 'QRM' ? 'Plusieurs réponses possibles' : q.type === 'VF' ? 'Vrai ou faux' : 'Une seule réponse'}</div>
          <h2 className="text-lg font-bold mb-4">{q.q}</h2>
          <div className="space-y-2">{q.options.map((o, i) => (
            <button key={i} role={q.type === 'QRM' ? 'checkbox' : 'radio'} aria-checked={a.includes(i)} onClick={() => pick(i)}
              className={`w-full text-left rounded-xl border-2 p-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${a.includes(i) ? 'border-brand bg-blush dark:bg-slate-700' : 'border-slate-200 dark:border-slate-600 hover:border-lilac'}`}>
              <b className="mr-2 text-brand dark:text-lilac">{q.type === 'VF' ? '' : String.fromCharCode(65 + i)}</b>{o}</button>))}</div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center my-4">{quiz.ids.map((id, i) => <button key={id} aria-label={`Question ${i + 1}`} onClick={() => go(i)} className={`w-9 h-9 rounded-lg text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${i === quiz.i ? 'bg-brand text-white' : quiz.ans[id]?.length ? 'bg-lilac text-white' : 'bg-blush text-brand dark:bg-slate-700 dark:text-lilac'}`}>{i + 1}</button>)}</div>
        <div className="flex gap-2">
          <button className="btn-s" disabled={quiz.i === 0} onClick={() => go(quiz.i - 1)}><ChevronLeft size={18} /> Préc.</button>
          <button className="btn-s flex-1" disabled={quiz.i === quiz.ids.length - 1} onClick={() => go(quiz.i + 1)}><SkipForward size={18} /> {a.length ? 'Suivante' : 'Passer'}</button>
          <button className="btn-p" onClick={() => { if (done === quiz.ids.length || confirm(`${quiz.ids.length - done} question(s) sans réponse. Valider quand même ?`)) finish() }}><Check size={18} /> Valider</button>
        </div>
      </>
    )
  }
  else if (view === 'results' && res) {
    const pct = Math.round(res.good / res.total * 100)
    const msg = pct >= 70 ? 'Félicitations, excellent travail ! 🎉' : pct >= 50 ? 'Bien joué, tu es sur la bonne voie 💜' : 'Courage ! Relis les corrections, la progression viendra 🌱'
    body = (
      <>
        <div className="rounded-3xl bg-gradient-to-br from-brand to-rose text-white p-6 text-center shadow-xl">
          <div className="text-5xl font-extrabold">{res.score}/20</div>
          <div className="mt-1">{pct} % de réussite · {res.good} bonne(s) · {res.total - res.good} mauvaise(s)</div>
          <p className="mt-3 font-semibold">{msg}</p>
        </div>
        <div className="flex gap-2 my-4">
          <button className="btn-p flex-1" onClick={() => setView(res.exam ? 'year' : 'setup')}>{res.exam ? <Award size={18} /> : <RotateCcw size={18} />} {res.exam ? 'Mon année' : 'Recommencer'}</button>
          <button className="btn-s flex-1" onClick={() => setView('dashboard')}><Home size={18} /> Tableau de bord</button>
        </div>
        <h2 className="font-bold mb-2">Correction détaillée</h2>
        <div className="space-y-3">{res.ids.map((id, n) => {
          const q = byId(id); const a = res.ans[id] || []; const good = ok(q, a)
          return (
            <div key={id} className="card">
              <div className={`flex items-center gap-2 font-bold ${good ? 'text-emerald-600' : 'text-rose-600'}`}>{good ? <Check size={18} /> : <X size={18} />} Question {n + 1}</div>
              <p className="font-semibold my-2">{q.q}</p>
              <ul className="space-y-1 text-sm">{q.options.map((o, i) => <li key={i} className={`rounded-lg px-3 py-1.5 ${q.answers.includes(i) ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100' : a.includes(i) ? 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100' : ''}`}>{o}{q.answers.includes(i) ? ' ✓ bonne réponse' : a.includes(i) ? ' ✗ ta réponse' : ''}</li>)}</ul>
              <p className="text-sm mt-2 opacity-80">💡 {q.explanation}</p>
              <button className="btn-s !py-1.5 !px-3 text-xs mt-2" onClick={() => toggleFlag(id)}><Flag size={14} /> {flags.includes(id) ? 'Signalée ✓ (retirer)' : 'Question douteuse'}</button>
            </div>)
        })}</div>
      </>
    )
  } else body = <button className="btn-p" onClick={() => setView('home')}>Retour à l’accueil</button>

  return (
    <div className="min-h-screen px-2 sm:px-4">
      <Nav />
      <main className="max-w-4xl mx-auto my-4 p-4 pb-8 rounded-3xl bg-blush/95 dark:bg-slate-900/90 shadow-2xl shadow-black/20">{body}</main>
      <footer className="text-center text-xs text-white/80 pb-6">Lana Learning · outil de révision, ne remplace pas vos cours ni vos enseignants.</footer>
    </div>
  )
}
