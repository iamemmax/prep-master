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
    title: "1. Introduction",
    paragraphs: [
      'Prepmaster ("we" or "Prepmaster") uses cookies and similar tracking technologies on our website (prepmaster.app) (the "Site") and in our services (the "Services").',
      'This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, your choices regarding cookies, and how you can manage your cookie preferences.',
      "By using our Site or Services, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree to the use of cookies, you should adjust your browser settings accordingly or refrain from using our Site and Services.",
    ],
  },
  {
    title: "2. What Are Cookies?",
    paragraphs: [
      "Cookies are small text files that are stored on your device (computer, tablet, smartphone, etc.) when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.",
      'Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device for a specified period of time or until you delete them manually. Session cookies are temporary and are deleted when you close your web browser.',
    ],
  },
  {
    title: "3. How We Use Cookies",
    paragraphs: ["We use cookies for various purposes, including:"],
    items: [
      {
        label: "Essential Cookies",
        body: "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work.",
      },
      {
        label: "Performance Cookies",
        body: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies, we will not know when you have visited our site.",
      },
      {
        label: "Functionality Cookies",
        body: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, then some or all of these services may not function properly.",
      },
      {
        label: "Targeting Cookies",
        body: "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store personal information directly, but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will experience less targeted advertising.",
      },
      {
        label: "Analytics Cookies",
        body: "These cookies help us understand how visitors interact with our website and services. We use this information to compile reports and help us improve the site. The cookies collect information in a way that does not directly identify anyone, including the number of visitors to the website and blog, where visitors have come to the website from, and the pages they visited.",
      },
    ],
  },
  {
    title: "4. Third-Party Cookies",
    paragraphs: [
      "In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through our Site:",
    ],
    items: [
      {
        label: "Google Analytics",
        body: "This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.",
      },
      {
        label: "Social Media Platforms",
        body: "Our site may feature social media sharing buttons and/or links. These sites may set cookies through their own scripts. We have no control over the cookies used by these platforms. You should check their individual privacy policies to understand how they use cookies.",
      },
    ],
  },
  {
    title: "5. Managing Cookies",
    paragraphs: [
      "You can control and/or delete cookies as you wish. You can delete all cookies that are already on your device and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.",
      "Most web browsers automatically accept cookies, but you can modify your browser setting to decline cookies if you prefer. If you choose to decline cookies, you may not be able to fully experience the interactive features of the Prepmaster Services or websites you visit.",
      "To find information relating to other browsers, you are advised to visit the browser developer's website.",
    ],
  },
  {
    title: "6. Changes to This Cookie Policy",
    paragraphs: [
      'We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.',
      "You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.",
    ],
  },
];

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base text-muted-[#314158] leading-relaxed">
              How Prepmaster uses cookies and similar tracking technologies across
              our website and services, and the choices you have.
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
                  <ol className="list-decimal pl-6 space-y-3 marker:text-muted-[#314158]">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <span className="font-semibold text-[#314158]">
                          {item.label}:
                        </span>{" "}
                        {item.body}
                      </li>
                    ))}
                  </ol>
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
