# LLM e Parakletos

## Papel da LLM

A LLM adapta linguagem, apresenta contexto já aprovado e cria uma pergunta curta de reflexão. Ela não decide fatos bíblicos, score, progressão, recompensas ou recomendações. O catálogo e as três ramificações são determinísticos e revisáveis pelo PO.

O endpoint server-side é `POST /api/parakletos`. Quando `OPENAI_API_KEY` e `OPENAI_MODEL` não estão configurados, quando ocorre timeout ou quando a resposta viola o contrato, o serviço retorna conteúdo local curado com `source: "fallback"`.

A integração usa a Responses API com Structured Outputs, `store: false`, limite de tokens e timeout. A chave nunca é exposta ao navegador.

## Enquadramento teológico

Parakletos é uma pomba-personagem e símbolo visual do produto. Seu papel é `educational-guide`: contextualizar, convidar à observação e indicar referências. Ele não é Deus, não é o Espírito Santo, não fala em nome deles e não oferece profecia, revelação ou direção divina pessoal.

Toda resposta inclui `identityNotice`. O prompt proíbe alegações divinas, e o servidor rejeita referências fora da etapa ou frases que atribuam ao personagem voz/revelação divina. A interface deve apresentar a explicação completa no primeiro contato e mantê-la acessível no perfil/ajuda.

## Perfil inicial e privacidade

As cinco respostas são:

1. faixa etária (`6-9`, `10-13`, `14-17`, `18+`);
2. contexto de lar cristão;
3. identificação cristã, incluindo “explorando” e “prefiro não dizer”;
4. afinidade com leitura (`sim`, `às vezes`, `não`);
5. preferência narrativa (`romance`, `heróis`, `aventura`).

`completeOnboarding()` transforma as respostas em `PersonalizationProfile`. As respostas brutas sobre idade e fé são descartadas: não entram no Zustand/localStorage e não são enviadas à OpenAI. A API recebe apenas tom de público, familiaridade bíblica, modo de experiência e preferência narrativa.

## Ramificação

- gosta de ler → `textual`;
- às vezes → `balanced`;
- não gosta → `gamified`.

Cada uma das cinco etapas de Davi possui as três variantes com o mesmo objetivo pedagógico. A preferência por romance, heróis ou aventura seleciona três histórias de um catálogo curado; a LLM não inventa recomendações.

## Contrato do endpoint

Exemplo de entrada:

```json
{
  "stageId": "trial",
  "profile": {
    "audienceTone": "teen",
    "biblicalLiteracy": "developing",
    "experienceMode": "balanced",
    "narrativePreference": "heroes"
  },
  "question": "Por que Davi recusou a armadura?"
}
```

Exemplo de saída:

```json
{
  "character": "parakletos",
  "role": "educational-guide",
  "message": "...",
  "biblicalReference": "1 Samuel 17:1-51",
  "reflectionQuestion": "...",
  "identityNotice": "...",
  "source": "llm"
}
```

Antes de produção, o PO deve revisar resumos, referências e fallbacks; privacidade/consentimento para menores também precisa de validação jurídica específica.
