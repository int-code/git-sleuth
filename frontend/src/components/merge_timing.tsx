import { FiClock } from "react-icons/fi";
import { colors, gradients, type dataInterface } from "./global_var";

type PRVelocityProps = {
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
  data: dataInterface;
};

export const MergeTiming = ({ hoveredCard, setHoveredCard, data }: PRVelocityProps) => {
  // Map backend timings into frontend display
  const timingLabels = [
    { label: "Morning (8-11AM)", icon: "🌅" },
    { label: "Midday (11AM-2PM)", icon: "☀️" },
    { label: "Afternoon (2-5PM)", icon: "🌤️" },
    { label: "Evening (5-8PM)", icon: "🌆" },
    { label: "Late Night (8PM-8AM)", icon: "🌙" },
  ];

  const timingData = data.pr_conflict_timing.map(([total, conflicts]) => {
    const percentage = total > 0 ? Math.round((conflicts / total) * 100) : 0;
    return percentage;
  });

  return (
    <div
      className="group cursor-pointer"
      style={{
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        transform:
          hoveredCard === "merge-timing" ? "translateY(-12px) scale(1.02)" : "none",
        zIndex: hoveredCard === "merge-timing" ? 20 : 1,
      }}
      onMouseEnter={() => setHoveredCard("merge-timing")}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div
        className="h-full flex flex-col relative overflow-hidden"
        style={{
          background: gradients.surface,
          borderRadius: "24px",
          border: `1px solid ${
            hoveredCard === "merge-timing" ? colors.secondary : colors.border
          }`,
          boxShadow:
            hoveredCard === "merge-timing"
              ? `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.secondary}, 0 0 40px rgba(139, 92, 246, 0.3)`
              : "0 15px 35px -10px rgba(0, 0, 0, 0.4)",
          padding: "32px",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: gradients.secondary,
            transform: hoveredCard === "merge-timing" ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.6s ease",
          }}
        ></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3
            className="text-xl font-semibold flex items-center"
            style={{ color: colors.secondary }}
          >
            <FiClock className="mr-3" size={24} />
            MERGE TIMING
          </h3>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              background: "rgba(139, 92, 246, 0.2)",
              color: colors.secondary,
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid rgba(139, 92, 246, 0.4)`,
              backdropFilter: "blur(10px)",
            }}
          >
            UTC-05:00
          </span>
        </div>

        {/* Timing bars */}
        <div className="space-y-8 relative z-10">
          {timingLabels.map((item, index) => (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(220, 225, 235, 0.9)",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "1rem",
                    color: colors.secondary,
                    fontWeight: 700,
                  }}
                >
                  {timingData[index]}%
                </span>
              </div>
              <div
                style={{
                  height: "12px",
                  width: "100%",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "rgba(220, 225, 235, 0.1)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "8px",
                    background: gradients.secondary,
                    width: `${timingData[index]}%`,
                    transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: `0 0 15px ${colors.secondary}`,
                    position: "relative",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
                      transform: "translateX(-100%)",
                      animation:
                        hoveredCard === "merge-timing" ? "shimmer 2s infinite" : "none",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-6 border-t border-opacity-20 relative z-10"
          style={{ borderColor: colors.border }}
        >
          <div
            className="text-center"
            style={{
              fontSize: "0.9rem",
              color: "rgba(220, 225, 235, 0.8)",
            }}
          >
            Peak efficiency:{" "}
            <span
              style={{
                color: colors.secondary,
                fontWeight: 700,
              }}
            >
              11AM-2PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
