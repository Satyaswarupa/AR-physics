import Link from 'next/link'
import LandingNav from '@/components/LandingNav'

// ── Facility cards ──────────────────────────────────────────────────────────
const facilities = [
  {
    icon: '❄️',
    title: 'AC Classrooms',
    desc: 'Fully air-conditioned rooms for a comfortable learning environment year-round.',
  },
  {
    icon: '📶',
    title: 'High-Speed Wi-Fi',
    desc: 'Campus-wide internet access for digital resources and online exams.',
  },
  {
    icon: '🖥️',
    title: 'Smart Boards',
    desc: 'Interactive smart boards in every classroom for visual and engaging lessons.',
  },
  {
    icon: '📚',
    title: 'Study Library',
    desc: 'Curated reference books and past-paper archives available to all students.',
  },
  {
    icon: '💻',
    title: 'Online Exam Portal',
    desc: 'Time-bound MCQ exams with instant results — accessible from any device.',
  },
  {
    icon: '🏆',
    title: 'Result Tracking',
    desc: 'Detailed per-question analysis so students know exactly where to improve.',
  },
]

// ── Subject cards ────────────────────────────────────────────────────────────
const subjects = [
  {
    name: 'Physics',
    icon: '⚡',
    color: 'from-blue-600 to-blue-800',
    topics: ['Mechanics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Thermodynamics'],
  },
  {
    name: 'Mathematics',
    icon: '∑',
    color: 'from-indigo-600 to-indigo-800',
    topics: ['Calculus', 'Algebra', 'Trigonometry', 'Coordinate Geometry', 'Probability'],
  },
  {
    name: 'Chemistry',
    icon: '⚗️',
    color: 'from-teal-600 to-teal-800',
    topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Coordination'],
  },
]

// ── Faculty ──────────────────────────────────────────────────────────────────
const faculty = [
  { name: 'Dr. A. Rajan', subject: 'Physics', exp: '18 years', note: 'IIT alumni — makes quantum mechanics click.' },
  { name: 'Prof. R. Meena', subject: 'Mathematics', exp: '14 years', note: 'Specialist in competitive exam strategies.' },
  { name: 'Ms. S. Priya', subject: 'Chemistry', exp: '11 years', note: 'Known for simplifying organic reaction mechanisms.' },
]

// ── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans text-gray-900">

      {/* ── Navbar ── */}
      <LandingNav />

      {/* ── Hero ── */}
      <section className="pt-16 min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              ⭐ Top-Rated +2 Coaching in the Region
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Excel in <span className="text-yellow-400">Physics,</span>{' '}
              Math &amp; Chemistry
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-xl">
              AR Physics gives Class 11 &amp; 12 students the edge they need — with expert faculty, state-of-the-art facilities, and an integrated online exam platform to track progress.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="rounded-xl bg-yellow-400 text-blue-950 font-bold px-6 py-3 text-sm hover:bg-yellow-300 transition-colors"
              >
                Enrol Now
              </a>
              <Link
                href="/login"
                className="rounded-xl border border-white/30 text-white font-semibold px-6 py-3 text-sm hover:bg-white/10 transition-colors"
              >
                Student Portal →
              </Link>
            </div>
          </div>

          {/* Stats card */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '500+', label: 'Students Coached' },
              { num: '98%', label: 'Pass Rate' },
              { num: '15+', label: 'Years Experience' },
              { num: '3', label: 'Core Subjects' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 border border-white/20 p-6 text-center backdrop-blur">
                <div className="text-4xl font-black text-yellow-400 mb-1">{s.num}</div>
                <div className="text-blue-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Facilities ── */}
      <section id="facilities" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              World-Class <span className="text-blue-800">Facilities</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We invest in the right environment so students can focus entirely on learning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 p-6 transition-colors group"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-800">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects ── */}
      <section id="subjects" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Subjects We <span className="text-blue-800">Teach</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Comprehensive +2 syllabus coverage with a focus on concept clarity and exam technique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((s) => (
              <div key={s.name} className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-7 shadow-lg`}>
                <div className="text-5xl font-black mb-3 opacity-80">{s.icon}</div>
                <h3 className="text-2xl font-black mb-4">{s.name}</h3>
                <ul className="space-y-1.5">
                  {s.topics.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Faculty ── */}
      <section id="faculty" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Meet Our <span className="text-blue-800">Faculty</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Experienced educators dedicated to transforming how students understand science and mathematics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {faculty.map((f) => (
              <div key={f.name} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-3xl font-black mx-auto mb-4">
                  {f.name.split(' ')[1][0]}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{f.name}</h3>
                <p className="text-sm text-blue-700 font-medium mb-1">{f.subject}</p>
                <p className="text-xs text-gray-400 mb-3">{f.exp} experience</p>
                <p className="text-gray-600 text-sm">&ldquo;{f.note}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why AR Physics ── */}
      <section className="py-24 bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              Why Choose <span className="text-yellow-400">AR Physics?</span>
            </h2>
            <div className="space-y-5">
              {[
                { t: 'Small Batch Sizes', d: 'Maximum 25 students per batch so every student gets individual attention.' },
                { t: 'Regular Mock Tests', d: 'Weekly tests via our online portal — identical to board and entrance exam formats.' },
                { t: 'Doubt Sessions', d: 'Dedicated weekly doubt-clearing sessions, both in-person and online.' },
                { t: 'Proven Track Record', d: '12 students in the state top-50 list in the last three years.' },
              ].map((item) => (
                <div key={item.t} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0 flex items-center justify-center text-blue-950 font-black text-sm mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.t}</div>
                    <div className="text-blue-300 text-sm">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/20 p-8 backdrop-blur">
            <div className="text-6xl font-black text-yellow-400 mb-2">98%</div>
            <div className="text-white font-bold text-xl mb-4">Student Pass Rate</div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Our students consistently outperform the state average in board exams and competitive entrance tests including JEE and NEET.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Get in <span className="text-blue-800">Touch</span>
            </h2>
            <p className="text-gray-500">
              Admissions are open. Fill out the form and we&apos;ll contact you within 24 hours.
            </p>
          </div>

          {/* Static contact form — POST handled client-side or via form service */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Student / Parent name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select class —</option>
                <option>Class 11</option>
                <option>Class 12</option>
                <option>Class 12 (Repeater)</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
              <textarea
                rows={3}
                placeholder="Any questions or specific requirements…"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="w-full rounded-xl bg-blue-900 text-white font-bold py-3 text-sm hover:bg-blue-800 transition-colors">
              Send Enquiry
            </button>
          </div>

          {/* Quick contact info */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center text-sm">
            {[
              { icon: '📞', label: 'Call us', value: '+91 98765 43210' },
              { icon: '📧', label: 'Email', value: 'info@arphysics.in' },
              { icon: '📍', label: 'Location', value: 'Main Road, Town Center' },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-100 py-4 px-3">
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-xs text-gray-400 mb-0.5">{c.label}</div>
                <div className="font-medium text-gray-900">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-blue-950 text-blue-300 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-white font-black text-xl">AR <span className="text-yellow-400">Physics</span></div>
          <div className="text-center">
            © {new Date().getFullYear()} AR Physics Tuition Center. All rights reserved.
          </div>
          <Link href="/login" className="hover:text-white transition-colors">
            Student Portal →
          </Link>
        </div>
      </footer>
    </div>
  )
}
