# Modelos reutilizáveis de proposta

## Objetivo
Permitir que o consultor salve a personalização de uma proposta com um nome, como “Catraca Facial”, e aplique esse modelo ao criar propostas futuras.

## O que será implementado
- Criar uma área segura no banco para modelos pertencentes a cada consultor.
- Salvar no modelo as soluções escolhidas, produtos e quantidades, justificativas por solução, formato, seções ativas, textos personalizados e configurações comerciais da proposta.
- Adicionar “Salvar como modelo” na edição da proposta, com campo para nome e atualização quando já existir um modelo com o mesmo nome.
- Adicionar um seletor opcional de modelo no início da criação de proposta.
- Ao aplicar, preencher a nova proposta com a personalização salva sem copiar cliente, status, datas, aprovações ou histórico da proposta original.
- Manter o fluxo atual e as recomendações automáticas quando nenhum modelo for escolhido.

## Regras de segurança e compatibilidade
- Cada consultor vê, cria, altera e exclui somente os próprios modelos.
- Modelos não serão públicos e não alterarão propostas antigas.
- Os dados serão salvos como snapshots para preservar a personalização mesmo se o catálogo mudar depois.
- A implementação será aditiva e manterá o visual e o funcionamento existentes.

## Validação
- Verificar criação e atualização de um modelo pela proposta editada.
- Verificar aplicação do modelo em uma nova proposta.
- Confirmar que cliente e dados de acompanhamento não são reaproveitados.
- Conferir o funcionamento visual em desktop e celular, além da saúde da aplicação.
