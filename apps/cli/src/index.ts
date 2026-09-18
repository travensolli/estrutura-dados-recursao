import { executarCli } from './cli';

const { saida, codigo } = executarCli(process.argv.slice(2));
if (codigo === 0) console.log(saida);
else console.error(saida);
process.exitCode = codigo;
