module.exports = {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#8b0000",

          secondary: "#f5be58",

          accent: "#bad80a",

          neutral: "#3D4451",

          "base-100": "#fff3c9",

          info: "#2563eb",

          success: "#bef264",

          warning: "#facc15",

          error: "#dc2626",
        },
      },
    ],
  },
};
