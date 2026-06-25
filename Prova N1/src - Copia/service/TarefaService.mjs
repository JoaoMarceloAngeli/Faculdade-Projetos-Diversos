const STORAGE_KEY = 'tarefas';

export default class TarefaService {
  static salvarTodas(tarefas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  }

  static buscarTodas() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}