// Modelo da entidade Tarefa
export class Tarefa {
    constructor(descricao) {
        this.id = Date.now().toString(); // ID único gerado com timestamp
        this.descricao = descricao;
        this.concluida = false;
    }
}
