export const metadata = {
  title: "Terms of Service | Apex Executive Advisory",
  description: "Terms of service for executive advisory bookings, corporate retainers, cancellation policies, and platform use.",
};

export default function TermsPage() {
  return (
    <main className="section container">
      <div className="rich-text">
        <h1>Terms of Service</h1>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <p className="text-lg text-brown-brand/80 font-nunito">
              Welcome to Apex Executive Advisory. By accessing our website, booking our services, or participating in our programs, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before using our platform.
            </p>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-brand">
              Last updated: May 2026
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">1. Nature of Services</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              Apex Executive Advisory provides executive coaching, business strategy advisory, leadership masterclasses, and corporate training. <strong className="text-red-500">We are not a crisis center or an emergency medical service.</strong>
            </p>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              Our advisory services focus on organizational strategy, executive performance, and leadership capacity building. They do not constitute formal medical, psychological, or psychiatric treatment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">2. Bookings & Cancellations</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              We operate on a scheduled appointment basis to ensure dedicated time for each client.
            </p>
            <ul className="list-disc list-inside space-y-2 text-brown-brand/80 font-nunito ml-4">
              <li><strong>Confirmation:</strong> Appointments are confirmed once booked through our system and/or payment is received.</li>
              <li><strong>Cancellations:</strong> We require a minimum of 24 hours&apos; notice to cancel or reschedule an appointment without penalty.</li>
              <li><strong>Late Cancellations & No-Shows:</strong> Appointments canceled with less than 24 hours&apos; notice, or missed appointments, may be charged at the full session rate.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">3. Payments & Fees</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              Fees for our services are outlined at the time of booking or during the intake process.
            </p>
            <ul className="list-disc list-inside space-y-2 text-brown-brand/80 font-nunito ml-4">
              <li>Payments must be made in full prior to or at the time of the session, depending on the agreed terms.</li>
              <li>We use secure third-party payment processors. We do not store your credit card details on our servers.</li>
              <li>Any refunds will be processed in accordance with our cancellation policy and at the discretion of management.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">4. User Accounts</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              If you create an account on our platform, you are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate and complete information and to update it as necessary.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">5. Intellectual Property</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              All content on this website, including text, graphics, logos, images, and educational materials, is the property of Apex Executive Advisory or its content creators and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our explicit written permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">6. Limitation of Liability</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              To the fullest extent permitted by law, Apex Executive Advisory shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our website or advisory services. The content on this site is for informational and educational purposes and does not substitute for professional legal, financial, or medical advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">7. Modifications to Terms</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              We reserve the right to update or modify these Terms of Service at any time. Any changes will be effective immediately upon posting to this page. Your continued use of our services constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand">8. Contact Information</h2>
            <p className="text-brown-brand/80 font-nunito leading-relaxed">
              For any questions regarding these terms, please contact us at:
            </p>
            <p className="text-navy-brand font-bold">Email: hello@thesafespaceglobal.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
