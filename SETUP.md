# 📁 Portfolio — File & Setup Reference

## 📸 Profile Photo
- **Path:** `profile.jpg` (repo root) — overwrite with your photo. Also used as the social-share image.

---

## 🏆 Certificate Images → `images/certificates/`

| Filename | Certificate |
|---|---|
| `aws-ml.png` | AWS Foundations: Machine Learning Basics |
| `cisco-python.png` | Python Essentials 1 — Cisco / OpenEDG |
| `simplilearn-ai-agents.png` | AI Agents for Beginners — Simplilearn SkillUP |
| `deloitte-data.png` | Data Analytics Job Simulation — Deloitte / Forage |
| `microsoft-prompt.png` | Intro to Prompt Engineering w/ GitHub Copilot — Microsoft |
| `anthropic-claude.jpg` | Claude Code in Action — Anthropic |
| `hp-ai.png` | AI for Beginners — HP LIFE |
| `google-genai.png` | Introduction to Generative AI — Google Cloud |
| `be10x-ai-tools.png` | AI Tools & ChatGPT Workshop — be10x |
| `ibm-genai.png` | Introduction to Generative AI — IBM SkillsBuild |

---

## 💻 Project Screenshots → `images/projects/`

| Filename | Project |
|---|---|
| `ai-chatbox.png` | AI Chatbox |
| `ai-resume.png` | AI Resume Generator |
| `weather-app.png` | Weather App |
| `calculator.png` | Advanced Calculator |
| `tictactoe.png` | Tic Tac Toe |

---

## 📄 Resume
- **Path:** `assets/Laxman_Sirvi_Resume.pdf`

---

## 📧 EmailJS Setup (Contact Form)
The contact form works without setup — it falls back to opening the visitor's mail
app. To send mail directly via EmailJS instead, set the 3 values at the top of `script.js`:

```js
const EMAILJS_PUBLIC_KEY  = '...'; // from emailjs.com → Account → API Keys
const EMAILJS_SERVICE_ID  = '...'; // Email Services → your service
const EMAILJS_TEMPLATE_ID = '...'; // Email Templates → your template
```

Template fields to create: `from_name`, `from_email`, `subject`, `message`.

---

## 🔗 Personal Links (in `index.html`)
- LinkedIn → `linkedin.com/in/laxmansirvi`
- GitHub → `github.com/Laxmansirvi05`
- Phone / WhatsApp → `+91 8688137388`
- `canonical` / `og:url` → set to your deployed domain
