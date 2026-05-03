import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import FinalCta from "@/components/home/final-cta";
import MotionReveal from "@/components/shared/motion-reveal";

type Section = {
  title: string;
  paragraphs?: string[];
  items?: { label: string; body: string }[];
};

const SECTIONS: Section[] = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      'By accessing or using Prepmaster (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.',
      "We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the updated Terms.",
    ],
  },
  {
    title: "2. Eligibility",
    paragraphs: [
      "You must be at least 13 years old to use the Service. By using Prepmaster, you represent that you meet this age requirement and that the information you provide is accurate and complete.",
    ],
  },
  {
    title: "3. Your Account",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access or security breach.",
    ],
  },
  {
    title: "4. Acceptable Use",
    paragraphs: [
      "When using the Service you agree not to:",
    ],
    items: [
      {
        label: "Misuse the Service",
        body: "Attempt to gain unauthorized access, disrupt the Service, or interfere with other users' enjoyment of it.",
      },
      {
        label: "Share content unlawfully",
        body: "Upload, share, or distribute content that infringes intellectual property rights or violates applicable law.",
      },
      {
        label: "Abuse practice content",
        body: "Scrape, redistribute, or resell questions, explanations, or other practice material generated through the Service.",
      },
      {
        label: "Misrepresent yourself",
        body: "Create accounts using false information or impersonate any person or entity.",
      },
    ],
  },
  {
    title: "5. Subscriptions and Payments",
    paragraphs: [
      "Some features of the Service require a paid subscription or credits. Pricing, billing cycles, and refund policies are described at the point of purchase. Subscriptions renew automatically unless cancelled before the renewal date.",
    ],
  },
  {
    title: "6. Intellectual Property",
    paragraphs: [
      "All content provided through the Service — including questions, explanations, study plans, and software — is owned by or licensed to Prepmaster and is protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal study purposes only.",
    ],
  },
  {
    title: "7. User Content",
    paragraphs: [
      "You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, royalty-free license to use, display, and process that content as needed to operate and improve the Service.",
    ],
  },
  {
    title: "8. Termination",
    paragraphs: [
      "We may suspend or terminate your access to the Service at any time, with or without notice, if you breach these Terms or use the Service in a way that could harm us or other users. You may stop using the Service at any time.",
    ],
  },
  {
    title: "9. Disclaimer of Warranties",
    paragraphs: [
      'The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or produce any specific exam outcome.',
    ],
  },
  {
    title: "10. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, Prepmaster shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.",
    ],
  },
  {
    title: "11. Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to its conflict-of-law principles. Any disputes shall be resolved in the courts located in Nigeria.",
    ],
  },
  {
    title: "12. Contact",
    paragraphs: [
      "Questions about these Terms can be sent to support@prepmaster.app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <section className="bg-[#F9F9F9] font-inter">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <MotionReveal>
            <p className="text-sm font-medium text-primary">
              Last Updated 03 May 2026
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-semibold font-jarkata tracking-[-0.02em] text-[#314158]">
              Terms of Service
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base text-muted-[#314158] leading-relaxed">
              The rules that govern your use of Prepmaster and our services.
              Please read them carefully.
            </p>
          </MotionReveal>
        </div>
      </section>

      <article className="bg-white font-inter">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
          {SECTIONS.map((section, idx) => (
            <MotionReveal
              key={section.title}
              delay={0.04 * (idx + 1)}
              className={idx === 0 ? "" : "mt-14"}
            >
              <h2 className="text-xl sm:text-2xl font-semibold font-jarkata tracking-[-0.01em] text-[#314158]">
                {section.title}
              </h2>
              <div className="mt-5 space-y-5 text-sm sm:text-[15px] leading-7 text-muted-[#314158]">
                {section.paragraphs?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {section.items && (
                  <ul className="list-disc pl-6 space-y-3 marker:text-muted-[#314158]">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <span className="font-semibold text-[#314158]">
                          {item.label}:
                        </span>{" "}
                        {item.body}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </MotionReveal>
          ))}
        </div>
      </article>

      <FinalCta />
      <Footer />
    </>
  );
}
