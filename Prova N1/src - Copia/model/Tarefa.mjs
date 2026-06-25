
export default class Tarefa {
  constructor(id, descricao, concluida = false) {
    this.id = id;
    this.descricao = descricao;
    this.concluida = concluida;
  }

  static criar(descricao) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new Tarefa(id, descricao, false);
  }
}
