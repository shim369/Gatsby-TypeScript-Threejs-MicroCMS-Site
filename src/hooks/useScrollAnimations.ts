import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registers all scroll-driven animations inside `scope`.
 * Elements opt in via data attributes:
 *   data-reveal            fade + rise on enter (data-reveal-delay optional)
 *   data-stagger           children (.stagger-item) animate in sequence
 *   data-stagger-left      children slide in from the left, one by one
 * Honours prefers-reduced-motion.
 */
export function useScrollAnimations(scope: RefObject<HTMLElement>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 48,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: Number(el.dataset.revealDelay ?? 0),
            clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
          gsap.from(group.querySelectorAll(".stagger-item"), {
            y: 56,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            clearProps: "all",
            scrollTrigger: { trigger: group, start: "top 82%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-stagger-left]").forEach((group) => {
          gsap.from(group.children, {
            x: -60,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.18,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: group, start: "top 80%", once: true },
          });
        });

        // hero intro
        if (document.querySelector(".main-read .eyebrow")) {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(".main-read .eyebrow", { y: 20, opacity: 0, duration: 0.7 })
            .from(".main-read h1", { y: 60, opacity: 0, duration: 1.1 }, "-=0.4")
            .from(
              ".main-read .tech-chips li",
              { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 },
              "-=0.6"
            )
            .from(".scroll-down", { opacity: 0, duration: 0.8 }, "-=0.3");
        } else {
          gsap.from(".main-read h1", { y: 40, opacity: 0, duration: 1, ease: "power3.out" });
        }

        // hero fades while scrolling away
        gsap.to(".main-read", {
          yPercent: -12,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "header",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        // scroll progress bar
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
      }, scope);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [scope]);
}
