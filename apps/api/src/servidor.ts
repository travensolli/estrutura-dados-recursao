import { criarAplicacao } from './aplicacao';
import { config } from './config';

const app = criarAplicacao();

app.listen({ port: config.porta, host: config.host }).catch((erro) => {
  app.log.error(erro);
  process.exit(1);
});
