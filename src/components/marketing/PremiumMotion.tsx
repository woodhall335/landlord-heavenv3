'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { clsx } from 'clsx';

type RevealVariant = 'fade-up' | 'soft-blur' | 'scale-in';
type SurfaceTone = 'white' | 'lavender' | 'dark';

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return prefersReducedMotion;
}

function useIsMobileRevealFallback() {
  const [isMobileRevealFallback, setIsMobileRevealFallback] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileRevealFallback(query.matches);

    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return isMobileRevealFallback;
}

export function Reveal({
  children,
  className,
  variant = 'fade-up',
  as = 'div',
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: RevealVariant;
  as?: ElementType;
}) {
  const Component = as;
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isMobileRevealFallback = useIsMobileRevealFallback();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      const markVisible = () => setIsVisible(true);

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        const frame = window.requestAnimationFrame(markVisible);
        return () => window.cancelAnimationFrame(frame);
      }

      const timeout = window.setTimeout(markVisible, 0);
      return () => window.clearTimeout(timeout);
    }

    let observer: IntersectionObserver | null = null;
    let mobileFrame: number | null = null;
    const mobileTimeouts: number[] = [];

    const markVisible = () => {
      setIsVisible(true);
      observer?.disconnect();
    };

    const cancelMobileFrame = () => {
      if (mobileFrame !== null) {
        window.cancelAnimationFrame(mobileFrame);
        mobileFrame = null;
      }
    };

    const checkMobilePosition = () => {
      mobileFrame = null;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const revealMargin = 140;

      if (rect.top <= viewportHeight + revealMargin && rect.bottom >= -revealMargin) {
        markVisible();
      }
    };

    const scheduleMobileCheck = () => {
      if (mobileFrame === null) {
        mobileFrame = window.requestAnimationFrame(checkMobilePosition);
      }
    };

    if (isMobileRevealFallback) {
      window.addEventListener('scroll', scheduleMobileCheck, { passive: true });
      window.addEventListener('resize', scheduleMobileCheck);
      scheduleMobileCheck();
      mobileTimeouts.push(
        window.setTimeout(scheduleMobileCheck, 250),
        window.setTimeout(scheduleMobileCheck, 900),
        window.setTimeout(scheduleMobileCheck, 1600)
      );
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          markVisible();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
    );

    observer.observe(node);
    return () => {
      observer?.disconnect();
      if (isMobileRevealFallback) {
        window.removeEventListener('scroll', scheduleMobileCheck);
        window.removeEventListener('resize', scheduleMobileCheck);
      }
      mobileTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      cancelMobileFrame();
    };
  }, [isMobileRevealFallback, reducedMotion]);

  return (
    <Component
      {...props}
      ref={ref as never}
      data-motion-state={isVisible ? 'visible' : 'hidden'}
      data-motion-variant={variant}
      className={clsx('premium-reveal', className)}
    >
      {children}
    </Component>
  );
}

export function StaggerReveal({
  children,
  className,
  childClassName,
  as = 'div',
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  childClassName?: string;
  as?: ElementType;
}) {
  const Component = as;
  const items = useMemo(
    () =>
      Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        const childProps = child.props as {
          className?: string;
          style?: CSSProperties;
        };

        return cloneElement(child as ReactElement<{ className?: string; style?: CSSProperties }>, {
          className: clsx('premium-stagger-child', childClassName, childProps.className),
          style: {
            ...childProps.style,
            '--premium-stagger-index': index,
          } as CSSProperties,
        });
      }),
    [childClassName, children]
  );

  return (
    <Reveal as={Component} className={clsx('premium-stagger', className)} {...props}>
      {items}
    </Reveal>
  );
}

export function PremiumParallax({
  children,
  className,
  intensity = 14,
  disabled = false,
  ...props
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  disabled?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isDisabled = disabled || reducedMotion;

  useEffect(() => {
    const node = ref.current;
    if (!node || isDisabled || typeof window === 'undefined') return;

    const update = () => {
      if (window.innerWidth < 768) {
        node.style.transform = 'none';
        return;
      }

      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const offset = Math.max(-1, Math.min(1, (viewportCenter - elementCenter) / viewportCenter));
      node.style.transform = `translate3d(0, ${Math.round(offset * intensity)}px, 0)`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      node.style.transform = '';
    };
  }, [intensity, isDisabled]);

  return (
    <div
      {...props}
      ref={ref}
      data-parallax={isDisabled ? 'disabled' : 'enabled'}
      className={clsx('premium-parallax', className)}
    >
      {children}
    </div>
  );
}

export function PremiumImageFrame({
  children,
  className,
  glow = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx('premium-image-frame', glow && 'premium-image-frame-glow', className)}
    >
      {children}
    </div>
  );
}

export function PremiumSurface({
  children,
  className,
  tone = 'white',
  as = 'section',
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: SurfaceTone;
  as?: ElementType;
}) {
  const Component = as;

  return (
    <Component
      {...props}
      className={clsx('premium-surface', `premium-surface-${tone}`, className)}
    >
      {children}
    </Component>
  );
}

export function TrustPillRow({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <StaggerReveal className={clsx('flex flex-wrap gap-2', className)} childClassName="premium-trust-pill">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </StaggerReveal>
  );
}
