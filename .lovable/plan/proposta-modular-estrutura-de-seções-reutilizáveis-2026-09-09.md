# Proposta modular — estrutura de seções reutilizáveis

Hoje as propostas que não são de Controle de Ponto mostram praticamente só Capa, Problema, Investimento e Próximo passo. Esta etapa cria uma estrutura de seções reutilizáveis que serve para qualquer solução (Ponto, Acesso, Veicular, Monitoramento), sem mexer no que já funciona.

## O que muda para o vendedor

Na proposta passa a existir a área **Personalizar proposta**, com a lista completa de seções na ordem padrão:

```text
Capa
Contexto / Problema
Solução proposta
Como funciona
Composição da solução
Recursos
Benefícios
Implantação
Diferenciais / Proteção
Investimento
Próximo passo
```

- Cada seção liga e desliga de forma independente.
- Cada seção de texto tem título e texto editáveis, com sugestão automática conforme a solução escolhida.
- Composição, Recursos e Benefícios são montados a partir dos produtos já selecionados na proposta (nada é digitado duas vezes).
- Preview, proposta pública e modo apresentação respeitam exatamente as seções ligadas e a ordem definida.
- As seções clássicas de Controle de Ponto (calculadora, relógio, sistema, comparação, compra x comodato) continuam existindo e só aparecem quando a categoria Ponto está na proposta.

## Compatibilidade

Propostas antigas continuam idênticas: as seções novas nascem desligadas para propostas que já existem e ligadas para propostas novas sem Controle de Ponto. Nenhuma proposta, preço, produto ou imagem é alterado.

## Detalhes técnicos

- Novo módulo `src/lib/sections-model.ts`: registro único de seções (chave, rótulo, tipo, ordem, se é exclusiva de ponto) e mapa de recomendação por categoria. Ordem vem de um array de dados, o que permite reordenação/drag-and-drop numa etapa futura sem refatorar.
- Novas chaves de seção genéricas: `contexto`, `solucao_proposta`, `como_funciona`, `composicao`, `recursos`, `beneficios`, `implantacao`, `diferenciais`. Somam-se às chaves atuais em `SectionKey`.
- Conteúdo editável guardado no campo `texts` (jsonb) já existente da proposta, no padrão `sec_<chave>_title` / `sec_<chave>_body`. Ativação guardada no `sections` (jsonb) existente. **Sem migração de banco.**
- Novo `src/components/proposal/GenericSections.tsx` com os renderizadores das seções genéricas, reaproveitando o visual atual (grid, aurora, glass, Reveal/Stagger, verde #16A34A e roxo #403D62).
- "Como funciona" renderiza um fluxo em etapas alimentado por dados por categoria (Identificação → Validação → Autorização → Liberação → Registro etc.), editável no texto de apoio.
- `ProposalDocument.useVisibleSections` passa a montar a lista a partir do registro: seções genéricas + módulos por categoria + seções clássicas de ponto, na ordem única. Preview, `/p/$token` e modo apresentação herdam automaticamente.
- Editor (`propostas.$id.editar.tsx`): aba "Seções" vira **Personalizar proposta**, com os checkboxes na ordem do registro e os campos de título/texto por seção ativa.
- `propostas.nova.tsx`: ao criar, grava o conjunto de seções recomendado para as categorias escolhidas.
