import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import FinalCta from "@/components/home/final-cta";
import MotionReveal from "@/components/shared/motion-reveal";

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "What information do we collect?",
    paragraphs: [
      "Dolor enim eu tortor urna sed duis nulla. Aliquam vestibulum, nulla odio nisl vitae. In aliquet pellentesque aenean hac vestibulum turpis mi bibendum diam. Tempor integer aliquam in vitae malesuada fringilla.",
      "Elit nisi in eleifend sed nisi. Pulvinar at orci, proin imperdiet commodo consectetur convallis risus. Sed condimentum enim dignissim adipiscing faucibus consequat, urna. Viverra purus et erat auctor aliquam. Risus, volutpat vulputate posuere purus sit congue convallis aliquet. Arcu id augue ut feugiat donec porttitor neque. Mauris, neque ultricies eu vestibulum, bibendum quam lorem id. Dolor lacus, eget nunc lectus in tellus, pharetra, porttitor.",
      "Ipsum sit mattis nulla quam nulla. Gravida id gravida ac enim mauris id. Non pellentesque congue eget consectetur turpis. Sapien, dictum molestie sem tempor. Diam elit, orci, tincidunt aenean tempus. Quis velit eget ut tortor tellus. Sed vel, congue felis elit erat nam nibh orci.",
    ],
  },
  {
    title: "How do we use your information?",
    paragraphs: [
      "Dolor enim eu tortor urna sed duis nulla. Aliquam vestibulum, nulla odio nisl vitae. In aliquet pellentesque aenean hac vestibulum turpis mi bibendum diam. Tempor integer aliquam in vitae malesuada fringilla.",
      "Elit nisi in eleifend sed nisi. Pulvinar at orci, proin imperdiet commodo consectetur convallis risus. Sed condimentum enim dignissim adipiscing faucibus consequat, urna. Viverra purus et erat auctor aliquam. Risus, volutpat vulputate posuere purus sit congue convallis aliquet. Arcu id augue ut feugiat donec porttitor neque. Mauris, neque ultricies eu vestibulum, bibendum quam lorem id. Dolor lacus, eget nunc lectus in tellus, pharetra, porttitor.",
      "Ipsum sit mattis nulla quam nulla. Gravida id gravida ac enim mauris id. Non pellentesque congue eget consectetur turpis. Sapien, dictum molestie sem tempor. Diam elit, orci, tincidunt aenean tempus. Quis velit eget ut tortor tellus. Sed vel, congue felis elit erat nam nibh orci.",
    ],
  },
  {
    title: "Do we use cookies and other tracking technologies?",
    paragraphs: [
      "Pharetra morbi libero id aliquam elit massa integer tellus. Quis felis aliquam ullamcorper porttitor. Pulvinar ullamcorper sit dictumst ut eget a, elementum eu. Maecenas est morbi mattis id in ac pellentesque ac.",
    ],
  },
  {
    title: "How long do we keep your information?",
    paragraphs: [
      "Pharetra morbi libero id aliquam elit massa integer tellus. Quis felis aliquam ullamcorper porttitor. Pulvinar ullamcorper sit dictumst ut eget a, elementum eu. Maecenas est morbi mattis id in ac pellentesque ac.",
    ],
  },
  {
    title: "How do we keep your information safe?",
    paragraphs: [
      "Pharetra morbi libero id aliquam elit massa integer tellus. Quis felis aliquam ullamcorper porttitor. Pulvinar ullamcorper sit dictumst ut eget a, elementum eu. Maecenas est morbi mattis id in ac pellentesque ac.",
    ],
  },
  {
    title: "What are your privacy rights?",
    paragraphs: [
      "Pharetra morbi libero id aliquam elit massa integer tellus. Quis felis aliquam ullamcorper porttitor. Pulvinar ullamcorper sit dictumst ut eget a, elementum eu. Maecenas est morbi mattis id in ac pellentesque ac.",
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
              Current as of 20 Jan 2026
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-semibold font-jarkata tracking-[-0.02em] text-[#314158]">
              Privacy Policy
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base text-muted-[#314158] leading-relaxed">
              Your privacy is important to us at Untitled. We respect your
              privacy regarding any information we may collect from you across
              our website.
            </p>
          </MotionReveal>
        </div>
      </section>

      <article className="bg-white font-inter">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
          <MotionReveal className="space-y-5 text-sm sm:text-[15px] leading-7 text-muted-[#314158]">
            <p>
              Mi tincidunt elit, id quisque ligula ac diam, amet. Vel etiam
              suspendisse morbi eleifend faucibus eget vestibulum felis. Dictum
              quis montes, sit sit. Tellus aliquam enim urna, etiam. Mauris
              posuere vulputate arcu amet, vitae nisi, tellus tincidunt. At
              feugiat sapien varius id.
            </p>
            <p>
              Eget quis mi enim, leo lacinia pharetra, semper. Eget in volutpat
              mollis at volutpat lectus velit, sed auctor. Porttitor fames arcu
              quis fusce augue enim. Quis at habitant diam at. Suscipit
              tristique risus, at donec. In turpis vel et quam imperdiet. Ipsum
              molestie aliquet sodales id est ac volutpat.
            </p>
          </MotionReveal>

          {SECTIONS.map((section, idx) => (
            <MotionReveal
              key={section.title}
              delay={0.04 * (idx + 1)}
              className="mt-14"
            >
              <h2 className="text-xl sm:text-2xl font-semibold font-jarkata tracking-[-0.01em] text-[#314158]">
                {section.title}
              </h2>
              <div className="mt-5 space-y-5 text-sm sm:text-[15px] leading-7 text-muted-[#314158]">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </MotionReveal>
          ))}

          <MotionReveal delay={0.3} className="mt-14">
            <h2 className="text-xl sm:text-2xl font-semibold font-jarkata tracking-[-0.01em] text-[#314158]">
              How can you contact us about this policy?
            </h2>
            <div className="mt-5 space-y-5 text-sm sm:text-[15px] leading-7 text-muted-[#314158]">
              <p>
                Sagittis et eu at elementum, quis in. Proin praesent volutpat
                egestas sociis sit lorem nunc nunc sit. Eget diam curabitur mi
                ac. Auctor rutrum lacus malesuada massa ornare et. Vulputate
                consectetur ac ultrices at diam dui eget fringilla tincidunt.
                Arcu sit dignissim massa erat cursus vulputate gravida id. Sed
                quis auctor vulputate hac elementum gravida cursus dis.
              </p>
              <ol className="list-decimal pl-6 space-y-2 marker:text-muted-[#314158]">
                <li>
                  Lectus id duis vitae porttitor enim{" "}
                  <a href="#" className="underline underline-offset-2 hover:text-[#314158]">
                    gravida morbi
                  </a>
                  .
                </li>
                <li>
                  Eu turpis{" "}
                  <a href="#" className="underline underline-offset-2 hover:text-[#314158]">
                    posuere semper feugiat
                  </a>{" "}
                  volutpat elit, ultrices suspendisse. Auctor vel in vitae
                  placerat.
                </li>
                <li>
                  Suspendisse maecenas ac{" "}
                  <a href="#" className="underline underline-offset-2 hover:text-[#314158]">
                    donec scelerisque
                  </a>{" "}
                  diam sed est duis purus.
                </li>
              </ol>
            </div>
          </MotionReveal>
        </div>
      </article>

      <FinalCta />
      <Footer />
    </>
  );
}
