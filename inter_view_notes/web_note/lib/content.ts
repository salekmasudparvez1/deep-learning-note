export const resources = [
  ["AI", "Guide · 2026", "AIMLInterviews", "https://github.com/alirezadir/AIMLInterviews"],
  ["ML", "Question bank", "MLQuestions", "https://github.com/topics/machine-learning-interview-questions"],
  ["★", "Curated", "Awesome AI Interviews", "https://github.com/JustInCache/awesome-ai-interviews"],
  ["DL", "Reference", "AI/ML/DL Interview Resources", "https://github.com/DengZhiyuan-math/awesome-ai-ml-dl-interview-resources/blob/main/README.md"],
  ["LC", "Community", "LeetCode Discuss", "https://leetcode.com/discuss/"],
  ["LM", "Practice", "LeetML", "https://leetml.org/problems.html"],
].map(([icon, tag, title, url]) => ({ icon, tag, title, url }));

export const features = [
  {
    icon: "📚",
    title: "Structured Learning Paths",
    description: "Curated interview questions organized by topic, difficulty, and category. Build your knowledge systematically."
  },
  {
    icon: "🎯",
    title: "Daily Practice Routine",
    description: "Consistent daily tasks to maintain momentum. Track your progress and stay accountable to your learning goals."
  },
  {
    icon: "💡",
    title: "Smart Knowledge Base",
    description: "Store and review your answers with detailed explanations. Build a personal library of interview knowledge."
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description: "Monitor your learning journey with status updates. See what you've mastered and what needs more work."
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description: "Your questions and routine data are encrypted and private. Only you have access to your learning materials."
  },
  {
    icon: "⚡",
    title: "Fast & Focused",
    description: "No distractions, just learning. A clean interface designed for deep work and effective study sessions."
  }
];

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "ML Engineer at Google",
    content: "This platform helped me prepare systematically for my ML interviews. The daily routine feature kept me accountable and the question bank was incredibly comprehensive."
  },
  {
    name: "Marcus Rodriguez",
    role: "Data Scientist at Meta",
    content: "I love the book-like interface for reviewing questions. It feels like studying from a well-organized textbook. The progress tracking is excellent for maintaining momentum."
  },
  {
    name: "Emily Watson",
    role: "AI Researcher at OpenAI",
    content: "The structured approach to interview preparation is exactly what I needed. Being able to organize questions by topic and difficulty made my study sessions much more efficient."
  }
];

export const pricing = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Access to question bank",
      "Daily routine tracking",
      "Basic progress tracking",
      "Up to 50 questions",
      "Community support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    features: [
      "Unlimited questions",
      "Advanced analytics",
      "Custom categories",
      "Export to PDF",
      "Priority support",
      "API access"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Shared question banks",
      "Admin dashboard",
      "SSO integration",
      "Custom branding"
    ],
    cta: "Contact Sales",
    popular: false
  }
];
