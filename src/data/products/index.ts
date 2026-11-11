import { aflProduct } from "./afl";
import { callMonitorProduct } from "./call-monitor";
import { colorectalProteomicsProduct } from "./colorectal-proteomics";
import { f1Product } from "./f1";
import { heartsProduct } from "./hearts";
import { linkedhiveProduct } from "./linkedhive";
import { lynksphereProduct } from "./lynksphere";
import { mindsignsProduct } from "./mindsigns";
import { portfolioProduct } from "./portfolio";
import { renewableEnergyProduct } from "./renewable-energy";
import { shepherdProduct } from "./shepherd";
import { timebreakProduct } from "./timebreak";
import type { Product } from "./types";
import { usageFinderProduct } from "./usage-finder";
import { walletaProduct } from "./walleta";

export type { Chapter, Product, Shot, ShotFrame } from "./types";

/** Every project with an in-depth page, in the order "Next" walks through them (the order of projects.ts). */
export const PRODUCTS: Product[] = [
  shepherdProduct,
  walletaProduct,
  usageFinderProduct,
  timebreakProduct,
  linkedhiveProduct,
  lynksphereProduct,
  mindsignsProduct,
  colorectalProteomicsProduct,
  portfolioProduct,
  aflProduct,
  renewableEnergyProduct,
  f1Product,
  callMonitorProduct,
  heartsProduct,
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);
