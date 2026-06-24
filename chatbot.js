/* ============================================================
   chatbot.js — Hardcoded Q&A chatbot (no API key needed)
   Answers common questions about Gautham, falls back to contact
   ============================================================ */

(function () {
  'use strict';

  // ── Knowledge base: patterns → responses ────────────────
  const KB = [
    {
      patterns: ['skill','tech','stack','language','tool','know','use','expertise','experience with'],
      response: "Gautham's core stack is Python · PySpark · Kafka · Azure · AWS · dbt · Airflow for data engineering, plus LangChain · Claude API · OpenAI GPT for GenAI/RAG work. He's also certified in Terraform, OCI Data Science, and OCI Generative AI. 🛠️"
    },
    {
      patterns: ['project','built','work','portfolio','made','developed','created'],
      response: "Key projects include: FinResearch AI (RAG-powered finance assistant — github.com/zorogotty14/finresearch-ai), a Spotify Music Intelligence Platform with 4 ML models + Claude API, and at IBM: AI Allegation Classifier (~394K records, 95% accuracy), MDM Golden Record Consolidation (20M → 8M records), and a Kafka → Azure Event Hub pipeline. 🚀"
    },
    {
      patterns: ['finresearch','finance','financial','research ai'],
      response: "FinResearch AI is Gautham's featured project — an AI-powered financial research assistant using RAG pipelines and LLM integrations. Check it out at github.com/zorogotty14/finresearch-ai 📊"
    },
    {
      patterns: ['salary','pay','compensation','rate','money','earn','expect','cost'],
      response: "Gautham is targeting Senior / Lead Data Engineer roles in the range of $130,000–$160,000+ USD annually, depending on the role, benefits, and location. He's open to hybrid and remote positions. 💰"
    },
    {
      patterns: ['contact','email','reach','connect','message','get in touch','talk'],
      response: "Best way to reach Gautham is LinkedIn: linkedin.com/in/gautham-gali/ — he responds quickly to professional inquiries. You can also check his GitHub (github.com/zorogotty14) or use the Contact form in this app! 📡"
    },
    {
      patterns: ['linkedin'],
      response: "Gautham's LinkedIn: linkedin.com/in/gautham-gali/ — follow him for updates on projects and career moves! 💼"
    },
    {
      patterns: ['github'],
      response: "Gautham's GitHub: github.com/zorogotty14 — featuring FinResearch AI and other data/ML projects. Give it a ⭐!"
    },
    {
      patterns: ['ibm','arizona','adcs','child safety','government'],
      response: "Gautham is currently at DigiTech (placed via IBM) working on the Arizona Department of Child Safety modernization project since July 2025 — building data pipelines, an AI allegation classifier (~95% accuracy), MDM golden record consolidation (20M → 8M records), and migrating to Azure Synapse. 🏛️"
    },
    {
      patterns: ['certif','certified','credential'],
      response: "Gautham holds certifications in: ML Engineering, OCI Data Science, OCI Generative AI, and HashiCorp Terraform. 🏅"
    },
    {
      patterns: ['hobby','hobbies','free time','interest','outside','fun','game','anime','space'],
      response: "Outside work: Gautham loves space & astronomy (the theme here!), is a huge Tokyo Ghoul fan, plays Teamfight Tactics, does casual options trading, explores real estate, and travels around Arizona. 🌌🎮"
    },
    {
      patterns: ['tft','teamfight','gaming'],
      response: "Gautham plays Teamfight Tactics — calls it 'the perfect game for a data engineer' since it's all about economy management, probability, and meta optimization. 🎮"
    },
    {
      patterns: ['anime','tokyo ghoul','kaneki'],
      response: "Big Tokyo Ghoul fan! Kaneki's character arc is one of his favorites in dark fantasy anime. Always open to new recs! 🎌"
    },
    {
      patterns: ['location','live','based','where','city','phoenix','tempe','arizona'],
      response: "Gautham is based in Tempe / Phoenix, AZ — the Valley of the Sun. He's open to remote and hybrid roles nationwide. ☀️📍"
    },
    {
      patterns: ['education','degree','university','college','study','graduate','virginia','gmu','george mason'],
      response: "Gautham holds an MS in Computer Science from Virginia Tech (Dec 2024, GPA 4.0) and has a background from George Mason University. 🎓"
    },
    {
      patterns: ['available','open','looking','hire','job','role','position','opportunity','recruit'],
      response: "Yes! Gautham is actively exploring Senior / Lead Data Engineer opportunities, especially at top-tier tech companies. Remote/hybrid preferred. Reach out on LinkedIn for a chat! 🎯"
    },
    {
      patterns: ['cloud','azure','aws','gcp'],
      response: "Gautham works across all major clouds — Azure (primary at IBM: Synapse, Functions, Event Hub, Blob), AWS (Glue, EMR, S3, Kinesis, Redshift), and GCP (BigQuery). ☁️"
    },
    {
      patterns: ['kafka','streaming','event','pipeline','spark','pyspark'],
      response: "Gautham has hands-on experience with Kafka (real-time MDM event streaming to Azure Event Hub) and PySpark (medallion architecture pipelines at scale). ⚡"
    },
    {
      patterns: ['ai','ml','machine learning','genai','rag','llm','gpt','claude','langchain'],
      response: "Gautham builds GenAI/RAG systems using LangChain, Claude API, and OpenAI GPT. His AI Allegation Classifier at IBM processes 394K records with ~95% accuracy. He also built the Spotify Intelligence Platform with XGBoost, LightGBM, K-Means, and SVD models. 🤖"
    },
    {
      patterns: ['mdm','master data','golden record'],
      response: "At IBM, Gautham built an MDM Golden Record Consolidation system that de-duplicated ~20M citizen records into ~8M golden records using probabilistic matching and survivorship logic. 🗄️"
    },
    {
      patterns: ['terraform','devops','docker','infrastructure','iac'],
      response: "Gautham is HashiCorp Terraform certified and has built multi-cloud infrastructure automation across Azure, AWS, and GCP using Terraform and Docker. 🔧"
    },
    {
      patterns: ['hello','hi','hey','sup','what\'s up','howdy','greetings'],
      response: "Hey there! 👋 I'm Gautham's portfolio assistant. Ask me about his skills, projects, experience, salary expectations, hobbies, or how to contact him!"
    },
    {
      patterns: ['thank','thanks','great','awesome','cool','nice'],
      response: "Happy to help! 😊 If you want to know more or discuss a role, reach out to Gautham directly on LinkedIn: linkedin.com/in/gautham-gali/"
    },
    {
      patterns: ['who','about','tell me','yourself','introduce','background','story'],
      response: "Gautham Gali is a Senior Data Engineer with 7+ years of experience. Currently at DigiTech (IBM – State of Arizona) since July 2025. Past: George Mason University (Jan 2024–Jul 2025), Informatica LLC (Jan 2021–Jul 2023), Nokia (2020), Orbysol Systems (2018–2020). MS CS from Virginia Tech (GPA 4.0). Based in Tempe, AZ. 👨‍💻"
    },
  ];

  // ── Matcher ──────────────────────────────────────────────
  function findResponse(input) {
    const text = input.toLowerCase();
    for (const entry of KB) {
      if (entry.patterns.some(p => text.includes(p))) {
        return entry.response;
      }
    }
    return null;
  }

  function fallback() {
    return "That's a great question! I don't have a specific answer for that, but Gautham would love to chat. 📡 Reach out directly on LinkedIn: linkedin.com/in/gautham-gali/ — or use the Contact form in the Contact app on this portfolio!";
  }

  // ── UI helpers ───────────────────────────────────────────
  function appendBubble(container, role, text) {
    const div = document.createElement('div');
    div.className = `chat-bubble ${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function appendTyping(container) {
    const div = document.createElement('div');
    div.className = 'chat-bubble bot typing';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('typing-indicator')?.remove();
  }

  // ── Send message flow ────────────────────────────────────
  function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    const msgs   = document.getElementById('chat-messages');
    const input  = document.getElementById('chat-input');
    const sendBtn= document.getElementById('chat-send');
    if (!msgs) return;

    appendBubble(msgs, 'user', text);
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    appendTyping(msgs);

    // Simulate a brief "thinking" delay for realism
    setTimeout(() => {
      removeTyping();
      const reply = findResponse(text) || fallback();
      appendBubble(msgs, 'bot', reply);
      if (sendBtn) sendBtn.disabled = false;
    }, 600 + Math.random() * 400);
  }

  // ── Init ─────────────────────────────────────────────────
  let initialized = false;

  function init() {
    if (initialized) return;

    const input  = document.getElementById('chat-input');
    const sendBtn= document.getElementById('chat-send');
    if (!input || !sendBtn) return;
    initialized = true;

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
    });

    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.textContent.trim()));
    });

    // Greeting
    const msgs = document.getElementById('chat-messages');
    if (msgs && msgs.children.length === 0) {
      appendBubble(msgs, 'bot',
        "Hey! 👋 I'm Gautham's portfolio assistant. Ask me about his skills, projects, salary, contact info, or hobbies — I know it all!");
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    // Re-init when chatbot screen becomes visible
    const screen = document.getElementById('app-chatbot');
    if (screen) {
      new MutationObserver(() => {
        if (screen.style.display !== 'none') init();
      }).observe(screen, { attributes: true, attributeFilter: ['style'] });
    }
  });

})();