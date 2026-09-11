# 📁 Portfolio Setup Reference

This guide covers the local assets and configuration expected by the portfolio.

## 📸 Profile Photo

Place the profile image at `profile.jpg`, matching the filename referenced by the project structure and page.

---

## 🏆 Certificate Images

Place certificate images in `images/certificates/`.

| Filename | Certificate |
|---|---|
| `aws-ml.png` | AWS Foundations: Machine Learning Basics |
| `ibm-genai.png` | Introduction to Generative AI — IBM SkillsBuild |
| `google-genai.png` | Introduction to Generative AI — Google Cloud |
| `ai-agents.png` | AI Agents for Beginners — Simplilearn SkillUP |
| `claude.png` | Claude Code in Action — Anthropic |
| `github-copilot.png` | Intro to Prompt Engineering w/ GitHub Copilot — Microsoft |
| `python-cisco.png` | Python Essentials 1 — Cisco / OpenEDG |
| `deloitte.png` | Data Analytics Job Simulation — Deloitte / Forage |
| `hp-ai.png` | AI for Beginners — HP LIFE |
| `ai-tools.png` | AI Tools & ChatGPT Workshop — be10x |

---

## 💻 Project Screenshots

Place project screenshots in `images/projects/`.

| Filename | Project |
|---|---|
| `ai-chatbox.png` | AI Chatbox |
| `ai-resume.png` | AI Resume Generator |
| `weather-app.png` | Weather App |
| `calculator.png` | Advanced Calculator |
| `tictactoe.png` | Tic Tac Toe |

---

## 📧 EmailJS Setup

If the contact form uses EmailJS, configure the placeholders in `script.js` with your own credentials. Never commit private keys or other secrets.

1. Create an EmailJS account.
2. Add an email service and note its Service ID.
3. Create a template using the fields expected by `script.js`.
4. Copy the Template ID and Public Key.
5. Replace only the placeholder values in your local copy of `script.js`.

---

## 📄 Resume

Place the resume PDF at the path currently referenced by `index.html`. If you change the filename or location, update both the HTML and this guide.

---

## 🔗 Personal Links

Update the LinkedIn and GitHub links in `index.html` when your public profiles change. Avoid committing private contact information that you do not want published.
