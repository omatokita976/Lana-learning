# Lana Learning 🩵
Plateforme de quiz de révision (Niveau 4 → Doctorat, filières santé, 20 questions par niveau). React + Vite + Tailwind + Lucide, données en LocalStorage.

## Installation
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # génère dist/
```

## Ajouter des questions
Éditez uniquement `src/data/questions.js` (champs : id unique, level, subject, type QCM/QRM/VF, q, options, answers = indices des bonnes réponses, explanation, difficulty).
⚠️ Faites valider le contenu médical par un enseignant avant diffusion.

## Déploiement sur Vercel
1. Poussez le dossier sur GitHub.
2. Sur vercel.com : **Add New → Project** → importez le dépôt.
3. Framework : **Vite** · Build : `npm run build` · Output : `dist` (déjà dans `vercel.json`).
4. **Deploy**. L'application est en page unique (navigation interne sans routes), donc aucune erreur 404.

## Structure
- `src/App.jsx` : vues (accueil, tableau de bord, préparation, quiz, résultats)
- `src/data/questions.js` : banque de questions
- `src/index.css` : thème Tailwind
