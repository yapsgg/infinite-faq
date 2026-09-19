import { InfiniteFaq } from "infinite-faq"

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <InfiniteFaq
        endpoint="/api/faq"
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Can't find an answer? Ask your own question below."
        maxLines={6}
        items={[
          {
            question: "What is infinite-faq?",
            answer:
              "An AI-powered FAQ. Keep your static questions and let visitors ask anything — the answer streams in and joins the list.",
          },
          {
            question: "Can I change the design?",
            answer:
              "Yes. Every part accepts Tailwind class overrides through the `classNames` prop.",
          },
        ]}
      />
    </main>
  )
}
