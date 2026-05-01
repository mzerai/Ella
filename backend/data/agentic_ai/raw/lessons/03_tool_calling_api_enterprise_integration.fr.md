---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "03_tool_calling_api_enterprise_integration"
lesson_number: 3
lesson_title_fr: "Tool calling, API et intégration SI"
lesson_title_en: "Tool Calling, APIs, and Enterprise Systems Integration"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "fr"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 jours / 24h pour le cours complet"
  self_paced: "14 à 20h pour le cours complet"
checkpoint_mode: "dynamic"
lab_next: "03_specify_agent_tools_lab"
---

# Leçon 3 — Tool calling, API et intégration SI

## Objectif de la leçon

Dans les leçons précédentes, vous avez vu ce qu’est un agent et comment le placer dans un workflow.

Maintenant, vous allez travailler sur ce qui rend un agent réellement utile en entreprise : sa capacité à utiliser des outils.

Un agent sans outil répond.  
Un agent avec des outils peut chercher, vérifier, créer, notifier, classer, mettre à jour ou préparer une action.

Mais cette capacité crée aussi le risque principal des agents : un outil mal défini peut donner à l’agent trop de pouvoir, trop de données ou trop de marge d’erreur.

Votre objectif dans cette leçon :

> Savoir spécifier les outils qu’un agent peut utiliser dans un système d’information d’entreprise, avec permissions, limites, erreurs, logs et validation humaine.

---

## 1. Pourquoi les outils changent tout

Un LLM seul produit du texte.  
Un agent outillé peut interagir avec l’environnement de l’entreprise.

Exemples :

- lire un ticket ;
- chercher une procédure ;
- consulter une fiche CRM ;
- vérifier le statut d’une facture ;
- générer un brouillon d’email ;
- créer une tâche ;
- notifier un responsable ;
- ouvrir une demande IT ;
- calculer un indicateur ;
- interroger une base documentaire ;
- mettre à jour un statut si cela est autorisé.

OpenAI décrit le tool calling comme un moyen de connecter les modèles à des systèmes externes et à des données ou actions fournies par l’application. Cela rend le modèle plus utile, mais cela transfère une partie du risque vers la conception des outils.

Anthropic résume bien l’enjeu : les agents ne sont efficaces que si leurs outils sont bien conçus.

---

## 2. Un outil est un contrat, pas une simple fonction

En développement classique, une API est souvent pensée pour un autre logiciel.

Dans un système agentique, l’outil est appelé par un agent probabiliste qui peut mal comprendre, choisir le mauvais moment ou fournir une entrée incomplète.

Vous devez donc définir chaque outil comme un contrat clair.

Un bon outil précise :

- son objectif ;
- les entrées acceptées ;
- les sorties retournées ;
- les permissions requises ;
- les erreurs possibles ;
- les actions interdites ;
- les logs à produire ;
- le niveau de validation humaine ;
- les limites de données ;
- les conditions d’arrêt.

### Mauvaise spécification

```text
Outil : accéder au CRM.
```

Trop vague. Trop dangereux.

### Bonne spécification

```text
Outil : read_customer_case_summary
Rôle : lire un résumé limité d’un dossier client.
Entrée : case_id.
Sortie : statut, catégorie, dernière interaction, responsable.
Limites : ne retourne pas CIN, téléphone, coordonnées personnelles détaillées, données financières ou pièces jointes.
Permission : support_level_1 ou plus.
Validation humaine : non, lecture seule.
Log : case_id, utilisateur, horodatage, raison de l’accès.
```

Cette version est exploitable, limitative et auditable.

---

## 3. Lire, écrire, envoyer : trois niveaux de risque

Tous les outils ne sont pas équivalents.

### Niveau 1 — Lire

L’outil consulte une information.

Exemples :

- chercher une procédure ;
- lire un statut ;
- récupérer un résumé ;
- consulter un historique limité.

Risque principal : accès excessif à l’information.

### Niveau 2 — Écrire

L’outil modifie un système.

Exemples :

- créer un ticket ;
- ajouter une note ;
- changer une catégorie ;
- mettre à jour un statut.

Risque principal : modification incorrecte ou non autorisée.

### Niveau 3 — Envoyer ou déclencher

L’outil produit un effet visible ou difficile à annuler.

Exemples :

- envoyer un email client ;
- notifier un fournisseur ;
- déclencher une commande ;
- modifier un droit d’accès ;
- approuver une dépense.

Risque principal : impact externe, financier, juridique, réputationnel ou opérationnel.

Règle simple :

> Plus l’outil agit sur le monde réel, plus la validation doit être forte.

Dans un premier pilote, il est souvent préférable de limiter l’agent à la lecture et à la création de brouillons ou notes internes.

---

## 4. Les familles d’outils en entreprise

Un agent d’entreprise peut utiliser plusieurs familles d’outils.

### Outils de connaissance

Ils permettent de trouver une information.

Exemples :

- `search_knowledge_base` ;
- `retrieve_policy` ;
- `search_procedure` ;
- `get_faq_answer`.

### Outils de ticketing

Ils permettent de lire ou préparer le traitement des demandes.

Exemples :

- `read_ticket` ;
- `classify_ticket` ;
- `add_internal_note` ;
- `escalate_ticket`.

### Outils CRM

Ils donnent un contexte client contrôlé.

Exemples :

- `read_customer_summary` ;
- `get_case_status` ;
- `draft_customer_response`.

### Outils ERP ou finance

Ils manipulent des informations sensibles.

Exemples :

- `check_invoice_status` ;
- `get_purchase_order_status` ;
- `draft_payment_followup`.

Ces outils exigent plus de permissions et de validation.

### Outils email ou communication

Ils préparent ou envoient un message.

Exemples :

- `draft_email` ;
- `notify_manager` ;
- `send_approved_email`.

L’envoi direct doit être limité ou validé.

### Outils de workflow

Ils font avancer le processus.

Exemples :

- `create_task` ;
- `request_approval` ;
- `assign_owner` ;
- `create_followup`.

### Outils d’audit

Ils enregistrent ce que l’agent fait.

Exemples :

- `log_tool_call` ;
- `record_decision` ;
- `save_escalation_reason`.

Un agent d’entreprise sans outil d’audit est difficile à gouverner.

---

## 5. Entrées : demander peu, mais demander juste

Un outil doit demander les informations nécessaires, pas plus.

### Mauvais outil

```text
get_customer_data(customer_name, phone, email, cin, address, contract, history)
```

Cet outil demande trop. Il encourage l’exposition de données personnelles.

### Meilleur outil

```text
read_customer_case_summary(case_id)
```

L’outil reçoit un identifiant métier et retourne un résumé limité.

Les entrées doivent être :

- précises ;
- typées ;
- validables ;
- minimales ;
- alignées avec le rôle de l’utilisateur.

Pour un agent, les entrées doivent aussi réduire l’ambiguïté.

Exemple :

```json
{
  "ticket_id": "TCK-2048",
  "reason": "prepare_internal_response",
  "requester_role": "support_agent"
}
```

Le champ `reason` aide à tracer pourquoi l’accès a eu lieu.

---

## 6. Sorties : donner à l’agent ce qu’il peut utiliser

Une sortie d’outil doit être courte, structurée et utile.

### Mauvaise sortie

```text
Voici toutes les données du client.
```

Risque : trop d’informations, données inutiles, fuite possible.

### Bonne sortie

```json
{
  "case_id": "C-1022",
  "status": "open",
  "category": "billing_question",
  "last_interaction_summary": "Client requested clarification on invoice deadline.",
  "missing_information": ["invoice_number"],
  "allowed_next_actions": ["draft_response", "request_missing_information", "escalate"]
}
```

Cette sortie guide l’agent. Elle limite les données. Elle indique les actions possibles.

Un bon outil ne donne pas seulement une donnée. Il aide l’agent à rester dans le workflow.

---

## 7. Schémas et validation

OpenAI indique que les function tools peuvent être définis avec un schéma JSON. Ce schéma aide à contrôler les entrées attendues.

Un schéma doit définir :

- le nom de l’outil ;
- sa description ;
- les paramètres ;
- les types ;
- les champs obligatoires ;
- les valeurs autorisées ;
- les contraintes.

Exemple conceptuel :

```json
{
  "name": "escalate_ticket",
  "description": "Escalade un ticket vers un responsable humain autorisé.",
  "parameters": {
    "type": "object",
    "properties": {
      "ticket_id": {"type": "string"},
      "reason": {
        "type": "string",
        "enum": ["sensitive_data", "missing_policy", "low_confidence", "forbidden_action"]
      },
      "summary": {"type": "string"}
    },
    "required": ["ticket_id", "reason", "summary"]
  }
}
```

Le schéma ne suffit pas à sécuriser l’outil. Il faut aussi vérifier les permissions côté serveur.

Règle importante :

> Ne faites jamais confiance à l’agent pour appliquer seul les permissions. Les permissions doivent être vérifiées par le système.

---

## 8. Permissions et contrôle d’accès

Un agent ne doit pas contourner les droits de l’utilisateur.

Si un collaborateur ne peut pas voir une donnée dans l’application métier, l’agent ne doit pas la lui révéler.

Vous devez donc décider :

- l’agent agit-il avec ses propres droits ?
- agit-il avec les droits de l’utilisateur ?
- agit-il avec un compte de service limité ?
- quelles actions demandent une validation ?
- quelles données sont masquées ?
- quels appels sont refusés ?

### Bonne pratique

Pour un premier pilote, utilisez des permissions minimales :

- lecture limitée ;
- écriture interne contrôlée ;
- pas d’envoi externe sans validation ;
- pas de modification de droits ;
- pas d’accès aux données sensibles hors périmètre.

Cette approche rejoint le principe du moindre privilège.

---

## 9. Secrets, clés API et données sensibles

Un agent ne doit jamais voir les secrets techniques.

Exemples à protéger :

- clés API ;
- tokens ;
- mots de passe ;
- chaînes de connexion ;
- secrets OAuth ;
- clés de service ;
- certificats ;
- variables d’environnement sensibles.

L’agent peut demander l’appel d’un outil, mais l’exécution doit être faite par votre backend ou votre orchestrateur.

### Mauvaise approche

> Donner une clé API à l’agent dans le prompt.

### Bonne approche

> L’agent appelle `check_invoice_status(invoice_id)`. Le serveur exécute l’appel avec les secrets stockés côté infrastructure.

L’agent ne doit pas manipuler les secrets. Il doit manipuler des intentions contrôlées.

---

## 10. Erreurs d’outil : ne laissez pas l’agent improviser

Les outils échouent.

Exemples :

- API indisponible ;
- timeout ;
- permission refusée ;
- donnée introuvable ;
- format invalide ;
- doublon ;
- système en maintenance ;
- limite de taux atteinte ;
- réponse contradictoire.

Vous devez définir ce que l’agent fait dans chaque cas.

### Exemple

Si `search_policy` ne trouve rien :

- ne pas inventer ;
- signaler que la source manque ;
- demander validation humaine ;
- créer une note d’escalade.

Si `create_ticket` échoue :

- ne pas prétendre que le ticket est créé ;
- informer l’utilisateur ;
- enregistrer l’échec ;
- proposer une action manuelle.

Un agent fiable reconnaît les échecs d’outil.

---

## 11. Idempotence : éviter les actions dupliquées

Un agent peut relancer un outil si la réponse tarde ou si le workflow reprend après interruption.

Si l’outil crée une action, cela peut produire des doublons.

Exemples :

- deux tickets créés ;
- deux emails envoyés ;
- deux notifications ;
- deux commandes ;
- deux notes internes.

Pour éviter cela, prévoyez :

- identifiant unique de requête ;
- clé d’idempotence ;
- vérification avant création ;
- réponse claire si l’objet existe déjà ;
- logs exploitables.

Exemple :

```json
{
  "idempotency_key": "ticket-TCK-2048-draft-response-v1"
}
```

Règle pratique :

> Tout outil qui écrit doit être conçu contre les doublons.

---

## 12. Outils et RAG : ne pas confondre

Le RAG est une forme d’outil de connaissance. Mais tous les outils ne sont pas du RAG.

### RAG

Chercher dans des documents pour répondre avec sources.

Exemple :

- procédure RH ;
- politique de remboursement ;
- règlement interne ;
- catalogue produit.

### Outil métier

Interagir avec un système.

Exemple :

- lire un ticket ;
- vérifier un statut facture ;
- créer une tâche ;
- envoyer une notification.

Un agent d’entreprise combine souvent les deux :

1. RAG pour trouver la règle ;
2. outil métier pour lire le cas ;
3. LLM pour préparer une réponse ;
4. outil de workflow pour créer une note ;
5. validation humaine avant action sensible.

---

## 13. Cas tunisien : agent d’admission connecté au SI

Imaginez une école tunisienne qui veut un agent d’admission.

L’agent doit aider les candidats ou les équipes internes à suivre un dossier.

### Outils possibles

| Outil | Type | Risque | Validation |
|---|---|---|---|
| `search_admission_rules` | Lecture documentaire | Faible | Non |
| `check_application_status` | Lecture SI | Moyen | Selon profil |
| `list_missing_documents` | Lecture contrôlée | Moyen | Non si données limitées |
| `draft_candidate_email` | Brouillon | Moyen | Oui avant envoi |
| `escalate_special_case` | Workflow | Moyen | Oui |
| `update_application_status` | Écriture SI | Élevé | Oui, rôle autorisé |

### Actions interdites pour un premier pilote

- accepter un candidat automatiquement ;
- refuser une candidature automatiquement ;
- accorder une dérogation ;
- modifier un statut financier ;
- exposer des données personnelles à un tiers ;
- envoyer un email officiel sans validation.

Ce cas montre que l’agent peut être utile sans prendre la décision institutionnelle.

---

## 14. Comment nommer les outils

Le nom d’un outil doit être explicite.

### Mauvais noms

- `do_action`
- `access_system`
- `handle_case`
- `process_data`

Ces noms sont trop vagues.

### Bons noms

- `search_hr_policy`
- `read_ticket_summary`
- `draft_customer_reply`
- `create_internal_note`
- `request_manager_approval`
- `escalate_sensitive_case`

Le nom aide l’agent à choisir correctement.

La description doit être encore plus claire :

> “Utiliser cet outil uniquement pour créer une note interne dans un ticket existant. Ne pas l’utiliser pour envoyer une réponse au demandeur.”

---

## 15. Moins d’outils, mieux conçus

Ajouter trop d’outils complique le choix de l’agent.

Un agent avec 40 outils mal nommés peut devenir moins fiable qu’un agent avec 6 outils bien conçus.

Anthropic recommande de concevoir les outils avec attention, de les évaluer et de les améliorer. Une bonne règle de départ :

> Donnez à l’agent le plus petit ensemble d’outils qui permet de réaliser la mission.

Vous pourrez élargir ensuite.

---

## 16. Spécification minimale d’un outil

Pour chaque outil, documentez au moins ceci :

```markdown
## Nom de l’outil

### Objectif
...

### Quand l’utiliser
...

### Quand ne pas l’utiliser
...

### Entrées
...

### Sorties
...

### Permissions
...

### Risques
...

### Garde-fous
...

### Erreurs possibles
...

### Logs
...

### Validation humaine
...
```

Cette fiche sert à la fois à l’équipe métier, à l’équipe technique et à l’assistant de codage qui intégrera l’agent.

---

## À retenir

Un outil donne du pouvoir à l’agent.

Ce pouvoir doit être limité, documenté, validé et tracé.

Retenez cette chaîne :

> intention agent → outil autorisé → permission vérifiée → action exécutée → résultat structuré → log → validation si nécessaire.

Un bon outil n’est pas celui qui fait beaucoup. C’est celui qui fait une action claire, dans un cadre précis, avec des entrées contrôlées et des sorties exploitables.

---

## Contexte checkpoint Ella

### Intention pédagogique

Ella doit vérifier que l’apprenant comprend comment spécifier les outils d’un agent d’entreprise et comment limiter leurs risques.

Le checkpoint doit demander à l’apprenant de concevoir ou critiquer des outils, pas seulement de définir le tool calling.

### Situation suggérée pour générer le checkpoint

Ella peut proposer ce scénario :

> Un agent support doit lire un ticket, chercher une procédure, préparer une réponse, créer une note interne et escalader les cas sensibles. La direction propose un outil unique appelé `access_all_systems`.

Ella demande à l’apprenant de :

- expliquer pourquoi cet outil est dangereux ;
- le remplacer par plusieurs outils limités ;
- distinguer outils de lecture et d’écriture ;
- préciser les permissions ;
- définir les erreurs à gérer ;
- dire quelles actions nécessitent validation humaine ;
- proposer les logs à conserver.

### Ce qu’une bonne réponse doit contenir

Une bonne réponse doit mentionner :

1. un outil vague est dangereux ;
2. les outils doivent être spécialisés ;
3. les permissions doivent être vérifiées côté système ;
4. les outils d’écriture exigent plus de contrôle ;
5. les erreurs doivent être prévues ;
6. les actions sensibles demandent validation humaine ;
7. les appels d’outils doivent être journalisés.

### Erreurs fréquentes à détecter

- Donner un outil trop large à l’agent.
- Oublier les permissions.
- Laisser l’agent voir les clés API.
- Autoriser l’envoi sans validation.
- Ne pas gérer l’échec d’une API.
- Oublier l’idempotence.
- Retourner trop de données personnelles.
- Confondre RAG et outil métier.

### Relances socratiques possibles

- “Que peut faire cet outil exactement ?”
- “Cet outil lit-il, écrit-il ou déclenche-t-il une action externe ?”
- “Quelle donnée n’est pas nécessaire dans la sortie ?”
- “Qui vérifie la permission ?”
- “Que fait l’agent si l’outil échoue ?”
- “Quelle action doit attendre une validation humaine ?”
- “Que devez-vous journaliser ?”

### Critères de validation

Ella peut valider si l’apprenant :

- découpe les outils trop larges ;
- définit entrées et sorties ;
- distingue lecture, écriture et envoi ;
- limite les permissions ;
- prévoit les erreurs ;
- ajoute validation humaine ;
- prévoit logs et audit.

---

## Passage vers le Lab 3

Vous êtes prêt pour le Lab 3.

Votre mission sera de spécifier cinq outils pour un agent d’entreprise, avec objectifs, entrées, sorties, permissions, erreurs, logs et validation humaine.

---

## Références

1. OpenAI. **Function calling**.  
   https://developers.openai.com/api/docs/guides/function-calling

2. OpenAI. **Using tools**.  
   https://developers.openai.com/api/docs/guides/tools

3. OpenAI Agents SDK. **Tools**.  
   https://openai.github.io/openai-agents-python/tools/

4. Anthropic. **Writing effective tools for AI agents**. 2025.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

5. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

7. République Tunisienne. **Loi organique n°2004-63 du 27 juillet 2004, portant sur la protection des données à caractère personnel**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
