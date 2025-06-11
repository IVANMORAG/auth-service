const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        message: errorMessage,
        details: error.details
      });
    }
    
    next();
  };
};

module.exports = { validate };