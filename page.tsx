"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "48px 24px" }}>
      <section style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 24, marginBottom: 16 }}>🏠 HOME PAGE <span style={{color:'#28a745',fontSize:14,marginLeft:8}}>DEPLOY VERSION UPDATED</span></div>

        <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>
          Turn Long Videos Into Viral Shorts — Automatically
        </h1>
        <p style={{ fontSize: 18, color: "#555", marginTop: 12 }}>
          Create Reels, YouTube Shorts, and TikToks from one video using AI.
          <br />
          No editing skills. No wasted time.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <Link href="/auth/signup" style={{
            padding: "12px 18px",
            backgroundColor: "#111",
            color: "white",
            borderRadius: 8,
            fontWeight: 700,
            textDecoration: "none"
          }}>
            Get Started
          </Link>
          <Link href="/features" style={{
            padding: "12px 18px",
            backgroundColor: "#f2f2f2",
            color: "#111",
            borderRadius: 8,
            fontWeight: 700,
            textDecoration: "none",
            border: "1px solid #e5e5e5"
          }}>
            View Features
          </Link>
        </div>

        <div style={{ marginTop: 40, textAlign: "left" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>How It Works</h2>
          <ul style={{ listStyle: "disc", paddingLeft: 20, color: "#333" }}>
            <li>Upload a long video</li>
            <li>AI removes silence, adds captions, and creates shorts</li>
            <li>Download or publish instantly</li>
          </ul>
        </div>

        <div style={{ marginTop: 32, textAlign: "left" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Why Creators Choose Us</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <li className="dashboard-card" style={{ padding: 16 }}>• Save hours of editing</li>
            <li className="dashboard-card" style={{ padding: 16 }}>• Create more content with less effort</li>
            <li className="dashboard-card" style={{ padding: 16 }}>• Optimized for short-form platforms</li>
            <li className="dashboard-card" style={{ padding: 16 }}>• Built for growth-focused creators</li>
          </ul>
        </div>

        <div style={{ marginTop: 36 }}>
          <h3 style={{ fontSize: 22, marginBottom: 8 }}>CTA</h3>
          <p style={{ color: "#555" }}>Start turning your videos into short-form content today.</p>
          <Link href="/auth/signup" style={{
            display: "inline-block",
            marginTop: 12,
            padding: "12px 18px",
            backgroundColor: "#111",
            color: "white",
            borderRadius: 8,
            fontWeight: 700,
            textDecoration: "none"
          }}>Get Started</Link>
        </div>
      </section>
    </main>
  );
}
