const { sql, getConnection } = require('../config/db');

class Relatorio {
  static async getResumoAtividadesPorGrupo() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT
          CONCAT(c.codccusto, ' - ', c.nome) AS codccusto_nome,
          a.idgrupobitrix,
          COUNT(b.id) AS total_registros
        FROM gccusto c
        INNER JOIN bgcatividade a
          ON a.codccusto = c.codccusto
        LEFT JOIN batividadeg b
          ON b.idgrupobitrix = a.idgrupobitrix
        WHERE c.ativo = 1
        GROUP BY
          c.codccusto,
          c.nome,
          a.idgrupobitrix
        ORDER BY c.codccusto, a.idgrupobitrix
      `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getResumoAtividadesPorGrupoPorCentro(codccusto) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('codccusto', sql.VarChar(20), codccusto)
        .query(`
          SELECT
            CONCAT(c.codccusto, ' - ', c.nome) AS codccusto_nome,
            a.idgrupobitrix,
            COUNT(b.id) AS total_registros
          FROM gccusto c
          INNER JOIN bgcatividade a
            ON a.codccusto = c.codccusto
          LEFT JOIN batividadeg b
            ON b.idgrupobitrix = a.idgrupobitrix
          WHERE c.ativo = 1 AND c.codccusto = @codccusto
          GROUP BY
            c.codccusto,
            c.nome,
            a.idgrupobitrix
          ORDER BY a.idgrupobitrix
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getResumoAtividadesPivot() {
    try {
      const pool = await getConnection();
      
      // Usar request customizado para executar SQL dinâmico com sp_executesql
      const result = await pool.request().query(`
        DECLARE @dataInicio DATE;
        DECLARE @dataFim DATE;
        DECLARE @cols NVARCHAR(MAX);
        DECLARE @sql NVARCHAR(MAX);

        -- 1️⃣ Período dinâmico Maio → Abril
        IF MONTH(GETDATE()) < 5
            SET @dataInicio = DATEFROMPARTS(YEAR(GETDATE()) - 1, 5, 1);
        ELSE
            SET @dataInicio = DATEFROMPARTS(YEAR(GETDATE()), 5, 1);

        SET @dataFim = DATEADD(MONTH, 12, @dataInicio);

        -- 2️⃣ Colunas dinâmicas yyyy-MM
        SELECT @cols = STUFF((
            SELECT
                ',' + QUOTENAME(
                    CONVERT(VARCHAR(7), DATEADD(MONTH, v.number, @dataInicio), 120)
                )
            FROM master..spt_values v
            WHERE v.type = 'P'
              AND v.number BETWEEN 0 AND 11
            ORDER BY v.number
            FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

        -- 3️⃣ SQL dinâmico FINAL
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
        ORDER BY pvt.codccusto_nome;
        ';

        EXEC sp_executesql
            @sql,
            N'@dataInicio DATE, @dataFim DATE',
            @dataInicio,
            @dataFim;
      `);
      
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Relatorio;
