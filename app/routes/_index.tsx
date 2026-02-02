import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Clock,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import { puter } from "@heyputer/puter.js";
import { PUTER_WORKER_URL } from "../../constants";
import Upload from "../../components/Upload";
import { Button } from "../../components/ui/Button";
import Navbar from "../../components/Navbar";
import RefreshCwIcon from "@/assets/RefreshCwIcon";
import { getProjects, saveProject } from "../../lib/puter.action";

export default function IndexRoute() {
  const navigate = useNavigate();
  const [designHistory, setDesignHistory] = useState<DesignHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { isSignedIn, userName, signIn } = useOutletContext<AuthContext>();

  const fetchHistory = async () => {
    if (!isSignedIn) return;
    setIsLoadingHistory(true);
    const items = await getProjects();
    setDesignHistory(items);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (!isSignedIn) {
      setDesignHistory([]);
      return;
    }
    fetchHistory();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const clearOnLanding = async () => {
      try {
        await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/clear`, {
          method: "POST",
        });
        await fetchHistory();
      } catch (error) {
        console.error("Failed to clear projects:", error);
      }
    };

    clearOnLanding();
  }, [isSignedIn]);

  const handleUploadComplete = async (base64Image: string) => {
    if (!isSignedIn) {
      const signedIn = await signIn();
      if (!signedIn) return;
    }

    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    const newItem = {
      id: newId,
      name,
      sourceImage: base64Image,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    setDesignHistory((prev) => [newItem, ...prev]);
    await saveProject(newItem, "private");

    navigate(`/visualizer/${newId}?source=user`, {
      state: { initialImage: base64Image, initialRender: null, name },
    });
  };

  const hasHistory = designHistory.length > 0;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center px-3 py-1 rounded-md bg-white border border-zinc-200 shadow-sm">
          <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center mr-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Introducing Roomify 2.0
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-serif leading-[0.95] text-black mb-8 max-w-5xl mx-auto">
          Build beautiful spaces at the speed of thought with Roomify_
        </h1>

        <p className="max-w-2xl mx-auto text-xs md:text-sm font-mono uppercase tracking-widest text-zinc-500 mb-10 leading-relaxed">
          Roomify is an AI-first design environment that helps you visualize,
          render, and ship architectural projects faster than ever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#upload"
            className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FDFBF7] px-8 py-3 text-sm uppercase tracking-wide font-bold bg-[#F97316] text-white hover:bg-[#ea580c] shadow-md"
          >
            Start Building <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <Button
            variant="outline"
            size="lg"
            className="px-8 bg-white rounded-md hover:bg-zinc-50"
          >
            Watch Demo
          </Button>
        </div>

        <div
          id="upload"
          className="w-full max-w-5xl mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-b from-blue-100/50 to-white/50 border border-blue-100 p-6 md:p-12 shadow-sm min-h-[400px] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          ></div>

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 p-8 z-10 transition-transform hover:scale-[1.01] duration-500">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers className="text-orange-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-black">
                Upload your floor plan
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                Supports JPG, PNG formats up to 10MB
              </p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-serif text-black mb-4">Projects</h2>
              <p className="text-zinc-500 text-lg">
                Your latest work and shared community projects, all in one
                place.
              </p>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center text-sm text-zinc-500">
              Loading your projects…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hasHistory ? (
                designHistory.map((item, index) => {
                  const ownerLabel = item.isPublic
                    ? item.sharedBy || "Unknown"
                    : userName || "You";
                  const name = item.name || `Residence ${item.id}`;
                  return (
                    <div
                      key={item.id || `${item.timestamp}-${index}`}
                      onClick={() => {
                        const scope = item.isPublic ? "public" : "user";
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
                            },
                          },
                        );
                      }}
                      className="group relative bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-zinc-100 relative">
                        <img
                          src={item.renderedImage || item.sourceImage}
                          alt={`Project ${designHistory.length - index}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {item.isPublic && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-800">
                              Community
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex justify-between items-center bg-white border-t border-zinc-100 flex-grow">
                        <div>
                          <h3 className="text-lg font-serif font-bold text-zinc-900 group-hover:text-primary transition-colors">
                            {name}
                          </h3>
                          <div className="flex items-center text-zinc-400 text-xs mt-1 space-x-2">
                            <Clock size={12} />
                            <span className="font-mono uppercase">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-zinc-400 text-[10px] uppercase tracking-wide">
                              By {ownerLabel}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          <ArrowUpRight size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center text-sm text-zinc-500">
                  No projects yet. Upload a floor plan to create your first one.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-zinc-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <LogoPlaceholder text="Delve" icon={<Layers />} />
            <LogoPlaceholder text="Loops" icon={<RefreshCwIcon />} />
            <LogoPlaceholder text="Vanta" icon={<Shield />} />
            <LogoPlaceholder text="Greptile" icon={<Zap />} />
            <LogoPlaceholder text="Mixpanel" icon={<Box />} />
          </div>
        </div>
      </section>
    </div>
  );
}

const LogoPlaceholder = ({
  text,
  icon,
}: {
  text: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center justify-center space-x-2 group cursor-pointer">
    <div className="text-zinc-800 group-hover:text-black transition-colors">
      {icon}
    </div>
    <span className="font-bold text-xl text-zinc-800 group-hover:text-black transition-colors tracking-tight">
      {text}
    </span>
  </div>
);
