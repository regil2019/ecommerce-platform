import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    image: "/images/banners/banner11.jpg",
    alt: "Ofertas Especiais",
    title: "Ofertas de Verão",
    subtitle: "Até 50% de desconto em produtos selecionados.",
    cta: "Ver Ofertas",
    ctaLink: "/products?category=ofertas",
  },
  {
    id: 2,
    image: "/images/banners/banner2.jpg",
    alt: "Novidades",
    title: "Coleção Outono/Inverno",
    subtitle: "As últimas tendências para a estação.",
    cta: "Descobrir",
    ctaLink: "/products?category=novidades",
  },
  {
    id: 3,
    image: "/images/banners/banner1.jpg",
    alt: "Frete Grátis",
    title: "Frete Grátis",
    subtitle: "Em compras acima de Kz 50.000.",
    cta: "Comprar Agora",
    ctaLink: "/products",
  },
];

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
    customPaging: (i) => (
      <div className="h-2 w-2 rounded-full bg-white/40 transition-all duration-300 ease-in-out group-hover:bg-white/60" />
    ),
    dotsClass: "slick-dots custom-dots",
  };

  return (
    <div className="relative mb-10 h-[50vh] max-h-[500px] min-h-[300px] w-full overflow-hidden rounded-2xl shadow-lg">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-[50vh] max-h-[500px] min-h-[300px]">
            <img
              src={banner.image}
              alt={banner.alt}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8 text-white sm:p-12 md:p-16 lg:p-20">
              <div className="max-w-lg">
                <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
                  {banner.title}
                </h2>
                <p className="my-4 max-w-prose text-lg text-white/90 drop-shadow-md">
                  {banner.subtitle}
                </p>
                <a
                  href={banner.ctaLink}
                  className="inline-block rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black/50"
                >
                  {banner.cta}
                </a>
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