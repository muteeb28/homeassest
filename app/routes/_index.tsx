import React, { useEffect, useRef, useState } from "react";
import type { AuthContext, DesignHistoryItem } from "../../type";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import {
  ArrowRight, ArrowUpRight, Clock, Layers, Trash2,
  ChevronLeft, ChevronRight, ChevronDown,
  UtensilsCrossed, Package, Coffee, Maximize2, Monitor, BookOpen,
  Lightbulb, Paintbrush, Droplets, Flame, DoorOpen, Truck, Baby,
  Layout, Image,
} from "lucide-react";

import Upload from "@/components/Upload";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import { Button } from "@/components/ui/Button";

import { deleteProject, getProjects, saveProject } from "@/lib/storage";
import { GALLERY_CATEGORIES, slugify } from "@/lib/gallery";

const PAGE_SIZE = 3;

const SOLUTIONS = [
  { icon: UtensilsCrossed, label: "Modular Kitchen" },
  { icon: Package, label: "Storage & Wardrobe" },
  { icon: Coffee, label: "Crockery Units" },
  { icon: Maximize2, label: "Space Saving Furniture" },
  { icon: Monitor, label: "TV Units" },
  { icon: BookOpen, label: "Study Tables" },
  { icon: Layout, label: "False Ceiling" },
  { icon: Lightbulb, label: "Lights" },
  { icon: Image, label: "Wallpaper" },
  { icon: Paintbrush, label: "Wall Paint" },
  { icon: Droplets, label: "Bathroom" },
  { icon: Flame, label: "Pooja Unit" },
  { icon: DoorOpen, label: "Foyer Designs" },
  { icon: Truck, label: "Movable Furniture" },
  { icon: Baby, label: "Kids Bedroom" },
];

const TESTIMONIALS = [
  {
    name: "Arjun & Priya M.",
    location: "Bandra, Mumbai",
    quote:
      "From the first design consultation to the final installation, HomeAsset made the entire process seamless. Our modular kitchen and living room turned out exactly as we imagined — and the 3D preview meant zero surprises.",
  },
  {
    name: "Rahul & Sunita K.",
    location: "Koramangala, Bangalore",
    quote:
      "We were overwhelmed by choices until HomeAsset stepped in. Their designers understood our taste instantly, the 3D renders helped us finalise everything quickly, and delivery was on time to the day.",
  },
  {
    name: "David & Meera Chen",
    location: "Vasant Kunj, New Delhi",
    quote:
      "The 10-year warranty gave us confidence, but it was the attention to detail during execution that truly won us over. Every cabinet, every finish — exactly what was promised. HomeAsset is the real deal.",
  },
];

const FAQS = [
  {
    q: "What does HomeAsset offer beyond floor plan visualisation?",
    a: "HomeAsset is a complete interior solution — from AI-powered 3D visualisation of your floor plan to curated design inspiration, material selection, expert design consultation, and project execution. Think of us as your one-stop home interior partner.",
  },
  {
    q: "How does the 3D visualisation work?",
    a: "Upload a 2D floor plan (JPG or PNG) and our AI generates a photorealistic 3D bird's-eye view in minutes. It preserves your room layout while adding furniture, materials, and lighting suggestions tailored to your space.",
  },
  {
    q: "Can I get a professional designer involved?",
    a: "Absolutely. Book a free design visit and one of our in-house designers will work with you to translate your vision into a detailed, execution-ready interior plan — from modular kitchens to full-home packages.",
  },
  {
    q: "How long does a typical interior project take?",
    a: "Most modular kitchen and wardrobe projects are completed within 45 days of design sign-off. Full-home interiors are delivered in 60–90 days, backed by a structured project timeline and dedicated site manager.",
  },
  {
    q: "Is there a warranty on the work?",
    a: "Yes. All HomeAsset-executed interiors come with a 10-year warranty on modular furniture and a 1-year service warranty on installation workmanship, giving you complete peace of mind.",
  },
];

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [designHistory, setDesignHistory] = useState<DesignHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [projectPage, setProjectPage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { isSignedIn, userName, signIn, refreshAuth } =
    useOutletContext<AuthContext>();

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    const items = await getProjects();
    setDesignHistory(items);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [isSignedIn, location.key]);

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;
    const newItem = {
      id: newId,
      name,
      sourceImage: base64Image,
      renderedImage: undefined,
      timestamp: Date.now(),
    };
    const saved = await saveProject(newItem, "private");
    if (!saved) {
      console.error("Failed to save project.");
      return false;
    }
    setDesignHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== newId);
      return [saved, ...filtered];
    });
    navigate(`/visualizer/${newId}?source=private`, {
      state: {
        initialImage: saved.sourceImage,
        initialRender: saved.renderedImage || null,
        name,
      },
    });
    return true;
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setDeleteTarget(projectId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget);
    setDesignHistory((prev) => prev.filter((item) => item.id !== deleteTarget));
    setDeleteTarget(null);
    // Reset to first page if current page becomes empty
    setProjectPage((p) => Math.max(0, p - 1));
  };

  const handleGalleryView = (title: string) => {
    navigate(`/design/${slugify(title)}`);
  };

  const scrollGallery = (index: number, dir: "left" | "right") => {
    const el = galleryRefs.current[index];
    if (el) el.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
  };

  const totalPages = Math.ceil(designHistory.length / PAGE_SIZE);
  const pagedHistory = designHistory.slice(
    projectPage * PAGE_SIZE,
    (projectPage + 1) * PAGE_SIZE
  );
  const hasHistory = designHistory.length > 0;

  return (
    <div className="home">
      <Navbar />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete project?"
        description="This will permanently remove the project from your local storage. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <span>End-to-end Interior Solutions</span>
        </div>

        <h1>Your dream home, designed and delivered — end to end</h1>

        <p className="subtitle">
          From floor plan to finished space, HomeAsset brings together expert
          design, curated materials, and AI-powered visualisation so you can
          see, refine, and build your perfect interior with confidence.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Get Free Estimate <ArrowRight className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo" onClick={() => document.querySelector(".gallery-section")?.scrollIntoView({ behavior: "smooth" })}>
            Explore Designs
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div
            className="grid-overlay"
            style={{
              backgroundImage:
                "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          ></div>
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Visualise your space in 3D</h3>
              <p>Upload a floor plan and see your home come to life instantly</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>My Designs</h2>
              <p>Your saved floor plans and 3D visualisations, all in one place.</p>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="loading">Loading your projects…</div>
          ) : (
            <>
              <div className="projects-grid">
                {hasHistory ? (
                  pagedHistory.map((item, index) => {
                    const ownerLabel = item.isPublic
                      ? item.sharedBy || "Unknown"
                      : userName || "You";
                    const name = item.name || `Residence ${item.id}`;
                    return (
                      <div
                        key={item.id || `${item.timestamp}-${index}`}
                        onClick={() => {
                          const scope = item.isPublic ? "public" : "private";
                          const ownerParam = item.ownerId
                            ? `&ownerId=${encodeURIComponent(item.ownerId)}`
                            : "";
                          navigate(
                            `/visualizer/${item.id}?source=${scope}${ownerParam}`,
                            {
                              state: {
                                initialImage: item.sourceImage,
                                initialRender: item.renderedImage || null,
                                ownerId: item.ownerId || null,
                                name: item.name || null,
                                sharedBy: item.sharedBy || null,
                              },
                            }
                          );
                        }}
                        className="project-card group"
                      >
                        <div className="preview">
                          <img
                            src={item.renderedImage || item.sourceImage}
                            alt={`Project ${index + 1}`}
                          />
                          {item.isPublic && (
                            <div className="badge">
                              <span>Community</span>
                            </div>
                          )}
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDeleteClick(e, item.id)}
                            title="Delete project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="card-body">
                          <div>
                            <h3>{name}</h3>
                            <div className="meta">
                              <Clock size={12} />
                              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                              <span>By {ownerLabel}</span>
                            </div>
                          </div>
                          <div className="arrow">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty">
                    No projects yet. Upload a floor plan to create your first one.
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setProjectPage((p) => Math.max(0, p - 1))}
                    disabled={projectPage === 0}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="page-info">
                    {projectPage + 1} / {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setProjectPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={projectPage === totalPages - 1}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Design Gallery ── */}
      <section className="gallery-section">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Design Inspiration</h2>
              <p>Explore curated interior design ideas across every room.</p>
            </div>
          </div>

          {GALLERY_CATEGORIES.map((cat, catIdx) => (
            <div className="gallery-category" key={cat.title}>
              <div className="gallery-meta">
                <h3>{cat.title}</h3>
                <span className="see-all">See All</span>
              </div>
              <div className="gallery-row-wrapper">
                <button
                  className="gallery-arrow left"
                  onClick={() => scrollGallery(catIdx, "left")}
                >
                  <ChevronLeft size={18} />
                </button>
                <div
                  className="gallery-row"
                  ref={(el) => { galleryRefs.current[catIdx] = el; }}
                >
                  {cat.items.map((item) => (
                    <div
                      className="gallery-card group"
                      key={item.title}
                      onClick={() => handleGalleryView(item.title)}
                    >
                      <div className="gallery-img-wrap">
                        <img src={item.src} alt={item.title} />
                        <div className="gallery-hover-cta">
                          <span>View Details</span>
                        </div>
                      </div>
                      <div className="gallery-info">
                        <span className="gallery-room-tag">{item.room}</span>
                        <h4 className="gallery-title">{item.title}</h4>
                        <div className="gallery-meta-row">
                          <span className="gallery-style">{item.style}</span>
                          <span className="gallery-dot">·</span>
                          <span className="gallery-dims">{item.dims}</span>
                        </div>
                        <div className="gallery-rating">
                          {"★".repeat(Math.floor(item.rating))}{"☆".repeat(5 - Math.floor(item.rating))}
                          <span>{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="gallery-arrow right"
                  onClick={() => scrollGallery(catIdx, "right")}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interior Solutions ── */}
      <section className="solutions-section">
        <div className="section-inner">
          <h2>End-to-end Interior Solutions</h2>
          <p className="solutions-sub">Everything your home needs, all in one place.</p>
          <div className="solutions-grid">
            {SOLUTIONS.map(({ icon: Icon, label }) => (
              <div className="solution-item group" key={label}>
                <div className="solution-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="solutions-cta">
            <a href="#upload" className="btn btn--primary btn--lg">
              Book Free Design Session
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <h2>What Our Clients Say</h2>
          <p className="testimonials-sub">Real stories from homeowners who transformed their spaces.</p>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-avatar">
                  {t.name.charAt(0)}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-meta">
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="section-inner">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                className={`faq-item ${openFaq === i ? "open" : ""}`}
                key={faq.q}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className="faq-chevron" size={18} />
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="section-inner">
          <h2>Ready to transform your home?</h2>
          <p>Get a free design consultation and 3D visualisation — no obligation, no cost.</p>
          <a href="#upload" className="btn btn--primary btn--lg">
            Book Free Design Session <ArrowRight className="icon" style={{ display: "inline", marginLeft: 8, verticalAlign: "middle" }} />
          </a>
        </div>
      </section>
    </div>
  );
}
