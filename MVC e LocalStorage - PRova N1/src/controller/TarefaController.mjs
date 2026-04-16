// Controller - faz a ponte entre a View e o Model/Service
import { Tarefa } from '../model/Tarefa.mjs';
import { TarefaService } from '../service/TarefaService.mjs';

export class TarefaController {
    constructor() {
        this.service = new TarefaService();
    }

    // CREATE - adiciona uma nova tarefa
    adicionarTarefa(descricao) {
        if (!descricao || descricao.trim() === '') {
            throw new Error('A descrição não pode ser vazia!');
        }

        const tarefas = this.service.buscarTodas();
        const nova = new Tarefa(descricao.trim());
        tarefas.push(nova);
        this.service.salvarTodas(tarefas);
        return nova;
    }

    // READ - retorna todas as tarefas
    listarTarefas() {
        return this.service.buscarTodas();
    }

    // UPDATE - atualiza os dados de uma tarefa pelo ID
    atualizarTarefa(id, novosDados) {
        const tarefas = this.service.buscarTodas();
        const index = tarefas.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Tarefa não encontrada!');
        }

        tarefas[index] = { ...tarefas[index], ...novosDados };
        this.service.salvarTodas(tarefas);
        return tarefas[index];
    }

    // DELETE - remove uma tarefa pelo ID
    removerTarefa(id) {
        const tarefas = this.service.buscarTodas();
        const novaLista = tarefas.filter(t => t.id !== id);
        this.service.salvarTodas(novaLista);
    }

    // Alterna o status de concluída
    alternarConclusao(id) {
        const tarefas = this.service.buscarTodas();
        const tarefa = tarefas.find(t => t.id === id);

        if (!tarefa) {
            throw new Error('Tarefa não encontrada!');
        }

        return this.atualizarTarefa(id, { concluida: !tarefa.concluida });
    }
}
