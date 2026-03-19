import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedButton } from "./magicui/AnimatedButton";
import { useI18n } from "../i18n";

function NextArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white transition-colors duration-300 hover:bg-black/40"
      aria-label="Next slide"
    >
      <ChevronRight size={28} />
    </button>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white transition-colors duration-300 hover:bg-black/40"
      aria-label="Previous slide"
    >
      <ChevronLeft size={28} />
    </button>
  );
}

export default function BannerCarousel() {
  const { t } = useI18n();

  const banners = [
    {
      id: 1,
      image: "/images/banners/banner11.jpg",
      alt: t("banner.summerSale"),
      title: t("banner.summerSale"),
      subtitle: t("banner.summerSaleDesc"),
      cta: t("banner.viewOffers"),
      ctaLink: "/products?sort=price-asc",
    },
    {
      id: 2,
      image: "/images/banners/banner2.jpg",
      alt: t("banner.newCollection"),
      title: t("banner.newCollection"),
      subtitle: t("banner.newCollectionDesc"),
      cta: t("banner.discover"),
      ctaLink: "/products?sort=newest",
    },
    {
      id: 3,
      image: "/images/banners/banner1.jpg",
      alt: t("banner.freeShipping"),
      title: t("banner.freeShipping"),
      subtitle: t("banner.freeShippingDesc"),
      cta: t("banner.shopNow"),
      ctaLink: "/products",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots) => (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <ul className="m-0 flex items-center justify-center space-x-3 p-0">
          {dots}
        </ul>
      </div>
    ),
    customPaging: () => (
      <div className="h-2 w-2 rounded-full bg-white/40 transition-all duration-300 ease-in-out group-hover:bg-white/60" />
    ),
    dotsClass: "slick-dots custom-dots",
  };

  return (
    <div className="relative mb-8 h-[40vh] max-h-[400px] min-h-[250px] w-full overflow-hidden rounded-xl shadow-md">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-[40vh] max-h-[400px] min-h-[250px]">
            <img
              src={banner.image}
              alt={banner.alt}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-6 text-white sm:p-10 md:p-12 lg:p-14">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                  {banner.title}
                </h2>
                <p className="my-3 max-w-prose text-sm sm:text-base text-white/90 drop-shadow-md">
                  {banner.subtitle}
                </p>
                <Link to={banner.ctaLink}>
                  <AnimatedButton className="rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg py-1.5 px-6">
                    {banner.cta}
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <style>{`
        .custom-dots li button:before {
          content: '';
        }
        .custom-dots li.slick-active div {
          background-color: white;
          width: 24px;
        }
      `}</style>
    </div>
  );
}