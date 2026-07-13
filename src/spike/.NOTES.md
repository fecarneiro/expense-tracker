**Gasto compartilhado**
    *Idempotencia*
    *Transaction (TX database) para consistencia*
    *RESTRICT postgres (nao on cascade)*

    ```js
    total_amount_cents > 0
    owed_amount_cents > 0
    owed_amount_cents <= total_amount_cents
    paid_by_user_id != owed_by_user_id
    ```

    ```bash
    shared_expenses
    - id
    - partnership_id
    - total_amount_cents
    - owed_amount_cents
    - paid_by_user_id
    - owed_by_user_id
    - partnership_category_id
    - occurred_at
    - description
    - settlement_id nullable # preenchido quando o gasto e pago
    - idempotency_key
    - created_at

    UNIQUE(paid_by_user_id, idempotency_key)
    ```

    ```js
    await database.transaction(async (tx) => {
    // 1. validar partnership
    // 2. validar categoria
    // 3. resolver mappings
    // 4. criar shared expense
    // 5. criar uma ou duas transactions
})
    ```

**Category compartilhada**
    *ja nascem defaults ao criar partnership*

    ```bash
    - id
    - id partnership
    - nome
    - created_at

    UNIQUE(partnership_id, lower(name))
    ```

**Category compartilhada mapping**
    *cada user tem o seu na partnership*
    *default uma categoria padrao e obrigatoria chamada: Shared expenses*
    *essa shared category nasce para os clientes ao criar uma conexao (?)*
    *A mudança deve afetar somente os próximos gastos.*

    ```bash
    - partnership_category_id
    - user_id
    - category_id


    FK composta que ja existe em category para garantir
        (category_id, user_id)
        ->
        (categories.id, categories.user_id)
    ```


**Settlements**
    *aqui eh o livro de registros e pagamentos passados*

    ```bash
    settlements
    - id
    - partnership_id
    - from_user_id
    - to_user_id
    - amount_cents
    - occurred_at
    - idempotency_key
    - created_at
    ```
