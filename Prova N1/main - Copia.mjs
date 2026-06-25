import TarefaController from './src/controller/TarefaController.mjs';

const form = document.getElementById('form-tarefa');
const input = document.getElementById('descricao');
const lista = document.getElementById('lista-tarefas');

function render() {
  const tarefas = TarefaController.listarTarefas();
  lista.innerHTML = '';
  tarefas.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task' + (t.concluida ? ' done' : '');
    li.dataset.id = t.id;
    li.innerHTML = `
      <span>${t.descricao}</span>
      <div class="actions">
        <button class="toggle">${t.concluida ? 'Reabrir' : 'Concluir'}</button>
        <button class="edit">Editar</button>
        <button class="del">Excluir</button>
      </div>
    `;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const descricao = input.value.trim();
  if (!descricao) return;
  TarefaController.adicionarTarefa(descricao);
  input.value = '';
  render();
});

lista.addEventListener('click', e => {
  const btn = e.target;
  const li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (btn.classList.contains('toggle')) {
    TarefaController.alternarConclusao(id);
    render();
  } else if (btn.classList.contains('edit')) {
    const tarefa = TarefaController.listarTarefas().find(t => t.id === id);
    const novaDescricao = prompt('Editar tarefa:', tarefa.descricao);
    if (novaDescricao !== null && novaDescricao.trim() !== '') {
      TarefaController.atualizarTarefa(id, { descricao: novaDescricao.trim() });
      render();
    }
  } else if (btn.classList.contains('del')) {
    TarefaController.removerTarefa(id);
    render();
  }
});

render();