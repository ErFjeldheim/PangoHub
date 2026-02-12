export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  departments: {
    name: string;
    role: string;
    hours: number;
    requiredSkills: string[];
  }[];
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "info-site",
    name: "Information Website",
    description: "A standard responsive website with CMS integration, blog, and contact forms.",
    estimatedHours: 60,
    departments: [
      {
        name: "Design",
        role: "UI/UX Designer",
        hours: 20,
        requiredSkills: ["UI Design", "Figma", "Web Design"],
      },
      {
        name: "Teknologi",
        role: "Frontend Developer",
        hours: 40,
        requiredSkills: ["React", "Tailwind CSS", "Next.js"],
      },
    ],
  },
  {
    id: "ecommerce",
    name: "Ecommerce Website",
    description: "Full-scale online store with product management, cart, and payment integration.",
    estimatedHours: 160,
    departments: [
      {
        name: "Strategi",
        role: "Product Owner",
        hours: 20,
        requiredSkills: ["Product Strategy", "Market Analysis"],
      },
      {
        name: "Design",
        role: "UX Designer",
        hours: 40,
        requiredSkills: ["UX Research", "Wireframing", "Ecommerce Design"],
      },
      {
        name: "Teknologi",
        role: "Fullstack Developer",
        hours: 100,
        requiredSkills: ["Next.js", "Stripe", "Database Design", "Node.js"],
      },
    ],
  },
  {
    id: "brand-package",
    name: "Brand Package",
    description: "Complete visual identity including logo, typography, and brand guidelines.",
    estimatedHours: 70,
    departments: [
      {
        name: "Strategi",
        role: "Brand Strategist",
        hours: 10,
        requiredSkills: ["Branding", "Market Positioning"],
      },
      {
        name: "Design",
        role: "Graphic Designer",
        hours: 60,
        requiredSkills: ["Logo Design", "Typography", "Visual Identity", "Illustrator"],
      },
    ],
  },
  {
    id: "strategic-analysis",
    name: "Strategic Analysis",
    description: "In-depth market analysis and business growth strategy for new markets.",
    estimatedHours: 80,
    departments: [
      {
        name: "Strategi",
        role: "Business Consultant",
        hours: 80,
        requiredSkills: ["Market Research", "Business Strategy", "Data Analysis", "Financial Modeling"],
      },
    ],
  },
];

export const HOURLY_RATE = 675;
