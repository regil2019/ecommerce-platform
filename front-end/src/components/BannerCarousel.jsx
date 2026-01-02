import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const banners = [
  { 
    id: 1, 
    image: "/images/banners/banner11.jpg", 
    alt: "Ofertas Especiais",
    title: "Ofertas de Verão",
    subtitle: "Até 50% de desconto em produtos selecionados",
    cta: "Ver Ofertas"
  },
  { 
    id: 2, 
    image: "/images/banners/banner2.jpg", 
    alt: "Novidades",
    title: "Coleção Outono/Inverno",
    subtitle: "As últimas tendências para a estação",
    cta: "Descobrir"
  },
  { 
    id: 3, 
    image: "/images/banners/banner1.jpg", 
    alt: "Frete Grátis",
    title: "Frete Grátis",
    subtitle: "Em compras acima de Kz 50.000",
    cta: "Comprar Agora"
  },
];

function NextArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition hover:bg-black/50"
      aria-label="Next slide"
    >
      <FiChevronRight size={24} />
    </button>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition hover:bg-black/50"
      aria-label="Previous slide"
    >
      <FiChevronLeft size={24} />
    </button>
  );
}

export default function BannerCarousel() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: dots => (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <ul className="m-0 flex space-x-2 p-0">{dots}</ul>
      </div>
    ),
    customPaging: i => (
      <div className="h-2 w-2 rounded-full bg-white/50 transition hover:bg-white/80" />
    ),
  };

  if (isLoading) {
    return (
      <div className="mb-8 aspect-[16/6] w-full rounded-xl bg-gray-200" />
    );
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative">
            <div className="aspect-[16/6] w-full">
              <img
                src={banner.image}
                alt={banner.alt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/10"></div>
            <div className="absolute left-8 top-1/2 max-w-md -translate-y-1/2 text-white sm:left-12 md:left-16">
              <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                {banner.title}
              </h2>
              <p className="my-3 text-lg opacity-90">
                {banner.subtitle}
              </p>
              <button className="rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-100">
                {banner.cta}
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}