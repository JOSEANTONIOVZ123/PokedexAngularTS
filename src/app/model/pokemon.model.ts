export interface Pokemon {
  name: string;
  image: string;
  types: string[];
  stats: { name: string; value: number }[];
}
