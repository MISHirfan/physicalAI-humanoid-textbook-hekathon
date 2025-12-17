import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import React from 'react';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', 'hero--transparent')} style={{ padding: '4rem 0', textAlign: 'left' }}>
      <div className="container">
        <div className="row">
          <div className="col col--7" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Heading as="h1" className="hero__title">
              The Future of <br />
              <span style={{
                background: 'linear-gradient(90deg, #00e5ff, #bd34fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}>Physical AI</span>
            </Heading>
            <p className="hero__subtitle" style={{ fontSize: '1.5rem', opacity: 0.8, marginTop: '1rem' }}>
              Master Humanoid Robotics, VLA Models, and Sim-to-Real Transfer with our interactive, AI-powered textbook.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                Start Learning 🚀
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/signup">
                Create Account
              </Link>
            </div>
          </div>
          <div className="col col--5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="img/hero_bot.svg" alt="AI Robot Hero" style={{ width: '100%', maxWidth: '500px', filter: 'drop-shadow(0 0 30px rgba(189, 52, 254, 0.3))' }} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Feature({ title, description, icon }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="card" style={{ height: '100%', padding: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p style={{ opacity: 0.8 }}>{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Home`}
      description="Physical AI & Humanoid Robotics Textbook">
      <HomepageHeader />
      <main>
        <div className="container" style={{ padding: '4rem 0' }}>
          <div className="row">
            <Feature
              icon="🧠"
              title="Foundation Models"
              description="Learn how Vision-Language-Action (VLA) models like RT-2 and Prism allow robots to understand the world."
            />
            <Feature
              icon="🦾"
              title="Sim-to-Real"
              description="Train policies in NVIDIA Isaac Lab and deploy them to hardware using Domain Randomization and SysID."
            />
            <Feature
              icon="💬"
              title="AI Assistant"
              description="Stuck? Our RAG-powered chatbot contextually answers questions based on the textbook content."
            />
          </div>
        </div>

        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(189, 52, 254, 0.1))',
            padding: '3rem',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Heading as="h2">Ready to build the next generation of robots?</Heading>
            <p>Join students and researchers mastering Physical AI.</p>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
