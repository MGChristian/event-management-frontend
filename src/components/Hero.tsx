import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import heroImage from "../assets/home/hero.jpg";

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-b-4xl">
      {/* 1. Background Image with Overlay */}
      <div className="relative h-128 w-full">
        <img
          src={heroImage}
          alt="Concert Crowd"
          className="h-full w-full object-cover object-center brightness-[0.40]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
      </div>

      {/* 2. Hero Content (Centered Absolute) */}
      <div className="absolute inset-0 mt-28 flex flex-col items-center gap-12 px-4 text-center">
        {/* Main Headline */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
          Level Up Your <br />
          <span className="bg-linear-to-r from-yellow-300 to-orange-500 bg-clip-text text-transparent">
            Campus Experience
          </span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-xl text-lg text-stone-200 sm:text-xl">
          Discover the hottest school events, grab your tickets instantly, and
          breeze through entry with{" "}
          <span className="text-2xl font-bold text-orange-100">TicketUp</span>.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/signup"
            className="group relative flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-orange-600 active:scale-95"
          >
            <span className="font-medium">Join Now</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#events"
            className="flex items-center justify-center rounded-full bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            Browse Events
          </a>
        </div>
      </div>
    </div>
  );
}

export default Hero;
