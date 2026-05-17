import GsapReveal from "@/components/GsapReveal";
import Link from "next/link";
import {
  fetchStrapi,
  getStrapiCollection,
  getStrapiMediaUrl,
} from "@/lib/strapi";
import TeamGallery from "@/components/TeamGallery";
import Team from '@/../public/assets/images/team_avatar-placeholder.png'

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TeamTextChild = { text?: string };
type TeamBlock = { type?: string; children?: TeamTextChild[] };
type TeamMember = {
  documentId?: string;
  name?: string;
  role?: string;
  credentials?: string;
  bio_excerpt?: string;
  bio?: TeamBlock[];
  specialisations?: string[] | string;
  languages?: string[] | string;
  experience_years?: number;
  photo?: { url?: string };
  display_order?: number;
};

function blocksToText(blocks?: TeamBlock[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return blocks
    .map((block) => (block.children ?? []).map((child) => child.text ?? "").join(""))
    .join(" ")
    .trim();
}

function parseList(value?: string[] | string): string {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
      .join(", ");
  }
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        .join(", ");
    }
  } catch {
    // Fall back to plain text below.
  }

  return trimmed;
}

export default async function TeamPage() {
  const TEAM_OVERRIDES: Record<string, { role?: string; name?: string; bio?: string }> = {
    "AAMINA SAMEER": { name: "Aamina Sameer", role: "Special Needs Support & Community Programmes Lead" },
    "ALIFA AMER": {
      name: "Alifa Amer",
      role: "Creative Lead",
      bio: "Alifa is Safe Space Junior's Creative Lead and one of the practice's founding interns. With her background spanning psychology and creative direction, she designs programmes that are as engaging as they are evidence-grounded."
    },
    "AQSA ATIQ": {
      name: "Aqsa Atiq",
      role: "Head of Programmes",
      bio: "Aqsa works with children and teens to build self-awareness, resilience, and the practical skills to handle what life brings — in school, at home, and beyond."
    },
    "NABEEHA HUSSAIN": { name: "Nabeeha Hussain", role: "SEL Facilitator" },
    "ZAHRA IRAM MASUD": {
      name: "Zahra Iram Masud",
      role: "Founder & Clinical Lead",
      bio: "Her practice is guided by one principle: psychological safety is the foundation of everything else."
    }
  };
  const result = await fetchStrapi<{ data?: TeamMember[] }>(
    "/team-members?publicationState=preview&filters[is_active][$eq]=true&populate[0]=photo&sort[0]=display_order:asc&sort[1]=createdAt:asc&sort[2]=name:asc",
    { cache: "no-store", next: { revalidate } },
  );

  const team = result.ok ? getStrapiCollection<TeamMember>(result.data) : [];

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 pb-32">
      <section className="container max-w-[1240px] px-6">
        <GsapReveal delay={0.1}>
          <div className="text-center mb-24">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-6 block underline decoration-amber-brand/30 underline-offset-8">
              The people who do this work
            </span>
            <h1 className="text-5xl md:text-7xl font-playfair font-bold text-navy-brand mb-8 leading-tight">
              The team behind the work.
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-brown-brand/70 font-nunito leading-relaxed">
              At The Safe Space, every team member is chosen for clinical competence and for something harder to define: the ability to be genuinely present with another person&apos;s pain. We work together, under structured supervision, toward outcomes that matter beyond the session.
            </p>
          </div>
        </GsapReveal>

        {team.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center bg-white rounded-[3rem] border border-amber-brand/10 p-12 mb-8">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand mb-4">
              Team profiles are not published yet.
            </h2>
            <p className="text-brown-brand/70 font-nunito mb-8">
              Add and publish team members in Strapi and they will appear here automatically.
            </p>
            <Link href="/contact" className="btn-primary">
              Contact Our Team
            </Link>
          </div>
        ) : (
          <TeamGallery
            team={team.map((member, idx) => {
              const origName = member.name || "";
              const overrides = TEAM_OVERRIDES[origName.toUpperCase()] || {};
              const defaultBio = member.bio_excerpt || blocksToText(member.bio) || "Profile details will be added soon.";
              return {
                documentId: member.documentId || `${idx}`,
                name: overrides.name || origName || "Team Member",
                role: overrides.role || member.role || "Role pending",
                credentials: member.credentials?.trim(),
                bio: overrides.bio || defaultBio,
                imageSrc: getStrapiMediaUrl(member.photo) ?? Team.src,
                specialisations: parseList(member.specialisations),
                languages: parseList(member.languages),
                experience: typeof member.experience_years === "number" && member.experience_years > 0
                  ? `${member.experience_years} years experience`
                  : "",
              };
            })}
          />
        )}

        <GsapReveal delay={0.5} direction="up">
          <div className="text-center pt-10 border-t border-amber-brand/10">
            <p className="text-brown-brand/60 font-nunito italic text-lg max-w-2xl mx-auto leading-relaxed">
              &quot;Every session we deliver is supervised, ethically grounded, and designed with the client&apos;s wellbeing as the only measure of success.&quot;
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link href="/about" className="btn-outline w-full sm:w-auto flex justify-center">
                Read our story
              </Link>
              <Link href="/internship" className="btn-primary w-full sm:w-auto flex justify-center">
                Apply for the Fellowship
              </Link>
            </div>
          </div>
        </GsapReveal>
      </section>
    </main>
  );
}
