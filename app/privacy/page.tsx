import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import FinalCta from "@/components/home/final-cta";
import MotionReveal from "@/components/shared/motion-reveal";

type Section = {
  title: string;
  paragraphs?: string[];
  groups?: { intro?: string; items: { label: string; body: string }[] }[];
  items?: { label: string; body: string }[];
};

const SECTIONS: Section[] = [
  {
    title: "1. Introduction",
    paragraphs: [
      'Prepmaster ("we" or "Prepmaster") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website https://prepmaster.app/ (the "Site") and use our services (the "Services").',
      "Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Site or use the Services.",
      'We reserve the right to change this Privacy Policy at any time and will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Site or Services after we post any such changes constitutes acceptance of those changes.',
    ],
  },
  {
    title: "2. Information We Collect",
    groups: [
      {
        intro:
          "2.1. We collect personal information that you voluntarily provide to us when you:",
        items: [
          {
            label: "Register for an account",
            body: "Name, email address, phone number, organization name.",
          },
          {
            label: "Use our Services",
            body: "Information related to quizzes, student data (if you are an educator), responses, past questions (if you are a learner) and performance metrics.",
          },
          {
            label: "Interactive Features",
            body: "Any information you provide on the public sections of these features will be considered “public”, unless otherwise required by applicable law, and is not subject to the privacy protections referenced herein.",
          },
          {
            label: "Contact us",
            body: "Name, email address, phone number, and the contents of your message.",
          },
          {
            label: "Participate in surveys or promotions",
            body: "Information you provide in response to surveys or contests.",
          },
        ],
      },
      {
        intro:
          "2.2. We automatically collect certain information about your device and your use of the Site and Services, including:",
        items: [
          {
            label: "Device Information",
            body: "IP address, browser type, operating system, referring/exit pages, cookie identifiers and clickstream data.",
          },
          {
            label: "Usage Information",
            body: "Pages visited, time spent on pages, features used, access times, and anonymous statistics.",
          },
          {
            label: "Log Information",
            body: "Details of how you used our Services, including search queries and error reports.",
          },
        ],
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    paragraphs: ["We use the information we collect for various purposes, including:"],
    items: [
      { label: "3.1", body: "To provide, operate, and maintain our Services." },
      { label: "3.2", body: "To improve, personalize, and expand our Services." },
      { label: "3.3", body: "To understand and analyze how you use our Site and Services." },
      { label: "3.4", body: "To develop new products, services, features, and functionality." },
      {
        label: "3.5",
        body: "To communicate with you, either directly or through one of our partners, for customer service, to provide you with updates and other information relating to the Site and Services, and for marketing and promotional purposes.",
      },
      { label: "3.6", body: "To process your transactions and manage your account." },
      { label: "3.7", body: "To find and prevent fraud." },
      { label: "3.8", body: "To comply with legal obligations." },
    ],
  },
  {
    title: "4. Sharing Your Information",
    paragraphs: ["We may share information we collect about you in the following situations:"],
    items: [
      {
        label: "With Service Providers",
        body: "We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work.",
      },
      {
        label: "For Business Transfers",
        body: "We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.",
      },
      {
        label: "With Affiliates",
        body: "We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy.",
      },
      {
        label: "With Business Partners",
        body: "We may share your information with our business partners to offer you certain products, services, or promotions.",
      },
      {
        label: "With Your Consent",
        body: "We may disclose your information for any other purpose with your consent.",
      },
      {
        label: "For Legal Reasons",
        body: "We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).",
      },
    ],
  },
  {
    title: "5. Data Security",
    paragraphs: [
      "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.",
    ],
  },
  {
    title: "6. Data Retention",
    paragraphs: [
      "We will retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.",
    ],
  },
  {
    title: "7. Your Data Protection Rights",
    paragraphs: [
      "Depending on your location, you may have the following rights regarding your personal information:",
    ],
    items: [
      {
        label: "The right to access",
        body: "You have the right to request copies of your personal data.",
      },
      {
        label: "The right to rectification",
        body: "You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.",
      },
      {
        label: "The right to erasure",
        body: "You have the right to request that we erase your personal data, under certain conditions.",
      },
      {
        label: "The right to restrict processing",
        body: "You have the right to request that we restrict the processing of your personal data, under certain conditions.",
      },
      {
        label: "The right to object to processing",
        body: "You have the right to object to our processing of your personal data, under certain conditions.",
      },
      {
        label: "The right to data portability",
        body: "You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.",
      },
      {
        label: "Response time",
        body: "If you make a request, we have one month to respond to you.",
      },
      {
        label: "Exercising your rights",
        body: "If you would like to exercise any of these rights, please contact us using the contact information provided below.",
      },
    ],
  },
  {
    title: "8. Children's Privacy",
    paragraphs: [
      "Our Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.",
    ],
  },
  {
    title: "9. International Data Transfers",
    paragraphs: [
      "Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, locality, country, or other governmental or geographical jurisdiction where the data protection laws may differ from those of your jurisdiction. If you are located outside Nigeria and choose to provide information to us, please note that we transfer the data, including Personal Data, to Nigeria and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.",
    ],
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base text-muted-[#314158] leading-relaxed">
              This policy explains how we collect, use, and protect your
              information when you use Prepmaster and our services.
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
                {section.groups?.map((group, gi) => (
                  <div key={gi} className="space-y-3">
                    {group.intro && <p>{group.intro}</p>}
                    <ul className="list-disc pl-6 space-y-3 marker:text-muted-[#314158]">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <span className="font-semibold text-[#314158]">
                            {item.label}:
                          </span>{" "}
                          {item.body}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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
