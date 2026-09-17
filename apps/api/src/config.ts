export const config = {
  porta: Number(process.env.PORTA ?? 3333),
  host: process.env.HOST ?? '0.0.0.0',
  versao: process.env.VERSAO_APP ?? '0.1.0',
};
