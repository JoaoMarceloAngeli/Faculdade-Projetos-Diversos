// Service responsável por persistir os dados no localStorage

const CHAVE = 'tarefas_mvc';

export class TarefaService {

    // Salva o array completo de tarefas
    salvarTodas(tarefas) {
        localStorage.setItem(CHAVE, JSON.stringify(tarefas));
    }

    // Retorna o array de tarefas. Se não tiver nada, retorna array vazio
    buscarTodas() {
        const dados = localStorage.getItem(CHAVE);
        if (dados) {
            return JSON.parse(dados);
        }
        return [];
    }
}
