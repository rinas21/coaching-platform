import Link from "next/link";
import { SITE_INSTAGRAM_PROFILE_URL } from "@/lib/site-instagram";
import { fetchStrapi, getStrapiSingle } from "@/lib/strapi";
import FooterReveal from "./FooterReveal";
import NewsletterSignup from "./NewsletterSignup";
import WincoreCredit from "./WincoreCredit";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/../public/assets/logo.png";


type SiteSettingsResponse = {
  data?: {
    support_email?: string | null;
    social_links?: {
      instagram?: string | null;
      linkedin?: string | null;
      whatsapp?: string | null;
      facebook?: string | null;
    } | null;
  } | null;
};

async function Footer() {
  const pillars = [
    { name: "Executive Leadership", link: "/services" },
    { name: "Business Scaling", link: "/services" },
    { name: "Career Advancement", link: "/services" },
    { name: "Corporate Workshops", link: "/services" },
    { name: "Workplace Productivity", link: "/services" },
    { name: "Peer Advisory", link: "/services" },
    { name: "Life Coaching", link: "/services" }
  ];

  const shouldFetchSiteSettings =
    process.env.ENABLE_SITE_SETTINGS === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_SITE_SETTINGS === "true";
  const settingsResult = shouldFetchSiteSettings
    ? await fetchStrapi("/site-setting")
    : null;
  const settings = getStrapiSingle<SiteSettingsResponse["data"]>(
    settingsResult && settingsResult.ok ? settingsResult.data : null,
  );

  const socialLinks = settings?.social_links;
  const email = settings?.support_email || "hello@thesafespaceglobal.com";
  const instagramHref =
    (socialLinks?.instagram && socialLinks.instagram.trim()) ||
    process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
    SITE_INSTAGRAM_PROFILE_URL;
  const linkedinHref =
    (socialLinks?.linkedin && socialLinks.linkedin.trim()) ||
    "https://www.linkedin.com/company/the-safe-space-counselling-coaching/?originalSubdomain=lk";
  const facebookHref =
    (socialLinks?.facebook && socialLinks.facebook.trim()) ||
    "https://www.facebook.com/profile.php?id=100063669529010";
  const whatsappHref =
    socialLinks?.whatsapp?.trim();

  const showSocialRow =
    Boolean(instagramHref) ||
    Boolean(linkedinHref) ||
    Boolean(whatsappHref) ||
    Boolean(facebookHref);

  return (
    <FooterReveal>
      <footer
        className="bg-[url('/assets/images/footer_forest-floor-illustration.png')] bg-top bg-cover bg-no-repeat text-cream-brand relative z-20 mt-auto overflow-hidden isolate"
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="w-full h-full relative pt-24 pb-10">
          <div className="mx-auto max-w-[1240px] px-6 relative z-10">
            <NewsletterSignup />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16 md:mb-20 text-center md:text-left">
              {/* Brand Column */}
              <div className="space-y-8">
                <Link href="/" className="inline-block group mx-auto md:mx-0">

                  <Image
                    src={Logo}
                    alt="TSSG Logo"
                    width={96}
                    height={96}
                    className="h-20 w-20 md:h-28 md:w-28 object-contain transition-all duration-300"
                    priority
                  />
                </Link>
                <p className="text-white/60 font-nunito leading-relaxed max-w-xs mx-auto md:mx-0">
                  Scaling. Optimizing. Leading. <br />
                  A premier executive advisory firm for C-suite leadership, enterprise scaling, and organizational excellence.
                </p>
                {showSocialRow && (
                  <div className="flex gap-5 justify-center md:justify-start">
                    {instagramHref ? (
                      <a
                        href={instagramHref}
                        aria-label="Instagram"
                        className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaInstagram color="var(--primary)" />
                      </a>
                    ) : null}
                    {facebookHref ? (
                      <a
                        href={facebookHref}
                        aria-label="Facebook"
                        className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaFacebook color="var(--primary)" />
                      </a>
                    ) : null}
                    {linkedinHref ? (
                      <a
                        href={linkedinHref}
                        aria-label="LinkedIn"
                        className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaLinkedin color="var(--primary)" />
                      </a>
                    ) : null}
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        aria-label="WhatsApp"
                        className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 text-amber-brand fill-current">
                          <path d="M12 2.5A9.5 9.5 0 0 0 4 17.2L2.5 21.5l4.5-1.4A9.5 9.5 0 1 0 12 2.5Zm0 1.8a7.7 7.7 0 0 1 4.2 14.2l-.3.2-2.7-.8-.5.3-2.7.8.9-2.5-.3-.5A7.7 7.7 0 0 1 12 4.3Zm-2.3 4.2c-.2 0-.4.1-.6.5-.2.4-.8 1-.8 2 0 .9.7 1.9.8 2 .1.1 1.5 2.4 3.8 3.2 1.9.6 2.3.5 2.7.4.4-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.4-.2-.8-.4l-1.3-.6c-.2-.1-.4-.1-.5.1l-.6.8c-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.7-1.2-1.5-1.3-1.8-.1-.2 0-.3.1-.4l.4-.5c.1-.1.2-.2.3-.4.1-.2.1-.3 0-.5l-.6-1.4c-.1-.4-.3-.4-.5-.4h-.4Z" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Pillars Column */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-10">Our Pillars</h4>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-4 font-nunito text-sm">
                  {pillars.map(p => (
                    <li key={p.name}>
                      <Link href={p.link} className="text-white/70 hover:text-amber-brand transition-colors flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-brand/40" />
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paths Column */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-10">The Pathway</h4>
                <ul className="flex flex-col gap-4 font-nunito text-sm">
                  <li><Link href="/about" className="text-white/70 hover:text-amber-brand transition-colors">About Us</Link></li>
                  <li><Link href="/team" className="text-white/70 hover:text-amber-brand transition-colors">Our Team</Link></li>
                  <li><Link href="/internship" className="text-white/70 hover:text-amber-brand transition-colors">Executive Fellowship</Link></li>
                  <li><Link href="/testimonials" className="text-white/70 hover:text-amber-brand transition-colors">Client Stories</Link></li>
                  <li><Link href="/store" className="text-white/70 hover:text-amber-brand transition-colors">Executive Store</Link></li>
                  <li><Link href="/login" className="text-white/70 hover:text-amber-brand transition-colors">Log in</Link></li>
                  <li><Link href="/account" className="text-white/70 hover:text-amber-brand transition-colors">My account</Link></li>
                </ul>
              </div>

              {/* Contact Column */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-10">Reach Out</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-brand/60 mb-1">Email</p>
                    <p className="text-sm font-playfair">{email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-brand/60 mb-1">Intake</p>
                    <p className="text-sm font-playfair">Available Globally</p>
                  </div>
                  <Link href="/booking" className="inline-block w-full text-center bg-amber-brand text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-navy-brand transition-all shadow-xl shadow-amber-brand/10">
                    Book Consultation
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                &copy; {new Date().getFullYear()} Apex Executive Advisory. Handcrafted for Excellence.
              </p>
              <WincoreCredit />
              <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10 text-[10px] uppercase tracking-widest font-bold">
                <Link href="/privacy" className="text-white/30 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-white/30 hover:text-white transition-colors">Terms</Link>
                <Link href="/contact" className="text-white/30 hover:text-white transition-colors">Corporate Escalation</Link>
              </div>
            </div>
          </div>

          {/* Decorative Orbs */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-brand/5 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-sage-brand/5 rounded-full blur-[100px] pointer-events-none z-0" />
        </div>
      </footer>
    </FooterReveal>
  );
}

export default Footer;
