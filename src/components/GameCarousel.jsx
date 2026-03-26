import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import GameCard from './GameCard';

export default function GameCarousel({ title, slugs }) {
  if (!slugs || slugs.length === 0) return null;

  return (
    <div className="game-carousel">
      <div className="game-carousel__header">
        <h2 className="section-title">{title}</h2>
      </div>
      <Swiper
        className="game-swiper"
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        slidesPerView="auto"
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 6, spaceBetween: 16 },
        }}
      >
        {slugs.map(slug => (
          <SwiperSlide key={slug} style={{ width: 180 }}>
            <GameCard slug={slug} variant="carousel" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
