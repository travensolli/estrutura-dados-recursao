/**
 * Fila serial: garante um trabalho pesado por vez, para os benchmarks não
 * disputarem processador entre si. Uma tarefa que falha não interrompe a fila.
 */
export class FilaSerial {
  #ultima: Promise<unknown> = Promise.resolve();
  #pendentes = 0;

  get pendentes(): number {
    return this.#pendentes;
  }

  enfileirar<T>(tarefa: () => Promise<T> | T): Promise<T> {
    this.#pendentes += 1;
    const execucao = this.#ultima.then(async () => {
      try {
        return await tarefa();
      } finally {
        this.#pendentes -= 1;
      }
    });
    this.#ultima = execucao.then(
      () => undefined,
      () => undefined,
    );
    return execucao;
  }
}
