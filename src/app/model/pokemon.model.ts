export interface Pokemon {
  id: number;
  name: string;
  image: string;
  imageshiny:string;
  types: string[];
  stats: { name: string; value: number }[];
  isLegendary?: boolean;
  isMythical?: boolean;
}
