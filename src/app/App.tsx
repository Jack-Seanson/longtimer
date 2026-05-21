import { useState, useEffect, useRef } from "react";
import { ArrowUp, Target, Share2, Check, Clock } from "lucide-react";
import { Toaster, toast } from "sonner";

// ============================================================================
// Types & URL Encoding/Decoding
// ============================================================================

interface TimerData {
  name: string;
  description?: string;
  startTime: number; // Unix timestamp (ms)
  endTime: number; // Unix timestamp (ms)
  timezone: string;
}

function encodeTimerData(data: TimerData): string {
  const params = new URLSearchParams({
    n: data.name,
    d: data.description || "",
    s: data.startTime.toString(),
    e: data.endTime.toString(),
    z: data.timezone,
  });
  return `?${params.toString()}`;
}

function decodeTimerData(search: string): TimerData | null {
  try {
    const params = new URLSearchParams(search);
    const name = params.get("n");
    const startTime = params.get("s");
    const endTime = params.get("e");
    const timezone = params.get("z");

    if (!name || !startTime || !endTime || !timezone) {
      return null;
    }

    return {
      name,
      description: params.get("d") || undefined,
      startTime: parseInt(startTime, 10),
      endTime: parseInt(endTime, 10),
      timezone,
    };
  } catch (error) {
    console.error("Error decoding timer data:", error);
    return null;
  }
}

// ============================================================================
// Time Calculations
// ============================================================================

interface TimeRemaining {
  total: number; // milliseconds
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

function calculateTimeRemaining(endTime: number): TimeRemaining {
  const now = Date.now();
  const total = Math.max(0, endTime - now);
  const isComplete = total === 0;

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds, isComplete };
}

// ============================================================================
// Main App Component
// ============================================================================

export default function App() {
  const [view, setView] = useState<"create" | "timer" | "error">("create");
  const [timerData, setTimerData] = useState<TimerData | null>(null);

  useEffect(() => {
    const search = window.location.search;
    if (search) {
      const decoded = decodeTimerData(search);
      if (decoded) {
        setTimerData(decoded);
        setView("timer");
      } else {
        setView("error");
      }
    } else {
      setView("create");
    }
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      {view === "create" && <CreatePage onTimerCreated={setTimerData} setView={setView} />}
      {view === "error" && <ErrorPage />}
      {view === "timer" && timerData && <TimerViewPage timerData={timerData} />}
    </>
  );
}

// ============================================================================
// Create Page
// ============================================================================

interface CreatePageProps {
  onTimerCreated: (data: TimerData) => void;
  setView: (view: "create" | "timer" | "error") => void;
}

function CreatePage({ onTimerCreated, setView }: CreatePageProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inputMode, setInputMode] = useState<"date" | "duration">("date");
  
  // Date mode
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("12:00");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  
  // Duration mode
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  
  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("12:00");
  
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Timer name is required");
      return;
    }

    // Determine start time
    let startTime: number;
    if (customStartDate) {
      const startDateTimeString = `${customStartDate}T${customStartTime}`;
      startTime = new Date(startDateTimeString).getTime();
      
      if (isNaN(startTime)) {
        setError("Invalid custom start date or time");
        return;
      }
      
      if (startTime > Date.now()) {
        setError("Start date cannot be in the future");
        return;
      }
    } else {
      startTime = Date.now();
    }

    let endTime: number;

    if (inputMode === "date") {
      if (!targetDate) {
        setError("Target date is required");
        return;
      }
      
      const dateTimeString = `${targetDate}T${targetTime}`;
      endTime = new Date(dateTimeString).getTime();
      
      if (isNaN(endTime)) {
        setError("Invalid date or time");
        return;
      }
      
      if (endTime <= startTime) {
        setError("End date must be after start date");
        return;
      }
    } else {
      // Duration mode
      const y = parseInt(years || "0", 10);
      const m = parseInt(months || "0", 10);
      const d = parseInt(days || "0", 10);
      const h = parseInt(hours || "0", 10);
      
      if (y === 0 && m === 0 && d === 0 && h === 0) {
        setError("Please enter a duration");
        return;
      }
      
      const durationMs =
        y * 365.25 * 24 * 60 * 60 * 1000 +
        m * 30.44 * 24 * 60 * 60 * 1000 +
        d * 24 * 60 * 60 * 1000 +
        h * 60 * 60 * 1000;
      
      endTime = startTime + durationMs;
    }

    const timerData: TimerData = {
      name: name.trim(),
      description: description.trim() || undefined,
      startTime,
      endTime,
      timezone,
    };

    const url = encodeTimerData(timerData);
    window.history.pushState({}, "", url);
    onTimerCreated(timerData);
    setView("timer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold mb-3 tracking-tight">Long Timer</h1>
          <p className="text-muted-foreground text-lg">
            Countdown to meaningful moments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Timer Name */}
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium">
              Timer Name *
            </label>
            <input
              id="name"
              type="text"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mortgage Freedom Day"
              className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              maxLength={140}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., The day we finally own our home"
              className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Input Mode Toggle */}
          <div>
            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode("date")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "date"
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/50"
                }`}
              >
                Pick a Date
              </button>
              <button
                type="button"
                onClick={() => setInputMode("duration")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "duration"
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/50"
                }`}
              >
                Set Duration
              </button>
            </div>
          </div>

          {/* Date Mode */}
          {inputMode === "date" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block mb-2 text-sm font-medium">
                  Target Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="time" className="block mb-2 text-sm font-medium">
                  Target Time *
                </label>
                <input
                  id="time"
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="timezone" className="block mb-2 text-sm font-medium">
                  Timezone *
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Intl.supportedValuesOf("timeZone").map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Duration Mode */}
          {inputMode === "duration" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="years" className="block mb-2 text-sm font-medium">
                  Years
                </label>
                <input
                  id="years"
                  type="number"
                  min="0"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="months" className="block mb-2 text-sm font-medium">
                  Months
                </label>
                <input
                  id="months"
                  type="number"
                  min="0"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="days" className="block mb-2 text-sm font-medium">
                  Days
                </label>
                <input
                  id="days"
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="hours" className="block mb-2 text-sm font-medium">
                  Hours
                </label>
                <input
                  id="hours"
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{showAdvanced ? "−" : "+"}</span>
              Advanced Settings
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Set a custom start time for timers that began in the past (e.g., your first mortgage payment, relationship anniversary, etc.)
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="customStartDate" className="block mb-2 text-sm font-medium">
                      Timer Start Date <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      id="customStartDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  {customStartDate && (
                    <div>
                      <label htmlFor="customStartTime" className="block mb-2 text-sm font-medium">
                        Timer Start Time
                      </label>
                      <input
                        id="customStartTime"
                        type="time"
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start Timer
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Timer View Page
// ============================================================================

interface TimerViewPageProps {
  timerData: TimerData;
}

function TimerViewPage({ timerData }: TimerViewPageProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(timerData.endTime)
  );
  const [viewMode, setViewMode] = useState<"long" | "compact">("long");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(timerData.endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerData.endTime]);

  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback to older method
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
          } else {
            throw new Error("execCommand failed");
          }
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      // If all else fails, show the URL for manual copying
      toast.error("Please copy the URL manually");
    }
  };

  if (timeRemaining.isComplete) {
    return <CompletePage timerData={timerData} />;
  }

  const totalDuration = timerData.endTime - timerData.startTime;
  const elapsed = Date.now() - timerData.startTime;
  const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-semibold mb-2 tracking-tight">
            {timerData.name}
          </h1>
          {timerData.description && (
            <p className="text-muted-foreground mb-6">{timerData.description}</p>
          )}

          {/* Countdown Display */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <CountdownUnit value={timeRemaining.days} label="Days" />
            <CountdownUnit value={timeRemaining.hours} label="Hours" />
            <CountdownUnit value={timeRemaining.minutes} label="Mins" />
            <CountdownUnit value={timeRemaining.seconds} label="Secs" />
          </div>

          {/* End Date */}
          <p className="text-sm text-muted-foreground mb-4">
            Until {new Date(timerData.endTime).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share
                </>
              )}
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === "long" ? "compact" : "long")}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
            >
              {viewMode === "long" ? "Compact View" : "Long View"}
            </button>
          </div>
          
          {/* View Mode Description */}
          {viewMode === "long" && (
            <p className="text-xs text-muted-foreground mt-4">
              Scroll to experience time at scale — 1 pixel = 1 hour
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <ProgressBar
        timerData={timerData}
        elapsed={elapsed}
        totalDuration={totalDuration}
        viewMode={viewMode}
      />
    </div>
  );
}

// ============================================================================
// Countdown Unit Component
// ============================================================================

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="text-center">
      <div className="text-3xl font-semibold tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  timerData: TimerData;
  elapsed: number;
  totalDuration: number;
  viewMode: "long" | "compact";
}

function ProgressBar({ timerData, elapsed, totalDuration, viewMode }: ProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate bar dimensions
  const totalSeconds = Math.floor(totalDuration / 1000);
  const elapsedSeconds = Math.floor(elapsed / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const elapsedHours = Math.floor(elapsedSeconds / 3600);
  
  // In long mode: 1 pixel = 1 hour
  // In compact mode: scale to viewport height
  const isCompact = viewMode === "compact";
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1000;
  const barHeight = isCompact ? viewportHeight * 0.7 : totalHours;
  const currentPosition = isCompact
    ? (elapsedSeconds / totalSeconds) * barHeight
    : elapsedHours;

  // Generate scale markers
  const markers = generateMarkers(timerData.startTime, timerData.endTime, totalSeconds, barHeight, isCompact);

  // Generate flying time markers for long view
  const flyingMarkers = !isCompact ? generateFlyingMarkers(timerData.startTime, timerData.endTime, totalHours) : [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToNow = () => {
    if (isCompact) {
      // In compact mode, just scroll to the marker
      const targetElement = document.getElementById("current-position");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // In long mode, use dramatic accelerated scroll
      const targetY = currentPosition + 200; // Offset for visibility
      dramaticScrollTo(targetY);
    }
  };

  const dramaticScrollTo = (targetY: number) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = Math.min(3000, Math.max(1000, Math.abs(distance) / 1000));
    let startTime: number | null = null;

    const easeInOutQuart = (t: number): number => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutQuart(progress);
      
      window.scrollTo(0, startY + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        minHeight: isCompact ? `${barHeight}px` : `${barHeight + 1000}px`,
      }}
    >
      {/* Main Progress Bar Container */}
      <div className="flex justify-center py-20">
        <div
          className="relative"
          style={{
            width: isCompact ? "80%" : "min(80%, 400px)",
            maxWidth: "400px",
            height: `${barHeight}px`,
          }}
        >
          {/* Background (Remaining) */}
          <div
            className="absolute inset-0 bg-secondary rounded-full"
            style={{ backgroundColor: "var(--progress-remaining)" }}
          />

          {/* Foreground (Elapsed) */}
          <div
            className="absolute top-0 left-0 right-0 rounded-t-full transition-all duration-1000"
            style={{
              height: `${currentPosition}px`,
              backgroundColor: "var(--progress-elapsed)",
            }}
          />

          {/* Scale Markers */}
          {markers.map((marker, index) => (
            <div
              key={index}
              className="absolute left-0 right-0 flex items-center"
              style={{ top: `${marker.position}px` }}
            >
              <div className="w-full h-px bg-border" />
              {(marker.showLabel || !isCompact) && (
                <div className="absolute left-full ml-4 text-xs text-muted-foreground whitespace-nowrap">
                  {marker.label}
                </div>
              )}
            </div>
          ))}

          {/* "You Are Here" Indicator */}
          <div
            id="current-position"
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${currentPosition}px` }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full border-4 border-background shadow-lg" />
            {!isCompact && (
              <div className="absolute left-full ml-6 text-sm font-medium whitespace-nowrap bg-background px-2 py-1 rounded shadow-sm">
                You are here
              </div>
            )}
          </div>

          {/* End Goal Marker */}
          <div
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${barHeight}px` }}
          >
            {/* Pill/Badge for end goal */}
            <div className="absolute left-1/2 -translate-x-1/2 translate-y-4 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
              {new Date(timerData.endTime).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Flying Time Markers (Long View Only) */}
      {!isCompact && flyingMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
          style={{
            top: `${marker.position + 200}px`, // offset from top of container
          }}
        >
          <div className="text-center whitespace-nowrap">
            <div className={`font-semibold tracking-tight ${marker.isYear ? 'text-6xl md:text-8xl' : 'text-4xl md:text-6xl'} text-foreground/20`}>
              {marker.label}
            </div>
            {marker.sublabel && (
              <div className="text-2xl md:text-4xl text-muted-foreground/20 mt-2">
                {marker.sublabel}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Floating Navigation Buttons */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col gap-3 z-20">
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <button
          onClick={scrollToNow}
          className="w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          aria-label="Jump to current time"
        >
          <Target className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Marker Generation
// ============================================================================

interface Marker {
  position: number;
  label: string;
  timestamp: number;
  showLabel?: boolean; // Whether to show the label in compact view
}

function generateMarkers(
  startTime: number,
  endTime: number,
  totalSeconds: number,
  barHeight: number,
  isCompact: boolean = false
): Marker[] {
  const markers: Marker[] = [];
  const duration = endTime - startTime;

  // Determine appropriate interval based on duration
  let interval: number;
  let formatLabel: (time: number) => string;

  if (duration < 24 * 60 * 60 * 1000) {
    // Less than a day: show every hour
    interval = 60 * 60 * 1000;
    formatLabel = (time) =>
      new Date(time).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
  } else if (duration < 30 * 24 * 60 * 60 * 1000) {
    // Less than a month: show every day
    interval = 24 * 60 * 60 * 1000;
    formatLabel = (time) =>
      new Date(time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
  } else if (duration < 365 * 24 * 60 * 60 * 1000) {
    // Less than a year: show every week
    interval = 7 * 24 * 60 * 60 * 1000;
    formatLabel = (time) =>
      new Date(time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
  } else {
    // More than a year: show every month
    interval = 30 * 24 * 60 * 60 * 1000;
    formatLabel = (time) =>
      new Date(time).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      });
  }

  // Add start marker at position 0
  markers.push({
    position: 0,
    label: formatLabel(startTime),
    timestamp: startTime,
    showLabel: true,
  });

  for (let time = startTime + interval; time <= endTime; time += interval) {
    const elapsed = time - startTime;
    const position = (elapsed / duration) * barHeight;

    markers.push({
      position,
      label: formatLabel(time),
      timestamp: time,
      showLabel: true,
    });
  }

  // Ensure end marker is included
  if (markers[markers.length - 1].timestamp !== endTime) {
    markers.push({
      position: barHeight,
      label: formatLabel(endTime),
      timestamp: endTime,
      showLabel: true,
    });
  }

  // In compact mode, filter out labels that are too close together
  if (isCompact) {
    const MIN_LABEL_SPACING = 30; // Minimum pixels between labels
    
    // Always show start and end markers
    const filteredMarkers = [markers[0]];
    
    for (let i = 1; i < markers.length - 1; i++) {
      const lastShownMarker = filteredMarkers[filteredMarkers.length - 1];
      const distanceFromLast = markers[i].position - lastShownMarker.position;
      
      // Only show label if far enough from the last shown marker
      if (distanceFromLast >= MIN_LABEL_SPACING) {
        markers[i].showLabel = true;
        filteredMarkers.push(markers[i]);
      } else {
        markers[i].showLabel = false;
      }
    }
    
    // Always show the end marker
    if (markers.length > 1) {
      markers[markers.length - 1].showLabel = true;
    }
  }

  return markers;
}

// ============================================================================
// Flying Marker Generation (for Long View)
// ============================================================================

interface FlyingMarker {
  position: number;
  label: string;
  sublabel?: string;
  timestamp: number;
  isYear: boolean;
}

function generateFlyingMarkers(
  startTime: number,
  endTime: number,
  totalHours: number
): FlyingMarker[] {
  const markers: FlyingMarker[] = [];
  const duration = endTime - startTime;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  // Start from the first full month after start
  const currentDate = new Date(startTime);
  currentDate.setDate(1);
  currentDate.setHours(0, 0, 0, 0);
  
  // Move to next month if we're already past the 1st
  if (currentDate.getTime() <= startTime) {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  while (currentDate.getTime() <= endTime) {
    const timestamp = currentDate.getTime();
    const elapsed = timestamp - startTime;
    const position = Math.floor(elapsed / 3600000); // Convert ms to hours (1 pixel = 1 hour)
    
    const month = currentDate.toLocaleDateString(undefined, { month: 'long' });
    const year = currentDate.getFullYear();
    const isJanuary = currentDate.getMonth() === 0;
    
    // Create year markers for January, month markers for other months
    if (isJanuary) {
      markers.push({
        position,
        label: year.toString(),
        sublabel: undefined,
        timestamp,
        isYear: true,
      });
    } else {
      markers.push({
        position,
        label: month,
        sublabel: year.toString(),
        timestamp,
        isYear: false,
      });
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return markers;
}

// ============================================================================
// Complete Page
// ============================================================================

interface CompletePageProps {
  timerData: TimerData;
}

function CompletePage({ timerData }: CompletePageProps) {
  const totalDuration = timerData.endTime - timerData.startTime;
  const days = Math.floor(totalDuration / (1000 * 60 * 60 * 24));

  const createNew = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
          <Check className="w-10 h-10 text-accent" />
        </div>
        
        <h1 className="text-4xl font-semibold mb-3">{timerData.name}</h1>
        
        {timerData.description && (
          <p className="text-muted-foreground mb-6 text-lg">
            {timerData.description}
          </p>
        )}
        
        <div className="text-6xl font-bold mb-3 tabular-nums text-accent">
          00:00:00:00
        </div>
        
        <p className="text-muted-foreground mb-8">
          Completed after {days} days
        </p>
        
        <button
          onClick={createNew}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create New Timer
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Error Page
// ============================================================================

function ErrorPage() {
  const createNew = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <Clock className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        
        <h1 className="text-3xl font-semibold mb-3">Timer Not Found</h1>
        
        <p className="text-muted-foreground mb-8">
          This timer link appears to be invalid or incomplete. Create a new timer to get started.
        </p>
        
        <button
          onClick={createNew}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create New Timer
        </button>
      </div>
    </div>
  );
}
