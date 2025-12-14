import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const runtime = "nodejs";
export const alt = "Countdown Timer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: { locale: string; slug: string };
}

export default async function Image({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  try {
    const counter = await prisma.counter.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        bgUrl: true,
        posterUrl: true,
        mediaType: true,
        targetDate: true,
        timezone: true,
        enabled: true,
      },
    });

    if (!counter || !counter.enabled) {
      return new ImageResponse(
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0b1020",
            color: "#f3f4f6",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Countdown Not Found
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#9ca3af",
            }}
          >
            This countdown does not exist or is no longer available
          </div>
        </div>,
        {
          ...size,
        }
      );
    }

    // Format the target date - split into date and time
    const formattedDate = formatInTimeZone(
      counter.targetDate,
      counter.timezone || "UTC",
      "MMMM dd, yyyy"
    );
    const formattedTime = formatInTimeZone(counter.targetDate, counter.timezone || "UTC", "HH:mm");
    const timezone = counter.timezone || "UTC";

    // Determine which image to use for OG
    let backgroundImageUrl: string | null = null;

    if (counter.mediaType === "VIDEO") {
      // For videos: use poster if available, otherwise use default image
      const baseUrl = process.env.PUBLIC_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      backgroundImageUrl = counter.posterUrl || `${baseUrl}/bg/default_bg.jpeg`;
    } else {
      // For images: use bgUrl directly
      backgroundImageUrl = counter.bgUrl || null;
    }

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background Image or Fallback */}
        {backgroundImageUrl && (
          <img
            src={backgroundImageUrl}
            alt="Background"
            width={1200}
            height={630}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Fallback background if no image available */}
        {!backgroundImageUrl && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #0b1020 0%, #1a2332 100%)",
            }}
          />
        )}

        {/* Dark Overlay for Text Readability */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        />

        {/* Logo in top-left corner */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
            padding: "12px 20px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#f9fafb",
            }}
          >
            CountDown-0
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: 40,
              lineHeight: 1.2,
              maxWidth: "90%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {counter.title}
          </div>

          {/* Description */}
          {counter.description && (
            <div
              style={{
                fontSize: 32,
                color: "#d1d5db",
                marginBottom: 50,
                lineHeight: 1.4,
                maxWidth: "80%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {counter.description}
            </div>
          )}

          {/* Date Badge - Two Rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 12,
              padding: "20px 40px",
              gap: 8,
            }}
          >
            {/* Date Row */}
            <div
              style={{
                fontSize: 38,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              {formattedDate}
            </div>
            {/* Time + Timezone Row */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: "#d1d5db",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{formattedTime}</span>
              <span
                style={{
                  fontSize: 20,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                {timezone}
              </span>
            </div>
          </div>
        </div>
      </div>,
      {
        ...size,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Fallback error image
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b1020",
          color: "#f3f4f6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Error Loading Countdown
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#9ca3af",
          }}
        >
          Please try again later
        </div>
      </div>,
      {
        ...size,
      }
    );
  }
}
