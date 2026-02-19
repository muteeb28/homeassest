import { Navigate, useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, ChevronRight, CheckCircle2 } from "lucide-react";

import Navbar from "@/components/Navbar";
import { GALLERY_CATEGORIES, findItemBySlug, slugify } from "@/lib/gallery";
import { Button } from "@/components/ui/Button";

export default function DesignPDPRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const result = slug ? findItemBySlug(slug) : null;

  if (!result) return <Navigate to="/" replace />;

  const { item, category } = result;

  const related = category.items
    .filter((i) => slugify(i.title) !== slug)
    .slice(0, 4);

  const stars = Math.round(item.rating);

  return (
    <div className="pdp-page">
      <Navbar />

      {/* ── Breadcrumb ── */}
      <nav className="pdp-breadcrumb">
        <span onClick={() => navigate("/")} className="pdp-breadcrumb-link">
          Home
        </span>
        <ChevronRight size={13} className="pdp-breadcrumb-sep" />
        <span className="pdp-breadcrumb-link">{category.title}</span>
        <ChevronRight size={13} className="pdp-breadcrumb-sep" />
        <span className="pdp-breadcrumb-current">{item.title}</span>
      </nav>

      {/* ── Back button ── */}
      <button className="pdp-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* ── Main layout ── */}
      <div className="pdp-main">
        {/* Left: Image */}
        <div className="pdp-image-col">
          <div className="pdp-image-hero">
            <img src={item.src} alt={item.title} />
          </div>
        </div>

        {/* Right: Details */}
        <div className="pdp-details-col">
          <span className="pdp-room-tag">{item.room}</span>
          <h1 className="pdp-title">{item.title}</h1>

          <div className="pdp-meta-row">
            <span className="pdp-style">{item.style}</span>
            <span className="pdp-dot">·</span>
            <span className="pdp-dims">{item.dims}</span>
          </div>

          <div className="pdp-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={15}
                className={i < stars ? "star-filled" : "star-empty"}
                fill={i < stars ? "currentColor" : "none"}
              />
            ))}
            <span className="pdp-rating-value">{item.rating}</span>
            <span className="pdp-rating-count">/ 5.0</span>
          </div>

          <p className="pdp-description">{item.description}</p>

          <div className="pdp-features">
            <h3>Key Features</h3>
            <ul>
              {item.features.map((f) => (
                <li key={f}>
                  <CheckCircle2 size={15} className="pdp-feature-icon" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pdp-actions">
            <Button size="lg" className="pdp-cta-primary">
              Get Free Estimate
            </Button>
            <Button size="lg" variant="outline" className="pdp-cta-secondary">
              Book a Design Visit
            </Button>
          </div>

          <p className="pdp-note">
            Free home visit · No obligation quote · Expert designers
          </p>
        </div>
      </div>

      {/* ── Related Designs ── */}
      {related.length > 0 && (
        <section className="pdp-related">
          <div className="pdp-related-inner">
            <h2>You Might Also Like</h2>
            <div className="pdp-related-grid">
              {related.map((rel) => (
                <div
                  key={rel.title}
                  className="pdp-related-card"
                  onClick={() => navigate(`/design/${slugify(rel.title)}`)}
                >
                  <div className="pdp-related-img">
                    <img src={rel.src} alt={rel.title} />
                  </div>
                  <div className="pdp-related-info">
                    <span className="pdp-related-room">{rel.room}</span>
                    <h4>{rel.title}</h4>
                    <div className="pdp-related-sub">
                      <span>{rel.style}</span>
                      <span>·</span>
                      <span>{rel.dims}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
