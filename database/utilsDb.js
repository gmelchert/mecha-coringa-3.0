import { exec } from '../database/connection.js'

class UtilsDB {
    async whereQueryBuilder({ req, table = '', specificfiltersObjects }, columns) {
        const 
            params = req ? req.query : null,
            entries = params ? new Map(Object.entries(params)) : new Map(),
            search = entries.has('search') ? entries.get('search') : null,
            date = entries.has('date') ? entries.get('date') : null,
            specificFilters = ['search', 'page', 'page_limit', 'orderby', 'date']
        
        const conditions = []
        if (search) {
            const 
                token = req.headers.token,
                searchColumns = columns || await this.tableColumns(table, token),
                searchQuery = searchColumns.map(e => `UPPER(${table}.${e}) LIKE UPPER("%${search}%")`).join(' OR ')

            conditions.push(`(${searchQuery})`)
        }

        if (date) {
            const 
                dateSplitted = date.split('|'),
                dateFrom = dateSplitted[0]

            conditions.push(`dt_cadastro >= "${dateFrom}"`)

            if (dateSplitted.length === 2 && dateSplitted[1]) {
                const dateTo = dateSplitted[1]
                conditions.push(`dt_cadastro <= "${dateTo} 23:59:59"`)
            }
        }

        if (specificfiltersObjects) {
            const filters = specificfiltersObjects
            const specificTable = filters.table || table

            const 
                keys = Object.keys(filters),
                values = Object.values(filters)
            
            specificFilters.push(...keys)
            conditions.push(`(${keys.map((key, i) => {
                if (key === 'table') return ''
                    const 
                        value = values[i],
                        valueType = typeof value

                    return valueType === 'string' ||  valueType === 'number'
                        ? `${specificTable}.${key} = "${value}"`
                        : `(${value.map(e => `${specificTable}.${key} = "${e}"`).join(' OR ')})`
                
            }).filter(e => e != '').join(' AND ')})`)
        }
        
        specificFilters.forEach(e => entries.delete(e))
        if (entries.size || conditions.length) {
            entries.forEach((values, keys) => {
                const query = keys.includes('id') ? `UPPER(${table}.${keys}) = UPPER("${values}")`  : `UPPER(${table}.${keys}) LIKE UPPER("%${values}%")`
                conditions.push(query)
            })
            return `WHERE ${conditions.join(" AND ")}`
        } 
        return ''
    }
    
    apiPagination({ req, limit }) {
        const page = req.query.page || 1
        const offset = (page - 1) * parseInt(limit)
        return ` LIMIT ${limit} OFFSET ${offset}`
    }
    
    async apiTotals(sql, token) {
        return exec({ sql, token })
            .then(result => result.length)
            .catch(err => 'Erro')
    }
    
    apiTotalPages(total, limit) {
        return Math.ceil(total / limit)
    }

    async tableColumns(table, token) {
        if (typeof table === 'string') {
            const sql = `SELECT * FROM ${table} LIMIT 1`
            return exec({ sql, token })
                .then(result => Object.keys(result[0]))
                .catch(err => err)
        } else {
            const columns = []
            await table.forEach(e => {
                const sql = `SELECT * FROM ${e} LIMIT 1`
                exec({ sql, token })
                    .then(result => columns.push(Object.keys(result[0])))
                    .catch(err => err)
            })
            return columns
        }
    }

    async get({ token, table, filter, pagination, join, columns, include, groupBy, orderBy = '' }) {
        return new Promise(async (resolve, reject) => {
            const result = {
                rows: [],
                message: undefined,
                total_results: undefined, 
                total_pages: undefined
            }

            // get orderby
            const orderByViaReq = orderBy && typeof orderBy !== 'string' ? orderBy.query.orderby : orderBy
            let filterSql = ''

            if (filter) {
                filterSql = typeof filter === 'string' ? filter : await this.whereQueryBuilder(filter, columns)
            }

            const 
                joinSql = join ? join.join(' ') : '',
                columnsSql = columns ? columns.join(', ') : '*',
                groupBySql = groupBy ? `GROUP BY ${table}.${groupBy}` : '' ,
                orderBySql = orderByViaReq ? `ORDER BY ${table}.${this.orderBy(orderByViaReq)}` : ''
            
            const sql = `SELECT ${columnsSql} FROM ${table} ${joinSql} ${filterSql} ${groupBySql} ${orderBySql}`
            let paginationSql = ''
            if (pagination) {
                const {
                    limit
                } = pagination

                paginationSql = this.apiPagination(pagination)
                result.total_results = await this.apiTotals(sql, token)
                result.total_pages = this.apiTotalPages(result.total_results, limit)
            }

            return exec({ sql: sql+paginationSql, token }).then(async rows => {
                if (include) await Promise.all(include.map(async e => {
                    const { col, table, join } = e

                    await this._joinSpecific({
                        token,
                        col,
                        rows,
                        table,
                        join
                    })  
                }))

                result.rows = rows
                result.message = `${rows.length} resultado(s) encontrado(s)`
                resolve(result)
            }).catch(reject)
        })
    }

    async post({ token, table, values, md5Values = [] }) {
        return new Promise(async (resolve, reject) => {
            const 
                columns = Object.keys(values).join(', '),
                valuesArray = Object.values(values),
                questionMarks = Object.keys(values).map(e => md5Values.includes(e) ? 'md5(?)' : '?').join(', ')
            
            const sql = `INSERT INTO ${table}(${columns}) VALUES (${questionMarks})`
            
            return exec({ sql, token, values: valuesArray }).then(result => resolve(
                {
                    rows: [values],
                    message: `Gravado com sucesso!`,
                    insertId: result.insertId,
                    dt_cadastro: sqlDate()
                }
            )).catch(reject)
        })  
    }

    async put({ token, table, values, conditions, sum = [] }) {
        return new Promise(async (resolve, reject) => {
            const 
                columns = Object.keys(values),
                valuesArray = Object.values(values),
                questionMarks = columns.map(e => sum.includes(e) ? `${e} + ?` : '?'),
                set = columns.map((e, i) => `${e}=${questionMarks[i]}`).join(', '),
                where = conditions ? this._whereConditions(conditions) : ''
                
            const sql = `UPDATE ${table} SET ${set} WHERE ${where}`
            
            return exec({ sql, token, values: valuesArray }).then(result => {
                const message = !result.affectedRows ? 'Alerta, nenhum item foi afetado.' : 'Atualizado com sucesso!'
                
                resolve ({
                    rows: [values],
                    message
                })
            }).catch(reject)
        })  
    }

    async delete({ token, table, conditions }) {
        return new Promise(async (resolve, reject) => {
            if (!conditions) return reject('Nenhuma condição foi informada!')
        
            const 
                cols = Object.keys(conditions),
                values = Object.values(conditions)

            if (!cols.length || !values.length) return reject('Nenhuma condição foi informada!')

            const where = this._whereConditions(conditions)

            const sql = `DELETE from ${table} WHERE ${where}`
            return exec({ sql, token, values }).then(result => {
                const message = !result.affectedRows ? 'Alerta, nenhum item foi afetado.' : 'Deletado com sucesso!'
                resolve({
                    message
                })
            }).catch(reject)
        }) 
    }

    _whereConditions(conditions, operator = 'and') {
        const 
            cols = Object.keys(conditions),
            values = Object.values(conditions)
            
        const where = cols.map((e, i) => `UPPER(${e}) = UPPER("${values[i]}")`).join(` ${operator.toUpperCase()} `)
        return where
    }

    async _joinSpecific({ 
        token, 
        col,
        rows,
        table,
        join
    }) {
        const items = []
        rows.forEach(e => {
            if (!items.includes(e[col])) items.push(e[col])
        })

        const where = items.map(e => `${table}.${col} LIKE "%${e}%"`).join(' OR ')

        const sql = `select * from ${table} ${join || ''} WHERE ${where}`
        return exec({sql, token})
            .then(result => {
                rows.map(e => {
                    e[table] = result.filter(el => e[col] === el[col])
                })
                return rows
            })
            .catch(err => rows[table] = err)
    }

    orderBy(orderby) {
        const orderbySplit = orderby.split('|')

        if (orderbySplit.length === 1) return orderby

        const
            orderByColumn = orderbySplit[0],
            orderByDirection = orderbySplit[1]

        return `${orderByColumn} ${orderByDirection}`
    }

    recursiveTree({ token, table, where, join }) {
        return new Promise((resolve, reject) => {
            const {
                fieldFrom,
                fieldTo
            } = join
    
            const 
                whereKeys = Object.keys(where),
                whereValues = Object.values(where)
    
            const whereSql = whereKeys.map((key, i) => {
                const value = whereValues[i]
                const typeValue = typeof value
                return typeValue === 'string' || typeValue === 'number'
                    ? `(${key} = ${value})`
                    : `(${value.map(e => `${key} = "${e}"`).join(' OR ')})`
            }).join('AND')
    
            const sql = 
                `WITH RECURSIVE tree AS (
                    SELECT ${fieldTo} FROM ${table} WHERE ${whereSql}
                    UNION ALL SELECT ${table}.${fieldTo} FROM ${table}
                    INNER JOIN tree ON ${table}.${fieldFrom} = tree.${fieldTo}
                )
                SELECT * FROM tree;`
    
            exec({ sql, token }).then(async rows => {
                resolve(rows)
            }).catch(err => reject(err))
        })
    }
}

export const utilsDb = new UtilsDB()