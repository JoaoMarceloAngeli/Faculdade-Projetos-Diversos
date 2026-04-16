// main.mjs - ponto de entrada da aplicação (View)
import { TarefaController } from './src/controller/TarefaController.mjs';

const controller = new TarefaController();

// Elementos do DOM
const form = document.getElementById('form-tarefa');
const inputDescricao = document.getElementById('input-descricao');
const listaTarefas = document.getElementById('lista-tarefas');
const contadorInfo = document.getElementById('contador-info');

// Renderiza a lista de tarefas na tela
function renderizarTarefas() {
    const tarefas = controller.listarTarefas();

    listaTarefas.innerHTML = '';

    if (tarefas.length === 0) {
        listaTarefas.innerHTML = '<li class="vazio">Nenhuma tarefa cadastrada.</li>';
        atualizarContador(tarefas);
        return;
    }

    tarefas.forEach(tarefa => {
        const li = document.createElement('li');
        li.className = 'tarefa-item' + (tarefa.concluida ? ' concluida' : '');
        li.dataset.id = tarefa.id;

        li.innerHTML = `
            <input type="checkbox" class="check-concluida" ${tarefa.concluida ? 'checked' : ''} data-id="${tarefa.id}" />
            <span class="tarefa-texto">${tarefa.descricao}</span>
            <div class="acoes">
                <button class="btn-editar" data-id="${tarefa.id}">Editar</button>
                <button class="btn-remover" data-id="${tarefa.id}">Remover</button>
            </div>
        `;

        listaTarefas.appendChild(li);
    });

    atualizarContador(tarefas);
}

// Atualiza o texto do contador
function atualizarContador(tarefas) {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    contadorInfo.textContent = `${concluidas} de ${total} concluída(s)`;
}

// Evento de submit do formulário - CREATE
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const descricao = inputDescricao.value;

    if (descricao.trim() === '') {
        alert('Digite uma descrição para a tarefa!');
        return;
    }

    controller.adicionarTarefa(descricao);
    inputDescricao.value = '';
    renderizarTarefas();
});

// Eventos na lista (toggle, editar, remover)
listaTarefas.addEventListener('click', function(e) {
    // Alternar conclusão
    if (e.target.classList.contains('check-concluida')) {
        const id = e.target.dataset.id;
        controller.alternarConclusao(id);
        renderizarTarefas();
    }

    // Remover tarefa - DELETE
    if (e.target.classList.contains('btn-remover')) {
        const id = e.target.dataset.id;
        const confirmar = confirm('Deseja remover esta tarefa?');
        if (confirmar) {
            controller.removerTarefa(id);
            renderizarTarefas();
        }
    }

    // Editar tarefa - UPDATE
    if (e.target.classList.contains('btn-editar')) {
        const id = e.target.dataset.id;
        const li = e.target.closest('.tarefa-item');
        const spanTexto = li.querySelector('.tarefa-texto');
        const textoAtual = spanTexto.textContent;

        const novoTexto = prompt('Editar tarefa:', textoAtual);

        if (novoTexto !== null && novoTexto.trim() !== '') {
            controller.atualizarTarefa(id, { descricao: novoTexto.trim() });
            renderizarTarefas();
        }
    }
});

// Inicializa a lista ao carregar a página
renderizarTarefas();
