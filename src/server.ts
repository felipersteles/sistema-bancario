import express from "express"; //Biblioteca para realizar a transmissao do server
import cors from "cors"; // Middleware para auxiliar na comunicação entre aplicações
import routes from "./routes/routes";

//Conectando com o banco de dados
import { AppDataSource } from "./database/datasource";

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    // iniciando a aplicação
    const app = express();
    app.use(cors());
    app.use(express.json()); //analisa requests
    app.use(routes);

    const PORT = process.env.PORT || 3333; //se n tiver porta ele hospeda no 3333

    return app.listen(PORT, () =>
      console.log("Server running on port " + PORT)
    );
  })
  
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
