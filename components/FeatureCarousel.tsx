import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
}

interface FeatureCarouselProps {
    features: Feature[];
}

const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ features }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Responsive cards count
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setCardsToShow(3);
            } else if (window.innerWidth >= 640) {
                setCardsToShow(2);
            } else {
                setCardsToShow(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const maxIndex = features.length - cardsToShow;
            return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
    }, [features.length, cardsToShow]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            const maxIndex = features.length - cardsToShow;
            return prevIndex <= 0 ? maxIndex : prevIndex - 1;
        });
    };

    // Auto-play functionality
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoPlaying) {
            interval = setInterval(nextSlide, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const handleDotClick = (index: number) => {
        // Adjust index to ensure we don't show empty spaace at the end
        const maxIndex = features.length - cardsToShow;
        setCurrentIndex(Math.min(index, maxIndex));
    };

    const maxIndex = Math.max(0, features.length - cardsToShow);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    return (
        <div
            className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            style={{ flex: `0 0 ${100 / cardsToShow}%` }}
                            className="p-4"
                        >
                            <div className="h-full p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-12 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:scale-110 transition-all z-10 hidden sm:flex"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-12 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:scale-110 transition-all z-10 hidden sm:flex"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: features.length - cardsToShow + 1 }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-teal-600 w-8' : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
export default FeatureCarousel;
