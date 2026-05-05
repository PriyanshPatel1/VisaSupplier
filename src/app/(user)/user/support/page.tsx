// "use client";

// import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
// import { useToast } from "@/components/dashboard/toast";
// import { useAuth } from "@/providers/auth-provider";
// import { useSiteContent } from "@/hooks/use-site-content";
// import { csrfHeaders } from "@/lib/csrf";

// type ContactForm = {
//   topic: string;
//   email: string;
//   subject: string;
//   message: string;
// };

// type FeedbackForm = {
//   category: string;
//   email: string;
//   rating: string;
//   message: string;
// };

// const DEFAULT_TOPICS = ["Application status", "Document issue", "Billing", "General question"];
// const FEEDBACK_CATEGORIES = ["UI feedback", "Feature request", "Bug report", "Service feedback"];

// function inputClass() {
//   return "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100";
// }

// function cardClass() {
//   return "rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]";
// }

// async function postSupportMessage(payload: {
//   userName: string;
//   email: string;
//   subject: string;
//   message: string;
//   priority: "low" | "medium" | "high";
// }) {
//   const response = await fetch("/api/support", {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json", ...csrfHeaders() },
//     body: JSON.stringify(payload),
//   });

//   const json = await response.json();
//   if (!response.ok) {
//     throw new Error(json.error ?? "Unable to submit your request.");
//   }
// }

// export default function SupportPage() {
//   const { user } = useAuth();
//   const { showToast } = useToast();
//   const { content } = useSiteContent();

//   const support = content?.support;
//   const topics = support?.topics?.length ? support.topics : DEFAULT_TOPICS;
//   const faqItems = support?.faq?.length
//     ? support.faq
//     : [
//         {
//           question: "How quickly does support respond?",
//           answer: "Most tickets receive a first response within 24 hours.",
//         },
//         {
//           question: "Can I update submitted documents?",
//           answer: "Yes. Open your application and upload replacements from the Documents section.",
//         },
//       ];

//   const [openFaq, setOpenFaq] = useState<number | null>(0);
//   const [sendingTicket, setSendingTicket] = useState(false);
//   const [sendingFeedback, setSendingFeedback] = useState(false);
//   const [ticketForm, setTicketForm] = useState<ContactForm>({
//     topic: "",
//     email: "",
//     subject: "",
//     message: "",
//   });
//   const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
//     category: FEEDBACK_CATEGORIES[0],
//     email: "",
//     rating: "5",
//     message: "",
//   });

//   useEffect(() => {
//     if (!user?.email) return;
//     setTicketForm((prev) => ({ ...prev, email: prev.email || user.email }));
//     setFeedbackForm((prev) => ({ ...prev, email: prev.email || user.email }));
//   }, [user?.email]);

//   const supportMetrics = useMemo(
//     () => [
//       { label: "Response target", value: "24 hrs", detail: "Average first reply" },
//       { label: "Feedback channel", value: "Live", detail: "Routed to admin queue" },
//       { label: "Coverage", value: "24/7", detail: "Application guidance" },
//     ],
//     [],
//   );

//   const onTicketFieldChange = (
//     event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = event.target;
//     setTicketForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const onFeedbackFieldChange = (
//     event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = event.target;
//     setFeedbackForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const submitTicket = async (event: FormEvent) => {
//     event.preventDefault();

//     const email = ticketForm.email.trim().toLowerCase();
//     const subject = ticketForm.subject.trim();
//     const message = ticketForm.message.trim();

//     if (!ticketForm.topic || !subject || !message || !email) {
//       showToast("Please complete all ticket fields.", "error");
//       return;
//     }

//     setSendingTicket(true);
//     try {
//       await postSupportMessage({
//         userName: user?.name ?? "User",
//         email,
//         subject: `[Support][${ticketForm.topic}] ${subject}`,
//         message,
//         priority: "medium",
//       });
//       showToast("Support ticket submitted successfully.", "success");
//       setTicketForm((prev) => ({ ...prev, topic: "", subject: "", message: "" }));
//     } catch (error) {
//       showToast(error instanceof Error ? error.message : "Unable to submit your ticket.", "error");
//     } finally {
//       setSendingTicket(false);
//     }
//   };

//   const submitFeedback = async (event: FormEvent) => {
//     event.preventDefault();

//     const email = feedbackForm.email.trim().toLowerCase();
//     const message = feedbackForm.message.trim();

//     if (!feedbackForm.category || !email || !message) {
//       showToast("Please complete all feedback fields.", "error");
//       return;
//     }

//     setSendingFeedback(true);
//     try {
//       await postSupportMessage({
//         userName: user?.name ?? "User",
//         email,
//         subject: `[Feedback][${feedbackForm.category}] Rating ${feedbackForm.rating}/5`,
//         message,
//         priority: feedbackForm.category === "Bug report" ? "high" : "low",
//       });
//       showToast("Feedback sent. Thank you for helping us improve.", "success");
//       setFeedbackForm((prev) => ({ ...prev, message: "", rating: "5" }));
//     } catch (error) {
//       showToast(error instanceof Error ? error.message : "Unable to submit your feedback.", "error");
//     } finally {
//       setSendingFeedback(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
//         <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
//               Support Desk
//             </p>
//             <h1
//               className="mt-2 text-3xl font-black tracking-tight text-slate-950"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Help, support, and product feedback in one place
//             </h1>
//             <p className="mt-3 max-w-2xl text-sm text-slate-600">
//               Reach the operations team for application help, or send direct product feedback that
//               flows into the admin review queue.
//             </p>

//             <div className="mt-6 grid gap-3 sm:grid-cols-3">
//               {supportMetrics.map((metric) => (
//                 <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-4">
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                     {metric.label}
//                   </p>
//                   <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
//                   <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="grid gap-3">
//             {[
//               {
//                 title: support?.phoneLabel ?? "Phone Support",
//                 value: support?.phoneNumber ?? "Available during business hours",
//                 cta: support?.phoneHref ?? "#",
//                 label: "Call now",
//               },
//               {
//                 title: support?.emailLabel ?? "Email Support",
//                 value: support?.emailAddress ?? "support@visahub.com",
//                 cta: `mailto:${support?.emailAddress ?? "support@visahub.com"}`,
//                 label: "Send email",
//               },
//               {
//                 title: support?.liveChatLabel ?? "Live Chat",
//                 value: support?.liveChatWait ?? "Fastest for simple questions",
//                 cta: "#",
//                 label: "Coming soon",
//               },
//             ].map((channel, index) => (
//               <div key={channel.title} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <p className="text-sm font-semibold text-slate-950">{channel.title}</p>
//                     <p className="mt-1 text-xs text-slate-500">{channel.value}</p>
//                   </div>
//                   <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
//                     {index === 0 ? "Direct" : index === 1 ? "Inbox" : "Realtime"}
//                   </span>
//                 </div>
//                 {channel.cta !== "#" ? (
//                   <a
//                     href={channel.cta}
//                     className="mt-4 inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
//                   >
//                     {channel.label}
//                   </a>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => showToast(support?.liveChatMessage ?? "Live chat is coming soon.", "info")}
//                     className="mt-4 inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
//                   >
//                     {channel.label}
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <div className="grid gap-5 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
//         <section className={cardClass()}>
//           <div className="mb-4">
//             <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Support</p>
//             <h2 className="mt-1 text-xl font-bold text-slate-950">Open a support ticket</h2>
//             <p className="mt-1 text-sm text-slate-500">
//               Best for application blockers, billing issues, or document problems.
//             </p>
//           </div>

//           <form onSubmit={submitTicket} className="space-y-4">
//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                 Topic
//               </label>
//               <select
//                 name="topic"
//                 value={ticketForm.topic}
//                 onChange={onTicketFieldChange}
//                 className={inputClass()}
//               >
//                 <option value="">Select topic</option>
//                 {topics.map((topic) => (
//                   <option key={topic} value={topic}>
//                     {topic}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={ticketForm.email}
//                 onChange={onTicketFieldChange}
//                 className={inputClass()}
//                 autoComplete="email"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                 Subject
//               </label>
//               <input
//                 type="text"
//                 name="subject"
//                 value={ticketForm.subject}
//                 onChange={onTicketFieldChange}
//                 className={inputClass()}
//                 placeholder="Short summary of the issue"
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                 Details
//               </label>
//               <textarea
//                 name="message"
//                 value={ticketForm.message}
//                 onChange={onTicketFieldChange}
//                 rows={5}
//                 className={inputClass()}
//                 placeholder="Share context so the team can resolve it faster"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={sendingTicket}
//               className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {sendingTicket ? "Submitting..." : "Submit Support Ticket"}
//             </button>
//           </form>
//         </section>

//         <section className={cardClass()}>
//           <div className="mb-4">
//             <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Feedback</p>
//             <h2 className="mt-1 text-xl font-bold text-slate-950">Share product feedback</h2>
//             <p className="mt-1 text-sm text-slate-500">
//               Best for UI suggestions, bugs, new feature ideas, or service quality notes.
//             </p>
//           </div>

//           <form onSubmit={submitFeedback} className="space-y-4">
//             <div className="grid gap-4 sm:grid-cols-2">
//               <div>
//                 <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                   Category
//                 </label>
//                 <select
//                   name="category"
//                   value={feedbackForm.category}
//                   onChange={onFeedbackFieldChange}
//                   className={inputClass()}
//                 >
//                   {FEEDBACK_CATEGORIES.map((category) => (
//                     <option key={category} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                   Rating
//                 </label>
//                 <select
//                   name="rating"
//                   value={feedbackForm.rating}
//                   onChange={onFeedbackFieldChange}
//                   className={inputClass()}
//                 >
//                   {["5", "4", "3", "2", "1"].map((rating) => (
//                     <option key={rating} value={rating}>
//                       {rating}/5
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={feedbackForm.email}
//                 onChange={onFeedbackFieldChange}
//                 className={inputClass()}
//                 autoComplete="email"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                 Feedback
//               </label>
//               <textarea
//                 name="message"
//                 value={feedbackForm.message}
//                 onChange={onFeedbackFieldChange}
//                 rows={7}
//                 className={inputClass()}
//                 placeholder="Tell us what is working well, what feels rough, or what should be improved."
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={sendingFeedback}
//               className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {sendingFeedback ? "Sending..." : "Send Feedback"}
//             </button>
//           </form>
//         </section>

//         <section className={cardClass()}>
//           <div className="mb-4">
//             <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">FAQ</p>
//             <h2 className="mt-1 text-xl font-bold text-slate-950">Common questions</h2>
//           </div>

//           <div className="space-y-2">
//             {faqItems.map((item, index) => (
//               <article key={item.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
//                 <button
//                   type="button"
//                   onClick={() => setOpenFaq((prev) => (prev === index ? null : index))}
//                   className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
//                 >
//                   <span className="text-sm font-semibold text-slate-900">{item.question}</span>
//                   <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                     {openFaq === index ? "Hide" : "Open"}
//                   </span>
//                 </button>
//                 {openFaq === index ? (
//                   <div className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
//                     {item.answer}
//                   </div>
//                 ) : null}
//               </article>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/dashboard/toast";
import { useAuth } from "@/providers/auth-provider";
import { useSiteContent } from "@/hooks/use-site-content";
import { csrfHeaders } from "@/lib/csrf";

type ContactForm = {
  topic: string;
  email: string;
  subject: string;
  message: string;
};

type FeedbackForm = {
  category: string;
  email: string;
  rating: string;
  message: string;
};

const DEFAULT_TOPICS = [
  "Application status",
  "Document issue",
  "Billing",
  "General question",
];
const FEEDBACK_CATEGORIES = [
  "UI feedback",
  "Feature request",
  "Bug report",
  "Service feedback",
];

const RATING_LABELS: Record<string, string> = {
  "5": "⭐ Excellent",
  "4": "⭐ Good",
  "3": "⭐ Okay",
  "2": "⭐ Poor",
  "1": "⭐ Terrible",
};

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100";
}

function labelClass() {
  return "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400";
}

async function postSupportMessage(payload: {
  userName: string;
  email: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
}) {
  const response = await fetch("/api/support", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(json.error ?? "Unable to submit your request.");
}

export default function SupportPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { content } = useSiteContent();

  const support = content?.support;
  const topics = support?.topics?.length ? support.topics : DEFAULT_TOPICS;
  const faqItems = support?.faq?.length
    ? support.faq
    : [
        {
          question: "How quickly does support respond?",
          answer: "Most tickets receive a first response within 24 hours.",
        },
        {
          question: "Can I update submitted documents?",
          answer:
            "Yes. Open your application and upload replacements from the Documents section.",
        },
      ];

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sendingTicket, setSendingTicket] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [ticketForm, setTicketForm] = useState<ContactForm>({
    topic: "",
    email: "",
    subject: "",
    message: "",
  });
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    category: FEEDBACK_CATEGORIES[0],
    email: "",
    rating: "5",
    message: "",
  });

  useEffect(() => {
    if (!user?.email) return;
    setTicketForm((p) => ({ ...p, email: p.email || user.email }));
    setFeedbackForm((p) => ({ ...p, email: p.email || user.email }));
  }, [user?.email]);

  const supportMetrics = useMemo(
    () => [
      { label: "Response", value: "24 hrs", detail: "Avg. first reply" },
      { label: "Feedback", value: "Live", detail: "Admin queue" },
      { label: "Coverage", value: "24/7", detail: "App guidance" },
    ],
    [],
  );

  const onTicketFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setTicketForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onFeedbackFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setFeedbackForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submitTicket = async (e: FormEvent) => {
    e.preventDefault();
    const email = ticketForm.email.trim().toLowerCase();
    const subject = ticketForm.subject.trim();
    const message = ticketForm.message.trim();
    if (!ticketForm.topic || !subject || !message || !email) {
      showToast("Please complete all ticket fields.", "error");
      return;
    }
    setSendingTicket(true);
    try {
      await postSupportMessage({
        userName: user?.name ?? "User",
        email,
        subject: `[Support][${ticketForm.topic}] ${subject}`,
        message,
        priority: "medium",
      });
      showToast("Support ticket submitted successfully.", "success");
      setTicketForm((p) => ({ ...p, topic: "", subject: "", message: "" }));
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Unable to submit your ticket.",
        "error",
      );
    } finally {
      setSendingTicket(false);
    }
  };

  const submitFeedback = async (e: FormEvent) => {
    e.preventDefault();
    const email = feedbackForm.email.trim().toLowerCase();
    const message = feedbackForm.message.trim();
    if (!feedbackForm.category || !email || !message) {
      showToast("Please complete all feedback fields.", "error");
      return;
    }
    setSendingFeedback(true);
    try {
      await postSupportMessage({
        userName: user?.name ?? "User",
        email,
        subject: `[Feedback][${feedbackForm.category}] Rating ${feedbackForm.rating}/5`,
        message,
        priority: feedbackForm.category === "Bug report" ? "high" : "low",
      });
      showToast("Feedback sent. Thank you for helping us improve.", "success");
      setFeedbackForm((p) => ({ ...p, message: "", rating: "5" }));
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Unable to submit your feedback.",
        "error",
      );
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative grid gap-6 px-6 py-7 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">
              <span className="h-px w-4 bg-indigo-400" />
              Support Desk
            </span>
            <h1 className="mt-2.5 text-[1.75rem] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              Help, support &amp; feedback
              <br className="hidden sm:block" /> — all in one place.
            </h1>
            <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-slate-500">
              Reach the operations team for application help, or send direct
              product feedback that flows into the admin review queue.
            </p>

            {/* Metrics strip */}
            <div className="mt-5 flex flex-wrap gap-3">
              {supportMetrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {m.label}
                    </p>
                    <p className="text-xl font-black text-slate-950">
                      {m.value}
                    </p>
                    <p className="text-[11px] text-slate-400">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — channels */}
          <div className="flex flex-col gap-2.5">
            {[
              {
                icon: "📞",
                title: support?.phoneLabel ?? "Phone Support",
                value:
                  support?.phoneNumber ?? "Available during business hours",
                cta: support?.phoneHref ?? "#",
                label: "Call now",
                badge: "Direct",
                isButton: false,
              },
              {
                icon: "✉️",
                title: support?.emailLabel ?? "Email Support",
                value: support?.emailAddress ?? "support@visahub.com",
                cta: `mailto:${support?.emailAddress ?? "support@visahub.com"}`,
                label: "Send email",
                badge: "Inbox",
                isButton: false,
              },
              {
                icon: "💬",
                title: support?.liveChatLabel ?? "Live Chat",
                value: support?.liveChatWait ?? "Fastest for simple questions",
                cta: "#",
                label: "Coming soon",
                badge: "Soon",
                isButton: true,
              },
            ].map((ch) => (
              <div
                key={ch.title}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm"
              >
                <span className="text-2xl">{ch.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {ch.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">{ch.value}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {ch.badge}
                </span>
                {ch.isButton ? (
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        support?.liveChatMessage ?? "Live chat is coming soon.",
                        "info",
                      )
                    }
                    className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {ch.label}
                  </button>
                ) : (
                  <a
                    href={ch.cta}
                    className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {ch.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMS + FAQ ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
        {/* Support Ticket */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Support
              </span>
              <h2 className="mt-0.5 text-lg font-extrabold text-slate-950">
                Open a ticket
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Application blockers, billing, or document problems.
              </p>
            </div>
            <span className="rounded-xl bg-indigo-50 p-2 text-lg">🎫</span>
          </div>

          <form onSubmit={submitTicket} className="space-y-3.5">
            <div>
              <label className={labelClass()}>Topic</label>
              <select
                name="topic"
                value={ticketForm.topic}
                onChange={onTicketFieldChange}
                className={inputClass()}
              >
                <option value="">Select topic</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass()}>Email</label>
              <input
                type="email"
                name="email"
                value={ticketForm.email}
                onChange={onTicketFieldChange}
                className={inputClass()}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={labelClass()}>Subject</label>
              <input
                type="text"
                name="subject"
                value={ticketForm.subject}
                onChange={onTicketFieldChange}
                className={inputClass()}
                placeholder="Short summary of the issue"
              />
            </div>

            <div>
              <label className={labelClass()}>Details</label>
              <textarea
                name="message"
                value={ticketForm.message}
                onChange={onTicketFieldChange}
                rows={5}
                className={inputClass()}
                placeholder="Share context so the team can resolve it faster"
              />
            </div>

            <button
              type="submit"
              disabled={sendingTicket}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-900 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingTicket ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                  Submitting…
                </>
              ) : (
                "Submit Ticket →"
              )}
            </button>
          </form>
        </section>

        {/* Feedback */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Feedback
              </span>
              <h2 className="mt-0.5 text-lg font-extrabold text-slate-950">
                Share feedback
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                UI ideas, bugs, feature requests, service notes.
              </p>
            </div>
            <span className="rounded-xl bg-amber-50 p-2 text-lg">💡</span>
          </div>

          <form onSubmit={submitFeedback} className="space-y-3.5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className={labelClass()}>Category</label>
                <select
                  name="category"
                  value={feedbackForm.category}
                  onChange={onFeedbackFieldChange}
                  className={inputClass()}
                >
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass()}>Rating</label>
                <select
                  name="rating"
                  value={feedbackForm.rating}
                  onChange={onFeedbackFieldChange}
                  className={inputClass()}
                >
                  {Object.entries(RATING_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass()}>Email</label>
              <input
                type="email"
                name="email"
                value={feedbackForm.email}
                onChange={onFeedbackFieldChange}
                className={inputClass()}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            {/* Star visual */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setFeedbackForm((p) => ({ ...p, rating: String(s) }))
                  }
                  className={`text-xl transition-transform hover:scale-110 ${s <= Number(feedbackForm.rating) ? "text-amber-400" : "text-slate-200"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <div>
              <label className={labelClass()}>Message</label>
              <textarea
                name="message"
                value={feedbackForm.message}
                onChange={onFeedbackFieldChange}
                rows={7}
                className={inputClass()}
                placeholder="What's working well? What feels rough?"
              />
            </div>

            <button
              type="submit"
              disabled={sendingFeedback}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-900 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingFeedback ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400/30 border-t-slate-700" />{" "}
                  Sending…
                </>
              ) : (
                "Send Feedback →"
              )}
            </button>
          </form>
        </section>

        {/* FAQ */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                FAQ
              </span>
              <h2 className="mt-0.5 text-lg font-extrabold text-slate-950">
                Common questions
              </h2>
            </div>
            <span className="rounded-xl bg-emerald-50 p-2 text-lg">🔍</span>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <article
                  key={item.question}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-indigo-200 bg-indigo-50/40"
                      : "border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className={`text-sm font-semibold transition-colors ${isOpen ? "text-indigo-700" : "text-slate-800"}`}
                    >
                      {item.question}
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${isOpen ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-40" : "max-h-0"}`}
                  >
                    <p className="border-t border-indigo-100/60 px-4 py-3 text-sm leading-relaxed text-slate-500">
                      {item.answer}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom nudge */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Still stuck?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                showToast(
                  support?.liveChatMessage ?? "Live chat coming soon.",
                  "info",
                );
              }}
              className="font-semibold text-indigo-500 hover:underline"
            >
              Start a ticket ↑
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
