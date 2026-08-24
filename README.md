# 🏥 Hafiz Clinic & Diagnostic Center (حافظ کلینک اینڈ ڈائیگنوسٹک سینٹر)
### Comprehensive Hospital Management System (HMS), Telehealth & Clinical ERP Suite

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-teal.svg)](https://tailwindcss.com/)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide_React-green.svg)](https://lucide.dev/)
[![Bilingual](https://img.shields.io/badge/Language-Urdu_%7C_English-amber.svg)](#bilingual-experience)

---

## 📖 Overview (تعارف و جائزہ)

**Hafiz Clinic & Advanced Diagnostic Center** is a full-featured, production-ready Hospital Information System (HIS / ERP) and Telemedicine platform tailored for clinics, maternity homes, specialty centers, and herbal/unani healthcare facilities in Pakistan and worldwide.

The application features full **bilingual localization (Urdu Nastaliq & English)**, real-time Role-Based Access Control (RBAC), end-to-end patient lifecycle tracking from OPD reception to IPD admission, automated WhatsApp alerts, high-definition audio/video telemedicine calls, interactive voice notes, and digital prescription/slip printing.

---

## 🌟 Key Functional Modules (بنیادی ماڈیولز)

### 1. 🩻 Specialized Diagnostic Laboratories & Imaging
* **Digital X-Ray & Radiology Center**: Image viewer, DICOM-style preview, diagnostic measurements, clinical impressions, automated film reporting.
* **Pathology & Blood Testing Lab**: Complete Hematology, Biochemistry, CBC, Lipid Profile, Liver Function Tests (LFTs), and Kidney Function Tests (RFTs) with normal range indicators and automated status flags.
* **Computerized Eye & Refraction Scan**: Visual acuity (Sphere, Cylinder, Axis, Add) chart, auto-refractor printouts, prescription generation for glasses and lenses.
* **Ultrasound & Sonography Clinic**: Multi-organ scan reports, gestational age calculators, sonographic print templates.
* **Physiotherapy & Rehabilitation**: Treatment regimen tracking, exercise prescriptions, and physical therapy session schedules.

### 2. 👨‍⚕️ Doctor & OPD Telemedicine Suite
* **Interactive OPD Consultation**: Patient clinical history, vital signs analysis, ICD-style diagnosis picker, and instant electronic prescriptions (Rx).
* **WhatsApp-Style Telehealth Chat**:
  * Real-time messaging with live typing indicators and read receipts.
  * In-app WhatsApp-like **Audio and Video Calls** with live timer, mic/camera toggle, and ringtone audio synthesizer.
  * Permanent cross-browser **Voice Notes Recorder & Player** using WAV base64 encoding.
  * Direct file/report/X-Ray image upload and attachments.
* **Direct Digital Slip Sharing**:
  * One-click sharing of 4 slip types: **Prescription (Rx)**, **OPD Token Fee**, **Diagnostic Lab Token**, and **Discharge Invoice**.
  * Instant WhatsApp formatted message export.
  * High-resolution **A4 Printable PDF preview** with clinic stamp and doctor signatures.

### 3. 🏥 IPD (Inpatient) & Ward Incharge
* **Bed & Ward Management**: Visual real-time bed layout (General Ward, Semi-Private, Private VIP Rooms, ICU/CCU).
* **Admission & Discharge Workflows**: Admission tokens, initial deposit tracking, surgical notes, daily doctor rounds, and automated final discharge summary calculations.

### 4. 🩺 24/7 Nursing Care & Inpatient Vitals Portal
* **4-Hourly Vitals Flowsheet**: Temperature (°F), Blood Pressure (Sys/Dia), Heart Rate (BPM), Respiratory Rate, SpO2 (%), and Blood Sugar (RBS/FBS).
* **Medication Administration Record (MAR)**: Scheduled nursing dose checklist with timestamped nurse confirmation.
* **Intake / Output Monitoring**: IV Fluids, Oral fluids, Urine output, and drain volume balance.
* **Doctor Order Confirmation**: Real-time sync of emergency physician instructions to duty nurses.

### 5. 💊 Smart Pharmacy POS & Herbal Store
* **Point of Sale (POS)**: Barcode lookup, batch and expiry date alerts, stock management, instant receipt thermal print.
* **Unani / Herbal Medicine Integration**: Traditional herbal remedies, tonics (شراب، معجون، حبوب), ingredients, and dosage guidelines.
* **E-Commerce & Home Delivery Hub**: Patient-facing medicine delivery order placement with status tracking.

### 6. 📺 Live OPD Queue TV Display & Audio Announcer
* **Waiting Area Display**: Full-screen LCD display showing current calling token, patient name, assigned doctor, and room number.
* **Urdu Voice Caller**: Integrated speech announcer: *"ٹوکن نمبر 12، جناب محمد علی، روم نمبر 1 میں تشریف لائیں۔"*
* **Live Status Indicator**: Waiting, In-Consultation, Completed, or Emergency priority flags.

### 7. 💼 Administration & Financial Shift Accounts
* **Shift Audits & Cash In Hand**: Morning/Evening/Night shift cash registers, OPD collections, pharmacy sales, lab income, and daily expenses.
* **Audit PDF Export**: Single-click shift closing report for clinic administrators and owners.
* **Role-Based Access Control (RBAC)**: Distinct permissions and pin codes for Admin, Doctors, Lab Technicians, Nurses, and Pharmacists.

---

## 🛠️ Architecture & Tech Stack

```
├── Framework: React 18 (SPA with TypeScript)
├── Build Tool: Vite
├── Styling: Tailwind CSS (Modern Utility-first with RTL/Urdu support)
├── Icons: Lucide React (Clean, accessible vector icon suite)
├── Animations: Motion (Framer Motion React primitives)
├── Persistence: Local Storage / Memory Storage with Server Sync Mock Service
└── State Management: Modular React Hooks & Custom Context Providers
```

---

## 📁 Project Structure (فائل سٹرکچر)

```
├── public/                     # Static assets and icons
├── src/
│   ├── components/             # Modular UI components
│   │   ├── AdminPanel.tsx              # Hospital master settings and user roles
│   │   ├── DoctorPatientChatView.tsx   # Telehealth WhatsApp-style chat, video & slips
│   │   ├── DoctorPortalView.tsx        # OPD doctor clinic desk & clinical notes
│   │   ├── IpdWardManagementView.tsx   # Inpatient admission, bed allocation & discharge
│   │   ├── NursingCarePortalView.tsx   # 4-hourly vitals, MAR & nursing shifts
│   │   ├── OpdQueueScreenView.tsx      # Waiting area TV display & voice caller
│   │   ├── PathologyLabView.tsx        # Blood, Urine & Chemical pathology tests
│   │   ├── EyeCareView.tsx             # Computerized eye refraction scan
│   │   ├── SmartPharmacyPosView.tsx    # POS checkout & medicine inventory
│   │   ├── ShiftAccountsView.tsx       # Daily cash in hand & shift audit report
│   │   ├── PatientPortalView.tsx       # Patient self-service health records & history
│   │   └── ... (Store, Delivery, Services, Blog, Footer, Header)
│   ├── data/                   # Initial seeds (doctors, diseases, inventory, tests)
│   ├── services/               # Mock API endpoints, storage handlers & call signaling
│   ├── types.ts                # TypeScript domain models and schemas
│   ├── index.css               # Tailwind CSS declarations and Urdu fonts
│   ├── main.tsx                # React virtual DOM entrypoint
│   └── App.tsx                 # Root router and role navigation gateway
├── metadata.json               # Platform configuration and metadata
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Comprehensive documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone or Download the Project**:
   ```bash
   git clone <repository_url>
   cd hafiz-clinic-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to access the live portal.

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 👥 Default Demo Credentials & Roles (ڈیمو لاگ ان)

| Role | Default Name | Access Area |
| :--- | :--- | :--- |
| **Administrator** | ایڈمنسٹریٹر | Hospital Master Settings, Shift Reports, Staff Accounts |
| **Chief Physician / Doctor** | ڈاکٹر زیشان چوہدری | OPD Consultations, Telehealth, Digital Prescription Rx |
| **Eye Specialist** | ڈاکٹر عائشہ خان | Computerized Eye Scan & Vision Prescriptions |
| **Pathologist / Lab Incharge** | ڈاکٹر طارق محمود | Blood Pathology, CBC, LFTs, RFTs, Urine Test Reports |
| **Staff Nurse** | سسٹر کلثوم اختر | Inpatient 4-Hourly Vitals Sheet, MAR & Nursing Notes |
| **Pharmacist** | محمد عثمان (فارماسسٹ) | Pharmacy POS, Inventory, Stock Expiry & Sales |
| **Patient** | مریض پورٹل | Appointments, Digital Slips, Telehealth Chat, Store |

---

## 📱 Mobile & Tablet Responsiveness

The user interface is engineered mobile-first with touch-friendly targets (minimum 44px), sticky bottom navigation bars for smartphones, and responsive multi-column bento grids for high-resolution desktop clinic workstations and wall-mounted TV screens.

---

## 🔒 Security & Privacy

* No patient clinical data is leaked across unauthenticated tabs.
* All audio notes, voice recordings, and attachments are processed safely within browser memory and local storage buffers.
* Fully prepared for production integration with secure Cloud APIs, PostgreSQL, or Firebase Firestore backends.

---

## 📄 License & Attribution

Developed with pride for **Hafiz Clinic & Advanced Diagnostic Center (حافظ کلینک اینڈ ڈائیگنوسٹک سینٹر)**.  
All medical guidelines, herbal formulas, and test parameters are designed to assist qualified healthcare professionals.
