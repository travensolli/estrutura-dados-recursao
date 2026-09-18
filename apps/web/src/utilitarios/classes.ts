export type ValorClasse = string | false | null | undefined;

/** Junta classes ignorando valores vazios, falsos ou indefinidos. */
export function juntarClasses(...valores: ValorClasse[]): string {
  return valores.filter(Boolean).join(' ');
}
