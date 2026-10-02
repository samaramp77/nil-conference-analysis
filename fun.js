(function () {
  const moneyRain = document.querySelector('.money-rain');
  if (moneyRain) {
    const symbols = [
      ['$', 'money-symbol'], ['🏈', 'sport-symbol'], ['$', 'money-symbol'],
      ['🏀', 'sport-symbol'], ['$', 'money-symbol'], ['⚾', 'sport-symbol'],
      ['$', 'money-symbol'], ['⚽', 'sport-symbol'], ['$', 'money-symbol'],
      ['🏐', 'sport-symbol'], ['$', 'money-symbol'], ['🏆', 'sport-symbol']
    ];
    for (let i = 0; i < 36; i += 1) {
      const [symbol, className] = symbols[i % symbols.length];
      const item = document.createElement('span');
      item.className = className;
      item.textContent = symbol;
      item.style.setProperty('--money-left', `${Math.round(Math.random() * 100)}%`);
      item.style.setProperty('--fall-time', `${(6 + Math.random() * 8).toFixed(2)}s`);
      item.style.setProperty('--fall-delay', `${(-Math.random() * 12).toFixed(2)}s`);
      item.style.setProperty('--money-size', `${12 + Math.round(Math.random() * 14)}px`);
      item.style.setProperty('--money-drift', `${-35 + Math.round(Math.random() * 70)}px`);
      item.style.setProperty('--money-rotate', `${-25 + Math.round(Math.random() * 50)}deg`);
      moneyRain.appendChild(item);
    }
  }

  const questionNode = document.querySelector('#quizQuestion');
  const optionsNode = document.querySelector('#quizOptions');
  const resultNode = document.querySelector('#quizResult');
  const stepNode = document.querySelector('#quizStep');
  const progressNode = document.querySelector('#quizProgressBar');
  const restartButton = document.querySelector('#quizRestart');
  if (!questionNode || !optionsNode || !resultNode) return;

  const questions = [
    { prompt: 'What matters most when you choose a school?', choices: [{ label: 'Big-stage NIL upside', score: 'spotlight' }, { label: 'A chance to become the star', score: 'opportunity' }, { label: 'A fanbase that lives for the sport', score: 'culture' }, { label: 'The best mix of school + sport', score: 'balance' }] },
    { prompt: 'Pick your ideal game-day energy.', choices: [{ label: 'Loud, packed and nationally watched', score: 'spotlight' }, { label: '“Everybody knows my name”', score: 'opportunity' }, { label: 'Traditions, bands and chaos', score: 'culture' }, { label: 'Competitive but still feels like home', score: 'balance' }] },
    { prompt: 'Your NIL strategy is closest to…', choices: [{ label: 'Build a personal brand', score: 'spotlight' }, { label: 'Turn playing time into leverage', score: 'opportunity' }, { label: 'Own the local community', score: 'culture' }, { label: 'Keep options open and stack experiences', score: 'balance' }] }
  ];
  const results = {
    spotlight: { title: 'The Spotlight Chaser ✨', copy: 'You want the biggest stage and the biggest room for a personal brand. Your NIL map points toward a Power 4 environment, where the modeled market is concentrated and the audience is enormous.', tag: 'Think: Power 4 · brand builder' },
    opportunity: { title: 'The Opportunity Hunter 🎯', copy: 'You see the gap between a giant total and a typical program. A strong fit might be a smaller-market program where playing time, visibility and local deals can make you the headline.', tag: 'Think: Group of 5 · become the story' },
    culture: { title: 'The Culture Builder 🥁', copy: 'You are choosing the whole Saturday experience. Fandom, traditions and community matter as much as a spreadsheet total. That can create a powerful local NIL lane.', tag: 'Think: tradition · community · loyalty' },
    balance: { title: 'The Smart Splitter 🧠', copy: 'You want a real college experience with a serious athletic path. You would probably compare median program value, sport mix and fit instead of chasing one giant headline number.', tag: 'Think: compare the median · then choose' }
  };
  let current = 0;
  let answers = [];

  function renderQuestion() {
    const question = questions[current];
    questionNode.textContent = question.prompt;
    stepNode.textContent = `Question ${current + 1} of ${questions.length}`;
    progressNode.style.width = `${((current + 1) / questions.length) * 100}%`;
    optionsNode.innerHTML = question.choices.map((choice) => `<button class="quiz-option" type="button" data-score="${choice.score}">${choice.label}</button>`).join('');
    optionsNode.querySelectorAll('.quiz-option').forEach((button) => button.addEventListener('click', () => choose(button.dataset.score)));
  }

  function choose(score) {
    answers.push(score);
    if (current < questions.length - 1) { current += 1; renderQuestion(); return; }
    const tally = answers.reduce((counts, answer) => { counts[answer] = (counts[answer] || 0) + 1; return counts; }, {});
    const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
    const result = results[winner];
    questionNode.textContent = 'Your NIL fit is in.';
    optionsNode.innerHTML = '';
    resultNode.hidden = false;
    resultNode.innerHTML = `<strong>${result.title}</strong><p>${result.copy}</p><p class="quiz-tag">${result.tag}</p>`;
    restartButton.hidden = false;
    stepNode.textContent = 'Result unlocked';
    progressNode.style.width = '100%';
  }

  restartButton.addEventListener('click', () => { current = 0; answers = []; resultNode.hidden = true; restartButton.hidden = true; renderQuestion(); });
  renderQuestion();
})();
