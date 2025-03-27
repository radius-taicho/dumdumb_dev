import * as React from "react"

type EventCallback = () => void;
type EventMap = {
  select: EventCallback[];
};

interface CarouselApi {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  selectedScrollSnap: () => number;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  on: (event: string, callback: EventCallback) => void;
  off: (event: string, callback: EventCallback) => void;
}

const CarouselContext = React.createContext<{
  carouselRef: React.RefObject<HTMLDivElement> | null
  api: CarouselApi | null
  current: number
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}>({
  carouselRef: null,
  api: null,
  current: 0,
  scrollPrev: () => {},
  scrollNext: () => {},
  canScrollPrev: false,
  canScrollNext: false,
})

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

// Custom hook to check if a component is mounted
function useIsMounted() {
  const isMounted = React.useRef(false);
  
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    setApi?: (api: CarouselApi) => void;
    opts?: { loop?: boolean; align?: string };
  }
>(({ className, children, setApi: setExternalApi, opts, ...props }, ref) => {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [api, setInternalApi] = React.useState<CarouselApi | null>(null)
  const [current, setCurrent] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [eventListeners, setEventListeners] = React.useState<EventMap>({
    select: [],
  });

  // EventListener関数
  const triggerEvent = React.useCallback((eventName: keyof EventMap) => {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(callback => callback());
    }
  }, [eventListeners]);

  const addEventCallback = React.useCallback((eventName: string, callback: EventCallback) => {
    if (eventName === 'select') {
      setEventListeners(prev => ({
        ...prev,
        select: [...prev.select, callback]
      }));
    }
  }, []);

  const removeEventCallback = React.useCallback((eventName: string, callbackToRemove: EventCallback) => {
    if (eventName === 'select') {
      setEventListeners(prev => ({
        ...prev,
        select: prev.select.filter(callback => callback !== callbackToRemove)
      }));
    }
  }, []);

  const scrollPrev = React.useCallback(() => {
    if (!api) return;
    api.scrollPrev();
    triggerEvent('select');
  }, [api, triggerEvent])

  const scrollNext = React.useCallback(() => {
    if (!api) return;
    api.scrollNext();
    triggerEvent('select');
  }, [api, triggerEvent])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  // カルーセルAPIの初期化
  React.useEffect(() => {
    if (!carouselRef.current) return;

    // スライド数を取得
    const getSlideCount = () => {
      return carouselRef.current?.querySelectorAll('[data-carousel-item]').length || 0;
    };

    const slideCount = getSlideCount();
    console.log('Carousel initialized with', slideCount, 'slides');

    if (slideCount === 0) return;

    // カルーセルAPIの作成
    const carouselApi: CarouselApi = {
      scrollPrev: () => {
        setCurrent(prev => {
          const totalSlides = getSlideCount();
          if (totalSlides === 0) return prev;
          const newIndex = (prev - 1 + totalSlides) % totalSlides;
          console.log('Scrolling to previous slide:', newIndex);
          return newIndex;
        });
      },
      scrollNext: () => {
        setCurrent(prev => {
          const totalSlides = getSlideCount();
          if (totalSlides === 0) return prev;
          const newIndex = (prev + 1) % totalSlides;
          console.log('Scrolling to next slide:', newIndex);
          return newIndex;
        });
      },
      scrollTo: (index: number) => {
        const totalSlides = getSlideCount();
        if (totalSlides === 0) return;
        console.log('Scrolling to specific slide:', index);
        setCurrent(Math.max(0, Math.min(index, totalSlides - 1)));
      },
      selectedScrollSnap: () => current,
      canScrollPrev: () => getSlideCount() > 1,
      canScrollNext: () => getSlideCount() > 1,
      on: addEventCallback,
      off: removeEventCallback,
    };

    // APIをセット
    setInternalApi(carouselApi);
    if (setExternalApi) {
      setExternalApi(carouselApi);
    }

    // ナビゲーションボタンの状態を更新
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselRef]); // 依存配列を最小限に
  
  // current 値が変更されたときにselectイベントを発火
  React.useEffect(() => {
    if (api) {
      triggerEvent('select');
    }
  }, [current, api, triggerEvent]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        current,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={className}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { carouselRef, current } = useCarousel()
  const isMounted = useIsMounted();
  const [hasChildren, setHasChildren] = React.useState(false);
  
  React.useEffect(() => {
    const childrenCount = React.Children.count(children);
    setHasChildren(childrenCount > 0);
    console.log('CarouselContent mounted with', childrenCount, 'children')
  }, [children]);

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div ref={ref} className="flex" {...props}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null
          return React.cloneElement(child, {
            ...child.props,
            'data-carousel-item': '',
            'data-index': index,
            style: {
              ...child.props.style,
              display: index === current ? 'block' : 'none',
              width: '100%',
            },
          })
        })}
      </div>
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      {...props}
    >
      {children}
    </div>
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, children, ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <button
      ref={ref}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={className}
      {...props}
    >
      {children || <span aria-hidden="true">←</span>}
      <span className="sr-only">Previous slide</span>
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, children, ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <button
      ref={ref}
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={className}
      {...props}
    >
      {children || <span aria-hidden="true">→</span>}
      <span className="sr-only">Next slide</span>
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
