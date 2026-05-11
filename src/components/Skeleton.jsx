import React from "react";

/**
 * SkeletonBox - A basic rectangular skeleton element with pulse animation.
 */
export function SkeletonBox({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  style = {},
  className = "",
}) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "var(--color-border)",
        ...style,
      }}
    />
  );
}

/**
 * SkeletonProductCard - A skeleton for the ProductCard component.
 */
export function SkeletonProductCard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
      }}
    >
      <SkeletonBox
        height="0"
        style={{ aspectRatio: "3/4", height: "auto" }}
        borderRadius="0"
      />
      <div
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <SkeletonBox width="40%" height="10px" />
        <SkeletonBox width="80%" height="16px" />
        <SkeletonBox width="30%" height="14px" style={{ marginTop: "4px" }} />
      </div>
    </div>
  );
}

/**
 * PageSkeleton - A generic page skeleton with a grid of product cards.
 */
export function PageSkeleton({ count = 8, columns = { mobile: 2, tablet: 3, desktop: 4 } }) {
  return (
    <div className="page-transition">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.mobile}, 1fr)`,
          gap: "5px",
        }}
        className="skeleton-grid"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-background)",
            }}
          >
            <SkeletonProductCard />
          </div>
        ))}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .skeleton-grid {
            grid-template-columns: repeat(${columns.tablet}, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (min-width: 1280px) {
          .skeleton-grid {
            grid-template-columns: repeat(${columns.desktop}, 1fr) !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}
