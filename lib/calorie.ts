/**
 * Kalkulator kalori racikan (gula, susu soya, minyak, dll + air).
 * Nilai kkal/100 default dari TKPI/USDA — editable per bahan di form
 * karena kadar gizi produk komersial bisa beda dari tabel acuan.
 */

export type IngredientUnit = "g" | "ml";

export interface IngredientCatalogEntry {
  key: string;
  label: string;
  unit: IngredientUnit;
  /** kkal per 100g atau 100ml (sesuai `unit`) */
  defaultKcalPer100: number;
}

export const INGREDIENT_CATALOG: IngredientCatalogEntry[] = [
  { key: "gula_pasir", label: "Gula Pasir", unit: "g", defaultKcalPer100: 387 },
  { key: "susu_soya", label: "Susu Soya Cair", unit: "ml", defaultKcalPer100: 41 },
  { key: "minyak_goreng", label: "Minyak Goreng", unit: "ml", defaultKcalPer100: 813 },
  { key: "vco", label: "VCO (Virgin Coconut Oil)", unit: "ml", defaultKcalPer100: 793 },
  {
    key: "evoo",
    label: "Extra Virgin Olive Oil",
    unit: "ml",
    defaultKcalPer100: 813,
  },
  { key: "custom", label: "Bahan lain (custom)", unit: "g", defaultKcalPer100: 0 },
];

export function findIngredient(key: string): IngredientCatalogEntry | undefined {
  return INGREDIENT_CATALOG.find((i) => i.key === key);
}

/** Satu baris bahan dalam racikan */
export interface RecipeIngredientInput {
  key: string; // salah satu dari INGREDIENT_CATALOG, atau "custom"
  customLabel?: string; // wajib diisi bila key === "custom"
  unit: IngredientUnit;
  amount: number; // gram atau ml sesuai `unit`
  kcalPer100: number; // boleh override nilai default katalog
}

export interface RecipeIngredientResult extends RecipeIngredientInput {
  label: string;
  kcal: number;
}

export interface RecipeResult {
  ingredients: RecipeIngredientResult[];
  airMl: number;
  totalKcal: number;
  /** Total volume akhir = jumlah semua bahan (gram diasumsikan ~1g = 1ml) + air */
  totalVolumeMl: number;
  kcalPerMl: number;
}

/** Validasi & hitung satu baris bahan menjadi kkal */
function resolveIngredient(input: RecipeIngredientInput): RecipeIngredientResult {
  const catalogEntry = findIngredient(input.key);
  const label =
    input.key === "custom"
      ? input.customLabel?.trim() || "Bahan custom"
      : catalogEntry?.label ?? input.key;

  const amount = Math.max(0, input.amount);
  const kcalPer100 = Math.max(0, input.kcalPer100);
  const kcal = (amount * kcalPer100) / 100;

  return { ...input, amount, kcalPer100, label, kcal };
}

/**
 * Hitung total kalori & kepadatan kalori (kkal/ml) dari racikan.
 * Asumsi: gram bahan padat/kental dianggap setara ml saat dicampur
 * (simplifikasi umum untuk racikan feeding rumahan).
 */
export function calculateRecipe(
  ingredients: RecipeIngredientInput[],
  airMl: number
): RecipeResult {
  const resolved = ingredients.map(resolveIngredient);
  const air = Math.max(0, airMl);

  const totalKcal = resolved.reduce((sum, i) => sum + i.kcal, 0);
  const totalVolumeMl = resolved.reduce((sum, i) => sum + i.amount, 0) + air;
  const kcalPerMl = totalVolumeMl > 0 ? totalKcal / totalVolumeMl : 0;

  return {
    ingredients: resolved,
    airMl: air,
    totalKcal: Math.round(totalKcal * 10) / 10,
    totalVolumeMl: Math.round(totalVolumeMl * 10) / 10,
    kcalPerMl: Math.round(kcalPerMl * 1000) / 1000,
  };
}

/** Kalori untuk satu sesi feeding, dari kepadatan kalori racikan (kkal/ml) */
export function calorieForVolume(volumeMl: number, kcalPerMl: number): number {
  return Math.round(Math.max(0, volumeMl) * kcalPerMl * 10) / 10;
}
