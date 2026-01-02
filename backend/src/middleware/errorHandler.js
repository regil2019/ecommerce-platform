export const errorHandler = (err, req, res, next) => {
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.errors.map(e => e.message)
        });  
    }

    console.error(err.stack);
    res.status(500).json({
        err: 'Erro interno',
        ...(process.env.NODE_ENV ==='development' && { details: err.message })
    });
}
