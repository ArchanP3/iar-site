import { Inter, Saira } from "next/font/google";

/** IAR type: Inter for body text, Saira for headings (h1–h4 pick it up in globals.css). */
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });
const saira = Saira({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap", variable: "--font-saira" });

export const brandFont = { className: `${inter.className} ${saira.variable}` };
