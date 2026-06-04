import "./globals.css";

export const metadata = {
  title: "AR Physics — Expert +2 Tuition Center",
  description:
    "AR Physics offers expert coaching in Math, Physics, and Chemistry for Class 11 & 12 students. AC classrooms, smart boards, and an online exam platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
