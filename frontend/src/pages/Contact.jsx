import { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Send,
  ChevronDown,
} from "lucide-react";
import { Header, PromoBar, Breadcrumb, PageShell } from "../components/Layout";
import { supabase } from "../services/supabaseClient";


/* =========================================================
   Contact Info Card
========================================================= */

function ContactInfoCard() {
  const socials = [
    {
      Icon: Facebook,
      href: "https://facebook.com",
      hover: "hover:bg-blue-600",
      label: "Facebook",
    },
    {
      Icon: Twitter,
      href: "https://twitter.com",
      hover: "hover:bg-sky-500",
      label: "Twitter",
    },
    {
      Icon: Instagram,
      href: "https://instagram.com",
      hover: "hover:bg-pink-600",
      label: "Instagram",
    },
    {
      Icon: Linkedin,
      href: "https://www.linkedin.com/in/mian-muhammad-usman-9b2919228/",
      hover: "hover:bg-blue-700",
      label: "LinkedIn",
    },
    {
      Icon: Youtube,
      href: "https://youtube.com",
      hover: "hover:bg-red-600",
      label: "YouTube",
    },
  ];

  return (
    <div className="space-y-6 rounded-xl bg-slate-100 p-6">
      {/* US Office */}
      <div>
        <p className="text-xs font-bold uppercase text-stone-500">
          United States (Head Quarter)
        </p>
        <div className="mt-3 space-y-2 text-sm sm:text-base">
          <p className="flex items-start gap-2 text-black">
            <MapPin size={16} className="mt-1 shrink-0 text-green-600" />
            <span>152 Thatcher Road St, Manhattan, 10463, US</span>
          </p>
          <p className="flex items-center gap-2 text-black">
            <Phone size={16} className="shrink-0 text-green-600" />
            <a href="tel:+02538862516" className="hover:text-green-600">
              (+025) 3886 25 16
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} className="shrink-0 text-green-600" />
            <a
              href="mailto:hello@rovadotechmart.com"
              className="text-green-600 underline hover:text-green-700"
            >
              hello@rovadotechmart.com
            </a>
          </p>
        </div>
      </div>

      {/* UK Office */}
      <div className="border-t border-stone-300 pt-6">
        <p className="text-xs font-bold uppercase text-stone-500">
          United Kingdom (Branch)
        </p>
        <div className="mt-3 space-y-2 text-sm sm:text-base">
          <p className="flex items-start gap-2 text-black">
            <MapPin size={16} className="mt-1 shrink-0 text-green-600" />
            <span>12 Buckingham Rd, Thornthwaite, HG3 4TY, UK</span>
          </p>
          <p className="flex items-center gap-2 text-black">
            <Phone size={16} className="shrink-0 text-green-600" />
            <a href="tel:+7188955350" className="hover:text-green-600">
              (+718) 895-5350
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} className="shrink-0 text-green-600" />
            <a
              href="mailto:contact@rovadotech.co.uk"
              className="text-green-600 underline hover:text-green-700"
            >
              contact@rovadotech.co.uk
            </a>
          </p>
        </div>
      </div>

      {/* Socials */}
      <div className="flex gap-2 border-t border-stone-300 pt-6">
        {socials.map(({ Icon, href, hover, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`grid size-9 place-items-center rounded-full bg-white text-black transition ${hover} hover:text-white`}
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Contact Form
========================================================= */

function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "United States (US)",
    subject: "",
    message: "",
    subscribe: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!form.firstName.trim() || !form.lastName.trim()) {
    setError("First and last name are required.");
    return;
  }
  if (!form.email.trim()) {
    setError("Email is required.");
    return;
  }
  if (!form.message.trim()) {
    setError("Message is required.");
    return;
  }

  setSubmitting(true);

  // ✅ Real Supabase insert
  const { error: insertError } = await supabase.from("contacts").insert({
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    country: form.country,
    subject: form.subject.trim() || null,
    message: form.message.trim(),
    subscribe: form.subscribe,
  });

  setSubmitting(false);

  if (insertError) {
    console.error("[contact] insert error:", insertError);
    setError("Failed to send message: " + insertError.message);
    return;
  }

  setSuccess("✓ Your message has been sent! We'll reply within 24 hours.");
  setForm({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "United States (US)",
    subject: "",
    message: "",
    subscribe: false,
  });

  setTimeout(() => setSuccess(""), 5000);
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-stone-500">
        Contact us for all your questions and opinions
      </p>

      {/* Names */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm">
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm">
            Last Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm">
          Email Address <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm">
          Phone Number <span className="text-stone-500">(Optional)</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600"
        />
      </div>

      {/* Country */}
      <div>
        <label className="mb-2 block text-sm">
          Country / Region <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full appearance-none rounded-md border border-stone-300 bg-white px-3 py-3 pr-10 text-sm outline-none focus:border-green-600"
          >
            <option>United States (US)</option>
            <option>United Kingdom (UK)</option>
            <option>Pakistan (PK)</option>
            <option>Canada (CA)</option>
            <option>Australia (AU)</option>
            <option>Germany (DE)</option>
            <option>France (FR)</option>
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="mb-2 block text-sm">
          Subject <span className="text-stone-500">(Optional)</span>
        </label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="How can we help?"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600"
        />
      </div>

      {/* Message */}
      <div>
        <label className="mb-2 block text-sm">Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Note about your order, e.g. special note for delivery"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600"
        />
      </div>

      {/* Subscribe checkbox */}
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="subscribe"
          checked={form.subscribe}
          onChange={handleChange}
          className="mt-1 size-4 cursor-pointer accent-green-600"
        />
        <span className="text-black">
          I want to receive news and updates once in a while. By submitting, I'm
          agreed to the{" "}
          <a href="#" className="text-green-600 underline">
            Terms &amp; Conditions
          </a>
        </span>
      </label>

      {/* Errors / Success */}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-600">
          {success}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-xs font-medium uppercase text-white transition hover:bg-green-700 disabled:opacity-60"
      >
        <Send size={14} />
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

/* =========================================================
   Map Section
========================================================= */

function MapSection() {
  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold uppercase">Find Us on Google Map</h2>
        <a
          href="https://maps.google.com/?q=152+Thatcher+Road+St+Manhattan+10463+US"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:underline"
        >
          Open in Google Maps →
        </a>
      </div>

      <div className="overflow-hidden rounded-xl">
        <iframe
          title="Rovado Location"
          src="https://www.google.com/maps?q=Manhattan+New+York&output=embed"
          className="h-72 w-full border-0 sm:h-96"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}

/* =========================================================
   Main Contact Page
========================================================= */

export default function Contact() {
  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cellphones", href: "/cellphones" },
          { label: "Contact" },
        ]}
      />

      {/* ══════ MAIN SECTION ══════ */}
      <section className="rounded-xl bg-white p-4 sm:p-6">
        <h1 className="mb-6 text-lg font-bold uppercase">
          Ready to Work With Us
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* LEFT: Form */}
          <div>
            <ContactForm />
          </div>

          {/* RIGHT: Info card + Image */}
          <div className="space-y-6">
            <ContactInfoCard />

            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80"
              alt="Office"
              className="h-64 w-full rounded-xl object-cover sm:h-96"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";
              }}
            />
          </div>
        </div>
      </section>

      {/* ══════ MAP SECTION ══════ */}
      <MapSection />

      <PromoBar />
    </PageShell>
  );
}