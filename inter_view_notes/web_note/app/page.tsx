import Link from "next/link";
import { resources, features, testimonials, pricing } from "@/lib/content";

export default function HomePage() {
  return (
    <div className="wrap">
      {/* Hero Section */}
      <section className="hero book-hero">
        <div className="hero-content">
          <span className="eyebrow">
            <i className="dot" />
            Educational Platform for AI/ML Engineers
          </span>
          <h1>
            Master Your Craft.
            <br />
            One Chapter at a Time.
          </h1>
          <p>
            A sophisticated learning platform designed for educators and
            engineers. Build your interview knowledge with a structured,
            book-like approach to learning.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" href="/auth">
              Start Learning Free
            </Link>
            <Link className="btn" href="/questions">
              Browse Questions
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="book-stack">
            <div className="book book-1"></div>
            <div className="book book-2"></div>
            <div className="book book-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="section-head">
          <div>
            <span className="eyebrow">Why Choose Us</span>
            <h2>Designed for Effective Learning</h2>
            <p>
              Everything you need to prepare for AI/ML interviews, organized
              like a well-structured textbook.
            </p>
          </div>
        </div>
        <div className="grid">
          {features.map((feature, index) => (
            <article className="card feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section alt-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Simple Process</span>
            <h2>How It Works</h2>
            <p>Three simple steps to accelerate your interview preparation.</p>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>
              Sign up in seconds. Your personal learning space is ready
              instantly.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Build Your Question Bank</h3>
            <p>
              Add interview questions, organize by topic, and write detailed
              answers.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Practice Daily</h3>
            <p>
              Follow your routine, track progress, and master each topic
              systematically.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="section" id="resources">
        <div className="section-head">
          <div>
            <span className="eyebrow">Curated Resources</span>
            <h2>Interview Preparation Materials</h2>
            <p>
              Hand-picked resources from the AI/ML community to supplement your
              learning.
            </p>
          </div>
        </div>
        <div className="grid">
          {resources.map((item) => (
            <article className="card" key={item.title}>
              <div className="card-top">
                <span className="icon">{item.icon}</span>
                <span className="tag">{item.tag}</span>
              </div>
              <h3>{item.title}</h3>
              <p>
                Explore this resource for focused AI/ML interview preparation.
              </p>
              <a
                className="card-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore resource ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section alt-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Success Stories</span>
            <h2>Trusted by Engineers</h2>
            <p>
              See how professionals have used our platform to advance their
              careers.
            </p>
          </div>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <article className="card testimonial-card" key={index}>
              <div className="testimonial-content">
                <p>&quot;{testimonial.content}&quot;</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section" id="pricing">
        <div className="section-head">
          <div>
            <span className="eyebrow">Pricing</span>
            <h2>Choose Your Plan</h2>
            <p>Start free, upgrade when you need more power.</p>
          </div>
        </div>
        <div className="pricing-grid">
          {pricing.map((plan, index) => (
            <article
              className={`card pricing-card ${plan.popular ? "popular" : ""}`}
              key={index}
            >
              {plan.popular && (
                <div className="popular-badge">Most Popular</div>
              )}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">{plan.price}</span>
                {plan.period && <span className="period">{plan.period}</span>}
              </div>
              <ul className="features-list">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`btn ${plan.popular ? "primary" : ""}`}>
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="cta-card">
          <h2>Ready to Start Your Journey?</h2>
          <p>
            Join thousands of engineers preparing for their dream AI/ML roles.
          </p>
          <div className="cta-actions">
            <Link className="btn primary" href="/auth">
              Get Started Free
            </Link>
            <Link className="btn" href="/questions">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="mark">PA</span>
            <span>AI Eng Routine</span>
          </div>
          <p>Simple routine. Consistent practice. Better interviews.</p>
        </div>
        <div className="footer-links">
          <Link href="/#features">Features</Link>
          <Link href="/#resources">Resources</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/auth">Login</Link>
        </div>
      </footer>
    </div>
  );
}
