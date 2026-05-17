export const metadata = {
  title: "Privacy Policy | The Safe Space Global",
  description: "How The Safe Space Global collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="section container">
      <div className="rich-text">
        <h1>Privacy Policy</h1>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <p className="text-lg text-brown-brand/80 font-nunito">
              At The Safe Space Global, we take your privacy and confidentiality seriously. This Privacy Policy outlines how we collect, use, store, and protect your personal information when you use our website, services, or communicate with our team.
            </p>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-brand">
              Last updated: May 2026
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">1. Information We Collect</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              We collect information to provide you with effective executive advisory and maintain a highly secure corporate environment. The types of data we collect include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-brown-brand/80 font-nunito ml-4">
              <li><strong>Contact Information:</strong> Your name, email address, phone number, and emergency contact details.</li>
              <li><strong>Corporate & Intake Data:</strong> Information you provide during intake forms, consultations, or sessions (e.g., business structure, organizational challenges, reasons for seeking executive advisory).</li>
              <li><strong>Payment Information:</strong> Billing details used to process payments through our secure third-party payment processors.</li>
              <li><strong>Technical Data:</strong> Information collected automatically when you use our website, such as IP address, browser type, and cookies.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">2. How We Use Your Information</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              Your information is used strictly to deliver our services securely and effectively. We use your data to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-brown-brand/80 font-nunito ml-4">
              <li>Schedule, manage, and facilitate consultations, executive coaching sessions, or corporate masterclasses.</li>
              <li>Communicate important updates regarding your appointments or account.</li>
              <li>Process payments and maintain billing records.</li>
              <li>Improve our website performance and user experience.</li>
            </ul>
            <p className="text-brown-brand/80 font-nunito font-bold">We never sell, rent, or trade your personal information to third parties.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">3. Confidentiality & Disclosure</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              As a premium executive coaching firm, confidentiality is the cornerstone of our work. Everything shared in your sessions remains strictly confidential between you and your executive advisor, covered by robust non-disclosure standards, except in the following mandatory legal reporting scenarios:
            </p>
            <ul className="list-disc list-inside space-y-2 text-brown-brand/80 font-nunito ml-4">
              <li>There is a clear and immediate risk of severe harm to yourself or someone else.</li>
              <li>There is suspected abuse or neglect of a child, elder, or vulnerable adult.</li>
              <li>We are required by a formal legal subpoena or court order.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">4. Data Storage & Security</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              We implement industry-standard security measures, including encryption and secure servers, to protect your personal and corporate data against unauthorized access, alteration, or disclosure. Executive advisory notes are stored separately from general user data on secure, compliant platforms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">5. Your Rights</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              Depending on your jurisdiction, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-brown-brand/80 font-nunito ml-4">
              <li>Request access to the personal data we hold about you.</li>
              <li>Ask us to correct or update inaccurate information.</li>
              <li>Request the deletion of your data (subject to legal and corporate record-keeping requirements).</li>
              <li>Opt-out of non-essential communications.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">6. Contact Us</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact our team at:
            </p>
            <p className="text-navy-brand font-bold">Email: hello@thesafespaceglobal.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
