import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Truck,
  Wallet,
  Play,
  ChevronRight,
  Star,
} from "lucide-react";
import { Header, PromoBar, Breadcrumb, PageShell } from "../components/Layout";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

/* =========================================================
   Hero Section — Best experience always wins
========================================================= */
function HeroSection() {
  const stats = [
    {
      value: "$12,5M",
      label: "Total revenue from 2001 - 2023",
    },
    {
      value: "12K+",
      label: "Orders delivered successful on everyday",
    },
    {
      value: "725+",
      label: "Store and office in U.S and worldwide",
    },
  ];

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      {/* Hero text */}
      <div className="rounded-xl border border-zinc-200 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Best experience
              <br />
              <span className="font-normal">always wins</span>
            </h1>
            <p className="mt-5 text-sm leading-6 text-stone-500">
              #1 Online Marketplace for Electronic & Technology
              <br />
              in Manhattan, CA
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-lg font-bold uppercase leading-8 text-black">
              Our purpose is to{" "}
              <span className="text-green-600">
                enrich and enhance lives
              </span>{" "}
              through technology
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-zinc-200 pt-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.value}>
              <p className="text-4xl font-bold uppercase text-black">
                {s.value}
              </p>
              <p className="mt-2 text-xs uppercase leading-5 text-stone-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Connect Section — Image + Text
========================================================= */
function ConnectSection() {
  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
            alt="Team"
            className="h-72 w-full object-cover sm:h-96"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>

        {/* Text box */}
        <div className="rounded-xl bg-gray-100 p-6 sm:p-10">
          <h2 className="text-lg font-bold leading-6 text-black sm:text-xl">
            We connect millions of buyers and sellers around the world,
            empowering people & creating economic opportunity for all.
          </h2>

          <p className="mt-5 text-sm leading-6 text-stone-500">
            Within our markets, millions of people around the world connect,
            both online and offline, to make, sell and buy unique goods. We
            also offer a wide range of Seller Services and tools that help
            creative entrepreneurs start, manage & scale their businesses.
          </p>

          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-xs font-medium uppercase text-white transition hover:bg-green-700"
          >
            <Play size={12} /> Our Showreel
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Feature Cards — 3 Cards
========================================================= */
function FeatureCards() {
  const features = [
    {
      icon: BadgeCheck,
      title: "100% Authentic Products",
      desc: "Rovado Tech Mart just distribute 100% authorized products & guarantee quality. Nulla porta nulla nec orci vulputate, id rutrum sapien varius.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Fast shipping with a lots of option to delivery. 100% guarantee that your goods always on time and preserve quality.",
    },
    {
      icon: Wallet,
      title: "Affordable Price",
      desc: "We offer an affordable & competitive price with a lots of special promotions.",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <div
            key={f.title}
            className="rounded-xl bg-white p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold uppercase leading-5 text-black">
                {f.title}
              </h3>
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-green-600 text-white">
                <Icon size={22} />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-500">{f.desc}</p>
          </div>
        );
      })}
    </section>
  );
}

/* =========================================================
   Mission Section
========================================================= */
function MissionSection() {
  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-bold uppercase">
        Our Mission and Vision
      </h2>

      <p className="text-sm leading-6 text-black">
        Nam maximus nunc a augue pulvinar, non euismod mauris tempus. Cras non
        elit vel magna molestie pellentesque in eu dui. Donec laoreet quis erat
        vitae finibus. Vestibulum enim eros, porta eget quam et, euismod dictum
        elit. Nullam eu tempus magna. Fusce malesuada nisi id felis placerat
        porta vel sed augue.{" "}
        <b>Vivamus mollis mauris vitae rhoncus egestas.</b> Pellentesque
        habitant morbi tristique senectus et netus et malesuada fames ac turpis
        egestas.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1300&q=80"
          alt="Our office"
          className="h-64 w-full object-cover sm:h-96"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
    </section>
  );
}

/* =========================================================
   Timeline Section
========================================================= */
function TimelineSection() {
  const leftTimeline = [
    { year: "1997:", desc: "A small store located in Brooklyn Town, USA" },
    {
      year: "1998:",
      desc: "It is a long established fact that a reader will be distracted by the readable",
    },
    {
      year: "2000:",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
    },
    {
      year: "2002:",
      desc: "Lorem Ipsum has been the industry's standard dummy text ever since the",
    },
    {
      year: "2004:",
      desc: "Contrary to popular belief, Lorem Ipsum is not simply random text",
    },
    {
      year: "2005:",
      desc: "The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here",
    },
    {
      year: "2006:",
      desc: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form",
    },
    {
      year: "2010:",
      desc: "All the Lorem Ipsum generators on the Internet tend to repeat predefined",
    },
    {
      year: "2013:",
      desc: "Lorem Ipsum comes from sections 1.10.32",
    },
  ];

  const rightTimeline = [
    {
      year: "2014:",
      desc: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form",
    },
    {
      year: "2016:",
      desc: "All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary",
    },
    {
      year: "2020:",
      desc: "Lorem Ipsum comes from sections 1.10.32",
    },
    {
      year: "2021:",
      desc: "Making this the first true generator on the Internet",
    },
    {
      year: "2022:",
      desc: "Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition",
    },
    {
      year: "2023:",
      desc: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form",
    },
  ];

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <h2 className="text-lg font-bold uppercase leading-5">
        From a Retail Store to the Global Chain of Stores
      </h2>

      <p className="mt-3 text-sm leading-6 text-black">
        Pellentesque laoreet justo nec ex sodales euismod. Aliquam orci tortor,
        bibendum nec ultricies ac, auctor nec purus. Maecenas in consectetur
        erat.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-3">
          {leftTimeline.map((t) => (
            <div key={t.year} className="flex gap-4 text-sm">
              <span className="w-14 shrink-0 font-bold text-black">
                {t.year}
              </span>
              <span className="text-stone-500">{t.desc}</span>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {rightTimeline.map((t) => (
            <div key={t.year} className="flex gap-4 text-sm">
              <span className="w-14 shrink-0 font-bold text-black">
                {t.year}
              </span>
              <span className="text-stone-500">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Leadership Section
========================================================= */
function LeadershipSection() {
  const leaders = [
    {
      name: "Henry Avery",
      role: "Chairman",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    },
    {
      name: "Michael Edward",
      role: "Vice President",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    {
      name: "Eden Hazard",
      role: "CEO",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    },
    {
      name: "Robert Downey Jr",
      role: "CEO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    },
    {
      name: "Nathan Drake",
      role: "Strategist Director",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    },
  ];

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Leaderships</h2>
        <Link
          to="/contact"
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {leaders.map((l) => (
          <div key={l.name} className="group">
            <div className="overflow-hidden rounded-xl">
              <img
                src={l.image}
                alt={l.name}
                className="h-64 w-full object-cover transition group-hover:scale-105 sm:h-80"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <p className="mt-3 text-base font-bold text-black">{l.name}</p>
            <p className="text-xs uppercase text-stone-500">{l.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   Member Banner
========================================================= */
function MemberBanner() {
  return (
    <section className="rounded-2xl bg-neutral-800 px-6 py-6">
      <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
        <Star className="text-yellow-400" fill="currentColor" size={20} />
        <p className="text-base text-white">
          Member get{" "}
          <span className="font-bold uppercase text-yellow-400">
            Free shipping*
          </span>{" "}
          with no order minimum! *Restriction apply
        </p>
        <Link
          to="/register"
          className="text-sm text-white underline hover:text-green-400"
        >
          Try free 30-days trial!
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN ABOUT PAGE
========================================================= */
export default function About() {
  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "About" },
        ]}
      />

      <HeroSection />
      <ConnectSection />
      <FeatureCards />
      <MissionSection />
      <TimelineSection />
      <LeadershipSection />
      <MemberBanner />

      <PromoBar />
    </PageShell>
  );
}