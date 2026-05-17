export const SERVICE_AUDIENCES = [
  { slug: "adults", label: "Adults", keywords: ["adult", "individual", "women", "men"] },
  {
    slug: "children-adolescents",
    label: "Children & Adolescents",
    keywords: ["child", "children", "adolescent", "teen", "student", "youth"],
  },
  { slug: "couples", label: "Couples", keywords: ["couple", "marriage", "relationship"] },
  { slug: "schools", label: "Schools", keywords: ["school", "teacher", "education"] },
  { slug: "workplaces", label: "Workplaces", keywords: ["workplace", "corporate", "organization", "team"] },
] as const;

export type ServiceAudienceSlug = (typeof SERVICE_AUDIENCES)[number]["slug"];

export function matchServiceAudience(audienceCategory?: string | null): ServiceAudienceSlug | null {
  if (!audienceCategory) return null;
  const text = audienceCategory.toLowerCase();
  for (const audience of SERVICE_AUDIENCES) {
    if (audience.keywords.some((k) => text.includes(k))) return audience.slug;
  }
  return null;
}

export function audienceLabelFromSlug(slug: string): string | null {
  return SERVICE_AUDIENCES.find((a) => a.slug === slug)?.label ?? null;
}
