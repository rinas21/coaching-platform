import ContactEnquiryForm from "@/components/ContactEnquiryForm";
import { SITE_INSTAGRAM_PROFILE_URL } from "@/lib/site-instagram";
import Link from "next/link";

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_BOOKING_URL || "https://wa.me/94770000000";

const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || SITE_INSTAGRAM_PROFILE_URL;

export default function ContactPage() {
  const crisisNumbers = [
    { name: "Executive Crisis Support", num: "+94 77 000 0000", loc: "Priority Corporate Advisory" },
    { name: "Boardroom Escalation", num: "+94 11 200 0000", loc: "Urgent Business Escalation" },
    { name: "Global Operations", num: "+1 800 555 0199", loc: "International Desk" },
  ];

  return (
    <main className="min-h-screen pt-24 pb-32 px-4 md:px-8 flex flex-col items-center font-nunito w-full overflow-x-hidden">
      {/* Book Container */}
      <div className="max-w-[1200px] w-full bg-[#f4f2ea] shadow-2xl rounded-sm flex flex-col lg:flex-row relative overflow-hidden text-navy-brand">
        {/* Book Spine / Dotted line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 -translate-x-1/2 border-l border-dotted border-black/10 z-10"></div>

        {/* Left Page */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 relative flex flex-col justify-between min-h-fit lg:min-h-[800px] border-b lg:border-b-0 lg:border-r border-black/5" style={{
          backgroundImage: "radial-gradient(#000000 0.5px, transparent 0.5px)",
          backgroundSize: "12px 12px",
          backgroundColor: "#f5f4f0",
          backgroundPosition: "0 0",
        }}>
          {/* subtle white overlay to dull the dots */}
          <div className="absolute inset-0 bg-[#f5f4f0]/80 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <svg className="w-8 h-8 text-[#8c5e1c]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <div>
                <p className="font-playfair italic text-navy-brand text-lg">Get in touch</p>
              </div>
            </div>

            <h2 className="font-playfair italic text-2xl lg:text-xl text-navy-brand mb-6">Book a Session</h2>
            <p className="text-navy-brand/80 leading-relaxed mb-10 font-medium">
              Choose how you would like to begin. In-person at our studio in Colombo, or online from wherever you are in the world.
            </p>

            <div className="space-y-6 mb-10">
              <div className="bg-[#e9e6dc] p-6 flex gap-4 border border-black/5 shadow-sm">
                <div className="pt-1">
                  <svg className="w-6 h-6 text-[#8c5e1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-playfair text-lg text-navy-brand mb-2">In-Person</h4>
                  <p className="text-navy-brand/80 font-playfair italic text-sm leading-relaxed">
                    Available in person at our studio in Colombo, Sri Lanka. A calm, private space tea included.
                  </p>
                </div>
              </div>

              <div className="bg-[#e9e6dc] p-6 flex gap-4 border border-black/5 shadow-sm">
                <div className="pt-1">
                  <svg className="w-6 h-6 text-[#8c5e1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-playfair text-lg text-navy-brand mb-2">Online</h4>
                  <p className="text-navy-brand/80 font-playfair italic text-sm leading-relaxed">
                    A quiet digital space. Connect via a private, encrypted link from anywhere in the world.
                  </p>
                </div>
              </div>
            </div>

            <Link href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-full bg-[#1b2b24] text-white py-5 px-6 flex items-center justify-center gap-3 tracking-widest text-sm font-semibold hover:bg-[#15221c] transition-colors rounded-sm shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Send us a WhatsApp message
            </Link>
            <p className="text-center text-xs text-navy-brand/50 mt-4 font-playfair italic">
              We reply within a few hours, Monday to Friday (9 AM to 5 PM Sri Lanka time).
            </p>
          </div>
        </div>

        {/* Right Page */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 relative flex flex-col bg-[#efebe1]">
          {/* Removed Watermark */}

          <div className="relative z-10 flex-1 flex flex-col">
            <h2 className="font-playfair italic text-2xl lg:text-xl text-navy-brand mb-2 w-full lg:w-3/4">
              Send us a message
            </h2>
            <p className="text-navy-brand/80 font-nunito mb-12 border-b border-black/10 pb-6 w-full lg:w-3/4">
              We reply within 24 hours.
            </p>

            <ContactEnquiryForm />
          </div>
        </div>

      </div>

      {/* Not Sure Where to Start */}
      <div className="mt-32 max-w-4xl mx-auto text-center w-full px-4">
        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-navy-brand mb-6">
          I’m Not Sure Which Package to Choose.
        </h3>
        <p className="text-lg text-brown-brand/70 font-nunito leading-relaxed mb-10 max-w-2xl mx-auto">
          That’s completely okay. Many leaders who reach out to us feel
          exactly the same way. Send us a message about your business goals and we’ll have a
          strategic conversation first. No pressure, no commitment.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-16 text-center md:text-left bg-white px-10 py-8 rounded-[3rem] shadow-sm max-w-fit mx-auto border border-black/5">
          <div>
            <h4 className="text-[10px] font-bold text-amber-brand uppercase tracking-widest mb-2">
              Email directly
            </h4>
            <p className="font-playfair font-bold text-navy-brand">
              hello@thesafespaceglobal.com
            </p>
          </div>
          <div className="hidden md:block w-px h-10 bg-black/5"></div>
          <div>
            <h4 className="text-[10px] font-bold text-amber-brand uppercase tracking-widest mb-2">
              Follow the journey
            </h4>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="font-playfair font-bold text-navy-brand hover:text-amber-brand transition-colors"
            >
              @thesafespaceglobal
            </a>
          </div>
        </div>
      </div>

      {/* Crisis Support Section */}
      <div className="mt-32 w-full max-w-[1000px] text-center px-4">
        <span className="inline-block px-6 py-2 bg-orange-brand/10 text-orange-brand rounded-full text-[10px] font-bold uppercase tracking-widest mb-8">
          Urgent Escalation
        </span>
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-navy-brand mb-4">
          If you require urgent corporate intervention...
        </h2>
        <p className="text-brown-brand/70 font-nunito mb-16 max-w-2xl mx-auto text-sm md:text-base">
          The Safe Space Global provides priority executive advisory. For immediate business
          turnarounds, high-stakes boardroom conflict resolution, or urgent crisis management,
          please contact our dedicated escalation lines.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {crisisNumbers.map((c, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-brand/30 group hover:border-orange-brand transition-colors relative flex flex-col items-center"
            >
              {i === 2 && (
                <div className="absolute top-8 left-8 w-4 h-4 rounded-full border border-orange-brand flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-orange-brand rounded-full"></div>
                </div>
              )}
              <p className="text-[10px] font-bold text-brown-brand/40 uppercase tracking-[0.2em] mb-4">
                {c.loc}
              </p>
              <h4 className="text-xl font-playfair font-bold text-navy-brand mb-3">
                {c.name}
              </h4>
              <p className="text-2xl font-playfair font-bold text-orange-brand">
                {c.num}
              </p>
            </div>
          ))}
        </div>
        <p className="text-brown-brand/70 font-nunito mt-10 max-w-2xl mx-auto text-sm md:text-base">
          Outside Sri Lanka? Contact our international desk for immediate global support.
        </p>
      </div>
    </main>
  );
}
