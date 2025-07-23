let dbConfig = {
    user: "Reporting_RO",
    database: 'MDM360',
    server: 'C-VS003-SQL',
    password: 'MdM2oiB!',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        cryptoCredentialsDetails: { minVersion: 'TLSv1.2' },
        enableArithAbort: true,
        connectionTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

module.exports = dbConfig