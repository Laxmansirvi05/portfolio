# 📁 Image Files — Where to Place Them

## 📸 Your Profile Photo
Replace the placeholder with your actual blazer photo:
- **Path:** `/portfolio/profile.png`
- Just overwrite the existing `profile.png` with your photo

---

## 🏆 Certificate Images → `/portfolio/images/certs/`

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

## 💻 Project Screenshots → `/portfolio/images/projects/`

| Filename | Project |
|---|---|
| `ai-chatbox.png` | AI Chatbox |
| `ai-resume.png` | AI Resume Generator |
| `weather-app.png` | Weather App |
| `calculator.png` | Advanced Calculator |
| `tictactoe.png` | Tic Tac Toe |

---

## 📧 EmailJS Setup (Contact Form)
Open `script.js` and replace these 3 lines at the top:
```js
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
// ...
'YOUR_EMAILJS_SERVICE_ID'
'YOUR_EMAILJS_TEMPLATE_ID'
```

Steps:
1. Go to https://www.emailjs.com/ → sign up free
2. Add a service (Gmail) → note your **Service ID**
3. Create a template with fields: `from_name`, `from_email`, `subject`, `message`
4. Copy your **Template ID** and **Public Key**
5. Replace the 3 placeholders in script.js

---

## 📄 Resume
Drop your resume PDF as:
- **Path:** `/portfolio/resume.pdf`

---

## 🔗 Update Your Real Links
In `index.html`, update:
- LinkedIn URL → your actual profile
- GitHub URL → your actual profile  
- Phone number → your actual number
