const { sql, getConnection } = require('../config/db');

class Batividadeg {
    static async getAtividadesAcumuladasPorGrupoMes(idgrupobitrix, mesRef) {
      // mesRef formato 'YYYY-MM'
      try {
        const pool = await getConnection();
        // Calcular último dia do mês informado
        const [ano, mes] = mesRef.split('-');
        const ultimoDiaMes = new Date(ano, mes, 0).toISOString().slice(0, 10); // yyyy-mm-dd
        const result = await pool.request()
          .input('idgrupobitrix', sql.Int, idgrupobitrix)
          .input('ultimoDiaMes', sql.Date, ultimoDiaMes)
          .query(`
            SELECT idtask, comentario, prioridade, dataprazofinal, dataconclusao
            FROM batividadeg
            WHERE idgrupobitrix = @idgrupobitrix
              AND (dataconclusao IS NULL OR dataconclusao = '')
              AND dataprazofinal <= @ultimoDiaMes
          `);
        return result.recordset;
      } catch (error) {
        throw error;
      }
    }
    static async getSaldoAcumuladoPorGrupo(idgrupobitrix) {
      try {
        const pool = await getConnection();
        const result = await pool.request()
          .input('idgrupobitrix', sql.Int, idgrupobitrix)
          .query(`
            SELECT COUNT(*) AS saldo_acumulado
            FROM batividadeg
            WHERE idgrupobitrix = @idgrupobitrix AND (dataconclusao IS NULL OR dataconclusao = '')
          `);
        return result.recordset[0];
      } catch (error) {
        throw error;
      }
    }
    static async getNaoConcluidasPorGrupo(idgrupobitrix) {
      try {
        const pool = await getConnection();
        const result = await pool.request()
          .input('idgrupobitrix', sql.Int, idgrupobitrix)
          .query(`
            SELECT idtask, comentario, prioridade, dataprazofinal, dataconclusao
            FROM batividadeg
            WHERE idgrupobitrix = @idgrupobitrix AND (dataconclusao IS NULL OR dataconclusao = '')
          `);
        return result.recordset;
      } catch (error) {
        throw error;
      }
    }
    static async getDataPrazoFinalRelatorio(anoBase) {
      // Relatório de prazo final por mês (pivot dinâmico), período maio a abril, colunas yyyy-MM
      try {
        const pool = await getConnection();
        const query = `
DECLARE @dataInicio DATE = DATEFROMPARTS(@anoBase, 5, 1);
DECLARE @dataFim DATE = DATEFROMPARTS(@anoBase + 1, 5, 1);
DECLARE @cols NVARCHAR(MAX);
DECLARE @sql NVARCHAR(MAX);

SELECT @cols = STUFF((
    SELECT ',' + QUOTENAME(CONVERT(VARCHAR(7), DATEADD(MONTH, v.number, @dataInicio), 120))
    FROM master..spt_values v
    WHERE v.type = 'P'
      AND v.number BETWEEN 0 AND 11
    ORDER BY v.number
    FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

SET @sql = '
SELECT
    pvt.codccusto_nome,
    pvt.idgrupobitrix,
    pvt.total_registros,
    ' + @cols + '
FROM (
    SELECT
        c.codccusto + '' - '' + c.nome AS codccusto_nome,
        a.idgrupobitrix,
        COUNT(b.id) OVER (PARTITION BY a.idgrupobitrix) AS total_registros,
        CONVERT(VARCHAR(7), b.dataprazofinal, 120) AS mes_ref,
        b.id
    FROM gccusto c
    INNER JOIN bgcatividade a
        ON a.codccusto = c.codccusto
    LEFT JOIN batividadeg b
        ON b.idgrupobitrix = a.idgrupobitrix
       AND b.dataprazofinal >= @dataInicio
       AND b.dataprazofinal <  @dataFim
    WHERE c.ativo = 1
) src
PIVOT (
    COUNT(id) FOR mes_ref IN (' + @cols + ')
) pvt
ORDER BY pvt.codccusto_nome;';

EXEC sp_executesql
    @sql,
    N'@dataInicio DATE, @dataFim DATE',
    @dataInicio,
    @dataFim;
`;
        const result = await pool.request()
          .input('anoBase', sql.Int, anoBase)
          .query(query);
        return result.recordset;
      } catch (error) {
        throw error;
      }
    }
        static async getSaldoAcumuladoRelatorio(anoBase) {
          // Relatório de saldo acumulado pendente por mês, conforme SQL fornecido
          try {
            const pool = await getConnection();
            const query = `
    DECLARE @dataInicio DATE = DATEFROMPARTS(@anoBase, 5, 1);
    DECLARE @cols NVARCHAR(MAX);
    DECLARE @sql NVARCHAR(MAX);

    SELECT @cols = STUFF((
        SELECT ',' + QUOTENAME(CONVERT(VARCHAR(7), DATEADD(MONTH, v.number, @dataInicio), 120))
        FROM master..spt_values v
        WHERE v.type = 'P'
          AND v.number BETWEEN 0 AND 11
        ORDER BY v.number
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

    SET @sql = '
    WITH meses AS (
        SELECT
            CONVERT(VARCHAR(7), DATEADD(MONTH, v.number, @dataInicio), 120) AS mes_ref,
            EOMONTH(DATEADD(MONTH, v.number, @dataInicio)) AS fim_mes
        FROM master..spt_values v
        WHERE v.type = ''P''
          AND v.number BETWEEN 0 AND 11
    ),
    base AS (
        SELECT
            c.codccusto + '' - '' + c.nome AS codccusto_nome,
            a.idgrupobitrix,
            m.mes_ref,
            COUNT(b.id) AS qtd_pendente
        FROM meses m
        INNER JOIN gccusto c ON c.ativo = 1
        INNER JOIN bgcatividade a ON a.codccusto = c.codccusto
        LEFT JOIN batividadeg b
            ON b.idgrupobitrix = a.idgrupobitrix
           AND b.dataprazofinal >= @dataInicio
           AND b.dataprazofinal <= m.fim_mes
           AND (
                b.dataconclusao IS NULL
                OR b.dataconclusao > m.fim_mes
           )
        GROUP BY c.codccusto, c.nome, a.idgrupobitrix, m.mes_ref
    )
    SELECT
        codccusto_nome,
        idgrupobitrix,
        ' + @cols + '
    FROM base
    PIVOT (
        SUM(qtd_pendente)
        FOR mes_ref IN (' + @cols + ')
    ) pvt
    ORDER BY codccusto_nome;';

    EXEC sp_executesql
        @sql,
        N'@dataInicio DATE',
        @dataInicio;
    `;
            const result = await pool.request()
              .input('anoBase', sql.Int, anoBase)
              .query(query);
            return result.recordset;
          } catch (error) {
            throw error;
          }
        }
    static async getDataConclussaoRelatorioV2(anoBase) {
      // Relatório de conclusão por mês (pivot dinâmico), período maio a abril, colunas yyyy-MM
      try {
        const pool = await getConnection();
        const query = `
DECLARE @AnoBase INT = @anoBase;
DECLARE @dataInicio DATE = DATEFROMPARTS(@AnoBase, 5, 1);
DECLARE @dataFim DATE = DATEFROMPARTS(@AnoBase + 1, 5, 1);
DECLARE @cols NVARCHAR(MAX);
DECLARE @sql NVARCHAR(MAX);

SELECT @cols = STUFF((
    SELECT ',' + QUOTENAME(CONVERT(VARCHAR(7), DATEADD(MONTH, v.number, @dataInicio), 120))
    FROM master..spt_values v
    WHERE v.type = 'P'
      AND v.number BETWEEN 0 AND 11
    ORDER BY v.number
    FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

SET @sql = '
SELECT
    pvt.codccusto_nome,
    pvt.idgrupobitrix,
    pvt.total_registros,
    ' + @cols + '
FROM (
    SELECT
        c.codccusto + '' - '' + c.nome AS codccusto_nome,
        a.idgrupobitrix,
        COUNT(b.id) OVER (PARTITION BY a.idgrupobitrix) AS total_registros,
        CONVERT(VARCHAR(7), b.dataconclusao, 120) AS mes_ref,
        b.id
    FROM gccusto c
    INNER JOIN bgcatividade a
        ON a.codccusto = c.codccusto
    LEFT JOIN batividadeg b
        ON b.idgrupobitrix = a.idgrupobitrix
       AND b.dataconclusao >= @dataInicio
       AND b.dataconclusao <  @dataFim
    WHERE c.ativo = 1
      AND b.dataconclusao IS NOT NULL
) src
PIVOT (
    COUNT(id) FOR mes_ref IN (' + @cols + ')
) pvt
ORDER BY pvt.codccusto_nome;';

EXEC sp_executesql
    @sql,
    N'@dataInicio DATE, @dataFim DATE',
    @dataInicio,
    @dataFim;
`;
        const result = await pool.request()
          .input('anoBase', sql.Int, anoBase)
          .query(query);
        return result.recordset;
      } catch (error) {
        throw error;
      }
    }
    static async getPorcentagemRelatorio(anoBase) {
      // Relatório de porcentagem de execução por mês, conforme SQL fornecido
      try {
        const pool = await getConnection();
        const query = `
          DECLARE @dataInicio DATE = DATEFROMPARTS(@anoBase, 5, 1);
          DECLARE @cols NVARCHAR(MAX);
          DECLARE @cols_isnull NVARCHAR(MAX);
          DECLARE @sql NVARCHAR(MAX);

          SELECT 
            @cols = STUFF((
              SELECT
                ',' + QUOTENAME(CONVERT(VARCHAR(7),
                  DATEADD(MONTH, v.number, @dataInicio), 120))
              FROM master..spt_values v
              WHERE v.type = 'P'
              AND v.number BETWEEN 0 AND 11
              ORDER BY v.number
              FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''),

            @cols_isnull = STUFF((
              SELECT
                ', ISNULL(' + QUOTENAME(CONVERT(VARCHAR(7),
                  DATEADD(MONTH, v.number, @dataInicio), 120))
                + ', 0.00) AS ' +
                QUOTENAME(CONVERT(VARCHAR(7),
                  DATEADD(MONTH, v.number, @dataInicio), 120))
              FROM master..spt_values v
              WHERE v.type = 'P'
              AND v.number BETWEEN 0 AND 11
              ORDER BY v.number
              FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

          SET @sql = '
          WITH meses AS (
            SELECT
              CONVERT(VARCHAR(7), DATEADD(MONTH, v.number, @dataInicio), 120) AS mes_ref,
              EOMONTH(DATEADD(MONTH, v.number, @dataInicio)) AS fim_mes,
              DATEADD(MONTH, v.number, @dataInicio) AS ini_mes
            FROM master..spt_values v
            WHERE v.type = ''P''
            AND v.number BETWEEN 0 AND 11
          ),
          base AS (
            SELECT
              c.codccusto + '' - '' + c.nome AS codccusto_nome,
              a.idgrupobitrix,
              m.mes_ref,
              COUNT(CASE
                WHEN b.dataprazofinal >= @dataInicio
                 AND b.dataprazofinal <= m.fim_mes
                 AND (b.dataconclusao IS NULL OR b.dataconclusao > m.fim_mes)
                THEN 1 END) AS pendente_mes,
              COUNT(CASE
                WHEN b.dataconclusao >= m.ini_mes
                 AND b.dataconclusao <= m.fim_mes
                THEN 1 END) AS concluida_mes
            FROM meses m
            INNER JOIN gccusto c ON c.ativo = 1
            INNER JOIN bgcatividade a ON a.codccusto = c.codccusto
            LEFT JOIN batividadeg b
              ON b.idgrupobitrix = a.idgrupobitrix
            GROUP BY
              c.codccusto, c.nome, a.idgrupobitrix, m.mes_ref
          ),
          percentual AS (
            SELECT
              codccusto_nome,
              idgrupobitrix,
              mes_ref,
              CAST(
                (concluida_mes * 100.0) /
                NULLIF(concluida_mes + pendente_mes, 0)
              AS DECIMAL(10,2)) AS perc_execucao
            FROM base
          )
          SELECT
            codccusto_nome,
            idgrupobitrix,
            ' + @cols_isnull + '
          FROM percentual
          PIVOT (
            MAX(perc_execucao)
            FOR mes_ref IN (' + @cols + ')
          ) pvt
          ORDER BY codccusto_nome;
          ';

          EXEC sp_executesql
            @sql,
            N'@anoBase INT, @dataInicio DATE',
            @anoBase = @anoBase, @dataInicio = @dataInicio;
        `;
        const result = await pool.request()
          .input('anoBase', sql.Int, anoBase)
          .query(query);
        return result.recordset;
      } catch (error) {
        throw error;
      }
    }

  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM batividadeg');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getByDateRange(dataInicio, dataFim) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('dataInicio', sql.DateTime, dataInicio)
        .input('dataFim', sql.DateTime, dataFim)
        .query(`
          SELECT * FROM batividadeg 
          WHERE dataprazofinal >= @dataInicio 
          AND dataprazofinal <= @dataFim
          ORDER BY dataprazofinal ASC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM batividadeg WHERE id = @id');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByIdTask(idtask) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idtask', sql.Int, idtask)
        .query('SELECT * FROM batividadeg WHERE idtask = @idtask');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByIdGrupo(idgrupobitrix) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idgrupobitrix', sql.Int, idgrupobitrix)
        .query(`
          SELECT
            idtask,
            comentario,
            prioridade,
            dataprazofinal,
            dataconclusao
          FROM batividadeg
          WHERE idgrupobitrix = @idgrupobitrix
          ORDER BY dataprazofinal ASC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('idtask', sql.Int, data.idtask)
        .input('comentario', sql.VarChar(250), data.comentario)
        .input('prioridade', sql.Bit, data.prioridade)
        .input('dataprazofinal', sql.DateTime, data.dataprazofinal);
      
      // Adicionar dataconclusao se fornecido
      if (data.dataconclusao) {
        request.input('dataconclusao', sql.DateTime, data.dataconclusao);
      }
      
      const query = data.dataconclusao 
        ? 'INSERT INTO batividadeg (idtask, comentario, prioridade, dataprazofinal, dataconclusao) VALUES (@idtask, @comentario, @prioridade, @dataprazofinal, @dataconclusao)'
        : 'INSERT INTO batividadeg (idtask, comentario, prioridade, dataprazofinal) VALUES (@idtask, @comentario, @prioridade, @dataprazofinal)';
      
      const result = await request.query(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('idtask', sql.Int, data.idtask)
        .input('comentario', sql.VarChar(250), data.comentario)
        .input('prioridade', sql.Bit, data.prioridade)
        .input('dataprazofinal', sql.DateTime, data.dataprazofinal)
        .query('UPDATE batividadeg SET idtask = @idtask, comentario = @comentario, prioridade = @prioridade, dataprazofinal = @dataprazofinal, dataalteracao = GETDATE() WHERE id = @id');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateByIdTask(idtask, data) {
    try {
      const pool = await getConnection();
      console.log('Updating idtask:', idtask, 'with data:', data);
      
      const request = pool.request()
        .input('idtask', sql.Int, idtask);
      
      // Atualizar apenas campos enviados
      let query = 'UPDATE batividadeg SET dataalteracao = GETDATE()';
      
      if (data.comentario !== undefined) {
        request.input('comentario', sql.VarChar(250), data.comentario);
        query += ', comentario = @comentario';
      }
      if (data.prioridade !== undefined) {
        request.input('prioridade', sql.Bit, data.prioridade);
        query += ', prioridade = @prioridade';
      }
      if (data.dataprazofinal !== undefined) {
        request.input('dataprazofinal', sql.DateTime, data.dataprazofinal);
        query += ', dataprazofinal = @dataprazofinal';
      }
      if (data.dataconclusao !== undefined) {
        request.input('dataconclusao', sql.DateTime, data.dataconclusao);
        query += ', dataconclusao = @dataconclusao';
      }
      
      query += ' WHERE idtask = @idtask';
      
      console.log('SQL Query:', query);
      const result = await request.query(query);
      console.log('Update result:', result.rowsAffected);
      
      return result;
    } catch (error) {
      console.error('updateByIdTask error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM batividadeg WHERE id = @id');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByIdTask(idtask) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idtask', sql.Int, idtask)
        .query('DELETE FROM batividadeg WHERE idtask = @idtask');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Batividadeg;