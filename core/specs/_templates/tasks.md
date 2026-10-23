# Tarefas — <Nome da feature>

- **Status:** rascunho
- **Requisitos:** [requirements.md](./requirements.md)
- **Design:** [design.md](./design.md)

Cada tarefa deve ser pequena o bastante para um único commit, deixar o projeto compilando e indicar os requisitos que atende. Marque `[x]` ao concluir.

- [ ] 1. <Tarefa de base: fundações descritas no design>
  - <detalhe do que fazer, com caminho do arquivo>
  - _Requisitos: 1.1_
- [ ] 2. <Requisito 1>
  - [ ] 2.1 <subtarefa>
    - _Requisitos: 1.1, 1.2_
  - [ ] 2.2 <subtarefa com testes>
    - _Requisitos: 1.1, 1.2_
- [ ] 3. Testes de regressão do comportamento preservado
  - _Preserva: P1, P2_
- [ ] 4. Verificação final
  - Itens de entrega exigidos pelo projeto em `docs/steering/tech.md` (ou "não se aplica")
  - Rodar os comandos de verificação de `docs/steering/tech.md`
  - Conferir que cada critério de aceite e cada regra preservada tem teste
  - Atualizar o Status da spec para `implementado`

## Cobertura

| Item | Tarefa |
| --- | --- |
| 1.1 | 1, 2 |
| 1.2 | 2 |
| P1 | 3 |
| P2 | 3 |
