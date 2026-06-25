import Tarefa from '../model/Tarefa.mjs';
import TarefaService from '../service/TarefaService.mjs';

export default class TarefaController {
  static adicionarTarefa(descricao) {
    const tarefa = Tarefa.criar(descricao);
    const tarefas = TarefaService.buscarTodas();
    tarefas.push(tarefa);
    TarefaService.salvarTodas(tarefas);
    return tarefa;
  }

  static listarTarefas() {
    return TarefaService.buscarTodas();
  }

  static atualizarTarefa(id, novosDados) {
    const tarefas = TarefaService.buscarTodas();
    const index = tarefas.findIndex(t => t.id === id);
    if (index === -1) return null;
    const tarefa = tarefas[index];
    Object.assign(tarefa, novosDados);
    tarefas[index] = tarefa;
    TarefaService.salvarTodas(tarefas);
    return tarefa;
  }

  static removerTarefa(id) {
    let tarefas = TarefaService.buscarTodas();
    tarefas = tarefas.filter(t => t.id !== id);
    TarefaService.salvarTodas(tarefas);
  }

  static alternarConclusao(id) {
    const tarefas = TarefaService.buscarTodas();
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return null;
    tarefa.concluida = !tarefa.concluida;
    TarefaService.salvarTodas(tarefas);
    return tarefa;
  }
}