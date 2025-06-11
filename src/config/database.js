const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('Error de MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Conexión de MongoDB cerrada por terminación de la aplicación');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

module.exports = { connectDB };