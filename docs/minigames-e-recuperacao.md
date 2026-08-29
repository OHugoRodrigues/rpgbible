# Minigames, tempo, materiais e vidas

## Conteúdo e formato

As cinco etapas de Davi possuem variantes textual, gamificada e balanceada. O catálogo usa mecânicas de palavras, anagramas, evidências, escolhas contextuais e linha do tempo; “Termo” e “Letroca” são referências de ritmo, não telas ou marcas a copiar.

Cada desafio contém:

- contexto narrativo e referências bíblicas aprováveis;
- uma pergunta provocativa;
- três apresentações com o mesmo objetivo pedagógico;
- tempo por tentativa;
- respostas aceitas normalizadas;
- leitura de recuperação e pergunta de checagem.

O campo `reviewStatus` começa como `po-review-required`. Nenhum texto deve ser promovido a conteúdo final sem revisão bíblica e histórica do PO.

## Materiais e performance

A pontuação da conclusão combina:

- 50 pontos por concluir corretamente;
- até 30 pontos pelas vidas restantes;
- até 20 pontos pelo tempo restante.

O resultado vira um material:

| Pontos | Material |
|---:|---|
| 0–24 | Palha |
| 25–44 | Capim |
| 45–59 | Madeira |
| 60–74 | Prata |
| 75–89 | Ouro |
| 90–100 | Pedra preciosa |

Uma resposta rápida na primeira vida pode render pedra preciosa. Ao esgotar as três vidas, a primeira ocorrência daquele desafio concede uma palha; não é possível farmar palha repetindo o bloqueio.

## Recuperação sem bloqueio permanente

Ao perder três vidas, o jogador escolhe:

1. `context-task`: responde uma checagem baseada na passagem, com tentativas ilimitadas; ao acertar, recebe uma vida e um capim. A recompensa final fica limitada a madeira.
2. `guided-reading`: recebe uma recomendação de leitura e aguarda uma hora. Depois, recupera três vidas; a recompensa final fica limitada a ouro.

O cooldown é persistido em ISO e validado pelo domínio. Ao reabrir o app, a interface pode mostrar “Você já pode responder”. `BrowserRecoveryNotifier` agenda esse aviso apenas quando a permissão de notificações já foi concedida e enquanto a página permanece aberta. Ele nunca solicita permissão sozinho.

Sem Service Worker ou backend de push, não existe garantia de notificação com o navegador fechado. Para o hackathon, o retorno pelo estado persistido é a garantia funcional; push real fica fora deste recorte.
