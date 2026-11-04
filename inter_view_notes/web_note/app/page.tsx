import Link from "next/link";
import { resources } from "@/lib/content";

export default function HomePage() {
  return <div className="wrap">
    <section className="hero"><span className="eyebrow"><i className="dot"/>Personal learning dashboard</span>
      <h1>Prepare with focus.<br/>Build interview confidence.</h1>
      <p>A simple home for AI/ML interview resources, hands-on coding practice, and your daily study routine. Keep it consistent, one problem at a time.</p>
      <div className="hero-actions"><a className="btn primary" href="https://leetml.org/">Practice on LeetML ↗</a><Link className="btn" href="/routine">Open daily routine</Link></div>
    </section>
    <section className="section" id="resources"><div className="section-head"><div><h2>Interview resources</h2><p>Curated links for real-world preparation and practice.</p></div></div>
      <div className="grid">{resources.map((item) => <article className="card" key={item.title}><div className="card-top"><span className="icon">{item.icon}</span><span className="tag">{item.tag}</span></div><h3>{item.title}</h3><p>Explore this resource for focused AI/ML interview preparation.</p><a className="card-link" href={item.url}>Explore resource ↗</a></article>)}</div>
    </section>
    <footer className="footer">Simple routine. Consistent practice. Better interviews.</footer>
  </div>;
}
