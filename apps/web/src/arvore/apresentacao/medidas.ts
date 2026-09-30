/** Medidas do desenho no palco: árvore inteira visível, mesmo apertada. */
export const ENQUADRE_APRESENTACAO = 0.12;

/* As alturas descontam da janela o cromo do palco e o que cada etapa empilha em volta
   do desenho, como na tela Árvore; o piso vale para janelas muito baixas. O teto só
   pesa quando a árvore é alta: a sem cache é larga e fica limitada pela largura. */

/** Etapa 2: placar acima, faixa dos argumentos abaixo, árvore na largura toda. */
export const ALTURA_ARVORE = 'min-h-[160px] max-h-[clamp(160px,calc(100dvh-455px),820px)]';
/** Etapa 3: regras, momentos, controles e narração acima do desenho. */
export const ALTURA_ARVORE_REPRODUCAO =
  'min-h-[180px] max-h-[clamp(180px,calc(100dvh-382px),820px)]';
/** Etapa 4: duas árvores lado a lado, com as podas e a frase abaixo. */
export const ALTURA_ARVORE_DUPLA = 'min-h-[160px] max-h-[clamp(160px,calc(100dvh-400px),700px)]';
