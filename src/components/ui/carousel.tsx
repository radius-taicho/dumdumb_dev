import * as React from "react"

const CarouselContext = React.createContext<{
  carouselRef: React.RefObject<HTMLDivElement> | null
  api: any
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

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [api, setApi] = React.useState<any>(null)
  const [current, setCurrent] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const scrollPrev = React.useCallback(() => {
    if (api) {
      api.scrollPrev()
    }
  }, [api])

  const scrollNext = React.useCallback(() => {
    if (api) {
      api.scrollNext()
    }
  }, [api])

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

  React.useEffect(() => {
    // Here we would normally initialize embla-carousel
    // but for simplicity we're just creating a basic API
    if (carouselRef.current) {
      const slides = carouselRef.current.querySelectorAll('[data-carousel-item]')
      const totalSlides = slides.length
      
      const mockApi = {
        scrollPrev: () => {
          setCurrent(prev => (prev - 1 + totalSlides) % totalSlides)
        },
        scrollNext: () => {
          setCurrent(prev => (prev + 1) % totalSlides)
        },
        selectedScrollSnap: () => current,
        canScrollPrev: () => totalSlides > 1,
        canScrollNext: () => totalSlides > 1,
      }
      
      setApi(mockApi)
      setCanScrollPrev(mockApi.canScrollPrev())
      setCanScrollNext(mockApi.canScrollNext())
    }
  }, [current, carouselRef])

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

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div ref={ref} className="flex" {...props}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null
          return React.cloneElement(child, {
            ...child.props,
            'data-carousel-item': '',
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
