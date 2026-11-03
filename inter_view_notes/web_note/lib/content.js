export const content = {
  meta: {
    siteTitle: "Parvez AI Eng Routine",
    brandMark: "PA",
    hero: {
      eyebrow: "Personal learning dashboard",
      titleLine1: "Prepare with focus.",
      titleLine2: "Build interview confidence.",
      description:
        "A simple home for AI/ML interview resources, hands-on coding practice, and your daily study routine. Keep it consistent, one problem at a time.",
      primaryCta: { label: "Practice on LeetML ↗", url: "https://leetml.org/" },
      secondaryCta: {
        label: "Open Excel problem tracker ↗",
        url: "https://docs.google.com/spreadsheets/d/1bp1rbBAdUY1kVHD86aSO1NHAPJ9pfE8S2DT0N_4G_9A/edit?usp=sharing",
      },
    },
    nav: [
      { label: "Resources", href: "#resources" },
      { label: "Routine", href: "/routine" },
      { label: "Questions", href: "/question" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    footer: {
      left: "Parvez AI Eng Routine",
      right: "Simple routine. Consistent practice. Better interviews.",
    },
  },
  tracker: {
    heading: "Problem tracker",
    subheading: "Keep your solved questions and progress in one place.",
    cardTitle: "AI Engineer — Excel / Google Sheets problem list",
    cardDescription: "Your linked spreadsheet for tracking coding problems and study progress.",
    buttonLabel: "Open spreadsheet ↗",
    buttonUrl:
      "https://docs.google.com/spreadsheets/d/1bp1rbBAdUY1kVHD86aSO1NHAPJ9pfE8S2DT0N_4G_9A/edit?usp=sharing",
  },
  performance: {
    heading: "📈 Performance over time",
    statsLabels: {
      total: "Total tasks completed",
      days: "Active days",
      streak: "Current streak",
    },
  },
  resources: {
    heading: "Interview resources",
    subheading: "Curated links for real-world preparation and practice.",
    items: [
      ["AI", "Guide · 2026", "AIMLInterviews", "https://github.com/alirezadir/AIMLInterviews"],
      ["ML", "Question bank", "MLQuestions", "https://github.com/topics/machine-learning-interview-questions"],
      ["★", "Curated", "Awesome AI Interviews", "https://github.com/JustInCache/awesome-ai-interviews"],
      ["DL", "Reference", "AI/ML/DL Interview Resources", "https://github.com/DengZhiyuan-math/awesome-ai-ml-dl-interview-resources/blob/main/README.md"],
      ["LC", "Community", "LeetCode Discuss", "https://leetcode.com/discuss/"],
      ["LM", "Practice", "LeetML", "https://leetml.org/problems.html"],
    ].map(([icon, tag, title, linkUrl]) => ({
      icon,
      tag,
      title,
      linkUrl,
      linkText: "Explore resource ↗",
      description: `Explore ${title} for focused AI/ML interview preparation.`,
    })),
  },
};
