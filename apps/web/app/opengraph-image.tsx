import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "gurumates — Find Trusted Tutors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0080D0",
          backgroundImage: "linear-gradient(135deg, #0080D0 0%, #0060A0 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 80px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              marginBottom: 20,
              letterSpacing: "-2px",
            }}
          >
            gurumates
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            Find Trusted Tutors Near You
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              marginTop: 24,
              textAlign: "center",
            }}
          >
            Academics • Coding • Music • Languages • More
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              color: "#0080D0",
              padding: "12px 32px",
              borderRadius: 12,
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Post Free • Chat Safe • Connect When Ready
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
